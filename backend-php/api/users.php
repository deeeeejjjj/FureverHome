<?php
// ═══════════════════════════════════════════
//  api/users.php — User profile endpoints
//  GET    profile
//  PUT    profile / password / notifications
//  DELETE account
//
//  NORMALIZATION CHANGES:
//  - notif_* columns removed from users; now live in user_notification_prefs (1-to-1).
//  - municipality stored as municipality_id FK; resolved via JOIN to municipalities.
//    Profile updates accept plain name and resolve to ID.
// ═══════════════════════════════════════════

$db = getDB();
$payload = requireAuth();
$uid = (int)$payload['sub'];

// ── GET /users?action=profile ─────────────
if ($method === 'GET' && $action === 'profile') {
    $stmt = $db->prepare("
        SELECT u.*, m.name AS municipality_name,
               np.notif_applications, np.notif_new_pets,
               np.notif_newsletter,   np.notif_donations
        FROM users u
        LEFT JOIN municipalities          m  ON m.id  = u.municipality_id
        LEFT JOIN user_notification_prefs np ON np.user_id = u.id
        WHERE u.id = ?
    ");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) jsonNotFound('User not found.');
    jsonOk(formatUserFull($user));
}

// ── PUT /users?action=profile ─────────────
if ($method === 'PUT' && $action === 'profile') {
    $b = getBody();

    // Resolve municipality name → ID (nullable)
    $munId = null;
    if (!empty($b['municipality'])) {
        $mStmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
        $mStmt->execute([trim($b['municipality'])]);
        $mRow = $mStmt->fetch();
        if (!$mRow) jsonError("Unknown municipality: {$b['municipality']}");
        $munId = (int)$mRow['id'];
    }

    $db->prepare('UPDATE users SET
        first_name=?, last_name=?, phone=?, age=?,
        municipality_id=?, about_me=?, updated_at=NOW()
        WHERE id=?')
       ->execute([
           trim($b['firstName'] ?? ''),
           trim($b['lastName']  ?? ''),
           trim($b['phone']     ?? '') ?: null,
           $b['age'] ?? null,
           $munId,
           trim($b['aboutMe']   ?? '') ?: null,
           $uid,
       ]);

    jsonOk(['message' => 'Profile updated successfully.']);
}

// ── PUT /users?action=password ────────────
if ($method === 'PUT' && $action === 'password') {
    $b    = getBody();
    $curr = $b['currentPassword']  ?? '';
    $new  = $b['newPassword']      ?? '';
    $conf = $b['confirmPassword']  ?? '';

    $stmt = $db->prepare('SELECT password_hash FROM users WHERE id=?');
    $stmt->execute([$uid]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($curr, $row['password_hash'])) {
        jsonError('Current password is incorrect.');
    }
    if ($new !== $conf)      jsonError('Passwords do not match.');
    if (strlen($new) < 8)   jsonError('Password must be at least 8 characters.');

    $db->prepare('UPDATE users SET password_hash=?, updated_at=NOW() WHERE id=?')
       ->execute([password_hash($new, PASSWORD_BCRYPT), $uid]);

    jsonOk(['message' => 'Password updated successfully.']);
}

// ── PUT /users?action=notifications ───────
if ($method === 'PUT' && $action === 'notifications') {
    $b = getBody();

    // Upsert into user_notification_prefs (child table, not users)
    $db->prepare('INSERT INTO user_notification_prefs
            (user_id, notif_applications, notif_new_pets, notif_newsletter, notif_donations)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            notif_applications = VALUES(notif_applications),
            notif_new_pets     = VALUES(notif_new_pets),
            notif_newsletter   = VALUES(notif_newsletter),
            notif_donations    = VALUES(notif_donations)')
       ->execute([
           $uid,
           (int)($b['applications'] ?? 1),
           (int)($b['newPets']      ?? 1),
           (int)($b['newsletter']   ?? 0),
           (int)($b['donations']    ?? 1),
       ]);

    jsonOk(['message' => 'Preferences saved.']);
}

// ── DELETE /users?action=account ──────────
if ($method === 'DELETE' && $action === 'account') {
    // user_notification_prefs will cascade-delete via FK
    $db->prepare('DELETE FROM users WHERE id=?')->execute([$uid]);
    jsonOk(['message' => 'Account deleted.']);
}

jsonError("Unknown users request: $method $action", 404);

function formatUserFull(array $u): array {
    return [
        'id'           => (int)$u['id'],
        'firstName'    => $u['first_name'],
        'lastName'     => $u['last_name'],
        'email'        => $u['email'],
        'phone'        => $u['phone'],
        'age'          => $u['age'] ? (int)$u['age'] : null,
        'municipality' => $u['municipality_name'] ?? null,  // resolved from JOIN
        'aboutMe'      => $u['about_me'],
        'avatarUrl'    => $u['avatar_url'],
        'role'         => $u['role'],
        // Notification prefs from user_notification_prefs JOIN
        'notifApplications' => (bool)($u['notif_applications'] ?? 1),
        'notifNewPets'      => (bool)($u['notif_new_pets']      ?? 1),
        'notifNewsletter'   => (bool)($u['notif_newsletter']    ?? 0),
        'notifDonations'    => (bool)($u['notif_donations']     ?? 1),
        'createdAt'    => $u['created_at'],
    ];
}
