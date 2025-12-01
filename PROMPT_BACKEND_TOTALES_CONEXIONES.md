# Prompt para Claude: Restaurar datos del botón "Conexiones" en el Panel de Gestión

## Contexto
- Pantalla afectada: `Panel de control y gestión` en `src/pantallas/operaciones/IspDetailsScreen.tsx`.
- El botón "Conexiones" (id `7`) consume `GET https://wellnet-rd.com:444/api/totales-conexiones/:ispId` para pintar las métricas mostradas junto al botón.
- Desde la pérdida de código backend, este endpoint siempre responde con ceros aunque existan datos reales.
- El frontend ya está listo: toma `totalConexiones`, `conexionesActivas`, `conexionesSuspendidas`, `conexionesInactivas` y, si existe, `conexionesPorEstado`. Ver `conexionesTotales` en `IspDetailsScreen.tsx:379-410`.

## Objetivo del Prompt
Pedirle a Claude que:
1. Revise/implemente el controlador del endpoint `GET /api/totales-conexiones/:ispId`.
2. Consulte la tabla `conexiones` filtrando por `id_isp` (o `isp_id`, según la BD actual).
3. Devuelva los contadores agregados por estado para poblar el botón "Conexiones" del dashboard.
4. Respete el formato plano que espera el frontend (sin envolver en `data`).

## Datos que debe devolver el endpoint
```json
{
  "totalConexiones": 450,
  "conexionesActivas": 350,
  "conexionesSuspendidas": 50,
  "conexionesInactivas": 50,
  "conexionesPorEstado": {
    "estado0": 20,
    "estado1": 10,
    "estado2": 15,
    "estado3": 350,
    "estado4": 50,
    "estado5": 5,
    "estado6": 0,
    "estado7": 0,
    "estado8": 0
  }
}
```
- `conexionesActivas` = conexiones con estado **3** (`ACTIVA`).
- `conexionesSuspendidas` = conexiones con estado **4** (`SUSPENDIDA`).
- `conexionesInactivas` = suma de estados inactivos (`0,1,2,5,6,7,8`).
- `conexionesPorEstado` debe mapear cada id a `estado{id}` para permitir cálculos futuros. Si algún estado no existe en la tabla, devolver 0 igualmente.

## Tabla de estados de referencia
Tomar las constantes usadas en `src/constants/estadosConexion.ts`:
| ID | Estado                    | Clasificación |
|----|---------------------------|---------------|
| 0  | Pendiente (legacy)        | Inactiva      |
| 1  | Pendiente de instalación | Inactiva      |
| 2  | En ejecución             | Inactiva      |
| 3  | Activa                   | Activa        |
| 4  | Suspendida               | Suspendida    |
| 5  | Baja voluntaria          | Inactiva      |
| 6  | Baja forzada             | Inactiva      |
| 7  | Averiada                 | Inactiva      |
| 8  | Pendiente de reconexión  | Inactiva      |

## Consulta SQL sugerida
```sql
-- Total de conexiones por ISP
SELECT COUNT(*) AS totalConexiones
FROM conexiones
WHERE id_isp = ?;

-- Agrupación por estado
SELECT
  COUNT(CASE WHEN id_estado_conexion = 3 THEN 1 END) AS conexionesActivas,
  COUNT(CASE WHEN id_estado_conexion = 4 THEN 1 END) AS conexionesSuspendidas,
  COUNT(CASE WHEN id_estado_conexion IN (0,1,2,5,6,7,8) THEN 1 END) AS conexionesInactivas
FROM conexiones
WHERE id_isp = ?;

-- Detalle por estado (opcional pero recomendado)
SELECT id_estado_conexion AS estado, COUNT(*) AS total
FROM conexiones
WHERE id_isp = ?
GROUP BY id_estado_conexion;
```
Claude puede combinar estas consultas en una sola sentencia con agregaciones si prefiere.

## Requisitos técnicos
1. Responder con JSON plano, no anidado dentro de `data`. El frontend puede tolerar ambos, pero para evitar ambigüedades usa la versión plana.
2. Validar `ispId`: si no existe o no es numérico, responder 400 con mensaje claro.
3. Manejar errores de base de datos con try/catch y responder 500 con `message: 'Error al obtener totales de conexiones'`.
4. Agregar logs (`console.log`) similares a los indicados en `REQUERIMIENTO_BACKEND_DASHBOARD_TOTALES.md` para depurar:
   - `[API] totales-conexiones - ispId: 12`
   - `[API] totales-conexiones - Resultados: {...}`
   - `[API] totales-conexiones - ERROR: ...`
5. Incluir `Accept: application/json` y asegurarse de que nunca se retorne HTML (cuando falla la autenticación hoy se devuelve HTML y el frontend rompe).

## Validaciones antes de entregar
- Probar con `curl -k https://wellnet-rd.com:444/api/totales-conexiones/12 -H "Authorization: Bearer <token>"`.
- Confirmar que los campos numéricos no llegan en 0 si la BD tiene registros.
- Confirmar que la suma `conexionesActivas + conexionesSuspendidas + conexionesInactivas` coincide con `totalConexiones`.
- Documentar en la respuesta qué tablas/columnas se usaron.

## Texto recomendado para Claude
```
Necesito que restaures el endpoint GET /api/totales-conexiones/:ispId del backend de ISP-CORE. Este endpoint alimenta el botón "Conexiones" del Panel de control en React Native (ver src/pantallas/operaciones/IspDetailsScreen.tsx). Desde que se perdió código, siempre responde con ceros.

El endpoint debe consultar la tabla `conexiones` filtrando por `id_isp`.
- Cuenta todas las filas para `totalConexiones`.
- Usa `id_estado_conexion` para derivar:
  * conexionesActivas → estado 3
  * conexionesSuspendidas → estado 4
  * conexionesInactivas → estados 0,1,2,5,6,7,8
- Devuelve un objeto `conexionesPorEstado` con cada id encontrado (alias `estado{id}`) y 0 para los que no existan.

Estructura esperada:
{
  "totalConexiones": 450,
  "conexionesActivas": 350,
  "conexionesSuspendidas": 50,
  "conexionesInactivas": 50,
  "conexionesPorEstado": { "estado0": 20, ..., "estado4": 50 }
}

Usa SQL similar a:
SELECT COUNT(*) FROM conexiones WHERE id_isp = ?;
SELECT
  COUNT(CASE WHEN id_estado_conexion = 3 THEN 1 END) AS conexionesActivas,
  ...
FROM conexiones WHERE id_isp = ?;

Valida ispId, maneja errores con status 400/500 y agrega logs `[API] totales-conexiones ...`.

Antes de finalizar, prueba con curl a https://wellnet-rd.com:444/api/totales-conexiones/12 y verifica que los números ya no sean 0 si existen datos reales. Documenta en la respuesta qué tablas consultaste.
```

Con este prompt, Claude debería generar el código/fix necesario para que el botón "Conexiones" muestre la información real del ISP.
