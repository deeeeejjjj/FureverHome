<?php
// ═══════════════════════════════════════════
//  api/donations.php
//  GET  ?action=my   (user's own donations)
//  POST              (make a donation)
//
//  NORMALIZATION CHANGES:
//  - donor_name and donor_email columns removed from donations table.
//    When is_anonymous=0, donor info is read via JOIN to users.
//    When is_anonymous=1, donorName is returned as null (suppressed at app layer).
// ═══════════════════════════════════════════

$db = getDB();

// ── GET /donations?action=my ──────────────
if ($method === 'GET' && $action === 'my') {
    $payload = requireAuth();
    $stmt = $db->prepare("
        SELECT d.*,
               CASE WHEN d.is_anonymous = 0
                    THEN CONCAT(u.first_name, ' ', u.last_name)
                    ELSE NULL END AS donor_name,
               CASE WHEN d.is_anonymous = 0 THEN u.email ELSE NULL END AS donor_email
        FROM donations d
        LEFT JOIN users u ON u.id = d.user_id
        WHERE d.user_id = ?
        ORDER BY d.donated_at DESC
    ");
    $stmt->execute([$payload['sub']]);
    jsonOk(array_map('formatDonation', $stmt->fetchAll()));
}

// ── POST /donations ───────────────────────
if ($method === 'POST') {
    $payload = requireAuth();
    $uid = (int)$payload['sub'];
    $b   = getBody();

    if (empty($b['amount']) || $b['amount'] <= 0) jsonError('Amount must be greater than 0.');
    if (empty($b['paymentMethod']))                jsonError('Payment method is required.');

    $isAnon = (bool)($b['isAnonymous'] ?? false);

    // donor_name / donor_email no longer stored — only user_id is recorded.
    $db->prepare('INSERT INTO donations
        (user_id, amount, payment_method, message, is_anonymous, status)
        VALUES (?, ?, ?, ?, ?, \'completed\')')
       ->execute([
           $uid,
           (float)$b['amount'],
           $b['paymentMethod'],
           trim($b['message'] ?? ''),
           (int)$isAnon,
       ]);

    $amount = number_format((float)$b['amount'], 0);
    $db->prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)')
       ->execute([$uid, 'donation', "Thank you for your donation of ₱{$amount}!",
           'Your donation helps feed and care for animals across Marinduque.',
           '/pages/user-dashboard.html']);

    jsonOk(['message' => 'Thank you for your donation!'], 201);
}

jsonError("Unknown donations request.", 404);

function formatDonation(array $d): array {
    return [
        'id'            => (int)$d['id'],
        // donor_name derived from JOIN; null when anonymous
        'donorName'     => $d['donor_name'] ?? null,
        'donorEmail'    => $d['donor_email'] ?? null,
        'amount'        => (float)$d['amount'],
        'currency'      => $d['currency'] ?? 'PHP',
        'paymentMethod' => $d['payment_method'],
        'message'       => $d['message'],
        'isAnonymous'   => (bool)$d['is_anonymous'],
        'status'        => $d['status'],
        'donatedAt'     => $d['donated_at'],
    ];
}
