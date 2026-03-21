export type Locale = 'es' | 'en';

export interface Strings {
  tabs: {
    home: string;
    messages: string;
    rules: string;
    telegram: string;
    config: string;
    logs: string;
  };
  home: {
    title: string;
    subtitle: string;
    permissionWarning: string;
    serviceLabel: string;
    active: string;
    inactive: string;
    nativeNotLinked: string;
    alertPermTitle: string;
    alertPermDenied: string;
    alertPermRequired: string;
  };
  messages: {
    title: string;
    subtitle: string;
    forwarded: string;
    dropped: string;
    errors: string;
    searchPlaceholder: string;
    filterAll: string;
    statusForwarded: string;
    statusDropped: string;
    statusError: string;
    empty: string;
    emptyHint: string;
    clearHistory: string;
    clearConfirmTitle: string;
    clearConfirmMsg: string;
    received: string;
    processed: string;
    collapse: string;
    expand: string;
  };
  rules: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    patternLabel: string;
    patternPlaceholder: string;
    useRegex: string;
    create: string;
    modeRegex: string;
    modeIncludes: string;
    deleteAction: string;
  };
  telegram: {
    title: string;
    subtitle: string;
    active: string;
    inactive: string;
    addLink: string;
    labelInput: string;
    labelPlaceholder: string;
    tokenInput: string;
    tokenPlaceholder: string;
    chatIdInput: string;
    chatIdPlaceholder: string;
    saveLink: string;
    cancel: string;
    testAll: string;
    empty: string;
    emptyHint: string;
    testSuccessTitle: string;
    testSuccessMsg: string;
    testAllSuccessMsg: string;
    deleteTitle: string;
    deleteMsg: string;
    savedTitle: string;
    savedMsg: string;
    allFieldsRequired: string;
    testBtn: string;
    deleteBtn: string;
  };
  logs: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    copyShare: string;
    clear: string;
    empty: string;
    emptyHint: string;
  };
  config: {
    title: string;
    subtitle: string;
    themeSection: string;
    themeHint: string;
    themeActive: string;
    scheduleSection: string;
    scheduleHint: string;
    scheduleActive: string;
    scheduleInactive: string;
    scheduleStart: string;
    scheduleEnd: string;
    scheduleDays: string;
    languageSection: string;
    languageHint: string;
  };
  daysShort: string[];
  common: {
    error: string;
    success: string;
    cancel: string;
    delete: string;
    save: string;
    unknownError: string;
  };
}

