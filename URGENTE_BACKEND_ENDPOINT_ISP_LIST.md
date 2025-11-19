# 🚨 URGENTE - Endpoint de Lista de ISPs No Responde

## Error Reportado

```
ERROR  ❌ [ISP-LIST] Error al cargar la lista de ISPs: [TypeError: Network request failed]
```

---

## 📍 Endpoint Afectado

```
POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp
```

**Request Body**:
```json
{
  "id": <usuario_id>
}
```

**Código Frontend** (`src/pantallas/superAdmin/ispScreen.tsx` líneas 154-160):
```typescript
const response = await fetch('https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: usuarioId }),
});
```

**Respuesta Esperada**:
```json
{
  "isp_asignados": [
    {
      "id_isp": 1,
      "nombre": "ISP Example",
      "direccion": "...",
      "telefono": "...",
      "email": "...",
      "pagina_web": "..."
    }
  ]
}
```

---

## 🔍 Diagnóstico Requerido

### 1. Verificar que el Endpoint Existe

```bash
# Buscar en el código del backend
grep -r "super-admin-usuario-isp" routes/
grep -r "super-admin-usuario-isp" controllers/

# Verificar rutas registradas
grep -r "POST.*usuarios" routes/
```

**Esperado**: Debe existir una ruta registrada para este endpoint.

### 2. Probar el Endpoint Manualmente

```bash
# Reemplazar <USER_ID> con un ID de usuario válido (ej: 1, 2, 3)
curl -k -v -X POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp \
  -H "Content-Type: application/json" \
  -d '{"id": <USER_ID>}'
```

**Resultado esperado**: Debe devolver JSON con la lista de ISPs asignados.

### 3. Revisar Logs del Backend

```bash
# Ver logs en tiempo real
pm2 logs --lines 100

# O logs del sistema
journalctl -u wellnet-backend -n 100 --no-pager

# Buscar errores específicos de este endpoint
pm2 logs | grep "super-admin-usuario-isp"
pm2 logs | grep "usuarios/super-admin"
```

**Buscar**:
- Errores SQL
- Errores de conexión a base de datos
- Excepciones de Python/Node.js
- Timeouts

### 4. Verificar Tabla de ISPs en la Base de Datos

```sql
-- Verificar que la tabla existe
SHOW TABLES LIKE 'isps';

-- Ver estructura de la tabla
DESCRIBE isps;

-- Ver datos de ejemplo
SELECT id_isp, nombre, direccion, telefono, email, pagina_web
FROM isps
LIMIT 5;

-- Verificar relación usuario-isp
SELECT
    u.id,
    u.nombre,
    u.tipo_usuario,
    GROUP_CONCAT(i.nombre) as isps_asignados
FROM usuarios u
LEFT JOIN usuario_isp ui ON u.id = ui.id_usuario
LEFT JOIN isps i ON ui.id_isp = i.id_isp
WHERE u.tipo_usuario = 'super_admin'
GROUP BY u.id;
```

---

## 🛠️ Posibles Causas y Soluciones

### Causa 1: Endpoint No Implementado

**Síntomas**:
- Backend devuelve 404
- No hay ruta registrada
- Logs muestran "Cannot POST /api/usuarios/super-admin-usuario-isp"

**Solución**: Implementar el endpoint

```javascript
// routes/usuarios.js o similar
router.post('/super-admin-usuario-isp', async (req, res) => {
  try {
    const { id } = req.body;

    console.log('📋 [ISP-LIST] Obteniendo ISPs para usuario:', id);

    // Query a la base de datos
    const query = `
      SELECT
        i.id_isp,
        i.nombre,
        i.direccion,
        i.telefono,
        i.email,
        i.pagina_web
      FROM usuario_isp ui
      INNER JOIN isps i ON ui.id_isp = i.id_isp
      WHERE ui.id_usuario = ?
      ORDER BY i.nombre ASC
    `;

    const [rows] = await db.query(query, [id]);

    console.log(`✅ [ISP-LIST] ${rows.length} ISPs encontrados para usuario ${id}`);

    res.json({
      isp_asignados: rows
    });

  } catch (error) {
    console.error('❌ [ISP-LIST] Error:', error);
    res.status(500).json({
      error: 'Error al obtener la lista de ISPs',
      details: error.message
    });
  }
});
```

---

### Causa 2: Error de SQL o Base de Datos

**Síntomas**:
- Backend devuelve 500
- Logs muestran errores SQL
- Tabla no existe o query mal formado

**Solución**: Verificar y corregir query SQL

```bash
# Conectar a MySQL y probar query
mysql -u well -p'874494Aa.' wellnetrddb

# Probar query manualmente
SELECT
  i.id_isp,
  i.nombre,
  i.direccion,
  i.telefono,
  i.email,
  i.pagina_web
FROM usuario_isp ui
INNER JOIN isps i ON ui.id_isp = i.id_isp
WHERE ui.id_usuario = 1
ORDER BY i.nombre ASC;
```

Si la tabla `usuario_isp` no existe, crearla:

```sql
CREATE TABLE IF NOT EXISTS usuario_isp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_isp INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_usuario_isp (id_usuario, id_isp),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_isp) REFERENCES isps(id_isp) ON DELETE CASCADE
);
```

---

### Causa 3: Usuario Sin ISPs Asignados

**Síntomas**:
- Backend responde OK pero con lista vacía
- No hay error pero el array está vacío

**Solución**: Asignar ISPs al usuario

