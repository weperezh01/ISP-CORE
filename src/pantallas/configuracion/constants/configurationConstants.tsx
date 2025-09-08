// API Base URL
export const API_BASE_URL = 'https://wellnet-rd.com:444/api';

// Intervalos de polling (en milisegundos)
export const POLLING_INTERVALS = {
  LEASES_REFRESH: 10000, // 10 segundos para leases DHCP
  NETWORKS_REFRESH: 30000, // 30 segundos para redes
  ROUTERS_REFRESH: 60000, // 60 segundos para routers
};

// Configuración de timeouts
export const TIMEOUTS = {
  API_CALL: 15000, // 15 segundos para llamadas API
  NAVIGATION_LOG: 5000, // 5 segundos para logs de navegación
};

// Unidades de velocidad
export const SPEED_UNITS = [
  { label: 'bps', value: 'bps', multiplier: 1 },
  { label: 'Kbps', value: 'kbps', multiplier: 1000 },
  { label: 'Mbps', value: 'Mbps', multiplier: 1000000 },
  { label: 'Gbps', value: 'Gbps', multiplier: 1000000000 },
  { label: 'Tbps', value: 'Tbps', multiplier: 1000000000000 },
];

// Simplificación de unidades para backend
export const SPEED_UNIT_MAPPING = {
  bps: 'b',
  kbps: 'K',
  Mbps: 'M',
  Gbps: 'G',
  Tbps: 'T',
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NO_CONNECTION: 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.',
  NO_CLIENT_DATA: 'No se pudieron obtener los datos del cliente. Por favor, intente nuevamente.',
  NO_ROUTERS: 'No se pudieron obtener los routers. Por favor, intente nuevamente.',
  NO_NETWORKS: 'No se pudieron obtener las redes del router. Por favor, intente nuevamente.',
  NO_LEASES: 'No se pudieron obtener las concesiones DHCP dinámicas. Por favor, intente nuevamente.',
  SAVE_CONFIG_ERROR: 'No se pudo guardar la configuración al servidor.',
  INVALID_SPEED: 'Por favor, ingrese velocidades válidas.',
  NO_USER_DATA: 'Datos de usuario no disponibles.',
  NO_ISP_DATA: 'ID del ISP no disponible.',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  CONFIG_SAVED: 'La configuración fue guardada correctamente.',
  IP_FIXED: 'La IP fue fijada correctamente.',
  NAVIGATION_LOGGED: 'Navegación registrada exitosamente.',
};

// Pasos del flujo de configuración
export const CONFIGURATION_STEPS = {
  ROUTER_SELECTION: 'router',
  NETWORK_SELECTION: 'network', 
  IP_CONFIGURATION: 'ip',
  CONFIRMATION: 'confirmation',
} as const;

// Títulos de pantallas
export const SCREEN_TITLES = {
  CONFIGURATION: 'Configuración',
  ROUTER_SELECTION: 'Selección de Router',
  NETWORK_SELECTION: 'Selección de Red',
  IP_CONFIGURATION: 'Configuración IP',
  CONFIRMATION: 'Confirmación',
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  LOGIN_DATA: '@loginData',
  SELECTED_ISP_ID: '@selectedIspId',
  CONFIGURATION_CACHE: '@configurationCache',
};

// Configuración de caché
export const CACHE_DURATION = {
  ROUTERS: 5 * 60 * 1000, // 5 minutos
  NETWORKS: 3 * 60 * 1000, // 3 minutos  
  LEASES: 30 * 1000, // 30 segundos
};

// Validaciones
export const VALIDATION_RULES = {
  MIN_SPEED: 1,
  MAX_SPEED: 10000,
  REQUIRED_FIELDS: ['uploadSpeed', 'downloadSpeed'],
};

export default {
  API_BASE_URL,
  POLLING_INTERVALS,
  TIMEOUTS,
  SPEED_UNITS,
  SPEED_UNIT_MAPPING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIGURATION_STEPS,
  SCREEN_TITLES,
  STORAGE_KEYS,
  CACHE_DURATION,
  VALIDATION_RULES,
};