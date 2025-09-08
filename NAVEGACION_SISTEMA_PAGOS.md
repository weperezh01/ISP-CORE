# 🧭 NAVEGACIÓN DEL SISTEMA DE PAGOS - CONFIGURACIÓN POR ROLES

## 📋 DISTRIBUCIÓN DE PANTALLAS POR USUARIO

### 👑 **MEGA ADMINISTRADOR** (MainScreen.tsx)
**Usuario**: Dueño del software WellNet
**Acceso**: Métricas globales y supervisión general

#### 🔹 **Pantallas Asignadas:**
- **📊 Dashboard de Pagos** (`DashboardPagos`)
  - Métricas de **TODOS** los ISPs
  - Ingresos totales del sistema
  - Comparativas entre ISPs
  - Gráficos de tendencias globales

- **📋 Historial de Transacciones** (`HistorialTransacciones`)
  - Historial global de **TODAS** las transacciones
  - Filtros por ISP específico
  - Exportación de reportes globales
  - Supervisión de todos los pagos

#### 🎯 **Ubicación en MainScreen.tsx:**
```javascript
{/* Botones de sistema de pagos para MEGA ADMINISTRADOR */}
{userRole === 'MEGA ADMINISTRADOR' && (
  <>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('DashboardPagos')}
    >
      <Text style={styles.buttonText}>📊 Dashboard de Pagos</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('HistorialTransacciones')}
    >
      <Text style={styles.buttonText}>📋 Historial de Transacciones</Text>
    </TouchableOpacity>
  </>
)}
```

---

### 🏢 **PROPIETARIO ISP** (ispScreen.tsx)
**Usuario**: Dueño de ISP individual
**Acceso**: Operaciones y notificaciones de su ISP

#### 🔹 **Pantallas Asignadas:**
- **💳 Procesar Pago** (`ProcesarPago`)
  - Procesar pagos de sus clientes
  - Usar métodos de pago configurados
  - Confirmación de transacciones

- **🔔 Notificaciones de Pagos** (`NotificacionesPagos`)
  - Notificaciones de SU ISP únicamente
  - Alertas de pagos exitosos/fallidos
  - Sistema de lectura de notificaciones

#### 🎯 **Ubicación en ispScreen.tsx:**
```javascript
const botones = [
    { id: '6', action: () => setMenuVisible(true), icon: 'menu' },
    { id: '5', title: 'Agregar ISP', screen: 'AddIspScreen', icon: 'add' },
    { id: '7', title: 'Suscripción', action: handleSubscriptionNavigation, icon: 'payment' },
    { id: '8', title: 'Contabilidad', action: handleAccountingSubscriptionNavigation, icon: 'account_balance' },
    { id: '2', title: 'Facturas para mi', screen: 'FacturasParaMiScreen', icon: 'receipt' },
    // Botones de sistema de pagos para propietarios ISP
    { id: '9', title: 'Procesar Pago', screen: 'ProcesarPago', icon: 'credit_card' },
    { id: '10', title: 'Notificaciones', screen: 'NotificacionesPagos', icon: 'notifications' },
];
```

---

## 🔐 LÓGICA DE PERMISOS

### **Filtrado Automático por Usuario:**

#### 📊 **DashboardPagos (MEGA ADMIN):**
- Muestra métricas de **TODOS** los ISPs
- Filtros opcionales por ISP específico
- Comparativas entre diferentes ISPs
- Ingresos totales del sistema

#### 📋 **HistorialTransacciones (MEGA ADMIN):**
- Historial global de **TODAS** las transacciones
- Filtros por ISP, fecha, estado, gateway
- Exportación masiva de datos
- Supervisión completa del sistema

#### 💳 **ProcesarPago (ISP OWNER):**
- Procesa pagos usando métodos del usuario actual
- Automáticamente filtra por `id_usuario` del contexto
- Solo puede procesar pagos de sus propios clientes
- Integración con métodos de pago configurados

#### 🔔 **NotificacionesPagos (ISP OWNER):**
- Notificaciones filtradas por `id_usuario`
- Solo ve notificaciones de SU ISP
- Alertas específicas de sus transacciones
- Sistema de lectura personal

---

## 🎨 DISEÑO VISUAL

