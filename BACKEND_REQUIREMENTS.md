# WellNet - Requerimientos Backend para Sistema de Suscripciones

## 📋 Resumen Ejecutivo

Se ha implementado un **sistema completo de facturación por conexiones** para ISPs en el frontend de WellNet. Necesitamos las APIs del backend para que funcione completamente.

## 🎯 Modelo de Negocio

- **Facturación**: Por conexiones activas/suspendidas (no por clientes)
- **Target**: ISPs dominicanos con 50-2000+ conexiones
- **Precios**: $0.051 a $0.125 USD por conexión/mes
- **Planes**: 7 niveles desde Gratis hasta Enterprise

## 👥 Estructura de Usuarios y Facturación

### **Quién se factura:**
- **SOLO usuarios con `estado_usuario = 'SUPER ADMINISTRADOR'`** en la tabla `usuarios`
- Estos son los **dueños/administradores principales** de cada ISP
- Un SUPER ADMINISTRADOR puede tener múltiples ISPs asociadas

### **Relación de Datos:**
```
usuarios (estado_usuario = 'SUPER ADMINISTRADOR')
    ↓ (usuario_id)
usuarios_isp (relación usuario-ISP)
    ↓ (isp_id)
conexiones (todas las conexiones de esa ISP)
```

### **Flujo de Facturación:**
1. Identificar usuarios SUPER ADMINISTRADOR
2. Obtener sus ISPs desde `usuarios_isp`
3. Contar conexiones activas/suspendidas por ISP
4. Facturar a cada ISP del SUPER ADMINISTRADOR

---

## 📊 Planes de Suscripción

| Plan | Precio | Conexiones | $/Conexión | Target |
|------|--------|------------|------------|---------|
| Gratis | $0 | 50 | $0 | Prueba |
| Básico | $25 | 200 | $0.125 | ISP Rural |
| Estándar | $45 | 500 | $0.09 | ISP Mediano |
| Premium | $75 | 1000 | $0.075 | ISP Grande |
| Professional | $120 | 2000 | $0.06 | ISP Establecido |
| Enterprise | $180 | 3500 | $0.051 | ISP Corporativo |
| Ilimitado | $299 | ∞ | $0 | Multi-ISP |

---

## 🔧 APIs Requeridas

### 1. **Gestión de Planes**

#### `GET /api/subscription-plans`
Obtener todos los planes disponibles
```json
{
  "plans": [
    {
      "id": "basic",
      "name": "Básico",
      "price": 25,
      "connectionLimit": 200,
      "pricePerConnection": 0.125,
      "features": ["Gestión completa", "Soporte chat", ...]
    }
  ]
}
```

### 2. **Conteo de Conexiones por ISP**

#### `POST /api/isp-connection-count`
Contar conexiones activas y suspendidas de un ISP
```json
// Request
{
  "ispId": "123"
}

// Response
{
  "ispId": "123",
  "activeConnections": 147,
  "suspendedConnections": 23,
  "totalConnections": 170,
  "superAdminUserId": "456", // Usuario SUPER ADMIN dueño de esta ISP
  "lastUpdated": "2025-01-12T10:30:00Z"
}
```

#### `GET /api/super-admin-isps/{userId}`
Obtener todas las ISPs de un SUPER ADMINISTRADOR
```json
// Response
{
  "userId": "456",
  "userRole": "SUPER ADMINISTRADOR",
  "isps": [
    {
      "ispId": "123",
      "ispName": "Internet Rural RD",
      "totalConnections": 170,
      "subscriptionStatus": "active"
    },
    {
      "ispId": "124", 
      "ispName": "WifiMax Santiago",
      "totalConnections": 89,
      "subscriptionStatus": "active"
    }
  ]
}
```

### 3. **Suscripción Actual del ISP**

