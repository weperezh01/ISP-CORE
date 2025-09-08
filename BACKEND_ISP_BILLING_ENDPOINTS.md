# 🚀 BACKEND - Endpoints del Sistema de Facturación ISP

## 📋 Resumen para el Agente Backend

El frontend del **Sistema de Facturación para ISP Owners** está completamente implementado y funcionando en modo demo. Necesitamos que implementes los siguientes endpoints del backend para activar la funcionalidad completa.

---

## 🎯 Endpoints Requeridos

### 1. **Facturas del ISP Owner**
```http
GET /api/isp-owner/invoices?isp_id={id}&page={page}&limit={limit}
Authorization: Bearer {token}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoice_number": "WTL-2025-07-0012",
        "isp_id": 12,
        "isp_name": "Well Net",
        "billing_period_start": "2025-07-18",
        "billing_period_end": "2025-08-17",
        "base_amount": "1200.00",
        "overage_amount": "0.00",
        "total_amount": "1200.00",
        "transactions_included": 1200,
        "transactions_used": 1129,
        "status": "pending",
        "created_at": "2025-07-15T18:00:00Z",
        "pdf_available": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 50
    },
    "summary": {
      "total_amount_pending": "1200.00",
      "total_amount_paid": "2400.00",
      "next_billing_date": "2025-08-18"
    }
  }
}
```

### 2. **Plan Actual del ISP**
```http
GET /api/isp-owner/current-plan?isp_id={id}
Authorization: Bearer {token}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "current_plan": {
      "id": "enterprise",
      "name": "Enterprise",
      "price": "1200.00",
      "connection_limit": 2000,
      "price_per_connection": "0.60"
    },
    "usage": {
      "connections_used": 1129,
      "connections_available": 871,
      "usage_percentage": 56.45
    },
    "billing_info": {
      "next_billing_date": "2025-08-18",
      "billing_day": 18,
      "estimated_next_amount": "1200.00"
    }
  }
}
```

### 3. **Detalles de Factura Individual**
```http
GET /api/isp-owner/invoices/{invoice_id}
Authorization: Bearer {token}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": 1,
      "invoice_number": "WTL-2025-07-0012",
      "isp_id": 12,
      "isp_name": "Well Net",
      "billing_period_start": "2025-07-18",
      "billing_period_end": "2025-08-17",
      "base_amount": "1200.00",
      "total_amount": "1200.00",
      "status": "pending",
      "created_at": "2025-07-15T18:00:00Z",
      "plan_details": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": "1200.00",
        "connection_limit": 2000
      },
      "connection_usage": {
        "active": 750,
        "suspended": 340,
        "maintenance": 39,
        "total_billable": 1129
      }
    }
  }
}
```

### 4. **Descarga de PDF de Factura**
```http
GET /api/isp-owner/invoices/{invoice_id}/download
Authorization: Bearer {token}
```
**Respuesta:** Archivo PDF binario

### 5. **Configuración de Empresa (Super Admin)**
```http
GET /api/admin/company-settings
Authorization: Bearer {token}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "company": {
      "name": "Well Technologies LLC",
      "address": "123 Business Park Drive, Suite 200",
      "city": "Newark",
      "state": "New Jersey",
      "zip_code": "07102",
      "phone": "+1 (973) 555-1200",
      "email": "billing@welltechnologies.com",
      "federal_ein": "88-1234567",
      "nj_tax_id": "NJ123456789",
      "banking_info": {
        "bank_name": "Chase Bank USA",
        "routing_number": "021000021",
        "account_number": "1234567890",
        "swift_code": "CHASUS33"
      }
    }
  }
}
```

### 6. **Actualizar Configuración de Empresa**
```http
PUT /api/admin/company-settings
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Well Technologies LLC",
  "address": "123 Business Park Drive, Suite 200",
  "city": "Newark",
  "state": "New Jersey",
  "zip_code": "07102",
  "phone": "+1 (973) 555-1200",
  "email": "billing@welltechnologies.com",
  "federal_ein": "88-1234567",
  "nj_tax_id": "NJ123456789",
  "bank_name": "Chase Bank USA",
  "routing_number": "021000021",
  "account_number": "1234567890",
  "swift_code": "CHASUS33"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Company settings updated successfully"
}
```

