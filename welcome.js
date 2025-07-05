class WelcomeManager {
    constructor() {
        this.currentLanguage = 'en';
        this.init();
    }

    async init() {
        console.log('Initializing Welcome Manager');
        
        // Initialize i18n first
        await initI18n();
        
        // Set up language selector
        this.setupLanguageSelector();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('TimeTracker Pro - Welcome page loaded correctly');
    }

    setupLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        // Get current language from i18n system
        this.currentLanguage = getCurrentLanguage();
        
        // Set active language button
        this.updateLanguageButtons();
        
        // Add click listeners
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                this.changeLanguage(selectedLang);
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
            console.log('Changing language to:', language);
            
            // Store language preference
            await chrome.storage.sync.set({ language: language });
            
            // Update current language
            this.currentLanguage = language;
            
            // Update i18n and apply translations
            await setLanguage(language);
            
            // Update language buttons
            this.updateLanguageButtons();
            
            // Show confirmation message
            this.showLanguageChangeNotification(language);
            
        } catch (error) {
            console.error('Error changing language:', error);
        }
    }

    showLanguageChangeNotification(language) {
        const messages = {
            'en': 'Language changed to English',
            'es': 'Idioma cambiado a Español'
        };
        
        const message = messages[language] || messages['en'];
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    setupEventListeners() {
        // Button event listeners
        const popupBtn = document.getElementById('popup-btn');
        const statsBtn = document.getElementById('stats-btn');
        const optionsBtn = document.getElementById('options-btn');
        const coffeeBtn = document.getElementById('coffee-btn');
        
        if (popupBtn) {
            popupBtn.addEventListener('click', this.openPopup);
        }
        
        if (statsBtn) {
            statsBtn.addEventListener('click', this.openStats);
        }
        
        if (optionsBtn) {
            optionsBtn.addEventListener('click', this.openOptions);
        }
        
        if (coffeeBtn) {
            coffeeBtn.addEventListener('click', this.openCoffee);
        }
    }

    openPopup() {
        try {
            if (chrome.action && chrome.action.openPopup) {
                chrome.action.openPopup();
            } else {
                // Fallback message based on current language
                const currentLang = getCurrentLanguage();
                const messages = {
                    'en': 'To view the popup, click on the ⏱️ TimeTracker Pro icon in the toolbar',
                    'es': 'Para ver el popup, haz clic en el icono ⏱️ de TimeTracker Pro en la barra de herramientas'
                };
                alert(messages[currentLang] || messages['en']);
            }
        } catch (error) {
            const currentLang = getCurrentLanguage();
            const messages = {
                'en': 'To view the popup, click on the ⏱️ TimeTracker Pro icon in the toolbar',
                'es': 'Para ver el popup, haz clic en el icono ⏱️ de TimeTracker Pro en la barra de herramientas'
            };
            alert(messages[currentLang] || messages['en']);
        }
    }

    openStats() {
        chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
    }

    openOptions() {
        chrome.runtime.openOptionsPage();
    }

    openCoffee() {
        chrome.tabs.create({ url: 'https://coff.ee/vandertoorm' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.welcomeManager = new WelcomeManager();
}); 