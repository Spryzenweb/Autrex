<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

requireAuth();

$pageTitle = __('nav.profile') . ' - Autrex';
$user = getCurrentUser();

// Handle profile update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    
    // Update user metadata in Supabase
    // This would require Supabase client implementation
    
    setFlash(__('profile.profile_updated'), 'success');
    redirect('/user/profile.php');
}

include __DIR__ . '/../includes/user-header.php';
?>

<div class="max-w-5xl mx-auto">
    <!-- Profile Header -->
    <div class="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div class="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white/30">
                <?php echo strtoupper(substr($user['email'], 0, 2)); ?>
            </div>
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl font-black mb-2">
                    <?php echo e($user['user_metadata']['name'] ?? explode('@', $user['email'])[0]); ?>
                </h1>
                <p class="text-white/90 text-lg mb-4"><?php echo e($user['email']); ?></p>
                <div class="flex flex-wrap gap-3 justify-center md:justify-start">
                    <?php if ($user['email_confirmed_at']): ?>
                    <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-green-500/20 backdrop-blur-lg border border-green-300/30">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <?php echo __('profile.email_verified'); ?>
                    </span>
                    <?php else: ?>
                    <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-yellow-500/20 backdrop-blur-lg border border-yellow-300/30">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <?php echo __('profile.email_not_verified'); ?>
                    </span>
                    <?php endif; ?>
                    <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/10 backdrop-blur-lg border border-white/20">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <?php echo date('d.m.Y', strtotime($user['created_at'])); ?> tarihinde katıldı
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Profile Information -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
        <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-black text-gray-900 dark:text-white"><?php echo __('profile.profile_info'); ?></h2>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Kişisel bilgilerinizi güncelleyin</p>
            </div>
        </div>
        
        <form method="POST" class="space-y-6">
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <?php echo __('profile.full_name'); ?>
                </label>
                <input 
                    type="text" 
                    name="name" 
                    value="<?php echo e($user['user_metadata']['name'] ?? ''); ?>"
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="<?php echo __('profile.full_name'); ?>"
                >
            </div>
            
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <?php echo __('auth.email'); ?>
                </label>
                <input 
                    type="email" 
                    value="<?php echo e($user['email']); ?>"
                    disabled
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed"
                >
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <?php echo __('profile.email_cannot_change'); ?>
                </p>
            </div>
            
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <?php echo __('profile.member_since'); ?>
                </label>
                <input 
                    type="text" 
                    value="<?php echo date('d.m.Y H:i', strtotime($user['created_at'])); ?>"
                    disabled
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed"
                >
            </div>
            
            <div class="flex justify-end space-x-4 pt-4">
                <a href="/user/dashboard.php" class="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                    <?php echo __('profile.cancel'); ?>
                </a>
                <button type="submit" class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <?php echo __('profile.save'); ?> →
                </button>
            </div>
        </form>
    </div>

    <!-- Account Actions -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-black text-gray-900 dark:text-white"><?php echo __('profile.account_actions'); ?></h2>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Hesap güvenliği ve ayarları</p>
            </div>
        </div>
        
        <div class="space-y-4">
            <?php if (!$user['email_confirmed_at']): ?>
            <div class="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg"><?php echo __('profile.email_verification'); ?></h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1"><?php echo __('profile.verify_email_desc'); ?></p>
                    </div>
                </div>
                <button class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0">
                    <?php echo __('profile.send_verification'); ?>
                </button>
            </div>
            <?php endif; ?>
            
            <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg"><?php echo __('profile.change_password'); ?></h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1"><?php echo __('profile.change_password_desc'); ?></p>
                    </div>
                </div>
                <a href="/user/change-password.php" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0">
                    <?php echo __('profile.change'); ?> →
                </a>
            </div>
            
            <div class="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-red-900 dark:text-red-200 text-lg"><?php echo __('profile.delete_account'); ?></h3>
                        <p class="text-sm text-red-600 dark:text-red-400 mt-1"><?php echo __('profile.delete_account_desc'); ?></p>
                    </div>
                </div>
                <button onclick="confirm('<?php echo __('profile.delete_confirm'); ?>')" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0">
                    <?php echo __('profile.delete_account'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/user-footer.php'; ?>