const es: Strings = {
  tabs: {
    home: 'Inicio',
    messages: 'Mensajes',
    rules: 'Reglas',
    telegram: 'Telegram',
    config: 'Config',
    logs: 'Logs',
  },
  home: {
    title: 'EVENT FEED',
    subtitle: 'Últimos 50 eventos del servicio',
    permissionWarning: '⚠ Permisos de SMS no concedidos. Toca aquí para solicitarlos.',
    serviceLabel: 'Servicio de Intercepción',
    active: 'Activo',
    inactive: 'Inactivo',
    nativeNotLinked: 'Módulo nativo no vinculado.',
    alertPermTitle: 'Permisos',
    alertPermDenied: 'No se pudieron obtener todos los permisos necesarios.',
    alertPermRequired: 'Necesitas otorgar permisos de SMS para activar el servicio.',
  },
  messages: {
    title: 'MENSAJES SMS',
    subtitle: 'Interceptados y procesados por el servicio',
    forwarded: 'Reenviados',
    dropped: 'Ignorados',
    errors: 'Errores',
    searchPlaceholder: 'Buscar remitente o contenido...',
    filterAll: 'TODOS',
    statusForwarded: 'REENVIADO',
    statusDropped: 'IGNORADO',
    statusError: 'ERROR',
    empty: 'Sin mensajes.',
    emptyHint: 'Los SMS interceptados aparecerán aquí cuando lleguen.',
    clearHistory: 'Limpiar historial',
    clearConfirmTitle: 'Limpiar historial',
    clearConfirmMsg: '¿Borrar todos los mensajes interceptados?',
    received: 'Recibido',
    processed: 'Procesado',
    collapse: '▲ Colapsar',
    expand: '▼ Ver completo',
  },
  rules: {
    title: 'RULE ENGINE',
    subtitle: 'Reglas para filtrar y reenviar SMS',
    nameLabel: 'Nombre',
    namePlaceholder: 'Banco principal',
    patternLabel: 'Patrón',
    patternPlaceholder: 'includes o expresión regular',
    useRegex: 'Usar RegExp',
    create: 'Crear Regla',
    modeRegex: 'Modo: RegExp',
    modeIncludes: 'Modo: includes',
    deleteAction: 'Eliminar',
  },
  telegram: {
    title: 'TELEGRAM LINKS',
    subtitle: '{0} destino(s) configurado(s)',
    active: 'Activos',
    inactive: 'Inactivos',
    addLink: '+ Agregar Telegram Link',
    labelInput: 'Nombre / Etiqueta',
    labelPlaceholder: 'Ej: "Mi grupo", "Alertas bancarias"',
    tokenInput: 'Bot Token',
    tokenPlaceholder: '123456:ABCDEF...',
    chatIdInput: 'Chat ID',
    chatIdPlaceholder: '-100123456789',
    saveLink: 'Guardar Link',
    cancel: 'Cancelar',
    testAll: '⚡ Test todos los links activos',
    empty: 'Sin destinos Telegram.',
    emptyHint: 'Agrega un Bot Token y Chat ID para empezar a reenviar SMS.',
    testSuccessTitle: 'Éxito',
    testSuccessMsg: 'Conexión con "{0}" correcta.',
    testAllSuccessMsg: 'Todos los links activos respondieron correctamente.',
    deleteTitle: 'Eliminar',
    deleteMsg: '¿Eliminar link "{0}"?',
    savedTitle: 'Guardado',
    savedMsg: 'Link "{0}" agregado.',
    allFieldsRequired: 'Todos los campos son obligatorios.',
    testBtn: '⚡ Test',
    deleteBtn: '🗑 Eliminar',
  },
  logs: {
    title: 'DEBUG LOGS',
    subtitle: '{0} entrada(s) • toca un mensaje para seleccionar',
    searchPlaceholder: 'Buscar tag o mensaje...',
    copyShare: 'Copiar / Compartir',
    clear: 'Limpiar',
    empty: 'Sin logs todavía.',
    emptyHint: 'Los logs aparecen al usar la app.',
  },
  config: {
    title: 'CONFIGURACIÓN',
    subtitle: 'Personaliza tu experiencia',
    themeSection: '🎨 Apariencia',
    themeHint: 'Elige un tema para la aplicación',
    themeActive: 'ACTIVO',
    scheduleSection: '⏰ Horario',
    scheduleHint: 'Define un horario para la intercepción de SMS',
    scheduleActive: 'Horario activo',
    scheduleInactive: 'Horario inactivo',
    scheduleStart: 'Inicio',
    scheduleEnd: 'Fin',
    scheduleDays: 'Días activos',
    languageSection: '🌐 Idioma',
    languageHint: 'Selecciona el idioma de la aplicación',
  },
  daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  common: {
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    save: 'Guardar',
    unknownError: 'Error desconocido.',
  },
};

