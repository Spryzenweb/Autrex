<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/supabase-admin.php';

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
    echo json_encode(['success' => false, 'error' => 'Unauthorized - Please login as admin']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {
    switch ($action) {
        case 'create':
            $type = $input['type'] ?? 'trial';
            $maxActivations = intval($input['max_activations'] ?? 1);
            $notes = $input['notes'] ?? null;
            
            $result = $supabaseAdmin->createLicense($type, $maxActivations, $notes);
            
            if ($result && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'license' => $result,
                    'message' => 'License created successfully'
                ]);
            } else {
                throw new Exception($result['message'] ?? 'Failed to create license');
            }
            break;
            
        case 'bulk_create':
            $type = $input['type'] ?? 'trial';
            $count = min(intval($input['count'] ?? 10), 100);
            
            $created = 0;
            $failed = 0;
            
            for ($i = 0; $i < $count; $i++) {
                $result = $supabaseAdmin->createLicense($type, 1, "Bulk creation");
                if ($result && !isset($result['error'])) {
                    $created++;
                } else {
                    $failed++;
                }
            }
            
            echo json_encode([
                'success' => true,
                'created' => $created,
                'failed' => $failed,
                'message' => "Created $created licenses" . ($failed > 0 ? ", $failed failed" : '')
            ]);
            break;
            
        case 'update_status':
            $licenseId = $input['license_id'] ?? '';
            $isActive = $input['status'] ?? false;
            
            if (empty($licenseId)) {
                throw new Exception('License ID is required');
            }
            
            $result = $supabaseAdmin->update('licenses', ['is_active' => $isActive], ['id' => $licenseId]);
            
            if ($result && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'License status updated'
                ]);
            } else {
                throw new Exception('Failed to update status');
            }
            break;
            
        case 'delete':
            $licenseId = $input['license_id'] ?? '';
            
            if (empty($licenseId)) {
                throw new Exception('License ID is required');
            }
            
            $result = $supabaseAdmin->delete('licenses', ['id' => $licenseId]);
            
            if ($result && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'License deleted'
                ]);
            } else {
                throw new Exception('Failed to delete license');
            }
            break;
            
        case 'assign':
            $licenseId = $input['license_id'] ?? '';
            $userId = $input['user_id'] ?? '';
            
            if (empty($licenseId) || empty($userId)) {
                throw new Exception('License ID and User ID are required');
            }
            
            $result = $supabaseAdmin->assignLicenseToUser($licenseId, $userId);
            
            if ($result && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'License assigned to user'
                ]);
            } else {
                throw new Exception($result['message'] ?? 'Failed to assign license');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
