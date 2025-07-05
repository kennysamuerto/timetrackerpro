class BlockedPage {
    constructor() {
        this.siteName = this.getSiteFromUrl();
        this.quotes = [
            {
                text: "Success is the sum of small efforts repeated day in and day out.",
                author: "Robert Collier"
            },
            {
                text: "Concentration is the secret of strength.",
                author: "Ralph Waldo Emerson"
            },
            {
                text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
                author: "Zig Ziglar"
            },
            {
                text: "Discipline is the bridge between goals and accomplishment.",
                author: "Jim Rohn"
            },
            {
                text: "It's not about having time. It's about making time.",
                author: "Anonymous"
            }
        ];
        
        this.productivityTips = [
            "Take advantage of this moment to pause, breathe deeply, and reflect on your goals for the day.",
            "How about using these minutes to drink water, stretch, or do breathing exercises?",
            "Consider writing a to-do list or reviewing your daily priorities.",
            "This is a good time to contact a friend or family member you haven't seen in a while.",
            "Why not take advantage of this time to read an educational article or learn something new?",
            "Take a visual break: look out the window or focus your sight on something distant.",
            "It's a good time to organize your workspace or desk.",
            "How about planning your next healthy meal or preparing a nutritious snack?"
        ];
        
        this.init();
    }

    async init() {
        // Initialize i18n first
        await initI18n();
        
        // Update quotes and tips based on language
        await this.updateTranslatedContent();
        
        this.setupUI();
        this.setupEventListeners();
        this.loadStats();
        this.startClock();
        this.showRandomQuote();
        this.showRandomTip();
    }

    async updateTranslatedContent() {
        // Update quotes array with translated content
        this.quotes = [
            {
                text: getMessage('quote1'),
                author: getMessage('quote1Author')
            },
            {
                text: getMessage('quote2'),
                author: getMessage('quote2Author')
            },
            {
                text: getMessage('quote3'),
                author: getMessage('quote3Author')
            },
            {
                text: getMessage('quote4'),
                author: getMessage('quote4Author')
            },
            {
                text: getMessage('quote5'),
                author: getMessage('quote5Author')
            }
        ];
        
        // Update productivity tips with translated content
        this.productivityTips = [
            getMessage('tip1'),
            getMessage('tip2'),
            getMessage('tip3'),
            getMessage('tip4'),
            getMessage('tip5'),
            getMessage('tip6'),
            getMessage('tip7'),
            getMessage('tip8')
        ];
    }

    setupUI() {
        console.log('Setting up UI for site:', this.siteName);
        document.getElementById('siteName').textContent = this.siteName;
        document.title = `${this.siteName} - ${getMessage('siteBlocked')}`;
        
        // Mostrar mensaje inicial
        setTimeout(() => {
            this.showMessage(`🚫 ${this.siteName} ${getMessage('blockedBy')} TimeTracker Pro`, 'info');
        }, 1000);
    }

    setupEventListeners() {
        const unblockBtn = document.getElementById('unblockBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const permanentUnblockBtn = document.getElementById('permanentUnblockBtn');

        if (unblockBtn) {
            unblockBtn.addEventListener('click', () => {
                this.unblockTemporarily();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                chrome.runtime.openOptionsPage();
            });
        }

        if (permanentUnblockBtn) {
            permanentUnblockBtn.addEventListener('click', () => {
                this.permanentUnblock();
            });
        }
    }

    getSiteFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            const site = params.get('site');
            console.log('Site from URL params:', site);
            
            if (site && site !== 'example.com') {
                return site;
            }
            
            // Fallback: intentar extraer del referrer o URL actual
            if (document.referrer) {
                try {
                    const url = new URL(document.referrer);
                    console.log('Site from referrer:', url.hostname);
                    return url.hostname;
                } catch (e) {
                    console.error('Error parsing referrer:', e);
                }
            }
            
            // Último fallback
            return getMessage('unknownSite');
        } catch (error) {
            console.error('Error getting site from URL:', error);
            return getMessage('unknownSite');
        }
    }

    async loadStats() {
        console.log('Loading stats for:', this.siteName);
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getStats',
                period: 'today'
            });

            console.log('Stats response:', response);

            if (response && response.sites) {
                const siteStats = response.sites.find(site => 
                    site.domain === this.siteName || 
                    site.domain.includes(this.siteName) ||
                    this.siteName.includes(site.domain)
                );
                
                console.log('Found site stats:', siteStats);
                
                if (siteStats) {
                    document.getElementById('timeToday').textContent = this.formatTime(siteStats.time);
                    document.getElementById('visitsToday').textContent = siteStats.visits;
                } else {
                    console.log('No stats found for site:', this.siteName);
                    document.getElementById('timeToday').textContent = '0m';
                    document.getElementById('visitsToday').textContent = '0';
                }
            } else {
                console.log('No response or sites in response');
                document.getElementById('timeToday').textContent = '0m';
                document.getElementById('visitsToday').textContent = '0';
            }

            // Tiempo ahorrado (estimado)
            const averageVisitTime = 300000; // 5 minutos promedio
            const blockedTime = this.getBlockedAttempts() * averageVisitTime;
            document.getElementById('blockedTime').textContent = this.formatTime(blockedTime);
        } catch (error) {
            console.error('Error loading stats:', error);
            // Mostrar valores por defecto en caso de error
            document.getElementById('timeToday').textContent = '0m';
            document.getElementById('visitsToday').textContent = '0';
            document.getElementById('blockedTime').textContent = '0m';
        }
    }

    getBlockedAttempts() {
        const key = `blocked_attempts_${this.siteName}_${new Date().toISOString().split('T')[0]}`;
        const attempts = localStorage.getItem(key) || 0;
        const newAttempts = parseInt(attempts) + 1;
        localStorage.setItem(key, newAttempts);
        return newAttempts;
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString(undefined, { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('currentTime').textContent = timeString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    showRandomQuote() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('quoteText').textContent = `"${randomQuote.text}"`;
        document.getElementById('quoteAuthor').textContent = `- ${randomQuote.author}`;
    }

    showRandomTip() {
        const randomTip = this.productivityTips[Math.floor(Math.random() * this.productivityTips.length)];
        document.getElementById('productivityTip').textContent = randomTip;
    }

    async unblockTemporarily() {
        console.log('Attempting temporary unblock for:', this.siteName);
        
        const minutes = prompt(getMessage('unblockPrompt'), '10');
        
        if (minutes && !isNaN(minutes) && parseInt(minutes) > 0) {
            try {
                // Mostrar indicador de carga
                const btn = document.getElementById('unblockBtn');
                const originalText = btn.textContent;
                btn.textContent = `⏳ ${getMessage('unblocking')}...`;
                btn.disabled = true;
                
                console.log('Sending unblockTemporary message:', {
                    action: 'unblockTemporary',
                    domain: this.siteName,
                    minutes: parseInt(minutes)
                });
                
                const response = await chrome.runtime.sendMessage({
                    action: 'unblockTemporary',
                    domain: this.siteName,
                    minutes: parseInt(minutes)
                });
                
                console.log('Unblock response:', response);
                
                if (response && response.success) {
                    // Mostrar mensaje de éxito
                    this.showMessage(`✅ ${response.message}`, 'success');
                    
                    // Esperar un momento y redirigir
                    setTimeout(() => {
                        console.log('Redirecting to:', `https://${this.siteName}`);
                        window.location.href = `https://${this.siteName}`;
                    }, 2000);
                } else {
                    this.showMessage(`❌ ${response?.error || getMessage('errorUnblocking')}`, 'error');
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error unblocking site:', error);
                this.showMessage(`❌ ${getMessage('communicationError')}`, 'error');
                
                // Restaurar botón
                const btn = document.getElementById('unblockBtn');
                btn.textContent = `🔓 ${getMessage('unblockTemporarily')}`;
                btn.disabled = false;
            }
        }
    }

    async permanentUnblock() {
        console.log('Attempting permanent unblock for:', this.siteName);
        
        const confirmed = confirm(getMessage('permanentUnblockConfirm').replace('{site}', this.siteName));
        
        if (confirmed) {
            try {
                // Mostrar indicador de carga
                const btn = document.getElementById('permanentUnblockBtn');
                const originalText = btn.textContent;
                btn.textContent = `⏳ ${getMessage('removingBlock')}...`;
                btn.disabled = true;
                
                console.log('Sending blockSite message:', {
                    action: 'blockSite',
                    domain: this.siteName,
                    blocked: false
                });
                
                const response = await chrome.runtime.sendMessage({
                    action: 'blockSite',
                    domain: this.siteName,
                    blocked: false
                });
                
                console.log('Permanent unblock response:', response);
                
                if (response && response.success) {
                    this.showMessage(`✅ ${getMessage('blockRemovedPermanently')}`, 'success');
                    
                    // Esperar un momento y redirigir
                    setTimeout(() => {
                        console.log('Redirecting to:', `https://${this.siteName}`);
                        window.location.href = `https://${this.siteName}`;
                    }, 2000);
                } else {
                    this.showMessage(`❌ ${getMessage('errorRemovingBlock')}`, 'error');
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error unblocking site:', error);
                this.showMessage(`❌ ${getMessage('communicationError')}`, 'error');
                
                // Restaurar botón
                const btn = document.getElementById('permanentUnblockBtn');
                btn.textContent = `🗑️ ${getMessage('removeBlocking')}`;
                btn.disabled = false;
            }
        }
    }

    showMessage(message, type = 'info') {
        console.log('Showing message:', message, type);
        
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast ${type}`;
        messageEl.textContent = message;
        
        // Estilos del mensaje
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#2ed573' : type === 'error' ? '#ff4757' : '#667eea'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInMessage 0.3s ease;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('messageStyles')) {
            const style = document.createElement('style');
            style.id = 'messageStyles';
            style.textContent = `
                @keyframes slideInMessage {
                    from {
                        transform: translateX(-50%) translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    formatTime(milliseconds) {
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

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing BlockedPage');
    new BlockedPage();
}); 