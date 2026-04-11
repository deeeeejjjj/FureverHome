<?php
// ═══════════════════════════════════════════
//  api/admin.php — Admin-only endpoints
//  All routes require admin role JWT
//
//  NORMALIZATION CHANGES:
//  - Donations: donor_name/donor_email derived from users JOIN (not stored columns).
//  - Shelters: municipality stored as municipality_id FK; resolved via JOIN.
//  - Users list: municipality resolved via JOIN.
//  - Rescuer applications: now query rescuers table (application_status='pending').
// ═══════════════════════════════════════════

$db = getDB();
requireAuth(true);

// ── GET /admin?action=stats ───────────────
if ($method === 'GET' && $action === 'stats') {
    $q = fn(string $sql) => (function() use ($db, $sql) {
        $s = $db->prepare($sql); $s->execute(); return (int)$s->fetchColumn();
    })();

    jsonOk([
        'totalPets'           => $q('SELECT COUNT(*) FROM pets'),
        'adoptedPets'         => $q("SELECT COUNT(*) FROM pets WHERE status='adopted'"),
        'totalUsers'          => $q("SELECT COUNT(*) FROM users WHERE role='user'"),
        'pendingRequests'     => $q("SELECT COUNT(*) FROM adoption_requests WHERE status='pending'"),
        'availablePets'       => $q("SELECT COUNT(*) FROM pets WHERE status='available'"),
        'pendingPets'         => $q("SELECT COUNT(*) FROM pets WHERE status='pending'"),
        'totalDonations'      => $q("SELECT COUNT(*) FROM donations WHERE status='completed'"),
        'totalDonationAmount' => (function() use ($db) {
            $s = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM donations WHERE status='completed'");
            $s->execute();
            return (float)$s->fetchColumn();
        })(),
    ]);
}

// ── GET /admin?action=users ───────────────
if ($method === 'GET' && $action === 'users') {
    $page     = intParam('page');
    $pageSize = 20;

    $cStmt = $db->prepare("SELECT COUNT(*) FROM users WHERE role != 'admin'");
    $cStmt->execute();
    $total  = (int)$cStmt->fetchColumn();
    $offset = ($page - 1) * $pageSize;

    $stmt = $db->prepare("
        SELECT u.*, m.name AS municipality_name
        FROM users u
        LEFT JOIN municipalities m ON m.id = u.municipality_id
        WHERE u.role != 'admin'
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$pageSize, $offset]);

    $users = array_map(fn($u) => [
        'id'           => (int)$u['id'],
        'firstName'    => $u['first_name'],
        'lastName'     => $u['last_name'],
        'email'        => $u['email'],
        'phone'        => $u['phone'],
        'municipality' => $u['municipality_name'],   // resolved via JOIN
        'role'         => $u['role'],
        'isActive'     => (bool)$u['is_active'],
        'createdAt'    => $u['created_at'],
    ], $stmt->fetchAll());

    jsonOk(pagedResult($users, $total, $page, $pageSize));
}

