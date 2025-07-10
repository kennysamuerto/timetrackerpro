/**
 * Sistema de Internacionalización para TimeTracker Pro
 * Funciona tanto en contexto de extensión Chrome como en servidor local
 */

class I18nManager {
    constructor() {
        this.currentLocale = 'en';
        this.translations = {};
        this.fallbackTranslations = {};
        this.isExtensionContext = this.checkExtensionContext();
        
        // Fallback translations for development/testing
        this.fallbackData = {
            'en': {
                'welcomeTitle': 'Welcome to TimeTracker Pro!',
                'welcomeSubtitle': 'Your new tool to control online time',
                'installationCompleted': '✅ Installation Completed',
                'welcomeIntroTitle': '🎉 Thank you for installing TimeTracker Pro!',
                'welcomeIntroDesc': 'TimeTracker Pro is a complete extension that helps you become more aware of how you spend your time on the internet. It allows you to track, analyze, and manage your browsing time intelligently and privately.',
                'welcomeCoffeeDesc': 'This development is completely free and nothing is charged for this plugin. But if you value the time I spend developing and maintaining this extension, I would appreciate if you buy me a coffee. Any amount you want to give me! ☕',
                'buyMeACoffee': 'Buy Me a Coffee',
                'privacyTitle': '🔒 100% Private and Secure',
                'privacyDesc': 'Your privacy is our priority: All your data is stored locally on your browser. We don\'t send any information to external servers. Only you have access to your time statistics.',
                'privacyPoint1': '✅ Data stored locally',
                'privacyPoint2': '✅ No telemetry or external tracking',
                'privacyPoint3': '✅ Open source and auditable code',
                'quickStartTitle': '🚀 How to Get Started',
                'step1Title': 'Open the Popup',
                'step1Desc': 'Click on the ⏱️ TimeTracker Pro icon in the toolbar to see your daily statistics.',
                'step2Title': 'Explore Statistics',
                'step2Desc': 'Use the "📊 View Complete Statistics" button for detailed analysis and charts.',
                'step3Title': 'Configure to Your Liking',
                'step3Desc': 'Access "⚙️ Settings" to customize categories, block sites, and set goals.',
                'quickAccessTip': '💡 Tip: For quick access, pin the extension by clicking the puzzle icon 🧩 in the toolbar and then the pin 📌 next to TimeTracker Pro.',
                'mainFeaturesTitle': '✨ Main Features',
                'feature1Title': 'Smart Tracking',
                'feature1Desc': 'Automatically tracks the time you spend on each website with minute precision.',
                'feature2Title': 'Detailed Statistics',
                'feature2Desc': 'Analyze your time by day, week, month, or custom periods with visual charts.',
                'feature3Title': 'Automatic Categorization',
                'feature3Desc': 'Sites are automatically categorized: Work, Entertainment, News, etc.',
                'feature4Title': 'Site Blocking',
                'feature4Desc': 'Block distracting sites or allow temporary access to improve your productivity.',
                'feature5Title': 'Daily Goals',
                'feature5Desc': 'Set time goals and monitor your progress towards more conscious browsing.',
                'feature6Title': 'Export/Import',
                'feature6Desc': 'Back up your data or transfer your history between devices easily.',
                'popupGuideTitle': '🎮 Popup Guide',
                'dailySummaryTitle': '📋 Daily Summary',
                'dailySummaryDesc': 'See your total time, sites visited, and number of visits for the current day.',
                'topSitesTitle': '🏆 Top Sites',
                'topSitesDesc': 'Ranking of the sites where you\'ve spent the most time today, with time and visits.',
                'quickActionsTitle': '🔗 Quick Actions',
                'quickActionsDesc': '📊 View Complete Statistics: Opens detailed analysis<br>⚙️ Settings: Configure the extension<br>🔄 Update: Refresh data',
                'tipsTitle': '💡 Tips to Make the Most of It',
                'welcomeTip1': 'Search for specific sites on the statistics page to find usage patterns.',
                'welcomeTip2': 'Compare periods to see how your online behavior has changed over time.',
                'welcomeTip3': 'Use temporary blocking when you need brief access to distracting sites.',
                'welcomeTip4': 'Export your data regularly to maintain a long-term history.',
                'startNowTitle': '🎯 Start Now!',
                'startNowDesc': 'TimeTracker Pro is already working in the background, recording your browsing time.',
                'viewMyPopup': '📊 View My Popup',
                'exploreStats': '📈 Explore Statistics',
                'goToSettings': '⚙️ Go to Settings',
                'footerMessage': 'We hope TimeTracker Pro helps you be more productive and aware of your online time! 🚀',
                'footerNote': 'For support or suggestions, don\'t hesitate to contact us. Thank you for choosing TimeTracker Pro!',
                
                // Options page translations
                'options': 'Configuration and advanced options',
                'generalTab': 'General',
                'categoriesTab': 'Categories',
                'blockedSitesTab': 'Blocking',
                'advancedTab': 'Data',
                'language': 'Language',
                'selectLanguage': 'Select Language',
                'english': 'English',
                'spanish': 'Spanish',
                'timeTracking': 'Time Tracking',
                'timeTrackingDesc': 'Customize time tracking behavior',
                'enableTimeTracking': 'Enable time tracking',
                'enableNotifications': 'Enable notifications',
                'dailyGoal': 'Daily goal (hours)',
                'trackingInterval': 'Tracking interval (minutes)',
                'save': 'Save',
                'categories': 'Category Management',
                'categoriesDesc': 'Customize categories to organize your websites',
                'addCategory': 'Add new category',
                'siteBlocking': 'Site Blocking',
                'siteBlockingDesc': 'Manage blocked websites to improve your productivity',
                'addBlockedSite': 'Add site to block',
                'block': 'Block',
                'noBlockedSites': 'No blocked sites',
                'statistics': 'Global Statistics',
                'dataManagement': 'Data Management',
                'dataManagementDesc': 'Export, import or delete your tracking data',
                'exportData': 'Export Data',
                'importData': 'Import Data',
                'dangerZone': 'Danger Zone',
                'dangerZoneDesc': 'These actions are irreversible. Proceed with caution.',
                'clearAllData': 'Clear All Data',
                
                // Category translations
                'work': 'Work',
                'entertainment': 'Entertainment',
                'news': 'News',
                'shopping': 'Shopping',
                'education': 'Education',
                'social': 'Social',
                'other': 'Other',
                
                // Additional translations for options
                'remove': 'Remove',
                'addDomain': 'Add',
                'enterDomain': 'Enter domain (e.g. google.com)',
                'noDomains': 'No domains assigned',
                'noCategoriesAvailable': 'No categories available',
                'changeCategory': 'Change Category',
                'categoryUpdated': 'Category updated for {domain}',
                'errorUpdateCategory': 'Error updating category',
                'yes': 'Yes',
                'no': 'No',
                'noDataToShow': 'No data to show',
                'loading': 'Loading...',
                'error': 'Error',
                'today': 'Today',
                'time': 'Time',
                'visits': 'Visits',
                'sites': 'Sites',
                'website': 'Website',
                'category': 'Category',
                'lastVisit': 'Last Visit',
                'percentage': '% of Total',
                'actions': 'Actions',
                'block': 'Block',
                'unblock': 'Unblock',
                'cancel': 'Cancel',
                'readable': 'readable',
                'blocked': 'Blocked',
                'noDataToExport': 'No data to export',
                'dataExported': 'Data exported successfully',
                'websiteDetails': 'Website Details',
                'allCategories': 'All Categories',
                'sortByTime': 'Sort by Time',
                'sortByVisits': 'Sort by Visits',
                'sortByDomain': 'Sort by Domain',
                'categoryStats': 'Statistics by Category'
            },
            'es': {
                'welcomeTitle': '¡Bienvenido a TimeTracker Pro!',
                'welcomeSubtitle': 'Tu nueva herramienta para controlar el tiempo en línea',
                'installationCompleted': '✅ Instalación Completada',
                'welcomeIntroTitle': '🎉 ¡Gracias por instalar TimeTracker Pro!',
                'welcomeIntroDesc': 'TimeTracker Pro es una extensión completa que te ayuda a ser más consciente de cómo pasas tu tiempo en internet. Te permite seguir, analizar y gestionar tu tiempo de navegación de manera inteligente y privada.',
                'welcomeCoffeeDesc': 'Este desarrollo es completamente gratuito y no se cobra nada por este plugin. Pero si valoras el tiempo que dedico desarrollando y manteniendo esta extensión, te agradecería que me compraras un café. ¡La cantidad que tú quieras darme! ☕',
                'buyMeACoffee': 'Cómprame un Café',
                'privacyTitle': '🔒 100% Privado y Seguro',
                'privacyDesc': 'Tu privacidad es nuestra prioridad: Todos tus datos se almacenan localmente en tu navegador. No enviamos ninguna información a servidores externos. Solo tú tienes acceso a tus estadísticas de tiempo.',
                'privacyPoint1': '✅ Datos almacenados localmente',
                'privacyPoint2': '✅ Sin telemetría o tracking externo',
                'privacyPoint3': '✅ Código abierto y auditable',
                'quickStartTitle': '🚀 Cómo Empezar',
                'step1Title': 'Abre el Popup',
                'step1Desc': 'Haz clic en el icono ⏱️ de TimeTracker Pro en la barra de herramientas para ver tus estadísticas del día.',
                'step2Title': 'Explora las Estadísticas',
                'step2Desc': 'Usa el botón "📊 Ver Estadísticas Completas" para análisis detallados y gráficos.',
                'step3Title': 'Configura a tu Gusto',
                'step3Desc': 'Accede a "⚙️ Ajustes" para personalizar categorías, bloquear sitios y configurar objetivos.',
                'quickAccessTip': '💡 Tip: Para acceso rápido, fija la extensión haciendo clic en el icono de puzzle 🧩 en la barra de herramientas y luego en el pin 📌 junto a TimeTracker Pro.',
                'mainFeaturesTitle': '✨ Funciones Principales',
                'feature1Title': 'Seguimiento Inteligente',
                'feature1Desc': 'Rastrea automáticamente el tiempo que pasas en cada sitio web con precisión al minuto.',
                'feature2Title': 'Estadísticas Detalladas',
                'feature2Desc': 'Analiza tu tiempo por día, semana, mes o períodos personalizados con gráficos visuales.',
                'feature3Title': 'Categorización Automática',
                'feature3Desc': 'Los sitios se categorizan automáticamente: Trabajo, Entretenimiento, Noticias, etc.',
                'feature4Title': 'Bloqueo de Sitios',
                'feature4Desc': 'Bloquea sitios distractores o permite acceso temporal para mejorar tu productividad.',
                'feature5Title': 'Objetivos Diarios',
                'feature5Desc': 'Establece metas de tiempo y monitorea tu progreso hacia una navegación más consciente.',
                'feature6Title': 'Exportar/Importar',
                'feature6Desc': 'Respalda tus datos o transfiere tu historial entre dispositivos fácilmente.',
                'popupGuideTitle': '🎮 Guía del Popup',
                'dailySummaryTitle': '📋 Resumen Diario',
                'dailySummaryDesc': 'Ve tu tiempo total, sitios visitados y número de visitas del día actual.',
                'topSitesTitle': '🏆 Top Sitios',
                'topSitesDesc': 'Ranking de los sitios donde más tiempo has pasado hoy, con tiempo y visitas.',
                'quickActionsTitle': '🔗 Acciones Rápidas',
                'quickActionsDesc': '📊 Ver Estadísticas Completas: Abre el análisis detallado<br>⚙️ Ajustes: Configura la extensión<br>🔄 Actualizar: Refresca los datos',
                'tipsTitle': '💡 Tips para Aprovechar al Máximo',
                'welcomeTip1': 'Busca sitios específicos en la página de estadísticas para encontrar patrones de uso.',
                'welcomeTip2': 'Compara períodos para ver cómo ha cambiado tu comportamiento online con el tiempo.',
                'welcomeTip3': 'Usa el bloqueo temporal cuando necesites acceso breve a sitios distractores.',
                'welcomeTip4': 'Exporta tus datos regularmente para mantener un historial a largo plazo.',
                'startNowTitle': '🎯 ¡Comienza Ahora!',
                'startNowDesc': 'TimeTracker Pro ya está funcionando en segundo plano, registrando tu tiempo de navegación.',
                'viewMyPopup': '📊 Ver Mi Popup',
                'exploreStats': '📈 Explorar Estadísticas',
                'goToSettings': '⚙️ Ir a Configuración',
                'footerMessage': '¡Esperamos que TimeTracker Pro te ayude a ser más productivo y consciente de tu tiempo en línea! 🚀',
                'footerNote': 'Para soporte o sugerencias, no dudes en contactarnos. ¡Gracias por elegir TimeTracker Pro!',
                
                // Traducciones página de opciones
                'options': 'Configuración y opciones avanzadas',
                'generalTab': 'General',
                'categoriesTab': 'Categorías',
                'blockedSitesTab': 'Bloqueo',
                'advancedTab': 'Datos',
                'language': 'Idioma',
                'selectLanguage': 'Seleccionar Idioma',
                'english': 'Inglés',
                'spanish': 'Español',
                'timeTracking': 'Seguimiento de Tiempo',
                'timeTrackingDesc': 'Personaliza el comportamiento del seguimiento de tiempo',
                'enableTimeTracking': 'Activar seguimiento de tiempo',
                'enableNotifications': 'Mostrar notificaciones',
                'dailyGoal': 'Objetivo diario (horas)',
                'trackingInterval': 'Intervalo de seguimiento (minutos)',
                'save': 'Guardar',
                'categories': 'Gestión de Categorías',
                'categoriesDesc': 'Personaliza las categorías para organizar tus sitios web',
                'addCategory': 'Agregar nueva categoría',
                'siteBlocking': 'Bloqueo de Sitios',
                'siteBlockingDesc': 'Gestiona los sitios web bloqueados para mejorar tu productividad',
                'addBlockedSite': 'Agregar sitio a bloquear',
                'block': 'Bloquear',
                'noBlockedSites': 'No hay sitios bloqueados',
                'statistics': 'Estadísticas Globales',
                'dataManagement': 'Gestión de Datos',
                'dataManagementDesc': 'Exporta, importa o elimina tus datos de seguimiento',
                'exportData': 'Exportar Datos',
                'importData': 'Importar Datos',
                'dangerZone': 'Zona Peligrosa',
                'dangerZoneDesc': 'Estas acciones son irreversibles. Procede con precaución.',
                'clearAllData': 'Eliminar Todos los Datos',
                
                // Traducciones de categorías
                'work': 'Trabajo',
                'entertainment': 'Entretenimiento',
                'news': 'Noticias',
                'shopping': 'Compras',
                'education': 'Educación',
                'social': 'Redes Sociales',
                'other': 'Otros',
                
                // Additional translations for options
                'remove': 'Eliminar',
                'addDomain': 'Agregar',
                'enterDomain': 'Introducir dominio (ej. google.com)',
                'noDomains': 'No hay dominios asignados',
                'noCategoriesAvailable': 'No hay categorías disponibles',
                'changeCategory': 'Cambiar Categoría',
                'categoryUpdated': 'Categoría actualizada para {domain}',
                'errorUpdateCategory': 'Error al actualizar categoría',
                'yes': 'Sí',
                'no': 'No',
                'noDataToShow': 'No hay datos para mostrar',
                'loading': 'Cargando...',
                'error': 'Error',
                'today': 'Hoy',
                'time': 'Tiempo',
                'visits': 'Visitas',
                'sites': 'Sitios',
                'website': 'Sitio Web',
                'category': 'Categoría',
                'lastVisit': 'Última Visita',
                'percentage': '% del Total',
                'actions': 'Acciones',
                'block': 'Bloquear',
                'unblock': 'Desbloquear',
                'cancel': 'Cancelar',
                'readable': 'legible',
                'blocked': 'Bloqueado',
                'noDataToExport': 'No hay datos para exportar',
                'dataExported': 'Datos exportados correctamente',
                'websiteDetails': 'Detalles de Sitios Web',
                'allCategories': 'Todas las Categorías',
                'sortByTime': 'Ordenar por Tiempo',
                'sortByVisits': 'Ordenar por Visitas',
                'sortByDomain': 'Ordenar por Dominio',
                'categoryStats': 'Estadísticas por Categoría'
            }
        };
    }

