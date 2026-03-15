<?php
// Handle language change
if (isset($_GET['lang']) && in_array($_GET['lang'], ['tr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

$lang = $_SESSION['lang'] ?? 'tr';

$translations = [
    'tr' => [
        'title' => 'Bakım Modu',
        'subtitle' => 'Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kapalıdır.',
        'when_title' => 'Ne zaman açılacak?',
        'when_desc' => 'Bakım çalışmamız en kısa sürede tamamlanacaktır. Lütfen daha sonra tekrar deneyin.',
        'feature1' => 'Sistem Güncellemeleri',
        'feature2' => 'Performans İyileştirmeleri',
        'feature3' => 'Güvenlik Güncellemeleri',
        'contact_text' => 'Acil bir durumda bizimle iletişime geçebilirsiniz:',
        'retry' => 'Tekrar Dene',
        'rights' => 'Tüm hakları saklıdır.'
    ],
    'en' => [
        'title' => 'Maintenance Mode',
        'subtitle' => 'Our site is temporarily closed due to maintenance work.',
        'when_title' => 'When will it open?',
        'when_desc' => 'Our maintenance work will be completed as soon as possible. Please try again later.',
        'feature1' => 'System Updates',
        'feature2' => 'Performance Improvements',
        'feature3' => 'Security Updates',
        'contact_text' => 'You can contact us in case of emergency:',
        'retry' => 'Try Again',
        'rights' => 'All rights reserved.'
    ]
];

$t = $translations[$lang];
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $t['title']; ?> - Autrex</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-purple-600 to-blue-600 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
        <!-- Language Selector -->
        <div class="flex justify-end mb-4">
            <div class="bg-white rounded-lg shadow-md p-2 flex gap-2">
                <a href="?lang=tr" class="px-4 py-2 rounded <?php echo $lang === 'tr' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'; ?> transition">
                    🇹🇷 TR
                </a>
                <a href="?lang=en" class="px-4 py-2 rounded <?php echo $lang === 'en' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'; ?> transition">
                    🇬🇧 EN
                </a>
            </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <!-- Icon -->
            <div class="mb-8">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full">
                    <svg class="w-12 h-12 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>
            </div>
            
            <!-- Title -->
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                <?php echo $t['title']; ?>
            </h1>
            
            <!-- Message -->
            <p class="text-xl text-gray-600 mb-8">
                <?php echo $t['subtitle']; ?>
            </p>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p class="text-gray-700 mb-2">
                    <strong><?php echo $t['when_title']; ?></strong>
                </p>
                <p class="text-gray-600">
                    <?php echo $t['when_desc']; ?>
                </p>
            </div>
            
            <!-- Features -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-3xl mb-2">🔧</div>
                    <p class="text-sm text-gray-600"><?php echo $t['feature1']; ?></p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-3xl mb-2">⚡</div>
                    <p class="text-sm text-gray-600"><?php echo $t['feature2']; ?></p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="text-sm text-gray-600"><?php echo $t['feature3']; ?></p>
                </div>
            </div>
            
            <!-- Contact -->
            <div class="border-t border-gray-200 pt-6">
                <p class="text-gray-600 mb-4">
                    <?php echo $t['contact_text']; ?>
                </p>
                <a href="mailto:support@autrex.com" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    support@autrex.com
                </a>
            </div>
            
            <!-- Retry Button -->
            <div class="mt-8">
                <button onclick="location.reload()" class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg">
                    🔄 <?php echo $t['retry']; ?>
                </button>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="text-center mt-8 text-white">
            <p class="text-sm opacity-90">
                © <?php echo date('Y'); ?> Autrex. <?php echo $t['rights']; ?>
            </p>
        </div>
    </div>
</body>
</html>
