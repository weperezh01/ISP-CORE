# 🌐 HACER ENDPOINT DE PLANES PÚBLICO - BACKEND REQUERIDO

## 📋 **PROBLEMA ACTUAL:**

El endpoint `GET /api/subscription-plans` requiere autenticación con token, pero necesitamos que sea público para permitir:
- 🔍 Consulta de planes sin registrarse
- ⚡ Evitar expiración de tokens de 1 hora
- 🎯 Acceso directo a PlanSelectionScreen sin login

## ⚙️ **CAMBIOS REQUERIDOS EN BACKEND:**

### **1. Archivo: `routes/subscriptionPlans.js`**

**Cambiar de:**
```javascript
// ❌ ACTUAL - Requiere autenticación para todo
router.get('/', authenticateToken, getAllPlans);
```

**A:**
```javascript
// ✅ NUEVO - Endpoint público para consultar planes
router.get('/', getAllPlans);  // Sin middleware de autenticación
```

### **2. Archivo: `controllers/subscriptionPlansController.js`**

**Modificar `getAllPlans` function:**
```javascript
// ✅ NUEVO - Función que maneja acceso público y autenticado
const getAllPlans = async (req, res) => {
    try {
        // Obtener todos los planes activos (sin filtrar por usuario/ISP)
        const query = `
            SELECT id, name, price, connection_limit, price_per_connection, 
                   features, recommended, active, created_at, updated_at
            FROM subscription_plans 
            WHERE active = true
            ORDER BY price ASC
        `;
        
        const [plans] = await db.execute(query);
        
        res.json({
            success: true,
            data: plans,
            message: 'Planes obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener planes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
```

### **3. Mantener Endpoints Privados (con autenticación):**

```javascript
// Estos endpoints SÍ deben seguir requiriendo autenticación:
router.post('/', authenticateToken, createPlan);           // Crear plan
router.put('/:id', authenticateToken, updatePlan);         // Actualizar plan  
router.delete('/:id', authenticateToken, deletePlan);      // Eliminar plan
router.patch('/:id/toggle-status', authenticateToken, togglePlanStatus); // Cambiar estado
```

## 🔒 **CONSIDERACIONES DE SEGURIDAD:**

1. **Solo GET es público** - POST, PUT, DELETE siguen protegidos
2. **Solo planes activos** - No exponer planes deshabilitados/borrador
3. **Sin datos sensibles** - No exponer información interna del ISP
4. **Rate limiting** - Considerar limite de requests por IP

## 🧪 **TESTING:**

**Request público (sin token):**
```bash
curl -X GET https://wellnet-rd.com:444/api/subscription-plans
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Plan Básico",
      "price": 0,
      "connection_limit": 25,
      "price_per_connection": 0,
      "features": ["Dashboard básico", "Soporte email"],
      "recommended": false,
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Planes obtenidos exitosamente"
}
```

## ✅ **BENEFICIOS:**

1. 🚀 **Acceso inmediato** - Sin necesidad de login inicial
2. ⏰ **Sin expiración** - No depende de tokens temporales  
3. 📱 **Mejor UX** - Usuario puede ver planes antes de registrarse
4. 🔄 **Compatibilidad** - Frontend ya preparado para esto

## 🎯 **FLUJO DE USUARIO MEJORADO:**

1. Usuario abre app → Ve PlanSelectionScreen directamente
2. Usuario revisa planes disponibles (acceso público)
3. Usuario selecciona plan → Se le pide login/registro
4. Usuario autenticado → Puede cambiar/upgradeear plan

**Con este cambio, el token de 1 hora ya no será un problema para consultar planes.** 🎉