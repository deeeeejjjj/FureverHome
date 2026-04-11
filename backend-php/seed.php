<?php
/**
 * seed.php — Furever Home Database Seeder
 * Run ONCE after importing database.sql to set proper password hashes.
 * Usage: php seed.php  OR  visit http://your-server/backend-php/seed.php
 * DELETE this file after seeding for security!
 */

require_once __DIR__ . '/config/db.php';

$db = getDB();

$adminHash = password_hash('Admin@123', PASSWORD_BCRYPT, ['cost' => 11]);
$userHash  = password_hash('User@123',  PASSWORD_BCRYPT, ['cost' => 11]);

// Update admin user
$db->prepare("UPDATE users SET password_hash=? WHERE email='admin@fureverhome.ph'")
   ->execute([$adminHash]);

// Update demo user
$db->prepare("UPDATE users SET password_hash=? WHERE email='maria@fureverhome.ph'")
   ->execute([$userHash]);

echo json_encode([
    'status'  => 'ok',
    'message' => 'Passwords set. Delete this file now!',
    'accounts'=> [
        ['email'=>'admin@fureverhome.ph', 'password'=>'Admin@123', 'role'=>'admin'],
        ['email'=>'maria@fureverhome.ph', 'password'=>'User@123',  'role'=>'user'],
    ]
]);
