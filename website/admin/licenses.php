<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

// Require authentication
requireAdmin();

// Handle license creation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    error_log("POST Action: " . $_POST['action']);
    
    if ($_POST['action'] === 'create_license') {
        $type = $_POST['type'] ?? 'trial';
        $maxActivations = intval($_POST['max_activations'] ?? 1);
        $notes = $_POST['notes'] ?? null;
        
        error_log("Creating license: type=$type, max=$maxActivations");
        
        $result = $supabaseAdmin->createLicense($type, $maxActivations, $notes);
        
        error_log("Create result: " . print_r($result, true));
        
        if ($result && !isset($result['error'])) {
            $licenseKey = $result['key'] ?? 'N/A';  // NOT license_key!
            setFlash('Lisans başarıyla oluşturuldu: ' . $licenseKey, 'success');
        } else {
            // Detaylı hata mesajı
            $errorMsg = 'Lisans oluşturulamadı. ';
            if (isset($result['message'])) {
                $errorMsg .= $result['message'];
            }
            if (isset($result['response'])) {
                $errorMsg .= ' Response: ' . $result['response'];
            }
            if (isset($result['code'])) {
                $errorMsg .= ' (HTTP ' . $result['code'] . ')';
            }
            error_log("Error: " . $errorMsg);
            error_log("Full result: " . json_encode($result));
            setFlash($errorMsg, 'error');
        }
        redirect('/admin/licenses.php');
    }
    
    if ($_POST['action'] === 'bulk_create') {
        $type = $_POST['type'] ?? 'trial';
        $count = intval($_POST['count'] ?? 10);
        $count = min($count, 100); // Max 100
        
        $created = 0;
        for ($i = 0; $i < $count; $i++) {
            $result = $supabaseAdmin->createLicense($type, 1, "Toplu oluşturma");
            if ($result && !isset($result['error'])) {
                $created++;
            }
        }
        
        setFlash("$created lisans başarıyla oluşturuldu", 'success');
        redirect('/admin/licenses.php');
    }
    
    if ($_POST['action'] === 'update_status') {
        $licenseId = $_POST['license_id'] ?? '';
        $newStatus = $_POST['new_status'] ?? 'inactive';
        
        // is_active boolean olarak güncelle
        $isActive = ($newStatus === 'active');
        
        $result = $supabaseAdmin->update('licenses', ['is_active' => $isActive], ['id' => $licenseId]);
        
        if ($result && !isset($result['error'])) {
            setFlash('Lisans durumu güncellendi', 'success');
        } else {
            setFlash('Durum güncellenemedi', 'error');
        }
        redirect('/admin/licenses.php');
    }
    
    if ($_POST['action'] === 'assign_license') {
        $licenseId = $_POST['license_id'] ?? '';
        $userId = $_POST['user_id'] ?? '';
        
        if (empty($licenseId) || empty($userId)) {
            setFlash('Lisans ID ve Kullanıcı ID gerekli', 'error');
        } else {
            $result = $supabaseAdmin->assignLicenseToUser($licenseId, $userId);
            
            if ($result && !isset($result['error'])) {
                setFlash('Lisans kullanıcıya başarıyla atandı', 'success');
            } else {
                $errorMsg = $result['message'] ?? 'Lisans atanamadı';
                setFlash($errorMsg, 'error');
            }
        }
        redirect('/admin/licenses.php');
    }
    
    if ($_POST['action'] === 'reset_hardware') {
        $licenseId = $_POST['license_id'] ?? '';
        
        if (empty($licenseId)) {
            setFlash('Lisans ID gerekli', 'error');
        } else {
            $result = $supabaseAdmin->resetHardwareId($licenseId);
            
            if ($result && !isset($result['error'])) {
                setFlash('Hardware ID başarıyla sıfırlandı', 'success');
            } else {
                setFlash('Hardware ID sıfırlanamadı', 'error');
            }
        }
        redirect('/admin/licenses.php');
    }
}

// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    redirect('/admin/licenses.php');
}

$pageTitle = __('admin.licenses_title') . ' - Autrex Admin';
$pageHeading = __('admin.licenses_title');

// Fetch all licenses using admin client
$licenses = $supabaseAdmin->select('licenses', '*', [], 'created_at.desc', 1000);

// Fetch all users for assignment
$allUsers = $supabaseAdmin->getAuthUsers();

// Debug: Log what we got
error_log("Licenses response: " . print_r($licenses, true));

