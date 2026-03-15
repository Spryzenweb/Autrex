<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/supabase-admin.php';

// Check maintenance mode
checkMaintenanceMode();

// If already logged in, redirect to dashboard
if (isAuthenticated()) {
    redirect('/user/dashboard.php');
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Invalid request');
        redirect('/user-login.php');
    }
    
    // Validate input
    if (empty($email) || empty($password)) {
        setFlash('error', 'Email ve şifre gerekli');
    } else {
        // Attempt login
        $result = login($email, $password);
        
        if ($result['success']) {
            setFlash('success', 'Giriş başarılı!');
            redirect('/user/dashboard.php');
        } else {
            setFlash('error', $result['message'] ?? 'Giriş başarısız');
        }
    }
}

$pageTitle = 'Giriş Yap - Autrex';
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
        
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
        
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
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
<body class="bg-gray-50">
    <!-- Split Screen Layout -->
    <div class="min-h-screen flex">
        <!-- Left Side - Visual/Branding -->
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            <!-- Animated Background -->
            <div class="absolute inset-0 opacity-20">
                <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
                <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
            </div>
            
            <!-- Content -->
            <div class="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
                <div class="float-animation mb-8">
                    <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl pulse-glow">
                        <span class="text-6xl font-black">A</span>
                    </div>
                </div>
                <h1 class="text-5xl font-black mb-6 text-center">Autrex'e Hoş Geldiniz</h1>
                <p class="text-xl text-gray-200 text-center max-w-md mb-8">
                    League of Legends deneyiminizi otomatikleştirin ve oyununuzu bir üst seviyeye taşıyın.
                </p>
                <div class="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                        <div class="text-3xl mb-2">⚡</div>
                        <div class="text-sm font-semibold">Otomatik Kabul</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                        <div class="text-3xl mb-2">🎯</div>
                        <div class="text-sm font-semibold">Akıllı Pick</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                        <div class="text-3xl mb-2">📱</div>
                        <div class="text-sm font-semibold">Uzaktan Kontrol</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                        <div class="text-3xl mb-2">🛡️</div>
                        <div class="text-sm font-semibold">Güvenli</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Side - Login Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div class="w-full max-w-md">
                <!-- Mobile Logo -->
                <div class="lg:hidden text-center mb-8">
                    <a href="/" class="inline-block">
                        <div class="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span class="text-4xl font-black text-white">A</span>
                        </div>
                    </a>
                </div>
                
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-4xl font-black text-gray-900 mb-2"><?php echo __('auth.user_login'); ?></h2>
                    <p class="text-gray-600">
                        <?php echo __('auth.dont_have_account'); ?>
                        <a href="/register.php" class="text-purple-600 hover:text-purple-700 font-bold">
                            <?php echo __('auth.register'); ?>
                        </a>
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
                
                <!-- Login Form -->
                <form method="POST" action="/user-login.php" class="space-y-6">
                    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                    
                    <!-- Email Input -->
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
                    
                    <!-- Password Input -->
                    <div class="relative">
                        <label for="password" class="block text-sm font-bold text-gray-700 mb-2">
                            <?php echo __('auth.password'); ?>
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
                                class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                placeholder="••••••••"
                            >
                        </div>
                    </div>
                    
                    <!-- Forgot Password Link -->
                    <div class="flex items-center justify-end">
                        <a href="/forgot-password.php" class="text-sm text-purple-600 hover:text-purple-700 font-semibold">
                            <?php echo __('auth.forgot_password'); ?>?
                        </a>
                    </div>
                    
                    <!-- Submit Button -->
                    <button 
                        type="submit"
                        class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                        <?php echo __('auth.login'); ?>
                    </button>
                </form>
                
                <!-- Footer Links -->
                <div class="mt-8 text-center space-y-4">
                    <a href="/" class="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                        ← <?php echo __('auth.back_to_home'); ?>
                    </a>
                    <div class="flex items-center justify-center space-x-3">
                        <button onclick="changeLanguage('tr')" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'tr' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                            TR
                        </button>
                        <button onclick="changeLanguage('en')" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all <?php echo $_SESSION['lang'] === 'en' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'; ?>">
                            EN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    function changeLanguage(lang) {
        fetch('?lang=' + lang, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(() => {
            window.location.reload();
        });
    }
    </script>
</body>
</html>
