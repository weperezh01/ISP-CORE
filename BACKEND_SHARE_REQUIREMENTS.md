# Backend Requirements for Invoice Sharing Functionality

## Overview
This document outlines the backend endpoint requirements for the invoice sharing functionality implemented in the React Native app.

## Required Endpoint

### Generate PDF Invoice
**Endpoint:** `POST /api/generar-pdf-factura`
**Purpose:** Generate a PDF version of an invoice for sharing

#### Request Body
```json
{
  "id_factura": 44432,
  "datos_factura": {
    "factura": {
      "id_factura": 44432,
      "id_isp": 29,
      "ncf": "B0100000001",
      "id_cliente": 7525,
      "id_ciclo": 897,
      "id_conexion": 5596,
      "monto_total": "1000.00",
      "monto_pendiente": "0.00",
      "monto_recibido": "0.00",
      "subtotal": "1000.00",
      "descuento": "0.00",
      "fecha_emision": "2025-06-01T04:00:00.000Z",
      "hora_emision": "16:30:01",
      "estado": "pendiente",
      "fecha_cobrada": null,
      "descripcion": "Mensualidad",
      "notas": null,
      "metodo_pago": null,
      
      // Impuestos Principales
      "itbis": "0.00",
      "impuesto_selectivo": "0.00",
      "isr": "0.00",
      "impuesto_cheques": "0.00",
      "cdt_monto": "0.00",
      
      // Impuestos Adicionales RD
      "impuesto_patrimonio_monto": "0.00",
      "impuesto_sucesion_monto": "0.00",
      "impuesto_activos_monto": "0.00",
      "impuesto_vehiculos_monto": "0.00",
      "impuesto_ganancia_capital_monto": "0.00",
      "impuesto_transferencia_inmobiliaria_monto": "0.00",
      "impuesto_monto": null
    },
    "cliente": {
      "id_cliente": 7525,
      "nombres": "Jose Norberto",
      "apellidos": "Gonzales",
      "telefono1": "8298731647",
      "direccion": "Los Gonzales, Ent. La caballeriza",
      "cedula": "12345678901",
      "correo_elect": "cliente@email.com"
    },
    "conexion": {
      "id_conexion": 5596,
      "direccion": "Los gonzales, Ent. La caballeriza",
      "estado_conexion": "Activa",
      "direccion_ipv4": "10.205.0.79"
    },
    "isp": {
      "id_isp": 29,
      "nombre": "Blasterlink",
      "direccion": "Santa Rosa",
      "telefono": "8295510140",
      "rnc": "1234567890"
    },
    "articulos": [
      {
        "id_articulo": 47186,
        "id_factura": 44432,
        "id_producto_servicio": null,
        "id_conexion": null,
        "descripcion": "Internet 20 Mbps",
        "cantidad_articulo": "1.00",
        "precio_unitario": "1000.00",
        "descuento_porcentaje": null,
        "descuento_monto": "0.00",
        "sub_total": "1000.00",
        "total": "1000.00",
        
        // Impuestos por artículo - Principales
        "isr_porcentaje": "0.00",
        "isr_monto": "0.00",
        "itbis_porcentaje": "0.00",
        "itbis_monto": "0.00",
        "impuesto_selectivo_porcentaje": "0.00",
        "impuesto_selectivo_monto": "0.00",
        "cdt_porcentaje": "0.00",
        "cdt_monto": "0.00",
        
        // Impuestos por artículo - Adicionales RD
        "impuesto_patrimonio_porcentaje": "0.00",
        "impuesto_patrimonio_monto": "0.00",
        "impuesto_sucesion_porcentaje": "0.00",
        "impuesto_sucesion_monto": "0.00",
        "impuesto_activos_porcentaje": "0.00",
        "impuesto_activos_monto": "0.00",
        "impuesto_cheques_porcentaje": "0.00",
        "impuesto_cheques_monto": "0.00",
        "impuesto_vehiculos_porcentaje": "0.00",
        "impuesto_vehiculos_monto": "0.00",
        "impuesto_ganancia_capital_porcentaje": "0.00",
        "impuesto_ganancia_capital_monto": "0.00",
        "impuesto_transferencia_inmobiliaria_porcentaje": "0.00",
        "impuesto_transferencia_inmobiliaria_monto": "0.00",
        "impuesto_porcentaje": null,
        "impuesto_monto": "0.00",
        
        "fecha": "2025-06-01T04:00:00.000Z",
        "codigo": null,
        "tipo_articulo": null,
        "unidad_medida": null,
        "notas": null,
        "estado": "pendiente",
        "reconexion": "N",
        "reconexion_cargo": "N"
      }
    ]
  }
}
```

