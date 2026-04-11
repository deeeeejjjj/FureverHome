<?php
// ═══════════════════════════════════════════
//  api/adoptions.php — Adoption requests
//  GET  ?action=my          (user)
//  GET  list                (admin)
//  POST create              (user)
//  PUT  ?id=X&action=review (admin)
//
//  NORMALIZATION CHANGES:
//  - municipality in adoption_requests now stored as municipality_id FK.
//    INSERT resolves name → ID. SELECT resolves ID → name via JOIN.
//  - Pet primary image fetched from pet_images (sort_order=0), not pets.image_url.
// ═══════════════════════════════════════════

$db = getDB();

// ── GET /adoptions?action=my ──────────────
if ($method === 'GET' && $action === 'my') {
    $payload = requireAuth();
    $stmt = $db->prepare("
        SELECT ar.*, m.name AS municipality_name,
               p.name AS pet_name,
               MIN(CASE WHEN pi.sort_order = 0 THEN pi.url END) AS pet_image
        FROM adoption_requests ar
        LEFT JOIN municipalities m ON m.id  = ar.municipality_id
        LEFT JOIN pets p            ON p.id  = ar.pet_id
        LEFT JOIN pet_images pi     ON pi.pet_id = p.id
        WHERE ar.user_id = ?
        GROUP BY ar.id
        ORDER BY ar.created_at DESC
    ");
    $stmt->execute([$payload['sub']]);
    jsonOk(array_map('formatAdoption', $stmt->fetchAll()));
}

// ── GET /adoptions (admin list) ───────────
if ($method === 'GET' && !$action && !$id) {
    requireAuth(true);
    $status   = getParam('status');
    $page     = intParam('page');
    $pageSize = 20;
    $where    = $status ? 'WHERE ar.status = ?' : '';
    $params   = $status ? [$status] : [];

    $cStmt = $db->prepare("SELECT COUNT(*) FROM adoption_requests ar $where");
    $cStmt->execute($params);
    $total  = (int)$cStmt->fetchColumn();
    $offset = ($page - 1) * $pageSize;

    $stmt = $db->prepare("
        SELECT ar.*, m.name AS municipality_name,
               p.name AS pet_name,
               MIN(CASE WHEN pi.sort_order = 0 THEN pi.url END) AS pet_image
        FROM adoption_requests ar
        LEFT JOIN municipalities m ON m.id  = ar.municipality_id
        LEFT JOIN pets p            ON p.id  = ar.pet_id
        LEFT JOIN pet_images pi     ON pi.pet_id = p.id
        $where
        GROUP BY ar.id
        ORDER BY ar.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([...$params, $pageSize, $offset]);
    jsonOk(pagedResult(array_map('formatAdoption', $stmt->fetchAll()), $total, $page, $pageSize));
}

// ── POST /adoptions (apply) ───────────────
if ($method === 'POST' && !$action) {
    $payload = requireAuth();
    $uid = (int)$payload['sub'];
    $b   = getBody();

    $required = ['petId','fullName','email','phone','address','municipality','homeType','reason'];
    foreach ($required as $field) {
        if (empty($b[$field])) jsonError("$field is required.");
    }

    // Resolve municipality name → ID
    $mStmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
    $mStmt->execute([trim($b['municipality'])]);
    $mRow = $mStmt->fetch();
    if (!$mRow) jsonError("Unknown municipality: {$b['municipality']}");
    $munId = (int)$mRow['id'];

    // Check pet exists & available
    $petStmt = $db->prepare('SELECT * FROM pets WHERE id = ?');
    $petStmt->execute([$b['petId']]);
    $pet = $petStmt->fetch();
    if (!$pet) jsonNotFound('Pet not found.');
    if ($pet['status'] !== 'available') jsonError('This pet is no longer available for adoption.');

    // Check duplicate pending application
    $dupStmt = $db->prepare("SELECT id FROM adoption_requests WHERE user_id=? AND pet_id=? AND status='pending'");
    $dupStmt->execute([$uid, $b['petId']]);
    if ($dupStmt->fetch()) jsonError('You already have a pending application for this pet.', 409);

    $db->prepare('INSERT INTO adoption_requests
        (user_id, pet_id, full_name, email, phone, address, municipality_id, home_type,
         has_yard, has_other_pets, other_pets_desc, has_children, adults_in_home, reason, experience)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
       ->execute([
           $uid, (int)$b['petId'],
           trim($b['fullName']),
           strtolower(trim($b['email'])),
           trim($b['phone']),
           trim($b['address']),
           $munId,
           $b['homeType'],
           (int)($b['hasYard']       ?? 0),
           (int)($b['hasOtherPets']  ?? 0),
           trim($b['otherPetsDesc']  ?? ''),
           (int)($b['hasChildren']   ?? 0),
           $b['adultsInHome']        ?? null,
           trim($b['reason']),
           trim($b['experience']     ?? ''),
       ]);

    $db->prepare("UPDATE pets SET status='pending', updated_at=NOW() WHERE id=?")
       ->execute([$b['petId']]);

    $db->prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)')
       ->execute([$uid, 'system', 'Application Submitted',
           "Your adoption application for {$pet['name']} has been received. We'll review it shortly.",
           '/pages/user-dashboard.html']);

    jsonOk(['message' => 'Application submitted successfully.'], 201);
}

// ── PUT /adoptions?id=X&action=review (admin) ─
if ($method === 'PUT' && $id && $action === 'review') {
    $payload = requireAuth(true);
    $b   = getBody();
    $act = $b['action'] ?? '';
    if (!in_array($act, ['approve', 'reject'])) jsonError("action must be 'approve' or 'reject'.");

    $reqStmt = $db->prepare('
        SELECT ar.*, p.name AS pet_name
        FROM adoption_requests ar
        LEFT JOIN pets p ON p.id = ar.pet_id
        WHERE ar.id = ?
    ');
    $reqStmt->execute([$id]);
    $req = $reqStmt->fetch();
    if (!$req) jsonNotFound('Adoption request not found.');

    $newStatus = $act === 'approve' ? 'approved'  : 'rejected';
    $petStatus = $act === 'approve' ? 'adopted'   : 'available';
    $notes     = trim($b['adminNotes'] ?? '');

    $db->prepare('UPDATE adoption_requests SET
        status=?, admin_notes=?, reviewed_by=?, reviewed_at=NOW(), updated_at=NOW()
        WHERE id=?')
       ->execute([$newStatus, $notes, $payload['sub'], $id]);

    $db->prepare('UPDATE pets SET status=?, updated_at=NOW() WHERE id=?')
       ->execute([$petStatus, $req['pet_id']]);

    $notifTitle = $act === 'approve'
        ? "🎉 Application for {$req['pet_name']} Approved!"
        : "Application for {$req['pet_name']} Not Approved";
    $notifBody  = $notes ?: ($act === 'approve'
        ? 'Congratulations! Please contact the shelter to arrange pick-up.'
        : 'Thank you for your interest. Please try another pet.');

    $db->prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)')
       ->execute([$req['user_id'],
           $act === 'approve' ? 'application_approved' : 'application_rejected',
           $notifTitle, $notifBody,
           '/pages/user-dashboard.html']);

    jsonOk(['message' => "Request $newStatus."]);
}

jsonError("Unknown adoptions request: $method $action", 404);

function formatAdoption(array $a): array {
    return [
        'id'           => (int)$a['id'],
        'petId'        => (int)$a['pet_id'],
        'petName'      => $a['pet_name']        ?? '',
        'petImage'     => $a['pet_image']        ?? null,  // from pet_images JOIN
        'fullName'     => $a['full_name'],
        'email'        => $a['email'],
        'phone'        => $a['phone'],
        'municipality' => $a['municipality_name'], // resolved via JOIN
        'status'       => $a['status'],
        'adminNotes'   => $a['admin_notes'],
        'createdAt'    => $a['created_at'],
        'reviewedAt'   => $a['reviewed_at'],
    ];
}
