<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

// Check maintenance mode
checkMaintenanceMode();

// If already logged in, redirect to dashboard
if (isAuthenticated()) {
    redirect('/user/dashboard.php');
}

// Handle password reset request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Invalid request');
        redirect('/forgot-password.php');
    }
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        setFlash('error', __('validation.email_invalid') ?? 'Geçerli bir email girin');
    } else {
        // Send password reset email via Supabase
        $url = SUPABASE_URL . '/auth/v1/recover';
        
        $headers = [
            'apikey: ' . SUPABASE_ANON_KEY,
            'Content-Type: application/json'
        ];
        
        $data = [
            'email' => $email,
            'options' => [
                'redirectTo' => APP_URL . '/reset-password.php'
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Always show success message for security (don't reveal if email exists)
        setFlash('success', __('auth.reset_email_sent'));
        redirect('/forgot-password.php');
    }
}

$pageTitle = __('auth.reset_password_title') . ' - Autrex';
?>

<!DOCTYPE html>
<html lang="<?php echo $_SESSION['lang'] ?? 'tr'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    </style>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            500: '#8b5cf6',
                            600: '#7c3aed',
                            700: '#6d28d9',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
            <a href="/" class="inline-block">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span class="text-4xl font-black text-white">A</span>
                </div>
            </a>
        </div>
        
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                </div>
                <h2 class="text-3xl font-black text-gray-900 mb-2"><?php echo __('auth.reset_password_title'); ?></h2>
                <p class="text-gray-600">
                    <?php echo __('auth.reset_password_desc'); ?>
                </p>
            </div>
            
            <!-- Flash Messages -->
            <?php $flash = getFlash(); if ($flash): ?>
            <div class="mb-6 rounded-xl p-4 <?php echo $flash['type'] === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' : 'bg-red-50 border-2 border-red-200 text-red-800'; ?>">
                <div class="flex items-center">
                    <span class="text-2xl mr-3"><?php echo $flash['type'] === 'success' ? '✓' : '⚠'; ?></span>
                    <span class="font-semibold"><?php echo e($flash['message']); ?></span>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Password Reset Form -->
            <form method="POST" action="/forgot-password.php" class="space-y-6">
                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                
                <div class="relative">
                    <label for="email" class="block text-sm font-bold text-gray-700 mb-2">
                        <?php echo __('auth.email'); ?>
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                            </svg>
                        </div>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required
                            class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                            placeholder="<?php echo $_SESSION['lang'] === 'tr' ? 'ornek@email.com' : 'example@email.com'; ?>"
                        >
                    </div>
                </div>
                
                <button 
                    type="submit"
                    class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                    <?php echo __('auth.send_reset_link'); ?>
                </button>
            </form>
            
            <!-- Footer Links -->
            <div class="mt-8 text-center space-y-3">
                <a href="/user-login.php" class="block text-sm text-purple-600 hover:text-purple-700 font-bold">
                    ← <?php echo __('auth.back_to_login'); ?>
                </a>
                <a href="/" class="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                    <?php echo __('auth.back_to_home'); ?>
                </a>
                <div class="flex items-center justify-center space-x-3 pt-4 border-t border-gray-200">
                    <a href="?lang=tr" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'tr' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                        TR
                    </a>
                    <a href="?lang=en" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'en' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                        EN
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
