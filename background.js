class TimeTracker {
  constructor() {
    this.currentTab = null;
    this.startTime = null;
    this.isActive = true;
    this.isUserActive = true; // Nueva propiedad para rastrear actividad del usuario
    this.isTabVisible = true; // Nueva propiedad para rastrear visibilidad de la pestaña
    this.isWindowFocused = true; // Nueva propiedad para rastrear foco de ventana
    this.mouseMovementSettings = { enabled: false, timeout: 60000 };
    this.activeTabId = null; // ID de la pestaña activa actual
    this.init();
  }

  async init() {
    // Cargar configuración inicial
    await this.loadMouseMovementSettings();
    
    // Configurar listeners
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocus.bind(this));
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
    
    // Listener para mensajes del content script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Configurar alarma para guardar datos periódicamente (cada 10 segundos)
    chrome.alarms.create('saveData', { periodInMinutes: 1/6 }); // 10 segundos
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    
    // Inicializar con la pestaña activa
    this.initializeCurrentTab();
  }

  async initializeCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        this.activeTabId = tab.id;
        this.startTracking(tab);
      }
    } catch (error) {
      console.error('Error initializing current tab:', error);
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'userActivityChange':
        this.handleUserActivityChange(message.isActive, message.url, sender.tab);
        break;
      case 'tabVisibilityChange':
        this.handleTabVisibilityChange(message.isVisible, sender.tab);
        break;
    }
  }

  handleUserActivityChange(isActive, tabUrl, senderTab) {
    // Solo procesar si es de la pestaña activa actual
    if (!senderTab || senderTab.id !== this.activeTabId) {
      return;
    }
    
    const wasActive = this.shouldTrack();
    this.isUserActive = isActive;
    const isActiveNow = this.shouldTrack();
    
    console.log(`User activity changed: ${isActive ? 'active' : 'inactive'} on tab ${senderTab.id}`);
    
    // Si cambió el estado de tracking
    if (wasActive !== isActiveNow) {
      if (isActiveNow) {
        this.resumeUserTracking();
      } else {
        this.pauseTracking();
      }
    }
  }

  handleTabVisibilityChange(isVisible, senderTab) {
    // Solo procesar si es de la pestaña activa actual
    if (!senderTab || senderTab.id !== this.activeTabId) {
      return;
    }
    
    const wasActive = this.shouldTrack();
    this.isTabVisible = isVisible;
    const isActiveNow = this.shouldTrack();
    
    console.log(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'} on tab ${senderTab.id}`);
    
    // Si cambió el estado de tracking
    if (wasActive !== isActiveNow) {
      if (isActiveNow) {
        this.resumeUserTracking();
      } else {
        this.pauseTracking();
      }
    }
  }

  shouldTrack() {
    // Solo trackear si:
    // 1. La ventana está enfocada
    // 2. La pestaña está visible
    // 3. El usuario está activo (o la función está deshabilitada)
    return this.isWindowFocused && 
           this.isTabVisible && 
           (!this.mouseMovementSettings.enabled || this.isUserActive);
  }

  handleTabActivated(activeInfo) {
    console.log(`Tab activated: ${activeInfo.tabId}`);
    this.activeTabId = activeInfo.tabId;
    this.switchTab(activeInfo.tabId);
  }

  handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active && tabId === this.activeTabId) {
      console.log(`Tab updated: ${tabId}`);
      this.switchTab(tabId);
    }
  }

  handleWindowFocus(windowId) {
    const wasFocused = this.isWindowFocused;
    this.isWindowFocused = windowId !== chrome.windows.WINDOW_ID_NONE;
    
    console.log(`Window focus changed: ${this.isWindowFocused ? 'focused' : 'unfocused'}`);
    
    const wasActive = this.shouldTrack();
    const isActiveNow = this.shouldTrack();
    
    if (wasActive !== isActiveNow) {
      if (isActiveNow && this.currentTab) {
        this.resumeUserTracking();
      } else {
        this.pauseTracking();
      }
    }
  }

  handleStartup() {
    this.initializeCurrentTab();
  }

  handleInstalled(details) {
    this.initializeDefaultData();
    
    // Abrir página de bienvenida solo en instalaciones nuevas
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }
  }

  handleAlarm(alarm) {
    if (alarm.name === 'saveData') {
      this.saveCurrentSession();
    }
  }

  async switchTab(tabId) {
    await this.stopTracking();
    try {
      const tab = await chrome.tabs.get(tabId);
      // Reinicializar estado cuando cambiamos de pestaña
      this.isTabVisible = true;
      this.isUserActive = true;
      this.startTracking(tab);
    } catch (error) {
      console.error('Error switching tab:', error);
    }
  }

  startTracking(tab) {
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      console.log('Skipping tracking for invalid tab:', tab?.url);
      return;
    }

    this.currentTab = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      domain: this.extractDomain(tab.url)
    };
    
    // Solo iniciar el tracking si todas las condiciones se cumplen
    if (this.shouldTrack()) {
      this.startTime = Date.now();
      this.isActive = true;
      console.log('Started tracking:', this.currentTab.domain);
    } else {
      this.startTime = null;
      this.isActive = false;
      console.log('Tracking paused due to conditions:', this.currentTab.domain);
    }
  }

  async stopTracking() {
    if (this.currentTab && this.startTime && this.isActive) {
      const timeSpent = Date.now() - this.startTime;
      console.log(`Stopping tracking for ${this.currentTab.domain}: ${timeSpent}ms`);
      await this.saveTimeData(this.currentTab, timeSpent);
    }
    
    this.currentTab = null;
    this.startTime = null;
    this.isActive = false;
  }

  resumeTracking() {
    if (this.currentTab && !this.isActive && this.shouldTrack()) {
      this.startTime = Date.now();
      this.isActive = true;
      console.log('Resumed tracking:', this.currentTab.domain);
    }
  }

  async saveCurrentSession() {
    // Solo guardar si el tracking está activo y todas las condiciones se cumplen
    if (this.currentTab && this.startTime && this.isActive && this.shouldTrack()) {
      const timeSpent = Date.now() - this.startTime;
      console.log(`Saving session for ${this.currentTab.domain}: ${timeSpent}ms`);
      await this.saveTimeData(this.currentTab, timeSpent, false); // false = no incrementar visitas
      this.startTime = Date.now(); // Reiniciar el contador
    }
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  async saveTimeData(tab, timeSpent, incrementVisits = true) {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getStorageData();
    
    // Inicializar estructura si no existe
    if (!data.dailyStats) data.dailyStats = {};
    if (!data.dailyStats[today]) data.dailyStats[today] = {};
    if (!data.siteCategories) data.siteCategories = {};
    if (!data.totalTime) data.totalTime = {};

    const domain = this.normalizeDomain(tab.domain);
    
    // Guardar estadísticas diarias
    if (!data.dailyStats[today][domain]) {
      data.dailyStats[today][domain] = {
        time: 0,
        visits: 0,
        title: tab.title,
        url: tab.url
      };
    }
    
    data.dailyStats[today][domain].time += timeSpent;
    if (incrementVisits) {
      data.dailyStats[today][domain].visits += 1;
    }
    data.dailyStats[today][domain].title = tab.title;
    
    // Guardar tiempo total
    if (!data.totalTime[domain]) {
      data.totalTime[domain] = {
        time: 0,
        visits: 0,
        title: tab.title
      };
    }
    
    data.totalTime[domain].time += timeSpent;
    if (incrementVisits) {
      data.totalTime[domain].visits += 1;
    }
    data.totalTime[domain].title = tab.title;
    
    // Categorización automática básica (solo si no está asignada manualmente)
    if (!data.siteCategories[domain]) {
      data.siteCategories[domain] = this.categorizeWebsite(domain);
    }
    
    await this.setStorageData(data);
  }

  categorizeWebsite(domain) {
    // Normalizar el dominio para comparación
    const normalizedDomain = this.normalizeDomain(domain);
    
    const categories = {
      'work': [
        'github.com', 'stackoverflow.com', 'linkedin.com', 'slack.com', 'zoom.us', 'teams.microsoft.com',
        'gitlab.com', 'bitbucket.org', 'jira.atlassian.com', 'trello.com', 'notion.so', 'figma.com',
        'canva.com', 'drive.google.com', 'dropbox.com', 'asana.com', 'monday.com', 'freelancer.com',
        'upwork.com', 'fiverr.com', 'workana.com', 'infojobs.net', 'indeed.com'
      ],
      'entertainment': [
        'youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'tiktok.com', 'primevideo.com',
        'disneyplus.com', 'hbo.com', 'max.com', 'atresplayer.com', 'rtve.es', 'mitele.es',
        'crunchyroll.com', 'dazn.com', 'apple.com/tv', 'paramount.com', '9gag.com', 'imgur.com'
      ],
      'news': [
        'bbc.com', 'cnn.com', 'elmundo.es', 'elpais.com', 'marca.com', 'as.com', 'abc.es',
        'lavanguardia.com', 'elconfidencial.com', '20minutos.es', 'publico.es', 'eldiario.es',
        'expansion.com', 'cincodias.elpais.com', 'sport.es', 'mundodeportivo.com', 'reuters.com',
        'theguardian.com', 'nytimes.com', 'washingtonpost.com', 'lemonde.fr', 'clarin.com', 'folha.uol.com.br'
      ],
      'shopping': [
        'amazon.com', 'amazon.es', 'amazon.fr', 'amazon.de', 'amazon.it', 'amazon.co.uk',
        'amazon.ca', 'amazon.com.mx', 'amazon.com.br', 'amazon.in', 'amazon.com.au', 'amazon.co.jp',
        'ebay.com', 'aliexpress.com', 'pccomponentes.com', 'elcorteingles.es', 'mediamarkt.es',
        'carrefour.es', 'mercadolibre.com', 'zalando.es', 'zara.com', 'hm.com', 'ikea.com',
        'leroy-merlin.es', 'etsy.com', 'shein.com', 'wallapop.com', 'milanuncios.com'
      ],
      'education': [
        'coursera.org', 'udemy.com', 'khan academy.org', 'edx.org', 'wikipedia.org', 'platzi.com',
        'domestika.org', 'futurelearn.com', 'skillshare.com', 'lynda.com', 'duolingo.com',
        'babbel.com', 'codecademy.com', 'freecodecamp.org', 'w3schools.com', 'ted.com',
        'archive.org', 'scholar.google.com'
      ],
      'social': [
        'facebook.com', 'x.com', 'instagram.com', 'reddit.com', 'discord.com', 'whatsapp.com',
        'telegram.org', 'snapchat.com', 'pinterest.com', 'tumblr.com', 'mastodon.social',
        'threads.net', 'clubhouse.com', 'vk.com', 'weibo.com'
      ],
      'finanzas': [
        'bankinter.es', 'bbva.es', 'santander.es', 'caixabank.es', 'paypal.com', 'revolut.com',
        'n26.com', 'investing.com', 'yahoo.com/finance', 'marketwatch.com', 'coinbase.com',
        'binance.com', 'kraken.com'
      ],
      'viajes': [
        'booking.com', 'airbnb.com', 'skyscanner.es', 'tripadvisor.com', 'expedia.com',
        'kayak.com', 'renfe.com', 'ryanair.com', 'vueling.com', 'iberia.com', 'hotels.com',
        'agoda.com', 'hostelworld.com'
      ],
      'gaming': [
        'steam.com', 'epicgames.com', 'battle.net', 'roblox.com', 'minecraft.net',
        'valorant.com', 'leagueoflegends.com', 'twitch.tv', 'chess.com', 'lichess.org',
        'ign.com', 'gamespot.com', 'polygon.com'
      ],
      'herramientas': [
        'gmail.com', 'outlook.com', 'protonmail.com', 'drive.google.com', 'onedrive.com',
        'icloud.com', 'wetransfer.com', 'mega.nz', 'dropbox.com', 'box.com', 'translate.google.com',
        'deepl.com', 'grammarly.com', 'canva.com', 'photopea.com', 'tinypng.com'
      ]
    };
    
    for (const [category, domains] of Object.entries(categories)) {
      if (domains.some(d => normalizedDomain.includes(d) || normalizedDomain.endsWith(d))) {
        return category;
      }
    }
    
    return 'other';
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

  async initializeDefaultData() {
    const data = await this.getStorageData();
    
    if (!data.settings) {
      data.settings = {
        trackingEnabled: true,
        showNotifications: true,
        dailyGoal: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
        categories: ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'finanzas', 'viajes', 'gaming', 'herramientas', 'other']
      };
    }
    
    if (!data.blockedSites) {
      data.blockedSites = [];
    }
    
    await this.setStorageData(data);
  }

  async loadMouseMovementSettings() {
    try {
      const data = await this.getStorageData();
      const settings = data.settings || {};
      this.mouseMovementSettings = {
        enabled: settings.mouseMovementEnabled === true,
        timeout: Math.max(60000, settings.inactivityTimeout || 60000)
      };
    } catch (error) {
      console.error('Error loading mouse movement settings:', error);
    }
  }

  pauseTracking() {
    if (this.currentTab && this.startTime && this.isActive) {
      // Guardar el tiempo acumulado hasta ahora
      const timeSpent = Date.now() - this.startTime;
      if (timeSpent > 0) {
        console.log(`Pausing tracking for ${this.currentTab.domain}: saving ${timeSpent}ms`);
        this.saveTimeData(this.currentTab, timeSpent, false); // false = no incrementar visitas
      }
      // Pausar el tracking pero mantener el contexto
      this.isActive = false;
      this.startTime = null;
    }
  }

  resumeUserTracking() {
    if (this.currentTab && !this.isActive && this.shouldTrack()) {
      console.log(`Resuming tracking for ${this.currentTab.domain}`);
      // Reanudar el tracking
      this.startTime = Date.now();
      this.isActive = true;
    }
  }
}