---

## 🔐 Seguridad y Permisos

### **Autenticación:**
- Todos los endpoints requieren `Authorization: Bearer {token}`
- Validar que el token sea válido y no haya expirado

### **Permisos por Endpoint:**
- **ISP Owner endpoints** (`/api/isp-owner/*`): Solo ISP owners pueden acceder a sus propios datos
- **Admin endpoints** (`/api/admin/*`): Solo SUPER ADMINISTRADOR y MEGA ADMINISTRADOR

### **Validación de Datos:**
- Validar que `isp_id` pertenezca al usuario autenticado (para ISP owners)
- Sanitizar todos los inputs
- Validar formatos de email, teléfono, etc.

---

## 📊 Base de Datos Sugerida

### **Tabla: isp_invoices**
```sql
CREATE TABLE isp_invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    isp_id BIGINT NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    overage_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    transactions_included INT NOT NULL,
    transactions_used INT NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isp_id (isp_id),
    INDEX idx_status (status),
    INDEX idx_billing_period (billing_period_start, billing_period_end)
);
```

### **Tabla: isp_plans**
```sql
CREATE TABLE isp_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    connection_limit INT NOT NULL,
    price_per_connection DECIMAL(10,4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabla: isp_subscriptions**
```sql
CREATE TABLE isp_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    isp_id BIGINT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    billing_day INT NOT NULL DEFAULT 18,
    next_billing_date DATE NOT NULL,
    status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES isp_plans(id),
    INDEX idx_isp_id (isp_id),
    INDEX idx_next_billing (next_billing_date)
);
```

### **Tabla: company_settings**
```sql
CREATE TABLE company_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    federal_ein VARCHAR(50),
    nj_tax_id VARCHAR(50),
    bank_name VARCHAR(255),
    routing_number VARCHAR(50),
    account_number VARCHAR(50),
    swift_code VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🚀 Estado Actual del Frontend

### ✅ **Implementado y Funcionando:**
- Dashboard de facturación ISP (`IspOwnerBillingDashboard.tsx`)
- Pantalla de detalles de factura (`InvoiceDetailsScreen.tsx`)
- Configuración de empresa (`CompanySettingsScreen.tsx`)
- Navegación integrada en `IspDetailsScreen.tsx` y `MainScreen.tsx`
- Manejo de errores con modo demo automático
- Integración completa en `App.tsx`

### 🔄 **En Modo Demo:**
- Datos de ejemplo se cargan automáticamente cuando los endpoints fallan
- Banner visible indica "Modo Demo"
- Logs en consola para debugging: `🔍 [BILLING] Intentando cargar facturas...`

### 📱 **Rutas de Acceso:**
1. **ISP Owners**: ISP Details → Botón "Facturación ISP"
2. **Super Admins**: Main Screen → Botón "Configuración de Empresa"

---

## 🚨 ERRORES ENCONTRADOS EN TESTING

### **Error 1: Navegación Incorrecta**
- **Problema**: El frontend intentaba navegar a 'InvoiceDetails' pero la pantalla se llama 'InvoiceDetailsScreen'
- **Status**: ✅ **CORREGIDO** en el frontend
- **No requiere acción del backend**

### **Error 2: Descarga de PDF Fallando**
- **Problema**: Al intentar descargar PDF, el usuario veía "Error: No se pudo descargar la factura"
- **Status**: ✅ **CORREGIDO** - Ahora muestra mensaje de demo mode amigable
- **Logs observados**:
  ```
  📄 [INVOICE] Intentando descargar PDF...
  📋 [INVOICE] Backend no disponible, mostrando demo mode...
  ```

