<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    redirect('/');
}

$pageTitle = 'Autrex - League of Legends Automation';
$pageDescription = __('hero.subtitle');

include __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-32 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center">
            <h1 class="text-5xl md:text-7xl font-black mb-6 animate-fade-in">
                <?php echo __('hero.title'); ?>
            </h1>
            <p class="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto">
                <?php echo __('hero.subtitle'); ?>
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a href="/download.php" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-200">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <?php echo __('hero.cta_download'); ?>
                </a>
                <a href="/pricing.php" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <?php echo __('hero.cta_pricing'); ?>
                </a>
            </div>
            
            <!-- Trust Indicators -->
            <div class="flex flex-wrap items-center justify-center gap-8 text-sm">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-200">5,000+ Aktif Kullanıcı</span>
                </div>
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-200">Güvenli & Güncel</span>
                </div>
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-200">7/24 Destek</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- App Preview Section -->
<section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-3xl opacity-20"></div>
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/30 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-[1.02]">
                <img src="/assets/images/autrex-preview.png" alt="Autrex Uygulama Önizleme" class="w-full h-auto">
                <div class="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4"><?php echo __('features.title'); ?></h2>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"><?php echo __('why_choose.subtitle'); ?></p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Auto Accept -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">✓</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.auto_accept'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.auto_accept_desc'); ?></p>
            </div>
            
            <!-- Auto Ban -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">🚫</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.auto_ban'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.auto_ban_desc'); ?></p>
            </div>
            
            <!-- Auto Pick -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">🎯</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.auto_pick'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.auto_pick_desc'); ?></p>
            </div>
            
            <!-- Safe -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">🛡️</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.safe'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.safe_desc'); ?></p>
            </div>
            
            <!-- Remote Control -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">📱</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.remote_control'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.remote_control_desc'); ?></p>
            </div>
            
            <!-- Team Picks -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">👥</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.team_picks'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.team_picks_desc'); ?></p>
            </div>
            
            <!-- Smart Pick -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">🧠</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.smart_pick'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.smart_pick_desc'); ?></p>
            </div>
            
            <!-- Mobile App -->
            <div class="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2">
                <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl">📲</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('features.mobile_app'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('features.mobile_app_desc'); ?></p>
            </div>
        </div>
    </div>
</section>

<!-- Premium Features Section -->
<section class="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-12">
            <span class="inline-block bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                <?php echo __('premium_features.exclusive'); ?>
            </span>
            <h2 class="text-4xl font-bold mb-4"><?php echo __('premium_features.title'); ?></h2>
            <p class="text-xl text-gray-300"><?php echo __('premium_features.subtitle'); ?></p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div class="space-y-6">
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="flex items-start space-x-4">
                        <div class="text-4xl">🚀</div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2"><?php echo __('premium_features.beta_access'); ?></h3>
                            <p class="text-gray-300"><?php echo __('premium_features.beta_access_desc'); ?></p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="flex items-start space-x-4">
                        <div class="text-4xl">📱</div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2"><?php echo __('premium_features.remote_title'); ?></h3>
                            <p class="text-gray-300 mb-4"><?php echo __('premium_features.remote_desc'); ?></p>
                            <ul class="space-y-2">
                                <li class="flex items-center space-x-2">
                                    <span class="text-green-400">✓</span>
                                    <span><?php echo __('premium_features.remote_feature_1'); ?></span>
                                </li>
                                <li class="flex items-center space-x-2">
                                    <span class="text-green-400">✓</span>
                                    <span><?php echo __('premium_features.remote_feature_2'); ?></span>
                                </li>
                                <li class="flex items-center space-x-2">
                                    <span class="text-green-400">✓</span>
                                    <span><?php echo __('premium_features.remote_feature_3'); ?></span>
                                </li>
                                <li class="flex items-center space-x-2">
                                    <span class="text-green-400">✓</span>
                                    <span><?php echo __('premium_features.remote_feature_4'); ?></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="relative">
                <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                            <?php echo __('premium_features.coming_soon'); ?>
                        </span>
                        <h3 class="text-3xl font-bold mb-2">📱 Mobil Kontrol</h3>
                        <p class="text-gray-200">Her yerden tam kontrol</p>
                    </div>
                    
                    <div class="bg-white/20 backdrop-blur rounded-xl p-6 space-y-4">
                        <div class="flex items-center justify-between bg-white/10 rounded-lg p-4">
                            <span>🎮 Oyun Durumu</span>
                            <span class="text-green-400 font-bold">Aktif</span>
                        </div>
                        <div class="flex items-center justify-between bg-white/10 rounded-lg p-4">
                            <span>⏱️ Kuyruk Süresi</span>
                            <span class="font-bold">2:34</span>
                        </div>
                        <div class="flex items-center justify-between bg-white/10 rounded-lg p-4">
                            <span>👥 Takım</span>
                            <span class="font-bold">4/5</span>
                        </div>
                        <button class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-lg transition">
                            ✓ Karşılaşmayı Kabul Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-12">
            <a href="/pricing.php" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-lg shadow-lg transform hover:scale-105 transition">
                🎯 Süresiz Lisans Al ve Erken Erişim Kazan
            </a>
        </div>
    </div>
</section>

<!-- Why Choose Section -->
<section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4"><?php echo __('why_choose.title'); ?></h2>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"><?php echo __('why_choose.subtitle'); ?></p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center group">
                <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span class="text-5xl">⚡</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('why_choose.reason_1_title'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('why_choose.reason_1_desc'); ?></p>
            </div>
            
            <div class="text-center group">
                <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span class="text-5xl">🎯</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('why_choose.reason_2_title'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('why_choose.reason_2_desc'); ?></p>
            </div>
            
            <div class="text-center group">
                <div class="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span class="text-5xl">🏆</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('why_choose.reason_3_title'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('why_choose.reason_3_desc'); ?></p>
            </div>
            
            <div class="text-center group">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span class="text-5xl">🚀</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3"><?php echo __('why_choose.reason_4_title'); ?></h3>
                <p class="text-gray-600 dark:text-gray-400"><?php echo __('why_choose.reason_4_desc'); ?></p>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="py-20 bg-gradient-to-b from-gray-50 dark:from-gray-800 to-white dark:to-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl md:text-5xl font-black text-center text-gray-900 dark:text-white mb-16"><?php echo __('stats.title'); ?></h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center group">
                <div class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div class="text-6xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        5,000+
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-bold"><?php echo __('stats.active_users'); ?></p>
                </div>
            </div>
            
            <div class="text-center group">
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div class="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        1M+
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-bold"><?php echo __('stats.matches_automated'); ?></p>
                </div>
            </div>
            
            <div class="text-center group">
                <div class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div class="text-6xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        50K+
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-bold"><?php echo __('stats.time_saved'); ?></p>
                </div>
            </div>
            
            <div class="text-center group">
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div class="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        98%
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-bold"><?php echo __('stats.satisfaction'); ?></p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="relative py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-black mb-6"><?php echo __('common.get_started') ?? 'Hemen Başlayın'; ?></h2>
        <p class="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto"><?php echo __('common.get_started_desc') ?? 'Autrex\'i indirin ve League of Legends deneyiminizi geliştirin'; ?></p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/download.php" class="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <?php echo __('hero.cta_download'); ?>
            </a>
            <a href="/pricing.php" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <?php echo __('hero.cta_pricing'); ?>
            </a>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