// Inicializar TimeTracker
const timeTracker = new TimeTracker();

// API para comunicación con popup y opciones
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'ping':
      sendResponse({status: 'pong', timestamp: Date.now()});
      return true;
      
    case 'getStats':
      handleGetStats(request.period, request.dateRange).then(sendResponse);
      return true;
    
    case 'updateCategory':
      handleUpdateCategory(request.domain, request.category).then(sendResponse);
      return true;
    
    case 'blockSite':
      handleBlockSite(request.domain, request.blocked).then(sendResponse);
      return true;
    
    case 'toggleBlock':
      handleToggleBlock(request.domain).then(sendResponse);
      return true;
    
    case 'unblockTemporary':
      handleUnblockTemporary(request.domain, request.minutes).then(sendResponse);
      return true;
    
    case 'clearData':
      handleClearData(request.period).then(sendResponse);
      return true;

    case 'getTrackingStatus':
      handleGetTrackingStatus().then(sendResponse);
      return true;
      
    case 'debug':
      handleDebug().then(sendResponse);
      return true;
    
    case 'userActivityChange':
      // Ahora se maneja directamente en el handleMessage del TimeTracker
      sendResponse({ success: true });
      return true;
    
    case 'updateMouseMovementSettings':
      updateMouseMovementSettings().then(sendResponse);
      return true;
  }
});

