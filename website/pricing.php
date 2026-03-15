<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/supabase-admin.php';

// Handle balance purchase
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'purchase_with_balance') {
    if (!isLoggedIn()) {
        setFlash('Lütfen giriş yapın', 'error');
        redirect('/user-login.php');
    }
    
    $user = getCurrentUser();
    $userId = $user['id'];
    $licenseType = $_POST['license_type'] ?? '';
    $price = floatval($_POST['price'] ?? 0);
    
    if (empty($licenseType) || $price <= 0) {
        setFlash('Geçersiz lisans tipi veya fiyat', 'error');
        redirect('/pricing.php');
    }
    
    // Purchase with balance
    $result = $supabaseAdmin->purchaseLicenseWithBalance($userId, $licenseType, $price);
    
    if (isset($result['success']) && $result['success']) {
        $remainingBalance = $result['remaining_balance'] ?? 0;
        setFlash("Lisans başarıyla satın alındı! Kalan bakiye: ₺" . number_format($remainingBalance, 2), 'success');
        redirect('/user/licenses.php');
    } else {
        $errorMsg = $result['message'] ?? 'Satın alma başarısız';
        setFlash($errorMsg, 'error');
        redirect('/pricing.php');
    }
}

// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    redirect('/pricing.php');
}

$pageTitle = __('pricing.title') . ' - Autrex';
$pageDescription = __('pricing.subtitle');

// Get user balance if logged in
$userBalance = 0;
if (isLoggedIn()) {
    $user = getCurrentUser();
    $userBalance = $supabaseAdmin->getBalance($user['id']);
}

// Get trial duration from settings
$trialDurationHours = intval($supabaseAdmin->getSetting('trial_duration_hours') ?: 6);

include __DIR__ . '/includes/header.php';

// Pricing data - Updated with 1 USD = 42 TRY exchange rate
$pricingPlans = [
    [
        'type' => 'trial',
        'name' => __('pricing.trial'),
        'duration' => $trialDurationHours . ' ' . (__('pricing.hours') ?? 'saat'),
        'price_tl' => 0,
        'price_usd' => 0,
        'popular' => false,
        'features' => [
            __('pricing.all_features'),
            $trialDurationHours . ' ' . (__('pricing.hours') ?? 'saat') . ' ' . (__('pricing.duration') ?? 'süre'),
            '1 ' . (__('pricing.activation') ?? 'aktivasyon')
        ]
    ],
    [
        'type' => 'daily',
        'name' => __('pricing.daily'),
        'duration' => '1 ' . (__('pricing.day') ?? 'gün'),
        'price_tl' => 50,
        'price_usd' => 1.19,
        'popular' => false,
        'features' => [
            __('pricing.all_features'),
            '1 ' . (__('pricing.day') ?? 'gün') . ' ' . (__('pricing.duration') ?? 'süre'),
            '1 ' . (__('pricing.activation') ?? 'aktivasyon')
        ]
    ],
    [
        'type' => 'weekly',
        'name' => __('pricing.weekly'),
        'duration' => '7 ' . (__('pricing.days') ?? 'gün'),
        'price_tl' => 150,
        'price_usd' => 3.57,
        'popular' => true,
        'features' => [
            __('pricing.all_features'),
            '7 ' . (__('pricing.days') ?? 'gün') . ' ' . (__('pricing.duration') ?? 'süre'),
            '1 ' . (__('pricing.activation') ?? 'aktivasyon')
        ]
    ],
    [
        'type' => 'monthly',
        'name' => __('pricing.monthly'),
        'duration' => '30 ' . (__('pricing.days') ?? 'gün'),
        'price_tl' => 300,
        'price_usd' => 7.14,
        'popular' => false,
        'features' => [
            __('pricing.all_features'),
            '30 ' . (__('pricing.days') ?? 'gün') . ' ' . (__('pricing.duration') ?? 'süre'),
            '2 ' . (__('pricing.activations') ?? 'aktivasyon')
        ]
    ],
    [
        'type' => 'regular',
        'name' => __('pricing.regular'),
        'duration' => __('pricing.lifetime') ?? 'Süresiz',
        'price_tl' => 1000,
        'price_usd' => 23.81,
        'popular' => false,
        'features' => [
            __('pricing.all_features'),
            __('pricing.lifetime') ?? 'Süresiz kullanım',
            '3 ' . (__('pricing.activations') ?? 'aktivasyon'),
            '🚀 ' . (__('premium_features.beta_access') ?? 'Beta Erken Erişim'),
            '📱 ' . (__('premium_features.remote_title') ?? 'Uzaktan Kontrol'),
            '⭐ Premium Destek'
        ]
    ]
];
?>

<!-- Modern Pricing Header -->
<section class="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-24 overflow-hidden">
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            <?php echo __('pricing.title'); ?>
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            <?php echo __('pricing.subtitle'); ?>
        </p>
        <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                <span class="text-green-400">✓</span>
                <span>Anında Aktivasyon</span>
            </div>
            <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                <span class="text-green-400">✓</span>
                <span>7/24 Destek</span>
            </div>
        </div>
    </div>
</section>

