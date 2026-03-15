<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

requireAdmin();

// Get user ID from query string
$userId = $_GET['id'] ?? '';
if (empty($userId)) {
    setFlash('Kullanıcı ID gerekli', 'error');
    redirect('/admin/users.php');
}

// Handle license operations
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $licenseId = $_POST['license_id'] ?? '';
    
    if ($_POST['action'] === 'add_time') {
        $hours = intval($_POST['hours'] ?? 0);
        if ($hours > 0 && $licenseId) {
            $result = $supabaseAdmin->addLicenseTime($licenseId, $hours);
            if ($result && !isset($result['error'])) {
                setFlash("Lisansa $hours saat eklendi", 'success');
            } else {
                setFlash('Süre eklenemedi', 'error');
            }
        }
    }
    
    if ($_POST['action'] === 'reset_hardware') {
        if ($licenseId) {
            $result = $supabaseAdmin->resetHardwareId($licenseId);
            if ($result && !isset($result['error'])) {
                setFlash('Hardware ID sıfırlandı', 'success');
            } else {
                setFlash('Hardware ID sıfırlanamadı', 'error');
            }
        }
    }
    
    if ($_POST['action'] === 'toggle_status') {
        if ($licenseId) {
            $result = $supabaseAdmin->toggleLicenseStatus($licenseId);
            if ($result && !isset($result['error'])) {
                setFlash('Lisans durumu değiştirildi', 'success');
            } else {
                setFlash('Durum değiştirilemedi', 'error');
            }
        }
    }
    
    if ($_POST['action'] === 'assign_existing') {
        if ($licenseId) {
            $result = $supabaseAdmin->assignLicenseToUser($licenseId, $userId);
            if ($result && !isset($result['error'])) {
                setFlash('Lisans başarıyla atandı', 'success');
            } else {
                setFlash('Lisans atanamadı: ' . ($result['message'] ?? 'Bilinmeyen hata'), 'error');
            }
        }
    }
    
    if ($_POST['action'] === 'create_and_assign') {
        $type = $_POST['type'] ?? 'trial';
        $maxActivations = intval($_POST['max_activations'] ?? 1);
        
        // Create license
        $license = $supabaseAdmin->createLicense($type, $maxActivations, "Kullanıcıya atandı");
        if ($license && !isset($license['error'])) {
            $newLicenseId = $license['id'] ?? null;
            if ($newLicenseId) {
                // Assign to user
                $result = $supabaseAdmin->assignLicenseToUser($newLicenseId, $userId);
                if ($result && !isset($result['error'])) {
                    setFlash('Yeni lisans oluşturuldu ve atandı', 'success');
                } else {
                    setFlash('Lisans oluşturuldu ama atanamadı', 'error');
                }
            }
        } else {
            setFlash('Lisans oluşturulamadı', 'error');
        }
    }
    
    if ($_POST['action'] === 'add_balance') {
        $amount = floatval($_POST['amount'] ?? 0);
        $description = $_POST['description'] ?? null;
        
        if ($amount > 0) {
            $result = $supabaseAdmin->addBalance($userId, $amount, $description);
            if ($result && !isset($result['error'])) {
                setFlash("₺{$amount} bakiye eklendi", 'success');
            } else {
                setFlash('Bakiye eklenemedi', 'error');
            }
        } else {
            setFlash('Geçersiz tutar', 'error');
        }
    }
    
    redirect('/admin/user-detail.php?id=' . urlencode($userId));
}

// Fetch user details
$authUsers = $supabaseAdmin->getAuthUsers();
$user = null;
foreach ($authUsers as $u) {
    if ($u['id'] === $userId) {
        $user = $u;
        break;
    }
}

if (!$user) {
    setFlash('Kullanıcı bulunamadı', 'error');
    redirect('/admin/users.php');
}

// Fetch user's licenses
$userLicenses = $supabaseAdmin->getUserLicenses($userId);

// Fetch user balance and history
$userBalance = $supabaseAdmin->getBalance($userId);
$balanceHistory = $supabaseAdmin->getBalanceHistory($userId, 10);

// Fetch unassigned licenses (sahipsiz lisanslar)
$allLicenses = $supabaseAdmin->select('licenses', '*', []);
$allUserLicenses = $supabaseAdmin->select('user_licenses', '*', []);
$assignedLicenseIds = array_column(is_array($allUserLicenses) ? $allUserLicenses : [], 'license_id');

$unassignedLicenses = [];
if (is_array($allLicenses)) {
    foreach ($allLicenses as $license) {
        if (!in_array($license['id'], $assignedLicenseIds)) {
            $unassignedLicenses[] = $license;
        }
    }
}

$pageTitle = 'Kullanıcı Detayları - ' . ($user['email'] ?? 'N/A');
$pageHeading = 'Kullanıcı Detayları';

include __DIR__ . '/../includes/admin-header.php';
?>

