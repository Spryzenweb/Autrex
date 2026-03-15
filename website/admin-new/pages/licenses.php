<!-- İşlem Çubuğu -->
<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div class="flex gap-2">
        <button @click="openModal('createLicense')" class="btn btn-primary">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Lisans Oluştur
        </button>
        
        <button @click="openModal('bulkCreate')" class="btn btn-success">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Toplu Oluştur
        </button>
    </div>
    
    <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" x-model="licenseFilter" @change="filterLicenses">
            <option value="all">Tüm Lisanslar</option>
            <option value="active">Sadece Aktif</option>
            <option value="inactive">Sadece Pasif</option>
            <option value="expired">Sadece Süresi Dolmuş</option>
        </select>
    </div>
</div>

<!-- Lisanslar Tablosu -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lisans Anahtarı</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sahip</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donanım ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="license in filteredLicenses" :key="license.id">
                    <tr class="table-row">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <span class="text-sm font-mono text-gray-900" x-text="license.key"></span>
                                <button @click="copyToClipboard(license.key)" class="ml-2 text-gray-400 hover:text-gray-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span x-text="license.owner_email || 'Atanmamış'" :class="license.owner_email ? 'text-blue-600 font-medium' : 'text-gray-400 italic'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="badge" :class="getTypeBadgeClass(license.type)" x-text="license.type?.toUpperCase()"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="badge" :class="getStatusBadgeClass(license.is_active ? 'active' : 'inactive')" x-text="license.is_active ? 'Aktif' : 'Pasif'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-mono text-gray-600" x-text="license.hardware_id ? license.hardware_id.substring(0, 12) + '...' : '-'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span x-text="formatTimeRemaining(license.expires_at)"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex gap-2">
                                <button @click="viewLicenseDetails(license)" class="text-blue-600 hover:text-blue-800" title="Detayları Gör">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                                <button @click="updateLicenseStatus(license.id, !license.is_active)" class="text-yellow-600 hover:text-yellow-800" title="Durumu Değiştir">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                    </svg>
                                </button>
                                <button @click="assignLicenseToUser(license)" class="text-green-600 hover:text-green-800" title="Kullanıcıya Ata">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </button>
                                <button @click="deleteLicense(license.id)" class="text-red-600 hover:text-red-800" title="Sil">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
                <tr x-show="filteredLicenses.length === 0">
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        Lisans bulunamadı
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


<!-- Lisans Oluştur Modal -->
<div x-show="modals.createLicense" 
     x-cloak
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
     @click.self="closeModal('createLicense')">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Yeni Lisans Oluştur</h3>
            <button @click="closeModal('createLicense')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form @submit.prevent="createLicense(createForm); createForm = { type: 'trial', max_activations: 1, notes: '' }" class="p-6 space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lisans Tipi</label>
                <select x-model="createForm.type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="trial">Deneme (6 saat)</option>
                    <option value="daily">Günlük (1 gün)</option>
                    <option value="weekly">Haftalık (7 gün)</option>
                    <option value="monthly">Aylık (30 gün)</option>
                    <option value="regular">Normal (Sınırsız)</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Maksimum Aktivasyon</label>
                <input type="number" x-model="createForm.max_activations" min="1" max="10" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notlar (Opsiyonel)</label>
                <textarea x-model="createForm.notes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Lisans notları..."></textarea>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 btn btn-primary">Oluştur</button>
                <button type="button" @click="closeModal('createLicense')" class="flex-1 btn btn-secondary">İptal</button>
            </div>
        </form>
    </div>
</div>

<!-- Toplu Oluştur Modal -->
<div x-show="modals.bulkCreate" 
     x-cloak
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
     @click.self="closeModal('bulkCreate')">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Toplu Lisans Oluştur</h3>
            <button @click="closeModal('bulkCreate')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <form @submit.prevent="handleBulkCreate" class="p-6 space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lisans Tipi</label>
                <select x-model="bulkForm.type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="trial">Deneme (6 saat)</option>
                    <option value="daily">Günlük (1 gün)</option>
                    <option value="weekly">Haftalık (7 gün)</option>
                    <option value="monthly">Aylık (30 gün)</option>
                    <option value="regular">Normal (Sınırsız)</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Miktar</label>
                <input type="number" x-model="bulkForm.count" min="1" max="100" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <p class="text-xs text-gray-500 mt-1">Maksimum 100 lisans</p>
            </div>
            
            <div class="flex gap-2 pt-4">
                <button type="submit" class="flex-1 btn btn-success">Oluştur</button>
                <button type="button" @click="closeModal('bulkCreate')" class="flex-1 btn btn-secondary">İptal</button>
            </div>
        </form>
    </div>
</div>

<!-- Lisans Detayları Modal -->
<div x-show="modals.viewDetails" 
     x-cloak
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
     @click.self="closeModal('viewDetails')">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">Lisans Detayları</h3>
            <button @click="closeModal('viewDetails')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <div class="p-6" x-show="selectedItem">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-gray-600">Lisans Anahtarı</label>
                    <div class="flex items-center mt-1">
                        <p class="font-mono text-sm" x-text="selectedItem?.key"></p>
                        <button @click="copyToClipboard(selectedItem?.key)" class="ml-2 text-blue-600 hover:text-blue-800">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Tip</label>
                    <p class="mt-1"><span class="badge" :class="getTypeBadgeClass(selectedItem?.type)" x-text="selectedItem?.type?.toUpperCase()"></span></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Durum</label>
                    <p class="mt-1"><span class="badge" :class="getStatusBadgeClass(selectedItem?.is_active ? 'active' : 'inactive')" x-text="selectedItem?.is_active ? 'Aktif' : 'Pasif'"></span></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Oluşturulma</label>
                    <p class="mt-1 text-sm" x-text="formatDate(selectedItem?.created_at)"></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Aktive Edilme</label>
                    <p class="mt-1 text-sm" x-text="selectedItem?.activated_at ? formatDate(selectedItem.activated_at) : 'Aktive edilmedi'"></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Bitiş</label>
                    <p class="mt-1 text-sm" x-text="selectedItem?.expires_at ? formatDate(selectedItem.expires_at) : 'Sınırsız'"></p>
                </div>
                <div class="col-span-2" x-show="selectedItem?.hardware_id">
                    <label class="text-sm font-medium text-gray-600">Donanım ID</label>
                    <p class="mt-1 font-mono text-sm break-all" x-text="selectedItem?.hardware_id"></p>
                </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200 mt-4 flex gap-2">
                <button @click="updateLicenseStatus(selectedItem?.id, !selectedItem?.is_active); closeModal('viewDetails')" class="flex-1 btn btn-primary">
                    <span x-text="selectedItem?.is_active ? 'Pasifleştir' : 'Aktifleştir'"></span>
                </button>
                <button @click="closeModal('viewDetails')" class="flex-1 btn btn-secondary">Kapat</button>
            </div>
        </div>
    </div>
</div>


