<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase.php';

// Require authentication
requireAuth();

$pageTitle = 'Dashboard - Autrex';
$user = getCurrentUser();

// Fetch user's licenses from user_licenses table
$userId = $user['id'];

// Get user's licenses using admin client
require_once __DIR__ . '/../includes/supabase-admin.php';
$userLicenses = $supabaseAdmin->getUserLicenses($userId);

// Get user balance
$userBalance = $supabaseAdmin->getBalance($userId);

// Stats
$stats = [
    'total_licenses' => count($userLicenses),
    'active_licenses' => 0,
    'expired_licenses' => 0,
    'balance' => $userBalance
];

foreach ($userLicenses as $license) {
    $isActive = $license['is_active'] ?? false;
    $expiresAt = $license['expires_at'] ?? null;
    
    // Parse UTC timestamp correctly using DateTime
    $isExpired = false;
    if ($expiresAt) {
        $dt = new DateTime($expiresAt, new DateTimeZone('UTC'));
        $now = new DateTime('now', new DateTimeZone('UTC'));
        $isExpired = $dt < $now;
    }
    
    if ($isExpired) $stats['expired_licenses']++;
    elseif ($isActive) $stats['active_licenses']++;
}

include __DIR__ . '/../includes/user-header.php';
?>

<!-- Welcome Section -->
<div class="mb-8">
    <h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2"><?php echo __('user.welcome'); ?>, <?php echo e($user['user_metadata']['name'] ?? explode('@', $user['email'])[0]); ?>! 👋</h1>
    <p class="text-gray-600 dark:text-gray-400 text-lg"><?php echo __('user.dashboard_subtitle'); ?></p>
</div>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide"><?php echo __('dashboard.total_licenses'); ?></p>
                <p class="text-4xl font-black text-gray-900 dark:text-white mt-2"><?php echo $stats['total_licenses']; ?></p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide"><?php echo __('dashboard.active_licenses'); ?></p>
                <p class="text-4xl font-black text-green-600 dark:text-green-400 mt-2"><?php echo $stats['active_licenses']; ?></p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide"><?php echo __('dashboard.expired_licenses'); ?></p>
                <p class="text-4xl font-black text-red-600 dark:text-red-400 mt-2"><?php echo $stats['expired_licenses']; ?></p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide"><?php echo __('user.balance'); ?></p>
                <p class="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">₺<?php echo number_format($stats['balance'], 2); ?></p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <?php
    // Check if user has claimed trial
    $trialClaimed = $supabaseAdmin->select('trial_claims', '*', ['user_id' => $userId]);
    $hasTrialClaim = !empty($trialClaimed) && is_array($trialClaimed);
    ?>
    
    <?php if (!$hasTrialClaim): ?>
    <div class="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div class="relative z-10">
            <div class="text-5xl mb-4 float-animation">🎁</div>
            <h3 class="text-2xl font-black mb-3"><?php echo __('dashboard.free_trial'); ?></h3>
            <p class="mb-6 text-yellow-100 font-medium"><?php echo __('dashboard.free_trial_desc'); ?></p>
            <a href="/user/claim-trial.php" class="inline-block bg-white text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <?php echo __('dashboard.get_now'); ?> →
            </a>
        </div>
    </div>
    <?php endif; ?>
    
    <div class="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div class="relative z-10">
            <div class="text-5xl mb-4 float-animation">💎</div>
            <h3 class="text-2xl font-black mb-3"><?php echo __('dashboard.buy_new_license'); ?></h3>
            <p class="mb-6 text-purple-100 font-medium"><?php echo __('dashboard.buy_new_license_desc'); ?></p>
            <a href="/pricing.php" class="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <?php echo __('dashboard.view_packages'); ?> →
            </a>
        </div>
    </div>
    
    <div class="relative overflow-hidden bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div class="relative z-10">
            <div class="text-5xl mb-4 float-animation">⬇️</div>
            <h3 class="text-2xl font-black mb-3"><?php echo __('dashboard.download_app'); ?></h3>
            <p class="mb-6 text-green-100 font-medium"><?php echo __('dashboard.download_app_desc'); ?></p>
            <a href="/download.php" class="inline-block bg-white text-green-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <?php echo __('dashboard.download'); ?> →
            </a>
        </div>
    </div>
</div>

