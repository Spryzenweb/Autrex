<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

requireAdmin();

$pageTitle = 'Kullanıcı Yönetimi - Autrex Admin';
$pageHeading = 'Kullanıcı Yönetimi';

// Handle assign license action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'assign_license') {
        $userId = $_POST['user_id'] ?? '';
        $licenseId = $_POST['license_id'] ?? '';
        
        if ($userId && $licenseId) {
            // Check if already assigned
            $existing = $supabaseAdmin->select('user_licenses', '*', [
                'user_id' => $userId,
                'license_id' => $licenseId
            ]);
            
            if (empty($existing) || !is_array($existing)) {
                $result = $supabaseAdmin->insert('user_licenses', [
                    'user_id' => $userId,
                    'license_id' => $licenseId
                ]);
                
                if ($result && !isset($result['error'])) {
                    setFlash('Lisans başarıyla atandı', 'success');
                } else {
                    setFlash('Lisans atanamadı: ' . ($result['message'] ?? 'Bilinmeyen hata'), 'error');
                }
            } else {
                setFlash('Bu lisans zaten bu kullanıcıya atanmış', 'error');
            }
        }
        redirect('/admin/users.php');
    }
    
    if ($_POST['action'] === 'ban_user') {
        $userId = $_POST['user_id'] ?? '';
        if ($userId) {
            $result = $supabaseAdmin->banUser($userId);
            if ($result && !isset($result['error'])) {
                setFlash('Kullanıcı yasaklandı', 'success');
            } else {
                setFlash('Kullanıcı yasaklanamadı', 'error');
            }
        }
        redirect('/admin/users.php');
    }
    
    if ($_POST['action'] === 'unban_user') {
        $userId = $_POST['user_id'] ?? '';
        if ($userId) {
            $result = $supabaseAdmin->unbanUser($userId);
            if ($result && !isset($result['error'])) {
                setFlash('Kullanıcı yasağı kaldırıldı', 'success');
            } else {
                setFlash('Kullanıcı yasağı kaldırılamadı', 'error');
            }
        }
        redirect('/admin/users.php');
    }
    
    if ($_POST['action'] === 'confirm_email') {
        $userId = $_POST['user_id'] ?? '';
        if ($userId) {
            $result = $supabaseAdmin->confirmUserEmail($userId);
            if ($result && !isset($result['error'])) {
                setFlash('Email doğrulandı', 'success');
            } else {
                setFlash('Email doğrulanamadı', 'error');
            }
        }
        redirect('/admin/users.php');
    }
    
    if ($_POST['action'] === 'send_password_reset') {
        $email = $_POST['email'] ?? '';
        if ($email) {
            $result = $supabaseAdmin->sendPasswordReset($email);
            if ($result && !isset($result['error'])) {
                setFlash('Şifre sıfırlama emaili gönderildi', 'success');
            } else {
                setFlash('Email gönderilemedi', 'error');
            }
        }
        redirect('/admin/users.php');
    }
    
    if ($_POST['action'] === 'delete_user') {
        $userId = $_POST['user_id'] ?? '';
        if ($userId) {
            // First delete user's licenses
            $supabaseAdmin->delete('user_licenses', ['user_id' => $userId]);
            // Then delete user
            $result = $supabaseAdmin->deleteUser($userId);
            if ($result && !isset($result['error'])) {
                setFlash('Kullanıcı silindi', 'success');
            } else {
                setFlash('Kullanıcı silinemedi', 'error');
            }
        }
        redirect('/admin/users.php');
    }
}

// Fetch all users from auth.users via Supabase Admin API
$authUsers = $supabaseAdmin->getAuthUsers();

// Fetch user licenses
$userLicenses = $supabaseAdmin->select('user_licenses', '*', []);
if (!is_array($userLicenses)) {
    $userLicenses = [];
}

// Fetch available licenses (inactive ones)
$availableLicenses = $supabaseAdmin->select('licenses', '*', ['status' => 'inactive']);
if (!is_array($availableLicenses)) {
    $availableLicenses = [];
}

include __DIR__ . '/../includes/admin-header.php';
?>

<!-- Actions Bar -->
<div class="mb-6 flex justify-between items-center">
    <div class="flex-1 max-w-md">
        <input 
            type="text" 
            id="searchInput"
            placeholder="Email veya ID ara..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            onkeyup="filterTable('searchInput', 'usersTable')"
        >
    </div>
    
    <button 
        onclick="openModal('assignLicenseModal')"
        class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg">
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Lisans Ata
    </button>
