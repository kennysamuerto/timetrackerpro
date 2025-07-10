// Content script para detectar movimiento del ratón
// TimeTracker Pro - Mouse Movement Detection

class MouseMovementDetector {
    constructor() {
        this.lastMouseMove = Date.now();
        this.isMouseMovementEnabled = false;
        this.inactivityTimeout = 60000; // 1 minuto por defecto
        this.checkInterval = 5000; // Verificar cada 5 segundos
        this.intervalId = null;
        this.isUserActive = true;
        this.isTabVisible = !document.hidden;
        this.lastActivityType = 'init';
        
        this.init();
    }

    async init() {
        // Cargar configuración inicial
        await this.loadSettings();
        
        // Configurar listeners
        this.setupEventListeners();
        
        // Iniciar verificación periódica
        this.startChecking();
        
        // Escuchar cambios en la configuración
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        
        // Notificar estado inicial
        this.notifyInitialState();
        
        console.log('MouseMovementDetector initialized', {
            enabled: this.isMouseMovementEnabled,
            timeout: this.inactivityTimeout,
            visible: this.isTabVisible,
            url: window.location.href
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            
            this.isMouseMovementEnabled = settings.mouseMovementEnabled === true;
            this.inactivityTimeout = Math.max(60000, (settings.inactivityTimeout || 60000)); // Mínimo 1 minuto
            
            console.log('Mouse movement detection settings loaded:', {
                enabled: this.isMouseMovementEnabled,
                timeout: this.inactivityTimeout
            });
        } catch (error) {
            console.error('Error loading mouse movement settings:', error);
        }
    }

    setupEventListeners() {
        // Detectar movimiento del ratón
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        
        // Detectar otros tipos de actividad del usuario
        document.addEventListener('mousedown', this.handleUserActivity.bind(this, 'click'), { passive: true });
        document.addEventListener('mouseup', this.handleUserActivity.bind(this, 'click'), { passive: true });
        document.addEventListener('keydown', this.handleUserActivity.bind(this, 'keyboard'), { passive: true });
        document.addEventListener('keyup', this.handleUserActivity.bind(this, 'keyboard'), { passive: true });
        document.addEventListener('scroll', this.handleUserActivity.bind(this, 'scroll'), { passive: true });
        document.addEventListener('touchstart', this.handleUserActivity.bind(this, 'touch'), { passive: true });
        document.addEventListener('touchmove', this.handleUserActivity.bind(this, 'touch'), { passive: true });
        document.addEventListener('wheel', this.handleUserActivity.bind(this, 'wheel'), { passive: true });
        
        // Detectar cuando la página obtiene/pierde el foco
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        
        // Detectar cuando la página se carga/descarga
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('pagehide', this.handlePageHide.bind(this));
    }

    handleMouseMove(event) {
        this.handleUserActivity('mousemove');
    }

    handleUserActivity(activityType = 'unknown') {
        if (!this.isMouseMovementEnabled) return;
        
        this.lastMouseMove = Date.now();
        this.lastActivityType = activityType;
        
        // Si estaba inactivo, notificar que volvió a estar activo
        if (!this.isUserActive) {
            this.isUserActive = true;
            console.log(`User became active: ${activityType}`, {
                url: window.location.href,
                visible: this.isTabVisible
            });
            this.notifyActivityStatus(true);
        }
    }

    handleVisibilityChange() {
        const wasVisible = this.isTabVisible;
        this.isTabVisible = !document.hidden;
        
        console.log(`Tab visibility changed: ${wasVisible ? 'visible' : 'hidden'} -> ${this.isTabVisible ? 'visible' : 'hidden'}`, {
            url: window.location.href
        });
        
        // Notificar cambio de visibilidad
        this.notifyTabVisibility(this.isTabVisible);
        
        if (this.isTabVisible) {
            // La página se volvió visible - resetear actividad
            this.lastMouseMove = Date.now();
            this.isUserActive = true;
            this.notifyActivityStatus(true);
        } else {
            // La página se ocultó - marcar como inactivo
            this.isUserActive = false;
            this.notifyActivityStatus(false);
        }
    }

    handleWindowFocus() {
        console.log('Window gained focus', { url: window.location.href });
        this.lastMouseMove = Date.now();
        this.isUserActive = true;
        this.isTabVisible = true;
        this.notifyTabVisibility(true);
        this.notifyActivityStatus(true);
    }

    handleWindowBlur() {
        console.log('Window lost focus', { url: window.location.href });
        this.isUserActive = false;
        this.notifyActivityStatus(false);
    }

    handleBeforeUnload() {
        console.log('Page unloading', { url: window.location.href });
        this.isUserActive = false;
        this.notifyActivityStatus(false);
    }

    handlePageHide() {
        console.log('Page hidden', { url: window.location.href });
        this.isUserActive = false;
        this.notifyActivityStatus(false);
    }

    handleMessage(message, sender, sendResponse) {
        if (message.action === 'updateMouseMovementSettings') {
            const oldEnabled = this.isMouseMovementEnabled;
            this.isMouseMovementEnabled = message.enabled;
            this.inactivityTimeout = Math.max(60000, (message.timeout || 60000));
            
            console.log('Mouse movement settings updated:', {
                enabled: `${oldEnabled} -> ${this.isMouseMovementEnabled}`,
                timeout: this.inactivityTimeout,
                url: window.location.href
            });
            
            // Si se habilitó, notificar estado actual
            if (!oldEnabled && this.isMouseMovementEnabled) {
                this.notifyInitialState();
            }
        }
    }

    startChecking() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.checkActivity();
        }, this.checkInterval);
    }

    checkActivity() {
        if (!this.isMouseMovementEnabled) return;
        
        const now = Date.now();
        const timeSinceLastMove = now - this.lastMouseMove;
        
        // Verificar si el usuario está inactivo
        const shouldBeInactive = timeSinceLastMove >= this.inactivityTimeout;
        
        if (shouldBeInactive && this.isUserActive && this.isTabVisible) {
            // Usuario acaba de volverse inactivo
            console.log(`User became inactive after ${timeSinceLastMove}ms`, {
                lastActivity: this.lastActivityType,
                url: window.location.href
            });
            this.isUserActive = false;
            this.notifyActivityStatus(false);
        }
        // No marcar como activo automáticamente - solo con actividad real
    }

    notifyInitialState() {
        // Notificar estado inicial de visibilidad y actividad
        this.notifyTabVisibility(this.isTabVisible);
        
        if (this.isMouseMovementEnabled) {
            this.notifyActivityStatus(this.isUserActive && this.isTabVisible);
        }
    }

    notifyActivityStatus(isActive) {
        this.sendMessage({
            action: 'userActivityChange',
            isActive: isActive,
            timestamp: Date.now(),
            url: window.location.href,
            lastActivity: this.lastActivityType,
            timeSinceLastMove: Date.now() - this.lastMouseMove
        });
    }

    notifyTabVisibility(isVisible) {
        this.sendMessage({
            action: 'tabVisibilityChange',
            isVisible: isVisible,
            timestamp: Date.now(),
            url: window.location.href
        });
    }

    sendMessage(data) {
        try {
            chrome.runtime.sendMessage(data).catch(error => {
                // Ignorar errores si la extensión no está disponible
                console.debug('Could not send message to background:', error.message);
            });
        } catch (error) {
            console.debug('Could not send message to background:', error.message);
        }
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Remover event listeners
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mousedown', this.handleUserActivity.bind(this));
        document.removeEventListener('mouseup', this.handleUserActivity.bind(this));
        document.removeEventListener('keydown', this.handleUserActivity.bind(this));
        document.removeEventListener('keyup', this.handleUserActivity.bind(this));
        document.removeEventListener('scroll', this.handleUserActivity.bind(this));
        document.removeEventListener('touchstart', this.handleUserActivity.bind(this));
        document.removeEventListener('touchmove', this.handleUserActivity.bind(this));
        document.removeEventListener('wheel', this.handleUserActivity.bind(this));
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.removeEventListener('focus', this.handleWindowFocus.bind(this));
        window.removeEventListener('blur', this.handleWindowBlur.bind(this));
        window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.removeEventListener('pagehide', this.handlePageHide.bind(this));
    }
}

// Inicializar el detector cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MouseMovementDetector();
    });
} else {
    new MouseMovementDetector();
} 