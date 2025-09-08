# IMPLEMENTACIÓN COMPLETA - SISTEMA DE MÉTODOS DE PAGO

## 🎯 RESUMEN EJECUTIVO

Se necesita implementar desde cero un sistema completo de métodos de pago para usuarios en WellNet. El frontend ya está completamente desarrollado y requiere que el backend implemente toda la funcionalidad de métodos de pago.

---

## 📱 FUNCIONALIDAD IMPLEMENTADA EN FRONTEND

### **Ubicación**: Pantalla de Detalle de Usuario (`UsuarioDetalleScreen.tsx`)
- Sección "Métodos de Pago" solo visible para el propietario del perfil
- Modal para agregar nuevos métodos de pago
- Modal para editar métodos existentes
- Visualización de lista de métodos de pago
- Funcionalidad de eliminación de métodos

### **Tipos de Métodos Soportados**:
1. **Tarjeta de Crédito/Débito**
2. **Cuenta Bancaria**
3. **PayPal**

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS REQUERIDA

### **Tabla: `metodos_pago`**

```sql
CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo ENUM('tarjeta', 'cuenta', 'paypal') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    numero VARCHAR(20) NULL,
    titular VARCHAR(100) NULL,
    vencimiento VARCHAR(7) NULL,
    cvv VARCHAR(4) NULL,
    banco VARCHAR(100) NULL,
    email_paypal VARCHAR(255) NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo)
);
```

### **Campos por Tipo de Método**:

| Campo | Tarjeta | Cuenta | PayPal |
|-------|---------|--------|--------|
| `nombre` | ✅ | ✅ | ✅ |
| `numero` | ✅ | ✅ | ❌ |
| `titular` | ✅ | ✅ | ❌ |
| `vencimiento` | ✅ | ❌ | ❌ |
| `cvv` | ✅ | ❌ | ❌ |
| `banco` | ❌ | ✅ | ❌ |
| `email_paypal` | ❌ | ❌ | ✅ |

---

## 🔌 ENDPOINTS REQUERIDOS

### **1. Obtener Métodos de Pago de Usuario**

**Endpoint**: `POST /api/usuarios/metodos-pago`

**Request**:
```json
{
  "id_usuario": 123
}
```

**Response**:
```json
[
  {
    "id": 1,
    "tipo": "tarjeta",
    "nombre": "Visa Principal",
    "numero": "1234567890123456",
    "titular": "Juan Pérez",
    "vencimiento": "12/25",
    "cvv": "123",
    "banco": null,
    "email_paypal": null,
    "activo": true,
    "fecha_creacion": "2025-01-18T10:30:00Z"
  },
  {
    "id": 2,
    "tipo": "cuenta",
    "nombre": "Cuenta Corriente",
    "numero": "1234567890",
    "titular": "Juan Pérez",
    "vencimiento": null,
    "cvv": null,
    "banco": "Banco Popular",
    "email_paypal": null,
    "activo": true,
    "fecha_creacion": "2025-01-18T11:00:00Z"
  },
  {
    "id": 3,
    "tipo": "paypal",
    "nombre": "PayPal Personal",
    "numero": null,
    "titular": null,
    "vencimiento": null,
    "cvv": null,
    "banco": null,
    "email_paypal": "juan@ejemplo.com",
    "activo": true,
    "fecha_creacion": "2025-01-18T11:30:00Z"
  }
]
```

---

### **2. Agregar Método de Pago**

**Endpoint**: `POST /api/usuarios/agregar-metodo-pago`

**Request Tarjeta**:
```json
{
  "id_usuario": 123,
  "tipo": "tarjeta",
  "nombre": "Visa Trabajo",
  "numero": "4111111111111111",
  "titular": "Juan Pérez García",
  "vencimiento": "08/27",
  "cvv": "456",
  "banco": null,
  "email_paypal": null,
  "activo": true
}
```

**Request Cuenta Bancaria**:
```json
{
  "id_usuario": 123,
  "tipo": "cuenta",
  "nombre": "Ahorro Principal",
  "numero": "9876543210",
  "titular": "Juan Pérez García",
  "vencimiento": null,
  "cvv": null,
  "banco": "Banco BHD León",
  "email_paypal": null,
  "activo": true
}
```

**Request PayPal**:
```json
{
  "id_usuario": 123,
  "tipo": "paypal",
  "nombre": "PayPal Trabajo",
  "numero": null,
  "titular": null,
  "vencimiento": null,
  "cvv": null,
  "banco": null,
  "email_paypal": "trabajo@empresa.com",
  "activo": true
}
```

**Response Exitosa**:
```json
{
  "success": true,
  "message": "Método de pago agregado correctamente",
  "id_metodo": 4
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Email de PayPal inválido",
  "errors": ["El campo email_paypal debe ser un email válido"]
}
```

---

### **3. Editar Método de Pago**

**Endpoint**: `POST /api/usuarios/editar-metodo-pago`

**Request**:
```json
{
  "id_metodo": 2,
  "tipo": "paypal",
  "nombre": "PayPal Actualizado",
  "numero": null,
  "titular": null,
  "vencimiento": null,
  "cvv": null,
  "banco": null,
  "email_paypal": "nuevo-email@ejemplo.com",
  "activo": true
}
```

