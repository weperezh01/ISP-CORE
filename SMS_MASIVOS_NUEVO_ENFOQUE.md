# SMS Masivos - Nuevo Enfoque de Interfaz

## Cambios Implementados en Frontend

Hemos rediseñado completamente la pantalla de SMS masivos con un enfoque más flexible y user-friendly. A continuación se detallan los cambios y nuevos requerimientos para el backend.

## 🔄 Cambio de Paradigma

### **ANTES (Sistema Antiguo)**
- Selección exclusiva de UN grupo
- Envío masivo solo a todos los clientes de ese grupo
- No había persistencia de selecciones individuales

### **AHORA (Sistema Nuevo)**
- **Búsqueda individual de clientes** con persistencia
- **Filtros de grupo** como herramienta auxiliar (no exclusiva)
- **Selección híbrida**: Clientes individuales + clientes de filtros de grupo
- **Selección masiva** con control granular

## 📱 Nueva Arquitectura de UI

### 1. **Componente: Filtro Avanzado por Grupos** (`GroupSelector`)
- Los grupos ahora funcionan como **filtros**, no como selecciones exclusivas
- Al aplicar un filtro, se **cargan automáticamente** todos los clientes del grupo
- El usuario puede **activar/desactivar** filtros
- **Múltiples filtros** pueden estar activos (aunque actualmente solo uno a la vez)

### 2. **Componente: Búsqueda y Selección Individual** (`ClienteSearchSelector`)
- **Barra de búsqueda** estilo Google con debounce
- Búsqueda por: `ID`, `cédula`, `teléfono`, `nombres`, `apellidos`, `RNC`, `pasaporte`, `IP`
- Clientes seleccionados **persisten** al cambiar búsquedas
- **Lista unificada** que muestra: Clientes del filtro + Clientes seleccionados individualmente
- **Información detallada** de cada cliente en los resultados (ID, documentos, teléfonos adicionales)

### 3. **Selección Masiva Inteligente**
- Botón "**Seleccionar Todos**": Selecciona todos los clientes visibles (filtro + individuales)
- Botón "**Deseleccionar Todos**": Deselecciona solo los clientes visibles
- **Persistencia**: Los clientes seleccionados individualmente se mantienen aunque cambies filtros

## 🔧 Nuevos Endpoints Requeridos

### 1. **Endpoint: Búsqueda de Clientes**
```http
GET /api/clientes/search?q={query}
```

**Parámetros:**
- `q`: Término de búsqueda (mínimo 2 caracteres)

**Buscar en:**
- `id_cliente` (EXACT match)
- `cedula` (LIKE %query%)
- `nombre` (LIKE %query%)
- `apellido` (LIKE %query%)
- `nombre_completo` (LIKE %query%)
- `telefono1` (LIKE %query%)
- `telefono2` (LIKE %query%)
- `rnc` (LIKE %query%)
- `pasaporte` (LIKE %query%)
- `direccion_ipv4` (LIKE %query%)

**Response esperado:**
```json
{
  "success": true,
  "clientes": [
    {
      "id_cliente": 123,
      "nombre_completo": "Juan Pérez",
      "telefono1": "809-555-1234",
      "telefono2": "809-555-5678",
      "direccion_ipv4": "192.168.1.100",
      "cedula": "001-1234567-8",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rnc": "101-12345-6",
      "pasaporte": "AB123456"
    }
  ]
}
```

### 2. **Endpoint: Envío a Clientes Seleccionados Individualmente**
```http
POST /api/sms-campaigns-simple/send-individual
```

**Body esperado:**
```json
{
  "clientes_ids": [123, 456, 789],
  "titulo": "Título del SMS",
  "mensaje": "Contenido del mensaje con {cliente} variables"
}
```

**🆕 IMPORTANTE - Soporte de Variables:**
El campo `mensaje` ahora puede contener **variables de plantilla** que deben ser reemplazadas automáticamente con datos específicos de cada cliente antes del envío.

**Variables Soportadas** (idénticas a SMS recordatorios):
```
{cliente}             → Nombre completo del cliente
{monto}               → Monto de la factura con formato (ej: RD$1,200.00)
{fecha_vencimiento}   → Fecha de vencimiento de la factura
{dias_gracia}         → Días de gracia configurados
{isp_nombre}          → Nombre del ISP/empresa
{id_factura}          → Número de ID de la factura
```

**Ejemplo de mensaje con variables:**
```
"Hola {cliente}, tu factura #{id_factura} de {monto} vence el {fecha_vencimiento}. Paga antes para evitar corte. - {isp_nombre}"
```

