<?php
// ═══════════════════════════════════════════
//  api/rescuers.php
//  GET  list (verified rescuers)
//  POST ?action=apply   (submit application)
//
//  NORMALIZATION CHANGES:
//  - rescuer_applications table removed; merged into rescuers
//    with application_status + reviewed_by + reviewed_at columns.
//    POST apply now inserts into rescuers (status=pending, is_verified=0).
//  - municipality stored as municipality_id FK; resolved via JOIN.
//  - avatar_initials and avatar_color removed from DB;
//    computed here from full_name and id respectively.
// ═══════════════════════════════════════════

$db = getDB();

// ── GET /rescuers ─────────────────────────
if ($method === 'GET' && !$action) {
    $municipality = getParam('municipality'); // plain name e.g. "Boac"
    $where  = ['r.is_verified = 1'];
    $params = [];

    if ($municipality) {
        $where[]  = 'm.name = ?';
        $params[] = $municipality;
    }

    $whereSQL = implode(' AND ', $where);
    $stmt = $db->prepare("
        SELECT r.*, m.name AS municipality_name
        FROM rescuers r
        LEFT JOIN municipalities m ON m.id = r.municipality_id
        WHERE $whereSQL
        ORDER BY r.years_active DESC
    ");
    $stmt->execute($params);
    jsonOk(array_map('formatRescuer', $stmt->fetchAll()));
}

// ── POST /rescuers?action=apply ───────────
if ($method === 'POST' && $action === 'apply') {
    $b = getBody();
    $required = ['fullName', 'email', 'municipality', 'experienceLevel', 'petFocus'];
    foreach ($required as $f) {
        if (empty($b[$f])) jsonError("$f is required.");
    }

    $munId = resolveMunicipalityId($db, $b['municipality']);

    // Insert directly into rescuers with application_status = pending
    $db->prepare('INSERT INTO rescuers
        (full_name, email, phone, municipality_id, experience_level,
         pet_focus, bio, has_foster_space, application_status, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'pending\', 0)')
       ->execute([
           trim($b['fullName']),
           strtolower(trim($b['email'])),
           trim($b['phone'] ?? ''),
           $munId,
           $b['experienceLevel'],
           $b['petFocus'],
           trim($b['bio'] ?? ''),
           $b['hasFosterSpace'] ?? 'no',
       ]);

    jsonOk(['message' => 'Application submitted! We will review it within 3 business days.']);
}

jsonError("Unknown rescuers request: $method $action", 404);

// ── Helpers ───────────────────────────────

/**
 * Derive initials from full_name (replaces stored avatar_initials column).
 * "Maria Reyes" → "MR",  "Juan dela Cruz" → "JD"
 */
function deriveInitials(string $name): string {
    $words = preg_split('/\s+/', trim($name));
    $initials = '';
    foreach ($words as $word) {
        if (strlen($initials) >= 2) break;
        if (ctype_upper($word[0] ?? '')) { // skip lowercase particles (dela, de, etc.)
            $initials .= strtoupper($word[0]);
        }
    }
    return $initials ?: strtoupper($name[0] ?? '?');
}

/**
 * Deterministic avatar color from rescuer id (replaces stored avatar_color column).
 */
function deriveAvatarColor(int $id): string {
    $palette = [
        '#e8e0f5', '#d6ecf5', '#f5e0e8',
        '#e0f5ee', '#f5ede0', '#ede8f5',
    ];
    return $palette[$id % count($palette)];
}

/**
 * Resolve a municipality name to its ID. Returns 400 if not found.
 */
function resolveMunicipalityId(PDO $db, string $name): int {
    $stmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
    $stmt->execute([trim($name)]);
    $row = $stmt->fetch();
    if (!$row) jsonError("Unknown municipality: $name");
    return (int)$row['id'];
}

function formatRescuer(array $r): array {
    return [
        'id'              => (int)$r['id'],
        'fullName'        => $r['full_name'],
        'email'           => $r['email'],
        'phone'           => $r['phone'],
        'municipality'    => $r['municipality_name'],       // resolved from FK JOIN
        'experienceLevel' => $r['experience_level'],
        'petFocus'        => $r['pet_focus'],
        'bio'             => $r['bio'],
        'hasFosterSpace'  => $r['has_foster_space'],
        'rescuedCount'    => (int)$r['rescued_count'],
        'adoptedCount'    => (int)$r['adopted_count'],
        'yearsActive'     => (int)$r['years_active'],
        'isVerified'      => (bool)$r['is_verified'],
        'avatarInitials'  => deriveInitials($r['full_name']),  // computed, not stored
        'avatarColor'     => deriveAvatarColor((int)$r['id']), // computed, not stored
    ];
}
