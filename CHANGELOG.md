# Changelog - TimeTracker Pro

## [1.2.1] - 09-07-2025

### 🐛 Correcciones y Arreglos
- **Estabilidad General**: Mejoras en la estabilidad general del sistema de tracking
- **Detección de Actividad**: Optimizada la detección de actividad del usuario para mayor precisión
- **Rendimiento**: Optimizaciones de rendimiento en el procesamiento de datos
- **Sincronización**: Mejoras en la sincronización entre pestañas y procesos
- **Precisión del Tracking**: Ajustes menores para mejorar la precisión del seguimiento
- **Limpieza de Memoria**: Optimizaciones en el uso de memoria y limpieza automática

### 🔧 Mejoras Técnicas
- **Algoritmo de Seguimiento**: Mejoras en el algoritmo de seguimiento de tiempo
- **Manejo de Errores**: Mejor manejo de errores y casos edge
- **Logging**: Optimizado el sistema de logging para mejor rendimiento
- **Configuración**: Ajustes menores en la configuración por defecto

---

## [1.2.0] - 09-07-2025

### ✨ Funcionalidades Principales
- **Pausa Automática por Inactividad**: El tracking se pausa automáticamente cuando no mueves el ratón durante 1 minuto
- **Detección Inteligente de Pestañas**: Solo rastrea tiempo cuando la pestaña está realmente activa y visible
- **Tracking de Tiempo Real**: Sistema mejorado que solo registra el tiempo que verdaderamente pasas usando un sitio web
- **Categorización Masiva Expandida**: Más de 100 sitios web agregados a las categorías existentes
- **4 Nuevas Categorías**: Finanzas, Viajes, Gaming y Herramientas con sitios preconfigurados
- **Sitios Internacionales**: Agregados dominios españoles e internacionales populares

### 🔧 Mejoras y Automatización
- **Detección Avanzada de Actividad**: Detecta movimiento del ratón, clics, teclado, scroll, touch y rueda del ratón
- **Seguimiento Más Frecuente**: Guardado de datos cada 10 segundos en lugar de 30 para mayor precisión
- **Triple Verificación**: Ventana enfocada + pestaña visible + usuario activo para máxima precisión
- **Comunicación Mejorada**: Mejor sincronización entre content script y background
- **Logging Detallado**: Logs completos para debugging y verificación de funcionamiento
- **Estado Inicial Correcto**: Detección precisa del estado al cargar pestañas nuevas

### 🏷️ Categorías Expandidas
- **Trabajo**: +10 sitios (GitLab, Figma, Notion, Trello, Workana, InfoJobs, etc.)
- **Entretenimiento**: +8 sitios (Prime Video, Disney+, Atresplayer, RTVE, etc.)
- **Noticias**: +10 sitios (ABC, La Vanguardia, El Confidencial, Reuters, etc.)
- **Compras**: +15 sitios (Amazon internacional, MediaMarkt, Carrefour, etc.)
- **Educación**: +8 sitios (Platzi, MasterClass, Duolingo, etc.)
- **Redes Sociales**: Reorganización y mejora (Instagram movido desde Entretenimiento)

### 🆕 Nuevas Categorías
- **💰 Finanzas**: Bankinter, BBVA, Santander, CaixaBank, PayPal, Revolut, N26, Investing, Coinbase, Binance
- **✈️ Viajes**: Booking, Airbnb, Skyscanner, TripAdvisor, Expedia, Renfe, Ryanair, Vueling, Iberia
- **🎮 Gaming**: Steam, Epic Games, Battle.net, Roblox, Minecraft, Valorant, League of Legends, Chess.com
- **🛠️ Herramientas**: Gmail, Drive, OneDrive, WeTransfer, Translate, DeepL, Grammarly, Canva, Photopea

### 🐛 Correcciones y Arreglos
- **Tracking en Pestañas Inactivas**: Corregido el problema donde seguía registrando tiempo al cambiar de pestaña
- **Detección de Ratón Inconsistente**: Solucionados problemas de detección de actividad del usuario
- **Pausa/Reanudación Inteligente**: El tiempo se guarda correctamente antes de pausar y se reanuda solo cuando es necesario
- **Comunicación Background-Content**: Eliminada duplicación de funciones y mejorada la sincronización
- **Precisión del Tracking**: Solo registra tiempo cuando realmente estás usando el sitio web
- **Limpieza de Código**: Eliminadas funciones duplicadas y código redundante

### 🎨 Mejoras de Interfaz
- **Configuración de Movimiento del Ratón**: Interfaz mejorada con tooltips informativos
- **Categorías Actualizadas**: Mejor organización y visualización de categorías
- **Compatibilidad Internacional**: Mejor soporte para sitios web internacionales
- **Opciones Más Intuitivas**: Configuración más clara y fácil de usar

---

## [1.1.2] - 05-07-2025

### 🐛 Correcciones Críticas
- **Bloqueo de Sitios - Manifest**: Restaurados los permisos `host_permissions` necesarios para el bloqueo de sitios web
- **Categorías Personalizadas en Estadísticas**: Las categorías creadas en opciones ahora aparecen correctamente en los desplegables de estadísticas
- **Sincronización de Categorías**: Los selects de categorías se actualizan automáticamente cuando se crean nuevas categorías
- **Funcionalidad de Bloqueo**: El bloqueo de sitios web funciona correctamente después del primer uso

