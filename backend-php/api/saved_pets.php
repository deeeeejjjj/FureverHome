<?php
// ═══════════════════════════════════════════
//  api/saved_pets.php
//  GET    list saved pets
//  POST   ?id=X  save a pet
//  DELETE ?id=X  unsave a pet
// ═══════════════════════════════════════════

$db = getDB();
$payload = requireAuth();
$uid = (int)$payload['sub'];

// ── GET /saved-pets ───────────────────────
if ($method === 'GET') {
    $stmt = $db->prepare('SELECT sp.*, p.name AS pet_name, p.type AS pet_type,
        p.breed AS pet_breed, p.status AS pet_status, p.image_url AS pet_image,
        p.municipality AS pet_municipality
        FROM saved_pets sp
        LEFT JOIN pets p ON p.id = sp.pet_id
        WHERE sp.user_id = ?
        ORDER BY sp.saved_at DESC');
    $stmt->execute([$uid]);
    jsonOk(array_map('formatSaved', $stmt->fetchAll()));
}

// ── POST /saved-pets?id=X ─────────────────
if ($method === 'POST' && $id) {
    // Check pet exists
    $petCheck = $db->prepare('SELECT id FROM pets WHERE id=?');
    $petCheck->execute([$id]);
    if (!$petCheck->fetch()) jsonNotFound('Pet not found.');

    // Check already saved
    $dupCheck = $db->prepare('SELECT id FROM saved_pets WHERE user_id=? AND pet_id=?');
    $dupCheck->execute([$uid, $id]);
    if ($dupCheck->fetch()) jsonError('Already saved.', 409);

    $db->prepare('INSERT INTO saved_pets (user_id, pet_id) VALUES(?,?)')->execute([$uid, $id]);
    jsonOk(['message' => 'Pet saved to favourites.']);
}

// ── DELETE /saved-pets?id=X ───────────────
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM saved_pets WHERE user_id=? AND pet_id=?');
    $stmt->execute([$uid, $id]);
    if ($stmt->rowCount() === 0) jsonNotFound('Saved pet not found.');
    jsonOk(['message' => 'Removed from favourites.']);
}

jsonError("Unknown saved-pets request: $method $action", 404);

function formatSaved(array $s): array {
    return [
        'id'              => (int)$s['id'],
        'petId'           => (int)$s['pet_id'],
        'petName'         => $s['pet_name'],
        'petType'         => $s['pet_type'],
        'petBreed'        => $s['pet_breed'],
        'petStatus'       => $s['pet_status'],
        'petImage'        => $s['pet_image'],
        'petMunicipality' => $s['pet_municipality'],
        'savedAt'         => $s['saved_at'],
    ];
}
