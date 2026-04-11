<?php
// ═══════════════════════════════════════════
//  api/auth.php — Authentication endpoints
//  POST ?action=register
//  POST ?action=login
//  GET  ?action=me
//
//  NORMALIZATION CHANGES:
//  - municipality stored as municipality_id FK (resolved from name on register).
//  - On register: also inserts a row into user_notification_prefs (default prefs).
//  - fetchUser() now JOINs municipalities + user_notification_prefs.
// ═══════════════════════════════════════════

$db = getDB();

// ── POST /register ────────────────────────
if ($method === 'POST' && $action === 'register') {
    $b            = getBody();
    $firstName    = trim($b['firstName']    ?? '');
    $lastName     = trim($b['lastName']     ?? '');
    $email        = strtolower(trim($b['email'] ?? ''));
    $password     = $b['password']          ?? '';
    $phone        = trim($b['phone']        ?? '');
    $age          = isset($b['age']) ? (int)$b['age'] : null;
    $municipality = trim($b['municipality'] ?? '');

    if (!$firstName || !$lastName || !$email || !$password) {
        jsonError('First name, last name, email, and password are required.');
    }
    if (strlen($password) < 8) {
        jsonError('Password must be at least 8 characters.');
    }

    // Resolve municipality name → ID (nullable)
    $munId = null;
    if ($municipality) {
        $mStmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
        $mStmt->execute([$municipality]);
        $mRow = $mStmt->fetch();
        if (!$mRow) jsonError("Unknown municipality: $municipality");
        $munId = (int)$mRow['id'];
    }

    // Check duplicate email
    $dup = $db->prepare('SELECT id FROM users WHERE email = ?');
    $dup->execute([$email]);
    if ($dup->fetch()) jsonError('Email is already registered.', 409);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $db->prepare('INSERT INTO users
        (first_name, last_name, email, password_hash, phone, age, municipality_id, role)
        VALUES (?,?,?,?,?,?,?,\'user\')')
       ->execute([$firstName, $lastName, $email, $hash, $phone ?: null, $age, $munId]);

    $userId = (int)$db->lastInsertId();

    // Create default notification preferences row
    $db->prepare('INSERT INTO user_notification_prefs (user_id) VALUES (?)')
       ->execute([$userId]);

    // Welcome notification
    $db->prepare('INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,\'system\',?,?,?)')
       ->execute([$userId,
           'Welcome to Furever Home!',
           "Welcome $firstName! Start browsing pets available in Marinduque.",
           '/pages/pets.html']);

    $user  = fetchUser($db, $userId);
    $token = jwtEncode(['sub' => $userId, 'email' => $email, 'role' => 'user']);
    jsonOk(['token' => $token, 'user' => $user]);
}

// ── POST /login ───────────────────────────
if ($method === 'POST' && $action === 'login') {
    $b     = getBody();
    $email = strtolower(trim($b['email']    ?? ''));
    $pass  = $b['password'] ?? '';

    $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        jsonError('Invalid email or password.', 401);
    }
    if (!$user['is_active']) {
        jsonError('Your account has been deactivated.', 401);
    }

    $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);
    $token = jwtEncode(['sub' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
    jsonOk(['token' => $token, 'user' => formatUser($user, $db)]);
}

// ── GET /me ───────────────────────────────
if ($method === 'GET' && $action === 'me') {
    $payload = requireAuth();
    $user = fetchUser($db, $payload['sub']);
    if (!$user) jsonNotFound('User not found.');
    jsonOk($user);
}

jsonError("Unknown auth action: $action", 404);

// ── Helpers ───────────────────────────────

function fetchUser(PDO $db, int $id): ?array {
    $stmt = $db->prepare("
        SELECT u.*, m.name AS municipality_name
        FROM users u
        LEFT JOIN municipalities m ON m.id = u.municipality_id
        WHERE u.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? formatUser($row, $db) : null;
}

function formatUser(array $u, PDO $db = null): array {
    return [
        'id'           => (int)$u['id'],
        'firstName'    => $u['first_name'],
        'lastName'     => $u['last_name'],
        'email'        => $u['email'],
        'phone'        => $u['phone'],
        'age'          => $u['age'] ? (int)$u['age'] : null,
        'municipality' => $u['municipality_name'] ?? null, // from JOIN
        'aboutMe'      => $u['about_me'],
        'avatarUrl'    => $u['avatar_url'],
        'role'         => $u['role'],
        'createdAt'    => $u['created_at'],
    ];
}
