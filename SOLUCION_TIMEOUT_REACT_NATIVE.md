# 🔧 Solución Alternativa: Timeout en React Native

## Problema

React Native puede tener timeouts nativos de red que no se pueden controlar con `AbortController` en JavaScript.

---

## Solución 1: Usar XMLHttpRequest (Más Control)

React Native tiene mejor soporte para timeout en XMLHttpRequest que en fetch.

### Implementar en `api.ts`

```typescript
/**
 * Helper alternativo para React Native que usa XMLHttpRequest
 * Mejor soporte de timeout que fetch en RN
 */
async function fetchWithAuthXHR<T>(
  endpoint: string,
  token: string,
  options: {
    method?: string;
    body?: string;
  } = {},
  timeoutMs: number = 60000
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Configurar timeout (esto SÍ funciona en React Native)
    xhr.timeout = timeoutMs;

    xhr.onload = function() {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            data: data.data || data,
            message: data.message,
          });
        } else {
          resolve({
            success: false,
            error: data.message || data.error || `HTTP ${xhr.status}`,
            code: data.code,
            details: data.details,
          });
        }
      } catch (error: any) {
        resolve({
          success: false,
          error: 'Failed to parse response',
        });
      }
    };

    xhr.onerror = function() {
      resolve({
        success: false,
        error: 'Network error',
      });
    };

    xhr.ontimeout = function() {
      console.error(`⏱️ [API] Timeout: La petición excedió ${timeoutMs}ms`);
      resolve({
        success: false,
        error: `Timeout: La operación tardó más de ${timeoutMs / 1000} segundos`,
        code: 'TIMEOUT',
      });
    };

    const url = `${API_BASE}${endpoint}`;
    const method = options.method || 'GET';

    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    console.log(`🔄 [API] ${method} ${endpoint} (timeout: ${timeoutMs}ms)`);

    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
}

// Usar en authorizeOnu
export async function authorizeOnu(
  oltId: string,
  serial: string,
  payload: AuthorizeOnuPayload,
  token: string
): Promise<ApiResponse<AuthorizeOnuResponse>> {
  console.log('🔄 [Authorization] Iniciando autorización (timeout: 180s)...');

  return fetchWithAuthXHR<AuthorizeOnuResponse>(
    `/olts/realtime/${oltId}/onus/${serial}/authorize`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    180000 // 3 minutos
  );
}
```

---

## Solución 2: Configurar Timeout Nativo de Android

El problema puede estar en el nivel nativo de Android. Necesitas aumentar el timeout en la configuración de red de Android.

### Archivo: `android/app/src/main/java/com/ispcore/MainApplication.java`

```java
import okhttp3.OkHttpClient;
import java.util.concurrent.TimeUnit;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        // ... código existente ...

        @Override
        protected void onCreate() {
          super.onCreate();

          // Configurar timeout global para React Native
          OkHttpClient client = new OkHttpClient.Builder()
              .connectTimeout(180, TimeUnit.SECONDS)  // 3 minutos para conectar
              .readTimeout(180, TimeUnit.SECONDS)     // 3 minutos para leer
              .writeTimeout(180, TimeUnit.SECONDS)    // 3 minutos para escribir
              .build();

          // Aplicar configuración
          // (Depende de tu versión de RN)
        }
      };
}
```

---

## Solución 3: Usar Axios (Más Robusto en RN)

Axios tiene mejor soporte de timeout en React Native que fetch nativo.

### 1. Instalar axios

```bash
npm install axios
# o
yarn add axios
```

### 2. Crear archivo `src/pantallas/controles/OLTs/services/apiAxios.ts`

