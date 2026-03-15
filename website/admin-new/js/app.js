function adminApp() {
    return {
        // State
        currentPage: 'dashboard',
        loading: false,
        initialLoad: true,
        searchQuery: '',
        
        // Data
        stats: {
            total_licenses: 0,
            active_licenses: 0,
            inactive_licenses: 0,
            expired_licenses: 0,
            total_users: 0,
            total_activations: 0,
            recent_activations: 0
        },
        
        licenses: [],
        users: [],
        activations: [],
        license_types: {},
        
        // Chart instances
        statusChart: null,
        typesChart: null,
        
        // Settings data
        settings: {},
        releaseForm: {
            version: '',
            release_notes: '',
            windows_url: '',
            mac_url: '',
            force_update: false
        },
        
        // Pagination
        pagination: {
            currentPage: 1,
            perPage: 20,
            total: 0
        },
        
        // Toast
        toast: {
            show: false,
            message: '',
            type: 'info' // success, error, info, warning
        },
        
        // Modals
        modals: {
            createLicense: false,
            editLicense: false,
            assignLicense: false,
            viewDetails: false
        },
        
        selectedItem: null,
        
        // Computed
        get pageTitle() {
            const titles = {
                dashboard: 'Kontrol Paneli',
                licenses: 'Lisans Yönetimi',
                users: 'Kullanıcı Yönetimi',
                activations: 'Aktivasyon Geçmişi',
                settings: 'Ayarlar'
            };
            return titles[this.currentPage] || 'Kontrol Paneli';
        },
        
        get pageSubtitle() {
            const subtitles = {
                dashboard: 'Sisteminizin genel görünümü',
                licenses: 'Lisansları yönetin ve izleyin',
                users: 'Kullanıcı hesaplarını yönetin',
                activations: 'Aktivasyon geçmişini görüntüleyin',
                settings: 'Sistem ayarlarını yapılandırın'
            };
            return subtitles[this.currentPage] || '';
        },
        
        get filteredLicenses() {
            if (!this.searchQuery) return this.licenses;
            
            const query = this.searchQuery.toLowerCase();
            return this.licenses.filter(license => 
                license.key?.toLowerCase().includes(query) ||
                license.hardware_id?.toLowerCase().includes(query) ||
                license.type?.toLowerCase().includes(query)
            );
        },
        
        get filteredUsers() {
            if (!this.searchQuery) return this.users;
            
            const query = this.searchQuery.toLowerCase();
            return this.users.filter(user => 
                user.email?.toLowerCase().includes(query) ||
                user.id?.toLowerCase().includes(query)
            );
        },
        
        // Methods
        async init() {
            console.log('Admin app initialized');
            await this.loadDashboardData();
            await this.loadSettings();
            this.initialLoad = false;
            
            // Watch for page changes to update charts
            this.$watch('currentPage', (value) => {
                if (value === 'dashboard') {
                    setTimeout(() => this.updateCharts(), 100);
                }
            });
        },
        
        async loadDashboardData() {
            this.loading = true;
            
            try {
                const response = await fetch('/admin-new/api/dashboard.php');
                const data = await response.json();
                
                if (data.success) {
                    this.stats = data.stats;
                    this.licenses = data.licenses || [];
                    this.users = data.users || [];
                    this.activations = data.activations || [];
                    this.license_types = data.license_types || {};
                    
                    // Update charts if on dashboard
                    if (this.currentPage === 'dashboard') {
                        setTimeout(() => this.updateCharts(), 100);
                    }
                } else {
                    this.showToast('Failed to load data: ' + (data.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Load error:', error);
                this.showToast('Failed to load data', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async refreshData() {
            console.log('Refreshing data...');
            await this.loadDashboardData();
            this.showToast('Data refreshed', 'success');
        },
        
        handleSearch() {
            // Debounce search
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                console.log('Searching:', this.searchQuery);
            }, 300);
        },
        
        showToast(message, type = 'info') {
            this.toast = {
                show: true,
                message,
                type
            };
            
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },
        
        openModal(modalName) {
            this.modals[modalName] = true;
        },
        
        closeModal(modalName) {
            this.modals[modalName] = false;
            this.selectedItem = null;
        },
        
        async createLicense(formData) {
            this.loading = true;
            
            try {
                const response = await fetch('/admin-new/api/licenses.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'create',
                        ...formData
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showToast('License created successfully', 'success');
                    this.closeModal('createLicense');
                    await this.refreshData();
                } else {
                    this.showToast('Failed to create license: ' + (data.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Create error:', error);
                this.showToast('Failed to create license', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async updateLicenseStatus(licenseId, newStatus) {
            if (!confirm('Are you sure you want to change the license status?')) {
                return;
            }
            
            this.loading = true;
            
            try {
                const response = await fetch('/admin-new/api/licenses.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'update_status',
                        license_id: licenseId,
                        status: newStatus
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showToast('License status updated', 'success');
                    await this.refreshData();
                } else {
                    this.showToast('Failed to update status: ' + (data.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Update error:', error);
                this.showToast('Failed to update status', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async deleteLicense(licenseId) {
            if (!confirm('Are you sure you want to delete this license? This action cannot be undone.')) {
                return;
            }
            
            this.loading = true;
            
            try {
                const response = await fetch('/admin-new/api/licenses.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'delete',
                        license_id: licenseId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showToast('License deleted', 'success');
                    await this.refreshData();
                } else {
                    this.showToast('Failed to delete license: ' + (data.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                this.showToast('Failed to delete license', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard', 'success');
            }).catch(err => {
                console.error('Copy failed:', err);
                this.showToast('Failed to copy', 'error');
            });
        },
        
        async loadSettings() {
            try {
                const response = await fetch('/admin-new/api/settings.php');
                const data = await response.json();
                
                if (data.success) {
                    this.settings = data.settings;
                    this.releaseForm.version = data.settings.app_version || '';
                    this.releaseForm.windows_url = data.settings.download_url_windows || '';
                    this.releaseForm.mac_url = data.settings.download_url_mac || '';
                    this.releaseForm.force_update = data.settings.force_update === 'true';
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        
        async toggleMaintenanceMode() {
            this.loading = true;
            try {
                const response = await fetch('/admin-new/api/settings.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'toggle_maintenance',
                        enabled: this.settings.maintenance_mode
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showToast(
                        this.settings.maintenance_mode ? 'Bakım modu aktif' : 'Bakım modu kapalı',
                        'success'
                    );
                } else {
                    this.showToast('Ayar güncellenemedi: ' + (data.error || 'Bilinmeyen hata'), 'error');
                    this.settings.maintenance_mode = !this.settings.maintenance_mode;
                }
            } catch (error) {
                console.error('Toggle error:', error);
                this.showToast('Ayar güncellenemedi', 'error');
                this.settings.maintenance_mode = !this.settings.maintenance_mode;
            } finally {
                this.loading = false;
            }
        },
        
        async handleReleaseUpdate() {
            if (!confirm(`Publish version ${this.releaseForm.version}?${this.releaseForm.force_update ? '\n\n⚠️ FORCE UPDATE ACTIVE! Users cannot use old version.' : ''}`)) {
                return;
            }
            
            this.loading = true;
            
            try {
                const response = await fetch('/admin-new/api/settings.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'release_update',
                        ...this.releaseForm
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showToast(`Version ${this.releaseForm.version} published successfully!`, 'success');
                    await this.loadSettings();
                } else {
                    this.showToast('Failed to publish update: ' + (data.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Release error:', error);
                this.showToast('Failed to publish update', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        formatTimeRemaining(expiresAt) {
            if (!expiresAt) return 'Sınırsız';
            
            const now = new Date();
            const expires = new Date(expiresAt);
            const diff = expires - now;
            
            if (diff <= 0) return 'Süresi Dolmuş';
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
                return `${days}g ${hours}s`;
            } else {
                return `${hours}s`;
            }
        },
        
        // License page specific data
        licenseFilter: 'all',
        createForm: {
            type: 'trial',
            max_activations: 1,
            notes: ''
        },
        bulkForm: {
            type: 'trial',
            count: 10
        },
        
        filterLicenses() {
            // Filter is handled by computed property filteredLicenses
        },
        
        async handleBulkCreate() {
            this.loading = true;
            try {
                const response = await fetch('/admin-new/api/licenses.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'bulk_create',
                        ...this.bulkForm
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showToast(`${data.created} lisans oluşturuldu`, 'success');
                    this.closeModal('bulkCreate');
                    await this.refreshData();
                } else {
                    this.showToast('Lisans oluşturulamadı: ' + (data.error || 'Bilinmeyen hata'), 'error');
                }
            } catch (error) {
                this.showToast('Lisans oluşturulamadı', 'error');
            } finally {
                this.loading = false;
            }
            
            this.bulkForm = { type: 'trial', count: 10 };
        },
        
        viewLicenseDetails(license) {
            this.selectedItem = license;
            this.openModal('viewDetails');
        },
        
        assignLicenseToUser(license) {
            this.selectedItem = license;
            this.openModal('assignLicense');
        },
        
        // User page specific data
        getUserLicenseCount(userId) {
            return this.licenses.filter(l => l.user_id === userId || l.owner_id === userId).length;
        },
        
        viewUserDetails(user) {
            this.selectedItem = user;
            this.openModal('viewDetails');
        },
        
        viewUserLicenses(user) {
            const userLicenses = this.licenses.filter(l => l.user_id === user.id || l.owner_id === user.id);
            this.selectedItem = { ...user, licenses: userLicenses };
            this.openModal('viewDetails');
        },
        
        // Activation page specific data
        activationFilter: 'all',
        
        get filteredActivations() {
            if (this.activationFilter === 'all') return this.activations;
            if (this.activationFilter === 'success') return this.activations.filter(a => a.success);
            if (this.activationFilter === 'failed') return this.activations.filter(a => !a.success);
            return this.activations;
        },
        
        filterActivations() {
            // Filtering is handled by computed property
        },
        
        getStatusBadgeClass(status) {
            const classes = {
                active: 'badge-success',
                inactive: 'badge-gray',
                expired: 'badge-warning',
                banned: 'badge-danger'
            };
            return classes[status] || 'badge-gray';
        },
        
        getTypeBadgeClass(type) {
            const classes = {
                trial: 'badge-info',
                daily: 'badge-warning',
                weekly: 'badge-success',
                monthly: 'badge-primary',
                regular: 'badge-purple'
            };
            return classes[type] || 'badge-gray';
        },
        
        formatNumber(num) {
            if (!num) return '0';
            return new Intl.NumberFormat('en-US').format(num);
        },
        
        updateCharts() {
            // License Status Chart
            const statusCtx = document.getElementById('licenseStatusChart');
            if (statusCtx && typeof Chart !== 'undefined') {
                if (this.statusChart) {
                    this.statusChart.destroy();
                }
                this.statusChart = new Chart(statusCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Active', 'Inactive', 'Expired'],
                        datasets: [{
                            data: [
                                this.stats.active_licenses || 0,
                                this.stats.inactive_licenses || 0,
                                this.stats.expired_licenses || 0
                            ],
                            backgroundColor: ['#10b981', '#6b7280', '#f59e0b'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            // License Types Chart
            const typesCtx = document.getElementById('licenseTypesChart');
            if (typesCtx && this.license_types && typeof Chart !== 'undefined') {
                if (this.typesChart) {
                    this.typesChart.destroy();
                }
                const types = Object.keys(this.license_types);
                const counts = Object.values(this.license_types);
                
                this.typesChart = new Chart(typesCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: types.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
                        datasets: [{
                            label: 'Licenses',
                            data: counts,
                            backgroundColor: '#3b82f6',
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        }
    };
}

// Helper functions
function formatNumber(num) {
    return new Intl.NumberFormat('tr-TR').format(num);
}

function formatCurrency(amount, currency = 'TRY') {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}
