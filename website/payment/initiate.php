<?php
/**
 * Payment Initiation - Payhesap/Posu.net iFrame Integration
 * This file initiates the payment process and displays the payment iframe
 */

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

// Check if user is logged in
if (!isLoggedIn()) {
    setFlash('Ödeme yapmak için giriş yapmalısınız', 'error');
    redirect('/login.php');
}

// Get payment parameters
$licenseType = $_GET['type'] ?? '';
$amount = floatval($_GET['amount'] ?? 0);

if (empty($licenseType) || $amount <= 0) {
    setFlash('Geçersiz ödeme parametreleri', 'error');
    redirect('/pricing.php');
}

$user = getCurrentUser();
$orderID = time() . '_' . $user['id'];

// Prepare payment data
// Ensure phone is not empty
$phone = !empty($user['phone']) ? $user['phone'] : '05447803100';

$posts = [
    "hash" => $_ENV['PAYHESAP_API_HASH'] ?? '',
    "order_id" => $orderID,
    "callback_url" => $_ENV['PAYHESAP_CALLBACK_URL'] ?? '',
    "amount" => number_format($amount, 2, '.', ''),
    "installment" => "1",
    "success_url" => $_ENV['PAYHESAP_SUCCESS_URL'] . '?order_id=' . $orderID,
    "fail_url" => $_ENV['PAYHESAP_FAIL_URL'] . '?order_id=' . $orderID,
    "name" => $user['full_name'] ?? ($user['username'] ?? $user['email']),
    "email" => $user['email'],
    "phone" => $phone,
    "city" => "İstanbul",
    "state" => "Türkiye",
    "address" => "Online Satış",
    "ip" => $_SERVER['REMOTE_ADDR']
];

// Store order in session for callback verification
$_SESSION['pending_order'] = [
    'order_id' => $orderID,
    'user_id' => $user['id'],
    'license_type' => $licenseType,
    'amount' => $amount,
    'created_at' => time()
];

$encode = json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$ch = curl_init(($_ENV['PAYHESAP_API_URL'] ?? 'https://www.payhesap.com/api') . '/iframe/pay');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $encode);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($encode)
]);
$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

$pageTitle = 'Ödeme - Autrex';
include __DIR__ . '/../includes/header.php';
?>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold mb-4">Ödeme İşlemi</h1>
            
            <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Lisans Tipi</p>
                        <p class="font-semibold"><?php echo e(ucfirst($licenseType)); ?></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Tutar</p>
                        <p class="font-semibold text-xl">₺<?php echo number_format($amount, 2); ?></p>
                    </div>
                </div>
            </div>

            <?php if (isset($decode['data']['token'])): ?>
                <div class="payment-iframe-container">
                    <script src="https://www.payhesap.com/iframe/iframeResizer.min.js"></script>
                    <iframe 
                        src="https://payhesap.com/api/iframe/<?php echo e($decode['data']['token']); ?>" 
                        id="payhesapiframe" 
                        frameborder="0" 
                        scrolling="yes" 
                        style="width: 100%; min-height: 600px;"
                    ></iframe>
                    <script>iFrameResize({},'#payhesapiframe');</script>
                </div>
            <?php else: ?>
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-red-600 dark:text-red-400 font-semibold">Ödeme başlatılamadı</p>
                    <?php if (isset($decode['msg'])): ?>
                        <p class="text-sm mt-2"><?php echo e($decode['msg']); ?></p>
                    <?php endif; ?>
                    <a href="/pricing.php" class="btn btn-primary mt-4 inline-block">Fiyatlandırmaya Dön</a>
                </div>
                
                <!-- Debug Info (Always show for now) -->
                <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                    <p class="font-mono text-xs font-bold mb-2">Debug Info:</p>
                    <div class="text-xs space-y-2">
                        <div>
                            <strong>API Hash:</strong> <?php echo $_ENV['PAYHESAP_API_HASH'] ? '✓ Set (' . substr($_ENV['PAYHESAP_API_HASH'], 0, 10) . '...)' : '✗ Not Set'; ?>
                        </div>
                        <div>
                            <strong>API URL:</strong> <?php echo $_ENV['PAYHESAP_API_URL'] ?? 'Not Set'; ?>
                        </div>
                        <div>
                            <strong>Order ID:</strong> <?php echo $orderID; ?>
                        </div>
                        <div>
                            <strong>Amount:</strong> <?php echo $amount; ?>
                        </div>
                    </div>
                    <p class="font-mono text-xs font-bold mt-4 mb-2">API Response:</p>
                    <pre class="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto"><?php print_r($decode); ?></pre>
                    <p class="font-mono text-xs font-bold mt-4 mb-2">Request Data:</p>
                    <pre class="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto"><?php print_r($posts); ?></pre>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