if (!is_array($licenses) || isset($licenses['error'])) {
    if (isset($licenses['error'])) {
        error_log("License fetch error: " . print_r($licenses, true));
        // Show error to admin
        setFlash('Supabase bağlantı hatası: ' . ($licenses['message'] ?? 'Bilinmeyen hata'), 'error');
    }
    $licenses = [];
}

include __DIR__ . '/../includes/admin-header.php';
?>

<!-- Actions Bar -->
<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div class="flex-1 max-w-md">
        <input 
            type="text" 
            id="searchInput"
            placeholder="Lisans anahtarı veya Hardware ID ara..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onkeyup="filterTable('searchInput', 'licensesTable')"
        >
    </div>
    
    <div class="flex gap-2">
        <button 
            onclick="openModal('createLicenseModal')"
            class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <?php echo __('admin.create_license'); ?>
        </button>
        
        <button 
            onclick="openModal('bulkCreateModal')"
            class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
            <?php echo __('admin.bulk_create'); ?>
        </button>
    </div>
</div>

<!-- Licenses Table -->
<div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full" id="licensesTable">
            <thead>
                <tr>
                    <th class="text-left px-6 py-3"><?php echo __('admin.license_key'); ?></th>
                    <th class="text-left px-6 py-3">Sahip</th>
                    <th class="text-left px-6 py-3"><?php echo __('admin.type'); ?></th>
                    <th class="text-left px-6 py-3"><?php echo __('admin.status'); ?></th>
                    <th class="text-left px-6 py-3"><?php echo __('admin.activations'); ?></th>
                    <th class="text-left px-6 py-3">Hardware ID</th>
                    <th class="text-left px-6 py-3"><?php echo __('admin.created_at'); ?></th>
                    <th class="text-left px-6 py-3">Kalan Süre</th>
                    <th class="text-left px-6 py-3"><?php echo __('admin.actions'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($licenses)): ?>
                <tr>
                    <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                        Henüz lisans yok. Yeni lisans oluşturun.
                    </td>
                </tr>
                <?php else: ?>
                    <?php foreach ($licenses as $license): ?>
                    <?php
                    // Gerçek Supabase kolon isimleri
                    $licenseKey = $license['key'] ?? 'N/A';  // NOT license_key!
                    $licenseType = $license['type'] ?? 'unknown';
                    $isActive = $license['is_active'] ?? false;  // NOT status!
                    $licenseStatus = $isActive ? 'active' : 'inactive';
                    $hardwareId = $license['hardware_id'] ?? null;
                    $createdAt = $license['created_at'] ?? '';
                    $activatedAt = $license['activated_at'] ?? null;
                    $expiresAt = $license['expires_at'] ?? null;
                    $licenseId = $license['id'] ?? '';
                    $activationCount = $license['activation_count'] ?? 0;  // NOT current_activations!
                    $metadata = $license['metadata'] ?? [];
                    $maxActivations = is_array($metadata) ? ($metadata['max_activations'] ?? 1) : 1;
                    $notes = is_array($metadata) ? ($metadata['notes'] ?? '') : '';
                    ?>
                    <tr>
                        <td class="px-6 py-4">
                            <div class="flex items-center">
                                <span class="font-mono text-sm mr-2"><?php echo e($licenseKey); ?></span>
                                <button 
                                    onclick="copyToClipboard('<?php echo e($licenseKey); ?>')"
                                    class="text-gray-400 hover:text-gray-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm">
                            <?php 
                            $owner = $supabaseAdmin->getLicenseOwner($licenseId);
                            if ($owner) {
                                echo '<span class="text-blue-600 font-medium">' . e($owner['email']) . '</span>';
                            } else {
                                echo '<span class="text-gray-500 italic">Sahipsiz</span>';
                            }
                            ?>
                        </td>
                        <td class="px-6 py-4">
                            <span class="badge badge-info"><?php echo e(ucfirst($licenseType)); ?></span>
                        </td>
                        <td class="px-6 py-4">
                            <?php
                            $statusClass = 'badge-info';
                            if ($licenseStatus === 'active') $statusClass = 'badge-success';
                            elseif ($licenseStatus === 'expired') $statusClass = 'badge-warning';
                            elseif ($licenseStatus === 'banned') $statusClass = 'badge-danger';
                            ?>
                            <span class="badge <?php echo $statusClass; ?>">
                                <?php echo e(ucfirst($licenseStatus)); ?>
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm"><?php echo $activationCount; ?> / <?php echo $maxActivations; ?></span>
                        </td>
                        <td class="px-6 py-4">
                            <?php if ($hardwareId): ?>
                            <span class="font-mono text-xs"><?php echo e(substr($hardwareId, 0, 12)); ?>...</span>
                            <?php else: ?>
                            <span class="text-gray-400">-</span>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4"><?php echo $createdAt ? formatDate($createdAt) : '-'; ?></td>
                        <td class="px-6 py-4">
                            <?php 
                            if ($expiresAt) {
                                // Lisans aktive edilmiş ve süresi var
                                $expiresIso = ensureIsoFormat($expiresAt);
                                echo '<span class="countdown" data-expires-iso="' . e($expiresIso) . '">Hesaplanıyor...</span>';
                            } elseif ($activatedAt) {
                                // Aktive edilmiş ama süresiz
                                echo '<span class="text-green-600 font-semibold">♾️ Süresiz</span>';
                            } else {
                                // Henüz aktive edilmemiş
                                echo '<span class="text-blue-600 font-semibold">🔓 Henüz Kullanılmadı</span>';
                            }
                            ?>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex gap-2">
                                <button 
                                    onclick="viewLicense('<?php echo e($licenseId); ?>')"
                                    class="text-blue-600 hover:text-blue-800"
                                    title="Detaylar">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                                <?php if ($hardwareId): ?>
                                <button 
                                    onclick="resetHardwareId('<?php echo e($licenseId); ?>', '<?php echo e($licenseKey); ?>')"
                                    class="text-orange-600 hover:text-orange-800"
                                    title="Hardware ID Sıfırla">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                </button>
                                <?php endif; ?>
                                <button 
                                    onclick="toggleLicenseStatus('<?php echo e($licenseId); ?>', '<?php echo e($licenseStatus); ?>')"
                                    class="text-yellow-600 hover:text-yellow-800"
                                    title="Durumu Değiştir">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                    </svg>
                                </button>
                                <button 
                                    onclick="openAssignModal('<?php echo e($licenseId); ?>', '<?php echo e($licenseKey); ?>')"
                                    class="text-green-600 hover:text-green-800"
                                    title="Kullanıcıya Ata">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Create License Modal -->
