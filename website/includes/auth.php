<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';
require_once __DIR__ . '/functions.php';

/**
 * Login user
 */
function login($email, $password, $isAdminLogin = false) {
    global $supabase;
    
    $result = $supabase->signIn($email, $password);
    
    if (isset($result['error'])) {
        $errorMessage = $result['error']['message'] ?? '';
        $errorCode = $result['error']['code'] ?? '';
        
        // Debug: Log the actual error for troubleshooting
        error_log("Login error - Message: " . $errorMessage . ", Code: " . $errorCode);
        error_log("Full error: " . json_encode($result['error']));
        
        // Check if email is not confirmed
        if (strpos($errorMessage, 'Email not confirmed') !== false || 
            strpos($errorMessage, 'email_not_confirmed') !== false ||
            $errorCode === 'email_not_confirmed') {
            
            // Different message for admin login
            if ($isAdminLogin) {
                return [
                    'success' => false, 
                    'message' => __('messages.admin_email_not_confirmed') ?? 'Admin hesabınız için email onayı gerekiyor. Lütfen sistem yöneticisi ile iletişime geçin.'
                ];
            }
            
            return [
                'success' => false, 
                'message' => __('messages.email_not_confirmed') ?? 'Lütfen email adresinizi onaylayın. Kayıt olurken gönderilen onay linkine tıklayın.'
            ];
        }
        
        // Generic error message for other cases
        // Temporarily show actual error for debugging
        $debugMessage = $errorMessage ?: (__('messages.login_error') ?? 'Geçersiz email veya şifre');
        return [
            'success' => false, 
            'message' => $debugMessage . ' (Code: ' . $errorCode . ')'
        ];
    }
    
    $_SESSION['user'] = $result['user'];
    $_SESSION['access_token'] = $result['access_token'];
    $_SESSION['refresh_token'] = $result['refresh_token'];
    
    return ['success' => true];
}

/**
 * Logout user
 */
function logout() {
    unset($_SESSION['user']);
    unset($_SESSION['access_token']);
    unset($_SESSION['refresh_token']);
    session_destroy();
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user']) && isset($_SESSION['access_token']);
}

/**
 * Get current user
 */
function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}

/**
 * Get access token
 */
function getAccessToken() {
    return $_SESSION['access_token'] ?? null;
}
