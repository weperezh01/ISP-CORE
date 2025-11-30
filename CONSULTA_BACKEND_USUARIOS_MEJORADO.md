# CONSULTA AL BACKEND: Indicadores Mejorados para Botón de Usuarios

## 📋 Contexto

El botón "Usuarios" actualmente tiene indicadores **muy básicos** (solo total, activos, inactivos). Se requiere expandir estos indicadores para mostrar información más útil y detallada sobre el equipo del ISP.

**Estado actual**:
```
┌─────────────────────────────┐
│   👥 Usuarios               │
│   Total: 45                  │
│   ▓▓▓▓▓▓▓░                  │  ← Solo activos/inactivos
└─────────────────────────────┘
```

---

## ❓ Preguntas al Backend

### 1. Estructura de Datos de Usuarios

**¿Qué información está disponible en la tabla de usuarios?**
- [ ] ID de usuario
- [ ] Nombre completo
- [ ] Email
- [ ] Teléfono
- [ ] Rol (Admin, Operador, Técnico, etc.)
- [ ] Nivel de usuario (Super Admin, Admin, Usuario normal)
- [ ] Estado (Activo/Inactivo)
- [ ] Fecha de creación
- [ ] Fecha de última actividad/login
- [ ] Permisos específicos
- [ ] Otros: _______________

### 2. Roles de Usuario Disponibles

**¿Qué roles existen en el sistema?**

Por favor, listar todos los roles disponibles:
- [ ] Mega Admin
- [ ] Super Admin
- [ ] Admin
- [ ] Operador
- [ ] Técnico
- [ ] Soporte
- [ ] Vendedor
- [ ] Instalador
- [ ] Cobranzas
- [ ] Otros: _______________

### 3. Niveles de Acceso

**¿Los usuarios tienen diferentes niveles de acceso jerárquico?**
- [ ] Mega Admin (acceso total a todo)
- [ ] Super Admin (gestiona múltiples ISPs)
- [ ] Admin (gestiona un ISP específico)
- [ ] Usuario normal (permisos limitados)
- [ ] Otros: _______________

### 4. Actividad de Usuarios

**¿Se registra la actividad de los usuarios?**
- [ ] Fecha/hora de último login
- [ ] Cantidad de logins por período
- [ ] Actividad en el sistema (acciones realizadas)
- [ ] Historial de navegación
- [ ] Otros: _______________

### 5. Estadísticas Temporales

**¿Se puede obtener información temporal sobre usuarios?**
- [ ] Usuarios creados este mes
- [ ] Usuarios creados hoy
- [ ] Usuarios activos en las últimas 24 horas
- [ ] Usuarios que nunca han iniciado sesión
- [ ] Otros: _______________

### 6. Permisos Granulares

**¿Los usuarios tienen permisos específicos por módulo?**
- [ ] Permiso para módulo de Clientes
- [ ] Permiso para módulo de Facturaciones
- [ ] Permiso para módulo de Conexiones
- [ ] Permiso para módulo de SMS
- [ ] Permiso para módulo de Reportes
- [ ] Etc.

---

## 💡 Propuestas de Indicadores Mejorados para la UI

### Opción A: Indicadores con Roles y Actividad (Recomendado)
```
┌─────────────────────────────┐
│   👥 Usuarios               │
│                              │
│   Total: 45                  │
│   ▓▓▓▓▓▓▓░                  │
│   🟢 Activos: 38             │
│   ⚪ Inactivos: 7            │
│                              │
│   Top Roles:                 │
│   • Técnico: 18 (40%)        │
│   • Operador: 12 (27%)       │
│   • Admin: 5 (11%)           │
│                              │
│   📊 Este mes: 3 nuevos      │
│   🔐 Activos hoy: 22         │
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalUsuarios`: Total de usuarios
- `activos`: Usuarios habilitados
- `inactivos`: Usuarios deshabilitados
- `rolesPrincipales`: Array con top 3 roles más comunes
- `estadisticasTiempo`:
  - `usuariosEsteMes`: Usuarios creados este mes
  - `usuariosActivosHoy`: Usuarios que iniciaron sesión hoy
- `estadisticasActividad`:
  - `ultimaActividad`: Fecha de última actividad general
  - `usuariosSinActividad`: Usuarios que nunca iniciaron sesión

