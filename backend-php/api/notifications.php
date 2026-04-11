<?php
// ═══════════════════════════════════════════
//  api/notifications.php
//  GET    list
//  PUT    ?id=X&action=read   mark one read
//  PUT    ?action=read-all
//  DELETE ?id=X               dismiss
// ═══════════════════════════════════════════

$db = getDB();
$payload = requireAuth();
$uid = (int)$payload['sub'];

// ── GET list ──────────────────────────────
if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50');
    $stmt->execute([$uid]);
    jsonOk(array_map('formatNotif', $stmt->fetchAll()));
}

// ── PUT mark one read ─────────────────────
if ($method === 'PUT' && $id && $action === 'read') {
    $stmt = $db->prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?');
    $stmt->execute([$id, $uid]);
    if ($stmt->rowCount() === 0) jsonNotFound('Notification not found.');
    jsonOk(['message' => 'Marked as read.']);
}

// ── PUT mark all read ─────────────────────
if ($method === 'PUT' && $action === 'read-all') {
    $db->prepare('UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0')->execute([$uid]);
    jsonOk(['message' => 'All notifications marked as read.']);
}

// ── DELETE dismiss ────────────────────────
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM notifications WHERE id=? AND user_id=?');
    $stmt->execute([$id, $uid]);
    if ($stmt->rowCount() === 0) jsonNotFound('Notification not found.');
    jsonOk(['message' => 'Notification dismissed.']);
}

jsonError("Unknown notifications request: $method $action", 404);

function formatNotif(array $n): array {
    return [
        'id'        => (int)$n['id'],
        'type'      => $n['type'],
        'title'     => $n['title'],
        'body'      => $n['body'],
        'link'      => $n['link'],
        'isRead'    => (bool)$n['is_read'],
        'createdAt' => $n['created_at'],
    ];
}
