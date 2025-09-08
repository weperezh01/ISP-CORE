# WellNet - API Requirements para Gestión de Planes de Suscripción

## 📋 Resumen Ejecutivo

Se ha implementado completamente el **frontend para gestión de planes de suscripción** en la aplicación WellNet. Necesitamos las APIs del backend para que los **MEGA ADMINISTRADORES** puedan crear, editar y eliminar planes de suscripción.

## 🎯 Funcionalidad Implementada en Frontend

### Pantallas Desarrolladas:
- ✅ **PlanManagementScreen**: CRUD completo para planes
- ✅ **Botón en MainScreen**: Solo visible para MEGA ADMINISTRADORES
- ✅ **Navegación integrada**: Registrada en App.tsx

### Operaciones Frontend Disponibles:
- ✅ **Crear planes** con formulario completo
- ✅ **Editar planes** con datos pre-cargados
- ✅ **Eliminar planes** con confirmación
- ✅ **Listar planes** con diseño profesional
- ✅ **Validación de formularios** y manejo de errores

## 🔒 Control de Acceso

### **Validación Requerida:**
- **SOLO usuarios con `nivel_usuario = 'MEGA ADMINISTRADOR'`** pueden acceder a estas APIs
- El frontend ya valida roles desde AsyncStorage
- El backend debe validar en cada endpoint

### **Estructura de Usuario:**
```sql
-- Tabla usuarios existente
usuarios (
    id,
    nivel_usuario, -- 'MEGA ADMINISTRADOR', 'SUPER ADMINISTRADOR', etc.
    nombre,
    email,
    ...
)
```

---

## 🛠️ APIs Requeridas

### 1. **Listar Todos los Planes**

#### `GET /api/subscription-plans`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Validación de seguridad:**
- Verificar que el token corresponda a un MEGA ADMINISTRADOR
- Solo MEGA ADMIN puede ver todos los planes

**Response exitoso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Básico",
      "price": 25.00,
      "connectionLimit": 200,
      "pricePerConnection": 0.125,
      "features": [
        "Hasta 200 conexiones",
        "Gestión completa de conexiones",
        "Facturación avanzada",
        "Reportes detallados",
        "Soporte por chat"
      ],
      "recommended": false,
      "isActive": true,
      "createdAt": "2025-01-12T00:00:00Z",
      "updatedAt": "2025-01-12T00:00:00Z"
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 75.00,
      "connectionLimit": 1000,
      "pricePerConnection": 0.075,
      "features": [
        "Hasta 1000 conexiones",
        "Dashboard personalizado",
        "Reportes exportables",
        "Integración WhatsApp/SMS",
        "Soporte telefónico"
      ],
      "recommended": true,
      "isActive": true,
      "createdAt": "2025-01-12T00:00:00Z",
      "updatedAt": "2025-01-12T00:00:00Z"
    }
  ]
}
```

**Response error (403):**
```json
{
  "success": false,
  "message": "Acceso denegado. Solo MEGA ADMINISTRADORES pueden gestionar planes."
}
```

---

### 2. **Crear Nuevo Plan**

#### `POST /api/subscription-plans`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Enterprise",
  "price": 180.00,
  "connectionLimit": 3500,
  "pricePerConnection": 0.051,
  "features": [
    "Hasta 3500 conexiones",
    "White-label solution",
    "Integraciones personalizadas",
    "SLA garantizado 99.9%",
    "Soporte 24/7"
  ],
  "recommended": false
}
```

**Validaciones requeridas:**
- `name` requerido, mínimo 3 caracteres
- `price` requerido, número positivo
- `pricePerConnection` requerido, número positivo
- `connectionLimit` opcional, número entero positivo o null
- `features` array de strings, mínimo 1 feature
- `recommended` boolean, default false
- Solo un plan puede ser `recommended: true` a la vez

**Response exitoso (201):**
```json
{
  "success": true,
  "message": "Plan creado exitosamente",
  "data": {
    "id": "enterprise",
    "name": "Enterprise",
    "price": 180.00,
    "connectionLimit": 3500,
    "pricePerConnection": 0.051,
    "features": [
      "Hasta 3500 conexiones",
      "White-label solution",
      "Integraciones personalizadas",
      "SLA garantizado 99.9%",
      "Soporte 24/7"
    ],
    "recommended": false,
    "isActive": true,
    "createdAt": "2025-01-12T10:30:00Z",
    "updatedAt": "2025-01-12T10:30:00Z"
  }
}
```

