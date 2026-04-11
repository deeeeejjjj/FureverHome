<?php
// ═══════════════════════════════════════════
//  api/pets.php — Pets CRUD endpoints
//  GET    list, featured, single
//  POST   create  (admin)
//  PUT    update  (admin)
//  DELETE delete  (admin)
//
//  NORMALIZATION CHANGES:
//  - age_label and age_group removed from DB; computed here via ageLabel() / ageGroup()
//  - image_url removed from DB; primary image comes from pet_images (sort_order=0)
//  - municipality stored as municipality_id FK; resolved via JOIN to municipalities
//  - Filter ?ageGroup=X and ?municipality=X now match against computed/joined values
// ═══════════════════════════════════════════

$db = getDB();

// ── GET /pets (list with filters) ─────────
if ($method === 'GET' && !$action && !$id) {
    $type         = getParam('type');
    $ageGroup     = getParam('ageGroup');   // computed: puppy/young/adult/senior
    $gender       = getParam('gender');
    $status       = getParam('status', 'available');
    $municipality = getParam('municipality'); // plain name e.g. "Boac"
    $search       = getParam('search');
    $sortBy       = getParam('sortBy', 'featured');
    $page         = intParam('page', 1);
    $pageSize     = min(50, intParam('pageSize', 12));

    $where  = ['1=1'];
    $params = [];

    if ($type)   { $where[] = 'p.type = ?';   $params[] = $type; }
    if ($gender) { $where[] = 'p.gender = ?'; $params[] = $gender; }
    if ($status) { $where[] = 'p.status = ?'; $params[] = $status; }

    // municipality filter: match the name in the lookup table
    if ($municipality) {
        $where[]  = 'm.name = ?';
        $params[] = $municipality;
    }

    // age_group is now computed from age_years — filter in HAVING so GROUP BY is applied first
    // We'll handle it as a HAVING clause below.

    if ($search) {
        $where[]  = '(p.name LIKE ? OR p.breed LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $whereSQL = implode(' AND ', $where);

    // age_group computed expression (mirrors ageGroup() helper below)
    $ageGroupExpr = "CASE
        WHEN p.age_years < 1   THEN 'puppy'
        WHEN p.age_years < 3   THEN 'young'
        WHEN p.age_years < 8   THEN 'adult'
        WHEN p.age_years IS NULL THEN NULL
        ELSE 'senior'
    END";

    $havingSQL = '';
    if ($ageGroup) {
        $havingSQL    = "HAVING computed_age_group = ?";
        $params[]     = $ageGroup;  // appended AFTER the WHERE params
    }

    $orderSQL = match($sortBy) {
        'name'   => 'p.name ASC',
        'age'    => 'p.age_years ASC',
        'newest' => 'p.created_at DESC',
        default  => 'p.is_featured DESC, p.name ASC',
    };

    // Count — run without HAVING if no ageGroup filter (faster), with subquery if needed
    if ($ageGroup) {
        $countParams = array_merge(array_slice($params, 0, -1), [$ageGroup]); // WHERE params + having param
        $countSQL = "SELECT COUNT(*) FROM (
            SELECT p.id, ($ageGroupExpr) AS computed_age_group
            FROM pets p
            LEFT JOIN municipalities m ON m.id = p.municipality_id
            WHERE $whereSQL
            GROUP BY p.id
            $havingSQL
        ) sub";
        $countStmt = $db->prepare($countSQL);
        $countStmt->execute($countParams);
    } else {
        $countSQL  = "SELECT COUNT(*) FROM pets p LEFT JOIN municipalities m ON m.id = p.municipality_id WHERE $whereSQL";
        $countStmt = $db->prepare($countSQL);
        $countStmt->execute($params);
    }
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $pageSize;

    // Main query — primary image from pet_images sort_order=0
    $stmt = $db->prepare("
        SELECT p.*,
               m.name AS municipality_name,
               ($ageGroupExpr) AS computed_age_group,
               GROUP_CONCAT(DISTINCT pt.tag)                        AS tags,
               MIN(CASE WHEN pi.sort_order = 0 THEN pi.url END)    AS primary_image
        FROM pets p
        LEFT JOIN municipalities m  ON m.id  = p.municipality_id
        LEFT JOIN pet_tags pt        ON pt.pet_id = p.id
        LEFT JOIN pet_images pi      ON pi.pet_id = p.id
        WHERE $whereSQL
        GROUP BY p.id
        $havingSQL
        ORDER BY $orderSQL
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([...$params, $pageSize, $offset]);
    $rows = $stmt->fetchAll();

    jsonOk(pagedResult(array_map('formatPetList', $rows), $total, $page, $pageSize));
}

// ── GET /pets?action=featured ─────────────
if ($method === 'GET' && $action === 'featured') {
    $dogs = fetchFeatured($db, 'Dog');
    $cats = fetchFeatured($db, 'Cat');
    jsonOk(['dogs' => $dogs, 'cats' => $cats]);
}

// ── GET /pets?id=X ────────────────────────
if ($method === 'GET' && $id) {
    $pet = getPetDetail($db, $id);
    if (!$pet) jsonNotFound('Pet not found.');
    jsonOk($pet);
}

// ── POST /pets (admin) ────────────────────
if ($method === 'POST' && !$action) {
    $payload = requireAuth(true);
    $b = getBody();
    validatePetBody($b);

    $munId = resolveMunicipalityId($db, $b['municipality'] ?? '');

    $stmt = $db->prepare('INSERT INTO pets
        (name,type,breed,age_years,gender,size,weight_kg,
         municipality_id,shelter_id,description,status,is_vaccinated,is_neutered,
         is_house_trained,is_microchipped,is_featured,created_by)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        trim($b['name']), $b['type'], trim($b['breed'] ?? ''), $b['ageYears'] ?? null,
        $b['gender'], $b['size'] ?? null, $b['weightKg'] ?? null,
        $munId, $b['shelterId'] ?? null, trim($b['description'] ?? ''),
        $b['status'] ?? 'available',
        (int)($b['isVaccinated'] ?? 0), (int)($b['isNeutered'] ?? 0),
        (int)($b['isHouseTrained'] ?? 0), (int)($b['isMicrochipped'] ?? 0),
        (int)($b['isFeatured'] ?? 0), $payload['sub'],
    ]);
    $petId = (int)$db->lastInsertId();

    // Primary image goes into pet_images with sort_order = 0
    if (!empty($b['imageUrl'])) {
        $db->prepare('INSERT INTO pet_images (pet_id, url, sort_order) VALUES (?,?,0)')
           ->execute([$petId, $b['imageUrl']]);
    }

    saveTags($db, $petId, $b['tags'] ?? []);
    jsonOk(getPetDetail($db, $petId), 201);
}

