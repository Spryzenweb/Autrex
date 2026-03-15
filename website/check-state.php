<?php
// Check if champ select state exists for a session
require_once 'includes/config.php';
require_once 'includes/supabase.php';

header('Content-Type: application/json');

$sessionCode = $_GET['code'] ?? '';

if (empty($sessionCode)) {
    echo json_encode(['error' => 'Session code required']);
    exit;
}

// Check session
$session = $supabase->select('remote_sessions', '*', ['session_code' => $sessionCode]);

// Check state
$state = $supabase->select('champ_select_state', '*', ['session_code' => $sessionCode]);

echo json_encode([
    'session_code' => $sessionCode,
    'session_exists' => !empty($session) && !isset($session['error']),
    'session_data' => $session,
    'state_exists' => !empty($state) && !isset($state['error']),
    'state_data' => $state
], JSON_PRETTY_PRINT);