<!-- Pricing Cards -->
<section class="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <?php foreach ($pricingPlans as $plan): ?>
            <div class="relative group">
                <!-- Card -->
                <div class="h-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl <?php echo $plan['type'] === 'regular' ? 'ring-4 ring-yellow-400' : ($plan['popular'] ? 'ring-2 ring-purple-500' : ''); ?>">
                    
                    <!-- Badge -->
                    <?php if ($plan['type'] === 'regular'): ?>
                    <div class="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
                        ⭐ PREMIUM
                    </div>
                    <?php elseif ($plan['popular']): ?>
                    <div class="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
                        🔥 POPÜLER
                    </div>
                    <?php endif; ?>
                    
                    <!-- Content -->
                    <div class="p-6">
                        <!-- Icon & Name -->
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br <?php echo $plan['type'] === 'regular' ? 'from-yellow-400 to-orange-500' : 'from-purple-500 to-blue-500'; ?> rounded-2xl flex items-center justify-center shadow-lg">
                                <span class="text-3xl">
                                    <?php 
                                    $icons = ['trial' => '🎯', 'daily' => '⚡', 'weekly' => '🔥', 'monthly' => '💎', 'regular' => '👑'];
                                    echo $icons[$plan['type']];
                                    ?>
                                </span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-2"><?php echo e($plan['name']); ?></h3>
                            <p class="text-gray-600 text-sm"><?php echo e($plan['duration']); ?></p>
                        </div>
                        
                        <!-- Price -->
                        <div class="text-center mb-6">
                            <?php if ($plan['price_tl'] > 0): ?>
                            <div class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                                <?php echo formatCurrency($plan['price_tl'], 'TRY'); ?>
                            </div>
                            <div class="text-sm text-gray-500 mt-1">
                                <?php echo formatCurrency($plan['price_usd'], 'USD'); ?>
                            </div>
                            <?php else: ?>
                            <div class="text-4xl font-bold text-green-600">
                                ÜCRETSİZ
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <!-- Features -->
                        <ul class="space-y-3 mb-6">
                            <?php foreach ($plan['features'] as $feature): ?>
                            <li class="flex items-start text-sm">
                                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <span class="text-gray-700"><?php echo e($feature); ?></span>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                        
                        <!-- Buttons -->
                        <div class="space-y-3">
                            <?php if ($plan['price_tl'] > 0): ?>
                            <!-- Credit Card Payment -->
                            <a 
                                href="/payment/initiate.php?type=<?php echo $plan['type']; ?>&amount=<?php echo $plan['price_tl']; ?>"
                                class="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                💳 Kredi Kartı
                            </a>
                            
                            <!-- Balance Payment -->
                            <button 
                                type="button"
                                onclick="handleBalancePurchase('<?php echo $plan['type']; ?>', <?php echo $plan['price_tl']; ?>)"
                                class="block w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                💰 Bakiye ile Al
                            </button>
                            <?php else: ?>
                            <!-- Trial Button -->
                            <button 
                                type="button"
                                onclick="selectPlan('<?php echo $plan['type']; ?>', 0)"
                                class="block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                🎯 Şimdi Dene
                            </button>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- FAQ Section -->
<section class="py-20 bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-center mb-12">Sıkça Sorulan Sorular</h2>
        
        <div class="space-y-6">
            <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-2">💳 Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
                <p class="text-gray-600">Kredi kartı ve bakiye ile ödeme seçeneklerimiz bulunmaktadır.</p>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-2">🔄 Lisansımı iptal edebilir miyim?</h3>
                <p class="text-gray-600">Süresiz lisanslar iade edilemez. Diğer paketler için destek ekibimizle iletişime geçebilirsiniz.</p>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-2">🎯 Trial sürümü kaç kez kullanabilirim?</h3>
                <p class="text-gray-600">Her hesap için bir kez <?php echo $trialDurationHours; ?> saatlik ücretsiz deneme hakkınız bulunmaktadır.</p>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-2">📱 Premium özellikler nelerdir?</h3>
                <p class="text-gray-600">Süresiz lisans sahipleri beta özelliklerine erken erişim, uzaktan kontrol ve öncelikli destek alır.</p>
            </div>
        </div>
    </div>
</section>

<script>
// Handle balance purchase
function handleBalancePurchase(type, price) {
    const isLoggedIn = <?php echo isLoggedIn() ? 'true' : 'false'; ?>;
    
    if (!isLoggedIn) {
        window.location.href = '/user-login.php?redirect=' + encodeURIComponent('/pricing.php');
        return;
    }
    
    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.innerHTML = `
        <input type="hidden" name="action" value="purchase_with_balance">
        <input type="hidden" name="license_type" value="${type}">
        <input type="hidden" name="price" value="${price}">
    `;
    document.body.appendChild(form);
    form.submit();
}

async function selectPlan(type, price) {
    if (price === 0) {
        // Trial - check if user is logged in
        const isLoggedIn = <?php echo isAuthenticated() ? 'true' : 'false'; ?>;
        
        if (!isLoggedIn) {
            showToast('<?php echo __('trial.requirements'); ?>', 'error');
            setTimeout(() => {
                window.location.href = '/user-login.php?redirect=pricing';
            }, 1500);
            return;
        }
        
        // Claim trial license
        try {
            const response = await fetch('/user/claim-trial.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/user/dashboard.php';
                }, 1500);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Bir hata oluştu: ' + error.message, 'error');
        }
    }
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
