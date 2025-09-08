# ACTUALIZACIÓN BACKEND - MÉTODOS DE PAGO CON PAYPAL

## 🎯 RESUMEN DE CAMBIOS FRONTEND

Se implementó soporte para **PayPal** como método de pago adicional en la pantalla de detalle de usuario (`UsuarioDetalleScreen.tsx`), junto con mejoras en la interfaz de usuario.

---

## 📋 CAMBIOS IMPLEMENTADOS EN FRONTEND

### 1. **Nuevo Tipo de Método de Pago: PayPal**
- Se agregó `'paypal'` como tercera opción junto a `'tarjeta'` y `'cuenta'`
- Los usuarios pueden seleccionar PayPal en los modales de agregar/editar método de pago

### 2. **Nuevo Campo: email_paypal**
- Campo específico para almacenar el email de PayPal del usuario
- Solo se muestra cuando `tipo === 'paypal'`
- Tipo de teclado: `email-address`

### 3. **UI Mejorada**
- Botones de selección organizados verticalmente para pantallas pequeñas
- Componente FloatingLabelInput personalizado con placeholders animados
- Layout responsivo que se adapta a diferentes tamaños de pantalla

---

## 🔧 CAMBIOS REQUERIDOS EN BACKEND

### **A. ACTUALIZACIÓN DE BASE DE DATOS**

#### Tabla de métodos de pago:
```sql
ALTER TABLE metodos_pago 
ADD COLUMN email_paypal VARCHAR(255) NULL;
```

#### Estructura de datos esperada:
```json
{
  "id": 1,
  "id_usuario": 123,
  "tipo": "paypal",
  "nombre": "Mi PayPal Personal",
  "numero": null,
  "titular": null,
  "vencimiento": null,
  "cvv": null,
  "banco": null,
  "email_paypal": "usuario@ejemplo.com",
  "activo": true,
  "fecha_creacion": "2025-01-18T10:30:00Z"
}
```

### **B. ENDPOINTS A ACTUALIZAR**

#### 1. **POST** `/api/usuarios/agregar-metodo-pago`

**Request Body actualizado:**
```json
{
  "id_usuario": 123,
  "tipo": "paypal",
  "nombre": "Mi PayPal Personal",
  "numero": null,
  "titular": null,
  "vencimiento": null,
  "cvv": null,
  "banco": null,
  "email_paypal": "usuario@ejemplo.com",
  "activo": true
}
```

**Validaciones requeridas:**
- Si `tipo === 'paypal'`: validar que `email_paypal` esté presente y sea un email válido
- Si `tipo === 'tarjeta'`: validar `numero`, `titular`, `vencimiento`, `cvv`
- Si `tipo === 'cuenta'`: validar `numero`, `titular`, `banco`

#### 2. **POST** `/api/usuarios/editar-metodo-pago`

**Request Body actualizado:**
```json
{
  "id_metodo": 456,
  "tipo": "paypal",
  "nombre": "Mi PayPal Actualizado",
  "numero": null,
  "titular": null,
  "vencimiento": null,
  "cvv": null,
  "banco": null,
  "email_paypal": "nuevo@ejemplo.com",
  "activo": true
}
```

#### 3. **POST** `/api/usuarios/metodos-pago`

**Response actualizada:**
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
    "activo": true
  },
  {
    "id": 2,
    "tipo": "paypal",
    "nombre": "PayPal Personal",
    "numero": null,
    "titular": null,
    "vencimiento": null,
    "cvv": null,
    "banco": null,
    "email_paypal": "usuario@ejemplo.com",
    "activo": true
  }
]
```

---

## 🎨 LÓGICA DE VISUALIZACIÓN EN FRONTEND

### **Tipos de Método de Pago:**
- `'tarjeta'` → Se muestra como "Tarjeta"
- `'cuenta'` → Se muestra como "Cuenta Bancaria"  
- `'paypal'` → Se muestra como "PayPal"

### **Visualización de Números:**
- **Tarjeta/Cuenta**: `**** **** **** ${numero.slice(-4)}`
- **PayPal**: Se muestra el `email_paypal` completo

### **Campos Requeridos por Tipo:**
```javascript
// PayPal
{
  tipo: 'paypal',
  nombre: 'requerido',
  email_paypal: 'requerido',
  activo: 'requerido'
}

// Tarjeta (sin cambios)
{
  tipo: 'tarjeta',
  nombre: 'requerido',
  numero: 'requerido',
  titular: 'requerido',
  vencimiento: 'requerido',
  cvv: 'requerido',
  activo: 'requerido'
}

// Cuenta Bancaria (sin cambios)
{
  tipo: 'cuenta',
  nombre: 'requerido',
  numero: 'requerido',
  titular: 'requerido',
  banco: 'requerido',
  activo: 'requerido'
}
```

---

## ✅ CHECKLIST PARA BACKEND

- [ ] Agregar columna `email_paypal` a la tabla de métodos de pago
- [ ] Actualizar endpoint `agregar-metodo-pago` para manejar PayPal
- [ ] Actualizar endpoint `editar-metodo-pago` para manejar PayPal
- [ ] Actualizar endpoint `metodos-pago` para incluir `email_paypal` en response
- [ ] Implementar validaciones específicas por tipo de método de pago
- [ ] Probar todos los endpoints con datos de PayPal
- [ ] Verificar que los endpoints existentes sigan funcionando para tarjetas y cuentas

---

## 🚀 PRUEBAS RECOMENDADAS

1. **Agregar método PayPal**: Probar con email válido e inválido
2. **Editar método PayPal**: Cambiar email y otros campos
3. **Listar métodos**: Verificar que PayPal aparezca correctamente
4. **Eliminar método PayPal**: Verificar que funcione igual que otros tipos
5. **Validaciones**: Probar campos requeridos y formatos incorrectos
6. **Compatibilidad**: Asegurar que tarjetas y cuentas sigan funcionando

---

## 📧 CONTACTO

Si hay dudas sobre la implementación o necesitas más detalles, por favor coordina con el equipo de frontend.

**Archivos modificados:**
- `src/pantallas/usuarios/UsuarioDetalleScreen.tsx`
- `src/pantallas/usuarios/UsuarioDetalleStyles.tsx`