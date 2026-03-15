<?php
// Admin authentication check
// This file should be included at the top of all admin pages

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user']) || !isset($_SESSION['access_token'])) {
    header('Location: /admin-login.php');
    exit;
}

// Optional: Add admin role check here if you have role-based access
// For now, any authenticated user can access admin panel
// You can add admin role check in the future

// Set current user for easy access
function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}
