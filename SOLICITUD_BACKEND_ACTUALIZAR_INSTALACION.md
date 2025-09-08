# SOLICITUD PARA BACKEND - ENDPOINT ACTUALIZAR INSTALACIÓN

## Problema Detectado
Actualmente en el modo edición de instalaciones, se están usando los mismos endpoints que para crear nuevas instalaciones (`/api/insertar-instalacion`), lo que genera nuevas instalaciones en lugar de actualizar las existentes.

## Nuevo Endpoint Requerido

### **PUT /api/actualizar-instalacion**

#### Descripción:
Endpoint para actualizar una instalación existente sin crear una nueva.

#### Request Body:
```json
{
  "id_instalacion": 1237,
  "id_usuario": 1,
  "id_isp": 12,
  "id_conexion": 2753,
  "id_router": 5,
  "id_tipo_conexion": 3,
  "red_ip": "192.168.1.0/24",
  "direccion_ip": "192.168.1.100",
  "pppoe_usuario": "usuario123",
  "pppoe_secret": "secret123",
  "pppoe_perfil": "perfil_basic",
  "notas_config": "Configuración actualizada",
  "router_wifi": "TP-Link AC1200",
  "router_onu": "Huawei HG8245H",
  "serial_onu": "HWTC12345678",
  "radios": "2",
  "pies_utp_cat5": "100",
  "pies_utp_cat6": "50",
  "pies_drop_fibra": "200",
  "conector_mecanico_fibra": "4",
  "conector_rj45": "8",
  "pinzas_anclaje": "6",
  "bridas": "20",
  "grapas": "15",
  "velas_silicon": "2",
  "pies_tubo": "30",
  "rollos_cable_dulce": "1",
  "clavos": "10",
  "tornillos": "12",
  "abrazaderas": "8",
  "notas_instalacion": "Instalación actualizada por técnico",
  "latitud": "18.4861",
  "longitud": "-69.9312"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Instalación actualizada correctamente",
  "id_instalacion": 1237,
  "fecha_actualizacion": "2025-06-28T10:30:00.000Z"
}
```

#### Response Error (400/500):
```json
{
  "success": false,
  "message": "Error al actualizar la instalación",
  "error": "Descripción específica del error"
}
```

## Lógica de Base de Datos Sugerida

```sql
UPDATE instalaciones 
SET 
  notas_config = ?,
  router_wifi = ?,
  router_onu = ?,
  serial_onu = ?,
  radios = ?,
  pies_utp_cat5 = ?,
  pies_utp_cat6 = ?,
  pies_drop_fibra = ?,
  conector_mecanico_fibra = ?,
  conector_rj45 = ?,
  pinzas_anclaje = ?,
  bridas = ?,
  grapas = ?,
  velas_silicon = ?,
  pies_tubo = ?,
  rollos_cable_dulce = ?,
  clavos = ?,
  tornillos = ?,
  abrazaderas = ?,
  notas_instalacion = ?,
  latitud = ?,
  longitud = ?,
  fecha_actualizacion = NOW()
WHERE id_instalacion = ?
```

## Diferencia con Endpoints Existentes

- **`/api/insertar-instalacion`**: Crea nuevas instalaciones (INSERT)
- **`/api/actualizar-instalacion`**: Actualiza instalaciones existentes (UPDATE)

## Contexto de Uso

1. **Nueva Instalación**: Usuario crea una instalación desde cero → usa `/api/insertar-instalacion`
2. **Editar Instalación**: Usuario edita una instalación existente desde ConexionDetalles → usa `/api/actualizar-instalacion`
3. **Ver Materiales**: Usuario solo visualiza los datos en modo solo lectura → no hace llamadas de guardado

## Validaciones Sugeridas

1. Verificar que `id_instalacion` existe
2. Verificar que el usuario tiene permisos para editar esa instalación
3. Validar que `id_conexion` coincide con la instalación
4. Mantener auditoría de cambios (quién y cuándo actualizó)

## Testing

Para probar el endpoint:
```bash
curl -X PUT https://wellnet-rd.com:444/api/actualizar-instalacion \
  -H "Content-Type: application/json" \
  -d '{
    "id_instalacion": 1237,
    "notas_config": "Configuración de prueba actualizada",
    "router_wifi": "Router actualizado",
    "tornillos": "15"
  }'
```

## Prioridad
**ALTA** - Necesario para evitar crear instalaciones duplicadas cuando se editan instalaciones existentes.