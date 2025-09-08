# 📊 ENDPOINT CONTADOR DE CONEXIONES - BACKEND REQUERIDO

## 📋 **NUEVO ENDPOINT NECESARIO:**

El frontend de `TarifasConexionesScreen` necesita consultar cuántas conexiones activas/suspendidas tiene el usuario para mostrar su tarifa mensual sugerida.

## ⚙️ **IMPLEMENTACIÓN REQUERIDA:**

### **Archivo: `routes/user.js` (o crear si no existe)**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserConnectionsCount } = require('../controllers/userController');

// Obtener contador de conexiones del usuario
router.get('/connections-count', authenticateToken, getUserConnectionsCount);

module.exports = router;
```

### **Archivo: `controllers/userController.js`**

```javascript
const db = require('../config/database');

const getUserConnectionsCount = async (req, res) => {
    try {
        const userId = req.user.id; // Del token JWT
        const userIspId = req.user.isp_id; // Del token JWT
        
        // Consultar conexiones activas
        const [activeConnections] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM conexiones 
            WHERE estado = 'activa' 
            AND (user_id = ? OR isp_id = ?)
        `, [userId, userIspId]);
        
        // Consultar conexiones suspendidas
        const [suspendedConnections] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM conexiones 
            WHERE estado = 'suspendida' 
            AND (user_id = ? OR isp_id = ?)
        `, [userId, userIspId]);
        
        const activeCount = activeConnections[0]?.count || 0;
        const suspendedCount = suspendedConnections[0]?.count || 0;
        const totalCount = activeCount + suspendedCount;
        
        res.json({
            success: true,
            data: {
                active: activeCount,
                suspended: suspendedCount,
                total: totalCount
            },
            message: 'Conexiones contadas exitosamente'
        });
        
    } catch (error) {
        console.error('Error al contar conexiones del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getUserConnectionsCount
};
```

### **Registrar rutas en `app.js` o `server.js`:**

```javascript
// Agregar esta línea donde se registran las rutas
app.use('/api/user', require('./routes/user'));
```

## 🔗 **ENDPOINT ESPECIFICACIÓN:**

**URL:** `GET /api/user/connections-count`
**Autenticación:** Requerida (Bearer Token)

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "active": 45,
    "suspended": 8,
    "total": 53
  },
  "message": "Conexiones contadas exitosamente"
}
```

**Response de error:**
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## 🎯 **FUNCIONALIDAD:**

1. **Autenticación requerida** - Solo usuarios logueados pueden consultar
2. **Filtro por usuario/ISP** - Solo cuenta conexiones del usuario o su ISP
3. **Estados específicos** - Solo cuenta 'activa' y 'suspendida'
4. **Respuesta estructurada** - Retorna conteos separados y total

## 🧪 **TESTING:**

```bash
curl -X GET https://wellnet-rd.com:444/api/user/connections-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 📱 **USO EN FRONTEND:**

El frontend usa este endpoint para:
1. Mostrar al usuario cuántas conexiones tiene
2. Calcular automáticamente qué plan de tarifas le corresponde
3. Sugerir el plan más económico que cubra sus conexiones

**Una vez implementes este endpoint, el frontend podrá mostrar la tarifa mensual sugerida basada en las conexiones del usuario.** 🎉