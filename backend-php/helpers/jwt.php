<?php
// ═══════════════════════════════════════════════════
//  jwt.php — Simple JWT helper (HS256, no library)
// ═══════════════════════════════════════════════════

define('JWT_SECRET', 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY_2024');
define('JWT_EXPIRY_HOURS', 24);

function jwtEncode(array $payload): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + (JWT_EXPIRY_HOURS * 3600);
    $body    = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwtDecode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

/**
 * Returns the authenticated user's ID, or sends 401 and exits.
 * Pass $requireAdmin=true to also enforce admin role.
 */
function requireAuth(bool $requireAdmin = false): array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
        jsonError('Unauthorized.', 401);
    }
    $payload = jwtDecode($m[1]);
    if (!$payload) {
        jsonError('Token invalid or expired.', 401);
    }
    if ($requireAdmin && ($payload['role'] ?? '') !== 'admin') {
        jsonError('Admin access required.', 403);
    }
    return $payload;
}