**Procesamiento Backend Requerido:**
- El backend debe **detectar** las variables en el mensaje
- **Reemplazar cada variable** con los datos específicos del cliente antes del envío
- Si una variable no tiene datos para un cliente, **manejar graciosamente** (ej: omitir o usar valor por defecto)

**Response esperado:**
```json
{
  "success": true,
  "mensaje": "SMS enviado exitosamente",
  "estadisticas": {
    "total_enviados": 3,
    "exitosos": 3,
    "fallidos": 0,
    "errores": []
  }
}
```

## 🔄 Endpoints Existentes que Requieren Ajustes

### 1. **Mantener:** `/api/sms-campaigns-simple/groups`
- ✅ **No requiere cambios**
- Se sigue usando para mostrar los filtros disponibles

### 2. **Mantener:** `/api/sms-campaigns-simple/preview`  
- ✅ **No requiere cambios**
- Se usa para cargar clientes cuando se aplica un filtro de grupo

### 3. **Evaluar:** `/api/sms-campaigns-simple/send`
- 🤔 **Posiblemente deprecated** 
- El nuevo flujo usa `/send-individual` con IDs específicos
- ¿Mantener para compatibilidad o migrar completamente?

## 🎯 Flujo de Usuario Detallado

### **Escenario 1: Solo Búsqueda Individual**
1. Usuario busca "Juan" → Se muestran resultados
2. Usuario selecciona "Juan Pérez" → Se agrega a la lista de seleccionados
3. Usuario busca "María" → "Juan Pérez" sigue visible en seleccionados
4. Usuario selecciona "María González" → Ahora tiene 2 clientes seleccionados
5. Usuario envía SMS → `POST /send-individual` con `[123, 456]`

### **Escenario 2: Solo Filtro de Grupo**
1. Usuario selecciona filtro "Por Estado" → "Activos"
2. Se cargan automáticamente 50 clientes del grupo "Activos"
3. Usuario selecciona todos → 50 clientes seleccionados
4. Usuario envía SMS → `POST /send-individual` con `[1,2,3...50]`

### **Escenario 3: Híbrido (Filtro + Individual)**
1. Usuario aplica filtro "Router A" → Se cargan 30 clientes
2. Usuario selecciona todos del filtro → 30 clientes seleccionados
3. Usuario busca individualmente "Pedro López"
4. Usuario agrega "Pedro López" → Ahora tiene 31 clientes (30 del filtro + 1 individual)
5. Usuario envía SMS → `POST /send-individual` con `[1,2,3...30,156]`

### **Escenario 4: Deselección Inteligente**
1. Usuario tiene filtro activo con 30 clientes seleccionados
2. Usuario busca y agrega 2 clientes individuales → Total: 32 clientes
3. Usuario hace clic "Deseleccionar Todos" → Solo deselecciona los 30 del filtro visible
4. Usuario mantiene los 2 clientes individuales seleccionados

## ⚠️ Consideraciones Técnicas para Backend

### **Rendimiento**
- La búsqueda debe ser **rápida** (índices en campos de búsqueda)
- Limitar resultados de búsqueda (ej: máximo 20 resultados)
- Considerar **paginación** si hay muchos resultados

### **Validación**
- Validar que todos los `clientes_ids` existan y pertenezcan al ISP del usuario
- Validar límites de SMS (evitar spam masivo)
- Validar que los clientes tengan números de teléfono válidos

### **Logging**
- Log detallado del envío individual para debugging
- Identificar qué clientes vinieron de filtros vs selección individual

### **Backwards Compatibility**
- ¿Mantener endpoints antiguos para otras partes del sistema?
- ¿Migrar completamente o soportar ambos enfoques?

## 🚀 Beneficios del Nuevo Enfoque

1. **Flexibilidad máxima**: Combina lo mejor de ambos mundos
2. **UX mejorada**: Búsqueda intuitiva + filtros potentes
3. **Control granular**: El usuario decide exactamente a quién enviar
4. **Persistencia**: Las selecciones no se pierden al navegar
5. **Escalabilidad**: Funciona tanto para 1 cliente como para 1000

## 🆕 Actualización: Búsqueda Ampliada

**NUEVO REQUERIMIENTO**: La búsqueda ahora debe incluir **todos** los campos de identificación del cliente:

### **Campos de búsqueda requeridos:**
1. **ID Cliente** (búsqueda exacta)
2. **Cédula** (búsqueda parcial)
3. **Nombres** (búsqueda parcial)
4. **Apellidos** (búsqueda parcial)
5. **Teléfono 1** (búsqueda parcial)
6. **Teléfono 2** (búsqueda parcial)
7. **RNC** (búsqueda parcial)
8. **Pasaporte** (búsqueda parcial)
9. **IP** (búsqueda parcial)