**Response error (400):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "name": "El nombre es requerido",
    "price": "El precio debe ser un número positivo"
  }
}
```

---

### 3. **Actualizar Plan Existente**

#### `PUT /api/subscription-plans/{planId}`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request body:** (igual que crear)
```json
{
  "name": "Enterprise Pro",
  "price": 199.00,
  "connectionLimit": null,
  "pricePerConnection": 0.045,
  "features": [
    "Conexiones ilimitadas",
    "White-label solution",
    "Integraciones personalizadas",
    "SLA garantizado 99.9%",
    "Soporte 24/7",
    "Account manager dedicado"
  ],
  "recommended": true
}
```

**Validaciones adicionales:**
- Verificar que el plan existe
- No permitir actualizar planes que están siendo usados por ISPs activos (opcional)
- Si se marca como `recommended: true`, desmarcar otros planes

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Plan actualizado exitosamente",
  "data": {
    "id": "enterprise",
    "name": "Enterprise Pro",
    "price": 199.00,
    "connectionLimit": null,
    "pricePerConnection": 0.045,
    "features": [
      "Conexiones ilimitadas",
      "White-label solution",
      "Integraciones personalizadas", 
      "SLA garantizado 99.9%",
      "Soporte 24/7",
      "Account manager dedicado"
    ],
    "recommended": true,
    "isActive": true,
    "createdAt": "2025-01-12T10:30:00Z",
    "updatedAt": "2025-01-12T15:45:00Z"
  }
}
```

**Response error (404):**
```json
{
  "success": false,
  "message": "Plan no encontrado"
}
```

---

### 4. **Eliminar Plan**

#### `DELETE /api/subscription-plans/{planId}`

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Validaciones requeridas:**
- Verificar que el plan existe
- **NO permitir eliminar si hay ISPs activos usando este plan**
- Verificar que no es el único plan activo

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Plan eliminado exitosamente"
}
```

**Response error (409):**
```json
{
  "success": false,
  "message": "No se puede eliminar el plan. Hay 5 ISPs activos usando este plan.",
  "details": {
    "activeSubscriptions": 5,
    "ispIds": [123, 124, 125, 126, 127]
  }
}
```

---

### 5. **Activar/Desactivar Plan**

#### `PATCH /api/subscription-plans/{planId}/toggle-status`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request body:**
```json
{
  "isActive": false
}
```

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Estado del plan actualizado exitosamente",
  "data": {
    "id": "basic",
    "isActive": false
  }
}
```

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `subscription_plans`**

```sql
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    connection_limit INT NULL, -- NULL = unlimited
    price_per_connection DECIMAL(10,4) NOT NULL,
    features JSON NOT NULL,
    recommended BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL, -- FK a usuarios.id (MEGA ADMIN que lo creó)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    INDEX idx_active (is_active),
    INDEX idx_recommended (recommended),
    INDEX idx_price (price)
);
```

### **Datos Iniciales (Seeder):**

```sql
INSERT INTO subscription_plans (id, name, price, connection_limit, price_per_connection, features, recommended, created_by) VALUES
('free', 'Gratis', 0.00, 50, 0.000, '["Hasta 50 conexiones", "Gestión básica", "Soporte email"]', false, 1),
('basic', 'Básico', 25.00, 200, 0.125, '["Hasta 200 conexiones", "Gestión completa", "Facturación avanzada", "Reportes detallados", "Soporte chat"]', false, 1),
('standard', 'Estándar', 45.00, 500, 0.090, '["Hasta 500 conexiones", "API integración", "Analytics tiempo real", "Múltiples usuarios", "Backup automático", "Soporte prioritario"]', true, 1),
('premium', 'Premium', 75.00, 1000, 0.075, '["Hasta 1000 conexiones", "Dashboard personalizado", "Reportes exportables", "Integración WhatsApp/SMS", "Multi-ISP management", "Soporte telefónico"]', false, 1),
('professional', 'Professional', 120.00, 2000, 0.060, '["Hasta 2000 conexiones", "AI-powered analytics", "Facturación automática", "Portal clientes", "Gestión inventario", "Account manager dedicado"]', false, 1),
('enterprise', 'Enterprise', 180.00, 3500, 0.051, '["Hasta 3500 conexiones", "White-label solution", "Integraciones personalizadas", "SLA garantizado 99.9%", "Formación personalizada", "Soporte 24/7"]', false, 1),
('unlimited', 'Ilimitado', 299.00, NULL, 0.000, '["Conexiones ilimitadas", "Todo incluido", "Infraestructura escalable", "Desarrollo prioritario", "Soporte enterprise", "Implementación on-site"]', false, 1);
```

---

## 🔧 Funciones Auxiliares Requeridas

### 1. **Validación de Permisos**