```typescript
import axios, { AxiosError } from 'axios';
import { ApiResponse, AuthorizeOnuPayload, AuthorizeOnuResponse } from './types';

const API_BASE = 'https://wellnet-rd.com:444/api';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout por defecto
  timeout: 60000,
});

/**
 * Helper para hacer peticiones con axios
 */
async function fetchWithAuthAxios<T>(
  endpoint: string,
  token: string,
  options: {
    method?: string;
    data?: any;
    timeout?: number;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const { method = 'GET', data, timeout = 60000 } = options;

    console.log(`🔄 [API Axios] ${method} ${endpoint} (timeout: ${timeout}ms)`);

    const response = await axiosInstance.request<any>({
      url: endpoint,
      method,
      data,
      timeout,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      // Timeout
      if (axiosError.code === 'ECONNABORTED') {
        console.error(`⏱️ [API Axios] Timeout: ${options.timeout}ms excedido`);
        return {
          success: false,
          error: `Timeout: La operación tardó más de ${(options.timeout || 60000) / 1000} segundos`,
          code: 'TIMEOUT',
        };
      }

      // Error HTTP con respuesta
      if (axiosError.response) {
        const data = axiosError.response.data;
        console.error('❌ [API Axios] Error response:', {
          status: axiosError.response.status,
          data: data,
        });

        return {
          success: false,
          error: data.message || data.error || `HTTP ${axiosError.response.status}`,
          code: data.code,
          details: data.details,
        };
      }

      // Error de red
      console.error('❌ [API Axios] Network error:', axiosError.message);
      return {
        success: false,
        error: 'Network error: ' + axiosError.message,
      };
    }

    // Error desconocido
    console.error('❌ [API Axios] Unknown error:', error);
    return {
      success: false,
      error: 'Unknown error',
    };
  }
}

/**
 * Autorizar ONU con Axios
 */
export async function authorizeOnuAxios(
  oltId: string,
  serial: string,
  payload: AuthorizeOnuPayload,
  token: string
): Promise<ApiResponse<AuthorizeOnuResponse>> {
  console.log('🔄 [Authorization Axios] Iniciando autorización (timeout: 180s)...');

  return fetchWithAuthAxios<AuthorizeOnuResponse>(
    `/olts/realtime/${oltId}/onus/${serial}/authorize`,
    token,
    {
      method: 'POST',
      data: payload,
      timeout: 180000, // 3 minutos
    }
  );
}
```

### 3. Actualizar `ONUDetailsScreen.tsx` para usar Axios

```typescript
// Cambiar el import
import { authorizeOnuAxios } from './services/apiAxios';

// En handleAuthorizeOnu, cambiar:
const response = await authorizeOnuAxios(oltId, serial, payload, authToken);
```

---

## Solución 4: Deshabilitar Verificación SSL (Solo para Testing)

**⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN**

El problema puede ser certificado SSL autofirmado.

### Android: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">wellnet-rd.com</domain>
    </domain-config>

    <!-- SOLO PARA DESARROLLO -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### `android/app/src/main/AndroidManifest.xml`

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

---

## 🧪 Plan de Testing

### Test 1: Reload con Código Actual
```bash
# En la terminal de Metro
npx react-native start --reset-cache

# Esperar a que compile
# Probar autorización
```

**Resultado esperado**: Si el código se cargó, deberías ver el timeout de 180s aplicarse.

### Test 2: Implementar XMLHttpRequest
1. Reemplazar `fetchWithAuth` con `fetchWithAuthXHR` en `api.ts`
2. Reload
3. Probar autorización

**Resultado esperado**: XMLHttpRequest respeta mejor el timeout en RN.

### Test 3: Usar Axios
1. Instalar axios
2. Crear `apiAxios.ts`
3. Actualizar imports en `ONUDetailsScreen.tsx`
4. Probar autorización

**Resultado esperado**: Axios maneja timeouts más confiablemente.

### Test 4: Verificar Backend
Mientras tanto, elimina la ONU duplicada en el backend:

```sql
-- Conectar a MySQL
mysql -u well -p'874494Aa.' wellnetrddb

-- Ver ONUs en el puerto
SELECT id_onu, serial, puerto, ont_id, estado
FROM onus
WHERE olt_id = 1 AND puerto = '0/1/0';

-- Eliminar la ONU duplicada
DELETE FROM onus
WHERE serial = '48575443439B989D'
  AND olt_id = 1
  AND puerto = '0/1/0';

-- Verificar
SELECT id_onu, serial, puerto, ont_id, estado
FROM onus
WHERE olt_id = 1 AND puerto = '0/1/0';
```

---

## 📊 Prioridad de Soluciones

1. **PRIMERO**: Reload con cache limpio (`--reset-cache`)
2. **SI FALLA**: Implementar XMLHttpRequest (Solución 1)
3. **SI FALLA**: Instalar y usar Axios (Solución 3)
4. **SI FALLA**: Configurar timeout nativo Android (Solución 2)

---

## 🎯 Siguiente Paso

**Acción inmediata**:

1. Recarga la app con `--reset-cache`
2. Si sigue fallando, implementa la Solución 1 (XMLHttpRequest)
3. Reporta qué solución funcionó

¿Cuál solución quieres probar primero?