#### Success Response
```json
{
  "success": true,
  "message": "PDF generado exitosamente",
  "pdfUrl": "https://wellnet-rd.com:444/files/invoices/factura_44432_20250627.pdf",
  "fileName": "factura_44432_20250627.pdf",
  "generatedAt": "2025-06-27T15:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error al generar PDF",
  "error": "Detalles del error"
}
```

## Implementation Recommendations

### 1. PDF Generation Library
Use a robust PDF generation library like:
- **PDFKit** (Node.js)
- **Puppeteer** (HTML to PDF)
- **jsPDF** (Client-side generation)

### 2. File Storage
- Store generated PDFs in a secure, accessible location
- Use timestamped filenames to avoid conflicts
- Consider implementing file cleanup for old PDFs

### 3. PDF Template Design
The PDF should include:

#### Header Section
- ISP logo (if available)
- ISP name, address, phone, RNC
- Invoice title and number
- Generation date

#### Client Information
- Client name and contact details
- Client address
- Client ID/Cedula/RNC

#### Connection Details
- Connection ID and address
- Service type and status
- IP address (if applicable)

#### Invoice Details
- Invoice date and NCF
- Invoice status
- Payment terms

#### Items Table
```
| Cant. | Descripción | Precio Unit. | Importe |
|-------|-------------|--------------|---------|
| 1.00  | Internet... | RD$ 1,000.00 | RD$ 1,000.00 |
```

#### Totals Section (Conforme a DGII)
```
Subtotal:                                    RD$ 1,000.00
(-) Descuento:                              RD$     0.00
                                            -----------
Subtotal después de descuento:              RD$ 1,000.00

IMPUESTOS APLICABLES:
(+) ITBIS (18%):                            RD$     0.00
(+) Impuesto Selectivo:                     RD$     0.00
(+) ISR (Retención):                        RD$     0.00
(+) CDT (Contribución Desarrollo Telecomunicaciones): RD$ 0.00
(+) Impuesto sobre Cheques:                 RD$     0.00
(+) Impuesto sobre Activos:                 RD$     0.00
(+) Impuesto sobre Patrimonio:              RD$     0.00
(+) Impuesto sobre Sucesiones:              RD$     0.00
(+) Impuesto sobre Vehículos:               RD$     0.00
(+) Impuesto sobre Ganancia Capital:        RD$     0.00
(+) Impuesto Transferencia Inmobiliaria:    RD$     0.00
                                            -----------
TOTAL IMPUESTOS:                            RD$     0.00
                                            ===========
TOTAL A PAGAR:                              RD$ 1,000.00
                                            ===========

CONDICIONES DE PAGO: Contado
VENCIMIENTO: [Fecha + días de gracia]
MONEDA: Pesos Dominicanos (DOP)
```

#### Footer (Requerimientos DGII)
- **NCF (Número de Comprobante Fiscal)**: Obligatorio para facturas válidas
- **RNC del ISP**: Registro Nacional del Contribuyente
- **Condiciones de Pago**: Especificar términos y plazos
- **Información Legal**: "Esta factura cumple con las normas fiscales vigentes"
- **Validez**: "Válida sin sello ni firma (Ley 11-92)"
- **Contacto**: Información completa del ISP para consultas
- **Método de Pago**: Efectivo, transferencia, cheque, etc.

#### Requerimientos Especiales para Telecomunicaciones RD

