# 🌐 ENDPOINT PÚBLICO - CONEXIONES Y PLAN POR USER_ID

## 📋 **ENDPOINT PÚBLICO REQUERIDO:**

El endpoint debe ser **público** (sin autenticación) y recibir `user_id` como parámetro de consulta para calcular conexiones y plan sugerido.

## ⚙️ **IMPLEMENTACIÓN PÚBLICA:**

### **Archivo: `routes/usuarios.js`**

```javascript
// ✅ NUEVO - Endpoint público (sin authenticateToken)
router.get('/connections-count', getUserConnectionsCount);
```

### **Archivo: `controllers/userConnectionsController.js`**

```javascript
const db = require('../config/database');

const getUserConnectionsCount = async (req, res) => {
    try {
        // 📊 LOG: Datos recibidos por el servidor
        console.log('🔍 [CONNECTIONS-COUNT] Request recibido:');
        console.log('  📋 Query params:', req.query);
        console.log('  🌐 Headers:', {
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent'],
            'origin': req.headers['origin']
        });
        console.log('  ⏰ Timestamp:', new Date().toISOString());
        
        const userId = req.query.user_id; // Desde query parameter
        console.log('  👤 User ID extraído:', userId, '(tipo:', typeof userId, ')');
        
        // Validar que se proporcione user_id
        if (!userId) {
            console.log('  ❌ Error: user_id no proporcionado');
            return res.status(400).json({
                success: false,
                message: 'user_id es requerido como parámetro de consulta'
            });
        }
        
        // 1. Verificar que el usuario existe y está activo
        console.log('  🔍 Consultando usuario en BD...');
        const [userExists] = await db.execute(`
            SELECT id, nombre, activo 
            FROM usuarios 
            WHERE id = ? AND activo = 1
        `, [userId]);
        
        console.log('  📊 Resultado consulta usuario:', {
            found: userExists.length > 0,
            count: userExists.length,
            data: userExists.length > 0 ? userExists[0] : null
        });
        
        if (userExists.length === 0) {
            console.log('  ❌ Usuario no encontrado o inactivo');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }
        
        // 2. Obtener todos los ISPs del usuario
        console.log('  🏢 Consultando ISPs del usuario...');
        const [userIsps] = await db.execute(`
            SELECT isp_id, nombre_isp
            FROM usuarios_isp ui
            INNER JOIN isps i ON ui.isp_id = i.id
            WHERE ui.usuario_id = ? AND ui.activo = 1
        `, [userId]);
        
        console.log('  📊 ISPs encontrados:', {
            count: userIsps.length,
            isps: userIsps.map(isp => ({ id: isp.isp_id, name: isp.nombre_isp }))
        });
        
        if (userIsps.length === 0) {
            console.log('  ⚠️ Usuario sin ISPs asignados - retornando datos vacíos');
            return res.json({
                success: true,
                data: {
                    user_id: parseInt(userId),
                    user_name: userExists[0].nombre,
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
        console.log('  🔗 ISP IDs para consulta conexiones:', ispIds);
        
        // 3. Contar conexiones activas por ISP
        console.log('  📡 Consultando conexiones activas (estado=3)...');
        const [activeByIsp] = await db.execute(`
            SELECT isp_id, COUNT(*) as count
            FROM conexiones 
            WHERE isp_id IN (${placeholders}) AND id_estado_conexion = 3
            GROUP BY isp_id
        `, ispIds);
        
        console.log('  📊 Conexiones activas por ISP:', activeByIsp);
        
        // 4. Contar conexiones suspendidas por ISP
        console.log('  ⏸️ Consultando conexiones suspendidas (estado=2)...');
        const [suspendedByIsp] = await db.execute(`
            SELECT isp_id, COUNT(*) as count
            FROM conexiones 
            WHERE isp_id IN (${placeholders}) AND id_estado_conexion = 2
            GROUP BY isp_id
        `, ispIds);
        
        console.log('  📊 Conexiones suspendidas por ISP:', suspendedByIsp);
        
        // 5. Crear mapa de conteos
        const activeMap = {};
        const suspendedMap = {};
        
        activeByIsp.forEach(row => {
            activeMap[row.isp_id] = parseInt(row.count);
        });
        
        suspendedByIsp.forEach(row => {
            suspendedMap[row.isp_id] = parseInt(row.count);
        });
        
        // 6. Construir desglose por ISP
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
        
        // 7. Calcular totales generales
        const totalActive = ispBreakdown.reduce((sum, isp) => sum + isp.active_connections, 0);
        const totalSuspended = ispBreakdown.reduce((sum, isp) => sum + isp.suspended_connections, 0);
        const totalConnections = totalActive + totalSuspended;
        
        console.log('  📈 Totales calculados:', {
            total_active: totalActive,
            total_suspended: totalSuspended,
            total_connections: totalConnections,
            breakdown: ispBreakdown
        });
        
        // 8. Obtener planes disponibles para calcular sugerencia
        console.log('  💰 Consultando planes de suscripción...');
        const [availablePlans] = await db.execute(`
            SELECT id, name, price, connection_limit, price_per_connection, features
            FROM subscription_plans 
            WHERE active = true
            ORDER BY price ASC
        `);
        
        console.log('  📊 Planes disponibles:', {
            count: availablePlans.length,
            plans: availablePlans.map(p => ({ 
                id: p.id, 
                name: p.name, 
                price: p.price, 
                limit: p.connection_limit 
            }))
        });
        
        // 9. Determinar plan sugerido
        console.log('  🎯 Calculando plan sugerido...');
        let suggestedPlan = null;
        if (availablePlans.length > 0 && totalConnections > 0) {
            console.log(`  🔍 Buscando plan para ${totalConnections} conexiones...`);
            
            // Buscar el plan más económico que cubra las conexiones
            for (const plan of availablePlans) {
                const planLimit = plan.connection_limit;
                const covers = !planLimit || planLimit >= totalConnections;
                console.log(`  📋 Evaluando ${plan.name}: límite=${planLimit || 'ilimitado'}, cubre=${covers}`);
                
                if (covers) {
                    suggestedPlan = {
                        id: plan.id,
                        name: plan.name,
                        price: parseFloat(plan.price),
                        connection_limit: plan.connection_limit,
                        price_per_connection: parseFloat(plan.price_per_connection || 0),
                        features: plan.features,
                        reason: `Cubre ${totalConnections} conexiones con el menor costo`
                    };
                    console.log(`  ✅ Plan seleccionado: ${plan.name} ($${plan.price})`);
                    break;
                }
            }
            
            // Si ningún plan tiene límite suficiente, usar el de mayor capacidad
            if (!suggestedPlan && availablePlans.length > 0) {
                const highestPlan = availablePlans[availablePlans.length - 1];
                console.log(`  ⚠️ Ningún plan cubre ${totalConnections} conexiones, usando plan mayor: ${highestPlan.name}`);
                suggestedPlan = {
                    id: highestPlan.id,
                    name: highestPlan.name,
                    price: parseFloat(highestPlan.price),
                    connection_limit: highestPlan.connection_limit,
                    price_per_connection: parseFloat(highestPlan.price_per_connection || 0),
                    features: highestPlan.features,
                    reason: `Plan de mayor capacidad disponible (${totalConnections} conexiones exceden límites)`
                };
            }
        } else {
            console.log(`  ℹ️ No se puede calcular plan: planes=${availablePlans.length}, conexiones=${totalConnections}`);
        }
        
        // 10. Preparar respuesta final
        const responseData = {
            user_id: parseInt(userId),
            user_name: userExists[0].nombre,
            total_active: totalActive,
            total_suspended: totalSuspended,
            total_connections: totalConnections,
            isps: ispBreakdown,
            suggested_plan: suggestedPlan
        };
        
        console.log('  📤 Respuesta final preparada:', {
            user_id: responseData.user_id,
            user_name: responseData.user_name,
            totals: {
                active: responseData.total_active,
                suspended: responseData.total_suspended,
                total: responseData.total_connections
            },
            isps_count: responseData.isps.length,
            has_suggested_plan: !!responseData.suggested_plan,
            suggested_plan_name: responseData.suggested_plan?.name
        });
        
        res.json({
            success: true,
            data: responseData,
            message: 'Conexiones y plan sugerido calculados exitosamente'
        });
        
        console.log('  ✅ Respuesta enviada exitosamente');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('  ❌ ERROR en getUserConnectionsCount:', error);
        console.error('  📋 Stack trace:', error.stack);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
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

## 🔗 **ENDPOINT ESPECIFICACIÓN:**

**URL:** `GET /api/usuarios/connections-count?user_id=123`
**Autenticación:** ❌ **No requerida** (Endpoint público)

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "user_name": "Juan Pérez",
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
      "features": ["Dashboard avanzado", "Soporte prioritario"],
      "reason": "Cubre 757 conexiones con el menor costo"
    }
  },
  "message": "Conexiones y plan sugerido calculados exitosamente"
}
```

**Response de error:**
```json
{
  "success": false,
  "message": "user_id es requerido como parámetro de consulta"
}
```

## 🧪 **TESTING:**

```bash
# ✅ Consulta pública con user_id
curl -X GET "https://wellnet-rd.com:444/api/usuarios/connections-count?user_id=123" \
  -H "Content-Type: application/json"

# ❌ Sin user_id - Error apropiado
curl -X GET "https://wellnet-rd.com:444/api/usuarios/connections-count" \
  -H "Content-Type: application/json"
```

## 🎯 **VENTAJAS DEL ENDPOINT PÚBLICO:**

1. **Sin token requerido** - Acceso directo con solo user_id
2. **Validación robusta** - Verifica usuario activo antes de procesar
3. **Información completa** - Incluye nombre del usuario y desglose por ISP
4. **Cálculo automático** - Backend determina el plan óptimo
5. **Respuesta enriquecida** - Razón de la sugerencia incluida

**Con este endpoint público, cualquier usuario puede consultar sus tarifas solo proporcionando su ID de usuario.** 🎉