```php
function validateMegaAdminAccess($userId) {
    $query = "SELECT COUNT(*) as is_mega_admin
              FROM usuarios
              WHERE id = ? AND nivel_usuario = 'MEGA ADMINISTRADOR'";
    
    $result = executeQuery($query, [$userId]);
    
    if ($result['is_mega_admin'] == 0) {
        throw new UnauthorizedException('Solo MEGA ADMINISTRADORES pueden gestionar planes');
    }
    
    return true;
}
```

### 2. **Generar ID único para plan**

```php
function generatePlanId($planName) {
    $baseId = strtolower(str_replace(' ', '_', trim($planName)));
    $baseId = preg_replace('/[^a-z0-9_]/', '', $baseId);
    
    // Verificar si existe
    $counter = 1;
    $finalId = $baseId;
    
    while (planExists($finalId)) {
        $finalId = $baseId . '_' . $counter;
        $counter++;
    }
    
    return $finalId;
}
```

### 3. **Validar plan único como recomendado**

```php
function setRecommendedPlan($planId) {
    // Primero quitar recommended de todos
    $query1 = "UPDATE subscription_plans SET recommended = FALSE";
    executeQuery($query1);
    
    // Luego marcar el nuevo como recommended
    $query2 = "UPDATE subscription_plans SET recommended = TRUE WHERE id = ?";
    executeQuery($query2, [$planId]);
}
```

### 4. **Verificar si plan está en uso**

```php
function isPlanInUse($planId) {
    $query = "SELECT COUNT(*) as usage_count
              FROM isp_subscriptions 
              WHERE plan_id = ? AND status = 'active'";
    
    $result = executeQuery($query, [$planId]);
    return $result['usage_count'] > 0;
}
```

---

## ⚡ Endpoints de Integración con Sistema Existente

### **Obtener Planes Disponibles para ISP**

#### `GET /api/subscription-plans/available`
- Solo planes activos (`is_active = true`)
- Para uso en pantallas de selección de plan de ISPs
- No requiere permisos de MEGA ADMIN

---

## 🚀 Implementación Sugerida

### **Prioridad Alta (1-2 días):**
1. ✅ Crear tabla `subscription_plans`
2. ✅ Implementar GET `/api/subscription-plans` (listar)
3. ✅ Implementar POST `/api/subscription-plans` (crear)
4. ✅ Validación de permisos MEGA ADMIN

### **Prioridad Media (1 día):**
5. ✅ Implementar PUT `/api/subscription-plans/{id}` (actualizar)
6. ✅ Implementar DELETE `/api/subscription-plans/{id}` (eliminar)
7. ✅ Validaciones de integridad (plan en uso)

### **Prioridad Baja (opcional):**
8. ✅ PATCH toggle status
9. ✅ Logs de auditoría para cambios de planes
10. ✅ Reportes de uso de planes

---

## 📱 Frontend Ya Implementado

### **Pantallas Completadas:**
- ✅ `PlanManagementScreen` - CRUD completo de planes
- ✅ Formularios con validación completa
- ✅ UI profesional con Material Icons
- ✅ Manejo de errores y loading states
- ✅ Confirmaciones de eliminación
- ✅ Soporte para tema claro/oscuro

### **Funciones Frontend Preparadas:**
- ✅ `createPlan()` - Crear nuevo plan
- ✅ `updatePlan()` - Actualizar plan existente
- ✅ `deletePlan()` - Eliminar plan con confirmación
- ✅ Validaciones de formulario
- ✅ Manejo de estados de carga

---

## 🔒 Seguridad y Logging

### **Validaciones Críticas:**
1. **Token válido** en todas las requests
2. **Usuario MEGA ADMINISTRADOR** verificado en backend
3. **Rate limiting** para prevenir spam
4. **Input sanitization** para prevenir inyección

### **Logging Requerido:**
```sql
-- Log de auditoría para cambios de planes
CREATE TABLE plan_audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id VARCHAR(50) NOT NULL,
    action ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL,
    admin_user_id INT NOT NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_user_id) REFERENCES usuarios(id),
    INDEX idx_plan_action (plan_id, action),
    INDEX idx_admin_date (admin_user_id, created_at)
);
```

---

## 📞 Contacto para Dudas

**Frontend Lead**: Implementación completa lista
**Archivos principales**: 
- `/src/pantallas/billing/PlanManagementScreen.tsx`
- `/src/pantallas/superAdmin/MainScreen.tsx` (botón añadido)
- `/src/config/subscriptionPlans.tsx` (estructura de datos)

### **Estado Actual:**
- ✅ **Frontend 100% completado**
- ✅ **Navegación integrada**
- ✅ **Validaciones implementadas**
- ⏳ **Esperando APIs del backend**

---

**¿Alguna duda sobre la implementación o necesitas ajustes en algún endpoint?**