### **MainScreen.tsx (MEGA ADMIN):**
```
┌─────────────────────────────────────┐
│          Pantalla Principal         │
├─────────────────────────────────────┤
│  🏢 I. S. P. s                      │
│  📊 Gestión de Planes               │
│  🔧 Servicios Adicionales           │
│  📊 Dashboard de Pagos  ← NUEVO     │
│  📋 Historial de Transacciones ← NUEVO │
│  🚪 Cerrar Sesión                   │
└─────────────────────────────────────┘
```

### **ispScreen.tsx (ISP OWNER):**
```
┌─────────────────────────────────────┐
│           Lista de ISPs             │
├─────────────────────────────────────┤
│  📋 ISP 1                           │
│  📋 ISP 2                           │
│  📋 ISP 3                           │
├─────────────────────────────────────┤
│  ☰ │ + │ 💳 │ 📊 │ 📋 │ 💳 │ 🔔      │
│ Menu Add Pay Subs Acct Fact Pay Noti │
│                      ↑        ↑    ↑  │
│                    NUEVOS BOTONES     │
└─────────────────────────────────────┘
```

---

## 🚀 FLUJO DE NAVEGACIÓN

### **Para MEGA ADMINISTRADOR:**
1. **Login** → **MainScreen**
2. **MainScreen** → **"📊 Dashboard de Pagos"**
3. **MainScreen** → **"📋 Historial de Transacciones"**

### **Para PROPIETARIO ISP:**
1. **Login** → **MainScreen** → **"I. S. P. s"** → **ispScreen**
2. **ispScreen** → **Botón "💳 Procesar Pago"**
3. **ispScreen** → **Botón "🔔 Notificaciones"**

---

## 🔧 CONFIGURACIÓN TÉCNICA

### **Rutas Disponibles:**
- ✅ `ProcesarPago` - Registrada en App.tsx
- ✅ `DashboardPagos` - Registrada en App.tsx  
- ✅ `NotificacionesPagos` - Registrada en App.tsx
- ✅ `HistorialTransacciones` - Registrada en App.tsx

### **Parámetros de Navegación:**

#### **ProcesarPago:**
```javascript
navigation.navigate('ProcesarPago', {
    monto: 1500.00,
    descripcion: 'Pago mensual',
    facturaId: 123  // opcional
});
```

#### **Otras pantallas:**
```javascript
navigation.navigate('DashboardPagos');
navigation.navigate('NotificacionesPagos');
navigation.navigate('HistorialTransacciones');
```

---

## 📊 DATOS FILTRADOS AUTOMÁTICAMENTE

### **Backend Filtering:**
- **MEGA ADMIN**: Acceso a datos de todos los ISPs
- **ISP OWNER**: Datos filtrados por `id_usuario` y `id_isp`

### **Frontend Context:**
- Usuario ID obtenido de AsyncStorage
- ISP ID determinado por el usuario autenticado
- Permisos validados en cada request

---

## 🎯 BENEFICIOS DE ESTA DISTRIBUCIÓN

### **Para MEGA ADMINISTRADOR:**
✅ **Supervisión completa** del sistema  
✅ **Métricas globales** para toma de decisiones  
✅ **Reportes consolidados** de todos los ISPs  
✅ **Análisis comparativo** entre ISPs  

### **Para PROPIETARIO ISP:**
✅ **Operaciones específicas** de su negocio  
✅ **Notificaciones personalizadas** de sus transacciones  
✅ **Procesamiento directo** de pagos de clientes  
✅ **Acceso rápido** desde menú horizontal  

### **Para el Sistema:**
✅ **Separación clara** de responsabilidades  
✅ **Seguridad** por filtrado de datos  
✅ **Escalabilidad** para múltiples ISPs  
✅ **Experiencia optimizada** por rol  

---

## 🚀 SISTEMA LISTO PARA USAR

### **✅ Configuración Completada:**
- MainScreen.tsx → Botones para MEGA ADMIN
- ispScreen.tsx → Botones para ISP OWNER
- App.tsx → Rutas registradas
- Backend → Endpoints funcionales

### **✅ Para Activar:**
1. Reiniciar la aplicación
2. Hacer login como MEGA ADMIN o ISP OWNER
3. Navegar a las pantallas correspondientes
4. ¡Comenzar a usar el sistema de pagos!

**¡El sistema está perfectamente distribuido y listo para operación!** 🎉