    checkExtensionContext() {
        return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL;
    }

    async init() {
        try {
            console.log('[i18n] Initializing I18n Manager');
            
            // Detect browser language
            const browserLanguage = this.detectBrowserLanguage();
            
            // Get saved language preference
            const savedLanguage = await this.getSavedLocale();
            
            // Determine current locale
            this.currentLocale = savedLanguage || browserLanguage || 'en';
            
            // Load translations
            await this.loadTranslations(this.currentLocale);
            
            // Apply translations to page
            this.applyTranslations();
            
            console.log(`[i18n] Initialized with locale: ${this.currentLocale}`);
            
        } catch (error) {
            console.error('[i18n] Error initializing:', error);
            // Fallback to English with embedded translations
            this.currentLocale = 'en';
            this.translations = this.fallbackData['en'];
            this.applyTranslations();
        }
    }

    detectBrowserLanguage() {
        if (this.isExtensionContext && chrome.i18n) {
            return chrome.i18n.getUILanguage().substring(0, 2);
        }
        return navigator.language.substring(0, 2);
    }

    async getSavedLocale() {
        try {
            if (this.isExtensionContext) {
                const result = await chrome.storage.local.get(['language']);
                return result.language;
            } else {
                // For local development, check localStorage
                return localStorage.getItem('language');
            }
        } catch (error) {
            console.warn('[i18n] Error getting saved locale:', error);
            return null;
        }
    }

