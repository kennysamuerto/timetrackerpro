function openPopup() {
    try {
        if (chrome.action && chrome.action.openPopup) {
            chrome.action.openPopup();
        } else {
            // Fallback: no se puede abrir el popup programáticamente
            alert('Para ver el popup, haz clic en el icono ⏱️ de TimeTracker Pro en la barra de herramientas');
        }
    } catch (error) {
        alert('Para ver el popup, haz clic en el icono ⏱️ de TimeTracker Pro en la barra de herramientas');
    }
}

function openStats() {
    chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

function openCoffee() {
    chrome.tabs.create({ url: 'https://coff.ee/vandertoorm' });
}

// Configurar event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar botones
    const popupBtn = document.getElementById('popup-btn');
    const statsBtn = document.getElementById('stats-btn');
    const optionsBtn = document.getElementById('options-btn');
    const coffeeBtn = document.getElementById('coffee-btn');
    
    if (popupBtn) {
        popupBtn.addEventListener('click', openPopup);
    }
    
    if (statsBtn) {
        statsBtn.addEventListener('click', openStats);
    }
    
    if (optionsBtn) {
        optionsBtn.addEventListener('click', openOptions);
    }
    
    if (coffeeBtn) {
        coffeeBtn.addEventListener('click', openCoffee);
    }
    
    // Confirmar que la página se cargó correctamente
    console.log('TimeTracker Pro - Página de bienvenida cargada correctamente');
}); 