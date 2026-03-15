<!-- İstatistik Satırı -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p class="text-3xl font-bold text-gray-900 mt-2" x-text="formatNumber(stats.total_users)"></p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Doğrulanmış Kullanıcı</p>
                <p class="text-3xl font-bold text-green-600 mt-2" x-text="formatNumber(users.filter(u => u.email_confirmed_at).length)"></p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Lisanslı Kullanıcı</p>
                <p class="text-3xl font-bold text-purple-600 mt-2" x-text="formatNumber(licenses.filter(l => l.owner_email).length)"></p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Kullanıcılar Tablosu -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Tüm Kullanıcılar</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta Durumu</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lisanslar</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="user in filteredUsers" :key="user.id">
                    <tr class="table-row">
                        <td class="px-6 py-4">
                            <div>
                                <p class="font-medium text-gray-900" x-text="user.email"></p>
                                <p class="text-xs text-gray-500 font-mono" x-text="user.id.substring(0, 8) + '...'"></p>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="user.email_confirmed_at ? 'badge-success' : 'badge-warning'" class="badge" x-text="user.email_confirmed_at ? 'Doğrulandı' : 'Beklemede'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="badge badge-info" x-text="getUserLicenseCount(user.id) + ' Lisans'"></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600" x-text="formatDate(user.created_at)"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex gap-2">
                                <button @click="viewUserDetails(user)" class="text-blue-600 hover:text-blue-800" title="Detayları Gör">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </button>
                                <button @click="viewUserLicenses(user)" class="text-green-600 hover:text-green-800" title="Lisansları Gör">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
                <tr x-show="filteredUsers.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        Kullanıcı bulunamadı
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Kullanıcı Detayları Modal -->
<div x-show="modals.viewDetails" 
     x-cloak
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
     @click.self="closeModal('viewDetails')">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Kullanıcı Detayları</h3>
            <button @click="closeModal('viewDetails')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <div class="p-6" x-show="selectedItem">
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="text-sm font-medium text-gray-600">E-posta</label>
                    <p class="mt-1 text-lg font-medium" x-text="selectedItem?.email"></p>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-medium text-gray-600">Kullanıcı ID</label>
                    <p class="mt-1 font-mono text-sm break-all" x-text="selectedItem?.id"></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">E-posta Durumu</label>
                    <p class="mt-1"><span :class="selectedItem?.email_confirmed_at ? 'badge-success' : 'badge-warning'" class="badge" x-text="selectedItem?.email_confirmed_at ? 'Doğrulandı' : 'Beklemede'"></span></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Kayıt Tarihi</label>
                    <p class="mt-1 text-sm" x-text="formatDate(selectedItem?.created_at)"></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Son Giriş</label>
                    <p class="mt-1 text-sm" x-text="selectedItem?.last_sign_in_at ? formatDate(selectedItem.last_sign_in_at) : 'Hiç'"></p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Toplam Lisans</label>
                    <p class="mt-1 text-sm" x-text="getUserLicenseCount(selectedItem?.id)"></p>
                </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200 mt-4">
                <button @click="closeModal('viewDetails')" class="w-full btn btn-secondary">Kapat</button>
            </div>
        </div>
    </div>
</div>


