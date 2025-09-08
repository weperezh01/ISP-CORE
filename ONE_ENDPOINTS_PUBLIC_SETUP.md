# 🌍 Configuración de Endpoints ONE Públicos

## Problema
Los endpoints `/api/one/*` están requiriendo autenticación JWT y devuelven error 401.
Los datos de ubicación geográfica de República Dominicana deberían ser públicos.

## Solución Backend Requerida

### Opción A: Middleware de Excepción (Recomendado)

En `server/server.js`, agregar ANTES de las rutas ONE:

```javascript
// Hacer endpoints ONE públicos (sin autenticación)
app.use('/api/one/*', (req, res, next) => {
  console.log(`[ONE] Public access: ${req.method} ${req.path}`);
  // Saltarse cualquier middleware de autenticación para rutas ONE
  next();
});

// Luego montar las rutas ONE
app.use('/api/one', oneRoutes);
```

### Opción B: Condicional en Middleware de Auth

Si tienes un middleware de autenticación global, modificarlo para excluir rutas ONE:

```javascript
// Middleware de autenticación
app.use((req, res, next) => {
  // Saltarse autenticación para endpoints ONE
  if (req.path.startsWith('/api/one/')) {
    return next();
  }
  
  // Aplicar autenticación normal para otras rutas
  const token = req.headers.authorization?.replace('Bearer ', '');
  // ... resto de lógica de auth
});
```

### Opción C: Rutas ONE Antes de Middleware Auth

Reorganizar el orden en `server.js`:

```javascript
// 1. Primero: Rutas públicas (ONE)
app.use('/api/one', oneRoutes);

// 2. Después: Middleware de autenticación
app.use('/api/*', authMiddleware);

// 3. Finalmente: Rutas protegidas
app.use('/api/accounting', accountingRoutes);
```

## ✅ Resultado Esperado

Después de aplicar cualquiera de las opciones:

- `GET /api/one/provincias` → ✅ 200 OK (sin auth)
- `GET /api/one/municipios?cod_provincia=32` → ✅ 200 OK (sin auth)  
- `GET /api/accounting/*` → 🔒 Requiere JWT (protegido)

## 🧪 Cómo Probar

```bash
# Esto debería funcionar SIN headers de autenticación
curl -k "https://wellnet-rd.com:444/api/one/provincias"

# Respuesta esperada:
# {"items": [{"label": "Santiago", "code": "32", "value": "Santiago"}], "total": 150}
```

## 📝 Notas

- Los datos ONE son información pública de República Dominicana
- No contienen información sensible que requiera protección
- Mejora la UX al no requerir login para selección de ubicación
- Mantiene otros endpoints protegidos apropiadamente

---
**Archivo generado por Claude Frontend**
**Fecha**: 2025-09-07