# ⏱️ TimeTracker Pro - Chrome Extension

> **Choose your language / Elige tu idioma:**
> 
> [🇺🇸 **Read in English**](#english-version) | [🇪🇸 **Leer en Castellano**](#versión-en-castellano)

---

## English Version

A complete and professional Chrome extension that allows you to control the time you spend on each web page, with detailed statistics, automatic categorization, and site blocking.

## 🚀 Features

### ✅ Smart Tracking
- **Real-time**: Precise tracking of time on each web page
- **Automatic detection**: Detects tab and window changes
- **Smart pauses**: Pauses when you switch windows or applications
- **Mouse activity detection**: Automatically pauses tracking when no mouse movement for 1 minute
- **Tab visibility tracking**: Only tracks time when tab is active and visible
- **Triple verification**: Window focused + tab visible + user active for maximum precision

### 📊 Complete Statistics
- **Flexible periods**: View data by day, week, month, or entire history
- **Top sites**: Ranking of most visited sites
- **Category statistics**: Detailed analysis by content type
- **Visual charts**: Progress bars and percentages

### 🏷️ Automatic Categorization
- **10 Predefined categories**: Work, Entertainment, News, Shopping, Education, Social Media, Finance, Travel, Gaming, Tools
- **100+ Pre-configured sites**: Massive expansion with Spanish and international domains
- **Custom categories**: Create your own categories
- **Smart classification**: Automatic categorization based on known domains
- **International support**: Spanish banks, travel sites, local services

### 🚫 Site Blocking
- **Total blocking**: Completely blocks access to websites
- **Temporary unblocking**: Allows access for a limited time
- **Custom blocking page**: Motivational interface with statistics
- **Easy management**: Block/unblock with one click

### ⚙️ Advanced Configuration
- **Daily goals**: Set time targets
- **Export/Import**: Data backup and synchronization
- **Data cleanup**: Selective history deletion

## 📦 Installation

### Option 1: From Chrome Extensions Store (In process)

### Option 2: Load as unpacked extension (Recommended for development)

1. **Clone or download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in the top right corner)
4. **Click "Load unpacked extension"**
5. **Select** the project folder
6. **Done!** The extension will appear in the toolbar

## 🔧 Usage

### Main Popup
- **Click the extension icon** to open the popup with basic information
- **Settings**: In the Configuration or Settings option, you can adjust extension parameters like categories, blocked domains, etc.
- **Complete statistics**: Check complete statistics of which sites you visit, which categories, search domains, or change detail periods.
- **Search specific sites** using the search bar
- **Manage blocks** with action buttons

### Advanced Configuration
- **Click "Options"** in the popup
- **Configure tracking**: Enable/disable, intervals
- **Manage categories**: Add, delete, customize
- **Configure blocking**: Add sites, manage list
- **Manage data**: Export, import, clean

## 🆕 Latest Updates (v1.2.1)

### ✨ New in Version 1.2.1
- **Bug Fixes**: Enhanced stability and performance improvements
- **Optimized Activity Detection**: More precise user activity tracking
- **Memory Optimization**: Better memory usage and automatic cleanup
- **Error Handling**: Improved error management and edge cases
- **Synchronization**: Better synchronization between tabs and processes

### 🚀 Major Features in Version 1.2.0
- **Mouse Activity Pause**: Automatically pauses when no movement for 1 minute
- **Smart Tab Detection**: Only tracks when tab is active and visible
- **4 New Categories**: Finance, Travel, Gaming, Tools with pre-configured sites
- **100+ New Sites**: Massive expansion of Spanish and international domains
- **Advanced Activity Detection**: Mouse, keyboard, scroll, touch, wheel events
- **Improved Performance**: Data saving every 10 seconds (vs 30s previously)

## 🛠️ Development

### Technologies Used
- **Manifest V3**: Latest version of Chrome extensions
- **Chrome Extensions API**: Native Chrome APIs
- **JavaScript ES6+**: Modern and efficient code
- **CSS Grid/Flexbox**: Responsive design
- **Local Storage**: Persistent storage

### Chrome APIs Used
- `chrome.tabs`: Tab tracking
- `chrome.storage`: Data storage
- `chrome.alarms`: Timers
- `chrome.declarativeNetRequest`: Site blocking
- `chrome.runtime`: Communication between components

