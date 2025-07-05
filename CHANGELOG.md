# Changelog - TimeTracker Pro

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