```sql
-- Ver usuario
SELECT id, nombre, tipo_usuario FROM usuarios WHERE id = 1;

-- Asignar ISP al usuario
INSERT INTO usuario_isp (id_usuario, id_isp)
VALUES (1, 1)  -- Usuario 1, ISP 1
ON DUPLICATE KEY UPDATE id_usuario = id_usuario;

-- Verificar asignación
SELECT
  u.nombre AS usuario,
  i.nombre AS isp
FROM usuario_isp ui
INNER JOIN usuarios u ON ui.id_usuario = u.id
INNER JOIN isps i ON ui.id_isp = i.id_isp
WHERE ui.id_usuario = 1;
```

---

### Causa 4: Backend Caído o Puerto Bloqueado

**Síntomas**:
- "Network request failed"
- No llega ninguna petición al backend
- Timeout inmediato

**Solución**: Verificar backend

```bash
# Ver estado
pm2 status

# Ver puerto 444
netstat -tlnp | grep 444

# Reiniciar si es necesario
pm2 restart wellnet-backend

# Ver logs
pm2 logs --lines 50
```

---

### Causa 5: Timeout (Operación Muy Lenta)

**Síntomas**:
- Backend recibe la petición
- Query tarda mucho (>60 segundos)
- Frontend cancela antes de recibir respuesta

**Solución**: Optimizar query o aumentar timeout

```javascript
// En el endpoint, agregar timeout
router.post('/super-admin-usuario-isp', async (req, res) => {
  // Establecer timeout de 120 segundos
  req.setTimeout(120000);

  try {
    // ... código del endpoint
  } catch (error) {
    // ... manejo de errores
  }
});
```

---

## 📋 Checklist de Diagnóstico

Ejecutar en orden:

- [ ] **1. Backend está corriendo**
  ```bash
  pm2 status
  ```
  Resultado: _______

- [ ] **2. Puerto 444 está escuchando**
  ```bash
  netstat -tlnp | grep 444
  ```
  Resultado: _______

- [ ] **3. Endpoint existe en el código**
  ```bash
  grep -r "super-admin-usuario-isp" .
  ```
  Resultado: _______

- [ ] **4. Probar con curl**
  ```bash
  curl -k -X POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp \
    -H "Content-Type: application/json" \
    -d '{"id": 1}'
  ```
  Resultado: _______

- [ ] **5. Revisar logs del backend**
  ```bash
  pm2 logs --lines 100
  ```
  ¿Hay errores?: _______

- [ ] **6. Verificar tabla usuario_isp**
  ```sql
  SELECT * FROM usuario_isp LIMIT 5;
  ```
  ¿Existe la tabla?: _______

- [ ] **7. Verificar datos de prueba**
  ```sql
  SELECT COUNT(*) FROM usuario_isp WHERE id_usuario = 1;
  ```
  ¿Hay ISPs asignados?: _______

---

## 🎯 Solución Rápida

Si el endpoint no existe, aquí está la implementación completa:

```javascript
// routes/usuarios.js
const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Ajustar según tu config

/**
 * Obtener lista de ISPs asignados a un super admin
 * POST /api/usuarios/super-admin-usuario-isp
 */
router.post('/super-admin-usuario-isp', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'ID de usuario es requerido'
      });
    }

    console.log('📋 [ISP-LIST] Obteniendo ISPs para usuario:', id);

    // Query optimizado con índices
    const query = `
      SELECT
        i.id_isp,
        i.nombre,
        i.direccion,
        i.telefono,
        i.email,
        i.pagina_web,
        i.fecha_creacion
      FROM usuario_isp ui
      INNER JOIN isps i ON ui.id_isp = i.id_isp
      WHERE ui.id_usuario = ?
      ORDER BY i.nombre ASC
    `;

    const [rows] = await db.query(query, [id]);

    console.log(`✅ [ISP-LIST] ${rows.length} ISPs encontrados`);

    res.json({
      success: true,
      isp_asignados: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('❌ [ISP-LIST] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la lista de ISPs',
      details: error.message
    });
  }
});

module.exports = router;
```

---

## 📊 Datos de Prueba

Si necesitas crear datos de prueba:

```sql
-- Insertar ISP de ejemplo
INSERT INTO isps (nombre, direccion, telefono, email, pagina_web)
VALUES
  ('ISP Demo 1', 'Calle 1, Santo Domingo', '809-123-4567', 'info@isp1.com', 'https://isp1.com'),
  ('ISP Demo 2', 'Calle 2, Santiago', '809-765-4321', 'info@isp2.com', 'https://isp2.com');

-- Asignar ISPs a usuario super admin (ID 1)
INSERT INTO usuario_isp (id_usuario, id_isp)
SELECT 1, id_isp FROM isps
ON DUPLICATE KEY UPDATE id_usuario = id_usuario;

-- Verificar
SELECT
  u.nombre AS usuario,
  i.nombre AS isp
FROM usuario_isp ui
INNER JOIN usuarios u ON ui.id_usuario = u.id
INNER JOIN isps i ON ui.id_isp = i.id_isp
WHERE ui.id_usuario = 1;
```

---

## 🚀 Siguiente Paso

1. Ejecuta el checklist de diagnóstico
2. Reporta los resultados
3. Si el endpoint no existe, implementa la solución rápida
4. Prueba con curl
5. Prueba desde el frontend

---

**IMPORTANTE**: También hay otro endpoint en el mismo archivo que puede tener el mismo problema:

```
POST https://wellnet-rd.com:444/api/usuarios/actualizar-isp-usuario
```

Verifica que este endpoint también funcione correctamente.