### 🔧 Mejoras Técnicas
- **getAllCategories()**: Nueva función para obtener todas las categorías disponibles (predefinidas + personalizadas)
- **initializeCategorySelects()**: Actualización dinámica de desplegables de categorías
- **Actualización Automática**: Los desplegables se actualizan al inicializar y al refrescar estadísticas
- **Permisos Restaurados**: `host_permissions` requeridos para `declarativeNetRequest`

### 🎯 Funcionalidades Afectadas
- **Modal de Cambio de Categoría**: Ahora incluye todas las categorías disponibles
- **Filtro de Categorías**: Filtrado funciona con categorías personalizadas
- **Bloqueo/Desbloqueo**: Funciona correctamente en todos los sitios web
- **Botón de Refresco**: Actualiza categorías disponibles automáticamente

---

## [1.1.1] - 05-07-2025

### 🐛 Correcciones
- **Botón de Bloqueo en Estadísticas**: Corregido error en la página de estadísticas donde el botón de bloqueo/desbloqueo no funcionaba
- **Normalización de Dominios**: Mejorada la normalización de dominios para el cálculo del estado de bloqueo
- **Sincronización de Estado**: El estado de bloqueo se actualiza correctamente en tiempo real
- **Notificaciones**: Las notificaciones de bloqueo/desbloqueo muestran el estado correcto

### 🔧 Mejoras Técnicas
- **Manejador toggleBlock**: Agregado manejador faltante en background.js para la acción 'toggleBlock'
- **Función handleToggleBlock**: Nueva función que maneja el cambio de estado de bloqueo correctamente
- **Cálculo de Estado**: Mejorado el cálculo del campo 'blocked' en calculateStats con normalización apropiada
- **Respuesta del Toggle**: Actualizado stats.js para usar la respuesta correcta del toggle

---

## [1.1.0] - 05-07-2025

### 🌍 Soporte Multiidioma
- **Sistema de Internacionalización completo**: Soporte para múltiples idiomas con sistema i18n robusto
- **Inglés y Español**: Interfaz completamente traducida a ambos idiomas
- **Selector de Idioma**: Cambio dinámico de idioma en tiempo real en todas las páginas
- **Detección Automática**: Detecta automáticamente el idioma del navegador
- **Persistencia**: Recuerda la preferencia de idioma seleccionada

### 🔧 Mejoras Técnicas
- **Sistema de Categorías Normalizado**: Uso de keys internas consistentes con traducciones dinámicas
- **Sincronización Completa**: Los cambios realizados en estadísticas se reflejan automáticamente en configuración
- **Colores Consistentes**: Las categorías mantienen colores independientemente del idioma
- **Funciones Helper**: Sistema de mapeo entre keys de categorías y traducciones

### 🎨 Mejoras de Interfaz
- **Selectores de Idioma Elegantes**: Botones de idioma integrados en todas las páginas
- **Notificaciones Traducidas**: Mensajes de confirmación en el idioma seleccionado
- **Etiquetas Dinámicas**: Categorías se muestran correctamente en ambos idiomas
- **Responsive Mejorado**: Mejor adaptación a textos de diferentes idiomas

### 🐛 Correcciones
- **Categorías Duplicadas**: Eliminadas categorías duplicadas entre idiomas
- **Sincronización de Dominios**: Los dominios agregados desde estadísticas aparecen correctamente en configuración
- **Colores de Categorías**: Se muestran correctamente cuando se agregan desde configuración
- **Selector de Categorías**: Reconoce correctamente la categoría actual al cambiar
- **Eliminación de Categorías**: Funciona correctamente independientemente del idioma

### 📖 Página de Bienvenida Automática
- **Instalación Automática**: Se abre automáticamente al instalar la extensión
- **Guía Completa**: Explicación detallada de todas las funcionalidades
- **Multiidioma**: Disponible en inglés y español

### 📚 Archivos de Localización
- **_locales/en/messages.json**: Traducciones completas en inglés
- **_locales/es/messages.json**: Traducciones completas en español
- **i18n.js**: Sistema de traducciones con fallbacks para desarrollo local

### 🔧 Configuración Mejorada
- **Gestión Avanzada**: Mejor gestión de dominios por categoría
- **Traducciones Dinámicas**: Todas las categorías se muestran en el idioma seleccionado
- **Validaciones**: Mensajes de error y confirmación traducidos

---

## [1.0.0] - 04-07-2025

### 🚀 Lanzamiento Inicial
- **Seguimiento Automático**: Monitoreo preciso del tiempo en cada sitio web
- **Estadísticas Detalladas**: Análisis por día, semana, mes, año y rangos personalizados
- **Categorización Inteligente**: Clasificación automática de sitios web
- **Bloqueo de Sitios**: Bloqueo temporal y permanente de sitios distractores
- **Objetivos Diarios**: Establecimiento de metas de tiempo
- **Exportar/Importar**: Respaldo completo de datos
- **Diseño Moderno**: Interfaz con gradientes morados y tipografía elegante
- **100% Local**: Todos los datos se almacenan en el navegador del usuario
- **Manifest V3**: Uso de la última versión de extensiones de Chrome
- **Código Abierto**: Código auditable y transparente 