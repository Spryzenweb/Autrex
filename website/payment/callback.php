<?php
/**
 * Payment Callback - Payhesap/Posu.net
 * This file receives payment status from Payhesap and processes the order
 */

require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/supabase-admin.php';

// Log callback for debugging
$logFile = __DIR__ . '/../../logs/payment_callback.log';
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'post_data' => $_POST,
    'ip' => $_SERVER['REMOTE_ADDR']
];
@file_put_contents($logFile, json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

if (!isset($_POST['STATUS'])) {
    http_response_code(400);
    exit('Invalid request');
}

$orderID = $_POST['ORDER_REF_NUMBER'] ?? '';
$hash = $_POST['HASH'] ?? '';

if (empty($orderID) || empty($hash)) {
    http_response_code(400);
    exit('Missing parameters');
}

// Verify payment with Payhesap
$ch = curl_init(($_ENV['PAYHESAP_API_URL'] ?? 'https://www.payhesap.com/api') . '/pay/checkOrder');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, ['hash' => $hash]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($ch), true);
curl_close($ch);

// Log verification result
$logData['verification'] = $result;
@file_put_contents($logFile, json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

// Extract user ID from order ID
$orderParts = explode('_', $orderID);
$userId = $orderParts[1] ?? null;

if (!$userId) {
    http_response_code(400);
    exit('Invalid order ID');
}

// Check payment status
if (isset($result['statusID']) && $result['statusID'] == 1) {
    // Payment successful
    $amount = floatval($result['data']['payment_amount'] ?? 0);
    
    // Get user's pending order from database or session
    // For now, we'll add balance to user account
    
    try {
        // Add balance to user account
        $balanceResult = $supabaseAdmin->addBalance($userId, $amount, 'Kredi Kartı ile Yükleme', [
            'order_id' => $orderID,
            'payment_type' => $result['data']['payment_type'] ?? 'card',
            'installment' => $result['data']['installment'] ?? 1
        ]);
        
        if ($balanceResult['success']) {
            // Log successful payment
            @file_put_contents($logFile, "SUCCESS: Balance added for user $userId, amount: $amount\n\n", FILE_APPEND);
            http_response_code(200);
            echo 'OK';
        } else {
            // Log error
            @file_put_contents($logFile, "ERROR: Failed to add balance - " . ($balanceResult['message'] ?? 'Unknown error') . "\n\n", FILE_APPEND);
            http_response_code(500);
            echo 'Balance update failed';
        }
    } catch (Exception $e) {
        @file_put_contents($logFile, "EXCEPTION: " . $e->getMessage() . "\n\n", FILE_APPEND);
        http_response_code(500);
        echo 'Error processing payment';
    }
} else {
    // Payment failed
    @file_put_contents($logFile, "FAILED: Payment failed for order $orderID\n\n", FILE_APPEND);
    http_response_code(200);
    echo 'Payment failed';
}