### Opción B: Indicadores por Nivel de Acceso
```
┌─────────────────────────────┐
│   👥 Usuarios               │
│                              │
│   Total: 45                  │
│   ▓▓▓▓▓▓▓░                  │
│                              │
│   👑 Admins: 5               │
│   👔 Operadores: 12          │
│   🔧 Técnicos: 18            │
│   💼 Soporte: 8              │
│   📊 Vendedores: 2           │
│                              │
│   🟢 Activos: 38             │
│   📆 Nuevos este mes: 3      │
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalUsuarios`: Total de usuarios
- `usuariosPorRol`: Objeto detallado con todos los roles
  ```json
  {
    "Admin": 5,
    "Operador": 12,
    "Técnico": 18,
    "Soporte": 8,
    "Vendedor": 2
  }
  ```
- `activos`: Usuarios activos
- `estadisticasTiempo`:
  - `usuariosEsteMes`: Usuarios creados este mes

### Opción C: Indicadores Completos con Métricas Avanzadas
```
┌─────────────────────────────┐
│   👥 Usuarios               │
│                              │
│   Total: 45                  │
│   ▓▓▓▓▓▓▓░                  │
│   🟢 Activos: 38 (84%)       │
│   ⚪ Inactivos: 7 (16%)      │
│                              │
│   Distribución:              │
│   • Técnico: 18              │
│   • Operador: 12             │
│   • Admin: 5                 │
│                              │
│   Actividad:                 │
│   🔐 Activos hoy: 22 (49%)   │
│   📊 Nuevos mes: 3           │
│   ⚠️  Sin actividad: 8       │
│                              │
│   Eficiencia equipo: 88%     │
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalUsuarios`: Total
- `activos`: Usuarios habilitados
- `inactivos`: Usuarios deshabilitados
- `porcentajeActivos`: % de usuarios activos
- `rolesPrincipales`: Top 3 roles
- `estadisticasActividad`:
  - `usuariosActivosHoy`: Logins hoy
  - `porcentajeActivosHoy`: % de usuarios que iniciaron sesión hoy
  - `usuariosSinActividad`: Usuarios que nunca iniciaron sesión
- `estadisticasTiempo`:
  - `usuariosEsteMes`: Creados este mes
- `eficienciaEquipo`: Métrica calculada de productividad (opcional)

---

## 🎯 Recomendación del Frontend

**Recomiendo implementar la Opción A** (Indicadores con Roles y Actividad) porque:
1. Muestra información útil sin saturar la UI
2. Incluye métricas de actividad importantes
3. Destaca los roles más comunes (útil para gestión)
4. Mantiene consistencia visual con otros botones
5. Es escalable para futuras mejoras

---

## 📊 Estructura JSON Propuesta (Opción A - Recomendada)

```json
{
  "success": true,
  "data": {
    "totalUsuarios": 45,
    "activos": 38,
    "inactivos": 7,
    "porcentajeActivos": 84.44,
    "rolesPrincipales": [
      {
        "rol": "Técnico",
        "cantidad": 18,
        "porcentaje": 40.0
      },
      {
        "rol": "Operador",
        "cantidad": 12,
        "porcentaje": 26.67
      },
      {
        "rol": "Admin",
        "cantidad": 5,
        "porcentaje": 11.11
      }
    ],
    "estadisticasTiempo": {
      "usuariosEsteMes": 3,
      "usuariosHoy": 0
    },
    "estadisticasActividad": {
      "usuariosActivosHoy": 22,
      "porcentajeActivosHoy": 48.89,
      "usuariosSinActividad": 8,
      "ultimaActividad": "2025-11-30T14:30:00Z"
    },
    "distribucionCompleta": {
      "Admin": 5,
      "Operador": 12,
      "Técnico": 18,
      "Soporte": 8,
      "Vendedor": 2
    }
  }
}
```

---

## 📝 Consultas SQL Sugeridas (Para Referencia)