const en: Strings = {
  tabs: {
    home: 'Home',
    messages: 'Messages',
    rules: 'Rules',
    telegram: 'Telegram',
    config: 'Config',
    logs: 'Logs',
  },
  home: {
    title: 'EVENT FEED',
    subtitle: 'Last 50 service events',
    permissionWarning: '⚠ SMS permissions not granted. Tap here to request them.',
    serviceLabel: 'Interception Service',
    active: 'Active',
    inactive: 'Inactive',
    nativeNotLinked: 'Native module not linked.',
    alertPermTitle: 'Permissions',
    alertPermDenied: 'Could not obtain all required permissions.',
    alertPermRequired: 'You need to grant SMS permissions to activate the service.',
  },
  messages: {
    title: 'SMS MESSAGES',
    subtitle: 'Intercepted and processed by the service',
    forwarded: 'Forwarded',
    dropped: 'Dropped',
    errors: 'Errors',
    searchPlaceholder: 'Search sender or content...',
    filterAll: 'ALL',
    statusForwarded: 'FORWARDED',
    statusDropped: 'DROPPED',
    statusError: 'ERROR',
    empty: 'No messages.',
    emptyHint: 'Intercepted SMS will appear here when received.',
    clearHistory: 'Clear history',
    clearConfirmTitle: 'Clear history',
    clearConfirmMsg: 'Delete all intercepted messages?',
    received: 'Received',
    processed: 'Processed',
    collapse: '▲ Collapse',
    expand: '▼ View full',
  },
  rules: {
    title: 'RULE ENGINE',
    subtitle: 'Rules for filtering and forwarding SMS',
    nameLabel: 'Name',
    namePlaceholder: 'Main bank',
    patternLabel: 'Pattern',
    patternPlaceholder: 'includes or regular expression',
    useRegex: 'Use RegExp',
    create: 'Create Rule',
    modeRegex: 'Mode: RegExp',
    modeIncludes: 'Mode: includes',
    deleteAction: 'Delete',
  },
  telegram: {
    title: 'TELEGRAM LINKS',
    subtitle: '{0} destination(s) configured',
    active: 'Active',
    inactive: 'Inactive',
    addLink: '+ Add Telegram Link',
    labelInput: 'Name / Label',
    labelPlaceholder: 'E.g: "My group", "Bank alerts"',
    tokenInput: 'Bot Token',
    tokenPlaceholder: '123456:ABCDEF...',
    chatIdInput: 'Chat ID',
    chatIdPlaceholder: '-100123456789',
    saveLink: 'Save Link',
    cancel: 'Cancel',
    testAll: '⚡ Test all active links',
    empty: 'No Telegram destinations.',
    emptyHint: 'Add a Bot Token and Chat ID to start forwarding SMS.',
    testSuccessTitle: 'Success',
    testSuccessMsg: 'Connection to "{0}" successful.',
    testAllSuccessMsg: 'All active links responded correctly.',
    deleteTitle: 'Delete',
    deleteMsg: 'Delete link "{0}"?',
    savedTitle: 'Saved',
    savedMsg: 'Link "{0}" added.',
    allFieldsRequired: 'All fields are required.',
    testBtn: '⚡ Test',
    deleteBtn: '🗑 Delete',
  },
  logs: {
    title: 'DEBUG LOGS',
    subtitle: '{0} entry(ies) • tap a message to select',
    searchPlaceholder: 'Search tag or message...',
    copyShare: 'Copy / Share',
    clear: 'Clear',
    empty: 'No logs yet.',
    emptyHint: 'Logs will appear as you use the app.',
  },
  config: {
    title: 'SETTINGS',
    subtitle: 'Customize your experience',
    themeSection: '🎨 Appearance',
    themeHint: 'Choose a theme for the app',
    themeActive: 'ACTIVE',
    scheduleSection: '⏰ Schedule',
    scheduleHint: 'Set interception schedule hours',
    scheduleActive: 'Schedule active',
    scheduleInactive: 'Schedule inactive',
    scheduleStart: 'Start',
    scheduleEnd: 'End',
    scheduleDays: 'Active days',
    languageSection: '🌐 Language',
    languageHint: 'Select app language',
  },
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  common: {
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    unknownError: 'Unknown error.',
  },
};

export const translations: Record<Locale, Strings> = { es, en };

export function fmt(template: string, ...args: (string | number)[]): string {
  return args.reduce<string>(
    (str, arg, i) => str.replace(`{${i}}`, String(arg)),
    template,
  );
}