#### `GET /api/isp-subscription/{ispId}`
Obtener suscripción actual del ISP
```json
{
  "ispId": "123",
  "planId": "basic",
  "status": "active",
  "currentConnections": 170,
  "connectionLimit": 200,
  "monthlyPrice": 25,
  "pricePerConnection": 0.125,
  "billingCycle": "monthly",
  "nextBillingDate": "2025-02-12",
  "daysUntilRenewal": 31,
  "createdAt": "2025-01-12T00:00:00Z"
}
```

### 4. **Cambio de Plan**

#### `POST /api/isp-subscription/upgrade`
Cambiar plan de suscripción
```json
// Request
{
  "ispId": "123",
  "newPlanId": "premium",
  "effectiveDate": "2025-01-12"
}

// Response
{
  "success": true,
  "oldPlanId": "basic",
  "newPlanId": "premium",
  "effectiveDate": "2025-01-12",
  "prorationAmount": 15.50,
  "nextBillingAmount": 75
}
```

### 5. **Historial de Facturación**

#### `GET /api/isp-billing-history/{ispId}`
Obtener historial de pagos
```json
{
  "bills": [
    {
      "id": "bill_001",
      "ispId": "123",
      "planId": "basic",
      "billingPeriod": "2025-01",
      "connectionsCount": 170,
      "amount": 25,
      "status": "paid",
      "paidAt": "2025-01-05T00:00:00Z",
      "dueDate": "2025-01-31T23:59:59Z"
    }
  ]
}
```

### 6. **Validación de Límites**

#### `POST /api/isp-connection-limit-check`
Verificar si ISP puede agregar más conexiones
```json
// Request
{
  "ispId": "123"
}

// Response
{
  "canAddConnections": true,
  "currentConnections": 170,
  "connectionLimit": 200,
  "availableSlots": 30,
  "usagePercentage": 85
}
```

---

## 🗄️ Estructura de Base de Datos

### **Relaciones Existentes (NO MODIFICAR):**
```sql
-- Tabla usuarios (ya existe)
usuarios (
    id,
    estado_usuario, -- 'SUPER ADMINISTRADOR', 'ADMIN', etc.
    ...
)

-- Tabla usuarios_isp (ya existe) 
usuarios_isp (
    usuario_id, -- FK a usuarios.id
    isp_id,     -- FK a isps.id
    ...
)

-- Tabla conexiones (ya existe)
conexiones (
    id,
    isp_id,     -- FK a isps.id
    status,     -- 'active', 'suspended', 'cancelled', etc.
    ...
)
```

### **Nuevas Tablas Requeridas:**

### Tabla: `isp_subscriptions`
```sql
CREATE TABLE isp_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isp_id INT NOT NULL,
    super_admin_user_id INT NOT NULL, -- Usuario SUPER ADMIN responsable
    plan_id VARCHAR(50) NOT NULL,
    status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
    started_at TIMESTAMP NOT NULL,
    next_billing_date DATE NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    connection_limit INT NULL, -- NULL = unlimited
    price_per_connection DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (isp_id) REFERENCES isps(id),
    FOREIGN KEY (super_admin_user_id) REFERENCES usuarios(id),
    INDEX idx_isp_status (isp_id, status),
    INDEX idx_super_admin (super_admin_user_id)
);
```

### Tabla: `subscription_plans`
```sql
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    connection_limit INT NULL, -- NULL = unlimited
    price_per_connection DECIMAL(10,4) NOT NULL,
    features JSON NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `billing_history`
```sql
CREATE TABLE billing_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isp_id INT NOT NULL,
    super_admin_user_id INT NOT NULL, -- Usuario SUPER ADMIN responsable del pago
    subscription_id INT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    billing_period VARCHAR(7) NOT NULL, -- YYYY-MM
    connections_count INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (isp_id) REFERENCES isps(id),
    FOREIGN KEY (super_admin_user_id) REFERENCES usuarios(id),
    FOREIGN KEY (subscription_id) REFERENCES isp_subscriptions(id),
    INDEX idx_isp_period (isp_id, billing_period),
    INDEX idx_super_admin_billing (super_admin_user_id, billing_period)
);
```

---

## ⚡ Funciones Auxiliares Requeridas

### 1. **Conteo de Conexiones por ISP**
```sql
-- Función para contar conexiones activas/suspendidas por ISP
SELECT COUNT(*) as total_connections 
FROM conexiones 
WHERE isp_id = ? 
AND status IN ('active', 'suspended');
```

### 2. **Obtener ISPs de un SUPER ADMINISTRADOR**
```sql
-- Obtener todas las ISPs que maneja un SUPER ADMIN
SELECT 
    ui.isp_id,
    i.nombre as isp_name,
    COUNT(c.id) as total_connections
