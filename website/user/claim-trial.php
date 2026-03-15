<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

requireAuth();

$user = getCurrentUser();
$userId = $user['id'];

// Check if user already claimed trial
$existingClaim = $supabaseAdmin->select('trial_claims', '*', ['user_id' => $userId]);

if (!empty($existingClaim) && is_array($existingClaim)) {
    // JSON response for AJAX
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Bu özellikten yalnızca 1 kere faydalanabilirsiniz. Zaten deneme lisansınızı aldınız.'
        ]);
        exit;
    }
    
    setFlash(__('messages.trial_already_claimed'), 'error');
    redirect('/user/dashboard.php');
}

// Generate trial license key with proper format and checksum
function generateLicenseKey($type = 'TRIAL') {
    $productCodes = [
        'REGULAR' => 'AUTR',
        'DAILY' => 'AUTD',
        'WEEKLY' => 'AUTW',
        'MONTHLY' => 'AUTM',
        'TRIAL' => 'AUTT'
    ];
    
    $productCode = $productCodes[$type] ?? 'AUTT';
    
    // Generate unique ID (8 characters)
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $uniqueId = '';
    for ($i = 0; $i < 8; $i++) {
        $uniqueId .= $chars[rand(0, strlen($chars) - 1)];
    }
    
    // Calculate checksum (MD5 first 4 chars)
    $data = $productCode . $uniqueId;
    $checksum = strtoupper(substr(md5($data), 0, 4));
    
    // Format: XXXX-XXXX-XXXX-XXXX
    return "$productCode-" . substr($uniqueId, 0, 4) . "-" . substr($uniqueId, 4, 4) . "-$checksum";
}

$licenseKey = generateLicenseKey('TRIAL');

// Get trial duration from settings
$trialDurationHours = intval($supabaseAdmin->getSetting('trial_duration_hours') ?: 6);

// Create trial license - Gerçek kolon isimleri
$licenseData = [
    'key' => $licenseKey,  // NOT license_key!
    'type' => 'TRIAL',  // BÜYÜK HARF!
    'is_active' => true,  // NOT status!
    'activation_count' => 0,  // NOT current_activations!
    'expires_at' => null,  // Başlangıçta null, aktivasyon sonrası set edilecek
    'metadata' => json_encode([
        'notes' => 'Trial license - Auto generated',
        'max_activations' => 1,
        'duration_hours' => $trialDurationHours
    ])
];

$license = $supabaseAdmin->insert('licenses', $licenseData);

if (!$license || !isset($license['id'])) {
    error_log("Failed to create license: " . print_r($license, true));
    
    // JSON response for AJAX
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Lisans oluşturulamadı']);
        exit;
    }
    
    setFlash('Lisans oluşturulamadı. Lütfen tekrar deneyin.', 'error');
    redirect('/user/dashboard.php');
}

$licenseId = $license['id'];

// Link license to user
$userLicenseData = [
    'user_id' => $userId,
    'license_id' => $licenseId
];

$supabaseAdmin->insert('user_licenses', $userLicenseData);

// Record trial claim
$trialClaimData = [
    'user_id' => $userId,
    'license_id' => $licenseId
];

$supabaseAdmin->insert('trial_claims', $trialClaimData);

// JSON response for AJAX
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Deneme lisansınız başarıyla oluşturuldu!',
        'licenseKey' => $licenseKey
    ]);
    exit;
}

setFlash(__('messages.trial_claimed'), 'success');
redirect('/user/licenses.php');
