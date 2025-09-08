# 🛠️ BACKEND - SERVICIOS ADICIONALES PARA ISPs

## 📋 **REQUERIMIENTO:**

Implementar un sistema completo de servicios adicionales que los dueños de ISP pueden agregar, gestionar y ofrecer a sus clientes. Esto incluye productos, servicios y complementos con precios personalizables.

## 🎯 **FUNCIONALIDAD REQUERIDA:**

Los ISPs necesitan poder:
- ✅ **Crear** servicios adicionales (productos, servicios, complementos)
- ✅ **Listar** todos sus servicios adicionales
- ✅ **Editar** servicios existentes
- ✅ **Eliminar** servicios
- ✅ **Activar/Desactivar** servicios

## 🗄️ **1. ESTRUCTURA DE BASE DE DATOS:**

### **Tabla: `servicios_adicionales`**

```sql
CREATE TABLE servicios_adicionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    tipo ENUM('producto', 'servicio', 'complemento') DEFAULT 'producto',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (isp_id) REFERENCES isps(id) ON DELETE CASCADE,
    
    -- Índices para optimización
    INDEX idx_isp_activo (isp_id, activo),
    INDEX idx_tipo (tipo),
    INDEX idx_nombre (nombre)
);
```

### **Datos de ejemplo:**
```sql
INSERT INTO servicios_adicionales (isp_id, nombre, descripcion, precio, tipo, activo) VALUES
(1, 'Router WiFi 6', 'Router de alta velocidad con tecnología WiFi 6', 89.99, 'producto', TRUE),
(1, 'Instalación Técnica', 'Servicio de instalación especializada en sitio', 35.00, 'servicio', TRUE),
(1, 'Soporte Premium', 'Soporte técnico 24/7 con prioridad alta', 15.00, 'complemento', TRUE),
(1, 'Cable Ethernet Cat6', 'Cable de red Cat6 de 10 metros', 12.50, 'producto', TRUE),
(1, 'Configuración VPN', 'Configuración de red privada virtual', 25.00, 'servicio', FALSE);
```

## 🔗 **2. ENDPOINTS REQUERIDOS:**

### **A. Listar Servicios Adicionales**
```
GET /api/servicios-adicionales?isp_id={isp_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "isp_id": 1,
      "nombre": "Router WiFi 6",
      "descripcion": "Router de alta velocidad con tecnología WiFi 6",
      "precio": 89.99,
      "tipo": "producto",
      "activo": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "isp_id": 1,
      "nombre": "Instalación Técnica",
      "descripcion": "Servicio de instalación especializada en sitio",
      "precio": 35.00,
      "tipo": "servicio",
      "activo": true,
      "created_at": "2024-01-15T11:15:00.000Z",
      "updated_at": "2024-01-15T11:15:00.000Z"
    }
  ],
  "message": "Servicios adicionales obtenidos exitosamente"
}
```

### **B. Crear Servicio Adicional**
```
POST /api/servicios-adicionales
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "isp_id": 1,
  "nombre": "Antena de Alta Ganancia",
  "descripcion": "Antena direccional para mejorar señal en áreas rurales",
  "precio": 45.00,
  "tipo": "producto",
  "activo": true
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "isp_id": 1,
    "nombre": "Antena de Alta Ganancia",
    "descripcion": "Antena direccional para mejorar señal en áreas rurales",
    "precio": 45.00,
    "tipo": "producto",
    "activo": true,
    "created_at": "2024-01-15T14:20:00.000Z",
    "updated_at": "2024-01-15T14:20:00.000Z"
  },
  "message": "Servicio adicional creado exitosamente"
}
```

### **C. Actualizar Servicio Adicional**
```
PUT /api/servicios-adicionales/{id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Router WiFi 6 Pro",
  "descripcion": "Router profesional con WiFi 6 y administración avanzada",
  "precio": 129.99,
  "tipo": "producto",
  "activo": true
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isp_id": 1,
    "nombre": "Router WiFi 6 Pro",
    "descripcion": "Router profesional con WiFi 6 y administración avanzada",
    "precio": 129.99,
    "tipo": "producto",
    "activo": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T14:25:00.000Z"
  },
  "message": "Servicio adicional actualizado exitosamente"
}
```

### **D. Eliminar Servicio Adicional**
```
DELETE /api/servicios-adicionales/{id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "message": "Servicio adicional eliminado exitosamente"
}
```

## 🔧 **3. IMPLEMENTACIÓN BACKEND:**

