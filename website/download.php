<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/supabase-admin.php';

// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    redirect('/download.php');
}

$pageTitle = __('download.title') . ' - Autrex';
$pageDescription = __('download.subtitle');

// Get download URLs and version from settings
$downloadUrlWindows = $supabaseAdmin->getSetting('download_url_windows') ?: '#';
$downloadUrlMacOS = $supabaseAdmin->getSetting('download_url_mac') ?: '#';
$downloadUrlLinux = $supabaseAdmin->getSetting('download_url_linux') ?: '#';
$appVersion = $supabaseAdmin->getSetting('app_version') ?: '1.0.0';

// Check if trial requested
$trialRequested = isset($_GET['trial']) && $_GET['trial'] == '1';

include __DIR__ . '/includes/header.php';
?>

<!-- Download Header -->
<section class="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-24 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div class="inline-block bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-6 border border-white/20">
            <span class="font-bold text-lg"><?php echo __('download.version'); ?>: <?php echo e($appVersion); ?></span>
        </div>
        <h1 class="text-5xl md:text-6xl font-black mb-6"><?php echo __('download.title'); ?></h1>
        <p class="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto"><?php echo __('download.subtitle'); ?></p>
    </div>
</section>

<!-- Download Section -->
<section class="py-20 bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <?php if ($trialRequested): ?>
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-12 text-center">
            <div class="flex items-center justify-center mb-2">
                <svg class="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-green-800 font-bold text-lg">
                    <?php echo __('download.trial_selected') ?? 'Trial lisansı seçildi!'; ?>
                </span>
            </div>
            <p class="text-green-700">İndirdikten sonra ücretsiz deneme lisansı alabilirsiniz.</p>
        </div>
        <?php endif; ?>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <!-- Windows Card -->
            <div class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 overflow-hidden">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
                    <svg class="w-20 h-20 mb-4 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                    </svg>
                    <h3 class="text-3xl font-black mb-2">Windows</h3>
                    <p class="text-blue-100">Windows 10 veya üzeri</p>
                </div>
                <div class="p-8">
                    <ul class="space-y-3 mb-6">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Kolay kurulum</span>
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Otomatik güncellemeler</span>
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Tam özellik desteği</span>
                        </li>
                    </ul>
                    <a href="<?php echo e($downloadUrlWindows); ?>" 
                       class="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <div class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Windows İndir
                        </div>
                    </a>
                </div>
            </div>
            
            <!-- macOS Card -->
            <div class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 overflow-hidden">
                <div class="bg-gradient-to-br from-gray-700 to-gray-800 p-8 text-white">
                    <svg class="w-20 h-20 mb-4 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <h3 class="text-3xl font-black mb-2">macOS</h3>
                    <p class="text-gray-300">macOS 11+ (M1/M2/Intel)</p>
                </div>
                <div class="p-8">
                    <ul class="space-y-3 mb-6">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Apple Silicon desteği</span>
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Optimize edilmiş performans</span>
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <span>Native uygulama</span>
                        </li>
                    </ul>
                    <a href="<?php echo e($downloadUrlMacOS); ?>" 
                       class="block w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-xl text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <div class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            macOS İndir
                        </div>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="text-center">
            <p class="text-gray-600 text-sm mb-4">
                <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                İndirme sorunları için <a href="#" class="text-purple-600 hover:text-purple-700 font-semibold">destek ekibimizle</a> iletişime geçin
            </p>
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 inline-block">
                <p class="text-yellow-800 font-semibold mb-2">
                    ⚠️ Windows güvenlik uyarısı görebilirsiniz
                </p>
                <a href="/download-guide.php" class="inline-flex items-center text-yellow-900 hover:text-yellow-700 font-bold underline">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Kurulum rehberini görüntüle
                </a>
            </div>
        </div>
    </div>
</section>

<!-- System Requirements -->
<section class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4"><?php echo __('download.requirements_title'); ?></h2>
            <p class="text-xl text-gray-600">Autrex'i sorunsuz çalıştırmak için gereken minimum gereksinimler</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl p-8 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span class="text-3xl">💻</span>
                </div>
                <h3 class="font-bold text-xl text-gray-900 mb-3"><?php echo __('download.requirements.os'); ?></h3>
                <p class="text-gray-700">Windows 10 veya üzeri / macOS 11+</p>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl p-8 border-2 border-green-100 hover:border-green-300 transition-all duration-300">
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span class="text-3xl">🎮</span>
                </div>
                <h3 class="font-bold text-xl text-gray-900 mb-3"><?php echo __('download.requirements.league'); ?></h3>
                <p class="text-gray-700">League of Legends yüklü olmalı</p>
            </div>
            
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg hover:shadow-xl p-8 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span class="text-3xl">🧠</span>
                </div>
                <h3 class="font-bold text-xl text-gray-900 mb-3"><?php echo __('download.requirements.ram'); ?></h3>
                <p class="text-gray-700">4 GB RAM (önerilen 8 GB)</p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg hover:shadow-xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span class="text-3xl">💾</span>
                </div>
                <h3 class="font-bold text-xl text-gray-900 mb-3"><?php echo __('download.requirements.storage'); ?></h3>
                <p class="text-gray-700">100 MB boş alan</p>
            </div>
        </div>
    </div>
