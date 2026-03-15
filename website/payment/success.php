<?php
/**
 * Payment Success Page
 */

require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

$orderID = $_GET['order_id'] ?? '';

$pageTitle = 'Ödeme Başarılı - Autrex';
include __DIR__ . '/../../includes/header.php';
?>

<div class="container mx-auto px-4 py-16">
    <div class="max-w-2xl mx-auto text-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <!-- Success Icon -->
            <div class="mb-6">
                <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ödeme Başarılı!
            </h1>
            
            <p class="text-gray-600 dark:text-gray-400 mb-2">
                Ödemeniz başarıyla alındı ve bakiyenize eklendi.
            </p>
            
            <?php if ($orderID): ?>
                <p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    Sipariş No: <?php echo e($orderID); ?>
                </p>
            <?php endif; ?>

            <div class="space-y-3 mt-8">
                <a href="/user/dashboard.php" class="btn btn-primary w-full">
                    Dashboard'a Git
                </a>
                <a href="/pricing.php" class="btn btn-secondary w-full">
                    Lisans Satın Al
                </a>
            </div>

            <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm text-blue-800 dark:text-blue-200">
                    💡 Bakiyenizi kullanarak lisans satın alabilirsiniz.
                </p>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../includes/footer.php'; ?>
