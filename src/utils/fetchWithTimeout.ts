/**
 * =========================================
 * fetchWithTimeout - Utility para React Native
 * =========================================
 *
 * Wrapper de fetch con timeout configurable que funciona en React Native.
 * Soluciona el problema de "Network request failed" por timeouts muy cortos.
 *
 * USO:
 * import { fetchWithTimeout } from '../utils/fetchWithTimeout';
 *
 * const response = await fetchWithTimeout('https://api.com/endpoint', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data)
 * }, 120000); // 2 minutos
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Fetch con timeout configurable
 *
 * @param url - URL del endpoint
 * @param options - Opciones de fetch (method, headers, body, etc)
 * @param timeoutMs - Timeout en milisegundos (default: 60000 = 60s)
 * @returns Promise<Response>
 * @throws Error si hay timeout o error de red
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
  timeoutMs: number = 60000
): Promise<Response> {
  // Crear AbortController para manejar timeout
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`⚠️ [Fetch Timeout] La petición a ${url} excedió ${timeoutMs}ms`);
  }, timeoutMs);

  try {
    console.log(`🔄 [Fetch] ${options.method || 'GET'} ${url} (timeout: ${timeoutMs}ms)`);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    // Limpiar el timeout si la petición completó
    clearTimeout(timeoutId);

    console.log(`✅ [Fetch] ${options.method || 'GET'} ${url} - Status: ${response.status}`);

    return response;

  } catch (error: any) {
    clearTimeout(timeoutId);

    // Detectar si fue un timeout (AbortError)
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Timeout: La operación tardó más de ${timeoutMs / 1000} segundos`);
      (timeoutError as any).code = 'TIMEOUT';
      throw timeoutError;
    }

    // Error de red u otro
    throw error;
  }
}

/**
 * Fetch con timeout y parsing automático de JSON
 *
 * @param url - URL del endpoint
 * @param options - Opciones de fetch
 * @param timeoutMs - Timeout en milisegundos
 * @returns Promise<T> - Datos parseados como JSON
 */
export async function fetchJSON<T = any>(
  url: string,
  options: FetchWithTimeoutOptions = {},
  timeoutMs: number = 60000
): Promise<T> {
  const response = await fetchWithTimeout(url, options, timeoutMs);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('❌ [Fetch] Error parsing JSON:', error);
    console.error('Response text:', text.substring(0, 500));
    throw new Error('Error al procesar la respuesta del servidor');
  }
}

/**
 * Timeouts recomendados por tipo de operación
 */
export const TIMEOUTS = {
  /** Operaciones rápidas (listas, consultas simples) */
  SHORT: 30000,      // 30 segundos

  /** Operaciones normales (la mayoría de endpoints) */
  MEDIUM: 60000,     // 60 segundos (1 minuto)

  /** Operaciones lentas (SSH, scripts, configuraciones) */
  LONG: 120000,      // 120 segundos (2 minutos)

  /** Operaciones muy lentas (autorizaciones, comandos complejos) */
  VERY_LONG: 180000, // 180 segundos (3 minutos)
};

/**
 * Ejemplo de uso:
 *
 * // Básico
 * const response = await fetchWithTimeout('https://api.com/data', {
 *   method: 'GET'
 * }, TIMEOUTS.MEDIUM);
 *
 * // Con JSON automático
 * const data = await fetchJSON('https://api.com/users', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'John' })
 * }, TIMEOUTS.LONG);
 *
 * // Manejo de errores
 * try {
 *   const data = await fetchJSON('https://api.com/slow-endpoint', {}, TIMEOUTS.VERY_LONG);
 * } catch (error) {
 *   if (error.code === 'TIMEOUT') {
 *     console.log('La operación tardó demasiado');
 *   } else {
 *     console.log('Error de red:', error.message);
 *   }
 * }
 */