<!-- Back Button -->
<div class="mb-6">
    <a href="/admin/users.php" class="text-primary-600 hover:text-primary-700 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Kullanıcı Listesine Dön
    </a>
</div>

<!-- User Info Card -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="text-sm font-medium text-gray-600">Email</label>
            <p class="text-lg font-semibold"><?php echo e($user['email'] ?? 'N/A'); ?></p>
        </div>
        <div>
            <label class="text-sm font-medium text-gray-600">Kullanıcı ID</label>
            <p class="font-mono text-sm"><?php echo e($userId); ?></p>
        </div>
        <div>
            <label class="text-sm font-medium text-gray-600">Email Durumu</label>
            <p>
                <?php if (!empty($user['email_confirmed_at'])): ?>
                <span class="badge badge-success">Doğrulandı</span>
                <?php else: ?>
                <span class="badge badge-warning">Bekliyor</span>
                <?php endif; ?>
            </p>
        </div>
        <div>
            <label class="text-sm font-medium text-gray-600">Kayıt Tarihi</label>
            <p><?php echo formatDate($user['created_at'] ?? ''); ?></p>
        </div>
        <div>
            <label class="text-sm font-medium text-gray-600">Bakiye</label>
            <p class="text-2xl font-bold text-green-600">₺<?php echo number_format($userBalance, 2); ?></p>
        </div>
    </div>
</div>

<!-- Balance Management -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Bakiye Yönetimi</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Add Balance Form -->
        <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Bakiye Ekle</h3>
            <form method="POST" class="space-y-3">
                <input type="hidden" name="action" value="add_balance">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
                    <input type="number" name="amount" step="0.01" min="0.01" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama (Opsiyonel)</label>
                    <input type="text" name="description" placeholder="Örn: Promosyon bakiyesi" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Bakiye Ekle
                </button>
            </form>
        </div>
        
        <!-- Balance History -->
        <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Son İşlemler</h3>
            <?php if (empty($balanceHistory)): ?>
            <p class="text-gray-500 text-sm">Henüz işlem yok</p>
            <?php else: ?>
            <div class="space-y-2 max-h-64 overflow-y-auto">
                <?php foreach ($balanceHistory as $transaction): ?>
                <?php
                $amount = floatval($transaction['amount'] ?? 0);
                $type = $transaction['type'] ?? '';
                $description = $transaction['description'] ?? '';
                $createdAt = $transaction['created_at'] ?? '';
                
                $typeLabel = '';
                $typeColor = '';
                $sign = '';
                
                if ($type === 'credit') {
                    $typeLabel = 'Eklendi';
                    $typeColor = 'text-green-600';
                    $sign = '+';
                } elseif ($type === 'debit') {
                    $typeLabel = 'Düşüldü';
                    $typeColor = 'text-red-600';
                    $sign = '-';
                } elseif ($type === 'purchase') {
                    $typeLabel = 'Satın Alma';
                    $typeColor = 'text-blue-600';
                    $sign = '-';
                }
                ?>
                <div class="flex justify-between items-start text-sm border-b border-gray-100 pb-2">
                    <div class="flex-1">
                        <p class="font-medium"><?php echo e($description); ?></p>
                        <p class="text-xs text-gray-500"><?php echo date('d.m.Y H:i', strtotime($createdAt)); ?></p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold <?php echo $typeColor; ?>"><?php echo $sign; ?>₺<?php echo number_format($amount, 2); ?></p>
                        <p class="text-xs text-gray-500"><?php echo $typeLabel; ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Assign License Section -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Lisans Ata</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Assign Existing License -->
        <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Mevcut Lisans Ata</h3>
            <?php if (empty($unassignedLicenses)): ?>
            <p class="text-gray-500 text-sm">Sahipsiz lisans yok</p>
            <?php else: ?>
            <form method="POST" class="space-y-3">
                <input type="hidden" name="action" value="assign_existing">
                <select name="license_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="">Lisans Seçin...</option>
                    <?php foreach ($unassignedLicenses as $license): ?>
                    <option value="<?php echo e($license['id']); ?>">
                        <?php echo e($license['key']); ?> - <?php echo e(ucfirst($license['type'])); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Lisansı Ata
                </button>
            </form>
            <?php endif; ?>
        </div>
        
        <!-- Create and Assign New License -->
        <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Yeni Lisans Oluştur ve Ata</h3>
            <form method="POST" class="space-y-3">
                <input type="hidden" name="action" value="create_and_assign">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                    <select name="type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                        <option value="trial">Trial (6 saat)</option>
                        <option value="daily">Daily (1 gün)</option>
                        <option value="weekly">Weekly (7 gün)</option>
                        <option value="monthly">Monthly (30 gün)</option>
                        <option value="regular">Regular (Süresiz)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Aktivasyon</label>
                    <input type="number" name="max_activations" value="1" min="1" max="10" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Oluştur ve Ata
                </button>
            </form>
        </div>
    </div>
