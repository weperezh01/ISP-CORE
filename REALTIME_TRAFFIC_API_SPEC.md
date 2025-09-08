# Especificación de la API para Tráfico de Interfaces en Tiempo Real

Este documento describe la estructura de datos que el backend proporcionará para visualizar las velocidades de subida y bajada en tiempo real para cada interfaz en la pantalla `RouterDetailsScreen.tsx`.

## Requisitos para el Frontend

El frontend debe estar preparado para recibir un array de objetos JSON. Cada objeto representará una interfaz de red del router y contendrá su nombre y las velocidades actuales de tráfico.

La actualización de estos datos debe realizarse mediante polling periódico (por ejemplo, cada 2-5 segundos) al endpoint correspondiente o, preferiblemente, a través de una conexión WebSocket si la infraestructura lo permite.

### Estructura de Datos Esperada

El endpoint (`/api/router/{id}/interfaces/traffic`) devolverá un array de objetos con la siguiente estructura:

```json
[
  {
    "name": "ether1-gateway",
    "upload_bps": 1850000,
    "download_bps": 12300000
  },
  {
    "name": "ether2-master-lan",
    "upload_bps": 650000,
    "download_bps": 4200000
  },
  {
    "name": "wlan1-wifi-clientes",
    "upload_bps": 2300000,
    "download_bps": 8750000
  },
  {
    "name": "sfp-plus1",
    "upload_bps": 0,
    "download_bps": 0
  }
]
```

### Descripción de los Campos

- **`name`** (`string`): Es el nombre identificador de la interfaz, tal como está configurado en el router (ej. "ether1", "wlan1", "sfp-plus1").
- **`upload_bps`** (`number`): Representa la velocidad de **subida** actual de la interfaz, medida en **bits por segundo (bps)**.
- **`download_bps`** (`number`): Representa la velocidad de **bajada** actual de la interfaz, medida en **bits por segundo (bps)**.

### Consideraciones Adicionales

1.  **Unidades:** El backend siempre enviará los valores de velocidad en **bits por segundo (bps)**. Es responsabilidad del frontend convertir estas unidades a un formato más legible para el usuario (Kbps, Mbps, Gbps) según sea necesario.
2.  **Manejo de Cero Tráfico:** Si una interfaz no tiene tráfico, los valores `upload_bps` y `download_bps` serán `0`.
3.  **Lista Dinámica:** La lista de interfaces puede variar entre diferentes routers. El frontend debe renderizar dinámicamente una fila o componente por cada objeto presente en el array.
4.  **Errores y Latencia:** El frontend debe manejar adecuadamente los estados de carga y los posibles errores en la comunicación con el API, mostrando un indicador apropiado al usuario.

Con esta estructura, el equipo de frontend tendrá toda la información necesaria para construir un componente de visualización de tráfico en tiempo real claro y preciso.
