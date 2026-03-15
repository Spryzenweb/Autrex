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
    // GET: Fetch current settings
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $settings = $supabaseAdmin->getAllSettings();
        
        echo json_encode([
            'success' => true,
            'settings' => [
                'app_version' => $settings['app_version'] ?? '1.0.0',
                'download_url_windows' => $settings['download_url_windows'] ?? '',
                'download_url_mac' => $settings['download_url_mac'] ?? '',
                'force_update' => $settings['force_update'] ?? 'false',
                'maintenance_mode' => ($settings['maintenance_mode'] ?? 'false') === 'true'
            ]
        ]);
        exit;
    }
    
    // POST: Update settings
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        if ($action === 'release_update') {
            $version = trim($input['version'] ?? '');
            $releaseNotes = trim($input['release_notes'] ?? '');
            $windowsUrl = trim($input['windows_url'] ?? '');
            $macUrl = trim($input['mac_url'] ?? '');
            $forceUpdate = $input['force_update'] ?? false;
            
            // Validate version format
            if (!preg_match('/^[0-9]+\.[0-9]+\.[0-9]+$/', $version)) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid version format. Use X.Y.Z (e.g., 1.2.3)'
                ]);
                exit;
            }
            
            // Update version
            $result = $supabaseAdmin->setSetting('app_version', $version);
            if (!$result || isset($result['error'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update version'
                ]);
                exit;
            }
            
            // Update Windows URL if provided
            if (!empty($windowsUrl)) {
                $result = $supabaseAdmin->setSetting('download_url_windows', $windowsUrl);
                if (!$result || isset($result['error'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Failed to update Windows download URL'
                    ]);
                    exit;
                }
            }
            
            // Update Mac URL if provided
            if (!empty($macUrl)) {
                $result = $supabaseAdmin->setSetting('download_url_mac', $macUrl);
                if (!$result || isset($result['error'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Failed to update Mac download URL'
                    ]);
                    exit;
                }
            }
            
            // Save release notes if provided
            if (!empty($releaseNotes)) {
                $notesKey = 'release_notes_' . str_replace('.', '_', $version);
                $supabaseAdmin->setSetting($notesKey, $releaseNotes);
            }
            
            // Update force update flag
            $result = $supabaseAdmin->setSetting('force_update', $forceUpdate ? 'true' : 'false');
            if (!$result || isset($result['error'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update force update flag'
                ]);
                exit;
            }
            
            echo json_encode([
                'success' => true,
                'message' => "Version $version published successfully"
            ]);
            exit;
        }
        
        if ($action === 'toggle_maintenance') {
            $enabled = $input['enabled'] ?? false;
            
            $result = $supabaseAdmin->setSetting('maintenance_mode', $enabled ? 'true' : 'false');
            if (!$result || isset($result['error'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update maintenance mode'
                ]);
                exit;
            }
            
            echo json_encode([
                'success' => true,
                'message' => $enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled'
            ]);
            exit;
        }
        
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
        exit;
    }
    
    // Invalid method
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
