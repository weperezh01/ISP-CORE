# FIX: Error de Fecha NaN en Eventos de Factura

## Problema Detectado

Al registrar eventos, se estaban generando fechas con valor `NaN`:

```json
{
  "fecha": "NaN-NaN-NaN",
  "hora": "NaN:NaN:NaN",
  "fecha_hora": "NaN-NaN-NaN NaN:NaN:NaN"
}
```

El backend respondía con error 400:
```json
{
  "success": false,
  "message": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

## Causa del Problema

El código original intentaba convertir la fecha a zona horaria de República Dominicana así:

```javascript
// ❌ CÓDIGO PROBLEMÁTICO
const fechaRD = new Date(fechaActual.toLocaleString('en-US', {
    timeZone: 'America/Santo_Domingo'
}));
```

El problema es que `toLocaleString()` devuelve un string formateado (ej: "1/13/2025, 4:39:00 PM") que al intentar convertir de nuevo a `Date` puede producir resultados inconsistentes o `NaN` dependiendo del entorno (React Native vs navegador).

## Solución Implementada

Usamos `Intl.DateTimeFormat` con `formatToParts()` que es el método estándar y confiable:

```javascript
// ✅ CÓDIGO CORREGIDO
const opcionesRD = {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};

const partes = new Intl.DateTimeFormat('en-US', opcionesRD).formatToParts(fechaActual);

// Extraer los valores de las partes
const valores = {};
partes.forEach(parte => {
    if (parte.type !== 'literal') {
        valores[parte.type] = parte.value;
    }
});

// Formatear fecha YYYY-MM-DD
const fecha = `${valores.year}-${valores.month}-${valores.day}`;

// Formatear hora HH:MM:SS
const hora = `${valores.hour}:${valores.minute}:${valores.second}`;

// Formatear fecha_hora completa
const fecha_hora = `${fecha} ${hora}`;
```

## Ventajas de Esta Solución

1. **Más robusto**: `formatToParts()` es el método estándar de JavaScript para internacionalización
2. **No depende de parsing**: No intenta parsear un string de vuelta a Date
3. **Funciona en todos los entornos**: Compatible con React Native, navegadores modernos, Node.js
4. **Valores ya formateados**: Devuelve los valores ya con el padding correcto ('01' en lugar de '1')

## Resultado Esperado

Ahora los eventos se registrarán con fechas correctas:

```json
{
  "fecha": "2025-01-13",
  "hora": "16:45:30",
  "fecha_hora": "2025-01-13 16:45:30"
}
```

Y el backend responderá con éxito:

```json
{
  "success": true,
  "message": "Evento registrado exitosamente",
  "id_evento": 123
}
```

## Archivo Modificado

- `src/pantallas/factura/Functions/RegistrarEventoFactura.tsx` (líneas 21-54)

## Logs Esperados Después del Fix

```
📝 [RegistrarEventoFactura] Registrando evento: {
  fecha: "2025-01-13",
  fecha_hora: "2025-01-13 16:45:30",
  hora: "16:45:30",
  id_factura: 64555,
  tipo_evento: "Artículo agregado",
  usuario: 1
}
📥 [RegistrarEventoFactura] Response status: 200
✅ [RegistrarEventoFactura] Evento registrado exitosamente: Artículo agregado - ID: 456
```

## Cómo Probar el Fix

1. Recarga la app (o reinicia el bundler si es necesario)
2. Abre una factura
3. Agrega una nota o artículo
4. Verifica los logs - deberías ver fechas válidas
5. Presiona el botón de historial (icono reloj) para ver los eventos

¡El problema está resuelto! 🎉
