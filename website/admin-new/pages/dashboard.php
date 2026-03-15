<!-- İstatistik Kartları -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Toplam Lisanslar -->
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Toplam Lisans</p>
                <p class="text-3xl font-bold text-gray-900 mt-2" x-text="formatNumber(stats.total_licenses)"></p>
                <p class="text-xs text-gray-500 mt-1">Tüm zamanlar</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Aktif Lisanslar -->
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Aktif Lisans</p>
                <p class="text-3xl font-bold text-green-600 mt-2" x-text="formatNumber(stats.active_licenses)"></p>
                <p class="text-xs text-gray-500 mt-1">Şu anda aktif</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Toplam Kullanıcılar -->
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p class="text-3xl font-bold text-purple-600 mt-2" x-text="formatNumber(stats.total_users)"></p>
                <p class="text-xs text-gray-500 mt-1">Kayıtlı</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Bugünkü Aktivasyonlar -->
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Bugünkü Aktivasyon</p>
                <p class="text-3xl font-bold text-orange-600 mt-2" x-text="formatNumber(stats.recent_activations)"></p>
                <p class="text-xs text-gray-500 mt-1">Son 24 saat</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-lg">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Grafikler -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Lisans Durumu Grafiği -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Lisans Durumu</h3>
        <div class="h-64">
            <canvas id="licenseStatusChart"></canvas>
        </div>
    </div>
    
    <!-- Lisans Tipleri Grafiği -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Lisans Tipleri</h3>
        <div class="h-64">
            <canvas id="licenseTypesChart"></canvas>
        </div>
    </div>
</div>

<!-- Son Aktivasyonlar Tablosu -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Son Aktivasyonlar</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lisans</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donanım ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Adresi</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="activation in activations" :key="activation.id">
                    <tr class="table-row">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-mono text-gray-900" x-text="activation.license_id?.substring(0, 8) + '...'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-mono text-gray-600" x-text="activation.hardware_id?.substring(0, 12) + '...'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600" x-text="activation.ip_address || '-'"></td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="badge badge-info" x-text="activation.action"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="activation.success ? 'badge-success' : 'badge-danger'" class="badge" x-text="activation.success ? 'Başarılı' : 'Başarısız'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600" x-text="formatDate(activation.created_at)"></td>
                    </tr>
                </template>
                <tr x-show="activations.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        Son aktivasyon bulunamadı
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