<div id="createLicenseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold"><?php echo __('admin.create_license'); ?></h3>
            <button onclick="closeModal('createLicenseModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form method="POST" id="createLicenseForm" class="p-6 space-y-4">
            <input type="hidden" name="action" value="create_license">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"><?php echo __('admin.type'); ?></label>
                <select name="type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="trial">Trial (6 saat)</option>
                    <option value="daily">Daily (1 gün)</option>
                    <option value="weekly">Weekly (7 gün)</option>
                    <option value="monthly">Monthly (30 gün)</option>
                    <option value="regular">Regular (Süresiz)</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max Aktivasyon</label>
                <input type="number" name="max_activations" value="1" min="1" max="10" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notlar (Opsiyonel)</label>
                <textarea name="notes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Lisans hakkında notlar..."></textarea>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Oluştur
                </button>
                <button type="button" onclick="closeModal('createLicenseModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Bulk Create Modal -->
<div id="bulkCreateModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold"><?php echo __('admin.bulk_create'); ?></h3>
            <button onclick="closeModal('bulkCreateModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form method="POST" id="bulkCreateForm" class="p-6 space-y-4">
            <input type="hidden" name="action" value="bulk_create">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"><?php echo __('admin.type'); ?></label>
                <select name="type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="trial">Trial (6 saat)</option>
                    <option value="daily">Daily (1 gün)</option>
                    <option value="weekly">Weekly (7 gün)</option>
                    <option value="monthly">Monthly (30 gün)</option>
                    <option value="regular">Regular (Süresiz)</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Adet</label>
                <input type="number" name="count" value="10" min="1" max="100" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-gray-500 mt-1">Maksimum 100 lisans oluşturabilirsiniz</p>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Oluştur
                </button>
                <button type="button" onclick="closeModal('bulkCreateModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    </div>
</div>

<!-- License Details Modal -->
<div id="licenseDetailsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 class="text-lg font-semibold">Lisans Detayları</h3>
            <button onclick="closeModal('licenseDetailsModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <div id="licenseDetailsContent" class="p-6">
            <!-- Content will be loaded dynamically -->
        </div>
    </div>
</div>

<script>
const licensesData = <?php echo json_encode($licenses); ?>;