<!-- Recent Licenses -->
<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
    <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white"><?php echo __('user.recent_licenses'); ?></h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Son eklenen lisanslarınız</p>
        </div>
        <div class="flex items-center space-x-4">
            <!-- Hide Expired Toggle -->
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="hideExpiredToggleDashboard" class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Süresi dolanları gizle</span>
            </label>
            <a href="/user/licenses.php" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Tümünü Gör →
            </a>
        </div>
    </div>
    <div class="p-8">
        <?php if (empty($userLicenses)): ?>
        <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('dashboard.no_licenses_yet'); ?></h3>
            <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto"><?php echo __('dashboard.no_licenses_desc'); ?></p>
            <a href="/pricing.php" class="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <?php echo __('dashboard.buy_license'); ?> →
            </a>
        </div>
        <?php else: ?>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                        <th class="text-left px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"><?php echo __('license.license_key'); ?></th>
                        <th class="text-left px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"><?php echo __('license.type'); ?></th>
                        <th class="text-left px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"><?php echo __('license.status'); ?></th>
                        <th class="text-left px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"><?php echo __('license.remaining_time'); ?></th>
                        <th class="text-left px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"><?php echo __('license.actions'); ?></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <?php foreach ($userLicenses as $license): ?>
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-5">
                            <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg"><?php echo e($license['key']); ?></span>
                        </td>
                        <td class="px-6 py-5">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <?php echo e(ucfirst(strtolower($license['type']))); ?>
                            </span>
                        </td>
                        <td class="px-6 py-5">
                            <?php
                            $isActive = $license['is_active'] ?? false;
                            $expiresAt = $license['expires_at'] ?? null;
                            
                            // Parse UTC timestamp correctly
                            $isExpired = false;
                            if ($expiresAt) {
                                $dt = new DateTime($expiresAt, new DateTimeZone('UTC'));
                                $now = new DateTime('now', new DateTimeZone('UTC'));
                                $isExpired = $dt < $now;
                            }
                            
                            if ($isExpired) {
                                echo '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">' . __('license.expired') . '</span>';
                            } elseif ($isActive) {
                                echo '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✓ ' . __('license.active') . '</span>';
                            } else {
                                echo '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">' . __('license.inactive') . '</span>';
                            }
                            ?>
                        </td>
                        <td class="px-6 py-5">
                            <?php 
                            $activatedAt = $license['activated_at'] ?? null;
                            if ($license['expires_at']) {
                                // Lisans aktive edilmiş ve süresi var
                                $expiresIso = ensureIsoFormat($license['expires_at']);
                                echo '<span class="countdown font-semibold text-gray-900 dark:text-white" data-expires-iso="' . e($expiresIso) . '">Hesaplanıyor...</span>';
                            } elseif ($activatedAt) {
                                // Aktive edilmiş ama süresiz
                                echo '<span class="text-green-600 dark:text-green-400 font-bold">♾️ ' . __('license.lifetime') . '</span>';
                            } else {
                                // Henüz aktive edilmemiş
                                echo '<div>';
                                echo '<span class="text-blue-600 dark:text-blue-400 font-bold">🔓 ' . __('license.not_activated') . '</span>';
                                echo '<br><span class="text-xs text-gray-500 dark:text-gray-400">' . __('license.activation_note') . '</span>';
                                echo '</div>';
                            }
                            ?>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex items-center space-x-2">
                                <button onclick="copyToClipboard('<?php echo e($license['key']); ?>')" class="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 font-semibold rounded-lg transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                    <span><?php echo __('license.copy'); ?></span>
                                </button>
                                <a href="/user/support.php?license_key=<?php echo urlencode($license['key']); ?>" class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 font-semibold rounded-lg transition-colors" title="Lisansımda sorun var">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                    <span>Sorun Bildir</span>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </div>
</div>

<script>
// Kalan süre sayacı
function updateCountdowns() {
    const countdowns = document.querySelectorAll('.countdown');
    const now = Date.now();
    
    countdowns.forEach(countdown => {
        const expiresIso = countdown.dataset.expiresIso;
        const expiresAt = new Date(expiresIso).getTime();
        const remaining = Math.floor((expiresAt - now) / 1000);
        
        if (remaining <= 0) {
            countdown.innerHTML = '<span class="text-red-600 font-semibold">⏰ Süresi Dolmuş</span>';
            countdown.classList.remove('countdown');
            return;
        }
        
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        
        let timeStr = '';
        let colorClass = '';
        
        if (days > 0) {
            timeStr = `⏱️ ${days} gün ${hours} saat`;
            colorClass = 'text-green-600';
        } else if (hours > 0) {
            timeStr = `⏱️ ${hours} saat ${minutes} dakika`;
            colorClass = remaining < 3600 ? 'text-red-600' : 'text-yellow-600';
        } else if (minutes > 0) {
            timeStr = `⏱️ ${minutes} dakika ${seconds} saniye`;
            colorClass = 'text-red-600';
        } else {
            timeStr = `⏱️ ${seconds} saniye`;
            colorClass = 'text-red-600';
        }
        
        countdown.innerHTML = `<span class="font-semibold ${colorClass}">${timeStr}</span>`;
    });
}

// İlk güncelleme
updateCountdowns();

// Her saniye güncelle
setInterval(updateCountdowns, 1000);

// Hide expired licenses toggle for dashboard
document.getElementById('hideExpiredToggleDashboard')?.addEventListener('change', function() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(3)');
        if (statusCell) {
            const isExpired = statusCell.textContent.includes('Süresi Dolmuş') || statusCell.textContent.includes('⏰');
            if (this.checked && isExpired) {
                row.style.display = 'none';
                row.classList.add('license-expired');
            } else {
                row.style.display = '';
                row.classList.remove('license-expired');
            }
        }
    });
});
</script>

<?php include __DIR__ . '/../includes/user-footer.php'; ?>
