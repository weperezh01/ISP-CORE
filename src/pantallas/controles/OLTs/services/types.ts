/**
 * =====================================
 * OLT & ONU Management - TypeScript Types
 * =====================================
 *
 * Tipos para gestión de OLTs, ONUs y configuración TR-069
 */

// ==================== OLT Dashboard ====================

export interface OltSummary {
  waiting_authorization: {
    total: number;
    discovered: number;      // D
    resync: number;          // Resync
    new: number;             // New
  };
  online: {
    total: number;
    authorized: number;      // Total authorized
  };
  offline: {
    total: number;
    power_fail: number;      // PwrFail
    los: number;             // LoS (Loss of Signal)
    na: number;              // N/A
  };
  low_signals: {
    total: number;
    warning: number;         // Warning level
    critical: number;        // Critical level
  };
}

// ==================== ONU Types ====================

export interface OnuPending {
  id?: string;
  serial: string;              // HWTC439B989D
  pon_type: 'GPON' | 'EPON';
  board: number;               // 1
  port: number;                // 0
  slot?: number;
  puerto?: string;             // "0/1/5"
  model?: string;              // HS8545M5
  type?: string;
  detected_at?: string;
  olt_id: string;
  olt_name?: string;
}

export interface OnuDetail {
  // Identificación
  id: string;
  serial: string;
  index?: string;
  descripcion?: string;

  // Estado básico
  estado: string;
  estado_resumido?: string;
  estado_detallado?: string;
  es_pendiente?: boolean;

  // Ubicación PON
  puerto: string;
  board?: number;
  slot?: number;
  port?: number;
  ont_id?: number;

  // Info hardware
  modelo?: string;
  mac_address?: string;
  version_firmware?: string;

  // Señal óptica
  potencia_rx?: string;
  potencia_tx?: string;
  temperatura?: string;
  voltaje?: string;
  corriente?: string;
  snr?: string;
  distancia?: string;

  // Conexión
  ultima_conexion?: string;
  uptime?: string;
  ultima_desconexion?: string;
  razon_desconexion?: string;

  // Configuración
  vlan?: string;
  perfil_servicio?: string;
  velocidad_bajada?: string;
  velocidad_subida?: string;
  modo_autorizacion?: string;

  // Tráfico
  trafico_rx?: string;
  trafico_tx?: string;

  // Cliente (si aplica)
  cliente_nombre?: string;
  cliente_direccion?: string;
  cliente_telefono?: string;
  plan_servicio?: string;
  estado_pago?: string;
  precio_servicio?: string;

  // TR-069 específico
  tr069?: Tr069Config;
  management_ip?: ManagementIpConfig;
  wan_config?: WanConfig;
  sw_info?: SwInfo;

  // Metadata
  timestamp?: string;
}

// ==================== TR-069 Configuration ====================

export interface Tr069Config {
  profile: string;              // "SmartOLT"
  enabled: boolean;
  connection_status: 'Connected' | 'Disconnected' | 'Unknown';
  last_inform?: string;
  url?: string;
  username?: string;
}

export interface ManagementIpConfig {
  mode: 'Inactive' | 'Static' | 'DHCP';
  vlan_id?: number;             // 69
  vlan_name?: string;           // "TR0-69"
  ip_address?: string;          // "10.254.24.76"
  subnet_mask?: string;
  gateway?: string;
  service_port_id?: string;
  remote_access_allowed?: boolean;
  auto_select_range?: string;   // "10.254.0.0/19"
}

export interface WanConfig {
  mode: 'Routing' | 'Bridging';
  vlan_id: number;              // 100
  setup_method: 'ONU_webpage' | 'TR069' | 'OMCI';

  // Para modo Routing
  addressing_type?: 'DHCP' | 'Static' | 'PPPoE';
  ip_protocol?: 'IPv4' | 'IPv4_IPv6';
  remote_access?: string;

  // Para PPPoE
  pppoe_username?: string;
  pppoe_password?: string;

  // Para Static IP
  static_ip?: string;
  static_subnet?: string;
  static_gateway?: string;
  static_dns_primary?: string;
  static_dns_secondary?: string;
}

export interface SwInfo {
  // Device Info
  manufacturer?: string;
  model_name?: string;
  software_version?: string;
  hardware_version?: string;
  provisioning_code?: string;
  serial_number?: string;

  // System Resources
  cpu_usage?: number;           // Percentage
  total_ram?: number;           // MB
  free_ram?: number;            // MB
  uptime?: string;              // "5d 12h 30m"

  // IP Interfaces
  interfaces?: SwInterface[];
}

export interface SwInterface {
  id: string;                   // "1.1" or "2.1"
  name: string;                 // "Internet_DHCP"
  addressing_type: 'DHCP' | 'Static' | 'PPPoE';
  connection_status: 'Connected' | 'Not connected';
  ip_address?: string;
  subnet_mask?: string;
  default_gateway?: string;
  dns_servers?: string[];
  last_connection_error?: string;
  mac_address?: string;
  max_mtu_size?: number;
  nat_enabled?: boolean;
}

// ==================== Authorization Payload ====================

export interface AuthorizeOnuPayload {
  // Obligatorios
  puerto: string;               // "0/1/5"
  ont_id: number;               // 10
  pon_type: 'GPON' | 'EPON';
  gpon_channel: 'GPON' | 'XG-PON' | 'XGS-PON';
  onu_type: string;             // "COMCAST1", "HG8546M", etc.
  onu_mode: 'Routing' | 'Bridging';
  user_vlan_id: number;         // 100
  download_speed: string;       // "1G", "500M", "100M"
  upload_speed: string;         // "1G", "500M", "100M"
  zona: string;                 // "30 de Mayo"
  name: string;                 // "prueba casa well"

