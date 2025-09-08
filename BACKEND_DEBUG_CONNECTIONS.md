# 🚨 DEBUG - ERROR 500 EN ENDPOINT CONNECTIONS-COUNT

## 📋 **PROBLEMA IDENTIFICADO:**

El endpoint `/api/usuarios/connections-count?user_id=1` está devolviendo Error 500 interno del servidor.

## 🔍 **LOGS DEL FRONTEND:**
```
LOG  🔍 [FRONTEND] Enviando request al backend:
  📋 URL: https://wellnet-rd.com:444/api/usuarios/connections-count?user_id=1
  👤 User ID: 1
  
LOG  📥 [FRONTEND] Respuesta recibida del backend:
  📊 Response status: 500
  📋 Response data: {"success": false, "message": "Error interno del servidor"}
```

## 🧪 **PASOS PARA DEBUG:**

### 1. **Verificar tabla `usuarios`:**
```sql
SELECT id, nombre, activo FROM usuarios WHERE id = 1;
```

### 2. **Verificar tabla `usuarios_isp`:**
```sql
SELECT usuario_id, isp_id, activo FROM usuarios_isp WHERE usuario_id = 1;
```

### 3. **Verificar tabla `conexiones` y estados:**
```sql
-- Ver estructura de la tabla
DESCRIBE conexiones;

-- Ver estados disponibles
SELECT DISTINCT id_estado_conexion FROM conexiones LIMIT 10;

-- Ver si hay conexiones para los ISPs del usuario
SELECT 
    isp_id, 
    id_estado_conexion, 
    COUNT(*) as count 
FROM conexiones 
WHERE isp_id IN (
        SELECT isp_id 
        FROM usuarios_isp 
        WHERE usuario_id = 1 AND activo = 1
    )
GROUP BY isp_id, id_estado_conexion;
```

### 4. **Verificar tabla `isps`:**
```sql
SELECT id, nombre_isp FROM isps WHERE id IN (
    SELECT isp_id FROM usuarios_isp WHERE usuario_id = 1
);
```

## 🔧 **POSIBLES CAUSAS DEL ERROR 500:**

1. **Tabla no existe**: Una de las tablas (usuarios, usuarios_isp, conexiones, isps) no existe
2. **Columnas incorrectas**: Los nombres de columnas no coinciden con el código
3. **Datos faltantes**: El usuario 1 no tiene ISPs asignados o no existe
4. **Estados incorrectos**: Los estados de conexión (3, 4, 5, 6, 7) no existen en la BD
5. **Timeout de BD**: La consulta es muy lenta

## 📝 **ENDPOINT SIMPLIFICADO PARA TESTING:**

```javascript
// Version simplificada para debug
const getUserConnectionsCount = async (req, res) => {
    try {
        console.log('🔍 [DEBUG] Iniciando conexiones count...');
        const userId = req.query.user_id;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'user_id requerido'
            });
        }
        
        // Test 1: Verificar usuario
        console.log('🔍 [DEBUG] Verificando usuario...');
        const [userCheck] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?', 
            [userId]
        );
        
        if (userCheck.length === 0) {
            return res.json({
                success: false,
                message: 'Usuario no encontrado',
                debug: { userId, userCheck: userCheck.length }
            });
        }
        
        console.log('✅ [DEBUG] Usuario encontrado:', userCheck[0]);
        
        // Test 2: Verificar ISPs del usuario
        console.log('🔍 [DEBUG] Verificando ISPs...');
        const [userIsps] = await db.execute(
            'SELECT isp_id FROM usuarios_isp WHERE usuario_id = ?', 
            [userId]
        );
        
        console.log('✅ [DEBUG] ISPs encontrados:', userIsps.length);
        
        // Respuesta simplificada
        res.json({
            success: true,
            data: {
                totals: {
                    active: 0,
                    suspended: 0,
                    low_voluntary: 0,
                    low_forced: 0,
                    damaged: 0,
                    total: 0
                },
                isp_details: [],
                user_isps: userIsps.map(isp => isp.isp_id)
            },
            debug: {
                user_found: userCheck.length > 0,
                user_name: userCheck[0]?.nombre,
                isps_count: userIsps.length
            }
        });
        
    } catch (error) {
        console.error('❌ [DEBUG] Error específico:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            debug: {
                error_name: error.name,
                error_message: error.message,
                error_code: error.code
            }
        });
    }
};
```

## 🎯 **ACCIÓN REQUERIDA:**

1. **Revisar logs del servidor** backend para ver el error específico
2. **Verificar estructura de BD** con las consultas SQL de arriba
3. **Implementar versión simplificada** del endpoint para aislar el problema
4. **Confirmar que el endpoint está registrado** correctamente en las rutas

Una vez identifiques la causa específica del error 500, podemos corregir el problema en el backend.