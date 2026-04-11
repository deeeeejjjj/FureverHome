<?php
// ═══════════════════════════════════════════════════
//  response.php — JSON response helpers
// ═══════════════════════════════════════════════════

function jsonOk(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonNotFound(string $message = 'Not found.'): void {
    jsonError($message, 404);
}

function jsonUnauthorized(string $message = 'Unauthorized.'): void {
    jsonError($message, 401);
}

function pagedResult(array $items, int $total, int $page, int $pageSize): array {
    return [
        'items'      => $items,
        'total'      => $total,
        'page'       => $page,
        'pageSize'   => $pageSize,
        'totalPages' => (int) ceil($total / max($pageSize, 1)),
    ];
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function getParam(string $key, mixed $default = null): mixed {
    return $_GET[$key] ?? $default;
}

function intParam(string $key, int $default = 1): int {
    return max(1, (int)($_GET[$key] ?? $default));
}
