<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase.php';
require_once __DIR__ . '/../includes/supabase-admin.php';

// Check if user is logged in
if (!isAuthenticated()) {
    redirect('/user-login.php');
}

$user = getCurrentUser();
$userId = $user['id'];

// Handle new ticket submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_ticket') {
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    $category = $_POST['category'] ?? 'general';
    $priority = $_POST['priority'] ?? 'normal';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Geçersiz istek');
        redirect('/user/support.php');
    }
    
    if (empty($subject) || empty($message)) {
        setFlash('error', 'Konu ve mesaj alanları zorunludur');
    } else {
        $result = $supabaseAdmin->insert('support_tickets', [
            'user_id' => $userId,
            'subject' => $subject,
            'message' => $message,
            'category' => $category,
            'priority' => $priority,
            'status' => 'open'
        ]);
        
        if (!isset($result['error'])) {
            setFlash('success', 'Destek talebiniz oluşturuldu');
            redirect('/user/support.php');
        } else {
            setFlash('error', 'Destek talebi oluşturulamadı');
        }
    }
}

// Handle ticket reply
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'reply_ticket') {
    $ticketId = $_POST['ticket_id'] ?? '';
    $message = $_POST['message'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        setFlash('error', 'Geçersiz istek');
        redirect('/user/support.php');
    }
    
    if (empty($ticketId) || empty($message)) {
        setFlash('error', 'Mesaj alanı zorunludur');
    } else {
        // Verify ticket belongs to user
        $ticket = $supabaseAdmin->select('support_tickets', '*', ['id' => $ticketId, 'user_id' => $userId]);
        if (!empty($ticket) && !isset($ticket['error'])) {
            $result = $supabaseAdmin->insert('support_ticket_replies', [
                'ticket_id' => $ticketId,
                'user_id' => $userId,
                'message' => $message,
                'is_admin' => false
            ]);
            
            if (!isset($result['error'])) {
                // Update ticket updated_at
                $supabaseAdmin->update('support_tickets', ['updated_at' => gmdate('Y-m-d\TH:i:s\Z')], ['id' => $ticketId]);
                setFlash('success', 'Cevabınız gönderildi');
            } else {
                setFlash('error', 'Cevap gönderilemedi');
            }
        } else {
            setFlash('error', 'Geçersiz talep');
        }
    }
    redirect('/user/support.php?ticket=' . $ticketId);
}

// Get user's tickets
$tickets = $supabaseAdmin->select('support_tickets', '*', ['user_id' => $userId], 'created_at.desc');
if (!is_array($tickets)) {
    $tickets = [];
}

// Get reply counts for each ticket
$ticketReplyCounts = [];
$ticketLastReplies = [];
foreach ($tickets as $ticket) {
    $replies = $supabaseAdmin->select('support_ticket_replies', '*', ['ticket_id' => $ticket['id']], 'created_at.desc');
    if (is_array($replies) && !isset($replies['error'])) {
        $ticketReplyCounts[$ticket['id']] = count($replies);
        if (!empty($replies)) {
            $ticketLastReplies[$ticket['id']] = $replies[0]; // Most recent reply
        }
    } else {
        $ticketReplyCounts[$ticket['id']] = 0;
    }
}

// If viewing a specific ticket
$viewingTicket = null;
$ticketReplies = [];
if (isset($_GET['ticket'])) {
    $ticketId = $_GET['ticket'];
    $ticketData = $supabaseAdmin->select('support_tickets', '*', ['id' => $ticketId, 'user_id' => $userId]);
    if (!empty($ticketData) && !isset($ticketData['error'])) {
        $viewingTicket = is_array($ticketData[0]) ? $ticketData[0] : $ticketData;
        
        // Get replies
        $replies = $supabaseAdmin->select('support_ticket_replies', '*', ['ticket_id' => $ticketId], 'created_at.asc');
        if (is_array($replies) && !isset($replies['error'])) {
            $ticketReplies = $replies;
        }
    }
}

$pageTitle = 'Destek - Autrex';

// Check if coming from license page with license_key
$prefillLicenseKey = $_GET['license_key'] ?? '';

include __DIR__ . '/../includes/user-header.php';
?>

<!-- Page Header -->
<div class="mb-8">
    <h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2">💬 Destek Taleplerim</h1>
    <p class="text-gray-600 dark:text-gray-400 text-lg">Sorularınız için destek talebi oluşturun veya mevcut taleplerinizi görüntüleyin</p>