### **Response ampliado:**
El endpoint debe retornar **todos** estos campos para mostrar información completa en la UI.

## 🆕 Nueva Funcionalidad: Variables en SMS Masivos

**NUEVA IMPLEMENTACIÓN REQUERIDA**: El frontend ahora soporta variables de plantilla en SMS masivos, utilizando las mismas variables que SMS recordatorios.

### **🔧 Cambios Necesarios en Backend:**

1. **Modificar endpoint `/send-individual`** para procesar variables:
   - Detectar variables en el campo `mensaje` usando regex: `/{([^}]+)}/g`
   - Por cada cliente en `clientes_ids`, reemplazar variables con sus datos específicos
   - Enviar SMS personalizado a cada cliente

2. **Reutilizar lógica existente de SMS recordatorios:**
   - Usar la misma función de reemplazo de variables
   - Aplicar las mismas reglas de manejo de datos faltantes
   - Mantener consistencia en formato de datos

3. **Variables a procesar** (deben coincidir exactamente):
   ```javascript
   {cliente}             // nombre_completo del cliente
   {monto}               // monto de factura activa con formato
   {fecha_vencimiento}   // fecha_vencimiento de factura activa
   {dias_gracia}         // días_gracia configurados para el ISP
   {isp_nombre}          // nombre del ISP
   {id_factura}          // id de la factura activa del cliente
   ```

### **⚠️ Consideraciones Importantes:**
- Si un cliente no tiene factura activa, ¿omitir del envío o usar valores por defecto?
- El procesamiento puede ser más lento con variables (personalización por cliente)
- Logs detallados para debugging de variables faltantes
- Testing exhaustivo con diferentes combinaciones de variables

## 📋 Checklist para Backend (Actualizado)

- [x] ~~Implementar `GET /api/clientes/search`~~ ✅ **HECHO**
- [ ] **AMPLIAR búsqueda a todos los campos de identificación** ⚠️ **PENDIENTE**
- [x] ~~Implementar `POST /api/sms-campaigns-simple/send-individual`~~ ✅ **HECHO**
- [ ] **🆕 AGREGAR procesamiento de variables en `/send-individual`** 🔥 **NUEVO REQUERIMIENTO**
- [x] ~~Optimizar índices de BD para búsqueda rápida~~ ✅ **HECHO**
- [ ] **Actualizar índices para nuevos campos de búsqueda** ⚠️ **PENDIENTE**
- [x] ~~Validar permisos de ISP en búsqueda~~ ✅ **HECHO**
- [x] ~~Validar límites de envío masivo~~ ✅ **HECHO**
- [x] ~~Testing de rendimiento con búsquedas~~ ✅ **HECHO**
- [x] ~~Decidir fate del endpoint `/send` original~~ ✅ **HECHO** (mantener compatibilidad)
- [x] ~~Actualizar logs para nuevo flujo~~ ✅ **HECHO**
- [ ] **Actualizar response del search con todos los campos** ⚠️ **PENDIENTE**
- [ ] **🆕 Testing de variables en SMS masivos** 🔥 **NUEVO REQUERIMIENTO**

## 💡 Próximos Pasos Sugeridos

1. **Implementar búsqueda** como primera prioridad
2. **Implementar envío individual** 
3. **Testing extensivo** con diferentes volúmenes
4. **Optimización** basada en uso real
5. **Consideraciones futuras**: ¿Favoritos? ¿Listas personalizadas?

---

## 📅 **Historial de Actualizaciones**

### **Versión 1.0** - Implementación inicial
- Sistema híbrido de selección de clientes
- Búsqueda individual + filtros de grupo
- Endpoints básicos de búsqueda y envío

### **Versión 1.1** - Búsqueda ampliada
- Búsqueda por ID, cédula, nombres, apellidos, RNC, pasaporte, IP
- UI mejorada con información detallada de clientes

### **Versión 1.2** - Soporte de Variables ⭐ **ACTUAL**
- Integración de variables de SMS recordatorios
- Mensajes personalizados y dinámicos
- Reemplazo automático de variables por datos del cliente

---

**Nota para el desarrollador backend**: Esta nueva interfaz está **completamente implementada en frontend** y funcionando. El backend necesita implementar:
1. **Búsqueda ampliada** por todos los campos de identificación
2. **🆕 Procesamiento de variables** en mensajes SMS masivos

La interfaz antigua sigue funcionando para compatibilidad durante la transición.