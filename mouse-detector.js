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
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            
            this.isMouseMovementEnabled = settings.mouseMovementEnabled === true;
            this.inactivityTimeout = Math.max(60000, (settings.inactivityTimeout || 60000)); // Mínimo 1 minuto
            
            console.log('Mouse movement detection:', this.isMouseMovementEnabled ? 'enabled' : 'disabled');
        } catch (error) {
            console.error('Error loading mouse movement settings:', error);
        }
    }

    setupEventListeners() {
        // Detectar movimiento del ratón
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        
        // Detectar otros tipos de actividad del usuario
        document.addEventListener('mousedown', this.handleUserActivity.bind(this), { passive: true });
        document.addEventListener('keydown', this.handleUserActivity.bind(this), { passive: true });
        document.addEventListener('scroll', this.handleUserActivity.bind(this), { passive: true });
        document.addEventListener('touchstart', this.handleUserActivity.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleUserActivity.bind(this), { passive: true });
        
        // Detectar cuando la página obtiene/pierde el foco
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
    }

    handleMouseMove(event) {
        if (!this.isMouseMovementEnabled) return;
        
        this.lastMouseMove = Date.now();
        
        // Si estaba inactivo, notificar que volvió a estar activo
        if (!this.isUserActive) {
            this.isUserActive = true;
            this.notifyActivityStatus(true);
        }
    }

    handleUserActivity() {
        if (!this.isMouseMovementEnabled) return;
        
        this.lastMouseMove = Date.now();
        
        // Si estaba inactivo, notificar que volvió a estar activo
        if (!this.isUserActive) {
            this.isUserActive = true;
            this.notifyActivityStatus(true);
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // La página está oculta
            this.isUserActive = false;
            this.notifyActivityStatus(false);
        } else {
            // La página está visible
            this.lastMouseMove = Date.now();
            this.isUserActive = true;
            this.notifyActivityStatus(true);
        }
    }

    handleWindowFocus() {
        this.lastMouseMove = Date.now();
        this.isUserActive = true;
        this.notifyActivityStatus(true);
    }

    handleWindowBlur() {
        this.isUserActive = false;
        this.notifyActivityStatus(false);
    }

    handleMessage(message, sender, sendResponse) {
        if (message.action === 'updateMouseMovementSettings') {
            this.isMouseMovementEnabled = message.enabled;
            this.inactivityTimeout = Math.max(60000, (message.timeout || 60000));
            console.log('Mouse movement settings updated:', message);
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
        
        if (shouldBeInactive && this.isUserActive) {
            // Usuario acaba de volverse inactivo
            this.isUserActive = false;
            this.notifyActivityStatus(false);
        } else if (!shouldBeInactive && !this.isUserActive) {
            // Usuario acaba de volverse activo
            this.isUserActive = true;
            this.notifyActivityStatus(true);
        }
    }

    notifyActivityStatus(isActive) {
        // Notificar al background script sobre el cambio de estado
        chrome.runtime.sendMessage({
            action: 'userActivityChange',
            isActive: isActive,
            timestamp: Date.now(),
            url: window.location.href
        }).catch(error => {
            // Ignorar errores si la extensión no está disponible
            console.debug('Could not notify activity status:', error);
        });
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Remover event listeners
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mousedown', this.handleUserActivity.bind(this));
        document.removeEventListener('keydown', this.handleUserActivity.bind(this));
        document.removeEventListener('scroll', this.handleUserActivity.bind(this));
        document.removeEventListener('touchstart', this.handleUserActivity.bind(this));
        document.removeEventListener('touchmove', this.handleUserActivity.bind(this));
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.removeEventListener('focus', this.handleWindowFocus.bind(this));
        window.removeEventListener('blur', this.handleWindowBlur.bind(this));
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