<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

// Check authentication - support both old and new methods
session_start();

$isAdminAuthenticated = false;

// Method 1: New admin_logged_in flag
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $isAdminAuthenticated = true;
}

// Method 2: Old user-based authentication with admin check
if (!$isAdminAuthenticated && isset($_SESSION['user']) && isset($_SESSION['access_token'])) {
    $user = $_SESSION['user'];
    
    // Check if user is admin
    $isAdmin = false;
    if (isset($user['user_metadata']['is_admin']) && $user['user_metadata']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['raw_user_meta_data']['is_admin']) && $user['raw_user_meta_data']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['app_metadata']['is_admin']) && $user['app_metadata']['is_admin']) {
        $isAdmin = true;
    }
    if (isset($user['is_admin']) && $user['is_admin']) {
        $isAdmin = true;
    }
    
    // Check admin email list
    $adminEmails = ['admin@autrex.com', 'kesug@kesug.com', 'spryzensc@gmail.com'];
    if (isset($user['email']) && in_array($user['email'], $adminEmails)) {
        $isAdmin = true;
    }
    
    if ($isAdmin) {
        $isAdminAuthenticated = true;
        // Set the new flag for consistency
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $user['email'] ?? 'admin@autrex.com';
    }
}

// Redirect to login if not authenticated
if (!$isAdminAuthenticated) {
    header('Location: /admin/login.php');
    exit;
}

$pageTitle = 'Dashboard - Autrex Admin';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Alpine.js for interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Chart.js for analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- Custom Styles -->
    <style>
        [x-cloak] { display: none !important; }
        
        .sidebar-link {
            @apply flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg;
        }
        
        .sidebar-link.active {
            @apply bg-blue-600 text-white;
        }
        
        .stat-card {
            @apply bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200;
        }
        
        .table-row {
            @apply hover:bg-gray-50 transition-colors duration-150;
        }
        
        .badge {
            @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
        }
        
        .badge-success { @apply bg-green-100 text-green-800; }
        .badge-warning { @apply bg-yellow-100 text-yellow-800; }
        .badge-danger { @apply bg-red-100 text-red-800; }
        .badge-info { @apply bg-blue-100 text-blue-800; }
        .badge-gray { @apply bg-gray-100 text-gray-800; }
        .badge-purple { @apply bg-purple-100 text-purple-800; }
        .badge-primary { @apply bg-blue-100 text-blue-800; }
        
        .btn {
            @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
        }
        
        .btn-primary {
            @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
        }
        
        .btn-success {
            @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
        }
        
        .btn-danger {
            @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
        }
        
        .btn-secondary {
            @apply bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
        }
        
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            200: '#bfdbfe',
                            300: '#93c5fd',
                            400: '#60a5fa',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50" x-data="adminApp()" x-init="init()">
    
    <!-- Main Container -->
    <div class="flex h-screen overflow-hidden">
        
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-800">
                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AUTREX
                </h1>
                <p class="text-xs text-gray-400 mt-1">Admin Panel</p>
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                <a href="#" @click.prevent="currentPage = 'dashboard'" 
                   :class="currentPage === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Kontrol Paneli
                </a>
                
                <a href="#" @click.prevent="currentPage = 'licenses'" 
                   :class="currentPage === 'licenses' ? 'sidebar-link active' : 'sidebar-link'">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    Lisanslar
                    <span class="ml-auto badge badge-info" x-text="stats.total_licenses"></span>
                </a>
                
                <a href="#" @click.prevent="currentPage = 'users'" 
                   :class="currentPage === 'users' ? 'sidebar-link active' : 'sidebar-link'">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Kullanıcılar
                    <span class="ml-auto badge badge-info" x-text="stats.total_users"></span>
                </a>
                
                <a href="#" @click.prevent="currentPage = 'activations'" 
                   :class="currentPage === 'activations' ? 'sidebar-link active' : 'sidebar-link'">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Aktivasyonlar
                </a>
                
                <a href="#" @click.prevent="currentPage = 'settings'" 
                   :class="currentPage === 'settings' ? 'sidebar-link active' : 'sidebar-link'">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Ayarlar
                </a>
            </nav>
            
            <!-- User Info -->
            <div class="p-4 border-t border-gray-800">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span class="text-sm font-bold">A</span>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-medium"><?php echo e($_SESSION['admin_email'] ?? 'Admin'); ?></p>
                        <p class="text-xs text-gray-400">Administrator</p>
                    </div>
                    <a href="/admin/logout.php" class="text-gray-400 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </a>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            
            <!-- Top Bar -->
            <header class="bg-white border-b border-gray-200 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900" x-text="pageTitle"></h2>
                        <p class="text-sm text-gray-500 mt-1" x-text="pageSubtitle"></p>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Search -->
                        <div class="relative" x-show="currentPage !== 'dashboard'">
                            <input 
                                type="text" 
                                x-model="searchQuery"
                                @input="handleSearch"
                                placeholder="Ara..."
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64">
                            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        
                        <!-- Refresh Button -->
                        <button @click="refreshData" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <svg class="w-5 h-5" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                        </button>
                        
                        <!-- Notifications -->
                        <button class="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </header>
            
            <!-- Page Content -->
            <main class="flex-1 overflow-y-auto p-6">
                <div x-show="loading && !initialLoad" class="flex items-center justify-center py-12">
                    <div class="loading-spinner"></div>
                </div>
                
                <!-- Dashboard Page -->
                <div x-show="currentPage === 'dashboard' && !loading" x-cloak class="fade-in">
                    <?php include __DIR__ . '/pages/dashboard.php'; ?>
                </div>
                
                <!-- Licenses Page -->
                <div x-show="currentPage === 'licenses' && !loading" x-cloak class="fade-in">
                    <?php include __DIR__ . '/pages/licenses.php'; ?>
                </div>
                
                <!-- Users Page -->
                <div x-show="currentPage === 'users' && !loading" x-cloak class="fade-in">
                    <?php include __DIR__ . '/pages/users.php'; ?>
                </div>
                
                <!-- Activations Page -->
                <div x-show="currentPage === 'activations' && !loading" x-cloak class="fade-in">
                    <?php include __DIR__ . '/pages/activations.php'; ?>
                </div>
                
                <!-- Settings Page -->
                <div x-show="currentPage === 'settings' && !loading" x-cloak class="fade-in">
                    <?php include __DIR__ . '/pages/settings.php'; ?>
                </div>
            </main>
        </div>
    </div>
    
    <!-- Toast Notifications -->
    <div x-show="toast.show" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 transform translate-y-2"
         x-transition:enter-end="opacity-100 transform translate-y-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed bottom-4 right-4 z-50"
         x-cloak>
        <div class="rounded-lg shadow-lg p-4 max-w-sm"
             :class="{
                 'bg-green-50 border border-green-200': toast.type === 'success',
                 'bg-red-50 border border-red-200': toast.type === 'error',
                 'bg-blue-50 border border-blue-200': toast.type === 'info',
                 'bg-yellow-50 border border-yellow-200': toast.type === 'warning'
             }">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg x-show="toast.type === 'success'" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <svg x-show="toast.type === 'error'" class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium" 
                       :class="{
                           'text-green-800': toast.type === 'success',
                           'text-red-800': toast.type === 'error',
                           'text-blue-800': toast.type === 'info',
                           'text-yellow-800': toast.type === 'warning'
                       }"
                       x-text="toast.message"></p>
                </div>
                <button @click="toast.show = false" class="ml-4 flex-shrink-0">
                    <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    
    <script src="/admin-new/js/app.js"></script>
</body>
</html>
