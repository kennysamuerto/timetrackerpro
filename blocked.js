class BlockedPage {
    constructor() {
        this.siteName = this.getSiteFromUrl();
        this.quotes = [
            {
                text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
                author: "Robert Collier"
            },
            {
                text: "La concentración es el secreto de la fuerza.",
                author: "Ralph Waldo Emerson"
            },
            {
                text: "Lo que obtienes al alcanzar tus metas no es tan importante como en lo que te conviertes al alcanzarlas.",
                author: "Zig Ziglar"
            },
            {
                text: "La disciplina es el puente entre las metas y los logros.",
                author: "Jim Rohn"
            },
            {
                text: "No se trata de tener tiempo. Se trata de hacer tiempo.",
                author: "Anónimo"
            }
        ];
        
        this.productivityTips = [
            "Aprovecha este momento para hacer una pausa, respirar profundamente y reflexionar sobre tus objetivos del día.",
            "¿Qué tal si usas estos minutos para beber agua, estirar o hacer ejercicios de respiración?",
            "Considera escribir una lista de tareas pendientes o revisar tus prioridades del día.",
            "Este es un buen momento para contactar a un amigo o familiar que no has visto en mucho tiempo.",
            "¿Por qué no aprovechas para leer un artículo educativo o aprender algo nuevo?",
            "Toma un descanso visual: mira por la ventana o enfoca tu vista en algo distante.",
            "Es un buen momento para organizar tu espacio de trabajo o escritorio.",
            "¿Qué tal si planificas tu próxima comida saludable o preparas un snack nutritivo?"
        ];
        
        this.init();
    }

    init() {
        this.setupUI();
        this.setupEventListeners();
        this.loadStats();
        this.startClock();
        this.showRandomQuote();
        this.showRandomTip();
    }

    setupUI() {
        console.log('Setting up UI for site:', this.siteName);
        document.getElementById('siteName').textContent = this.siteName;
        document.title = `${this.siteName} - Sitio Bloqueado`;
        
        // Mostrar mensaje inicial
        setTimeout(() => {
            this.showMessage(`🚫 ${this.siteName} está bloqueado por TimeTracker Pro`, 'info');
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
            
            if (site && site !== 'ejemplo.com') {
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
            return 'sitio desconocido';
        } catch (error) {
            console.error('Error getting site from URL:', error);
            return 'sitio desconocido';
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
            const timeString = now.toLocaleTimeString('es-ES', { 
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
        
        const minutes = prompt('¿Por cuántos minutos quieres desbloquear este sitio?', '10');
        
        if (minutes && !isNaN(minutes) && parseInt(minutes) > 0) {
            try {
                // Mostrar indicador de carga
                const btn = document.getElementById('unblockBtn');
                const originalText = btn.textContent;
                btn.textContent = '⏳ Desbloqueando...';
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
                    this.showMessage(`❌ ${response?.error || 'Error al desbloquear'}`, 'error');
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error unblocking site:', error);
                this.showMessage('❌ Error de comunicación con la extensión', 'error');
                
                // Restaurar botón
                const btn = document.getElementById('unblockBtn');
                btn.textContent = '🔓 Desbloquear Temporalmente';
                btn.disabled = false;
            }
        }
    }

    async permanentUnblock() {
        console.log('Attempting permanent unblock for:', this.siteName);
        
        const confirmed = confirm(`¿Estás seguro de que quieres eliminar el bloqueo permanente de ${this.siteName}?`);
        
        if (confirmed) {
            try {
                // Mostrar indicador de carga
                const btn = document.getElementById('permanentUnblockBtn');
                const originalText = btn.textContent;
                btn.textContent = '⏳ Eliminando bloqueo...';
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
                    this.showMessage('✅ Bloqueo eliminado permanentemente', 'success');
                    
                    // Esperar un momento y redirigir
                    setTimeout(() => {
                        console.log('Redirecting to:', `https://${this.siteName}`);
                        window.location.href = `https://${this.siteName}`;
                    }, 2000);
                } else {
                    this.showMessage('❌ Error al eliminar el bloqueo', 'error');
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error unblocking site:', error);
                this.showMessage('❌ Error de comunicación con la extensión', 'error');
                
                // Restaurar botón
                const btn = document.getElementById('permanentUnblockBtn');
                btn.textContent = '🗑️ Eliminar Bloqueo';
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