async function handleGetStats(period = 'today', dateRange = null) {
  const data = await timeTracker.getStorageData();
  const stats = calculateStats(data, period, dateRange);
  return stats;
}

async function handleUpdateCategory(domain, category) {
  const data = await timeTracker.getStorageData();
  if (!data.siteCategories) data.siteCategories = {};
  data.siteCategories[domain] = category;
  await timeTracker.setStorageData(data);
  return { success: true };
}

async function handleBlockSite(domain, blocked) {
  // Normalizar el dominio para asegurar consistencia
  const cleanDomain = timeTracker.normalizeDomain(domain);
  
  const data = await timeTracker.getStorageData();
  if (!data.blockedSites) data.blockedSites = [];
  
  if (blocked) {
    if (!data.blockedSites.includes(cleanDomain)) {
      data.blockedSites.push(cleanDomain);
    }
  } else {
    data.blockedSites = data.blockedSites.filter(site => 
      site !== cleanDomain && site !== domain
    );
  }
  
  await timeTracker.setStorageData(data);
  await updateBlockingRules(data.blockedSites);
  return { success: true };
}

async function handleToggleBlock(domain) {
  // Normalizar el dominio para asegurar consistencia
  const cleanDomain = timeTracker.normalizeDomain(domain);
  
  const data = await timeTracker.getStorageData();
  if (!data.blockedSites) data.blockedSites = [];
  
  // Verificar si el sitio está actualmente bloqueado
  const isCurrentlyBlocked = data.blockedSites.includes(cleanDomain);
  
  if (isCurrentlyBlocked) {
    // Desbloquear: remover de la lista
    data.blockedSites = data.blockedSites.filter(site => 
      site !== cleanDomain && site !== domain
    );
  } else {
    // Bloquear: agregar a la lista
    data.blockedSites.push(cleanDomain);
  }
  
  await timeTracker.setStorageData(data);
  await updateBlockingRules(data.blockedSites);
  
  return { success: true, blocked: !isCurrentlyBlocked };
}

