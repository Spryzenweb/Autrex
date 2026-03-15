<?php
// Load supabase admin if not already loaded
if (!isset($supabaseAdmin)) {
    require_once __DIR__ . '/supabase-admin.php';
}

// Check maintenance mode
checkMaintenanceMode();
?>
<!DOCTYPE html>
<html lang="<?php echo $_SESSION['lang'] ?? 'tr'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Autrex - League of Legends Automation'; ?></title>
    <meta name="description" content="<?php echo $pageDescription ?? 'Otomatik karşılaşma kabulü, ban ve pick işlemleri'; ?>">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/assets/css/style.css">
    
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
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        }
        
        .toast-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .toast-error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    </style>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f5f3ff',
                            100: '#ede9fe',
                            200: '#ddd6fe',
                            300: '#c4b5fd',
                            400: '#a78bfa',
                            500: '#8b5cf6',
                            600: '#7c3aed',
                            700: '#6d28d9',
                            800: '#5b21b6',
                            900: '#4c1d95',
                        }
                    }
                }
            }
        }
        
        // Dark Mode Toggle
        function toggleDarkMode() {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                html.removeAttribute('data-theme');
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                html.setAttribute('data-theme', 'dark');
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
            updateThemeIcons();
        }
        
        function updateThemeIcons() {
            const darkIcon = document.getElementById('theme-toggle-dark-icon');
            const lightIcon = document.getElementById('theme-toggle-light-icon');
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                if (darkIcon) darkIcon.classList.remove('hidden');
                if (lightIcon) lightIcon.classList.add('hidden');
            } else {
                if (darkIcon) darkIcon.classList.add('hidden');
                if (lightIcon) lightIcon.classList.remove('hidden');
            }
        }
        
        // Initialize theme on page load
        document.addEventListener('DOMContentLoaded', function() {
            const theme = localStorage.getItem('theme') || 'light';
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.classList.add('dark');
            }
            updateThemeIcons();
        });
        
        // Copy to clipboard function
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('Lisans anahtarı kopyalandı!', 'success');
            }, function() {
                showToast('Kopyalama başarısız', 'error');
            });
        }
        
        // Toast notification
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        // Handle Supabase hash redirects
        window.addEventListener('DOMContentLoaded', function() {
            const hash = window.location.hash;
            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                const type = params.get('type');
                
                if (accessToken && type === 'recovery') {
                    window.location.href = '/reset-password.php?access_token=' + encodeURIComponent(accessToken);
                } else if (accessToken && type === 'signup') {
                    window.location.href = '/user-login.php?confirmed=1';
                }
            }
        });
        
        // Mobile menu toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }
    </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900">
    <!-- Modern Navbar -->
    <nav class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <!-- Logo -->
                <div class="flex items-center">
                    <a href="/" class="flex items-center space-x-3 group">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <span class="text-2xl font-black text-white">A</span>
                        </div>
                        <span class="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Autrex</span>
                    </a>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-1">
                    <a href="/" class="<?php echo isActive('/index.php') || currentUrl() === '/' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                        <?php echo __('nav.home'); ?>
                    </a>
                    <a href="/pricing.php" class="<?php echo isActive('pricing') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                        <?php echo __('nav.pricing'); ?>
                    </a>
                    <a href="/download.php" class="<?php echo isActive('download') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                        <?php echo __('nav.download'); ?>
                    </a>
                    <a href="/remote" class="<?php echo isActive('remote') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2">
                        <span>📱</span>
                        <span>Remote</span>
                    </a>
                </div>
                
                <!-- Right Side -->
                <div class="flex items-center space-x-4">
                    <!-- Dark Mode Toggle -->
                    <button onclick="toggleDarkMode()" class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                        <svg id="theme-toggle-dark-icon" class="w-5 h-5 hidden text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                        </svg>
                        <svg id="theme-toggle-light-icon" class="w-5 h-5 hidden text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                    
                    <!-- Language Switcher -->
                    <div class="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <a href="?lang=tr" class="<?php echo $_SESSION['lang'] === 'tr' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'; ?> px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200">TR</a>
                        <a href="?lang=en" class="<?php echo $_SESSION['lang'] === 'en' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'; ?> px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200">EN</a>
                    </div>
                    
                    <!-- Auth Buttons -->
                    <?php if (isAuthenticated()): ?>
                    <a href="/user/dashboard.php" class="hidden md:inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Dashboard</span>
                    </a>
                    <?php else: ?>
                    <a href="/user-login.php" class="hidden md:inline-flex items-center px-5 py-2.5 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all duration-200">
                        <?php echo __('auth.login'); ?>
                    </a>
                    <a href="/register.php" class="hidden md:inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <?php echo __('auth.register'); ?>
                    </a>
                    <?php endif; ?>
                    
                    <!-- Mobile Menu Button -->
                    <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div class="px-4 py-4 space-y-2">
                <a href="/" class="block px-4 py-3 rounded-lg <?php echo isActive('/index.php') || currentUrl() === '/' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> font-semibold">
                    <?php echo __('nav.home'); ?>
                </a>
                <a href="/pricing.php" class="block px-4 py-3 rounded-lg <?php echo isActive('pricing') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> font-semibold">
                    <?php echo __('nav.pricing'); ?>
                </a>
                <a href="/download.php" class="block px-4 py-3 rounded-lg <?php echo isActive('download') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> font-semibold">
                    <?php echo __('nav.download'); ?>
                </a>
                <a href="/remote" class="block px-4 py-3 rounded-lg <?php echo isActive('remote') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'; ?> font-semibold">
                    📱 Remote Control
                </a>
                
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <?php if (isAuthenticated()): ?>
                    <a href="/user/dashboard.php" class="block px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl text-center">
                        Dashboard
                    </a>
                    <?php else: ?>
                    <a href="/user-login.php" class="block px-4 py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-xl text-center">
                        <?php echo __('auth.login'); ?>
                    </a>
                    <a href="/register.php" class="block px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl text-center">
                        <?php echo __('auth.register'); ?>
                    </a>
                    <?php endif; ?>
                </div>
                
                <div class="pt-4 flex justify-center space-x-2">
                    <a href="?lang=tr" class="<?php echo $_SESSION['lang'] === 'tr' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'; ?> px-6 py-2 rounded-lg font-semibold">TR</a>
                    <a href="?lang=en" class="<?php echo $_SESSION['lang'] === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'; ?> px-6 py-2 rounded-lg font-semibold">EN</a>
                </div>
            </div>
        </div>
    </nav>
    
    <?php
    // Display flash messages
    $flash = getFlash();
    if ($flash):
    ?>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div class="rounded-xl p-4 shadow-lg <?php echo $flash['type'] === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800' : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-800'; ?>">
            <div class="flex items-center">
                <span class="text-2xl mr-3"><?php echo $flash['type'] === 'success' ? '✓' : '⚠'; ?></span>
                <span class="font-semibold"><?php echo e($flash['message']); ?></span>
            </div>
        </div>
    </div>
    <?php endif; ?>
    
    <main>