FROM usuarios u
JOIN usuarios_isp ui ON u.id = ui.usuario_id
JOIN isps i ON ui.isp_id = i.id
LEFT JOIN conexiones c ON i.id = c.isp_id 
    AND c.status IN ('active', 'suspended')
WHERE u.id = ? 
    AND u.estado_usuario = 'SUPER ADMINISTRADOR'
GROUP BY ui.isp_id, i.nombre;
```

### 3. **Validar Permisos de SUPER ADMIN**
```sql
-- Verificar que un usuario es SUPER ADMIN de una ISP específica
SELECT COUNT(*) as is_authorized
FROM usuarios u
JOIN usuarios_isp ui ON u.id = ui.usuario_id
WHERE u.id = ? 
    AND ui.isp_id = ?
    AND u.estado_usuario = 'SUPER ADMINISTRADOR';
```

### 4. **Cálculo de Facturación**
```php
function calculateMonthlyBill($ispId, $planId) {
    $plan = getSubscriptionPlan($planId);
    $connectionCount = getActiveConnectionCount($ispId);
    
    if ($plan->connection_limit === null) {
        return $plan->price; // Unlimited plan
    }
    
    if ($connectionCount <= $plan->connection_limit) {
        return $plan->price; // Within plan limits
    }
    
    // Over limit - charge per connection
    return $connectionCount * $plan->price_per_connection;
}
```

### 5. **Validación de Límites**
```php
function canAddConnection($ispId, $userId) {
    // Primero verificar que el usuario es SUPER ADMIN de esta ISP
    if (!isSuperAdminOfISP($userId, $ispId)) {
        return false;
    }
    
    $subscription = getCurrentSubscription($ispId);
    $currentCount = getActiveConnectionCount($ispId);
    
    if ($subscription->connection_limit === null) {
        return true; // Unlimited
    }
    
    return $currentCount < $subscription->connection_limit;
}

