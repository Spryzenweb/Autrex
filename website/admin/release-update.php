<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

requireAdmin();

$pageTitle = 'Güncelleme Yayınla - Autrex Admin';
$pageHeading = 'Güncelleme Yayınla';

// Handle version release
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'release_update') {
    $version = trim($_POST['version'] ?? '');
    $releaseNotes = trim($_POST['release_notes'] ?? '');
    $forceUpdate = isset($_POST['force_update']);
    $windowsUrl = trim($_POST['windows_url'] ?? '');
    $macUrl = trim($_POST['mac_url'] ?? '');
    
    // Validate version format
    if (!preg_match('/^[0-9]+\.[0-9]+\.[0-9]+$/', $version)) {
        setFlash('Geçersiz versiyon formatı. Format: X.Y.Z (örn: 1.2.3)', 'error');
        redirect('/admin/release-update');
    }
    
    // Validate URLs if provided
    if (!empty($windowsUrl) && !filter_var($windowsUrl, FILTER_VALIDATE_URL)) {
        setFlash('Geçersiz Windows indirme linki', 'error');
        redirect('/admin/release-update');
    }
    
    if (!empty($macUrl) && !filter_var($macUrl, FILTER_VALIDATE_URL)) {
        setFlash('Geçersiz Mac indirme linki', 'error');
        redirect('/admin/release-update');
    }
    
    // Update settings
    $success = true;
    $errorMessage = '';
    
    // Update version
    $result = $supabaseAdmin->setSetting('app_version', $version);
    if (!$result || isset($result['error'])) {
        $success = false;
        $errorMessage = 'Versiyon güncellenemedi';
    }
    
    // Update Windows download URL if provided
    if ($success && !empty($windowsUrl)) {
        $result = $supabaseAdmin->setSetting('download_url_windows', $windowsUrl);
        if (!$result || isset($result['error'])) {
            $success = false;
            $errorMessage = 'Windows indirme linki güncellenemedi';
        }
    }
    
    // Update Mac download URL if provided
    if ($success && !empty($macUrl)) {
        $result = $supabaseAdmin->setSetting('download_url_mac', $macUrl);
        if (!$result || isset($result['error'])) {
            $success = false;
            $errorMessage = 'Mac indirme linki güncellenemedi';
        }
    }
    
    // Save release notes
    if ($success && !empty($releaseNotes)) {
        $result = $supabaseAdmin->setSetting('release_notes_' . str_replace('.', '_', $version), $releaseNotes);
    }
    
    // Save force update flag
    if ($success) {
        $result = $supabaseAdmin->setSetting('force_update', $forceUpdate ? 'true' : 'false');
    }
    
    if ($success) {
        $message = 'Versiyon ' . $version . ' başarıyla yayınlandı!';
        if (!empty($windowsUrl)) $message .= ' (Windows linki güncellendi)';
        if (!empty($macUrl)) $message .= ' (Mac linki güncellendi)';
        setFlash($message, 'success');
    } else {
        setFlash('Güncelleme yayınlanamadı: ' . $errorMessage, 'error');
    }
    
    redirect('/admin/release-update');
}

// Fetch current settings
$settings = $supabaseAdmin->getAllSettings();
$currentVersion = $settings['app_version'] ?? '1.0.0';

include __DIR__ . '/../includes/admin-header.php';
?>

