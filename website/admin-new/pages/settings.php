<!-- Settings Page -->
<div class="max-w-4xl space-y-6">
    
    <!-- Release Update Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">Release Update</h3>
                <p class="text-sm text-gray-500">Manage app version and download links</p>
            </div>
            <div class="text-right">
                <p class="text-xs text-gray-500">Current Version</p>
                <p class="text-2xl font-bold text-blue-600 font-mono" x-text="settings.app_version || '1.0.0'"></p>
            </div>
        </div>
        
        <form @submit.prevent="handleReleaseUpdate" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Version Number <span class="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    x-model="releaseForm.version"
                    pattern="[0-9]+\.[0-9]+\.[0-9]+"
                    required
                    placeholder="1.0.0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <p class="text-xs text-gray-500 mt-1">Format: X.Y.Z (e.g., 1.2.3)</p>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Release Notes</label>
                <textarea 
                    x-model="releaseForm.release_notes"
                    rows="4"
                    placeholder="What's new in this version?&#10;- New feature 1&#10;- Bug fix 2&#10;- Improvement 3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        🪟 Windows Download Link
                    </label>
                    <input 
                        type="url" 
                        x-model="releaseForm.windows_url"
                        placeholder="https://github.com/user/repo/releases/download/v1.0.0/setup.exe"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-1">Direct download link for Windows</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        🍎 Mac Download Link
                    </label>
                    <input 
                        type="url" 
                        x-model="releaseForm.mac_url"
                        placeholder="https://github.com/user/repo/releases/download/v1.0.0/app.dmg"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-1">Direct download link for Mac</p>
                </div>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <label class="flex items-start cursor-pointer">
                    <input 
                        type="checkbox" 
                        x-model="releaseForm.force_update"
                        class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1">
                    <div class="ml-3">
                        <span class="text-sm font-medium text-gray-700">Force Update</span>
                        <p class="text-xs text-gray-600 mt-1">Users must update to continue using the app</p>
                    </div>
                </label>
            </div>
            
            <div class="flex gap-2 pt-4 border-t border-gray-200">
                <button type="submit" class="btn btn-primary">
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Publish Update
                </button>
                <button type="button" @click="loadSettings" class="btn btn-secondary">Reset</button>
            </div>
        </form>
        
        <!-- Current Links Display -->
        <div class="mt-6 pt-6 border-t border-gray-200" x-show="settings.download_url_windows || settings.download_url_mac">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Current Download Links</h4>
            <div class="space-y-2">
                <div x-show="settings.download_url_windows" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🪟</span>
                        <span class="text-sm font-medium text-gray-700">Windows</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <a :href="settings.download_url_windows" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs" x-text="settings.download_url_windows"></a>
                        <button @click="copyToClipboard(settings.download_url_windows)" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div x-show="settings.download_url_mac" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🍎</span>
                        <span class="text-sm font-medium text-gray-700">Mac</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <a :href="settings.download_url_mac" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs" x-text="settings.download_url_mac"></a>
                        <button @click="copyToClipboard(settings.download_url_mac)" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Admin Account -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Admin Account</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value="<?php echo e($_SESSION['admin_email'] ?? 'admin@autrex.com'); ?>" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input type="text" value="Administrator" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            </div>
        </div>
    </div>
    
    <!-- System Settings -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Sistem Ayarları</h3>
        <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                    <p class="font-medium text-gray-900">Bakım Modu</p>
                    <p class="text-sm text-gray-500">Sistemi bakım moduna alın (kullanıcılar giriş yapamaz)</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" x-model="settings.maintenance_mode" @change="toggleMaintenanceMode">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                    <p class="font-medium text-gray-900">E-posta Bildirimleri</p>
                    <p class="text-sm text-gray-500">Önemli olaylar için e-posta uyarıları alın</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="font-medium text-gray-900">Süresi Dolmuş Lisansları Göster</p>
                    <p class="text-sm text-gray-500">Ana listede süresi dolmuş lisansları göster</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
    </div>
    
    <!-- Database Info -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Database Information</h3>
        <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-sm font-medium text-gray-600">Provider</span>
                <span class="text-sm text-gray-900">Supabase</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-sm font-medium text-gray-600">Status</span>
                <span class="badge badge-success">Connected</span>
            </div>
            <div class="flex justify-between py-2">
                <span class="text-sm font-medium text-gray-600">Last Sync</span>
                <span class="text-sm text-gray-900" x-text="formatDate(new Date())"></span>
            </div>
        </div>
    </div>
    
    <!-- Danger Zone -->
    <div class="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-red-900">Clear All Activations</p>
                    <p class="text-sm text-red-700">Remove all activation history (licenses will remain)</p>
                </div>
                <button class="btn btn-danger">Clear</button>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-red-200">
                <div>
                    <p class="font-medium text-red-900">Export All Data</p>
                    <p class="text-sm text-red-700">Download complete database backup</p>
                </div>
                <button class="btn btn-secondary">Export</button>
            </div>
        </div>
    </div>
</div>