function viewLicense(id) {
    const license = licensesData.find(l => l.id === id);
    if (!license) {
        alert('Lisans bulunamadı');
        return;
    }
    
    // Gerçek kolon isimleri
    const licenseKey = license.key || 'N/A';  // NOT license_key!
    const createdAt = license.created_at ? new Date(license.created_at).toLocaleString('tr-TR') : '-';
    const expiresAt = license.expires_at ? new Date(license.expires_at).toLocaleString('tr-TR') : 'Süresiz';
    const activatedAt = license.activated_at ? new Date(license.activated_at).toLocaleString('tr-TR') : '-';
    const isActive = license.is_active || false;
    const status = isActive ? 'active' : 'inactive';
    const activationCount = license.activation_count || 0;
    const metadata = license.metadata || {};
    const maxActivations = metadata.max_activations || 1;
    const notes = metadata.notes || '';
    
    const content = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-gray-600">Lisans Anahtarı</label>
                    <div class="flex items-center mt-1">
                        <p class="font-mono text-sm">${licenseKey}</p>
                        <button onclick="copyToClipboard('${licenseKey}')" class="ml-2 text-primary-500 hover:text-primary-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Tip</label>
                    <p class="mt-1"><span class="badge badge-info">${license.type}</span></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Durum</label>
                    <p class="mt-1"><span class="badge ${status === 'active' ? 'badge-success' : 'badge-warning'}">${status}</span></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Aktivasyonlar</label>
                    <p class="mt-1">${activationCount} / ${maxActivations}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Oluşturulma</label>
                    <p class="mt-1">${createdAt}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Aktivasyon Tarihi</label>
                    <p class="mt-1">${activatedAt}</p>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-medium text-gray-600">Bitiş Tarihi</label>
                    <p class="mt-1">${expiresAt}</p>
                </div>
            </div>
            
            ${license.hardware_id ? `
            <div>
                <label class="text-sm font-medium text-gray-600">Hardware ID</label>
                <p class="mt-1 font-mono text-sm break-all">${license.hardware_id}</p>
            </div>
            ` : ''}
            
            ${notes ? `
            <div>
                <label class="text-sm font-medium text-gray-600">Notlar</label>
                <p class="mt-1 text-sm text-gray-700">${notes}</p>
            </div>
            ` : ''}
            
            <div class="pt-4 border-t border-gray-200 flex gap-2">
                <button onclick="toggleLicenseStatus('${license.id}', '${status}')" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg">
                    ${status === 'active' ? 'Devre Dışı Bırak' : 'Aktif Et'}
                </button>
                <button onclick="closeModal('licenseDetailsModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    Kapat
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('licenseDetailsContent').innerHTML = content;
    openModal('licenseDetailsModal');
}

function toggleLicenseStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`Lisans durumunu ${newStatus} yapmak istiyor musunuz?`)) {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="update_status">
            <input type="hidden" name="license_id" value="${id}">
            <input type="hidden" name="new_status" value="${newStatus}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

function resetHardwareId(licenseId, licenseKey) {
    if (confirm(`${licenseKey} lisansının Hardware ID'sini sıfırlamak istiyor musunuz?\n\nBu işlem lisansın yeni bir cihazda kullanılmasına izin verecektir.`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="reset_hardware">
            <input type="hidden" name="license_id" value="${licenseId}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

// Create license form handler - now submits to server
// Bulk create form handler - now submits to server

// Assign license modal
const allUsers = <?php echo json_encode($allUsers); ?>;

function openAssignModal(licenseId, licenseKey) {
    document.getElementById('assignLicenseId').value = licenseId;
    document.getElementById('assignLicenseKey').textContent = licenseKey;
    
    // Populate user select
    const userSelect = document.getElementById('assignUserId');
    userSelect.innerHTML = '<option value="">Kullanıcı Seçin...</option>';
    
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.email} (${user.id.substring(0, 8)}...)`;
        userSelect.appendChild(option);
    });
    
    openModal('assignLicenseModal');
}
</script>

<!-- Assign License Modal -->
<div id="assignLicenseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold">Lisansı Kullanıcıya Ata</h3>
            <button onclick="closeModal('assignLicenseModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" value="assign_license">
            <input type="hidden" name="license_id" id="assignLicenseId">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lisans Anahtarı</label>
                <p class="font-mono text-sm bg-gray-100 p-2 rounded" id="assignLicenseKey"></p>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Kullanıcı</label>
                <select name="user_id" id="assignUserId" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="">Kullanıcı Seçin...</option>
                </select>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Ata
                </button>
                <button type="button" onclick="closeModal('assignLicenseModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    </div>
</div>

<script>
// Countdown Timer System
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
</script>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
