<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

// If already logged in, redirect to dashboard
if (isAuthenticated()) {
    redirect('/admin/index.php');
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Invalid request');
        redirect('/admin/login.php');
    }
    
    // Validate input
    if (empty($email) || empty($password)) {
        setFlash('error', __('messages.login_error'));
    } else {
        // Attempt login (with admin flag)
        $result = login($email, $password, true);
        
        if ($result['success']) {
            setFlash('success', __('messages.login_success'));
            redirect('/admin/index.php');
        } else {
            setFlash('error', $result['message'] ?? __('messages.login_error'));
        }
    }
}

$pageTitle = 'Admin Panel - Autrex';
?>

<!DOCTYPE html>
<html lang="<?php echo $_SESSION['lang'] ?? 'tr'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
        
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>
    
    <div class="relative z-10 w-full max-w-md px-6">
        <!-- Logo & Title -->
        <div class="text-center mb-8 float-animation">
            <div class="inline-block">
                <div class="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl pulse-glow transform hover:scale-110 transition-transform duration-300">
                    <span class="text-5xl font-bold text-white">A</span>
                </div>
            </div>
            <h1 class="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Autrex Admin
            </h1>
            <p class="text-gray-400 text-sm">Yönetim Paneli Girişi</p>
        </div>
        
        <!-- Flash Messages -->
        <?php $flash = getFlash(); if ($flash): ?>
        <div class="mb-6 rounded-xl p-4 backdrop-blur-lg <?php echo $flash['type'] === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'; ?>">
            <div class="flex items-center">
                <span class="text-2xl mr-3"><?php echo $flash['type'] === 'success' ? '✓' : '⚠'; ?></span>
                <span><?php echo e($flash['message']); ?></span>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Login Card -->
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div class="p-8">
                <form method="POST" action="/admin/login.php" class="space-y-6">
                    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                    
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="block text-sm font-semibold text-gray-200 mb-2">
                            📧 Email Adresi
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required
                            class="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition backdrop-blur-sm"
                            placeholder="admin@autrex.com"
                        >
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <label for="password" class="block text-sm font-semibold text-gray-200 mb-2">
                            🔒 Şifre
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            class="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition backdrop-blur-sm"
                            placeholder="••••••••"
                        >
                    </div>
                    
                    <!-- Submit Button -->
                    <button 
                        type="submit"
                        class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200">
                        <span class="flex items-center justify-center">
                            <span class="mr-2">🚀</span>
                            Giriş Yap
                        </span>
                    </button>
                </form>
            </div>
            
            <!-- Footer -->
            <div class="bg-white/5 backdrop-blur-sm px-8 py-4 border-t border-white/10">
                <a href="/" class="flex items-center justify-center text-sm text-gray-300 hover:text-white transition">
                    <span class="mr-2">←</span>
                    Ana Sayfaya Dön
                </a>
            </div>
        </div>
        
        <!-- Security Notice -->
        <div class="mt-6 text-center">
            <p class="text-xs text-gray-400">
                🔐 Bu alan sadece yetkili personel içindir
            </p>
        </div>
    </div>
</body>
</html>
