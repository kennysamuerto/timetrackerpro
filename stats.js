console.log('Stats page loaded');

class StatsManager {
    constructor() {
        this.currentData = null;
        this.filteredData = null;
        this.currentPeriod = 'today';
        this.categoryFilter = 'all';
        this.sortBy = 'time';
        this.searchQuery = '';
        this.chart = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing StatsManager');
        // Initialize i18n first
        await initI18n();
        await this.initializeCategorySelects();
        this.setupEventListeners();
        await this.loadData();
        this.updateDisplay();
    }

    async initializeCategorySelects() {
        try {
            // Obtener todas las categorías disponibles
            const allCategories = await this.getAllCategories();
            
            // Actualizar el modal select
            this.updateCategorySelect('modalCategorySelect', allCategories);
            
            // Actualizar el filtro de categorías
            this.updateCategoryFilter('categoryFilter', allCategories);
        } catch (error) {
            console.error('Error initializing category selects:', error);
        }
    }

    async getAllCategories() {
        try {
            const data = await chrome.storage.local.get(['settings']);
            
            // Categorías predefinidas
            const predefinedCategories = ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'finanzas', 'viajes', 'gaming', 'herramientas', 'other'];
            
            // Categorías personalizadas
            const customCategories = data.settings?.categories || [];
            
            // Combinar y eliminar duplicados
            const allCategories = [...new Set([...predefinedCategories, ...customCategories])];
            
            return allCategories;
        } catch (error) {
            console.error('Error getting categories:', error);
            return ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'other'];
        }
    }

    updateCategorySelect(selectId, categories) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = categories.map(categoryKey => {
            const categoryText = getCategoryTranslation(categoryKey);
            return `<option value="${categoryKey}" data-i18n="${categoryKey}">${categoryText}</option>`;
        }).join('');
    }

    updateCategoryFilter(selectId, categories) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Mantener la opción "All Categories" y agregar todas las categorías
        const allCategoriesText = getMessage('allCategories');
        const options = [`<option value="all" data-i18n="allCategories">${allCategoriesText}</option>`];
        
        categories.forEach(categoryKey => {
            const categoryText = getCategoryTranslation(categoryKey);
            options.push(`<option value="${categoryKey}" data-i18n="${categoryKey}">${categoryText}</option>`);
        });

        select.innerHTML = options.join('');
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadData());
        document.getElementById('optionsBtn').addEventListener('click', () => this.openOptions());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('closeBtn').addEventListener('click', () => window.close());

        // Period selector
        document.getElementById('periodSelect').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.handlePeriodChange();
        });

        // Date range
        document.getElementById('applyDateRange').addEventListener('click', () => {
            this.applyCustomDateRange();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        // Table controls
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });

        // Modal
        document.getElementById('cancelCategoryChange').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirmCategoryChange').addEventListener('click', () => {
            this.confirmCategoryChange();
        });

        // Close modal on outside click
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeModal();
            }
        });

        // Event delegation for table action buttons
        document.getElementById('statsTableBody').addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const domain = button.getAttribute('data-domain');

            if (action === 'toggle-block') {
                this.toggleBlock(domain);
            } else if (action === 'change-category') {
                const category = button.getAttribute('data-category');
                this.showCategoryModal(domain, category);
            }
        });
    }

    handlePeriodChange() {
        const dateRange = document.getElementById('dateRange');
        if (this.currentPeriod === 'custom') {
            dateRange.style.display = 'flex';
        } else {
            dateRange.style.display = 'none';
            this.loadData();
        }
    }

    async applyCustomDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            alert(getMessage('selectBothDates'));
            return;
        }

        await this.loadData(startDate, endDate);
    }

    async loadData(customStart = null, customEnd = null) {
        console.log('Loading stats data for period:', this.currentPeriod);
        
        try {
            // Show loading state
            this.showLoading();

            // Actualizar categorías disponibles
            await this.initializeCategorySelects();

            let period = this.currentPeriod;
            let dateRange = null;

            if (customStart && customEnd) {
                period = 'custom';
                dateRange = { start: customStart, end: customEnd };
            }

            const response = await chrome.runtime.sendMessage({
                action: 'getStats',
                period: period,
                dateRange: dateRange
            });

            console.log('Stats response:', response);

            if (response) {
                this.currentData = response;
                this.applyFilters();
            } else {
                console.error('No response from background script');
                this.showError(getMessage('couldNotLoadData'));
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError(getMessage('errorLoadingStats') + ': ' + error.message);
        }
    }

    applyFilters() {
        if (!this.currentData) return;

        let sites = [...this.currentData.sites];

        // Filter by category
        if (this.categoryFilter !== 'all') {
            sites = sites.filter(site => site.category === this.categoryFilter);
        }

        // Filter by search query
        if (this.searchQuery) {
            sites = sites.filter(site => 
                site.domain.toLowerCase().includes(this.searchQuery) ||
                site.title?.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort
        sites.sort((a, b) => {
            switch (this.sortBy) {
                case 'time':
                    return b.time - a.time;
                case 'visits':
                    return b.visits - a.visits;
                case 'domain':
                    return a.domain.localeCompare(b.domain);
                default:
                    return b.time - a.time;
            }
        });

        this.filteredData = {
            ...this.currentData,
            sites: sites
        };

        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.filteredData) return;

        this.updateSummaryCards();
        this.updateTable();
        this.updateCategoryStats();
        this.updateChart();
    }

    updateSummaryCards() {
        const totalTime = this.filteredData.sites.reduce((sum, site) => sum + site.time, 0);
        const totalSites = this.filteredData.sites.length;
        const totalVisits = this.filteredData.sites.reduce((sum, site) => sum + site.visits, 0);
        const avgSession = totalVisits > 0 ? totalTime / totalVisits : 0;

        document.getElementById('totalTime').textContent = this.formatTime(totalTime);
        document.getElementById('totalSites').textContent = totalSites;
        document.getElementById('totalVisits').textContent = totalVisits;
        document.getElementById('avgSession').textContent = this.formatTime(avgSession);
    }

    updateTable() {
        const tbody = document.getElementById('statsTableBody');
        
        if (!this.filteredData.sites || this.filteredData.sites.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="loading">${getMessage('noDataToShow')}</td></tr>`;
            return;
        }

        const totalTime = this.filteredData.sites.reduce((sum, site) => sum + site.time, 0);
        
        tbody.innerHTML = this.filteredData.sites.map(site => {
            const percentage = totalTime > 0 ? ((site.time / totalTime) * 100).toFixed(1) : 0;
            const isBlocked = site.blocked;
            
            // Normalizar categoría y obtener traducción
            const categoryKey = normalizeCategoryToKey(site.category);
            const categoryText = getCategoryTranslation(categoryKey);
            
            return `
                <tr>
                    <td class="site-cell">
                        <div class="site-info">
                            <span class="site-domain">${site.domain}</span>
                            ${site.title ? `<span class="site-title">${site.title}</span>` : ''}
                        </div>
                    </td>
                    <td>
                        <span class="category-badge" style="background-color: ${this.getCategoryColor(categoryKey)}">${categoryText}</span>
                    </td>
                    <td class="time-cell">${this.formatTime(site.time)}</td>
                    <td class="visits-cell">${site.visits}</td>
                    <td class="date-cell">${this.getLastVisitDate(site)}</td>
                    <td class="percentage-cell">${percentage}%</td>
                    <td class="actions-cell">
                        <button 
                            class="btn-action ${isBlocked ? 'btn-unblock' : 'btn-block'}"
                            data-action="toggle-block"
                            data-domain="${site.domain}"
                            title="${isBlocked ? getMessage('unblock') : getMessage('block')}"
                        >
                            ${isBlocked ? '🔓' : '🔒'}
                        </button>
                        <button 
                            class="btn-action btn-category"
                            data-action="change-category"
                            data-domain="${site.domain}"
                            data-category="${categoryKey}"
                            title="${getMessage('changeCategory')}"
                        >
                            🏷️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateCategoryStats() {
        const categoryGrid = document.getElementById('categoryGrid');
        const categoryStats = {};

        // Calculate stats by category using normalized keys
        this.filteredData.sites.forEach(site => {
            const categoryKey = normalizeCategoryToKey(site.category);
            if (!categoryStats[categoryKey]) {
                categoryStats[categoryKey] = {
                    time: 0,
                    visits: 0,
                    sites: 0
                };
            }
            categoryStats[categoryKey].time += site.time;
            categoryStats[categoryKey].visits += site.visits;
            categoryStats[categoryKey].sites += 1;
        });

        categoryGrid.innerHTML = Object.entries(categoryStats).map(([categoryKey, stats]) => {
            const categoryText = getCategoryTranslation(categoryKey);
            return `
                <div class="category-card">
                    <div class="category-header">
                        <span class="category-name">${categoryText}</span>
                        <span class="category-color" style="background-color: ${this.getCategoryColor(categoryKey)}"></span>
                    </div>
                    <div class="category-stats">
                        <div class="stat-item">
                            <span class="stat-label">${getMessage('time')}:</span>
                            <span class="stat-value">${this.formatTime(stats.time)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${getMessage('visits')}:</span>
                            <span class="stat-value">${stats.visits}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${getMessage('sites')}:</span>
                            <span class="stat-value">${stats.sites}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateChart() {
        const canvas = document.getElementById('timeChart');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!this.filteredData.sites || this.filteredData.sites.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(getMessage('noDataToShow'), canvas.width / 2, canvas.height / 2);
            return;
        }

        // Get top 10 sites
        const topSites = this.filteredData.sites.slice(0, 10);
        const maxTime = Math.max(...topSites.map(site => site.time));
        
        const barHeight = 30;
        const barSpacing = 10;
        const leftPadding = 200;
        const rightPadding = 60;
        const topPadding = 20;

        topSites.forEach((site, index) => {
            const y = topPadding + (barHeight + barSpacing) * index;
            const barWidth = ((site.time / maxTime) * (canvas.width - leftPadding - rightPadding));
            
            // Normalizar categoría para color consistente
            const categoryKey = normalizeCategoryToKey(site.category);
            
            // Draw bar
            ctx.fillStyle = this.getCategoryColor(categoryKey);
            ctx.fillRect(leftPadding, y, barWidth, barHeight);
            
            // Draw site name
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(site.domain, leftPadding - 10, y + 20);
            
            // Draw time
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(this.formatTime(site.time), leftPadding + barWidth + 10, y + 20);
        });
    }

    async toggleBlock(domain) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'toggleBlock',
                domain: domain
            });

            if (response && response.success) {
                // Update local data
                const site = this.filteredData.sites.find(s => s.domain === domain);
                if (site) {
                    site.blocked = response.blocked;
                }
                
                this.updateDisplay();
                this.showNotification(
                    response.blocked ? 
                    getMessage('siteBlocked').replace('{domain}', domain) : 
                    getMessage('siteUnblocked').replace('{domain}', domain)
                );
            } else {
                console.error('Error toggling block:', response);
                this.showNotification(getMessage('errorToggleBlock'), 'error');
            }
        } catch (error) {
            console.error('Error toggling block:', error);
            this.showNotification(getMessage('errorToggleBlock'), 'error');
        }
    }

    showCategoryModal(domain, currentCategory) {
        this.currentModalDomain = domain;
        document.getElementById('modalSiteName').textContent = domain;
        document.getElementById('modalCategorySelect').value = currentCategory;
        document.getElementById('categoryModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('categoryModal').style.display = 'none';
        this.currentModalDomain = null;
    }

    async confirmCategoryChange() {
        if (!this.currentModalDomain) return;

        const newCategory = document.getElementById('modalCategorySelect').value;
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'updateCategory',
                domain: this.currentModalDomain,
                category: newCategory
            });

            if (response && response.success) {
                // Update local data
                const site = this.filteredData.sites.find(s => s.domain === this.currentModalDomain);
                if (site) {
                    site.category = newCategory;
                }
                
                this.updateDisplay();
                this.closeModal();
                this.showNotification(getMessage('categoryUpdated').replace('{domain}', this.currentModalDomain));
            } else {
                console.error('Error updating category:', response);
                this.showNotification(getMessage('errorUpdateCategory'), 'error');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            this.showNotification(getMessage('errorUpdateCategory'), 'error');
        }
    }

    exportData() {
        if (!this.filteredData) {
            this.showNotification(getMessage('noDataToExport'), 'error');
            return;
        }

        const csvData = this.convertToCSV(this.filteredData.sites);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetracker-stats-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification(getMessage('dataExported'));
    }

    openOptions() {
        chrome.runtime.openOptionsPage();
    }

    convertToCSV(sites) {
        const headers = [
            getMessage('website'),
            getMessage('category'),
            getMessage('time') + ' (ms)',
            getMessage('time') + ' (' + getMessage('readable') + ')',
            getMessage('visits'),
            getMessage('blocked')
        ];
        
        const rows = sites.map(site => [
            site.domain,
            getCategoryTranslation(normalizeCategoryToKey(site.category)),
            site.time,
            this.formatTime(site.time),
            site.visits,
            site.blocked ? getMessage('yes') : getMessage('no')
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    showLoading() {
        const tbody = document.getElementById('statsTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="loading">${getMessage('loading')}</td></tr>`;
        
        // Clear other sections
        document.getElementById('totalTime').textContent = '...';
        document.getElementById('totalSites').textContent = '...';
        document.getElementById('totalVisits').textContent = '...';
        document.getElementById('avgSession').textContent = '...';
    }

    showError(message) {
        const tbody = document.getElementById('statsTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="loading">${getMessage('error')}: ${message}</td></tr>`;
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0s';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    getCategoryColor(category) {
        const colors = {
            'work': '#667eea',
            'entertainment': '#ff6b6b',
            'news': '#4ecdc4',
            'shopping': '#45b7d1',
            'education': '#96ceb4',
            'social': '#feca57',
            'finanzas': '#28a745',
            'viajes': '#fd7e14',
            'gaming': '#e83e8c',
            'herramientas': '#6f42c1',
            'other': '#6c757d'
        };
        return colors[category] || '#6c757d';
    }

    getLastVisitDate(site) {
        // This would need to be implemented in the background script
        // For now, return a placeholder
        return getMessage('today');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('categoryModal').style.display === 'block') {
            window.statsManager.closeModal();
        }
    }
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        window.statsManager.loadData();
    }
}); 