# 🏷️ Mejora Opcional: Guardar Códigos ONE

## Situación Actual
- ✅ Se guardan las **etiquetas** ONE (ej: "Santiago", "Moca")  
- ❌ NO se guardan los **códigos** ONE (ej: "32", "09-01")

## ¿Por qué guardar códigos?
- **Precisión**: Los códigos son únicos, las etiquetas pueden repetirse
- **Integración**: Facilita futuras integraciones con sistemas gubernamentales
- **Búsquedas**: Permite filtros más precisos

## Implementación

### 1. Agregar estados para códigos
```javascript
const [provinciaCodigo, setProvinciaCodigo] = useState('');
const [municipioCodigo, setMunicipioCodigo] = useState('');
const [distritoCodigo, setDistritoCodigo] = useState('');
const [seccionCodigo, setSeccionCodigo] = useState('');
const [parajeCodigo, setParajeCodigo] = useState('');
```

### 2. Actualizar onConfirm del OneLocationSelector
```javascript
onConfirm={(sel) => {
    // Labels (actual)
    setProvincia(sel.provincia?.label || '');
    setMunicipio(sel.municipio?.label || '');
    // ... resto igual
    
    // Códigos (nuevo)
    setProvinciaCodigo(sel.provincia?.code || '');
    setMunicipioCodigo(sel.municipio?.code || '');
    setDistritoCodigo(sel.distrito_municipal?.code || '');
    setSeccionCodigo(sel.seccion?.code || '');
    setParajeCodigo(sel.paraje?.code || '');
}}
```

### 3. Incluir códigos en clienteData
```javascript
const clienteData = {
    // ... campos existentes
    provincia_codigo: provinciaCodigo,
    municipio_codigo: municipioCodigo,
    distrito_codigo: distritoCodigo,
    seccion_codigo: seccionCodigo,
    paraje_codigo: parajeCodigo,
};
```

## ⚠️ Requiere Cambios en Backend
- Agregar columnas a la tabla de clientes
- Actualizar endpoints de inserción/actualización

---
**Archivo generado por Claude Frontend**