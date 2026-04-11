<?php
// api/contact.php
$db = getDB();

if ($method === 'POST') {
    $b = getBody();
    if (empty($b['consent'])) jsonError('You must consent to the privacy policy.');
    if (empty($b['name']) || empty($b['email']) || empty($b['message'])) {
        jsonError('Name, email, and message are required.');
    }
    $db->prepare('INSERT INTO contact_messages (name,email,topic,message,consent) VALUES(?,?,?,?,1)')
       ->execute([trim($b['name']), strtolower(trim($b['email'])), trim($b['topic'] ?? ''), trim($b['message'])]);
    jsonOk(['message' => 'Message sent! We will get back to you soon.']);
}

jsonError("Unknown contact request.", 404);
