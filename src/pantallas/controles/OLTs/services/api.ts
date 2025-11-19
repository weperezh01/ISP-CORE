/**
 * =====================================
 * OLT & ONU Management - API Module
 * =====================================
 *
 * Funciones para interactuar con el backend de OLTs, ONUs y TR-069
 */

import {
  OltSummary,
  OnuPending,
  OnuDetail,
  AuthorizeOnuPayload,
  AuthorizeOnuResponse,
  UpdateManagementIpPayload,
  UpdateWanConfigPayload,
  SwInfo,
  ApiResponse,
  VlanCatalog,
  ZoneCatalog,
  OdbCatalog,
  OdbPortCatalog,
  SpeedProfileCatalog,
  OnuTypeCatalog,
} from './types';

const API_BASE = 'https://wellnet-rd.com:444/api';

/**
 * Helper: Hacer fetch con auth token
 * @param endpoint - Endpoint de la API
 * @param token - Token de autenticación
 * @param options - Opciones de fetch
 * @param timeoutMs - Timeout en milisegundos (default: 60000 = 60s)
 */
async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  timeoutMs: number = 60000
): Promise<ApiResponse<T>> {
  try {
    // Crear AbortController para manejar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`⚠️ [API] Timeout after ${timeoutMs}ms for endpoint: ${endpoint}`);
    }, timeoutMs);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Limpiar el timeout si la petición completó
    clearTimeout(timeoutId);

    // Get content type to check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;
    let responseText: string = '';

    try {
      // Get the raw text first
      responseText = await response.text();

      // Try to parse as JSON if it looks like JSON
      if (isJson || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        data = JSON.parse(responseText);
      } else {
        // Non-JSON response (probably HTML error page)
        data = { error: 'Invalid response format', raw: responseText.substring(0, 200) };
      }
    } catch (parseError) {
      console.error('❌ [API] JSON Parse Error:', parseError);
      console.error('❌ [API] Response text (first 500 chars):', responseText.substring(0, 500));
      data = {
        error: 'Failed to parse response',
        details: `Response was not valid JSON. Status: ${response.status}`,
        raw: responseText.substring(0, 200)
      };
    }

    if (!response.ok) {
      // Log completo del error para debugging
      console.error('❌ [API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: endpoint,
        data: data,
      });

      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
        code: data.code,
        details: data.details,
        debug: data.debug,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error: any) {
    // Detectar si fue un timeout (AbortError)
    if (error.name === 'AbortError') {
      console.error(`⏱️ [API] Timeout: La petición excedió ${timeoutMs}ms`);
      return {
        success: false,
        error: `Timeout: La operación tardó más de ${timeoutMs / 1000} segundos`,
        code: 'TIMEOUT',
      };
    }

    console.error('❌ [API] Network/Fetch Error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

// ==================== Dashboard ====================

/**
 * Obtener resumen/estadísticas de todas las OLTs
 * GET /api/olts/summary
 */
export async function getOltsSummary(token: string): Promise<ApiResponse<OltSummary>> {
  return fetchWithAuth<OltSummary>('/olts/summary', token);
}

/**
 * Obtener resumen de una OLT específica
 * GET /api/olts/:oltId/summary
 */
export async function getOltSummary(
  oltId: string,
  token: string
): Promise<ApiResponse<OltSummary>> {
  return fetchWithAuth<OltSummary>(`/olts/${oltId}/summary`, token);
}

// ==================== Pending ONUs ====================

/**
 * Obtener lista de ONUs pendientes de autorización en una OLT
 * GET /api/olts/:oltId/pending-onus
 */
export async function getPendingOnus(
  oltId: string,
  token: string
): Promise<ApiResponse<OnuPending[]>> {
  return fetchWithAuth<OnuPending[]>(`/olts/${oltId}/pending-onus`, token);
}

// ==================== ONU Authorization ====================

/**
 * Autorizar una ONU pendiente
 * POST /api/olts/realtime/:oltId/onus/:serial/authorize
 *
 * NOTA: Esta operación puede tardar hasta 90 segundos debido a:
 * - Conexión SSH a la OLT
 * - Ejecución de comandos en la OLT
 * - Verificación de la configuración
 *
 * Timeout: 180 segundos (3 minutos)
 */
export async function authorizeOnu(
  oltId: string,
  serial: string,
  payload: AuthorizeOnuPayload,
  token: string
): Promise<ApiResponse<AuthorizeOnuResponse>> {
  console.log('🔄 [Authorization] Iniciando autorización (timeout: 180s)...');

  return fetchWithAuth<AuthorizeOnuResponse>(
    `/olts/realtime/${oltId}/onus/${serial}/authorize`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    180000 // 3 minutos de timeout
  );
}

/**
 * Desautorizar/Eliminar una ONU autorizada
 * DELETE /api/olts/realtime/:oltId/onus/:serial/deauthorize
 *
 * Timeout: 120 segundos (2 minutos)
 */
export async function deauthorizeOnu(
  oltId: string,
  serial: string,
  puerto: string,
  ontId: number,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  console.log('🗑️ [Deauthorize] Desautorizando ONU (timeout: 120s)...');

  return fetchWithAuth<{ success: boolean; message: string }>(
    `/olts/realtime/${oltId}/onus/${serial}/deauthorize`,
    token,
    {
      method: 'DELETE',
      body: JSON.stringify({ puerto, ont_id: ontId }),
    },
    120000 // 2 minutos de timeout
  );
}

// ==================== ONU Details & Status ====================

/**
 * Obtener detalles completos de una ONU (incluyendo TR-069 si disponible)
 * GET /api/olts/realtime/:oltId/onus/:onuId
 */
export async function getOnuDetails(
  oltId: string,
  onuId: string,
  token: string,
  puerto?: string,
  ontId?: string | number
): Promise<ApiResponse<OnuDetail>> {
  const queryParams = new URLSearchParams();
  if (puerto) queryParams.append('puerto', puerto);
  if (ontId !== undefined && ontId !== null) queryParams.append('ont_id', String(ontId));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return fetchWithAuth<OnuDetail>(
    `/olts/realtime/${oltId}/onus/${onuId}${queryString}`,
    token
  );
}

/**
 * Obtener estado actual de una ONU
 * GET /api/onus/:onuId/status
 */
export async function getOnuStatus(
  onuId: string,
  token: string
): Promise<ApiResponse<any>> {
  return fetchWithAuth<any>(`/onus/${onuId}/status`, token);
}

/**
 * Obtener running-config de una ONU
 * GET /api/onus/:onuId/running-config
 */
export async function getOnuRunningConfig(
  onuId: string,
  token: string
): Promise<ApiResponse<{ config: string }>> {
  return fetchWithAuth<{ config: string }>(`/onus/${onuId}/running-config`, token);
}

/**
 * Obtener información de software/hardware de una ONU (TR-069)
 * GET /api/onus/:onuId/sw-info
 */
export async function getOnuSwInfo(
  onuId: string,
  token: string
): Promise<ApiResponse<SwInfo>> {
  return fetchWithAuth<SwInfo>(`/onus/${onuId}/sw-info`, token);
}

/**
 * Obtener estado de conexión TR-069
 * GET /api/onus/:onuId/tr069-status
 */
export async function getOnuTr069Status(
  onuId: string,
  token: string
): Promise<ApiResponse<any>> {
  return fetchWithAuth<any>(`/onus/${onuId}/tr069-status`, token);
}

/**
 * Obtener stream "LIVE" de una ONU (WebSocket o streaming)
 * GET /api/onus/:onuId/live
 */
export async function getOnuLiveStream(
  onuId: string,
  token: string
): Promise<ApiResponse<any>> {
  // TODO: Implementar WebSocket o streaming cuando el backend lo soporte
  return fetchWithAuth<any>(`/onus/${onuId}/live`, token);
}

/**
 * Obtener estadísticas TR-069 completas de una ONU
 * GET /api/olts/realtime/:oltId/onus/:serial/tr069-stats
 *
 * NOTA: Algunas secciones requieren ACS (Auto-Configuration Server) como GenieACS.
 * Sin ACS, solo están disponibles los datos básicos desde CLI de la OLT.
 *
 * Secciones disponibles sin ACS:
 * - General: ✅ (device info, optical power, distance)
 * - IP Interface 1.1: ⚠️ (limitado)
 * - IP Interface 2.1: ⚠️ (limitado)
 * - Wireless LAN: ❌ (requiere ACS)
 * - WiFi Site Survey: ❌ (requiere ACS)
 */
export async function getOnuTr069Stats(
  oltId: number,
  onuSerial: string,
  token: string
): Promise<ApiResponse<any>> {
  return fetchWithAuth<any>(`/olts/realtime/${oltId}/onus/${onuSerial}/tr069-stats`, token);
}

// ==================== TR-069 Configuration ====================

/**
 * Actualizar configuración de Management IP (TR-069)
 * POST /api/onus/:onuId/management-ip
 */
export async function updateOnuManagementIp(
  onuId: string,
  payload: UpdateManagementIpPayload,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/onus/${onuId}/management-ip`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Actualizar configuración de WAN
 * POST /api/onus/:onuId/wan-config
 */
export async function updateOnuWanConfig(
  onuId: string,
  payload: UpdateWanConfigPayload,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/onus/${onuId}/wan-config`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Forzar refresh de información TR-069
 * POST /api/onus/:onuId/tr069-refresh
 */
export async function refreshOnuTr069(
  onuId: string,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/onus/${onuId}/tr069-refresh`,
    token,
    {
      method: 'POST',
    }
  );
}

/**
 * Reiniciar ONU via TR-069
 * POST /api/onus/:onuId/reboot
 */
export async function rebootOnu(
  onuId: string,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/onus/${onuId}/reboot`,
    token,
    {
      method: 'POST',
    }
  );
}

// ==================== Available ONT IDs ====================

/**
 * Obtener ONT IDs disponibles en un puerto
 * GET /api/olts/realtime/:oltId/ports/:puerto/available-ont-ids
 */
export async function getAvailableOntIds(
  oltId: string,
  puerto: string,
  token: string,
  limit: number = 10
): Promise<ApiResponse<{
  puerto: string;
  total_capacity: number;
  occupied_count: number;
  available_count: number;
  next_available: number | null;
  available_ids: number[];
  occupied_ids: number[];
}>> {
  const encodedPort = encodeURIComponent(puerto);
  return fetchWithAuth(
    `/olts/realtime/${oltId}/ports/${encodedPort}/available-ont-ids?limit=${limit}`,
    token
  );
}

// ==================== TR-069 Configuration (Write/Update) ====================

/**
 * Configurar Wireless LAN (WiFi 2.4GHz) de una ONU
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/wireless-lan
 */
export async function configureWirelessLan(
  oltId: number,
  onuSerial: string,
  config: {
    ssid: string;
    password?: string;
    auth_mode: string;
    channel: number;
    tx_power: number;
    country_domain: string;
  },
  token: string
): Promise<ApiResponse<any>> {
  return fetchWithAuth<any>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/wireless-lan`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  );
}

/**
 * Configurar servidor DHCP LAN de una ONU
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/lan-dhcp
 */
export async function configureLanDhcp(
  oltId: number,
  onuSerial: string,
  config: {
    dhcp_server_enable: boolean;
    start_address?: string;
    end_address?: string;
    subnet_mask?: string;
    dns_servers?: string;
    lease_time?: number;
  },
  token: string
): Promise<ApiResponse<any>> {
  return fetchWithAuth<any>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/lan-dhcp`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  );
}

/**
 * Reiniciar ONU via TR-069
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/reboot
 *
 * Timeout: 120 segundos (2 minutos)
 */
export async function rebootOnuTr069(
  oltId: number,
  onuSerial: string,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string; task_id?: string }>> {
  console.log('🔄 [Reboot] Reiniciando ONU (timeout: 120s)...');

  return fetchWithAuth<{ success: boolean; message: string; task_id?: string }>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/reboot`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    },
    120000 // 2 minutos de timeout
  );
}

/**
 * Resincronizar configuración de ONU via TR-069
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/resync-config
 *
 * Timeout: 90 segundos
 */
export async function resyncOnuConfig(
  oltId: number,
  onuSerial: string,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string; task_id?: string }>> {
  console.log('🔄 [Resync] Resincronizando configuración (timeout: 90s)...');

  return fetchWithAuth<{ success: boolean; message: string; task_id?: string }>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/resync-config`,
    token,
    {
      method: 'POST',
    },
    90000 // 90 segundos de timeout
  );
}

