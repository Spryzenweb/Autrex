<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

// Check maintenance mode
checkMaintenanceMode();

// Get access token from URL (sent by Supabase in email link)
$accessToken = $_GET['access_token'] ?? $_GET['token'] ?? '';
$type = $_GET['type'] ?? '';

// Handle password reset submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $token = $_POST['access_token'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Invalid request');
        redirect('/reset-password.php?access_token=' . urlencode($token));
    }
    
    // Validate input
    $errors = [];
    if (empty($password)) $errors[] = __('validation.password_required') ?? 'Şifre gerekli';
    if (strlen($password) < 8) $errors[] = __('validation.password_min') ?? 'Şifre en az 8 karakter olmalı';
    if ($password !== $confirmPassword) $errors[] = __('validation.password_mismatch') ?? 'Şifreler eşleşmiyor';
    if (empty($token)) $errors[] = 'Geçersiz sıfırlama linki';
    
    if (empty($errors)) {
        // Update password via Supabase
        $url = SUPABASE_URL . '/auth/v1/user';
        
        $headers = [
            'apikey: ' . SUPABASE_ANON_KEY,
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ];
        
        $data = [
            'password' => $password
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            setFlash('success', __('messages.password_reset_success') ?? 'Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.');
            redirect('/user-login.php');
        } else {
            $error = json_decode($response, true);
            setFlash('error', $error['error_description'] ?? $error['msg'] ?? 'Şifre güncellenemedi. Link süresi dolmuş olabilir.');
            redirect('/reset-password.php?access_token=' . urlencode($token));
        }
    } else {
        setFlash('error', implode(', ', $errors));
    }
}

// Check if we have a valid token
if (empty($accessToken)) {
    setFlash('error', 'Geçersiz veya süresi dolmuş şifre sıfırlama linki. Lütfen tekrar deneyin.');
    redirect('/forgot-password.php');
}

$pageTitle = __('auth.reset_password') . ' - Autrex';
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
        
        .password-requirement {
            transition: all 0.3s ease;
        }
        
        .password-requirement.met {
            color: #10b981;
        }
        
        .password-requirement.met svg {
            color: #10b981;
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
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h2 class="text-3xl font-black text-gray-900 mb-2"><?php echo __('auth.reset_password'); ?></h2>
                <p class="text-gray-600">
                    <?php echo __('auth.enter_new_password') ?? 'Yeni şifrenizi girin'; ?>
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
            <form method="POST" action="/reset-password.php" class="space-y-6">
                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                <input type="hidden" name="access_token" value="<?php echo e($accessToken); ?>">
                
                <div class="relative">
                    <label for="password" class="block text-sm font-bold text-gray-700 mb-2">
                        <?php echo __('auth.new_password') ?? 'Yeni Şifre'; ?>
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            minlength="8"
                            oninput="checkPasswordRequirements()"
                            class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                            placeholder="••••••••"
                        >
                    </div>
                    
                    <!-- Password Requirements -->
                    <div class="mt-3 space-y-2 text-sm">
                        <div id="req-length" class="password-requirement flex items-center text-gray-500">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>En az 8 karakter</span>
                        </div>
                    </div>
                </div>
                
                <div class="relative">
                    <label for="confirm_password" class="block text-sm font-bold text-gray-700 mb-2">
                        <?php echo __('auth.password_confirm'); ?>
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            required
                            minlength="8"
                            class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                            placeholder="••••••••"
                        >
                    </div>
                </div>
                
                <button 
                    type="submit"
                    class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                    <?php echo __('auth.reset_password'); ?>
                </button>
            </form>
            
            <!-- Footer Links -->
            <div class="mt-8 text-center space-y-3">
                <a href="/user-login.php" class="block text-sm text-purple-600 hover:text-purple-700 font-bold">
                    ← <?php echo __('auth.back_to_login'); ?>
                </a>
                <div class="flex items-center justify-center space-x-3 pt-4 border-t border-gray-200">
                    <a href="?lang=tr&access_token=<?php echo urlencode($accessToken); ?>" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'tr' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                        TR
                    </a>
                    <a href="?lang=en&access_token=<?php echo urlencode($accessToken); ?>" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'en' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                        EN
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    function checkPasswordRequirements() {
        const password = document.getElementById('password').value;
        const reqLength = document.getElementById('req-length');
        
        if (password.length >= 8) {
            reqLength.classList.add('met');
        } else {
            reqLength.classList.remove('met');
        }
    }
    </script>
</body>
</html>
