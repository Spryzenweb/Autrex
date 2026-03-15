<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/supabase-admin.php';
require_once __DIR__ . '/../includes/admin-auth.php';

// Handle ticket status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_status') {
        $ticketId = $_POST['ticket_id'] ?? '';
        $status = $_POST['status'] ?? '';
        
        if (!empty($ticketId) && !empty($status)) {
            $updateData = ['status' => $status];
            if ($status === 'closed') {
                $updateData['closed_at'] = gmdate('Y-m-d\TH:i:s\Z');
            }
            
            $result = $supabaseAdmin->update('support_tickets', $updateData, ['id' => $ticketId]);
            if (!isset($result['error'])) {
                setFlash('success', 'Talep durumu güncellendi');
            } else {
                setFlash('error', 'Durum güncellenemedi');
            }
        }
    } elseif ($_POST['action'] === 'admin_reply') {
        $ticketId = $_POST['ticket_id'] ?? '';
        $message = $_POST['message'] ?? '';
        
        if (!empty($ticketId) && !empty($message)) {
            $result = $supabaseAdmin->insert('support_ticket_replies', [
                'ticket_id' => $ticketId,
                'user_id' => null,
                'message' => $message,
                'is_admin' => true
            ]);
            
            if (!isset($result['error'])) {
                // Update ticket status to in_progress if it was open
                $ticket = $supabaseAdmin->select('support_tickets', '*', ['id' => $ticketId]);
                if (!empty($ticket) && !isset($ticket['error'])) {
                    $ticketData = is_array($ticket[0]) ? $ticket[0] : $ticket;
                    if ($ticketData['status'] === 'open') {
                        $supabaseAdmin->update('support_tickets', ['status' => 'in_progress'], ['id' => $ticketId]);
                    }
                }
                
                setFlash('success', 'Cevabınız gönderildi');
            } else {
                setFlash('error', 'Cevap gönderilemedi');
            }
        }
    }
    redirect('/admin/support-tickets.php' . (isset($_GET['ticket']) ? '?ticket=' . $_GET['ticket'] : ''));
}

// Get all tickets
$statusFilter = $_GET['status'] ?? 'all';
$filters = [];
if ($statusFilter !== 'all') {
    $filters['status'] = $statusFilter;
}

$tickets = $supabaseAdmin->select('support_tickets', '*', $filters, 'created_at.desc');
if (!is_array($tickets)) {
    $tickets = [];
}

// Get user info for each ticket
$users = $supabaseAdmin->getAuthUsers();
$userMap = [];
foreach ($users as $user) {
    $userMap[$user['id']] = $user;
}

// If viewing a specific ticket
$viewingTicket = null;
$ticketReplies = [];
$ticketUser = null;
if (isset($_GET['ticket'])) {
    $ticketId = $_GET['ticket'];
    $ticketData = $supabaseAdmin->select('support_tickets', '*', ['id' => $ticketId]);
    if (!empty($ticketData) && !isset($ticketData['error'])) {
        $viewingTicket = is_array($ticketData[0]) ? $ticketData[0] : $ticketData;
        $ticketUser = $userMap[$viewingTicket['user_id']] ?? null;
        
        // Get replies
        $replies = $supabaseAdmin->select('support_ticket_replies', '*', ['ticket_id' => $ticketId], 'created_at.asc');
        if (is_array($replies) && !isset($replies['error'])) {
            $ticketReplies = $replies;
        }
    }
}

// Count tickets by status
$openCount = count(array_filter($tickets, fn($t) => $t['status'] === 'open'));
$inProgressCount = count(array_filter($tickets, fn($t) => $t['status'] === 'in_progress'));
$closedCount = count(array_filter($tickets, fn($t) => $t['status'] === 'closed'));

