# SOLICITUD PARA BACKEND - ENDPOINT DE INSTALACIÓN

## Problema Detectado
El endpoint `POST https://wellnet-rd.com:444/api/instalacion` con `{ id_instalacion: X }` no está devolviendo todos los campos necesarios para mostrar los materiales y equipos en el formulario de instalación.

## Campos Requeridos que NO se están cargando
Actualmente solo se cargan las coordenadas (`latitud`, `longitud`) y las notas (`notas_config`, `notas_instalacion`), pero faltan:

### Equipos:
- `router_wifi`
- `router_onu` 
- `serial_onu`
- `radios`

### Materiales:
- `pies_utp_cat5`
- `pies_utp_cat6`
- `pies_drop_fibra`
- `conector_mecanico_fibra`
- `conector_rj45`
- `pinzas_anclaje`
- `bridas`
- `grapas`
- `velas_silicon`
- `pies_tubo`
- `rollos_cable_dulce`
- `clavos`
- `tornillos`
- `abrazaderas`

## Solicitud
Por favor verifica que el endpoint `POST https://wellnet-rd.com:444/api/instalacion` devuelva TODOS estos campos en la respuesta cuando se consulta por `id_instalacion`.

## Estructura Esperada de Respuesta
```json
{
  "id_instalacion": 123,
  "notas_config": "...",
  "notas_instalacion": "...",
  "latitud": "18.4861",
  "longitud": "-69.9312",
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
  "abrazaderas": "8"
}
```

## Contexto
Estamos implementando una funcionalidad para que cuando el usuario presione "Ver Materiales" en los detalles de conexión, pueda ver todos los materiales y equipos utilizados en esa instalación específica, pero en modo solo lectura.

## Prueba
Para verificar que funciona, puedes probar con el `id_instalacion` que esté siendo usado en el frontend y confirmar que todos los campos se devuelven correctamente.