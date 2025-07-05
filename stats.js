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
        this.setupEventListeners();
        await this.loadData();
        this.updateDisplay();
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
            alert('Por favor selecciona ambas fechas');
            return;
        }

        await this.loadData(startDate, endDate);
    }

    async loadData(customStart = null, customEnd = null) {
        console.log('Loading stats data for period:', this.currentPeriod);
        
        try {
            // Show loading state
            this.showLoading();

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
                this.showError('No se pudieron cargar los datos');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Error al cargar las estadísticas: ' + error.message);
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
        const data = this.filteredData;
        
        // Calculate totals
        const totalTime = data.sites.reduce((sum, site) => sum + site.time, 0);
        const totalSites = data.sites.length;
        const totalVisits = data.sites.reduce((sum, site) => sum + site.visits, 0);
        const avgSession = totalVisits > 0 ? totalTime / totalVisits : 0;

        // Update display
        document.getElementById('totalTime').textContent = this.formatTime(totalTime);
        document.getElementById('totalSites').textContent = totalSites;
        document.getElementById('totalVisits').textContent = totalVisits;
        document.getElementById('avgSession').textContent = this.formatTime(avgSession);
    }

    updateTable() {
        const tbody = document.getElementById('statsTableBody');
        const sites = this.filteredData.sites;
        
        if (sites.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay datos disponibles</td></tr>';
            return;
        }

        const totalTime = sites.reduce((sum, site) => sum + site.time, 0);

        const html = sites.map(site => {
            const percentage = totalTime > 0 ? ((site.time / totalTime) * 100).toFixed(1) : '0.0';
            const lastVisit = this.getLastVisitDate(site);
            
            return `
                <tr>
                    <td>
                        <div class="site-name" title="${site.domain}">${site.domain}</div>
                    </td>
                    <td>
                        <span class="category-badge" style="background: ${this.getCategoryColor(site.category)}">${site.category}</span>
                    </td>
                    <td class="time-cell">${this.formatTime(site.time)}</td>
                    <td class="visits-cell">${site.visits}</td>
                    <td>${lastVisit}</td>
                    <td class="percentage-cell">${percentage}%</td>
                    <td class="actions-cell">
                        <button class="action-btn block-btn ${site.blocked ? 'blocked' : ''}" 
                                data-action="toggle-block"
                                data-domain="${site.domain}"
                                title="${site.blocked ? 'Desbloquear' : 'Bloquear'}">
                            ${site.blocked ? '🔓' : '🔒'}
                        </button>
                        <button class="action-btn category-btn" 
                                data-action="change-category"
                                data-domain="${site.domain}"
                                data-category="${site.category}"
                                title="Cambiar categoría">
                            🏷️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    }

    updateCategoryStats() {
        const categoryGrid = document.getElementById('categoryGrid');
        const data = this.filteredData;
        
        // Calculate category statistics
        const categoryStats = {};
        data.sites.forEach(site => {
            if (!categoryStats[site.category]) {
                categoryStats[site.category] = { time: 0, visits: 0, sites: 0 };
            }
            categoryStats[site.category].time += site.time;
            categoryStats[site.category].visits += site.visits;
            categoryStats[site.category].sites += 1;
        });

        const html = Object.entries(categoryStats)
            .sort((a, b) => b[1].time - a[1].time)
            .map(([category, stats]) => `
                <div class="category-card">
                    <div class="category-name" style="color: ${this.getCategoryColor(category)}">${category}</div>
                    <div class="category-stats">
                        <span>${this.formatTime(stats.time)}</span>
                        <span>${stats.visits} visitas</span>
                        <span>${stats.sites} sitios</span>
                    </div>
                </div>
            `).join('');

        categoryGrid.innerHTML = html || '<p>No hay datos disponibles</p>';
    }

    updateChart() {
        const canvas = document.getElementById('timeChart');
        const ctx = canvas.getContext('2d');
        const data = this.filteredData;
        
        if (data.sites.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos para mostrar', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get top 10 sites for chart
        const topSites = data.sites.slice(0, 10);
        const maxTime = Math.max(...topSites.map(site => site.time));

        // Chart dimensions
        const margin = 60;
        const chartWidth = canvas.width - 2 * margin;
        const chartHeight = canvas.height - 2 * margin;
        const barHeight = chartHeight / topSites.length;

        // Draw bars
        topSites.forEach((site, index) => {
            const barWidth = (site.time / maxTime) * chartWidth;
            const y = margin + index * barHeight;
            
            // Bar
            ctx.fillStyle = this.getCategoryColor(site.category);
            ctx.fillRect(margin, y + barHeight * 0.2, barWidth, barHeight * 0.6);
            
            // Site name
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(site.domain, margin - 5, y + barHeight * 0.6);
            
            // Time value
            ctx.textAlign = 'right';
            ctx.fillText(this.formatTime(site.time), margin + barWidth + 5, y + barHeight * 0.6);
        });

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();
    }

    async toggleBlock(domain) {
        try {
            // Find the current blocked state
            const site = this.filteredData.sites.find(s => s.domain === domain);
            const newBlockedState = !site.blocked;

            console.log(`Toggling block for ${domain}: ${newBlockedState}`);

            const response = await chrome.runtime.sendMessage({
                action: 'blockSite',
                domain: domain,
                blocked: newBlockedState
            });

            if (response && response.success) {
                // Update local data
                site.blocked = newBlockedState;
                this.updateTable();
                
                // Show success message
                this.showNotification(`${domain} ${newBlockedState ? 'bloqueado' : 'desbloqueado'} correctamente`);
            } else {
                console.error('Error toggling block:', response);
                this.showNotification('Error al cambiar el estado de bloqueo', 'error');
            }
        } catch (error) {
            console.error('Error toggling block:', error);
            this.showNotification('Error al cambiar el estado de bloqueo', 'error');
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
                this.showNotification(`Categoría actualizada para ${this.currentModalDomain}`);
            } else {
                console.error('Error updating category:', response);
                this.showNotification('Error al actualizar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            this.showNotification('Error al actualizar la categoría', 'error');
        }
    }

    exportData() {
        if (!this.filteredData) {
            this.showNotification('No hay datos para exportar', 'error');
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
        
        this.showNotification('Datos exportados correctamente');
    }

    openOptions() {
        chrome.runtime.openOptionsPage();
    }

    convertToCSV(sites) {
        const headers = ['Sitio Web', 'Categoría', 'Tiempo (ms)', 'Tiempo (legible)', 'Visitas', 'Bloqueado'];
        const rows = sites.map(site => [
            site.domain,
            site.category,
            site.time,
            this.formatTime(site.time),
            site.visits,
            site.blocked ? 'Sí' : 'No'
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    showLoading() {
        const tbody = document.getElementById('statsTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Cargando estadísticas...</td></tr>';
        
        // Clear other sections
        document.getElementById('totalTime').textContent = '...';
        document.getElementById('totalSites').textContent = '...';
        document.getElementById('totalVisits').textContent = '...';
        document.getElementById('avgSession').textContent = '...';
    }

    showError(message) {
        const tbody = document.getElementById('statsTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="loading">Error: ${message}</td></tr>`;
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
            'Trabajo': '#667eea',
            'Entretenimiento': '#ff6b6b',
            'Noticias': '#4ecdc4',
            'Compras': '#45b7d1',
            'Educación': '#96ceb4',
            'Redes Sociales': '#feca57',
            'General': '#6c757d'
        };
        return colors[category] || '#6c757d';
    }

    getLastVisitDate(site) {
        // This would need to be implemented in the background script
        // For now, return a placeholder
        return 'Hoy';
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