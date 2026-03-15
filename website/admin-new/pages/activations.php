<!-- Aktivasyonlar Tablosu -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Aktivasyon Geçmişi</h3>
        <div class="flex gap-2">
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" x-model="activationFilter" @change="filterActivations">
                <option value="all">Tümü</option>
                <option value="success">Sadece Başarılı</option>
                <option value="failed">Sadece Başarısız</option>
            </select>
        </div>
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hata</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="activation in filteredActivations" :key="activation.id">
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
                        <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" x-text="activation.error_message || '-'"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600" x-text="formatDate(activation.created_at)"></td>
                    </tr>
                </template>
                <tr x-show="filteredActivations.length === 0">
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        Aktivasyon bulunamadı
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


