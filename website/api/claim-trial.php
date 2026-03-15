<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/supabase.php';

header('Content-Type: application/json');

// Require authentication
if (!isAuthenticated()) {
    jsonResponse(['success' => false, 'message' => 'Authentication required'], 401);
}

$user = getCurrentUser();
$userId = $user['id'];

try {
    // Check if user already claimed trial
    $existingClaim = $supabase->select('trial_claims', '*', ['user_id' => $userId]);
    
    if (!empty($existingClaim) && is_array($existingClaim)) {
        jsonResponse([
            'success' => false,
            'message' => __('messages.trial_already_claimed')
        ], 400);
    }
    
    // Generate unique license key
    $licenseKey = 'TRIAL-' . strtoupper(bin2hex(random_bytes(8)));
    
    // Calculate expiration (24 hours from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Create trial license
    $licenseData = [
        'license_key' => $licenseKey,
        'type' => 'trial',
        'status' => 'active',
        'max_activations' => 1,
        'current_activations' => 0,
        'expires_at' => $expiresAt,
        'notes' => 'Auto-generated trial license for user: ' . $user['email']
    ];
    
    $license = $supabase->insert('licenses', $licenseData);
    
    if (isset($license['error'])) {
        jsonResponse([
            'success' => false,
            'message' => 'Failed to create license'
        ], 500);
    }
    
    $licenseId = is_array($license) && isset($license[0]['id']) ? $license[0]['id'] : null;
    
    if (!$licenseId) {
        jsonResponse([
            'success' => false,
            'message' => 'Failed to get license ID'
        ], 500);
    }
    
    // Record trial claim
    $claimData = [
        'user_id' => $userId,
        'license_id' => $licenseId
    ];
    
    $supabase->insert('trial_claims', $claimData);
    
    // Link license to user
    $userLicenseData = [
        'user_id' => $userId,
        'license_id' => $licenseId
    ];
    
    $supabase->insert('user_licenses', $userLicenseData);
    
    jsonResponse([
        'success' => true,
        'message' => __('messages.trial_claimed'),
        'license' => [
            'key' => $licenseKey,
            'expires_at' => $expiresAt
        ]
    ]);
    
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ], 500);
}
