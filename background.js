class TimeTracker {
  constructor() {
    this.currentTab = null;
    this.startTime = null;
    this.isActive = true;
    this.init();
  }

  init() {
    // Configurar listeners
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocus.bind(this));
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
    
    // Configurar alarma para guardar datos periódicamente (cada 30 segundos)
    chrome.alarms.create('saveData', { periodInMinutes: 0.5 });
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    
    // Inicializar con la pestaña activa
    this.initializeCurrentTab();
  }

  async initializeCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        this.startTracking(tab);
      }
    } catch (error) {
      console.error('Error initializing current tab:', error);
    }
  }

  handleTabActivated(activeInfo) {
    this.switchTab(activeInfo.tabId);
  }

  handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
      this.switchTab(tabId);
    }
  }

  handleWindowFocus(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      this.stopTracking();
    } else {
      this.resumeTracking();
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
    const tab = await chrome.tabs.get(tabId);
    this.startTracking(tab);
  }

  startTracking(tab) {
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      return;
    }

    this.currentTab = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      domain: this.extractDomain(tab.url)
    };
    
    this.startTime = Date.now();
    this.isActive = true;
  }

  async stopTracking() {
    if (this.currentTab && this.startTime && this.isActive) {
      const timeSpent = Date.now() - this.startTime;
      await this.saveTimeData(this.currentTab, timeSpent);
    }
    
    this.currentTab = null;
    this.startTime = null;
  }

  resumeTracking() {
    if (this.currentTab && !this.isActive) {
      this.startTime = Date.now();
      this.isActive = true;
    }
  }

  async saveCurrentSession() {
    if (this.currentTab && this.startTime && this.isActive) {
      const timeSpent = Date.now() - this.startTime;
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
      'Trabajo': ['github.com', 'stackoverflow.com', 'linkedin.com', 'slack.com', 'zoom.us', 'teams.microsoft.com'],
      'Entretenimiento': ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'instagram.com', 'tiktok.com'],
      'Noticias': ['bbc.com', 'cnn.com', 'elmundo.es', 'elpais.com', 'marca.com', 'as.com'],
      'Compras': ['amazon.com', 'ebay.com', 'aliexpress.com', 'pccomponentes.com', 'elcorteingles.es'],
      'Educación': ['coursera.org', 'udemy.com', 'khan academy.org', 'edx.org', 'wikipedia.org'],
      'Redes Sociales': ['facebook.com', 'twitter.com', 'instagram.com', 'reddit.com', 'discord.com']
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
        categories: ['work', 'entertainment', 'news', 'shopping', 'education', 'social', 'other']
      };
    }
    
    if (!data.blockedSites) {
      data.blockedSites = [];
    }
    
    await this.setStorageData(data);
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
  console.log('🔄 Toggle block for:', domain);
  
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
    console.log('🔓 Unblocking:', cleanDomain);
  } else {
    // Bloquear: agregar a la lista
    data.blockedSites.push(cleanDomain);
    console.log('🔒 Blocking:', cleanDomain);
  }
  
  await timeTracker.setStorageData(data);
  await updateBlockingRules(data.blockedSites);
  
  const result = { success: true, blocked: !isCurrentlyBlocked };
  console.log('✅ Result:', result);
  return result;
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
  console.log('🔄 updateBlockingRules called with sites:', blockedSites);
  
  const rules = [];
  
  blockedSites.forEach((domain, index) => {
    // El dominio ya viene normalizado de las funciones que llaman a updateBlockingRules
    
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
    console.log(`🔧 Rules for "${domain}": *://${domain}/* & *://*.${domain}/*`);
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
      console.log('✅ Applied', rules.length, 'blocking rules');
    } else {
      console.log('🚫 All blocking rules removed');
    }
    
    // Verificar reglas actuales
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('📋 Active rules:', currentRules.length);
    
  } catch (error) {
    console.error('❌ Error updating blocking rules:', error);
  }
} 