// ── PUT /pets?id=X (admin) ────────────────
if ($method === 'PUT' && $id) {
    requireAuth(true);
    $b = getBody();
    validatePetBody($b);

    $munId = resolveMunicipalityId($db, $b['municipality'] ?? '');

    $stmt = $db->prepare('UPDATE pets SET
        name=?,type=?,breed=?,age_years=?,gender=?,size=?,weight_kg=?,
        municipality_id=?,shelter_id=?,description=?,status=?,
        is_vaccinated=?,is_neutered=?,is_house_trained=?,is_microchipped=?,
        is_featured=?,updated_at=NOW()
        WHERE id=?');
    $stmt->execute([
        trim($b['name']), $b['type'], trim($b['breed'] ?? ''), $b['ageYears'] ?? null,
        $b['gender'], $b['size'] ?? null, $b['weightKg'] ?? null,
        $munId, $b['shelterId'] ?? null, trim($b['description'] ?? ''),
        $b['status'] ?? 'available',
        (int)($b['isVaccinated'] ?? 0), (int)($b['isNeutered'] ?? 0),
        (int)($b['isHouseTrained'] ?? 0), (int)($b['isMicrochipped'] ?? 0),
        (int)($b['isFeatured'] ?? 0), $id,
    ]);

    // Update primary image if provided
    if (!empty($b['imageUrl'])) {
        // Upsert: replace sort_order=0 image for this pet
        $db->prepare('DELETE FROM pet_images WHERE pet_id=? AND sort_order=0')->execute([$id]);
        $db->prepare('INSERT INTO pet_images (pet_id, url, sort_order) VALUES (?,?,0)')
           ->execute([$id, $b['imageUrl']]);
    }

    $db->prepare('DELETE FROM pet_tags WHERE pet_id = ?')->execute([$id]);
    saveTags($db, $id, $b['tags'] ?? []);

    jsonOk(getPetDetail($db, $id));
}

// ── DELETE /pets?id=X (admin) ─────────────
if ($method === 'DELETE' && $id) {
    requireAuth(true);
    $stmt = $db->prepare('DELETE FROM pets WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) jsonNotFound('Pet not found.');
    jsonOk(['message' => 'Pet deleted.']);
}

jsonError("Unknown pets request: $method $action", 404);

// ── Helpers ───────────────────────────────

/**
 * Compute age_group from age_years (replaces stored column).
 */
function ageGroup(?float $years): ?string {
    if ($years === null) return null;
    if ($years < 1) return 'puppy';
    if ($years < 3) return 'young';
    if ($years < 8) return 'adult';
    return 'senior';
}

/**
 * Compute age_label from age_years (replaces stored column).
 */
function ageLabel(?float $years): ?string {
    if ($years === null) return null;
    $rounded = (int)round($years);
    return $rounded . ' yr' . ($rounded === 1 ? '' : 's');
}

/**
 * Resolve a municipality name to its ID. Throws 400 if not found.
 */
function resolveMunicipalityId(PDO $db, string $name): int {
    if (!$name) jsonError('municipality is required.');
    $stmt = $db->prepare('SELECT id FROM municipalities WHERE name = ?');
    $stmt->execute([trim($name)]);
    $row = $stmt->fetch();
    if (!$row) jsonError("Unknown municipality: $name");
    return (int)$row['id'];
}

function fetchFeatured(PDO $db, string $type): array {
    $stmt = $db->prepare("
        SELECT p.*, m.name AS municipality_name,
               GROUP_CONCAT(DISTINCT pt.tag) AS tags,
               MIN(CASE WHEN pi.sort_order = 0 THEN pi.url END) AS primary_image
        FROM pets p
        LEFT JOIN municipalities m ON m.id = p.municipality_id
        LEFT JOIN pet_tags pt       ON pt.pet_id = p.id
        LEFT JOIN pet_images pi     ON pi.pet_id = p.id
        WHERE p.type = ? AND p.status = 'available' AND p.is_featured = 1
        GROUP BY p.id
        LIMIT 3
    ");
    $stmt->execute([$type]);
    return array_map('formatPetList', $stmt->fetchAll());
}

function getPetDetail(PDO $db, int $id): ?array {
    $stmt = $db->prepare("
        SELECT p.*, m.name AS municipality_name, s.name AS shelter_name,
               GROUP_CONCAT(DISTINCT pt.tag)                           AS tags,
               GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.sort_order)   AS image_urls,
               MIN(CASE WHEN pi.sort_order = 0 THEN pi.url END)       AS primary_image
        FROM pets p
        LEFT JOIN municipalities m ON m.id  = p.municipality_id
        LEFT JOIN shelters s        ON s.id  = p.shelter_id
        LEFT JOIN pet_tags pt       ON pt.pet_id = p.id
        LEFT JOIN pet_images pi     ON pi.pet_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? formatPetDetail($row) : null;
}

function saveTags(PDO $db, int $petId, array $tags): void {
    if (!$tags) return;
    $stmt = $db->prepare('INSERT IGNORE INTO pet_tags (pet_id, tag) VALUES (?,?)');
    foreach ($tags as $tag) {
        if (trim($tag)) $stmt->execute([$petId, trim($tag)]);
    }
}

function validatePetBody(array $b): void {
    if (empty($b['name']) || empty($b['type']) || empty($b['gender']) || empty($b['municipality'])) {
        jsonError('name, type, gender, and municipality are required.');
    }
}

function formatPetList(array $p): array {
    $years = $p['age_years'] ? (float)$p['age_years'] : null;
    return [
        'id'           => (int)$p['id'],
        'name'         => $p['name'],
        'type'         => $p['type'],
        'breed'        => $p['breed'],
        'ageLabel'     => ageLabel($years),          // computed, not stored
        'ageGroup'     => $p['computed_age_group'] ?? ageGroup($years), // from SQL CASE or fallback
        'gender'       => $p['gender'],
        'size'         => $p['size'],
        'weightKg'     => $years !== null ? (float)$p['weight_kg'] : null,
        'municipality' => $p['municipality_name'],   // resolved from FK JOIN
        'status'       => $p['status'],
        'isVaccinated' => (bool)$p['is_vaccinated'],
        'isFeatured'   => (bool)$p['is_featured'],
        'imageUrl'     => $p['primary_image'] ?? null, // from pet_images sort_order=0
        'tags'         => $p['tags'] ? explode(',', $p['tags']) : [],
    ];
}

function formatPetDetail(array $p): array {
    $years = $p['age_years'] ? (float)$p['age_years'] : null;
    return array_merge(formatPetList($p), [
        'ageYears'       => $years,
        'shelterId'      => $p['shelter_id'] ? (int)$p['shelter_id'] : null,
        'shelterName'    => $p['shelter_name'] ?? null,
        'description'    => $p['description'],
        'isNeutered'     => (bool)$p['is_neutered'],
        'isHouseTrained' => (bool)$p['is_house_trained'],
        'isMicrochipped' => (bool)$p['is_microchipped'],
        'imageUrls'      => $p['image_urls'] ? explode(',', $p['image_urls']) : [],
        'createdAt'      => $p['created_at'],
    ]);
}
