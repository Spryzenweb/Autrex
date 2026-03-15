<?php
/**
 * Remote Control - Get Game Status
 * Returns the current game phase/status for a session
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../includes/config.php';
require_once '../../includes/supabase.php';

// Get session code from query parameter
$sessionCode = isset($_GET['sessionCode']) ? strtoupper(trim($_GET['sessionCode'])) : '';

if (empty($sessionCode)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Session code is required'
    ]);
    exit;
}

// Validate session code format
if (!preg_match('/^[A-Z0-9]{6}$/', $sessionCode)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid session code format'
    ]);
    exit;
}

try {
    // Get game status from Supabase
    $supabase = new SupabaseClient();
    
    $response = $supabase->select('game_status', '*', [
        'session_code' => $sessionCode
    ]);
    
    if (isset($response['error']) && $response['error']) {
        throw new Exception($response['message']);
    }
    
    // Check if we got data
    if (empty($response) || !is_array($response)) {
        echo json_encode([
            'success' => true,
            'data' => [
                'session_code' => $sessionCode,
                'game_phase' => 'None',
                'additional_data' => [],
                'updated_at' => date('c')
            ]
        ]);
        exit;
    }
    
    // Return first result
    echo json_encode([
        'success' => true,
        'data' => $response[0] ?? [
            'session_code' => $sessionCode,
            'game_phase' => 'None',
            'additional_data' => [],
            'updated_at' => date('c')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch game status: ' . $e->getMessage()
    ]);
}
