<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/supabase-admin.php';

// Check admin authentication
session_start();

// Check both old and new admin authentication methods
$isAdminAuthenticated = false;

// Method 1: New admin_logged_in flag
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $isAdminAuthenticated = true;
}

// Method 2: Old user-based authentication with admin check
if (!$isAdminAuthenticated && isset($_SESSION['user']) && isset($_SESSION['access_token'])) {
    $user = $_SESSION['user'];
    
    // Check if user is admin
    $isAdmin = false;
    if (isset($user['user_metadata']['is_admin']) && $user['user_metadata']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['raw_user_meta_data']['is_admin']) && $user['raw_user_meta_data']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['app_metadata']['is_admin']) && $user['app_metadata']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['is_admin']) && $user['is_admin']) {
        $isAdmin = true;
    }
    
    // Check admin email list
    $adminEmails = ['admin@autrex.com', 'kesug@kesug.com', 'spryzensc@gmail.com'];
    if (isset($user['email']) && in_array($user['email'], $adminEmails)) {
        $isAdmin = true;
    }
    
    if ($isAdmin) {
        $isAdminAuthenticated = true;
        // Set the new flag for consistency
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $user['email'] ?? 'admin@autrex.com';
    }
}

if (!$isAdminAuthenticated) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized - Please login as admin'
    ]);
    exit;
}

try {
    // Fetch all data in parallel for better performance
    $licenses = $supabaseAdmin->select('licenses', '*', [], 'created_at.desc', 1000);
    $users = $supabaseAdmin->getAuthUsers();
    $activations = $supabaseAdmin->select('activations', '*', [], 'created_at.desc', 100);
    $userLicenses = $supabaseAdmin->select('user_licenses', '*', []);
    
    // Ensure arrays
    if (!is_array($licenses)) $licenses = [];
    if (!is_array($users)) $users = [];
    if (!is_array($activations)) $activations = [];
    if (!is_array($userLicenses)) $userLicenses = [];
    
    // Add owner email to licenses
    foreach ($licenses as &$license) {
        $license['owner_email'] = null;
        $license['owner_id'] = null;
        
        // Find owner from user_licenses
        foreach ($userLicenses as $ul) {
            if ($ul['license_id'] === $license['id']) {
                $license['owner_id'] = $ul['user_id'];
                
                // Find user email
                foreach ($users as $user) {
                    if ($user['id'] === $ul['user_id']) {
                        $license['owner_email'] = $user['email'];
                        break;
                    }
                }
                break;
            }
        }
    }
    unset($license);
    
    // Calculate stats
    $activeLicenses = array_filter($licenses, function($l) {
        return ($l['is_active'] ?? false) === true;
    });
    
    $expiredLicenses = array_filter($licenses, function($l) {
        if (!isset($l['expires_at'])) return false;
        return strtotime($l['expires_at']) < time();
    });
    
    $stats = [
        'total_licenses' => count($licenses),
        'active_licenses' => count($activeLicenses),
        'expired_licenses' => count($expiredLicenses),
        'inactive_licenses' => count($licenses) - count($activeLicenses),
        'total_users' => count($users),
        'total_activations' => count($activations),
        'recent_activations' => count(array_filter($activations, function($a) {
            return strtotime($a['created_at'] ?? '') > strtotime('-24 hours');
        }))
    ];
    
    // Get license type breakdown
    $licenseTypes = [];
    foreach ($licenses as $license) {
        $type = $license['type'] ?? 'unknown';
        if (!isset($licenseTypes[$type])) {
            $licenseTypes[$type] = 0;
        }
        $licenseTypes[$type]++;
    }
    
    // Get recent activations (last 10)
    $recentActivations = array_slice($activations, 0, 10);
    
    // Response
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'license_types' => $licenseTypes,
        'licenses' => $licenses,
        'users' => $users,
        'activations' => $recentActivations,
        'timestamp' => time()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch data: ' . $e->getMessage()
    ]);
}