// ── PUT /admin?action=deactivate&id=X ─────
if ($method === 'PUT' && $action === 'deactivate' && $id) {
    $stmt = $db->prepare('UPDATE users SET is_active=0, updated_at=NOW() WHERE id=?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) jsonNotFound('User not found.');
    jsonOk(['message' => 'User deactivated.']);
}

// ── PUT /admin?action=activate&id=X ───────
if ($method === 'PUT' && $action === 'activate' && $id) {
    $stmt = $db->prepare('UPDATE users SET is_active=1, updated_at=NOW() WHERE id=?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) jsonNotFound('User not found.');
    jsonOk(['message' => 'User activated.']);
}

// ── GET /admin?action=shelters ────────────
if ($method === 'GET' && $action === 'shelters') {
    $stmt = $db->prepare("
        SELECT s.*, m.name AS municipality_name
        FROM shelters s
        LEFT JOIN municipalities m ON m.id = s.municipality_id
        WHERE s.is_active = 1
        ORDER BY s.name
    ");
    $stmt->execute();
    $shelters = array_map(fn($s) => array_merge($s, [
        'municipality' => $s['municipality_name'],
    ]), $stmt->fetchAll());
    jsonOk($shelters);
}

// ── POST /admin?action=shelters ───────────
if ($method === 'POST' && $action === 'shelters') {
    $b = getBody();
    if (empty($b['name']) || empty($b['municipality'])) {
        jsonError('Name and municipality are required.');
    }

    // Resolve municipality name → ID
    $mStmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
    $mStmt->execute([trim($b['municipality'])]);
    $mRow = $mStmt->fetch();
    if (!$mRow) jsonError("Unknown municipality: {$b['municipality']}");

    $db->prepare('INSERT INTO shelters (name, municipality_id, address, phone, email, description)
        VALUES (?,?,?,?,?,?)')
       ->execute([
           trim($b['name']),
           (int)$mRow['id'],
           trim($b['address']     ?? ''),
           trim($b['phone']       ?? ''),
           trim($b['email']       ?? ''),
           trim($b['description'] ?? ''),
       ]);

    jsonOk(['message' => 'Shelter created.', 'id' => (int)$db->lastInsertId()], 201);
}

// ── GET /admin?action=messages ────────────
if ($method === 'GET' && $action === 'messages') {
    $unresolved = getParam('unresolved') === 'true';
    $where = $unresolved ? 'WHERE is_resolved=0' : '';
    $stmt  = $db->prepare("SELECT * FROM contact_messages $where ORDER BY created_at DESC LIMIT 100");
    $stmt->execute();
    jsonOk($stmt->fetchAll());
}

// ── PUT /admin?action=resolve&id=X ────────
if ($method === 'PUT' && $action === 'resolve' && $id) {
    $stmt = $db->prepare('UPDATE contact_messages SET is_resolved=1 WHERE id=?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) jsonNotFound('Message not found.');
    jsonOk(['message' => 'Marked as resolved.']);
}

// ── GET /admin?action=donations ───────────
if ($method === 'GET' && $action === 'donations') {
    $page     = intParam('page');
    $pageSize = 20;

    $cStmt = $db->prepare('SELECT COUNT(*) FROM donations');
    $cStmt->execute();
    $total  = (int)$cStmt->fetchColumn();
    $offset = ($page - 1) * $pageSize;

    // donor_name and donor_email no longer stored — derived via JOIN
    $stmt = $db->prepare("
        SELECT d.*,
               CASE WHEN d.is_anonymous = 0
                    THEN CONCAT(u.first_name, ' ', u.last_name)
                    ELSE NULL END AS donor_name,
               CASE WHEN d.is_anonymous = 0 THEN u.email ELSE NULL END AS donor_email
        FROM donations d
        LEFT JOIN users u ON u.id = d.user_id
        ORDER BY d.donated_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$pageSize, $offset]);

    jsonOk(pagedResult(array_map(fn($d) => [
        'id'            => (int)$d['id'],
        'donorName'     => $d['donor_name'],     // null when anonymous
        'donorEmail'    => $d['donor_email'],
        'amount'        => (float)$d['amount'],
        'currency'      => $d['currency'] ?? 'PHP',
        'paymentMethod' => $d['payment_method'],
        'message'       => $d['message'],
        'isAnonymous'   => (bool)$d['is_anonymous'],
        'status'        => $d['status'],
        'donatedAt'     => $d['donated_at'],
    ], $stmt->fetchAll()), $total, $page, $pageSize));
}

// ── GET /admin?action=rescuer-applications ─
// Lists pending rescuer applications from the merged rescuers table
if ($method === 'GET' && $action === 'rescuer-applications') {
    $status = getParam('status', 'pending');
    $stmt   = $db->prepare("
        SELECT r.*, m.name AS municipality_name
        FROM rescuers r
        LEFT JOIN municipalities m ON m.id = r.municipality_id
        WHERE r.application_status = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$status]);
    jsonOk($stmt->fetchAll());
}

// ── PUT /admin?action=review-rescuer&id=X ─
// Approve or reject a rescuer application
if ($method === 'PUT' && $action === 'review-rescuer' && $id) {
    $b      = getBody();
    $act    = $b['action'] ?? '';
    if (!in_array($act, ['approve', 'reject'])) jsonError("action must be 'approve' or 'reject'.");

    $newAppStatus = $act === 'approve' ? 'approved' : 'rejected';
    $isVerified   = $act === 'approve' ? 1 : 0;

    $stmt = $db->prepare('SELECT id FROM rescuers WHERE id=? AND application_status=\'pending\'');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonNotFound('Pending rescuer application not found.');

    $db->prepare('UPDATE rescuers SET
        application_status=?, is_verified=?, reviewed_by=?, reviewed_at=NOW()
        WHERE id=?')
       ->execute([$newAppStatus, $isVerified, $payload['sub'], $id]);

    jsonOk(['message' => "Rescuer application $newAppStatus."]);
}

// ── GET /admin?action=analytics ───────────
if ($method === 'GET' && $action === 'analytics') {
    $stmt = $db->prepare("
        SELECT YEAR(reviewed_at) AS year, MONTH(reviewed_at) AS month, COUNT(*) AS count
        FROM adoption_requests
        WHERE status='approved' AND reviewed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY YEAR(reviewed_at), MONTH(reviewed_at)
        ORDER BY year, month
    ");
    $stmt->execute();
    $rows = array_map(fn($r) => [
        'year'  => (int)$r['year'],
        'month' => (int)$r['month'],
        'count' => (int)$r['count'],
    ], $stmt->fetchAll());

    $typeStmt = $db->prepare("SELECT type, COUNT(*) AS count FROM pets GROUP BY type");
    $typeStmt->execute();

    $statusStmt = $db->prepare("SELECT status, COUNT(*) AS count FROM adoption_requests GROUP BY status");
    $statusStmt->execute();

    jsonOk([
        'adoptionsByMonth' => $rows,
        'petTypes'         => $typeStmt->fetchAll(),
        'adoptionStatus'   => $statusStmt->fetchAll(),
    ]);
}

jsonError("Unknown admin action: $action", 404);
