<?php
// Direct configuration (without .env file)
// Use this if .env file loading doesn't work on your server

// Application Configuration
define('APP_NAME', 'Autrex');
define('APP_URL', 'https://autrex.kesug.com');
define('DEFAULT_LANG', 'tr');

// Supabase Configuration - HARDCODED (for testing)
define('SUPABASE_URL', 'https://czlahmuvhlcdxgmtarja.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzYzMjcsImV4cCI6MjA3NjExMjMyN30.tVDtK9b7pdzuGqR8g9qdwA-Ob4b0lMYLma_J-A4sEQI');
define('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzYzMjcsImV4cCI6MjA3NjExMjMyN30.tVDtK9b7pdzuGqR8g9qdwA-Ob4b0lMYLma_J-A4sEQI');

// Session Configuration
define('SESSION_LIFETIME', 7200);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
    session_start();
}

// Set default language
if (!isset($_SESSION['lang'])) {
    $_SESSION['lang'] = DEFAULT_LANG;
}

// Timezone
date_default_timezone_set('Europe/Istanbul');