**Response Exitosa**:
```json
{
  "success": true,
  "message": "Método de pago actualizado correctamente"
}
```

---

### **4. Eliminar Método de Pago**

**Endpoint**: `POST /api/usuarios/eliminar-metodo-pago`

**Request**:
```json
{
  "id_metodo": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Método de pago eliminado correctamente"
}
```

---

## ✅ VALIDACIONES REQUERIDAS

### **Validaciones por Tipo**:

#### **Tarjeta (`tipo: 'tarjeta'`)**:
- `nombre`: Requerido, máximo 100 caracteres
- `numero`: Requerido, solo números, 13-19 dígitos
- `titular`: Requerido, máximo 100 caracteres
- `vencimiento`: Requerido, formato MM/AA
- `cvv`: Requerido, 3-4 dígitos
- `activo`: Requerido, boolean

#### **Cuenta Bancaria (`tipo: 'cuenta'`)**:
- `nombre`: Requerido, máximo 100 caracteres
- `numero`: Requerido, solo números, 8-20 dígitos
- `titular`: Requerido, máximo 100 caracteres
- `banco`: Requerido, máximo 100 caracteres
- `activo`: Requerido, boolean

#### **PayPal (`tipo: 'paypal'`)**:
- `nombre`: Requerido, máximo 100 caracteres
- `email_paypal`: Requerido, formato email válido
- `activo`: Requerido, boolean

### **Validaciones Generales**:
- Usuario debe existir en la base de datos
- No permitir métodos duplicados para el mismo usuario (mismo tipo + mismo número/email)
- Verificar permisos del usuario que hace la petición

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

### **Datos Sensibles**:
- **CVV**: Considerar si almacenar o no (recomendado: NO almacenar)
- **Números de tarjeta**: Implementar encriptación en base de datos
- **Emails PayPal**: Validar formato y existencia

### **Permisos**:
- Solo el propietario del perfil puede ver sus métodos de pago
- Solo el propietario puede agregar/editar/eliminar sus métodos
- Implementar validación de token/sesión en todos los endpoints

---

## 🧪 CASOS DE PRUEBA RECOMENDADOS

### **Agregar Método de Pago**:
1. ✅ Tarjeta válida con todos los campos
2. ✅ Cuenta bancaria válida con todos los campos  
3. ✅ PayPal válido con email correcto
4. ❌ Tarjeta con número inválido
5. ❌ PayPal con email inválido
6. ❌ Usuario inexistente
7. ❌ Campos faltantes por tipo

### **Editar Método de Pago**:
1. ✅ Cambiar tipo de tarjeta a PayPal
2. ✅ Actualizar email de PayPal
3. ✅ Cambiar estado activo/inactivo
4. ❌ ID de método inexistente
5. ❌ Editar método de otro usuario

### **Eliminar Método de Pago**:
1. ✅ Eliminar método propio
2. ❌ Eliminar método de otro usuario
3. ❌ ID inexistente

### **Obtener Métodos**:
1. ✅ Usuario con múltiples métodos
2. ✅ Usuario sin métodos (array vacío)
3. ❌ Usuario inexistente

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Base de Datos**:
- [ ] Crear tabla `metodos_pago` con estructura especificada
- [ ] Configurar índices para optimizar consultas
- [ ] Configurar foreign keys y cascadas
- [ ] Implementar encriptación para datos sensibles (opcional)

### **Endpoints**:
- [ ] `POST /api/usuarios/metodos-pago` - Obtener métodos
- [ ] `POST /api/usuarios/agregar-metodo-pago` - Agregar método
- [ ] `POST /api/usuarios/editar-metodo-pago` - Editar método
- [ ] `POST /api/usuarios/eliminar-metodo-pago` - Eliminar método

### **Validaciones**:
- [ ] Validaciones específicas por tipo de método
- [ ] Validación de formato de email para PayPal
- [ ] Validación de números de tarjeta/cuenta
- [ ] Validación de fechas de vencimiento
- [ ] Validación de permisos de usuario

### **Seguridad**:
- [ ] Verificación de autenticación en todos los endpoints
- [ ] Verificación de que el usuario solo acceda a sus propios métodos
- [ ] Sanitización de inputs
- [ ] Manejo seguro de errores (no exponer información sensible)

### **Pruebas**:
- [ ] Pruebas unitarias para cada endpoint
- [ ] Pruebas de validación para cada tipo de método
- [ ] Pruebas de seguridad y permisos
- [ ] Pruebas de integración con frontend

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

1. **ALTA**: Crear tabla de base de datos
2. **ALTA**: Endpoint para obtener métodos de pago
3. **ALTA**: Endpoint para agregar método de pago
4. **MEDIA**: Endpoint para editar método de pago
5. **MEDIA**: Endpoint para eliminar método de pago
6. **BAJA**: Optimizaciones de seguridad adicionales

---

## 📞 SIGUIENTE PASO

Una vez implementados los endpoints básicos, coordinar pruebas con el equipo de frontend para verificar la integración completa del sistema de métodos de pago.

**Archivos frontend involucrados**:
- `src/pantallas/usuarios/UsuarioDetalleScreen.tsx`
- `src/pantallas/usuarios/UsuarioDetalleStyles.tsx`