/**
 * Restaurar valores de fábrica de una ONU via TR-069
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/factory-reset
 *
 * Timeout: 150 segundos (2.5 minutos)
 */
export async function factoryResetOnu(
  oltId: number,
  onuSerial: string,
  token: string,
  confirm: boolean = true
): Promise<ApiResponse<{ success: boolean; message: string; task_id?: string }>> {
  console.log('⚠️ [Factory Reset] Restaurando valores de fábrica (timeout: 150s)...');

  return fetchWithAuth<{ success: boolean; message: string; task_id?: string }>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/factory-reset`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ confirm }),
    },
    150000 // 2.5 minutos de timeout
  );
}

/**
 * Deshabilitar ONU via TR-069
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/disable
 *
 * Timeout: 90 segundos
 */
export async function disableOnu(
  oltId: number,
  onuSerial: string,
  token: string
): Promise<ApiResponse<{ success: boolean; message: string; previous_state?: string; new_state?: string }>> {
  console.log('⚠️ [Disable] Deshabilitando ONU (timeout: 90s)...');

  return fetchWithAuth<{ success: boolean; message: string; previous_state?: string; new_state?: string }>(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/disable`,
    token,
    {
      method: 'POST',
    },
    90000 // 90 segundos de timeout
  );
}

/**
 * Diagnóstico - Ping desde la ONU
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/diagnostic/ping
 */
