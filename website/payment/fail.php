<?php
/**
 * Payment Fail Page
 */

require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

$orderID = $_GET['order_id'] ?? '';

$pageTitle = 'Ödeme Başarısız - Autrex';
include __DIR__ . '/../../includes/header.php';
?>

<div class="container mx-auto px-4 py-16">
    <div class="max-w-2xl mx-auto text-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <!-- Error Icon -->
            <div class="mb-6">
                <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ödeme Başarısız
            </h1>
            
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
            </p>
            
            <?php if ($orderID): ?>
                <p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    Sipariş No: <?php echo e($orderID); ?>
                </p>
            <?php endif; ?>

            <div class="space-y-3 mt-8">
                <a href="/pricing.php" class="btn btn-primary w-full">
                    Tekrar Dene
                </a>
                <a href="/user/dashboard.php" class="btn btn-secondary w-full">
                    Dashboard'a Dön
                </a>
            </div>

            <div class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Sorun devam ederse lütfen destek ekibiyle iletişime geçin.
                </p>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
