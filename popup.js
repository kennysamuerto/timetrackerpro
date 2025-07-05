console.log('TimeTracker Pro popup loaded');

class SimplePopupManager {
    constructor() {
        console.log('SimplePopupManager constructor called');
        this.i18nReady = false;
        this.init();
    }

    async init() {
        console.log('SimplePopupManager init called');
        
        // Inicializar sistema i18n
        await this.initializeI18n();
        
        this.setupEventListeners();
        this.loadStats();
    }

    async initializeI18n() {
        try {
            if (typeof i18n !== 'undefined') {
                await i18n.init();
                this.i18nReady = true;
                console.log('i18n initialized in popup');
                
                // Escuchar cambios de idioma
                document.addEventListener('languageChanged', (event) => {
                    console.log('Language changed in popup:', event.detail.locale);
                    this.updateDynamicTexts();
                });
            }
        } catch (error) {
            console.error('Error initializing i18n in popup:', error);
        }
    }

    updateDynamicTexts() {
        // Actualizar textos que se cargan dinámicamente
        const statusText = document.getElementById('statusText');
        if (statusText && this.i18nReady) {
            // Verificar si el tracking está activo
            chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
                if (response && response.settings) {
                    const isActive = response.settings.trackingEnabled !== false;
                    statusText.textContent = isActive ? getMessage('activeTime') : getMessage('trackingDisabled');
                }
            });
        }
        
        // Recargar stats para actualizar textos
        this.loadStats();
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        const configBtn = document.getElementById('configBtn');
        const optionsBtn = document.getElementById('optionsBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const statsBtn = document.getElementById('statsBtn');

        if (configBtn) {
            configBtn.addEventListener('click', () => {
                console.log('Config button clicked');
                chrome.runtime.openOptionsPage();
            });
        }

        if (optionsBtn) {
            optionsBtn.addEventListener('click', () => {
                console.log('Options button clicked');
                chrome.runtime.openOptionsPage();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('Refresh button clicked');
                this.loadStats();
            });
        }

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                console.log('Stats button clicked');
                chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
            });
        }

        const versionText = document.getElementById('versionText');
        if (versionText) {
            versionText.addEventListener('click', () => {
                console.log('Version text clicked');
                chrome.tabs.create({ url: chrome.runtime.getURL('versiones.html') });
            });
        }
    }

    async loadStats() {
        console.log('Loading stats...');
        
        try {
            // Mostrar estado de carga
            const statsContent = document.getElementById('statsContent');
            if (statsContent) {
                const loadingText = this.i18nReady ? getMessage('loading') : 'Loading statistics...';
                statsContent.innerHTML = `<div class="loading">${loadingText}</div>`;
            }

            const response = await chrome.runtime.sendMessage({
                action: 'getStats',
                period: 'today'
            });

            console.log('Stats response:', response);

            if (response) {
                this.updateSummary(response);
                this.updateSitesList(response.sites || []);
            } else {
                console.log('No response from background script');
                if (statsContent) {
                    const noDataText = this.i18nReady ? getMessage('noDataToday') : 'No data available';
                    statsContent.innerHTML = `<div class="loading">${noDataText}</div>`;
                }
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            const statsContent = document.getElementById('statsContent');
            if (statsContent) {
                const errorText = this.i18nReady ? getMessage('error') : 'Error loading statistics';
                statsContent.innerHTML = `<div class="loading">${errorText}</div>`;
            }
        }
    }

    updateSummary(data) {
        console.log('Updating summary with data:', data);
        
        const totalTime = data.totalTime || 0;
        const totalSites = data.sites ? data.sites.length : 0;
        const totalVisits = data.sites ? data.sites.reduce((sum, site) => sum + (site.visits || 0), 0) : 0;

        const timeEl = document.getElementById('totalTime');
        const sitesEl = document.getElementById('totalSites');
        const visitsEl = document.getElementById('totalVisits');

        if (timeEl) timeEl.textContent = this.formatTime(totalTime);
        if (sitesEl) sitesEl.textContent = totalSites;
        if (visitsEl) visitsEl.textContent = totalVisits;
    }

    updateSitesList(sites) {
        console.log('Updating sites list with:', sites);
        
        const container = document.getElementById('statsContent');
        if (!container) {
            return;
        }
        
        if (!sites || sites.length === 0) {
            const noDataText = this.i18nReady ? getMessage('noDataToday') : 'No data available';
            container.innerHTML = `<div class="loading">${noDataText}</div>`;
            return;
        }

        const visitsText = this.i18nReady ? getMessage('visits').toLowerCase() : 'visits';

        const html = sites.slice(0, 5).map(site => `
            <div class="site-item">
                <div class="site-info">
                    <div class="site-name">${site.domain}</div>
                    <div class="site-time">${this.formatTime(site.time)} • ${site.visits || 0} ${visitsText}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0s';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Función para inicializar el popup
function initializePopup() {
    console.log('Initializing popup...');
    
    try {
        new SimplePopupManager();
        console.log('Popup initialized successfully');
    } catch (error) {
        console.error('Error initializing popup:', error);
        
        const content = document.querySelector('.content');
        if (content) {
            content.innerHTML = `
                <div class="loading">
                    Error initializing: ${error.message}
                </div>
            `;
        }
    }
}

// Múltiples formas de inicializar para asegurar que funcione
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePopup);
} else {
    // DOM ya está cargado
    initializePopup();
}

// Fallback adicional
window.addEventListener('load', () => {
    console.log('Window loaded, backup initialization');
    if (!window.popupInitialized) {
        window.popupInitialized = true;
        initializePopup();
    }
}); 