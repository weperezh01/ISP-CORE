# 📊 ENDPOINT MEJORADO - CONEXIONES Y PLAN SUGERIDO POR USUARIO

## 📋 **ENDPOINT MEJORADO REQUERIDO:**

El backend debe consultar `usuarios_isp` y `conexiones` por `id_usuario`, calcular el plan sugerido automáticamente, y devolver el desglose completo por ISP.

## ⚙️ **IMPLEMENTACIÓN MEJORADA:**

### **Archivo: `controllers/userConnectionsController.js`**

```javascript
const db = require('../config/database');

const getUserConnectionsCount = async (req, res) => {
    try {
        const userId = req.user.id; // Del token JWT
        
        // 1. Obtener todos los ISPs del usuario
        const [userIsps] = await db.execute(`
            SELECT isp_id, nombre_isp
            FROM usuarios_isp ui
            INNER JOIN isps i ON ui.isp_id = i.id
            WHERE ui.usuario_id = ? AND ui.activo = 1
        `, [userId]);
        
        if (userIsps.length === 0) {
            return res.json({
                success: true,
                data: {
                    total_active: 0,
                    total_suspended: 0,
                    total_connections: 0,
                    isps: [],
                    suggested_plan: null
                },
                message: 'Usuario sin ISPs asignados'
            });
        }
        
        const ispIds = userIsps.map(isp => isp.isp_id);
        const placeholders = ispIds.map(() => '?').join(',');
        
        // 2. Contar conexiones activas por ISP
        const [activeByIsp] = await db.execute(`
            SELECT isp_id, COUNT(*) as count
            FROM conexiones 
            WHERE isp_id IN (${placeholders}) AND id_estado_conexion = 3
            GROUP BY isp_id
        `, ispIds);
        
        // 3. Contar conexiones suspendidas por ISP
        const [suspendedByIsp] = await db.execute(`
            SELECT isp_id, COUNT(*) as count
            FROM conexiones 
            WHERE isp_id IN (${placeholders}) AND id_estado_conexion = 2
            GROUP BY isp_id
        `, ispIds);
        
        // 4. Crear mapa de conteos
        const activeMap = {};
        const suspendedMap = {};
        
        activeByIsp.forEach(row => {
            activeMap[row.isp_id] = parseInt(row.count);
        });
        
        suspendedByIsp.forEach(row => {
            suspendedMap[row.isp_id] = parseInt(row.count);
        });
        
        // 5. Construir desglose por ISP
        const ispBreakdown = userIsps.map(isp => {
            const active = activeMap[isp.isp_id] || 0;
            const suspended = suspendedMap[isp.isp_id] || 0;
            return {
                isp_id: isp.isp_id,
                isp_name: isp.nombre_isp,
                active_connections: active,
                suspended_connections: suspended,
                total_connections: active + suspended
            };
        });
        
        // 6. Calcular totales generales
        const totalActive = ispBreakdown.reduce((sum, isp) => sum + isp.active_connections, 0);
        const totalSuspended = ispBreakdown.reduce((sum, isp) => sum + isp.suspended_connections, 0);
        const totalConnections = totalActive + totalSuspended;
        
        // 7. Obtener planes disponibles para calcular sugerencia
        const [availablePlans] = await db.execute(`
            SELECT id, name, price, connection_limit, price_per_connection, features
            FROM subscription_plans 
            WHERE active = true
            ORDER BY price ASC
        `);
        
        // 8. Determinar plan sugerido
        let suggestedPlan = null;
        if (availablePlans.length > 0 && totalConnections > 0) {
            // Buscar el plan más económico que cubra las conexiones
            for (const plan of availablePlans) {
                if (!plan.connection_limit || plan.connection_limit >= totalConnections) {
                    suggestedPlan = {
                        id: plan.id,
                        name: plan.name,
                        price: parseFloat(plan.price),
                        connection_limit: plan.connection_limit,
                        price_per_connection: parseFloat(plan.price_per_connection || 0),
                        features: plan.features,
                        reason: `Cubre ${totalConnections} conexiones`
                    };
                    break;
                }
            }
            
            // Si ningún plan tiene límite suficiente, usar el de mayor capacidad
            if (!suggestedPlan && availablePlans.length > 0) {
                const highestPlan = availablePlans[availablePlans.length - 1];
                suggestedPlan = {
                    id: highestPlan.id,
                    name: highestPlan.name,
                    price: parseFloat(highestPlan.price),
                    connection_limit: highestPlan.connection_limit,
                    price_per_connection: parseFloat(highestPlan.price_per_connection || 0),
                    features: highestPlan.features,
                    reason: `Plan de mayor capacidad disponible`
                };
            }
        }
        
        res.json({
            success: true,
            data: {
                total_active: totalActive,
                total_suspended: totalSuspended,
                total_connections: totalConnections,
                isps: ispBreakdown,
                suggested_plan: suggestedPlan
            },
            message: 'Conexiones y plan sugerido calculados exitosamente'
        });
        
    } catch (error) {
        console.error('Error al calcular conexiones y plan sugerido:', error);
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

## 🔗 **RESPUESTA MEJORADA:**

**URL:** `GET /api/usuarios/connections-count`
**Autenticación:** Requerida (Bearer Token)

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "total_active": 745,
    "total_suspended": 12,
    "total_connections": 757,
    "isps": [
      {
        "isp_id": 1,
        "isp_name": "WellNet ISP Principal",
        "active_connections": 500,
        "suspended_connections": 8,
        "total_connections": 508
      },
      {
        "isp_id": 2,
        "isp_name": "WellNet ISP Secundario", 
        "active_connections": 245,
        "suspended_connections": 4,
        "total_connections": 249
      }
    ],
    "suggested_plan": {
      "id": 3,
      "name": "Plan Empresarial",
      "price": 99.99,
      "connection_limit": 1000,
      "price_per_connection": 0.15,
      "features": ["Dashboard avanzado", "Soporte prioritario", "Reportes detallados"],
      "reason": "Cubre 757 conexiones"
    }
  },
  "message": "Conexiones y plan sugerido calculados exitosamente"
}
```

## 🎯 **FUNCIONALIDAD MEJORADA:**

1. **Consulta por usuario** - Usa `id_usuario` del token JWT
2. **Desglose por ISP** - Muestra conexiones de cada ISP del usuario
3. **Cálculo automático** - Backend determina el plan sugerido
4. **Lógica inteligente** - Busca plan más económico que cubra conexiones
5. **Fallback robusto** - Si no hay plan suficiente, sugiere el de mayor capacidad

## 🧪 **TESTING:**

```bash
curl -X GET https://wellnet-rd.com:444/api/usuarios/connections-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 📱 **BENEFICIOS PARA FRONTEND:**

1. **Información completa** - Total + desglose por ISP
2. **Plan precalculado** - Backend ya decide qué plan aplicar
3. **Menos lógica** - Frontend solo muestra la información
4. **Datos enriquecidos** - Incluye razón de la sugerencia

**Con esta implementación, el backend maneja toda la lógica compleja y el frontend solo presenta la información de manera clara.** 🎉