<?php
/* ═══════════════════════════════════════════════
   donate_submit.php — Furever Home
   Handles donation form submissions:
   - Validates input
   - Saves to donations table
   - Moves uploaded receipt file
   - Returns JSON response
   ═══════════════════════════════════════════════ */

header('Content-Type: application/json');

/* ── DB Config ── Edit these to match your server ── */
define('DB_HOST', 'localhost');
define('DB_NAME', 'fureverhome');
define('DB_USER', 'root');
define('DB_PASS', '');

/* ── Upload config ── */
define('UPLOAD_DIR', __DIR__ . '/uploads/receipts/');
define('UPLOAD_MAX_MB', 5);
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

/* ── Helpers ── */
function respond(bool $success, string $message = '', array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function generateReference(): string {
    return 'FH-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
}

/* ── Only accept POST ── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

/* ── Required fields ── */
$required = ['donor_first', 'donor_last', 'donor_email', 'amount', 'method'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        respond(false, "Missing required field: {$field}.");
    }
}

/* ── Sanitize inputs ── */
$donorFirst  = sanitize($_POST['donor_first']);
$donorLast   = sanitize($_POST['donor_last']);
$donorEmail  = filter_var(trim($_POST['donor_email']), FILTER_VALIDATE_EMAIL);
$donorPhone  = sanitize($_POST['donor_phone']  ?? '');
$donorMuni   = sanitize($_POST['donor_muni']   ?? '');
$message     = sanitize($_POST['message']      ?? '');
$anonymous   = (int) ($_POST['anonymous']      ?? 0);
$method      = sanitize($_POST['method']);
$reference   = sanitize($_POST['reference']    ?? '');
$cashDate    = sanitize($_POST['cash_date']    ?? '');
$cashShelter = sanitize($_POST['cash_shelter'] ?? '');

/* ── Validate email ── */
if (!$donorEmail) {
    respond(false, 'Invalid email address.');
}

/* ── Validate amount ── */
$amount = (float) $_POST['amount'];
if ($amount < 1) {
    respond(false, 'Donation amount must be at least ₱1.');
}

/* ── Validate method ── */
$allowedMethods = ['gcash', 'paymaya', 'bank', 'cash'];
if (!in_array($method, $allowedMethods, true)) {
    respond(false, 'Invalid payment method.');
}

/* ── Handle receipt upload ── */
$receiptPath = null;

if (in_array($method, ['gcash', 'paymaya', 'bank']) && isset($_FILES['receipt']) && $_FILES['receipt']['error'] === UPLOAD_ERR_OK) {
    $file     = $_FILES['receipt'];
    $fileMime = mime_content_type($file['tmp_name']);
    $fileSize = $file['size'];

    if (!in_array($fileMime, ALLOWED_TYPES)) {
        respond(false, 'Invalid file type. Please upload a JPG, PNG, WEBP, or PDF.');
    }
    if ($fileSize > UPLOAD_MAX_MB * 1024 * 1024) {
        respond(false, "File too large. Maximum size is " . UPLOAD_MAX_MB . "MB.");
    }

    // Create upload directory if it doesn't exist
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    $ext         = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeExt     = in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'webp', 'pdf']) ? strtolower($ext) : 'jpg';
    $filename    = generateReference() . '_' . time() . '.' . $safeExt;
    $destination = UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respond(false, 'Failed to save receipt. Please try again.');
    }

    $receiptPath = 'uploads/receipts/' . $filename;
}

/* ── Generate reference ── */
$donationRef = generateReference();

/* ── Save to DB ── */
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    $sql = 'INSERT INTO donations (
                reference, donor_first, donor_last, donor_email,
                donor_phone, donor_municipality, message,
                anonymous, amount, method,
                gcash_ref, bank_ref, cash_date, cash_shelter,
                receipt_path, status, created_at
            ) VALUES (
                :reference, :donor_first, :donor_last, :donor_email,
                :donor_phone, :donor_muni, :message,
                :anonymous, :amount, :method,
                :gcash_ref, :bank_ref, :cash_date, :cash_shelter,
                :receipt_path, :status, NOW()
            )';

    // For gcash/paymaya both stored as gcash_ref, or use bank_ref for bank
    $gcashRef = in_array($method, ['gcash', 'paymaya']) ? $reference : null;
    $bankRef  = ($method === 'bank') ? $reference : null;

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':reference'    => $donationRef,
        ':donor_first'  => $donorFirst,
        ':donor_last'   => $donorLast,
        ':donor_email'  => $donorEmail,
        ':donor_phone'  => $donorPhone,
        ':donor_muni'   => $donorMuni,
        ':message'      => $message,
        ':anonymous'    => $anonymous,
        ':amount'       => $amount,
        ':method'       => $method,
        ':gcash_ref'    => $gcashRef,
        ':bank_ref'     => $bankRef,
        ':cash_date'    => $cashDate ?: null,
        ':cash_shelter' => $cashShelter ?: null,
        ':receipt_path' => $receiptPath,
        ':status'       => 'pending',
    ]);

    /* ── Optional: send confirmation email ── */
    // You can use PHPMailer here. Example stub:
    // sendConfirmationEmail($donorEmail, $donorFirst, $donationRef, $amount, $method);

    respond(true, 'Donation submitted successfully.', ['reference' => $donationRef]);

} catch (PDOException $e) {
    // Log error privately, return generic message
    error_log('[FureverHome Donation Error] ' . $e->getMessage());
    respond(false, 'Database error. Please try again or contact support.');
}