</section>

<!-- Installation Steps -->
<section class="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4"><?php echo __('download.installation_title'); ?></h2>
            <p class="text-xl text-gray-600">Sadece 4 adımda kurulumu tamamlayın</p>
        </div>
        
        <div class="space-y-6">
            <div class="flex items-start bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border-2 border-transparent hover:border-purple-300 transition-all duration-300">
                <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl mr-6 shadow-lg">
                    1
                </div>
                <div>
                    <h3 class="font-bold text-xl text-gray-900 mb-2"><?php echo __('download.installation.step1'); ?></h3>
                    <p class="text-gray-600">İndirilen .exe dosyasını çift tıklayarak çalıştırın</p>
                </div>
            </div>
            
            <div class="flex items-start bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border-2 border-transparent hover:border-purple-300 transition-all duration-300">
                <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl mr-6 shadow-lg">
                    2
                </div>
                <div>
                    <h3 class="font-bold text-xl text-gray-900 mb-2"><?php echo __('download.installation.step2'); ?></h3>
                    <p class="text-gray-600">Kurulum sihirbazını takip edin ve "Next" butonlarına tıklayın</p>
                </div>
            </div>
            
            <div class="flex items-start bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border-2 border-transparent hover:border-purple-300 transition-all duration-300">
                <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl mr-6 shadow-lg">
                    3
                </div>
                <div>
                    <h3 class="font-bold text-xl text-gray-900 mb-2"><?php echo __('download.installation.step3'); ?></h3>
                    <p class="text-gray-600">Satın aldığınız lisans anahtarını girin (Trial için ücretsiz alabilirsiniz)</p>
                </div>
            </div>
            
            <div class="flex items-start bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border-2 border-transparent hover:border-purple-300 transition-all duration-300">
                <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl mr-6 shadow-lg">
                    4
                </div>
                <div>
                    <h3 class="font-bold text-xl text-gray-900 mb-2"><?php echo __('download.installation.step4'); ?></h3>
                    <p class="text-gray-600">Autrex'i başlatın ve League of Legends client'ını açın</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FAQ Section -->
<section class="py-20 bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4"><?php echo __('download.faq_title'); ?></h2>
            <p class="text-xl text-gray-600">Sıkça sorulan sorular</p>
        </div>
        
        <div class="space-y-4" x-data="{ open: null }">
            <div class="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
                <button @click="open = open === 1 ? null : 1" class="w-full px-8 py-6 text-left font-bold text-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span class="text-gray-900">Autrex güvenli mi?</span>
                    <svg class="w-6 h-6 transform transition-transform text-purple-600" :class="{ 'rotate-180': open === 1 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div x-show="open === 1" x-collapse class="px-8 py-6 bg-gradient-to-br from-purple-50 to-blue-50 border-t-2 border-purple-100">
                    <p class="text-gray-700 leading-relaxed">Evet, Autrex tamamen güvenlidir. Riot Games'in kurallarına uygun şekilde çalışır ve hesabınıza zarar vermez.</p>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
                <button @click="open = open === 2 ? null : 2" class="w-full px-8 py-6 text-left font-bold text-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span class="text-gray-900">Nasıl lisans alabilirim?</span>
                    <svg class="w-6 h-6 transform transition-transform text-purple-600" :class="{ 'rotate-180': open === 2 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div x-show="open === 2" x-collapse class="px-8 py-6 bg-gradient-to-br from-purple-50 to-blue-50 border-t-2 border-purple-100">
                    <p class="text-gray-700 leading-relaxed">Fiyatlandırma sayfasından size uygun paketi seçebilirsiniz. Trial sürümü ücretsizdir.</p>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
                <button @click="open = open === 3 ? null : 3" class="w-full px-8 py-6 text-left font-bold text-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span class="text-gray-900">Kaç bilgisayarda kullanabilirim?</span>
                    <svg class="w-6 h-6 transform transition-transform text-purple-600" :class="{ 'rotate-180': open === 3 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div x-show="open === 3" x-collapse class="px-8 py-6 bg-gradient-to-br from-purple-50 to-blue-50 border-t-2 border-purple-100">
                    <p class="text-gray-700 leading-relaxed">Paketinize göre değişir. Trial ve günlük paketler 1, aylık paket 2, süresiz paket 3 bilgisayarda kullanılabilir.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
