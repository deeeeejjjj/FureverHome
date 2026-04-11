<?php
// ═══════════════════════════════════════════════════
//  db.php — Furever Home Database Connection (PDO)
//  Database: furever_home
// ═══════════════════════════════════════════════════

define('DB_HOST', 'localhost');
define('DB_NAME', 'furever_home');
define('DB_USER', 'root');          // ← change to your MySQL user
define('DB_PASS', '');              // ← change to your MySQL password
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}