```sql
-- Total y estados básicos
SELECT
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN estado = 'activo' OR activo = TRUE THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN estado = 'inactivo' OR activo = FALSE THEN 1 ELSE 0 END) as inactivos
FROM usuarios
WHERE id_isp = ?;

-- Distribución por roles
SELECT
    r.nombre_rol as rol,
    COUNT(u.id_usuario) as cantidad,
    (COUNT(u.id_usuario) * 100.0 / (SELECT COUNT(*) FROM usuarios WHERE id_isp = ?)) as porcentaje
FROM usuarios u
INNER JOIN roles r ON u.id_rol = r.id_rol
WHERE u.id_isp = ?
GROUP BY r.id_rol, r.nombre_rol
ORDER BY cantidad DESC
LIMIT 3;

-- Estadísticas de tiempo
SELECT
    SUM(CASE WHEN DATE_FORMAT(fecha_creacion, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END) as usuarios_este_mes,
    SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 ELSE 0 END) as usuarios_hoy
FROM usuarios
WHERE id_isp = ?;

-- Actividad de usuarios (si hay tabla de sesiones/logs)
SELECT
    COUNT(DISTINCT u.id_usuario) as usuarios_activos_hoy
FROM usuarios u
INNER JOIN sesiones s ON u.id_usuario = s.id_usuario
WHERE u.id_isp = ? AND DATE(s.fecha_login) = CURDATE();

-- Usuarios sin actividad
SELECT
    COUNT(*) as usuarios_sin_actividad
FROM usuarios u
LEFT JOIN sesiones s ON u.id_usuario = s.id_usuario
WHERE u.id_isp = ? AND s.id_sesion IS NULL;

-- Última actividad general
SELECT
    MAX(s.fecha_login) as ultima_actividad
FROM sesiones s
INNER JOIN usuarios u ON s.id_usuario = u.id_usuario
WHERE u.id_isp = ?;
```

---

## 🔍 Campos Adicionales Útiles (Opcionales)

Si el backend puede proporcionar estos datos, serían muy valiosos:

### Métricas de Productividad
- **Usuarios más activos**: Top 5 usuarios con más logins/acciones
- **Tasa de utilización**: % de usuarios que usan el sistema regularmente
- **Promedio de sesiones por usuario**: Cuántas veces inicia sesión cada usuario

### Seguridad y Auditoría
- **Intentos de login fallidos**: Alertar sobre posibles problemas de seguridad
- **Usuarios con sesión expirada**: Usuarios que no han iniciado sesión en X días
- **Cambios recientes**: Usuarios creados, modificados o eliminados recientemente

### Gestión de Equipo
- **Usuarios por zona/área**: Si hay asignación geográfica
- **Carga de trabajo**: Tareas/órdenes asignadas por usuario
- **Disponibilidad**: Usuarios en turno activo

---

## ✅ Solicitud al Backend

**Por favor, responder las siguientes preguntas:**

1. **¿Qué información adicional sobre usuarios está disponible en la BD?**
   - Respuesta: _______________

2. **¿Se registra la actividad de usuarios (logins, acciones)?**
   - Respuesta: _______________

3. **¿Qué roles/niveles de usuario existen?**
   - Respuesta: _______________

4. **¿Cuál de las 3 opciones propuestas (A, B, o C) es más factible implementar?**
   - Respuesta: _______________

5. **¿Hay tablas relacionadas (sesiones, actividad, permisos)?**
   - Respuesta: _______________

6. **¿Hay alguna métrica adicional que sugieras mostrar?**
   - Respuesta: _______________

---

## 🚀 Próximos Pasos

1. Backend responde las preguntas de este documento
2. Frontend actualiza `REQUERIMIENTO_BACKEND_TOTALES_USUARIOS.md` con los indicadores mejorados
3. Backend implementa/actualiza el endpoint `GET /api/totales-usuarios/{ispId}`
4. Frontend actualiza la UI del botón con los nuevos indicadores

---

## 📊 Comparación con Estado Actual

### Actual (Básico)
```json
{
  "totalUsuarios": 45,
  "activos": 38,
  "inactivos": 7,
  "roles": { ... }  // opcional, no se usa visualmente
}
```

### Propuesto (Mejorado - Opción A)
```json
{
  "totalUsuarios": 45,
  "activos": 38,
  "inactivos": 7,
  "rolesPrincipales": [...],           // ⭐ NUEVO
  "estadisticasTiempo": {...},         // ⭐ NUEVO
  "estadisticasActividad": {...}       // ⭐ NUEVO
}
```

---

**Fecha de creación**: 2025-11-30
**Esperando respuesta del backend**