async function handleUnblockTemporary(domain, minutes) {
  console.log(`Unblocking ${domain} for ${minutes} minutes`);
  
  try {
    // Normalizar el dominio para asegurar consistencia
    const cleanDomain = timeTracker.normalizeDomain(domain);
    
    const data = await timeTracker.getStorageData();
    if (!data.blockedSites) data.blockedSites = [];
    
    // Remover temporalmente del bloqueo
    const originalBlockedSites = [...data.blockedSites];
    data.blockedSites = data.blockedSites.filter(site => 
      site !== cleanDomain && site !== domain
    );
    
    // Actualizar reglas sin este sitio
    await updateBlockingRules(data.blockedSites);
    
    // Programar re-bloqueo
    const timeoutId = setTimeout(async () => {
      try {
        console.log(`Re-blocking ${cleanDomain} after ${minutes} minutes`);
        const currentData = await timeTracker.getStorageData();
        if (!currentData.blockedSites.includes(cleanDomain)) {
          currentData.blockedSites.push(cleanDomain);
          await timeTracker.setStorageData(currentData);
          await updateBlockingRules(currentData.blockedSites);
        }
      } catch (error) {
        console.error('Error re-blocking site:', error);
      }
    }, minutes * 60 * 1000);
    
    // Guardar el timeout para poder cancelarlo si es necesario
    if (!data.temporaryUnblocks) data.temporaryUnblocks = {};
    data.temporaryUnblocks[cleanDomain] = {
      timeoutId: timeoutId.toString(),
      expiresAt: Date.now() + (minutes * 60 * 1000)
    };
    
    await timeTracker.setStorageData(data);
    
    return { 
      success: true, 
      message: `${cleanDomain} desbloqueado por ${minutes} minutos` 
    };
  } catch (error) {
    console.error('Error in temporary unblock:', error);
    return { 
      success: false, 
      error: 'Error al desbloquear temporalmente' 
    };
  }
}