### Architecture
- **Service Worker**: Event handling and business logic
- **Popup**: Main user interface
- **Options**: Advanced configuration
- **Statistics**: All details of your visits
- **Content Scripts**: Not required (use of native APIs)

## 🔒 Privacy and Security

- **Local data**: All information is stored locally
- **No telemetry**: No data sent to external servers
- **Minimal permissions**: Only requests necessary permissions
- **Open source**: All code is auditable

## 📈 Performance

- **Efficient tracking**: Updates every minute
- **Minimal memory usage**: Optimized for extensions
- **No navigation impact**: Doesn't affect loading speed
- **Automatic cleanup**: Smart data management

## 🤝 Contributions

Contributions are welcome! Please:

1. **Fork** the project
2. **Create a branch** for your feature (`git checkout -b feature/new-functionality`)
3. **Commit** your changes (`git commit -am 'Add new functionality'`)
4. **Push** to the branch (`git push origin feature/new-functionality`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the **MIT License**.

## 🙏 Acknowledgments

- **Chrome Extensions API**: For the robust tools
- **Users**: For making development worthwhile

---

**TimeTracker Pro** - Developed with ❤️ to improve productivity and online time awareness.

For more information, support, or suggestions, don't hesitate to contact me.

We hope TimeTracker Pro helps you be more productive and aware of your online time! 🚀

---

## Versión en Castellano

Una extensión completa y profesional para Chrome que te permite controlar el tiempo que pasas en cada página web, con estadísticas detalladas, categorización automática y bloqueo de sitios.

## 🚀 Características

### ✅ Seguimiento Inteligente
- **Tiempo real**: Seguimiento preciso del tiempo en cada página web
- **Detección automática**: Detecta cambios de pestañas y ventanas
- **Pausas inteligentes**: Se pausa cuando cambias de ventana o aplicación
- **Detección de actividad del ratón**: Pausa automáticamente el tracking cuando no hay movimiento por 1 minuto
- **Seguimiento de visibilidad**: Solo rastrea tiempo cuando la pestaña está activa y visible
- **Triple verificación**: Ventana enfocada + pestaña visible + usuario activo para máxima precisión

### 📊 Estadísticas Completas
- **Períodos flexibles**: Visualiza datos por día, semana, mes o todo el historial
- **Top de sitios**: Ranking de sitios más visitados
- **Estadísticas por categoría**: Análisis detallado por tipo de contenido
- **Gráficos visuales**: Barras de progreso y porcentajes

### 🏷️ Categorización Automática
- **10 Categorías predefinidas**: Trabajo, Entretenimiento, Noticias, Compras, Educación, Redes Sociales, Finanzas, Viajes, Gaming, Herramientas
- **100+ Sitios preconfigurados**: Expansión masiva con dominios españoles e internacionales
- **Categorías personalizadas**: Crea tus propias categorías
- **Clasificación inteligente**: Categorización automática basada en dominios conocidos
- **Soporte internacional**: Bancos españoles, sitios de viajes, servicios locales

### 🚫 Bloqueo de Sitios
- **Bloqueo total**: Bloquea completamente el acceso a sitios web
- **Desbloqueo temporal**: Permite acceso por un tiempo limitado
- **Página de bloqueo personalizada**: Interfaz motivacional con estadísticas
- **Gestión fácil**: Bloquear/desbloquear con un clic

### ⚙️ Configuración Avanzada
- **Objetivos diarios**: Establece metas de tiempo
- **Exportar/Importar**: Backup y sincronización de datos
- **Limpieza de datos**: Eliminación selectiva de historial

## 📦 Instalación

### Opción 1: Desde la Store de Chrome Extensions (En proceso)

### Opción 2: Carga como extensión sin empaquetar (Recomendado para desarrollo)

1. **Clonar o descargar** este repositorio
2. **Abrir Chrome** y navegar a `chrome://extensions/`
3. **Habilitar "Modo de desarrollador"** (toggle en la esquina superior derecha)
4. **Hacer clic en "Cargar extensión sin empaquetar"**
5. **Seleccionar** la carpeta del proyecto
6. **¡Listo!** La extensión aparecerá en la barra de herramientas

## 🔧 Uso

### Popup Principal
- **Clic en el icono** de la extensión para abrir el popup con la información basica
- **Ajustes**: En la opción Configuración o Ajustes, podrás ajustar la extensión en parametros como categorias, dominios bloqueados, etc. 
- **Estadisticas completas**: Comprueba las estadisticas completas de que sitios visitas, que categorias, busca dominios o cambia los peridos de detalle. 
- **Busca sitios específicos** usando la barra de búsqueda
- **Gestiona bloqueos** con los botones de acción

### Configuración Avanzada
- **Clic en "Opciones"** en el popup
- **Configura seguimiento**: Habilitar/deshabilitar, intervalos
- **Gestiona categorías**: Agregar, eliminar, personalizar
- **Configura bloqueos**: Agregar sitios, gestionar lista
- **Administra datos**: Exportar, importar, limpiar

## 🆕 Últimas Actualizaciones (v1.2.1)

### ✨ Novedades en Versión 1.2.1
- **Corrección de Errores**: Mejoras en estabilidad y rendimiento general
- **Detección de Actividad Optimizada**: Seguimiento más preciso de la actividad del usuario
- **Optimización de Memoria**: Mejor uso de memoria y limpieza automática
- **Manejo de Errores**: Mejora en el manejo de errores y casos edge
- **Sincronización**: Mejor sincronización entre pestañas y procesos

### 🚀 Características Principales en Versión 1.2.0
- **Pausa por Actividad del Ratón**: Se pausa automáticamente cuando no hay movimiento por 1 minuto
- **Detección Inteligente de Pestañas**: Solo rastrea cuando la pestaña está activa y visible
- **4 Nuevas Categorías**: Finanzas, Viajes, Gaming, Herramientas con sitios preconfigurados
- **100+ Sitios Nuevos**: Expansión masiva de dominios españoles e internacionales
- **Detección Avanzada de Actividad**: Eventos de ratón, teclado, scroll, touch, rueda
- **Rendimiento Mejorado**: Guardado de datos cada 10 segundos (vs 30s anteriormente)

## 🛠️ Desarrollo

### Tecnologías Utilizadas
- **Manifest V3**: Última versión de extensiones de Chrome
- **Chrome Extensions API**: APIs nativas de Chrome
- **JavaScript ES6+**: Código moderno y eficiente
- **CSS Grid/Flexbox**: Diseño responsive
- **Local Storage**: Almacenamiento persistente

### APIs de Chrome Utilizadas
- `chrome.tabs`: Seguimiento de pestañas
- `chrome.storage`: Almacenamiento de datos
- `chrome.alarms`: Temporizadores
- `chrome.declarativeNetRequest`: Bloqueo de sitios
- `chrome.runtime`: Comunicación entre componentes

### Arquitectura
- **Service Worker**: Manejo de eventos y lógica de negocio
- **Popup**: Interfaz principal del usuario
- **Options**: Configuración avanzada
- **Estadisticas**: Todos los detalles de tus visitas
- **Content Scripts**: No requeridos (uso de APIs nativas)

## 🔒 Privacidad y Seguridad

- **Datos locales**: Toda la información se almacena localmente
- **Sin telemetría**: No se envían datos a servidores externos
- **Permisos mínimos**: Solo solicita permisos necesarios
- **Código abierto**: Todo el código es auditable

## 📈 Rendimiento

- **Seguimiento eficiente**: Actualizaciones cada minuto
- **Uso mínimo de memoria**: Optimizado para extensiones
- **Sin impacto en navegación**: No afecta la velocidad de carga
- **Limpieza automática**: Gestión inteligente de datos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre un Pull Request**

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.

## 🙏 Agradecimientos

- **Chrome Extensions API**: Por las herramientas robustas
- **Usuarios**: Por hacer que el desarrollo valga la pena

---

**TimeTracker Pro** - Desarrollado con ❤️ para mejorar la productividad y conciencia del tiempo en línea.

Para más información, soporte o sugerencias, no dudes en contactarme.

¡Esperamos que TimeTracker Pro te ayude a ser más productivo y consciente de tu tiempo en línea! 🚀 