  // Opcionales
  board?: number;               // 1 (read-only del detected)
  port?: number;                // 0 (read-only del detected)
  sn?: string;                  // Serial (read-only)
  use_custom_profile?: boolean;
  odb_splitter?: string;        // ODB
  odb_port?: string;
  address_comment?: string;
  onu_external_id?: string;     // Default: igual al SN
  use_gps?: boolean;
  gps_latitude?: number;
  gps_longitude?: number;

  // Campos legacy (compatibilidad con endpoint actual)
  line_profile?: string;
  service_profile?: string;
  descripcion?: string;
  vlan?: number;
  velocidad_bajada?: number;
  velocidad_subida?: number;
}

// ==================== API Responses ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;  // Detalles adicionales del error
  debug?: any;    // Información de debugging del backend
}

export interface AuthorizeOnuResponse {
  success: boolean;
  message: string;
  onu?: OnuDetail;
  output?: string;
}

export interface UpdateManagementIpPayload {
  tr069_profile: string;        // "SmartOLT"
  mgmt_ip_mode: 'Inactive' | 'Static' | 'DHCP';
  service_port_id?: string;
  allow_remote_access?: boolean;
  mgmt_vlan_id?: number;
  mgmt_ip_address?: string;     // "Auto select" o IP específica
  auto_select_range?: string;   // "10.254.0.0/19"
}

export interface UpdateWanConfigPayload {
  wan_vlan_id: number;
  onu_mode: 'Routing' | 'Bridging';
  wan_setup_method: 'ONU_webpage' | 'TR069' | 'OMCI';
  addressing_type?: 'DHCP' | 'Static' | 'PPPoE';
  ip_protocol?: 'IPv4' | 'IPv4_IPv6';
  wan_remote_access?: string;

  // PPPoE fields
  pppoe_username?: string;
  pppoe_password?: string;

  // Static IP fields
  static_ip?: string;
  static_subnet?: string;
  static_gateway?: string;
  static_dns_primary?: string;
  static_dns_secondary?: string;
}

// ==================== Dropdown Options ====================

export interface DropdownOption {
  label: string;
  value: string;
}

export const PON_TYPES: DropdownOption[] = [
  { label: 'GPON', value: 'GPON' },
  { label: 'EPON', value: 'EPON' },
];

export const GPON_CHANNELS: DropdownOption[] = [
  { label: 'GPON', value: 'GPON' },
  { label: 'XG-PON', value: 'XG-PON' },
  { label: 'XGS-PON', value: 'XGS-PON' },
];

export const ONU_MODES: DropdownOption[] = [
  { label: 'Routing', value: 'Routing' },
  { label: 'Bridging', value: 'Bridging' },
];

export const ONU_TYPES: DropdownOption[] = [
  { label: 'COMCAST1', value: 'COMCAST1' },
  { label: 'HG8546M', value: 'HG8546M' },
  { label: 'HS8545M5', value: 'HS8545M5' },
  { label: 'F660', value: 'F660' },
  { label: 'ZTE-F601', value: 'ZTE-F601' },
  { label: 'AN5506-04-F', value: 'AN5506-04-F' },
  { label: 'Custom', value: 'Custom' },
];

export const SPEED_OPTIONS: DropdownOption[] = [
  { label: '10 Mbps', value: '10M' },
  { label: '20 Mbps', value: '20M' },
  { label: '50 Mbps', value: '50M' },
  { label: '100 Mbps', value: '100M' },
  { label: '200 Mbps', value: '200M' },
  { label: '300 Mbps', value: '300M' },
  { label: '500 Mbps', value: '500M' },
  { label: '1 Gbps', value: '1G' },
  { label: '2 Gbps', value: '2G' },
  { label: '10 Gbps', value: '10G' },
];

export const ADDRESSING_TYPES: DropdownOption[] = [
  { label: 'DHCP', value: 'DHCP' },
  { label: 'Static IP', value: 'Static' },
  { label: 'PPPoE', value: 'PPPoE' },
];

export const IP_PROTOCOLS: DropdownOption[] = [
  { label: 'IPv4', value: 'IPv4' },
  { label: 'Dual Stack (IPv4/IPv6)', value: 'IPv4_IPv6' },
];

export const TR069_PROFILES: DropdownOption[] = [
  { label: 'SmartOLT', value: 'SmartOLT' },
  { label: 'TR069-Default', value: 'TR069-Default' },
  { label: 'Custom', value: 'Custom' },
];

export const MGMT_IP_MODES: DropdownOption[] = [
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Static IP', value: 'Static' },
  { label: 'DHCP', value: 'DHCP' },
];

// ==================== Catalog Types (from Backend) ====================

export interface VlanCatalog {
  vlan_id: number;
  name: string;
  comment?: string;
  display: string;
}

export interface ZoneCatalog {
  id: number;
  nombre: string;
}

export interface OdbCatalog {
  id: string;
  name: string;
  capacity: number;
}

export interface OdbPortCatalog {
  value: string;
  label: string;
}

export interface SpeedProfileCatalog {
  id: number;
  name: string;
  download_mbps: number;
  upload_mbps: number;
  download_speed: string;
  upload_speed: string;
  price?: number;
}

export interface OnuTypeCatalog {
  value: string;
  label: string;
  vendor: 'HUAWEI' | 'ZTE' | 'OTHER';
  compatible_with: string[];
}
