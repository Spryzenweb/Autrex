<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

// Require admin authentication
requireAdmin();

// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    redirect('/admin/index.php');
}

$pageTitle = __('admin.dashboard_title') . ' - Autrex Admin';
$pageHeading = __('admin.dashboard_title');

// Fetch dashboard statistics using admin client
$allLicenses = $supabaseAdmin->select('licenses', '*', []);
$authUsers = $supabaseAdmin->getAuthUsers();
$userLicenses = $supabaseAdmin->select('user_licenses', '*', []);

// Calculate stats
$totalLicenses = is_array($allLicenses) ? count($allLicenses) : 0;
$activeLicenses = 0;
$inactiveLicenses = 0;
$expiredLicenses = 0;

if (is_array($allLicenses)) {
    foreach ($allLicenses as $license) {
        $isActive = $license['is_active'] ?? false;
        $expiresAt = $license['expires_at'] ?? null;
        
        if ($isActive) {
            if ($expiresAt && strtotime($expiresAt) < time()) {
                $expiredLicenses++;
            } else {
                $activeLicenses++;
            }
        } else {
            $inactiveLicenses++;
        }
    }
}

$stats = [
    'total_licenses' => $totalLicenses,
    'active_licenses' => $activeLicenses,
    'inactive_licenses' => $inactiveLicenses,
    'expired_licenses' => $expiredLicenses,
    'total_users' => count($authUsers),
    'licensed_users' => is_array($userLicenses) ? count(array_unique(array_column($userLicenses, 'user_id'))) : 0
];

// Get recent activations (if table exists)
$recentActivations = $supabaseAdmin->select('activations', '*', [], 'created_at.desc', 10);
$recentActivationsList = is_array($recentActivations) ? $recentActivations : [];

include __DIR__ . '/../includes/admin-header.php';
?>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Licenses -->
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition duration-200">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-blue-100 text-sm font-medium">Toplam Lisans</p>
                <p class="text-4xl font-bold mt-2"><?php echo number_format($stats['total_licenses']); ?></p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Active Licenses -->
    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition duration-200">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-green-100 text-sm font-medium">Aktif Lisans</p>
                <p class="text-4xl font-bold mt-2"><?php echo number_format($stats['active_licenses']); ?></p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Total Users -->
    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition duration-200">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-purple-100 text-sm font-medium">Toplam Kullanıcı</p>
                <p class="text-4xl font-bold mt-2"><?php echo number_format($stats['total_users']); ?></p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Licensed Users -->
    <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition duration-200">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-orange-100 text-sm font-medium">Lisanslı Kullanıcı</p>
                <p class="text-4xl font-bold mt-2"><?php echo number_format($stats['licensed_users']); ?></p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Secondary Stats -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Pasif Lisans</p>
                <p class="text-2xl font-bold text-gray-700 mt-1"><?php echo number_format($stats['inactive_licenses']); ?></p>
            </div>
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
        </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-400">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Süresi Dolmuş</p>
                <p class="text-2xl font-bold text-red-600 mt-1"><?php echo number_format($stats['expired_licenses']); ?></p>
            </div>
            <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-400">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Kullanım Oranı</p>
                <p class="text-2xl font-bold text-green-600 mt-1">
                    <?php 
                    $usageRate = $stats['total_users'] > 0 ? round(($stats['licensed_users'] / $stats['total_users']) * 100) : 0;
                    echo $usageRate . '%'; 
                    ?>
                </p>
            </div>
            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <a href="/admin/licenses.php" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 border-t-4 border-blue-500">
        <div class="flex items-center">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
            </div>
            <div>
                <h3 class="font-semibold text-gray-900">Yeni Lisans Oluştur</h3>
                <p class="text-sm text-gray-600">Hızlı lisans oluşturma</p>
            </div>
        </div>
    </a>
    
    <a href="/admin/users.php" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 border-t-4 border-purple-500">
        <div class="flex items-center">
            <div class="bg-purple-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
            <div>
                <h3 class="font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
                <p class="text-sm text-gray-600">Kullanıcıları görüntüle</p>
            </div>
        </div>
    </a>
    
    <a href="/admin/release-update.php" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 border-t-4 border-green-500">
        <div class="flex items-center">
            <div class="bg-green-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
            </div>
            <div>
                <h3 class="font-semibold text-gray-900">Güncelleme Yayınla</h3>
                <p class="text-sm text-gray-600">Yeni versiyon yayınla</p>
            </div>
        </div>
    </a>
</div>

<!-- Recent Activations -->
<div class="bg-white rounded-lg shadow-md">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900"><?php echo __('admin.recent_activations'); ?></h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr>
                    <th class="text-left px-6 py-3">Lisans</th>
                    <th class="text-left px-6 py-3">Hardware ID</th>
                    <th class="text-left px-6 py-3">IP Adresi</th>
                    <th class="text-left px-6 py-3">İşlem</th>
                    <th class="text-left px-6 py-3">Durum</th>
                    <th class="text-left px-6 py-3">Tarih</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($recentActivationsList)): ?>
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        Henüz aktivasyon yok
                    </td>
                </tr>
                <?php else: ?>
                    <?php foreach ($recentActivationsList as $activation): ?>
                    <tr>
                        <td class="px-6 py-4">
                            <span class="font-mono text-sm"><?php echo e(substr($activation['license_id'] ?? 'N/A', 0, 8)); ?>...</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="font-mono text-sm"><?php echo e(substr($activation['hardware_id'] ?? 'N/A', 0, 12)); ?>...</span>
                        </td>
                        <td class="px-6 py-4"><?php echo e($activation['ip_address'] ?? 'N/A'); ?></td>
                        <td class="px-6 py-4">
                            <span class="badge badge-info"><?php echo e($activation['action'] ?? 'N/A'); ?></span>
                        </td>
                        <td class="px-6 py-4">
                            <?php if ($activation['success'] ?? false): ?>
                            <span class="badge badge-success">Başarılı</span>
                            <?php else: ?>
                            <span class="badge badge-danger">Başarısız</span>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4"><?php echo formatDate($activation['created_at'] ?? ''); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>



<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