async function handleClearData(period) {
  const data = await timeTracker.getStorageData();
  
  if (period === 'all') {
    data.dailyStats = {};
    data.totalTime = {};
  } else if (period === 'today') {
    const today = new Date().toISOString().split('T')[0];
    if (data.dailyStats && data.dailyStats[today]) {
      delete data.dailyStats[today];
    }
  }
  
  await timeTracker.setStorageData(data);
  return { success: true };
}

async function handleGetTrackingStatus() {
  try {
    const data = await timeTracker.getStorageData();
    // El tracking está activo por defecto, pero puede ser desactivado desde opciones
    const isActive = data.trackingEnabled !== false;
    
    return {
      isActive: isActive,
      currentTab: timeTracker.currentTab,
      isTracking: timeTracker.isTracking
    };
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return {
      isActive: true, // Por defecto activo
      currentTab: null,
      isTracking: false
    };
  }
}

async function handleDebug() {
  try {
    const data = await timeTracker.getStorageData();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      timeTracker: {
        currentTab: timeTracker.currentTab,
        isTracking: timeTracker.isTracking,
        startTime: timeTracker.startTime,
        tabInfo: timeTracker.tabInfo
      },
      storage: {
        dailyStats: data.dailyStats || {},
        totalTime: data.totalTime || {},
        siteCategories: data.siteCategories || {},
        blockedSites: data.blockedSites || [],
        trackingEnabled: data.trackingEnabled !== false
      },
      todayStats: data.dailyStats?.[today] || {},
      today: today,
      storageKeys: Object.keys(data)
    };
  } catch (error) {
    console.error('Error getting debug info:', error);
    return {
      error: error.message,
      timeTracker: {
        currentTab: timeTracker?.currentTab || null,
        isTracking: timeTracker?.isTracking || false
      }
    };
  }
}



async function updateMouseMovementSettings() {
  // Recargar configuración en el timeTracker
  await timeTracker.loadMouseMovementSettings();
  
  // Notificar a todos los content scripts sobre el cambio
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateMouseMovementSettings',
        enabled: timeTracker.mouseMovementSettings.enabled,
        timeout: timeTracker.mouseMovementSettings.timeout
      }).catch(error => {
        // Ignorar errores si el content script no está disponible
        console.debug('Could not update mouse movement settings for tab:', tab.id, error);
      });
    }
  });
  
  return { success: true };
}