include __DIR__ . '/../includes/admin-header.php';
?>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
</div>

        <!-- Flash Messages -->
        <?php $flash = getFlash(); if ($flash): ?>
        <div class="mb-6 rounded-lg p-4 <?php echo $flash['type'] === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'; ?>">
            <span class="font-semibold"><?php echo e($flash['message']); ?></span>
        </div>
        <?php endif; ?>

        <?php if ($viewingTicket): ?>
            <!-- Viewing Single Ticket -->
            <div class="mb-6">
                <a href="/admin/support-tickets.php" class="text-purple-600 hover:text-purple-700 font-medium">
                    ← Tüm Taleplere Dön
                </a>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Ticket Details -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Main Ticket -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-2"><?php echo e($viewingTicket['subject']); ?></h2>
                                <div class="flex items-center space-x-4 text-sm text-gray-600">
                                    <span class="px-3 py-1 rounded-full <?php 
                                        echo $viewingTicket['status'] === 'open' ? 'bg-green-100 text-green-800' : 
                                            ($viewingTicket['status'] === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'); 
                                    ?>">
                                        <?php echo $viewingTicket['status'] === 'open' ? 'Açık' : ($viewingTicket['status'] === 'in_progress' ? 'İşlemde' : 'Kapalı'); ?>
                                    </span>
                                    <span><?php echo date('d.m.Y H:i', strtotime($viewingTicket['created_at'])); ?></span>
                                    <span class="capitalize"><?php echo e($viewingTicket['category']); ?></span>
                                    <span class="px-2 py-1 rounded text-xs <?php 
                                        echo $viewingTicket['priority'] === 'urgent' ? 'bg-red-100 text-red-800' : 
                                            ($viewingTicket['priority'] === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'); 
                                    ?>">
                                        <?php echo strtoupper($viewingTicket['priority']); ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="border-t pt-4">
                            <p class="text-gray-700 whitespace-pre-wrap"><?php echo e($viewingTicket['message']); ?></p>
                        </div>
                    </div>

                    <!-- Replies -->
                    <?php if (!empty($ticketReplies)): ?>
                    <div class="space-y-4">
                        <?php foreach ($ticketReplies as $reply): ?>
                        <div class="bg-white rounded-lg shadow-sm p-6 <?php echo $reply['is_admin'] ? 'border-l-4 border-purple-500' : ''; ?>">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-semibold text-gray-900">
                                    <?php echo $reply['is_admin'] ? '🛡️ Admin' : '👤 Kullanıcı'; ?>
                                </span>
                                <span class="text-sm text-gray-500"><?php echo date('d.m.Y H:i', strtotime($reply['created_at'])); ?></span>
                            </div>
                            <p class="text-gray-700 whitespace-pre-wrap"><?php echo e($reply['message']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>

                    <!-- Admin Reply Form -->
                    <?php if ($viewingTicket['status'] !== 'closed'): ?>
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Cevap Yaz</h3>
                        <form method="POST" action="/admin/support-tickets.php?ticket=<?php echo e($viewingTicket['id']); ?>">
                            <input type="hidden" name="action" value="admin_reply">
                            <input type="hidden" name="ticket_id" value="<?php echo e($viewingTicket['id']); ?>">
                            
                            <textarea name="message" rows="4" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Cevabınızı yazın..."></textarea>
                            
                            <div class="mt-4 flex justify-end">
                                <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                                    Gönder
                                </button>
                            </div>
                        </form>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Talep Bilgileri</h3>
                        
                        <!-- User Info -->
                        <?php if ($ticketUser): ?>
                        <div class="mb-6 pb-6 border-b">
                            <p class="text-sm text-gray-600 mb-1">Kullanıcı</p>
                            <p class="font-semibold text-gray-900"><?php echo e($ticketUser['email']); ?></p>
                        </div>
                        <?php endif; ?>

                        <!-- Status Update -->
                        <form method="POST" action="/admin/support-tickets.php?ticket=<?php echo e($viewingTicket['id']); ?>">
                            <input type="hidden" name="action" value="update_status">
                            <input type="hidden" name="ticket_id" value="<?php echo e($viewingTicket['id']); ?>">
                            
                            <label class="block text-sm font-medium text-gray-700 mb-2">Durum Değiştir</label>
                            <select name="status" onchange="this.form.submit()"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                                <option value="open" <?php echo $viewingTicket['status'] === 'open' ? 'selected' : ''; ?>>Açık</option>
                                <option value="in_progress" <?php echo $viewingTicket['status'] === 'in_progress' ? 'selected' : ''; ?>>İşlemde</option>
                                <option value="closed" <?php echo $viewingTicket['status'] === 'closed' ? 'selected' : ''; ?>>Kapalı</option>
                            </select>
                        </form>

                        <!-- Ticket Meta -->
                        <div class="mt-6 space-y-3 text-sm">
                            <div>
                                <p class="text-gray-600">Oluşturulma</p>
                                <p class="font-medium text-gray-900"><?php echo date('d.m.Y H:i', strtotime($viewingTicket['created_at'])); ?></p>
                            </div>
                            <div>
                                <p class="text-gray-600">Son Güncelleme</p>
                                <p class="font-medium text-gray-900"><?php echo date('d.m.Y H:i', strtotime($viewingTicket['updated_at'])); ?></p>
                            </div>
                            <?php if ($viewingTicket['closed_at']): ?>
                            <div>
                                <p class="text-gray-600">Kapatılma</p>
                                <p class="font-medium text-gray-900"><?php echo date('d.m.Y H:i', strtotime($viewingTicket['closed_at'])); ?></p>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>

        <?php else: ?>
            <!-- Ticket List -->
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Toplam</p>
                            <p class="text-3xl font-bold text-gray-900"><?php echo count($tickets); ?></p>
                        </div>
                        <div class="text-4xl">📋</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Açık</p>
                            <p class="text-3xl font-bold text-green-600"><?php echo $openCount; ?></p>
                        </div>
                        <div class="text-4xl">🟢</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">İşlemde</p>
                            <p class="text-3xl font-bold text-blue-600"><?php echo $inProgressCount; ?></p>
                        </div>
                        <div class="text-4xl">🔵</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Kapalı</p>
                            <p class="text-3xl font-bold text-gray-600"><?php echo $closedCount; ?></p>
                        </div>
                        <div class="text-4xl">⚫</div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="bg-white rounded-lg shadow-sm mb-6">
                <div class="border-b">
                    <nav class="flex space-x-8 px-6" aria-label="Tabs">
                        <a href="?status=all" class="<?php echo $statusFilter === 'all' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'; ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Tümü (<?php echo count($tickets); ?>)
                        </a>
                        <a href="?status=open" class="<?php echo $statusFilter === 'open' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'; ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Açık (<?php echo $openCount; ?>)
                        </a>
                        <a href="?status=in_progress" class="<?php echo $statusFilter === 'in_progress' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'; ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            İşlemde (<?php echo $inProgressCount; ?>)
                        </a>
                        <a href="?status=closed" class="<?php echo $statusFilter === 'closed' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'; ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Kapalı (<?php echo $closedCount; ?>)
                        </a>
                    </nav>
                </div>

                <?php if (empty($tickets)): ?>
                <div class="p-12 text-center text-gray-500">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    <p class="text-lg font-medium">Destek talebi bulunamadı</p>
                </div>
                <?php else: ?>
                <div class="divide-y">
                    <?php foreach ($tickets as $ticket): 
                        $user = $userMap[$ticket['user_id']] ?? null;
                    ?>
                    <a href="/admin/support-tickets.php?ticket=<?php echo e($ticket['id']); ?>" 
                       class="block p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-1"><?php echo e($ticket['subject']); ?></h3>
                                <p class="text-sm text-gray-600 mb-2">
                                    <?php echo $user ? e($user['email']) : 'Bilinmeyen Kullanıcı'; ?>
                                </p>
                            </div>
                            <div class="flex flex-col items-end space-y-2">
                                <span class="px-3 py-1 text-xs rounded-full <?php 
                                    echo $ticket['status'] === 'open' ? 'bg-green-100 text-green-800' : 
                                        ($ticket['status'] === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'); 
                                ?>">
                                    <?php echo $ticket['status'] === 'open' ? 'Açık' : ($ticket['status'] === 'in_progress' ? 'İşlemde' : 'Kapalı'); ?>
                                </span>
                                <?php if ($ticket['priority'] === 'urgent' || $ticket['priority'] === 'high'): ?>
                                <span class="px-2 py-1 text-xs rounded <?php 
                                    echo $ticket['priority'] === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'; 
                                ?>">
                                    <?php echo strtoupper($ticket['priority']); ?>
                                </span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-2 line-clamp-2"><?php echo e(substr($ticket['message'], 0, 150)); ?>...</p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                            <span><?php echo date('d.m.Y H:i', strtotime($ticket['created_at'])); ?></span>
                            <span>•</span>
                            <span class="capitalize"><?php echo e($ticket['category']); ?></span>
                        </div>
                    </a>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

<?php include __DIR__ . '/../includes/admin-footer.php'; ?>