</div>

<!-- User Licenses -->
<div class="bg-white rounded-lg shadow-md">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold">Kullanıcı Lisansları (<?php echo count($userLicenses); ?>)</h3>
    </div>
    
    <?php if (empty($userLicenses)): ?>
    <div class="p-6 text-center text-gray-500">
        Bu kullanıcının henüz lisansı yok
    </div>
    <?php else: ?>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left px-6 py-3">Lisans Anahtarı</th>
                    <th class="text-left px-6 py-3">Tip</th>
                    <th class="text-left px-6 py-3">Durum</th>
                    <th class="text-left px-6 py-3">Kalan Süre</th>
                    <th class="text-left px-6 py-3">Hardware ID</th>
                    <th class="text-left px-6 py-3">İşlemler</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($userLicenses as $license): ?>
                <?php
                $licenseKey = $license['key'] ?? 'N/A';
                $licenseType = $license['type'] ?? 'unknown';
                $isActive = $license['is_active'] ?? false;
                $expiresAt = $license['expires_at'] ?? null;
                $activatedAt = $license['activated_at'] ?? null;
                $hardwareId = $license['hardware_id'] ?? null;
                $licenseId = $license['id'] ?? '';
                ?>
                <tr>
                    <td class="px-6 py-4">
                        <span class="font-mono text-sm"><?php echo e($licenseKey); ?></span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="badge badge-info"><?php echo e(ucfirst($licenseType)); ?></span>
                    </td>
                    <td class="px-6 py-4">
                        <?php if ($isActive): ?>
                        <span class="badge badge-success">Aktif</span>
                        <?php else: ?>
                        <span class="badge badge-warning">Pasif</span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4">
                        <?php 
                        if ($expiresAt) {
                            $expiresIso = ensureIsoFormat($expiresAt);
                            echo '<span class="countdown" data-expires-iso="' . e($expiresIso) . '">Hesaplanıyor...</span>';
                        } elseif ($activatedAt) {
                            echo '<span class="text-green-600 font-semibold">♾️ Süresiz</span>';
                        } else {
                            echo '<span class="text-blue-600 font-semibold">🔓 Henüz Kullanılmadı</span>';
                        }
                        ?>
                    </td>
                    <td class="px-6 py-4">
                        <?php if ($hardwareId): ?>
                        <span class="font-mono text-xs"><?php echo e(substr($hardwareId, 0, 12)); ?>...</span>
                        <?php else: ?>
                        <span class="text-gray-400">-</span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button 
                                onclick="openAddTimeModal('<?php echo e($licenseId); ?>', '<?php echo e($licenseKey); ?>')"
                                class="text-blue-600 hover:text-blue-800"
                                title="Süre Ekle">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </button>
                            <?php if ($hardwareId): ?>
                            <button 
                                onclick="resetHardware('<?php echo e($licenseId); ?>', '<?php echo e($licenseKey); ?>')"
                                class="text-yellow-600 hover:text-yellow-800"
                                title="Hardware ID Sıfırla">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                            </button>
                            <?php endif; ?>
                            <button 
                                onclick="toggleStatus('<?php echo e($licenseId); ?>', '<?php echo e($licenseKey); ?>', <?php echo $isActive ? 'true' : 'false'; ?>)"
                                class="text-green-600 hover:text-green-800"
                                title="Durumu Değiştir">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>
</div>

<!-- Add Time Modal -->
<div id="addTimeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold">Lisansa Süre Ekle</h3>
            <button onclick="closeModal('addTimeModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" value="add_time">
            <input type="hidden" name="license_id" id="addTimeLicenseId">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lisans Anahtarı</label>
                <p class="font-mono text-sm bg-gray-100 p-2 rounded" id="addTimeLicenseKey"></p>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Eklenecek Süre (Saat)</label>
                <input type="number" name="hours" min="1" max="8760" value="24" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-gray-500 mt-1">Maksimum 8760 saat (1 yıl)</p>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Süre Ekle
                </button>
                <button type="button" onclick="closeModal('addTimeModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    </div>
</div>

<script>
// Countdown Timer
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

updateCountdowns();
setInterval(updateCountdowns, 1000);

// Modal functions
function openAddTimeModal(licenseId, licenseKey) {
    document.getElementById('addTimeLicenseId').value = licenseId;
    document.getElementById('addTimeLicenseKey').textContent = licenseKey;
    openModal('addTimeModal');
}

function resetHardware(licenseId, licenseKey) {
    if (confirm(`${licenseKey} lisansının Hardware ID'sini sıfırlamak istiyor musunuz?`)) {
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

function toggleStatus(licenseId, licenseKey, isActive) {
    const newStatus = isActive ? 'pasif' : 'aktif';
    if (confirm(`${licenseKey} lisansını ${newStatus} yapmak istiyor musunuz?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="toggle_status">
            <input type="hidden" name="license_id" value="${licenseId}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}
</script>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
