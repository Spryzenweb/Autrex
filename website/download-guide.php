<?php
$page_title = "İndirme ve Kurulum Rehberi";
include 'includes/header.php';
?>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
    <div class="container mx-auto px-4 max-w-4xl">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                İndirme ve Kurulum Rehberi
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400">
                Autrex'i güvenle indirin ve kurun
            </p>
        </div>

        <!-- Download Button -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Autrex'i İndir
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Windows 10/11 için (64-bit)
            </p>
            <a href="https://autrex.com/downloads/latest" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                İndir (v1.0.1)
            </a>
        </div>

        <!-- Security Warning Section -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-8">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                        ⚠️ Windows Güvenlik Uyarısı Görebilirsiniz
                    </h3>
                    <p class="text-yellow-800 dark:text-yellow-300 mb-2">
                        İndirme sırasında Windows Defender veya SmartScreen uyarısı çıkabilir. Bu normaldir ve Autrex tamamen güvenlidir.
                    </p>
                    <p class="text-sm text-yellow-700 dark:text-yellow-400">
                        Aşağıda uyarıyı nasıl atlayacağınızı detaylı olarak anlattık.
                    </p>
                </div>
            </div>
        </div>

        <!-- Installation Steps -->
        <div class="space-y-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Kurulum Adımları
            </h2>

            <!-- Step 1 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Dosyayı İndirin
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            Yukarıdaki "İndir" butonuna tıklayarak Autrex-1.0.1-setup.exe dosyasını indirin.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            SmartScreen Uyarısını Atlayın
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            İndirilen dosyayı çalıştırdığınızda şu uyarıyı görebilirsiniz:
                        </p>
                        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <p class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                "Windows bu uygulamayı korudu"<br>
                                "Windows SmartScreen tanınmayan bir uygulamanın başlatılmasını engelledi"
                            </p>
                        </div>
                        <div class="space-y-2">
                            <p class="text-gray-600 dark:text-gray-400">
                                <strong class="text-gray-900 dark:text-white">Çözüm:</strong>
                            </p>
                            <ol class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                                <li><strong>"Daha fazla bilgi"</strong> linkine tıklayın</li>
                                <li><strong>"Yine de çalıştır"</strong> butonuna tıklayın</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Kurulumu Tamamlayın
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            Kurulum sihirbazını takip edin:
                        </p>
                        <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                            <li>Kurulum konumunu seçin (varsayılan önerilir)</li>
                            <li>"Masaüstü kısayolu oluştur" seçeneğini işaretleyin</li>
                            <li>"Kur" butonuna tıklayın</li>
                            <li>Kurulum tamamlandığında "Bitir" tıklayın</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        ✓
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Autrex'i Başlatın
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            Masaüstündeki Autrex ikonuna çift tıklayarak uygulamayı başlatın. İlk açılışta lisans anahtarınızı girmeniz istenecek.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Antivirus Section -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Antivirüs Programı Uyarısı
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Bazı antivirüs programları da uyarı verebilir. İşte popüler antivirüs programları için çözümler:
            </p>

            <div class="space-y-4">
                <!-- Avast/AVG -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-2">Avast / AVG</h3>
                    <ol class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                        <li>Uyarıda "Daha fazla bilgi" tıklayın</li>
                        <li>"Yine de çalıştır" seçin</li>
                        <li>Veya Autrex.exe'yi istisna listesine ekleyin</li>
                    </ol>
                </div>

                <!-- Norton -->
                <div class="border-l-4 border-yellow-500 pl-4">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-2">Norton</h3>
                    <ol class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                        <li>"Ayrıntılar" tıklayın</li>
                        <li>"Bu dosyayı çalıştır" seçin</li>
                        <li>Veya Ayarlar → Antivirüs → İstisnalar ekleyin</li>
                    </ol>
                </div>

                <!-- Windows Defender -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-2">Windows Defender</h3>
                    <ol class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                        <li>Windows Güvenlik'i açın</li>
                        <li>Virüs ve tehdit koruması → Ayarları yönet</li>
                        <li>Dışlamalar → Klasör ekle</li>
                        <li>Autrex klasörünü seçin (C:\Program Files\Autrex)</li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Why This Warning -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Neden Bu Uyarı Çıkıyor?
            </h2>
            <div class="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                    Bu uyarı şu nedenlerle çıkabilir:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Yeni Uygulama:</strong> Autrex henüz yeterli "reputation" kazanmadı</li>
                    <li><strong>Dijital İmza:</strong> Code signing certificate henüz eklenmedi (yakında eklenecek)</li>
                    <li><strong>Az İndirme:</strong> Microsoft'un sisteminde yeterli indirme verisi yok</li>
                </ul>
            </div>
        </div>

        <!-- Is It Safe -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 mb-8">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        ✅ Autrex Tamamen Güvenlidir
                    </h2>
                    <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                        <li class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Açık kaynak kodlu
                        </li>
                        <li class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Zararlı kod içermez
                        </li>
                        <li class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Sadece League of Legends ile etkileşime girer
                        </li>
                        <li class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Kişisel verilerinizi toplamaz
                        </li>
                        <li class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Virüs/malware içermez
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Future Plans -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Gelecek Planlar
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                Bu uyarıları tamamen kaldırmak için çalışıyoruz:
            </p>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                <li class="flex items-center gap-2">
                    <span class="text-blue-600 dark:text-blue-400">📝</span>
                    <strong>Dijital İmza:</strong> Code signing certificate alınacak
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-blue-600 dark:text-blue-400">🏪</span>
                    <strong>Microsoft Store:</strong> Store'a yüklenecek
                </li>
                <li class="flex items-center gap-2">
                    <span class="text-blue-600 dark:text-blue-400">⭐</span>
                    <strong>Reputation:</strong> Daha fazla kullanıcı indirdikçe uyarılar azalacak
                </li>
            </ul>
        </div>

        <!-- Support -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Hala Yardıma mı İhtiyacınız Var?
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Kurulum sırasında sorun yaşıyorsanız bizimle iletişime geçin
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="/user/support.php" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    Destek Talebi Oluştur
                </a>
                <a href="https://github.com/hoangvu12/autrex" target="_blank" class="inline-flex items-center px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                    </svg>
                    GitHub
                </a>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
