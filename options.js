class OptionsManager {
    constructor() {
        this.currentTab = 'general';
        this.settings = {};
        this.categories = [];
        this.blockedSites = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.loadGlobalStats();
    }

    setupEventListeners() {
        // Navegación entre pestañas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.updateTabs();
            });
        });

        // Configuración general
        document.getElementById('saveGeneralSettings').addEventListener('click', () => {
            this.saveGeneralSettings();
        });

        // Gestión de categorías
        document.getElementById('addCategory').addEventListener('click', () => {
            this.addCategory();
        });

        document.getElementById('newCategory').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCategory();
            }
        });

        // Bloqueo de sitios
        document.getElementById('addBlockedSite').addEventListener('click', () => {
            this.addBlockedSite();
        });

        document.getElementById('newBlockedSite').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addBlockedSite();
            }
        });

        // Gestión de datos
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importData').click();
        });

        document.getElementById('importData').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('clearAllData').addEventListener('click', () => {
            this.clearAllData();
        });

        // Event delegation para botones de desbloquear sitios
        document.getElementById('blockedSitesList').addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const site = button.getAttribute('data-site');

            if (action === 'unblock-site' && site) {
                this.removeBlockedSite(site);
            }
        });

        // Event delegation para botones de categorías y dominios
        document.getElementById('categoryList').addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const category = button.getAttribute('data-category');
            const domain = button.getAttribute('data-domain');

            if (action === 'remove-category' && category) {
                this.removeCategory(category);
            } else if (action === 'add-domain' && category) {
                this.addDomainToCategory(category, button);
            } else if (action === 'remove-domain' && domain && category) {
                this.removeDomainFromCategory(domain, category);
            }
        });

        // Event listener para Enter en inputs de dominio
        document.getElementById('categoryList').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('domain-input')) {
                const category = e.target.getAttribute('data-category');
                const addButton = e.target.nextElementSibling;
                this.addDomainToCategory(category, addButton);
            }
        });
    }

    updateTabs() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === this.currentTab);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === this.currentTab);
        });
    }

    async loadSettings() {
        try {
            const data = await this.getStorageData();
            this.settings = data.settings || {};
            this.categories = data.settings?.categories || [];
            this.blockedSites = data.blockedSites || [];

            await this.updateUI();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showAlert('Error al cargar configuración', 'error');
        }
    }

    async updateUI() {
        // Configuración general
        document.getElementById('trackingEnabled').checked = this.settings.trackingEnabled !== false;
        document.getElementById('showNotifications').checked = this.settings.showNotifications !== false;
        document.getElementById('dailyGoal').value = Math.floor((this.settings.dailyGoal || 8 * 60 * 60 * 1000) / (60 * 60 * 1000));
        document.getElementById('trackingInterval').value = this.settings.trackingInterval || 1;

        // Categorías
        await this.renderCategories();

        // Sitios bloqueados
        this.renderBlockedSites();
    }

    async renderCategories() {
        const categoryList = document.getElementById('categoryList');
        
        // Incluir categorías predefinidas y personalizadas
        const allCategories = ['Trabajo', 'Entretenimiento', 'Noticias', 'Compras', 'Educación', 'Redes Sociales', 'General', ...this.categories];
        const uniqueCategories = [...new Set(allCategories)];
        
        if (uniqueCategories.length === 0) {
            categoryList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">No hay categorías disponibles</div>';
            return;
        }

        // Obtener dominios asignados a cada categoría
        const data = await this.getStorageData();
        const siteCategories = data.siteCategories || {};
        
        // Agrupar dominios por categoría
        const categoriesWithDomains = {};
        uniqueCategories.forEach(category => {
            categoriesWithDomains[category] = [];
        });
        
        Object.entries(siteCategories).forEach(([domain, category]) => {
            if (categoriesWithDomains[category]) {
                categoriesWithDomains[category].push(domain);
            }
        });

        const html = uniqueCategories.map(category => {
            const domains = categoriesWithDomains[category];
            const isCustomCategory = this.categories.includes(category);
            
            return `
                <div class="category-card">
                    <div class="category-header">
                        <div class="category-name">${category}</div>
                        ${isCustomCategory ? `
                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;"
                                    data-action="remove-category" 
                                    data-category="${category}">Eliminar</button>
                        ` : ''}
                    </div>
                    
                    <div class="category-domains">
                        <div class="domains-list">
                            ${domains.length > 0 ? domains.map(domain => `
                                <div class="domain-tag">
                                    <span>${domain}</span>
                                    <button class="remove-domain-btn"
                                            data-action="remove-domain"
                                            data-domain="${domain}"
                                            data-category="${category}">×</button>
                                </div>
                            `).join('') : '<span class="empty-domains">Sin dominios asignados</span>'}
                        </div>
                        
                        <div class="add-domain-form">
                            <input type="text" 
                                   placeholder="ejemplo.com" 
                                   data-category="${category}"
                                   class="domain-input">
                            <button class="btn btn-primary"
                                    data-action="add-domain"
                                    data-category="${category}">Añadir</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        categoryList.innerHTML = html;
    }

    renderBlockedSites() {
        const blockedList = document.getElementById('blockedSitesList');
        
        if (this.blockedSites.length === 0) {
            blockedList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">No hay sitios bloqueados</div>';
            return;
        }

        const html = this.blockedSites.map(site => `
            <div class="blocked-site-item">
                <span>${site}</span>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" 
                        data-action="unblock-site" 
                        data-site="${site}">
                    Desbloquear
                </button>
            </div>
        `).join('');

        blockedList.innerHTML = html;
    }

    async saveGeneralSettings() {
        try {
            const data = await this.getStorageData();
            
            if (!data.settings) data.settings = {};
            
            data.settings.trackingEnabled = document.getElementById('trackingEnabled').checked;
            data.settings.showNotifications = document.getElementById('showNotifications').checked;
            data.settings.dailyGoal = parseInt(document.getElementById('dailyGoal').value) * 60 * 60 * 1000;
            data.settings.trackingInterval = parseInt(document.getElementById('trackingInterval').value);

            await this.setStorageData(data);
            this.showAlert('Configuración guardada correctamente', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showAlert('Error al guardar configuración', 'error');
        }
    }

    async addCategory() {
        const input = document.getElementById('newCategory');
        const categoryName = input.value.trim();

        if (!categoryName) {
            this.showAlert('Por favor ingresa un nombre para la categoría', 'error');
            return;
        }

        if (this.categories.includes(categoryName)) {
            this.showAlert('Esta categoría ya existe', 'error');
            return;
        }

        try {
            const data = await this.getStorageData();
            
            if (!data.settings) data.settings = {};
            if (!data.settings.categories) data.settings.categories = [];
            
            data.settings.categories.push(categoryName);
            await this.setStorageData(data);
            
            this.categories.push(categoryName);
            await this.renderCategories();
            input.value = '';
            
            this.showAlert('Categoría agregada correctamente', 'success');
        } catch (error) {
            console.error('Error adding category:', error);
            this.showAlert('Error al agregar categoría', 'error');
        }
    }

    async removeCategory(categoryName) {
        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
            return;
        }

        try {
            const data = await this.getStorageData();
            
            if (data.settings && data.settings.categories) {
                data.settings.categories = data.settings.categories.filter(cat => cat !== categoryName);
                await this.setStorageData(data);
            }
            
            this.categories = this.categories.filter(cat => cat !== categoryName);
            await this.renderCategories();
            
            this.showAlert('Categoría eliminada correctamente', 'success');
        } catch (error) {
            console.error('Error removing category:', error);
            this.showAlert('Error al eliminar categoría', 'error');
        }
    }

    async addBlockedSite() {
        const input = document.getElementById('newBlockedSite');
        const siteName = input.value.trim().toLowerCase();

        if (!siteName) {
            this.showAlert('Por favor ingresa un sitio web', 'error');
            return;
        }

        // Validar formato de dominio básico
        if (!siteName.includes('.') || siteName.includes(' ')) {
            this.showAlert('Por favor ingresa un dominio válido (ejemplo: google.com)', 'error');
            return;
        }

        if (this.blockedSites.includes(siteName)) {
            this.showAlert('Este sitio ya está bloqueado', 'error');
            return;
        }

        try {
            await chrome.runtime.sendMessage({
                action: 'blockSite',
                domain: siteName,
                blocked: true
            });
            
            this.blockedSites.push(siteName);
            this.renderBlockedSites();
            input.value = '';
            
            this.showAlert('Sitio bloqueado correctamente', 'success');
        } catch (error) {
            console.error('Error blocking site:', error);
            this.showAlert('Error al bloquear sitio', 'error');
        }
    }

    async removeBlockedSite(siteName) {
        try {
            await chrome.runtime.sendMessage({
                action: 'blockSite',
                domain: siteName,
                blocked: false
            });
            
            this.blockedSites = this.blockedSites.filter(site => site !== siteName);
            this.renderBlockedSites();
            
            this.showAlert('Sitio desbloqueado correctamente', 'success');
        } catch (error) {
            console.error('Error unblocking site:', error);
            this.showAlert('Error al desbloquear sitio', 'error');
        }
    }

    async loadGlobalStats() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getStats',
                period: 'all'
            });

            const data = await this.getStorageData();
            const dailyStats = data.dailyStats || {};
            const activeDays = Object.keys(dailyStats).length;

            document.getElementById('totalTimeAll').textContent = this.formatTime(response.totalTime);
            document.getElementById('uniqueSites').textContent = response.sites.length;
            document.getElementById('activeDays').textContent = activeDays;
        } catch (error) {
            console.error('Error loading global stats:', error);
        }
    }

    async exportData() {
        try {
            const data = await this.getStorageData();
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: data
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `timetracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showAlert('Datos exportados correctamente', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showAlert('Error al exportar datos', 'error');
        }
    }

    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.version || !importData.data) {
                throw new Error('Formato de archivo inválido');
            }

            const confirmed = confirm(
                '¿Estás seguro de que quieres importar estos datos? ' +
                'Esto sobrescribirá todos tus datos actuales.'
            );

            if (!confirmed) return;

            await this.setStorageData(importData.data);
            
            this.showAlert('Datos importados correctamente. Recarga la página para ver los cambios.', 'success');
            
            // Recargar la página después de un momento
            setTimeout(() => {
                location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error importing data:', error);
            this.showAlert('Error al importar datos. Verifica que el archivo sea válido.', 'error');
        }
    }

    async clearAllData() {
        const confirmed = confirm(
            '⚠️ ADVERTENCIA: Esta acción eliminará TODOS tus datos de seguimiento de tiempo. ' +
            'Esta acción no se puede deshacer. ¿Estás absolutamente seguro?'
        );

        if (!confirmed) return;

        const doubleConfirmed = confirm(
            '¿Realmente quieres eliminar todos los datos? Escribe "ELIMINAR" para confirmar.'
        );

        if (!doubleConfirmed) return;

        try {
            await chrome.runtime.sendMessage({
                action: 'clearData',
                period: 'all'
            });
            
            // Limpiar también configuraciones
            await chrome.storage.local.clear();
            
            this.showAlert('Todos los datos han sido eliminados', 'success');
            
            // Recargar después de un momento
            setTimeout(() => {
                location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showAlert('Error al eliminar datos', 'error');
        }
    }

    async getStorageData() {
        const result = await chrome.storage.local.get(null);
        return result || {};
    }

    async setStorageData(data) {
        await chrome.storage.local.set(data);
    }

    normalizeDomain(domain) {
        // Remover protocolo si existe
        domain = domain.replace(/^https?:\/\//, '');
        
        // Remover www. al inicio (pero no subdominios reales)
        domain = domain.replace(/^www\./, '');
        
        // Remover trailing slash
        domain = domain.replace(/\/$/, '');
        
        return domain;
    }

    async addDomainToCategory(category, button) {
        const input = button.previousElementSibling;
        const rawDomain = input.value.trim().toLowerCase();

        if (!rawDomain) {
            this.showAlert('Por favor ingresa un dominio', 'error');
            return;
        }

        // Validar formato de dominio básico
        if (!rawDomain.includes('.') || rawDomain.includes(' ')) {
            this.showAlert('Por favor ingresa un dominio válido (ejemplo: google.com)', 'error');
            return;
        }

        // Normalizar dominio (quitar www. y protocolo si existe)
        const domain = this.normalizeDomain(rawDomain);

        try {
            const data = await this.getStorageData();
            if (!data.siteCategories) data.siteCategories = {};

            // Verificar si el dominio ya está asignado a otra categoría
            if (data.siteCategories[domain] && data.siteCategories[domain] !== category) {
                const confirmed = confirm(`El dominio ${domain} ya está asignado a "${data.siteCategories[domain]}". ¿Quieres reasignarlo a "${category}"?`);
                if (!confirmed) return;
            }

            // Asignar el dominio a la categoría
            data.siteCategories[domain] = category;
            await this.setStorageData(data);

            // Limpiar input y actualizar vista
            input.value = '';
            await this.renderCategories();
            
            this.showAlert(`Dominio ${domain} asignado a ${category}`, 'success');
        } catch (error) {
            console.error('Error adding domain to category:', error);
            this.showAlert('Error al asignar dominio a categoría', 'error');
        }
    }

    async removeDomainFromCategory(domain, category) {
        if (!confirm(`¿Estás seguro de que quieres quitar ${domain} de la categoría "${category}"?`)) {
            return;
        }

        try {
            const data = await this.getStorageData();
            if (data.siteCategories && data.siteCategories[domain]) {
                delete data.siteCategories[domain];
                await this.setStorageData(data);
                
                await this.renderCategories();
                this.showAlert(`Dominio ${domain} eliminado de ${category}`, 'success');
            }
        } catch (error) {
            console.error('Error removing domain from category:', error);
            this.showAlert('Error al eliminar dominio de categoría', 'error');
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    showAlert(message, type) {
        // Remover alertas existentes
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // Insertar al principio del primer tab-content activo
        const activeTab = document.querySelector('.tab-content.active');
        activeTab.insertBefore(alert, activeTab.firstChild);

        // Remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.optionsManager = new OptionsManager();
}); 