</div>

<!-- Stats -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Toplam Kullanıcı</p>
                <p class="text-3xl font-bold text-gray-900 mt-2"><?php echo count($authUsers); ?></p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Lisanslı Kullanıcı</p>
                <p class="text-3xl font-bold text-green-600 mt-2"><?php echo count($userLicenses); ?></p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-600 text-sm font-medium">Atanabilir Lisans</p>
                <p class="text-3xl font-bold text-purple-600 mt-2"><?php echo count($availableLicenses); ?></p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Users Table -->
<div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold">Kullanıcılar ve Lisansları</h3>
    </div>
    
    <div class="overflow-x-auto">
        <table class="w-full" id="usersTable">
            <thead>
                <tr>
                    <th class="text-left px-6 py-3">Kullanıcı</th>
                    <th class="text-left px-6 py-3">Email Durumu</th>
                    <th class="text-left px-6 py-3">Lisans Sayısı</th>
                    <th class="text-left px-6 py-3">Kayıt Tarihi</th>
                    <th class="text-left px-6 py-3">İşlemler</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($authUsers)): ?>
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        Henüz kullanıcı yok
                    </td>
                </tr>
                <?php else: ?>
                    <?php foreach ($authUsers as $user): ?>
                    <?php
                    $userId = $user['id'];
                    $userEmail = $user['email'] ?? 'N/A';
                    $createdAt = $user['created_at'] ?? '';
                    $emailConfirmed = !empty($user['email_confirmed_at']);
                    $isBanned = !empty($user['banned_until']) && strtotime($user['banned_until']) > time();
                    
                    // Get user's licenses
                    $userLicensesList = array_filter($userLicenses, function($ul) use ($userId) {
                        return $ul['user_id'] === $userId;
                    });
                    $licenseCount = count($userLicensesList);
                    ?>
                    <tr class="<?php echo $isBanned ? 'bg-red-50' : ''; ?>">
                        <td class="px-6 py-4">
                            <div>
                                <p class="font-medium <?php echo $isBanned ? 'text-red-600' : ''; ?>">
                                    <?php echo e($userEmail); ?>
                                    <?php if ($isBanned): ?>
                                    <span class="ml-2 badge badge-danger">Yasaklı</span>
                                    <?php endif; ?>
                                </p>
                                <p class="text-xs text-gray-500 font-mono"><?php echo e(substr($userId, 0, 8)); ?>...</p>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <?php if ($emailConfirmed): ?>
                            <span class="badge badge-success">Doğrulandı</span>
                            <?php else: ?>
                            <span class="badge badge-warning">Bekliyor</span>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4">
                            <?php if ($licenseCount > 0): ?>
                            <span class="badge badge-info"><?php echo $licenseCount; ?> Lisans</span>
                            <?php else: ?>
                            <span class="text-gray-400">-</span>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4">
                            <?php echo formatDate($createdAt); ?>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex gap-2">
                                <a 
                                    href="/admin/user-detail.php?id=<?php echo e($userId); ?>"
                                    class="text-blue-600 hover:text-blue-800"
                                    title="Detaylar">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </a>
                                
                                <?php if (!$emailConfirmed): ?>
                                <button 
                                    onclick="confirmEmail('<?php echo e($userId); ?>')"
                                    class="text-green-600 hover:text-green-800"
                                    title="Email Doğrula">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </button>
                                <?php endif; ?>
                                
                                <button 
                                    onclick="sendPasswordReset('<?php echo e($userEmail); ?>')"
                                    class="text-yellow-600 hover:text-yellow-800"
                                    title="Şifre Sıfırlama Gönder">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                    </svg>
                                </button>
                                
                                <?php if ($isBanned): ?>
                                <button 
                                    onclick="unbanUser('<?php echo e($userId); ?>', '<?php echo e($userEmail); ?>')"
                                    class="text-green-600 hover:text-green-800"
                                    title="Yasağı Kaldır">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </button>
                                <?php else: ?>
                                <button 
                                    onclick="banUser('<?php echo e($userId); ?>', '<?php echo e($userEmail); ?>')"
                                    class="text-red-600 hover:text-red-800"
                                    title="Yasakla">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                    </svg>
                                </button>
                                <?php endif; ?>
                                
                                <button 
                                    onclick="deleteUser('<?php echo e($userId); ?>', '<?php echo e($userEmail); ?>')"
                                    class="text-red-600 hover:text-red-800"
                                    title="Kullanıcıyı Sil">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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