### **Archivo: `routes/serviciosAdicionales.js`**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getServiciosAdicionales,
    createServicioAdicional,
    updateServicioAdicional,
    deleteServicioAdicional
} = require('../controllers/serviciosAdicionalesController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas CRUD
router.get('/', getServiciosAdicionales);           // GET /api/servicios-adicionales?isp_id=1
router.post('/', createServicioAdicional);          // POST /api/servicios-adicionales
router.put('/:id', updateServicioAdicional);        // PUT /api/servicios-adicionales/1
router.delete('/:id', deleteServicioAdicional);     // DELETE /api/servicios-adicionales/1

module.exports = router;
```

### **Archivo: `controllers/serviciosAdicionalesController.js`**

```javascript
const db = require('../config/database');

// 📋 GET - Obtener servicios adicionales por ISP
const getServiciosAdicionales = async (req, res) => {
    try {
        console.log('🔍 [SERVICIOS] Request recibido para obtener servicios adicionales');
        console.log('  📋 Query params:', req.query);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const ispId = req.query.isp_id;
        
        // Validar que se proporcione isp_id
        if (!ispId) {
            console.log('  ❌ Error: isp_id no proporcionado');
            return res.status(400).json({
                success: false,
                message: 'isp_id es requerido como parámetro de consulta'
            });
        }
        
        // Verificar que el usuario tenga acceso a este ISP
        console.log('  🔍 Verificando acceso del usuario al ISP...');
        const [userIspAccess] = await db.execute(`
            SELECT ui.usuario_id, ui.isp_id, i.nombre_isp
            FROM usuarios_isp ui
            INNER JOIN isps i ON ui.isp_id = i.id
            WHERE ui.usuario_id = ? AND ui.isp_id = ? AND ui.activo = 1
        `, [req.user.id, ispId]);
        
        if (userIspAccess.length === 0) {
            console.log('  ❌ Usuario no tiene acceso a este ISP');
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este ISP'
            });
        }
        
        console.log('  ✅ Acceso verificado al ISP:', userIspAccess[0].nombre_isp);
        
        // Obtener servicios adicionales del ISP
        console.log('  📊 Consultando servicios adicionales...');
        const [servicios] = await db.execute(`
            SELECT 
                id,
                isp_id,
                nombre,
                descripcion,
                precio,
                tipo,
                activo,
                created_at,
                updated_at
            FROM servicios_adicionales 
            WHERE isp_id = ?
            ORDER BY created_at DESC
        `, [ispId]);
        
        console.log('  📊 Servicios encontrados:', {
            count: servicios.length,
            isp_id: ispId,
            servicios: servicios.map(s => ({ id: s.id, nombre: s.nombre, tipo: s.tipo, activo: s.activo }))
        });
        
        // Formatear respuesta
        const formattedServicios = servicios.map(servicio => ({
            id: servicio.id,
            isp_id: servicio.isp_id,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: parseFloat(servicio.precio),
            tipo: servicio.tipo,
            activo: Boolean(servicio.activo),
            created_at: servicio.created_at,
            updated_at: servicio.updated_at
        }));
        
        res.json({
            success: true,
            data: formattedServicios,
            message: 'Servicios adicionales obtenidos exitosamente'
        });
        
        console.log('  ✅ Respuesta enviada exitosamente');
        
    } catch (error) {
        console.error('  ❌ ERROR en getServiciosAdicionales:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ➕ POST - Crear nuevo servicio adicional
const createServicioAdicional = async (req, res) => {
    try {
        console.log('🔍 [SERVICIOS] Request recibido para crear servicio adicional');
        console.log('  📋 Body:', req.body);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const { isp_id, nombre, descripcion, precio, tipo, activo } = req.body;
        
        // Validaciones
        if (!isp_id || !nombre || precio === undefined) {
            console.log('  ❌ Error: Campos requeridos faltantes');
            return res.status(400).json({
                success: false,
                message: 'isp_id, nombre y precio son requeridos'
            });
        }
        
        if (!['producto', 'servicio', 'complemento'].includes(tipo)) {
            console.log('  ❌ Error: Tipo inválido');
            return res.status(400).json({
                success: false,
                message: 'tipo debe ser: producto, servicio o complemento'
            });
        }
        
        // Verificar acceso al ISP
        console.log('  🔍 Verificando acceso del usuario al ISP...');
        const [userIspAccess] = await db.execute(`
            SELECT usuario_id FROM usuarios_isp 
            WHERE usuario_id = ? AND isp_id = ? AND activo = 1
        `, [req.user.id, isp_id]);
        
        if (userIspAccess.length === 0) {
            console.log('  ❌ Usuario no tiene acceso a este ISP');
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este ISP'
            });
        }
        
        // Verificar que no exista un servicio con el mismo nombre en el ISP
        console.log('  🔍 Verificando duplicados...');
        const [existingService] = await db.execute(`
            SELECT id FROM servicios_adicionales 
            WHERE isp_id = ? AND nombre = ?
        `, [isp_id, nombre]);
        
        if (existingService.length > 0) {
            console.log('  ❌ Error: Servicio duplicado');
            return res.status(409).json({
                success: false,
                message: 'Ya existe un servicio con ese nombre en este ISP'
            });
        }
        
        // Insertar nuevo servicio
        console.log('  💾 Insertando nuevo servicio...');
        const [result] = await db.execute(`
            INSERT INTO servicios_adicionales 
            (isp_id, nombre, descripcion, precio, tipo, activo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [isp_id, nombre, descripcion || null, parseFloat(precio), tipo || 'producto', activo !== false]);
        
        // Obtener el servicio creado
        const [newService] = await db.execute(`
            SELECT * FROM servicios_adicionales WHERE id = ?
        `, [result.insertId]);
        
        const formattedService = {
            id: newService[0].id,
            isp_id: newService[0].isp_id,
            nombre: newService[0].nombre,
            descripcion: newService[0].descripcion,
            precio: parseFloat(newService[0].precio),
            tipo: newService[0].tipo,
            activo: Boolean(newService[0].activo),
            created_at: newService[0].created_at,
            updated_at: newService[0].updated_at
        };
        
        console.log('  ✅ Servicio creado exitosamente:', {
            id: formattedService.id,
            nombre: formattedService.nombre,
            tipo: formattedService.tipo
        });
        
        res.status(201).json({
            success: true,
            data: formattedService,
            message: 'Servicio adicional creado exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en createServicioAdicional:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ✏️ PUT - Actualizar servicio adicional
const updateServicioAdicional = async (req, res) => {
    try {
        console.log('🔍 [SERVICIOS] Request recibido para actualizar servicio adicional');
        console.log('  📋 Params:', req.params);
        console.log('  📋 Body:', req.body);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const serviceId = req.params.id;
        const { nombre, descripcion, precio, tipo, activo } = req.body;
        
        // Validaciones
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: 'ID del servicio es requerido'
            });
        }
        
        if (tipo && !['producto', 'servicio', 'complemento'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'tipo debe ser: producto, servicio o complemento'
            });
        }
        
        // Verificar que el servicio existe y el usuario tiene acceso
        console.log('  🔍 Verificando existencia y acceso al servicio...');
        const [serviceCheck] = await db.execute(`
            SELECT sa.*, ui.usuario_id
            FROM servicios_adicionales sa
            INNER JOIN usuarios_isp ui ON sa.isp_id = ui.isp_id
            WHERE sa.id = ? AND ui.usuario_id = ? AND ui.activo = 1
        `, [serviceId, req.user.id]);
        
        if (serviceCheck.length === 0) {
            console.log('  ❌ Servicio no encontrado o sin acceso');
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado o sin acceso'
            });
        }
        
        // Verificar duplicados si se cambia el nombre
        if (nombre && nombre !== serviceCheck[0].nombre) {
            console.log('  🔍 Verificando duplicados para nuevo nombre...');
            const [duplicateCheck] = await db.execute(`
                SELECT id FROM servicios_adicionales 
                WHERE isp_id = ? AND nombre = ? AND id != ?
            `, [serviceCheck[0].isp_id, nombre, serviceId]);
            
            if (duplicateCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un servicio con ese nombre en este ISP'
                });
            }
        }
        
        // Actualizar servicio
        console.log('  💾 Actualizando servicio...');
        await db.execute(`
            UPDATE servicios_adicionales 
            SET 
                nombre = COALESCE(?, nombre),
                descripcion = COALESCE(?, descripcion),
                precio = COALESCE(?, precio),
                tipo = COALESCE(?, tipo),
                activo = COALESCE(?, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            nombre || null,
            descripcion !== undefined ? descripcion : null,
            precio !== undefined ? parseFloat(precio) : null,
            tipo || null,
            activo !== undefined ? activo : null,
            serviceId
        ]);
        
        // Obtener el servicio actualizado
        const [updatedService] = await db.execute(`
            SELECT * FROM servicios_adicionales WHERE id = ?
        `, [serviceId]);
        
        const formattedService = {
            id: updatedService[0].id,
            isp_id: updatedService[0].isp_id,
            nombre: updatedService[0].nombre,
            descripcion: updatedService[0].descripcion,
            precio: parseFloat(updatedService[0].precio),
            tipo: updatedService[0].tipo,
            activo: Boolean(updatedService[0].activo),
            created_at: updatedService[0].created_at,
            updated_at: updatedService[0].updated_at
        };
        
        console.log('  ✅ Servicio actualizado exitosamente:', {
            id: formattedService.id,
            nombre: formattedService.nombre
        });
        
        res.json({
            success: true,
            data: formattedService,
            message: 'Servicio adicional actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en updateServicioAdicional:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 🗑️ DELETE - Eliminar servicio adicional
const deleteServicioAdicional = async (req, res) => {
    try {
        console.log('🔍 [SERVICIOS] Request recibido para eliminar servicio adicional');
        console.log('  📋 Params:', req.params);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const serviceId = req.params.id;
        
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: 'ID del servicio es requerido'
            });
        }
        
        // Verificar que el servicio existe y el usuario tiene acceso
        console.log('  🔍 Verificando existencia y acceso al servicio...');
        const [serviceCheck] = await db.execute(`
            SELECT sa.id, sa.nombre, ui.usuario_id
            FROM servicios_adicionales sa
            INNER JOIN usuarios_isp ui ON sa.isp_id = ui.isp_id
            WHERE sa.id = ? AND ui.usuario_id = ? AND ui.activo = 1
        `, [serviceId, req.user.id]);
        
        if (serviceCheck.length === 0) {
            console.log('  ❌ Servicio no encontrado o sin acceso');
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado o sin acceso'
            });
        }
        
        // TODO: Verificar si el servicio está siendo usado en facturas/pedidos
        // Esta validación se puede agregar más adelante cuando se implemente facturación
        
        // Eliminar servicio
        console.log('  🗑️ Eliminando servicio...');
        await db.execute(`
            DELETE FROM servicios_adicionales WHERE id = ?
        `, [serviceId]);
        
        console.log('  ✅ Servicio eliminado exitosamente:', {
            id: serviceId,
            nombre: serviceCheck[0].nombre
        });
        
        res.json({
            success: true,
            message: 'Servicio adicional eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en deleteServicioAdicional:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getServiciosAdicionales,
    createServicioAdicional,
    updateServicioAdicional,
    deleteServicioAdicional
};
```

## 🔗 **4. REGISTRO DE RUTAS:**

### **Archivo: `app.js` o `server.js`**

```javascript
// Importar rutas de servicios adicionales
const serviciosAdicionalesRoutes = require('./routes/serviciosAdicionales');

// Registrar rutas
app.use('/api/servicios-adicionales', serviciosAdicionalesRoutes);
```

## 🧪 **5. TESTING DE ENDPOINTS:**

### **A. Obtener servicios adicionales**
```bash
curl -X GET "https://wellnet-rd.com:444/api/servicios-adicionales?isp_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **B. Crear servicio adicional**
```bash
curl -X POST "https://wellnet-rd.com:444/api/servicios-adicionales" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isp_id": 1,
    "nombre": "Router WiFi 6",
    "descripcion": "Router de alta velocidad",
    "precio": 89.99,
    "tipo": "producto",
    "activo": true
  }'
```

### **C. Actualizar servicio adicional**
```bash
curl -X PUT "https://wellnet-rd.com:444/api/servicios-adicionales/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Router WiFi 6 Pro",
    "precio": 129.99
  }'
```

### **D. Eliminar servicio adicional**
```bash
curl -X DELETE "https://wellnet-rd.com:444/api/servicios-adicionales/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🎯 **6. CARACTERÍSTICAS IMPLEMENTADAS:**

✅ **Seguridad:**
- Autenticación JWT requerida
- Verificación de acceso por ISP
- Validación de permisos por usuario

✅ **Validaciones:**
- Campos requeridos
- Tipos de datos correctos
- Prevención de duplicados
- Validación de tipos de servicio

✅ **Funcionalidad:**
- CRUD completo (Create, Read, Update, Delete)
- Filtrado por ISP
- Soporte para diferentes tipos de servicios
- Estado activo/inactivo

✅ **Logging:**
- Logs detallados para debugging
- Seguimiento de operaciones por usuario
- Información de errores específicos

✅ **Respuestas:**
- Formato JSON consistente
- Códigos de estado HTTP apropiados
- Mensajes descriptivos

## 🚀 **7. PRÓXIMOS PASOS SUGERIDOS:**

1. **Integración con facturación** - Permitir agregar servicios adicionales a facturas
2. **Categorías de servicios** - Agrupar servicios por categorías
3. **Inventario** - Controlar stock de productos
4. **Precios escalonados** - Precios diferentes según cantidad
5. **Servicios recurrentes** - Servicios con facturación mensual/anual

**Con esta implementación, los ISPs tendrán un sistema completo para gestionar sus servicios adicionales y generar ingresos extra.** 🎉