    async loadTranslations(locale) {
        try {
            if (this.isExtensionContext) {
                // Load from extension _locales folder
                const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to load translations for ${locale}`);
                }
                
                const messages = await response.json();
                this.translations = {};
                
                // Convert Chrome extension message format to simple key-value
                for (const [key, value] of Object.entries(messages)) {
                    this.translations[key] = value.message;
                }
                
                console.log(`[i18n] Loaded ${Object.keys(this.translations).length} translations for ${locale}`);
            } else {
                // Use fallback data for local development
                this.translations = this.fallbackData[locale] || this.fallbackData['en'];
                console.log(`[i18n] Using fallback translations for ${locale}`);
                
                // Force apply translations immediately in local development
                setTimeout(() => {
                    this.applyTranslations();
                }, 100);
            }
            
        } catch (error) {
            console.error(`[i18n] Error loading translations for ${locale}:`, error);
            
            // Use fallback data as final resort
            this.translations = this.fallbackData[locale] || this.fallbackData['en'];
            console.log(`[i18n] Using fallback translations after error for ${locale}`);
            
            // Force apply translations
            setTimeout(() => {
                this.applyTranslations();
            }, 100);
        }
    }

    applyTranslations() {
        // Apply translations to all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Handle HTML content (like <br> tags)
                if (translation.includes('<br>')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                document.title = translation;
            }
        }
    }

    getTranslation(key) {
        const translation = this.translations[key];
        if (!translation) {
            console.warn(`[i18n] Missing translation for key: ${key}`);
            return key; // Return key if translation not found
        }
        return translation;
    }

    async setLanguage(locale) {
        try {
            console.log(`[i18n] Changing language to: ${locale}`);
            
            // Save language preference
            if (this.isExtensionContext) {
                await chrome.storage.local.set({ language: locale });
            } else {
                localStorage.setItem('language', locale);
            }
            
            // Update current locale
            this.currentLocale = locale;
            
            // Load new translations
            await this.loadTranslations(locale);
            
            // Apply translations
            this.applyTranslations();
            
            console.log(`[i18n] Language changed to: ${locale}`);
            
        } catch (error) {
            console.error(`[i18n] Error changing language to ${locale}:`, error);
        }
    }

    getCurrentLanguage() {
        return this.currentLocale;
    }
}

// Global instance
let i18nManager = null;

// Initialize function
async function initI18n() {
    if (!i18nManager) {
        i18nManager = new I18nManager();
    }
    await i18nManager.init();
    return i18nManager;
}

// Helper functions for compatibility
function getTranslation(key) {
    return i18nManager ? i18nManager.getTranslation(key) : key;
}

function getCurrentLanguage() {
    return i18nManager ? i18nManager.getCurrentLanguage() : 'en';
}

async function setLanguage(locale) {
    if (i18nManager) {
        await i18nManager.setLanguage(locale);
    }
}

// Additional compatibility functions for existing code
function _(key) {
    return i18nManager ? i18nManager.getTranslation(key) : key;
}

function getMessage(key) {
    return i18nManager ? i18nManager.getTranslation(key) : key;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initI18n().catch(console.error);
    });
} else {
    initI18n().catch(console.error);
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.i18nManager = i18nManager;
    window.initI18n = initI18n;
    window.getTranslation = getTranslation;
    window.getCurrentLanguage = getCurrentLanguage;
    window.setLanguage = setLanguage;
    window._ = _;
    window.getMessage = getMessage;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initI18n,
        getTranslation,
        getCurrentLanguage,
        setLanguage,
        _,
        getMessage
    };
} 

// Categoria mapping helper functions
function getCategoryKeys() {
    return ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'finanzas', 'viajes', 'gaming', 'herramientas', 'other'];
}

function getCategoryKey(translatedCategory) {
    const keys = getCategoryKeys();
    for (const key of keys) {
        if (getMessage(key) === translatedCategory) {
            return key;
        }
    }
    return translatedCategory.toLowerCase(); // fallback
}

function getCategoryTranslation(key) {
    return getMessage(key) || key;
}

function normalizeCategoryToKey(category) {
    // Si ya es una key válida, devolverla
    if (getCategoryKeys().includes(category.toLowerCase())) {
        return category.toLowerCase();
    }
    
    // Si es una traducción, buscar la key
    const key = getCategoryKey(category);
    if (key) {
        return key;
    }
    
    // Fallback: convertir a lowercase
    return category.toLowerCase();
} 