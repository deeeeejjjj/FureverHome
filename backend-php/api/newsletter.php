<?php
// ═══════════════════════════════════════════
//  api/newsletter.php
//  POST ?action=subscribe
// ═══════════════════════════════════════════

$db = getDB();

if ($method === 'POST' && $action === 'subscribe') {
    $b     = getBody();
    $email = strtolower(trim($b['email'] ?? ''));
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('A valid email is required.');
    }

    $check = $db->prepare('SELECT id FROM newsletter_subscribers WHERE email=?');
    $check->execute([$email]);
    if ($check->fetch()) {
        jsonError('You are already subscribed.', 409);
    }

    $db->prepare('INSERT INTO newsletter_subscribers (email) VALUES(?)')->execute([$email]);
    jsonOk(['message' => 'Subscribed! Watch your inbox for pet care tips.']);
}

jsonError("Unknown newsletter request.", 404);