<div class="max-w-4xl">
    <!-- Current Version Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-lg font-semibold text-blue-900">Mevcut Versiyon</h3>
                <p class="text-3xl font-bold text-blue-600 font-mono mt-2"><?php echo e($currentVersion); ?></p>
            </div>
            <div class="text-right">
                <p class="text-sm text-blue-700">İndirme Linkleri</p>
                <div class="mt-2 space-y-1">
                    <?php if (!empty($settings['download_url_windows'])): ?>
                        <a href="<?php echo e($settings['download_url_windows']); ?>" target="_blank" class="text-xs text-blue-600 hover:underline block">
                            🪟 Windows
                        </a>
                    <?php else: ?>
                        <span class="text-xs text-gray-400 block">🪟 Windows (Yok)</span>
                    <?php endif; ?>
                    
                    <?php if (!empty($settings['download_url_mac'])): ?>
                        <a href="<?php echo e($settings['download_url_mac']); ?>" target="_blank" class="text-xs text-blue-600 hover:underline block">
                            🍎 Mac
                        </a>
                    <?php else: ?>
                        <span class="text-xs text-gray-400 block">🍎 Mac (Yok)</span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Release Form -->
    <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold">Yeni Güncelleme Yayınla</h3>
            <p class="text-sm text-gray-600 mt-1">Yeni versiyon numarası girin ve dosyaları yükleyin</p>
        </div>
        
        <form method="POST" class="p-6 space-y-6" id="releaseForm">
            <input type="hidden" name="action" value="release_update">
            
            <!-- Version Number -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Versiyon Numarası
                    <span class="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    name="version" 
                    required
                    pattern="[0-9]+\.[0-9]+\.[0-9]+"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="1.0.0">
                <p class="text-xs text-gray-500 mt-1">Format: X.Y.Z (örn: 1.2.3)</p>
            </div>
            
            <!-- Release Notes -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Sürüm Notları
                </label>
                <textarea 
                    name="release_notes" 
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Bu sürümde neler değişti?&#10;- Yeni özellik 1&#10;- Hata düzeltmesi 2&#10;- İyileştirme 3"></textarea>
                <p class="text-xs text-gray-500 mt-1">Kullanıcılara gösterilecek değişiklik notları</p>
            </div>
            
            <!-- Download Links -->
            <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">İndirme Linkleri</h4>
                <p class="text-sm text-gray-600">Link girmek istemiyorsanız boş bırakın. Mevcut linkler korunacaktır.</p>
                
                <!-- Windows URL -->
                <div class="border border-gray-300 rounded-lg p-4">
                    <label class="block">
                        <span class="text-sm font-medium text-gray-700 mb-2 block">
                            🪟 Windows İndirme Linki
                        </span>
                        <input 
                            type="url" 
                            name="windows_url" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="https://github.com/user/repo/releases/download/v1.0.0/Autrex-Windows.exe"
                            value="<?php echo e($settings['download_url_windows'] ?? ''); ?>">
                        <p class="text-xs text-gray-500 mt-2">GitHub Release, Google Drive, Dropbox veya başka bir indirme linki</p>
                    </label>
                </div>
                
                <!-- Mac URL -->
                <div class="border border-gray-300 rounded-lg p-4">
                    <label class="block">
                        <span class="text-sm font-medium text-gray-700 mb-2 block">
                            🍎 Mac İndirme Linki
                        </span>
                        <input 
                            type="url" 
                            name="mac_url" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="https://github.com/user/repo/releases/download/v1.0.0/Autrex-Mac.dmg"
                            value="<?php echo e($settings['download_url_mac'] ?? ''); ?>">
                        <p class="text-xs text-gray-500 mt-2">GitHub Release, Google Drive, Dropbox veya başka bir indirme linki</p>
                    </label>
                </div>
            </div>
            
            <!-- Force Update -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <label class="flex items-start">
                    <input 
                        type="checkbox" 
                        name="force_update" 
                        id="force_update"
                        class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1">
                    <div class="ml-3">
                        <span class="text-sm font-medium text-gray-700">Zorunlu Güncelleme</span>
                        <p class="text-xs text-gray-600 mt-1">Kullanıcılar güncellemeden uygulamayı kullanamaz</p>
                    </div>
                </label>
            </div>
            
            <!-- Submit Button -->
            <div class="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button 
                    type="submit"
                    class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition">
                    🚀 Güncellemeyi Yayınla
                </button>
                
                <a href="/admin/settings.php" class="text-sm text-gray-600 hover:text-gray-900">
                    ← Site Ayarlarına Dön
                </a>
            </div>
        </form>
    </div>
    
    <!-- Warning -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 class="font-semibold text-yellow-900 mb-2">⚠️ Önemli Notlar</h4>
        <ul class="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Link girmezseniz, sadece versiyon numarası güncellenir</li>
            <li>Mevcut indirme linkleri korunur</li>
            <li>GitHub Release, Google Drive, Dropbox veya herhangi bir indirme linki kullanabilirsiniz</li>
            <li>Zorunlu güncelleme aktifse, kullanıcılar eski versiyonu kullanamaz</li>
        </ul>
    </div>
    
    <!-- Link Suggestions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h4 class="font-semibold text-blue-900 mb-2">💡 Link Önerileri</h4>
        <div class="text-sm text-blue-800 space-y-2">
            <div>
                <strong>GitHub Releases:</strong>
                <code class="bg-blue-100 px-2 py-1 rounded text-xs block mt-1">
                    https://github.com/kullanici/repo/releases/download/v1.0.0/dosya.exe
                </code>
            </div>
            <div>
                <strong>Google Drive (Direkt İndirme):</strong>
                <code class="bg-blue-100 px-2 py-1 rounded text-xs block mt-1">
                    https://drive.google.com/uc?export=download&id=DOSYA_ID
                </code>
            </div>
            <div>
                <strong>Dropbox (Direkt İndirme):</strong>
                <code class="bg-blue-100 px-2 py-1 rounded text-xs block mt-1">
                    https://www.dropbox.com/s/DOSYA_ID/dosya.exe?dl=1
                </code>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('releaseForm').addEventListener('submit', function(e) {
    const version = document.querySelector('input[name="version"]').value;
    const forceUpdate = document.getElementById('force_update').checked;
    
    let message = `Versiyon ${version} yayınlanacak. Emin misiniz?`;
    
    if (forceUpdate) {
        message += '\n\n⚠️ ZORUNLU GÜNCELLEME AKTİF! Kullanıcılar eski versiyonu kullanamayacak.';
    }
    
    if (!confirm(message)) {
        e.preventDefault();
        return false;
    }
});
</script>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