##### NCF (Número de Comprobante Fiscal)
- **Formato**: B01 + 8 dígitos secuenciales
- **Ejemplo**: B0100000001
- **Validación**: Debe ser válido según DGII
- **Obligatorio**: Para todas las facturas comerciales

##### Impuestos Específicos del Sector
1. **ITBIS (18%)**: Impuesto sobre transferencias de bienes industrializados
2. **CDT**: Contribución al Desarrollo de las Telecomunicaciones
3. **Impuesto Selectivo**: Aplicable a ciertos servicios
4. **ISR**: Retención en la fuente cuando aplique

##### Campos Obligatorios
- RNC del cliente (para facturas comerciales)
- Cédula del cliente (para facturas de consumo)
- Dirección completa del servicio
- Descripción detallada del servicio
- Periodo de facturación
- Fecha de vencimiento

##### Formato de Moneda
- Usar "RD$" como símbolo de moneda
- Formato numérico: 1,000.00 (comas para miles, punto para decimales)
- Dos decimales obligatorios

##### Información de Ciclo de Facturación
- Mostrar período facturado (inicio - fin)
- Indicar próxima fecha de facturación
- Mostrar días de gracia antes del corte

### 4. Security Considerations
- Validate all input data
- Sanitize client information
- Implement rate limiting
- Use HTTPS for file URLs
- Consider authentication/authorization

### 5. File Management
```javascript
// Example file structure
/files/invoices/
  ├── 2025/
  │   ├── 06/
  │   │   ├── factura_44432_20250627.pdf
  │   │   └── factura_44433_20250627.pdf
  │   └── 07/
  └── temp/ (for cleanup)
```

### 6. Error Handling
Handle common scenarios:
- Invalid invoice data
- Missing client information
- PDF generation failures
- File storage issues
- Network connectivity problems

## Testing Scenarios

### Test Cases
1. **Valid Invoice Data**: Complete invoice with all fields
2. **Missing Optional Fields**: Invoice without some optional data
3. **Invalid Data Types**: Wrong data formats
4. **Large Invoices**: Multiple articles and complex calculations
5. **Special Characters**: Names/addresses with accents and symbols

### Example Test Request
```bash
curl -X POST https://wellnet-rd.com:444/api/generar-pdf-factura \
  -H "Content-Type: application/json" \
  -d '{
    "id_factura": 44432,
    "datos_factura": {
      // ... invoice data
    }
  }'
```

## Integration Notes

The React Native app will:
1. Call the endpoint with complete invoice data
2. Display a loading message while PDF generates
3. Use the returned URL to share via native Share API
4. Handle errors gracefully with user-friendly messages

The sharing flow supports:
- **WhatsApp**: Direct message to client with PDF link
- **Email**: Professional email with PDF attachment/link
- **Text Sharing**: Native share dialog with PDF link
- **General Sharing**: System share sheet for any app

## Consideraciones Legales Adicionales para RD

### Normativas Aplicables
1. **Ley 11-92**: Código Tributario de la República Dominicana
2. **Ley 139-01**: Ley de Telecomunicaciones
3. **Resoluciones DGII**: Normativas específicas sobre facturación electrónica
4. **Reglamentos INDOTEL**: Regulaciones del sector telecomunicaciones

### Responsabilidades del ISP
- Mantener secuencia correlativa de NCF
- Conservar copias de facturas por 5 años
- Reportar mensualmente a DGII
- Cumplir con tarifas aprobadas por INDOTEL

### Validaciones Requeridas
- NCF válido y en secuencia
- Todos los impuestos calculados correctamente
- Información del cliente completa y válida
- Cumplimiento de formatos oficiales DGII

### Recomendaciones Técnicas
- Implementar backup automático de facturas
- Validar NCF contra base de datos DGII
- Generar reportes fiscales automáticamente
- Mantener trazabilidad de todas las transacciones

### Campos Críticos para Auditoría
- Fecha y hora exacta de emisión
- Secuencia correlativa de facturas
- Cálculos de impuestos detallados
- Información completa del contribuyente
- Métodos de pago utilizados