<?php
require_once __DIR__ . '/config.php';

/**
 * Load language file
 */
function loadLanguage($lang = null) {
    if ($lang === null) {
        $lang = $_SESSION['lang'] ?? DEFAULT_LANG;
    }
    
    $langFile = __DIR__ . '/../lang/' . $lang . '.php';
    if (file_exists($langFile)) {
        return include $langFile;
    }
    
    return [];
}

/**
 * Get translation
 */
function __($key, $lang = null) {
    static $translations = null;
    
    if ($translations === null || $lang !== null) {
        $translations = loadLanguage($lang);
    }
    
    $keys = explode('.', $key);
    $value = $translations;
    
    foreach ($keys as $k) {
        if (!isset($value[$k])) {
            return $key;
        }
        $value = $value[$k];
    }
    
    return $value;
}

/**
 * Escape HTML (null-safe)
 */
function e($string) {
    if ($string === null) {
        return '';
    }
    return htmlspecialchars((string)$string, ENT_QUOTES, 'UTF-8');
}

/**
 * Redirect to URL
 */
function redirect($url) {
    header('Location: ' . $url);
    exit;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['user']) && isset($_SESSION['access_token']);
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        redirect('/user-login.php');
    }
}

/**
 * Require admin authentication
 */
function requireAdmin() {
    if (!isAuthenticated()) {
        redirect('/admin/login.php');
    }
    
    $user = getCurrentUser();
    
    // Check multiple places for admin flag
    $isAdmin = false;
    
    // Check in user metadata
    if (isset($user['user_metadata']['is_admin']) && $user['user_metadata']['is_admin']) {
        $isAdmin = true;
    }
    
    // Check in raw_user_meta_data
    if (isset($user['raw_user_meta_data']['is_admin']) && $user['raw_user_meta_data']['is_admin']) {
        $isAdmin = true;
    }
    
    // Check in app_metadata
    if (isset($user['app_metadata']['is_admin']) && $user['app_metadata']['is_admin']) {
        $isAdmin = true;
    }
    
    // Check direct property
    if (isset($user['is_admin']) && $user['is_admin']) {
        $isAdmin = true;
    }
    
    // Fallback: Check if email is in admin list (for initial setup)
    $adminEmails = [
        'admin@autrex.com', 
        'kesug@kesug.com',
        'spryzensc@gmail.com'
    ];
    if (isset($user['email']) && in_array($user['email'], $adminEmails)) {
        $isAdmin = true;
    }
    
    if (!$isAdmin) {
        // Debug: Log user data to see structure
        error_log("User trying to access admin: " . json_encode($user));
        setFlash('Bu sayfaya erişim yetkiniz yok', 'error');
        redirect('/user/dashboard.php');
    }
}

/**
 * Format currency
 */
function formatCurrency($amount, $currency = 'TRY') {
    if ($currency === 'TRY') {
        return '₺' . number_format($amount, 2, ',', '.');
    } else if ($currency === 'USD') {
        return '$' . number_format($amount, 2, '.', ',');
    }
    return number_format($amount, 2);
}

/**
 * Format date
 */
function formatDate($date, $format = 'd.m.Y H:i') {
    return date($format, strtotime($date));
}

/**
 * Get current URL
 */
function currentUrl() {
    return $_SERVER['REQUEST_URI'];
}

/**
 * Check if current page is active
 */
function isActive($page) {
    return strpos(currentUrl(), $page) !== false ? 'active' : '';
}

/**
 * Generate CSRF token
 */
function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Set flash message
 */
function setFlash($type, $message) {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

/**
 * Get and clear flash message
 */
function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

/**
 * JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Ensure timestamp is in ISO 8601 format for JavaScript
 * JavaScript will automatically convert UTC to local timezone
 */
function ensureIsoFormat($timestamp) {
    if (!$timestamp) return null;
    
    // Parse as UTC timestamp
    $dt = new DateTime($timestamp, new DateTimeZone('UTC'));
    
    // Return in ISO format (JavaScript will handle timezone conversion)
    return $dt->format('Y-m-d\TH:i:s\Z');
}

/**
 * Check if site is in maintenance mode
 */
function checkMaintenanceMode() {
    global $supabaseAdmin;
    
    // Skip if supabaseAdmin not initialized yet
    if (!isset($supabaseAdmin) || $supabaseAdmin === null) {
        return;
    }
    
    // Skip check for admin users
    if (isset($_SESSION['user']) && isset($_SESSION['user']['is_admin']) && $_SESSION['user']['is_admin']) {
        return;
    }
    
    // Skip check for admin pages
    $currentPath = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($currentPath, '/admin/') !== false) {
        return;
    }
    
    // Check maintenance mode setting
    $maintenanceMode = $supabaseAdmin->getSetting('maintenance_mode');
    
    if ($maintenanceMode === 'true') {
        // Show maintenance page
        http_response_code(503);
        include __DIR__ . '/../maintenance.php';
        exit;
    }
}
