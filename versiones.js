// Configurar event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de versiones cargada');
    
    // Configurar botón de cerrar
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.close();
        });
    }

    // Añadir animaciones de entrada
    animateVersionItems();
});

function animateVersionItems() {
    const versionItems = document.querySelectorAll('.version-item');
    
    versionItems.forEach((item, index) => {
        // Añadir un pequeño delay para cada item
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Añadir estilos para las animaciones
const style = document.createElement('style');
style.textContent = `
    .version-item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
    
    .version-section {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 25px;
        border-radius: 12px;
        margin-bottom: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .version-header h2 {
        color: #2d3748;
        margin: 0;
    }
    
    .version-date {
        color: #666;
        font-size: 14px;
    }
    
    .version-badge {
        text-align: center;
    }
    
    .badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .badge.current {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .versions-list {
        margin-top: 30px;
    }
    
    .version-item {
        background: white;
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border: 1px solid #e9ecef;
    }
    
    .version-item.future {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        border-left: 5px solid #ff9800;
    }
    
    /* Destacar versión 1.2.1 */
    .version-item:first-child {
        background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        border-left: 5px solid #9c27b0;
        box-shadow: 0 6px 20px rgba(156, 39, 176, 0.2);
        transform: scale(1.02);
    }
    
    .version-item:first-child .version-info h3 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 1.3em;
    }
    
    .version-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .version-info h3 {
        color: #2d3748;
        margin: 0;
    }
    
    .version-type {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .version-type.release {
        background: #d4edda;
        color: #155724;
    }
    
    .version-type.feature {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        color: #0d47a1;
    }
    
    .version-type.fix {
        background: #fff3e0;
        color: #e65100;
    }
    
    .version-type.upcoming {
        background: #fff3cd;
        color: #856404;
    }
    
    .version-content h4 {
        color: #495057;
        margin: 20px 0 10px 0;
        font-size: 16px;
    }
    
    .version-content ul {
        margin-bottom: 20px;
        padding-left: 20px;
    }
    
    .version-content li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: #6c757d;
    }
    
    .info-section {
        background: #e3f2fd;
        padding: 25px;
        border-radius: 12px;
        margin-top: 30px;
        border-left: 5px solid #2196f3;
        text-align: center;
    }
    
    .info-section h3 {
        color: #1565c0;
        margin-bottom: 15px;
    }
    
    .info-section p {
        color: #1976d2;
        margin-bottom: 20px;
    }
    
    .contact-links {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .contact-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .contact-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .version-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .version-info {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .contact-links {
            flex-direction: column;
            align-items: center;
        }
        
        .contact-btn {
            width: 100%;
            max-width: 200px;
            text-align: center;
        }
    }
`;

document.head.appendChild(style); 