### **Error 3: Formato de Moneda**
- **Problema**: Los valores mostraban solo "$120.00"
- **Status**: ✅ **CORREGIDO** - Ahora muestra "US$120.00" en todo el sistema
- **Acción requerida**: El backend debe enviar valores numéricos, el frontend se encarga del formato

## ✅ Checklist para Activación

- [ ] Implementar los 6 endpoints listados arriba
- [ ] Crear las tablas de base de datos sugeridas
- [ ] Configurar autenticación y permisos
- [ ] Poblar datos iniciales (planes, configuración de empresa)
- [ ] **IMPORTANTE**: Asegurar que los endpoints respondan con HTTP 200 para datos válidos
- [ ] **IMPORTANTE**: Los valores monetarios deben ser números (ej: 1200.00, no "US$1200.00")
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Verificar que el frontend detecte automáticamente los endpoints activos
- [ ] Confirmar que desaparece el banner de "Modo Demo"

---

## 🧪 TESTING REALIZADO

### **Funcionalidades Probadas:**
- ✅ Dashboard de facturación ISP (con datos demo)
- ✅ Visualización de facturas individuales
- ✅ Descarga de PDF (modo demo)
- ✅ Configuración de empresa (super admin)
- ✅ Navegación entre pantallas
- ✅ Formato de moneda US$ 
- ✅ Manejo de errores con fallback a demo mode

### **Logs de Debugging Implementados:**
```
🔍 [BILLING] Intentando cargar facturas...
📋 [BILLING] Cargando datos de demostración...
📄 [INVOICE] Intentando descargar PDF...
📋 [INVOICE] Backend no disponible, mostrando demo mode...
```

### **Comportamiento Esperado Post-Implementación:**
1. Los logs mostrarán datos reales en lugar de demo
2. Desaparecerá el banner amarillo "Modo Demo"
3. Los botones PDF funcionarán realmente
4. Los datos serán específicos por ISP

---

## 🎯 PRIORIDADES PARA EL BACKEND

### **Alta Prioridad:**
1. **Endpoint de facturas** (`/api/isp-owner/invoices`) - Necesario para dashboard principal
2. **Endpoint de plan actual** (`/api/isp-owner/current-plan`) - Necesario para dashboard principal
3. **Autenticación y permisos** - Crítico para seguridad

### **Media Prioridad:**
4. **Detalles de factura individual** (`/api/isp-owner/invoices/{id}`)
5. **Configuración de empresa** (`/api/admin/company-settings`)

### **Baja Prioridad:**
6. **Descarga de PDF** (`/api/isp-owner/invoices/{id}/download`) - Puede implementarse después

---

## 📊 DATOS DE EJEMPLO PARA POBLAR

### **ISP de Prueba:**
```sql
INSERT INTO isp_plans (id, name, price, connection_limit, price_per_connection) VALUES
('enterprise', 'Enterprise', 1200.00, 2000, 0.60),
('business', 'Business', 599.00, 1000, 0.70),
('starter', 'Starter', 149.00, 300, 0.80);

INSERT INTO company_settings (name, address, city, state, zip_code, phone, email, federal_ein) VALUES
('Well Technologies LLC', '123 Business Park Drive, Suite 200', 'Newark', 'New Jersey', '07102', '+1 (973) 555-1200', 'billing@welltechnologies.com', '88-1234567');
```

---

## 📞 Contacto

Una vez implementados los endpoints, el frontend automáticamente detectará que están disponibles y desactivará el modo demo. Los usuarios podrán ver sus datos reales de facturación.

### **Para Verificar que Todo Funciona:**
1. Ejecutar la app React Native
2. Navegar a ISP Details → Facturación ISP
3. Verificar que NO aparezca el banner "Modo Demo"
4. Verificar que las facturas sean datos reales del ISP
5. Probar descarga de PDF

**¡El frontend está 100% listo y esperando por el backend!** 🎯

### **Stack Tecnológico del Frontend:**
- React Native 0.73.6
- TypeScript
- React Navigation
- AsyncStorage para tokens JWT
- Fetch API para llamadas HTTP
- MaterialIcons para iconografía