export async function diagnosticPing(
  oltId: number,
  onuSerial: string,
  config: {
    host: string;
    number_of_repetitions?: number;
    timeout?: number;
  },
  token: string
): Promise<ApiResponse<{
  success_count: number;
  failure_count: number;
  average_response_time: number;
  min_response_time: number;
  max_response_time: number;
}>> {
  return fetchWithAuth(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/diagnostic/ping`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  );
}

/**
 * Diagnóstico - Traceroute desde la ONU
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/diagnostic/traceroute
 */
export async function diagnosticTraceroute(
  oltId: number,
  onuSerial: string,
  config: {
    host: string;
    max_hop_count?: number;
    timeout?: number;
  },
  token: string
): Promise<ApiResponse<{
  hops: Array<{
    hop_number: number;
    host: string;
    response_time: number;
  }>;
}>> {
  return fetchWithAuth(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/diagnostic/traceroute`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  );
}

/**
 * Diagnóstico - Speed Test desde la ONU
 * POST /api/olts/realtime/:oltId/onus/:serial/tr069/diagnostic/speedtest
 */
export async function diagnosticSpeedTest(
  oltId: number,
  onuSerial: string,
  config: {
    direction: 'download' | 'upload' | 'both';
    test_server?: string;
  },
  token: string
): Promise<ApiResponse<{
  download_mbps: number;
  upload_mbps: number;
  latency_ms: number;
  jitter_ms: number;
  test_duration_seconds: number;
}>> {
  return fetchWithAuth(
    `/olts/realtime/${oltId}/onus/${onuSerial}/tr069/diagnostic/speedtest`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(config),
    }
  );
}

