<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

requireAdmin();

// Handle settings update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_settings') {
    // Validate trial duration
    $trialDuration = intval($_POST['trial_duration_hours'] ?? 6);
    if ($trialDuration < 1 || $trialDuration > 168) {
        setFlash(__('settings.save_error') . ': Trial süresi 1-168 saat arasında olmalı', 'error');
        redirect('/admin/settings.php');
    }
    
    $settings = [
        'maintenance_mode' => isset($_POST['maintenance_mode']) ? 'true' : 'false',
        'trial_duration_hours' => $trialDuration
    ];
    
    $success = true;
    $errorMessage = '';
    
    foreach ($settings as $key => $value) {
        $result = $supabaseAdmin->setSetting($key, (string)$value);
        if (!$result || isset($result['error'])) {
            $success = false;
            $errorMessage = $result['message'] ?? 'Bilinmeyen hata';
            break;
        }
    }
    
    if ($success) {
        setFlash(__('settings.saved'), 'success');
    } else {
        setFlash(__('settings.save_error') . ': ' . $errorMessage, 'error');
    }
    
    redirect('/admin/settings.php');
}

$pageTitle = __('settings.title') . ' - Autrex Admin';
$pageHeading = __('settings.title');

// Fetch current settings
$settings = $supabaseAdmin->getAllSettings();

include __DIR__ . '/../includes/admin-header.php';
?>

<div class="max-w-4xl">
    <!-- Settings Form -->
    <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold"><?php echo __('settings.general'); ?></h3>
        </div>
        
        <form method="POST" class="p-6 space-y-6" id="settingsForm">
            <input type="hidden" name="action" value="update_settings">
            
            <!-- Info Box -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                        <p class="text-sm font-medium text-blue-900">Uygulama Versiyonu ve İndirme Linkleri</p>
                        <p class="text-xs text-blue-700 mt-1">Versiyon yönetimi ve dosya yüklemeleri için <a href="/admin/release-update.php" class="underline font-semibold">Release Update</a> sayfasını kullanın.</p>
                    </div>
                </div>
            </div>
            
            <!-- Trial Duration -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <?php echo __('settings.trial_duration'); ?>
                    <span class="text-red-500">*</span>
                </label>
                <input 
                    type="number" 
                    name="trial_duration_hours" 
                    value="<?php echo e($settings['trial_duration_hours'] ?? 6); ?>"
                    min="1"
                    max="168"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-gray-500 mt-1"><?php echo __('settings.trial_duration_desc'); ?></p>
            </div>
            
            <!-- Maintenance Mode -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label class="flex items-center">
                    <input 
                        type="checkbox" 
                        name="maintenance_mode" 
                        id="maintenance_mode"
                        <?php echo ($settings['maintenance_mode'] ?? 'false') === 'true' ? 'checked' : ''; ?>
                        class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                    <span class="ml-2 text-sm font-medium text-gray-700"><?php echo __('settings.maintenance_mode'); ?></span>
                </label>
                <p class="text-xs text-gray-600 mt-1 ml-6"><?php echo __('settings.maintenance_mode_desc'); ?></p>
            </div>
            
            <!-- Save Button -->
            <div class="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button 
                    type="submit"
                    class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition">
                    <?php echo __('settings.save'); ?>
                </button>
                
                <div class="text-xs text-gray-500">
                    <span class="text-red-500">*</span> Zorunlu alanlar
                </div>
            </div>
        </form>
    </div>
    
    <!-- Current Settings Preview -->
    <div class="bg-white rounded-lg shadow-md mt-6">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold">Mevcut Ayarlar</h3>
        </div>
        
        <div class="p-6">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <dt class="text-sm font-medium text-gray-500">Trial Süresi</dt>
                    <dd class="mt-1 text-sm text-gray-900"><?php echo e($settings['trial_duration_hours'] ?? 6); ?> saat</dd>
                </div>
                
                <div>
                    <dt class="text-sm font-medium text-gray-500">Bakım Modu</dt>
                    <dd class="mt-1">
                        <?php if (($settings['maintenance_mode'] ?? 'false') === 'true'): ?>
                        <span class="badge badge-warning">Aktif</span>
                        <?php else: ?>
                        <span class="badge badge-success">Pasif</span>
                        <?php endif; ?>
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</div>

<script>
// Form validation
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    const maintenanceMode = document.getElementById('maintenance_mode');
    
    if (maintenanceMode.checked) {
        if (!confirm('Bakım modunu aktif etmek istediğinizden emin misiniz? Site kullanıcılar için erişilemez olacak.')) {
            e.preventDefault();
            return false;
        }
    }
});
</script>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
