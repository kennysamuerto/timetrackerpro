class OptionsManager {
    constructor() {
        this.currentTab = 'general';
        this.settings = {};
        this.categories = [];
        this.blockedSites = [];
        this.i18nReady = false;
        this.currentLanguage = 'es'; // idioma por defecto
        this.init();
    }

    async init() {
        // Esperar a que el sistema i18n esté listo
        await this.initializeI18n();
        this.setupEventListeners();
        this.loadSettings();
        this.loadGlobalStats();
    }

    async initializeI18n() {
        // Esperar a que el sistema i18n esté inicializado
        await initI18n();
        this.i18nReady = true;
        
        // Configurar el selector de idioma
        await this.setupLanguageSelector();
    }

    async setupLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        if (langButtons.length === 0) return;

        // Obtener idioma actual del sistema i18n
        this.currentLanguage = getCurrentLanguage();
        
        // Establecer botón activo
        this.updateLanguageButtons();
        
        // Configurar event listeners para botones
        langButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                await this.changeLanguage(selectedLang);
            });
        });
    }

    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    async changeLanguage(language) {
        if (language === this.currentLanguage) return;
        
        try {
            console.log(`Changing language to: ${language}`);
            
            // Cambiar idioma usando el sistema i18n
            await setLanguage(language);
            this.currentLanguage = language;
            
            // Actualizar botones
            this.updateLanguageButtons();
            
            // Actualizar textos dinámicos después del cambio de idioma
            setTimeout(() => {
                this.updateDynamicTexts();
            }, 100);
            
            // Mostrar notificación de cambio exitoso
            this.showLanguageChangeNotification(language);
            
        } catch (error) {
            console.error('Error changing language:', error);
            this.showAlert('Error al cambiar idioma', 'error');
        }
    }

    showLanguageChangeNotification(language) {
        const messages = {
            'en': 'Language changed to English',
            'es': 'Idioma cambiado a Español'
        };
        
        const message = messages[language] || messages['en'];
        this.showAlert(message, 'success');
    }

    updateDynamicTexts() {
        // Actualizar textos que no son automáticamente traducidos
        this.renderCategories();
        this.renderBlockedSites();
        
        // Actualizar estado de botones de idioma
        this.updateLanguageButtons();
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
        
        // Categorías predefinidas (siempre usar keys)
        const predefinedCategoryKeys = ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'other'];

        // Incluir categorías personalizadas (normalizar a keys)
        const customCategoryKeys = this.categories.map(cat => normalizeCategoryToKey(cat));
        
        // Combinar y eliminar duplicados
        const allCategoryKeys = [...new Set([...predefinedCategoryKeys, ...customCategoryKeys])];
        
        if (allCategoryKeys.length === 0) {
            const noCategoriesText = this.i18nReady ? getMessage('noCategoriesAvailable') : 'No hay categorías disponibles';
            categoryList.innerHTML = `<div style="text-align: center; color: #6c757d; padding: 20px;">${noCategoriesText}</div>`;
            return;
        }

        // Obtener dominios asignados a cada categoría
        const data = await this.getStorageData();
        const siteCategories = data.siteCategories || {};
        
        // Agrupar dominios por categoría (normalizar keys)
        const categoriesWithDomains = {};
        allCategoryKeys.forEach(categoryKey => {
            categoriesWithDomains[categoryKey] = [];
        });
        
        Object.entries(siteCategories).forEach(([domain, category]) => {
            const categoryKey = normalizeCategoryToKey(category);
            if (categoriesWithDomains[categoryKey]) {
                categoriesWithDomains[categoryKey].push(domain);
            }
        });

        const removeText = this.i18nReady ? getMessage('remove') : 'Eliminar';
        const addDomainText = this.i18nReady ? getMessage('addDomain') : 'Agregar';
        const enterDomainText = this.i18nReady ? getMessage('enterDomain') : 'Introducir dominio (ej. google.com)';
        const noDomainsText = this.i18nReady ? getMessage('noDomains') : 'No hay dominios asignados';

        const html = allCategoryKeys.map(categoryKey => {
            const domains = categoriesWithDomains[categoryKey];
            const categoryText = getCategoryTranslation(categoryKey);
            const isCustomCategory = customCategoryKeys.includes(categoryKey) && !predefinedCategoryKeys.includes(categoryKey);
            
            return `
                <div class="category-card">
                    <div class="category-header">
                        <div class="category-name">${categoryText}</div>
                        ${isCustomCategory ? `
                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;"
                                    data-action="remove-category" 
                                    data-category="${categoryKey}">${removeText}</button>
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
                                            data-category="${categoryKey}">×</button>
                                </div>
                            `).join('') : `<span class="empty-domains">${noDomainsText}</span>`}
                        </div>
                        
                        <div class="add-domain-form">
                            <input type="text" 
                                   placeholder="${enterDomainText}" 
                                   data-category="${categoryKey}"
                                   class="domain-input">
                            <button class="btn btn-primary"
                                    data-action="add-domain"
                                    data-category="${categoryKey}">${addDomainText}</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        categoryList.innerHTML = html;
    }

    renderBlockedSites() {
        const blockedList = document.getElementById('blockedSitesList');
        
        const noBlockedSitesText = this.i18nReady ? getMessage('noBlockedSites') : 'No hay sitios bloqueados';
        const unblockText = this.i18nReady ? getMessage('unblock') : 'Desbloquear';
        
        if (this.blockedSites.length === 0) {
            blockedList.innerHTML = `<div style="text-align: center; color: #6c757d; padding: 20px;">${noBlockedSitesText}</div>`;
            return;
        }

        const html = this.blockedSites.map(site => `
            <div class="blocked-site-item">
                <span>${site}</span>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" 
                        data-action="unblock-site" 
                        data-site="${site}">
                    ${unblockText}
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
            
            const successMessage = this.i18nReady ? getMessage('settingsSaved') : 'Configuración guardada correctamente';
            this.showAlert(successMessage, 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            const errorMessage = this.i18nReady ? getMessage('errorSavingSettings') : 'Error al guardar configuración';
            this.showAlert(errorMessage, 'error');
        }
    }

    async addCategory() {
        const input = document.getElementById('newCategory');
        const categoryName = input.value.trim();

        if (!categoryName) {
            const message = this.i18nReady ? getMessage('pleaseEnterCategoryName') : 'Por favor ingresa un nombre para la categoría';
            this.showAlert(message, 'error');
            return;
        }

        if (this.categories.includes(categoryName)) {
            const message = this.i18nReady ? getMessage('categoryAlreadyExists') : 'Esta categoría ya existe';
            this.showAlert(message, 'error');
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
            
            const successMessage = this.i18nReady ? getMessage('categoryAdded') : 'Categoría agregada correctamente';
            this.showAlert(successMessage, 'success');
        } catch (error) {
            console.error('Error adding category:', error);
            const errorMessage = this.i18nReady ? getMessage('errorAddingCategory') : 'Error al agregar categoría';
            this.showAlert(errorMessage, 'error');
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
                const currentCategoryText = getCategoryTranslation(normalizeCategoryToKey(data.siteCategories[domain]));
                const newCategoryText = getCategoryTranslation(category);
                const confirmed = confirm(`El dominio ${domain} ya está asignado a "${currentCategoryText}". ¿Quieres reasignarlo a "${newCategoryText}"?`);
                if (!confirmed) return;
            }

            // Asignar el dominio a la categoría
            data.siteCategories[domain] = category;
            await this.setStorageData(data);

            // Limpiar input y actualizar vista
            input.value = '';
            await this.renderCategories();
            
            const categoryText = getCategoryTranslation(category);
            this.showAlert(`Dominio ${domain} asignado a ${categoryText}`, 'success');
        } catch (error) {
            console.error('Error adding domain to category:', error);
            this.showAlert('Error al asignar dominio a categoría', 'error');
        }
    }

    async removeDomainFromCategory(domain, category) {
        const categoryText = getCategoryTranslation(category);
        if (!confirm(`¿Estás seguro de que quieres quitar ${domain} de la categoría "${categoryText}"?`)) {
            return;
        }

        try {
            const data = await this.getStorageData();
            if (data.siteCategories && data.siteCategories[domain]) {
                delete data.siteCategories[domain];
                await this.setStorageData(data);
                
                await this.renderCategories();
                this.showAlert(`Dominio ${domain} eliminado de ${categoryText}`, 'success');
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