<!-- Assign License Modal -->
<div id="assignLicenseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold">Kullanıcıya Lisans Ata</h3>
            <button onclick="closeModal('assignLicenseModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" value="assign_license">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Kullanıcı ID</label>
                <input 
                    type="text" 
                    name="user_id" 
                    id="assign_user_id"
                    required 
                    placeholder="UUID formatında kullanıcı ID"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-gray-500 mt-1">Kullanıcının Supabase UUID'si</p>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lisans Seç</label>
                <select name="license_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="">Lisans seçin...</option>
                    <?php foreach ($availableLicenses as $license): ?>
                    <option value="<?php echo e($license['id']); ?>">
                        <?php echo e($license['license_key']); ?> (<?php echo e($license['type']); ?>)
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Ata
                </button>
                <button type="button" onclick="closeModal('assignLicenseModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    </div>
</div>

<!-- User Licenses Modal -->
<div id="userLicensesModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 class="text-lg font-semibold">Kullanıcı Lisansları</h3>
            <button onclick="closeModal('userLicensesModal')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <div id="userLicensesContent" class="p-6">
            <!-- Content will be loaded dynamically -->
        </div>
    </div>
</div>

<script>
const userLicensesData = <?php echo json_encode($userLicenses); ?>;
const allLicenses = <?php echo json_encode($supabaseAdmin->select('licenses', '*', [])); ?>;

function viewUserLicenses(userId) {
    const userLics = userLicensesData.filter(ul => ul.user_id === userId);
    
    if (userLics.length === 0) {
        showToast('Bu kullanıcının lisansı yok', 'error');
        return;
    }
    
    let content = `
        <div class="mb-4">
            <p class="text-sm text-gray-600">Kullanıcı ID: <span class="font-mono">${userId}</span></p>
            <p class="text-sm text-gray-600">Toplam Lisans: ${userLics.length}</p>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="text-left px-4 py-2">Lisans Anahtarı</th>
                        <th class="text-left px-4 py-2">Tip</th>
                        <th class="text-left px-4 py-2">Durum</th>
                        <th class="text-left px-4 py-2">Satın Alma</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    userLics.forEach(ul => {
        const license = allLicenses.find(l => l.id === ul.license_id);
        if (license) {
            content += `
                <tr>
                    <td class="px-4 py-2 font-mono text-sm">${license.license_key}</td>
                    <td class="px-4 py-2"><span class="badge badge-info">${license.type}</span></td>
                    <td class="px-4 py-2"><span class="badge ${license.status === 'active' ? 'badge-success' : 'badge-warning'}">${license.status}</span></td>
                    <td class="px-4 py-2">${formatDate(ul.purchased_at)}</td>
                </tr>
            `;
        }
    });
    
    content += `
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('userLicensesContent').innerHTML = content;
    openModal('userLicensesModal');
}

function assignLicenseToUser(userId) {
    document.getElementById('assign_user_id').value = userId;
    openModal('assignLicenseModal');
}

function banUser(userId, email) {
    if (confirm(`${email} kullanıcısını yasaklamak istiyor musunuz?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="ban_user">
            <input type="hidden" name="user_id" value="${userId}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

function unbanUser(userId, email) {
    if (confirm(`${email} kullanıcısının yasağını kaldırmak istiyor musunuz?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="unban_user">
            <input type="hidden" name="user_id" value="${userId}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

function confirmEmail(userId) {
    if (confirm('Bu kullanıcının emailini manuel olarak doğrulamak istiyor musunuz?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="confirm_email">
            <input type="hidden" name="user_id" value="${userId}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

function sendPasswordReset(email) {
    if (confirm(`${email} adresine şifre sıfırlama emaili göndermek istiyor musunuz?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="action" value="send_password_reset">
            <input type="hidden" name="email" value="${email}">
        `;
        document.body.appendChild(form);
        form.submit();
    }
}

function deleteUser(userId, email) {
    if (confirm(`UYARI: ${email} kullanıcısını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`)) {
        if (confirm('Emin misiniz? Kullanıcının tüm verileri silinecek!')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.innerHTML = `
                <input type="hidden" name="action" value="delete_user">
                <input type="hidden" name="user_id" value="${userId}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
    }
}
</script>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
