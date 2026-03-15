<?php
// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        error_log("ENV FILE NOT FOUND: " . $path);
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Skip lines without =
        if (strpos($line, '=') === false) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
            $value = $matches[2];
        }
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            putenv("$name=$value"); // Also set in putenv for compatibility
        }
    }
}

// Try multiple possible .env locations
$envPaths = [
    __DIR__ . '/../.env',
    $_SERVER['DOCUMENT_ROOT'] . '/.env'
];

$envLoaded = false;
foreach ($envPaths as $envPath) {
    // Use @ to suppress open_basedir warnings on shared hosting
    if (@file_exists($envPath)) {
        loadEnv($envPath);
        $envLoaded = true;
        break;
    }
}

// Note: On Infinity Free and similar shared hosting, .env files may not be accessible
// due to open_basedir restrictions. Fallback values are defined below.

// Application Configuration
define('APP_NAME', $_ENV['APP_NAME'] ?? 'Autrex');
define('APP_URL', $_ENV['APP_URL'] ?? 'http://localhost');
define('DEFAULT_LANG', $_ENV['DEFAULT_LANG'] ?? 'tr');

// Supabase Configuration
// Fallback to hardcoded values if .env not loaded (for production)
define('SUPABASE_URL', $_ENV['SUPABASE_URL'] ?? getenv('SUPABASE_URL') ?: 'https://czlahmuvhlcdxgmtarja.supabase.co');
define('SUPABASE_ANON_KEY', $_ENV['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzYzMjcsImV4cCI6MjA3NjExMjMyN30.tVDtK9b7pdzuGqR8g9qdwA-Ob4b0lMYLma_J-A4sEQI');
define('SUPABASE_SERVICE_ROLE_KEY', $_ENV['SUPABASE_SERVICE_ROLE_KEY'] ?? getenv('SUPABASE_SERVICE_ROLE_KEY') ?: ($_ENV['SUPABASE_KEY'] ?? getenv('SUPABASE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUzNjMyNywiZXhwIjoyMDc2MTEyMzI3fQ.wmSSa1z2VAwp9T8vCI87hR-Vx0SgjYgDkyHayBUZYhk'));

// Debug: Log if Supabase config is missing (only in development)
if (empty(SUPABASE_URL) || empty(SUPABASE_ANON_KEY)) {
    error_log('WARNING: Supabase configuration is missing or incomplete');
}

// Session Configuration
define('SESSION_LIFETIME', $_ENV['SESSION_LIFETIME'] ?? 7200);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
    session_start();
}

// Set default language
if (!isset($_SESSION['lang'])) {
    $_SESSION['lang'] = DEFAULT_LANG;
}

// Timezone - Use Europe/Istanbul for Turkey
// Database stores in UTC, but PHP needs local timezone for correct display
date_default_timezone_set('Europe/Istanbul');
