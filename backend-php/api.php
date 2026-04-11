<?php
// ═══════════════════════════════════════════════════════════════
//  api.php — Furever Home PHP API (Single Entry Point)
//  Routes all requests to the appropriate handler
//  Usage:  /backend-php/api.php?route=pets&action=list
// ═══════════════════════════════════════════════════════════════

// CORS — allow frontend to call this API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Autoload helpers ──────────────────────────────────────────
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/jwt.php';
require_once __DIR__ . '/helpers/response.php';

// ── Router ────────────────────────────────────────────────────
// URL format: /api.php?route=<resource>&action=<action>&id=<id>
// Or via .htaccess rewrite: /api/pets → ?route=pets
$route  = $_GET['route']  ?? '';
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'];

// Map route → handler file
$routeMap = [
    'auth'            => __DIR__ . '/api/auth.php',
    'pets'            => __DIR__ . '/api/pets.php',
    'adoptions'       => __DIR__ . '/api/adoptions.php',
    'users'           => __DIR__ . '/api/users.php',
    'rescuers'        => __DIR__ . '/api/rescuers.php',
    'contact'         => __DIR__ . '/api/contact.php',
    'donations'       => __DIR__ . '/api/donations.php',
    'notifications'   => __DIR__ . '/api/notifications.php',
    'saved-pets'      => __DIR__ . '/api/saved_pets.php',
    'newsletter'      => __DIR__ . '/api/newsletter.php',
    'admin'           => __DIR__ . '/api/admin.php',
];

if (!$route) {
    // Health check / API info
    jsonOk([
        'name'    => 'Furever Home API',
        'version' => '1.0.0',
        'stack'   => 'PHP + MySQL (PDO)',
        'routes'  => array_keys($routeMap),
    ]);
}

if (!isset($routeMap[$route])) {
    jsonError("Unknown route: $route", 404);
}

require $routeMap[$route];