function isSuperAdminOfISP($userId, $ispId) {
    $query = "SELECT COUNT(*) as is_authorized
              FROM usuarios u
              JOIN usuarios_isp ui ON u.id = ui.usuario_id
              WHERE u.id = ? AND ui.isp_id = ?
                  AND u.estado_usuario = 'SUPER ADMINISTRADOR'";
    
    $result = executeQuery($query, [$userId, $ispId]);
    return $result['is_authorized'] > 0;
}
```

---

## 🔄 Procesos Automáticos

### 1. **Facturación Mensual (Cron Job)**
- **Frecuencia**: Primer día de cada mes a las 00:00 (timezone: America/Santo_Domingo)
- **Proceso**: 
  1. **Identificar SUPER ADMINISTRADORES activos**
     ```sql
     SELECT DISTINCT u.id, u.nombre, u.email 
     FROM usuarios u 
     WHERE u.estado_usuario = 'SUPER ADMINISTRADOR'
     ```
  
  2. **Por cada SUPER ADMIN, obtener sus ISPs**
     ```sql
     SELECT ui.isp_id, i.nombre as isp_name
     FROM usuarios_isp ui
     JOIN isps i ON ui.isp_id = i.id
     WHERE ui.usuario_id = ?
     ```
  
  3. **Por cada ISP, contar conexiones y calcular factura**
     ```sql
     SELECT COUNT(*) as total_connections 
     FROM conexiones 
     WHERE isp_id = ? AND status IN ('active', 'suspended')
     ```
  
  4. **Generar registro en `billing_history`** con:
     - isp_id
     - super_admin_user_id (dueño responsable)
     - connections_count
     - amount (calculado según plan)
  
  5. **Enviar email de factura al SUPER ADMIN** (no al ISP)

### 2. **Verificación de Límites (Tiempo Real)**
- **Trigger**: Al crear nueva conexión
- **Proceso**: Verificar límite antes de permitir creación

### 3. **Alertas de Uso (Diario)**
- **Proceso**: 
  1. ISPs al 90% de límite → Alerta por email
  2. ISPs sobre límite → Alerta urgente
  3. Sugerir upgrade de plan

---

## 🚀 Implementación Sugerida

### Fase 1: Base (2-3 días)
- [ ] Crear tablas de base de datos
- [ ] API de conteo de conexiones
- [ ] API de suscripción actual
- [ ] Validación de límites

### Fase 2: Gestión (2-3 días)
- [ ] API de cambio de planes
- [ ] Historial de facturación
- [ ] Proceso de facturación mensual

### Fase 3: Automatización (1-2 días)
- [ ] Cron jobs de facturación
- [ ] Sistema de alertas
- [ ] Reportes para administración

---

## 📱 Frontend Ya Implementado

### Pantallas Completadas:
- ✅ `SubscriptionDemo` - Vista de planes
- ✅ `SubscriptionDashboard` - Dashboard de uso
- ✅ `PlanSelectionScreen` - Selección/cambio de planes
- ✅ Integración con navegación principal

### Hooks/Utils Preparados:
- ✅ `useSubscription` - Hook para gestión de estado
- ✅ `subscriptionPlans.tsx` - Configuración de planes
- ✅ Funciones helper para cálculos

---

## 📞 Contacto para Dudas

**Frontend Lead**: [Tu nombre]
**Archivo de configuración**: `/src/config/subscriptionPlans.tsx`
**Pantallas principales**: `/src/pantallas/billing/`

### Notas Importantes:
1. **Conexiones = Activas + Suspendidas** (no incluir "cancelled" o "inactive")
2. **Facturación mensual** por adelantado
3. **Límites por plan** - bloquear creación de conexiones si excede
4. **Plan ilimitado** ($299) sin restricciones
5. **ISPs dominicanos** - considerar timezone America/Santo_Domingo

---

## 🔒 Seguridad y Permisos

### **Validaciones Críticas:**
1. **Solo SUPER ADMINISTRADORES** pueden:
   - Ver información de facturación
   - Cambiar planes de suscripción
   - Acceder a APIs de conexiones de sus ISPs

2. **Validación en cada API:**
   ```php
   function validateSuperAdminAccess($userId, $ispId) {
       $query = "SELECT COUNT(*) as authorized
                 FROM usuarios u
                 JOIN usuarios_isp ui ON u.id = ui.usuario_id
                 WHERE u.id = ? AND ui.isp_id = ?
                     AND u.estado_usuario = 'SUPER ADMINISTRADOR'";
       
       $result = executeQuery($query, [$userId, $ispId]);
       
       if ($result['authorized'] == 0) {
           throw new UnauthorizedException('Access denied');
       }
   }
   ```

3. **Logging de acciones:**
   - Registrar todos los cambios de plan
   - Log de consultas de facturación
   - Auditoría de pagos

### **Notas Importantes:**
- ✅ **Frontend implementado** con navegación funcional
- ✅ **Validación de permisos** requerida en backend
- ✅ **SUPER ADMINISTRADORES** son los únicos usuarios facturables
- ✅ **Conexiones activas/suspendidas** (NO cancelled/inactive)
- ✅ **Timezone**: America/Santo_Domingo para facturación
- ✅ **Multi-ISP**: Un SUPER ADMIN puede manejar múltiples ISPs

---

**Estado**: ✅ Frontend completado - Esperando APIs del backend