// ==================== Helpers & Utilities ====================

/**
 * Validar formato de puerto PON
 */
export function validatePortFormat(puerto: string): boolean {
  // Formato: "0/1/5" (frame/slot/port) para Huawei
  // Formato: "1/1/5" (rack/slot/port) para ZTE
  const regex = /^\d+\/\d+\/\d+$/;
  return regex.test(puerto);
}

/**
 * Parsear puerto PON
 */
export function parsePort(puerto: string): { frame: number; slot: number; port: number } | null {
  if (!validatePortFormat(puerto)) return null;

  const parts = puerto.split('/');
  return {
    frame: parseInt(parts[0]),
    slot: parseInt(parts[1]),
    port: parseInt(parts[2]),
  };
}

/**
 * Convertir velocidad a número (Mbps)
 */
export function speedToMbps(speed: string): number {
  const match = speed.match(/^(\d+)(M|G)$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  return unit === 'G' ? value * 1000 : value;
}

/**
 * Convertir número (Mbps) a string de velocidad
 */
export function mbpsToSpeed(mbps: number): string {
  if (mbps >= 1000) {
    return `${mbps / 1000}G`;
  }
  return `${mbps}M`;
}

/**
 * Validar serial number (formato común)
 */
export function validateSerialNumber(serial: string): boolean {
  // Huawei: HWTC + 8 hex chars
  // ZTE: ZTEG + 8 hex chars
  // Otros: 12-16 alfanuméricos
  return /^[A-Z0-9]{12,16}$/i.test(serial);
}

// ==================== Catalogs API (Authorization Form) ====================

/**
 * Obtener catálogo de VLANs disponibles
 * GET /api/catalogs/vlans
 *
 * @param ispId - ID del ISP (opcional, filtra por ISP)
 * @param token - Token de autenticación
 */
export async function getVlansCatalog(
  token: string,
  ispId?: string
): Promise<ApiResponse<VlanCatalog[]>> {
  const params = ispId ? `?isp_id=${ispId}` : '';
  return fetchWithAuth<VlanCatalog[]>(`/catalogs/vlans${params}`, token);
}

/**
 * Obtener catálogo de Zonas geográficas
 * GET /api/catalogs/zones
 *
 * @param token - Token de autenticación
 * @param search - Búsqueda por nombre (opcional)
 */
export async function getZonesCatalog(
  token: string,
  search?: string
): Promise<ApiResponse<ZoneCatalog[]>> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchWithAuth<ZoneCatalog[]>(`/catalogs/zones${params}`, token);
}