function calculateStats(data, period, dateRange = null) {
  const today = new Date().toISOString().split('T')[0];
  let statsData = {};
  
  switch (period) {
    case 'today':
      statsData = data.dailyStats?.[today] || {};
      break;
    case 'week':
      statsData = calculateWeekStats(data);
      break;
    case 'month':
      statsData = calculateMonthStats(data);
      break;
    case 'year':
      statsData = calculateYearStats(data);
      break;
    case 'custom':
      statsData = calculateCustomRangeStats(data, dateRange);
      break;
    case 'all':
      statsData = data.totalTime || {};
      break;
  }
  
  // Convertir a array y ordenar por tiempo
  const sites = Object.entries(statsData)
    .map(([domain, stats]) => ({
      domain,
      ...stats,
      category: data.siteCategories?.[domain] || 'other',
      blocked: data.blockedSites?.includes(timeTracker.normalizeDomain(domain)) || false
    }))
    .sort((a, b) => b.time - a.time);
  
  // Calcular estadísticas por categoría
  const categoryStats = {};
  sites.forEach(site => {
    if (!categoryStats[site.category]) {
      categoryStats[site.category] = { time: 0, visits: 0, sites: 0 };
    }
    categoryStats[site.category].time += site.time;
    categoryStats[site.category].visits += site.visits;
    categoryStats[site.category].sites += 1;
  });
  
  return {
    sites,
    categoryStats,
    totalTime: sites.reduce((sum, site) => sum + site.time, 0),
    totalVisits: sites.reduce((sum, site) => sum + site.visits, 0)
  };
}

function calculateWeekStats(data) {
  const weekStats = {};
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (data.dailyStats && data.dailyStats[dateStr]) {
      Object.entries(data.dailyStats[dateStr]).forEach(([domain, stats]) => {
        if (!weekStats[domain]) {
          weekStats[domain] = { time: 0, visits: 0, title: stats.title };
        }
        weekStats[domain].time += stats.time;
        weekStats[domain].visits += stats.visits;
      });
    }
  }
  
  return weekStats;
}

function calculateMonthStats(data) {
  const monthStats = {};
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (data.dailyStats && data.dailyStats[dateStr]) {
      Object.entries(data.dailyStats[dateStr]).forEach(([domain, stats]) => {
        if (!monthStats[domain]) {
          monthStats[domain] = { time: 0, visits: 0, title: stats.title };
        }
        monthStats[domain].time += stats.time;
        monthStats[domain].visits += stats.visits;
      });
    }
  }
  
  return monthStats;
}

function calculateYearStats(data) {
  const yearStats = {};
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (data.dailyStats && data.dailyStats[dateStr]) {
      Object.entries(data.dailyStats[dateStr]).forEach(([domain, stats]) => {
        if (!yearStats[domain]) {
          yearStats[domain] = { time: 0, visits: 0, title: stats.title };
        }
        yearStats[domain].time += stats.time;
        yearStats[domain].visits += stats.visits;
      });
    }
  }
  
  return yearStats;
}

function calculateCustomRangeStats(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return {};
  }
  
  const customStats = {};
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  // Asegurar que endDate sea al final del día
  endDate.setHours(23, 59, 59, 999);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (data.dailyStats && data.dailyStats[dateStr]) {
      Object.entries(data.dailyStats[dateStr]).forEach(([domain, stats]) => {
        if (!customStats[domain]) {
          customStats[domain] = { time: 0, visits: 0, title: stats.title };
        }
        customStats[domain].time += stats.time;
        customStats[domain].visits += stats.visits;
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return customStats;
}

async function updateBlockingRules(blockedSites) {
  const rules = [];
  
  blockedSites.forEach((domain, index) => {
    // Crear regla para dominio principal (sin www)
    const mainRule = {
      id: (index * 2) + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(domain)
        }
      },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ['main_frame']
      }
    };
    
    // Crear regla para subdominio (con www y otros)
    const subdomainRule = {
      id: (index * 2) + 2,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(domain)
        }
      },
      condition: {
        urlFilter: `*://*.${domain}/*`,
        resourceTypes: ['main_frame']
      }
    };
    
    rules.push(mainRule, subdomainRule);
  });
  
  try {
    // Primero eliminar todas las reglas existentes (cada dominio usa 2 IDs)
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({ length: 2000 }, (_, i) => i + 1)
    });
    
    // Luego agregar las nuevas reglas
    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    }
    
  } catch (error) {
    console.error('Error updating blocking rules:', error);
  }
} 