</div>

<?php if ($viewingTicket): ?>
    <!-- Viewing Single Ticket -->
    <div class="mb-6">
        <a href="/user/support.php" class="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Tüm Taleplere Dön
        </a>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-3"><?php echo e($viewingTicket['subject']); ?></h2>
                <div class="flex items-center space-x-4 text-sm">
                    <span class="px-4 py-2 rounded-full font-bold <?php 
                        echo $viewingTicket['status'] === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            ($viewingTicket['status'] === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'); 
                    ?>">
                        <?php echo $viewingTicket['status'] === 'open' ? '🟢 Açık' : ($viewingTicket['status'] === 'in_progress' ? '🔵 İşlemde' : '⚫ Kapalı'); ?>
                    </span>
                    <span class="text-gray-600 dark:text-gray-400 font-medium">📅 <?php echo date('d.m.Y H:i', strtotime($viewingTicket['created_at'])); ?></span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 uppercase">
                        <?php echo e($viewingTicket['category']); ?>
                    </span>
                </div>
            </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"><?php echo e($viewingTicket['message']); ?></p>
        </div>
    </div>

    <!-- Replies -->
    <?php if (!empty($ticketReplies)): ?>
    <div class="space-y-4 mb-6">
        <?php foreach ($ticketReplies as $reply): ?>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 <?php echo $reply['is_admin'] ? 'border-purple-500/50 dark:border-purple-500/30' : 'border-gray-100 dark:border-gray-700'; ?>">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center <?php echo $reply['is_admin'] ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'; ?>">
                        <span class="text-white text-lg"><?php echo $reply['is_admin'] ? '🛡️' : '👤'; ?></span>
                    </div>
                    <div>
                        <span class="font-bold text-gray-900 dark:text-white">
                            <?php echo $reply['is_admin'] ? 'Destek Ekibi' : 'Siz'; ?>
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400"><?php echo date('d.m.Y H:i', strtotime($reply['created_at'])); ?></p>
                    </div>
                </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed ml-13"><?php echo e($reply['message']); ?></p>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <!-- Reply Form -->
    <?php if ($viewingTicket['status'] !== 'closed'): ?>
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
            Cevap Yaz
        </h3>
        <form method="POST" action="/user/support.php">
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
            <input type="hidden" name="action" value="reply_ticket">
            <input type="hidden" name="ticket_id" value="<?php echo e($viewingTicket['id']); ?>">
            
            <textarea name="message" rows="5" required
                class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Mesajınızı yazın..."></textarea>
            
            <div class="mt-4 flex justify-end">
                <button type="submit" class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    📤 Gönder
                </button>
            </div>
        </form>
    </div>
    <?php else: ?>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div class="text-5xl mb-4">🔒</div>
        <p class="text-gray-600 dark:text-gray-400 font-semibold">Bu talep kapatılmış. Yeni cevap eklenemez.</p>
    </div>
    <?php endif; ?>

<?php else: ?>
    <!-- Ticket List -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- New Ticket Form -->
        <div class="lg:col-span-1">
            <div class="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white sticky top-24">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-5xl">✉️</span>
                    </div>
                    <h2 class="text-2xl font-black mb-2">Yeni Talep Oluştur</h2>
                    <p class="text-purple-100">Sorununuzu detaylı olarak açıklayın</p>
                </div>
                <form method="POST" action="/user/support.php" class="space-y-4">
                    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">
                    <input type="hidden" name="action" value="create_ticket">
                    
                    <div>
                        <label class="block text-sm font-bold text-white mb-2">📝 Konu</label>
                        <input type="text" name="subject" required
                            value="<?php echo $prefillLicenseKey ? 'Lisans Sorunu: ' . e(substr($prefillLicenseKey, 0, 8)) . '...' : ''; ?>"
                            class="w-full px-4 py-3 bg-white/20 backdrop-blur border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white transition-all"
                            placeholder="Talep konusu">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-white mb-2">📂 Kategori</label>
                        <select name="category" class="w-full px-4 py-3 bg-white/20 backdrop-blur border-2 border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all">
                            <option value="general" class="text-gray-900" <?php echo !$prefillLicenseKey ? 'selected' : ''; ?>>Genel</option>
                            <option value="technical" class="text-gray-900">Teknik Destek</option>
                            <option value="billing" class="text-gray-900">Ödeme</option>
                            <option value="license" class="text-gray-900" <?php echo $prefillLicenseKey ? 'selected' : ''; ?>>Lisans</option>
                            <option value="other" class="text-gray-900">Diğer</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-white mb-2">⚡ Öncelik</label>
                        <select name="priority" class="w-full px-4 py-3 bg-white/20 backdrop-blur border-2 border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all">
                            <option value="low" class="text-gray-900">Düşük</option>
                            <option value="normal" selected class="text-gray-900">Normal</option>
                            <option value="high" class="text-gray-900">Yüksek</option>
                            <option value="urgent" class="text-gray-900">Acil</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-white mb-2">💬 Mesaj</label>
                        <textarea name="message" rows="6" required
                            class="w-full px-4 py-3 bg-white/20 backdrop-blur border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white transition-all"
                            placeholder="Sorununuzu detaylı olarak açıklayın..."><?php 
                            if ($prefillLicenseKey) {
                                echo "Lisans Anahtarı: " . e($prefillLicenseKey) . "\n\nSorunum:\n";
                            }
                        ?></textarea>
                    </div>
                    
                    <button type="submit" class="w-full px-6 py-4 bg-white text-purple-600 font-black rounded-xl hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                        🚀 Talep Oluştur
                    </button>
                </form>
            </div>
        </div>

        <!-- Tickets List -->
        <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div class="p-8 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-2xl font-black text-gray-900 dark:text-white flex items-center">
                        <svg class="w-7 h-7 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                        Taleplerim
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">Tüm destek taleplerinizi buradan takip edebilirsiniz</p>
                </div>
                
                <?php if (empty($tickets)): ?>
                <div class="p-16 text-center">
                    <div class="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg class="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Henüz destek talebiniz yok</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Soldaki formu kullanarak yeni bir talep oluşturabilirsiniz</p>
                </div>
                <?php else: ?>
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                    <?php foreach ($tickets as $ticket): 
                        $replyCount = $ticketReplyCounts[$ticket['id']] ?? 0;
                        $lastReply = $ticketLastReplies[$ticket['id']] ?? null;
                        $hasAdminReply = $lastReply && $lastReply['is_admin'];
                    ?>
                    <a href="/user/support.php?ticket=<?php echo e($ticket['id']); ?>" 
                       class="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-2">
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"><?php echo e($ticket['subject']); ?></h3>
                                    <?php if ($hasAdminReply): ?>
                                    <span class="px-2 py-1 text-xs rounded-full font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center space-x-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Cevaplandı</span>
                                    </span>
                                    <?php endif; ?>
                                </div>
                                <?php if ($lastReply): ?>
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
                                    <span class="font-semibold"><?php echo $lastReply['is_admin'] ? 'Destek Ekibi:' : 'Siz:'; ?></span>
                                    <?php echo e(substr($lastReply['message'], 0, 100)); ?><?php echo strlen($lastReply['message']) > 100 ? '...' : ''; ?>
                                </p>
                                <?php else: ?>
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1"><?php echo e(substr($ticket['message'], 0, 100)); ?><?php echo strlen($ticket['message']) > 100 ? '...' : ''; ?></p>
                                <?php endif; ?>
                            </div>
                            <span class="px-3 py-1 text-xs rounded-full font-bold <?php 
                                echo $ticket['status'] === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                    ($ticket['status'] === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'); 
                            ?>">
                                <?php echo $ticket['status'] === 'open' ? '🟢 Açık' : ($ticket['status'] === 'in_progress' ? '🔵 İşlemde' : '⚫ Kapalı'); ?>
                            </span>
                        </div>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <?php echo date('d.m.Y H:i', strtotime($ticket['created_at'])); ?>
                            </span>
                            <span>•</span>
                            <span class="capitalize font-semibold"><?php echo e($ticket['category']); ?></span>
                            <?php if ($replyCount > 0): ?>
                            <span>•</span>
                            <span class="flex items-center font-semibold text-purple-600 dark:text-purple-400">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                                <?php echo $replyCount; ?> Cevap
                            </span>
                            <?php endif; ?>
                            <?php if ($ticket['priority'] === 'urgent' || $ticket['priority'] === 'high'): ?>
                            <span>•</span>
                            <span class="px-2 py-0.5 rounded text-xs font-bold <?php 
                                echo $ticket['priority'] === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'; 
                            ?>">
                                <?php echo strtoupper($ticket['priority']); ?>
                            </span>
                            <?php endif; ?>
                        </div>
                    </a>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php include __DIR__ . '/../includes/user-footer.php'; ?>