/**
 * Obtener catálogo de ODB Splitters
 * GET /api/catalogs/odbs
 *
 * @param token - Token de autenticación
 * @param zoneId - ID de zona (opcional, filtra por zona)
 */
export async function getOdbsCatalog(
  token: string,
  zoneId?: number
): Promise<ApiResponse<OdbCatalog[]>> {
  const params = zoneId ? `?zone_id=${zoneId}` : '';
  return fetchWithAuth<OdbCatalog[]>(`/catalogs/odbs${params}`, token);
}

/**
 * Obtener puertos disponibles para un ODB Splitter
 * GET /api/catalogs/odb-ports
 *
 * @param token - Token de autenticación
 * @param odbId - ID del ODB Splitter (opcional)
 * @param capacity - Capacidad del splitter (default: 16)
 */
export async function getOdbPortsCatalog(
  token: string,
  odbId?: string,
  capacity: number = 16
): Promise<ApiResponse<OdbPortCatalog[]>> {
  const params = new URLSearchParams();
  if (odbId) params.append('odb_id', odbId);
  params.append('capacity', String(capacity));

  const queryString = params.toString();
  return fetchWithAuth<OdbPortCatalog[]>(
    `/catalogs/odb-ports${queryString ? `?${queryString}` : ''}`,
    token
  );
}

/**
 * Obtener catálogo de perfiles de velocidad
 * GET /api/catalogs/speed-profiles
 *
 * @param token - Token de autenticación
 * @param ispId - ID del ISP (opcional, filtra por ISP)
 */
export async function getSpeedProfilesCatalog(
  token: string,
  ispId?: string
): Promise<ApiResponse<SpeedProfileCatalog[]>> {
  const params = ispId ? `?isp_id=${ispId}` : '';
  return fetchWithAuth<SpeedProfileCatalog[]>(`/catalogs/speed-profiles${params}`, token);
}

/**
 * Obtener catálogo de tipos de ONU soportados
 * GET /api/olts/:oltId/onu-types
 *
 * @param oltId - ID del OLT
 * @param token - Token de autenticación
 */
export async function getOnuTypesCatalog(
  oltId: string,
  token: string
): Promise<ApiResponse<OnuTypeCatalog[]>> {
  return fetchWithAuth<OnuTypeCatalog[]>(`/olts/${oltId}/onu-types`, token);
}
