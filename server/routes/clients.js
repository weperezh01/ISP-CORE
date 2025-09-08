const express = require('express');
const mysql = require('mysql2/promise');
const { authenticateToken, verifyIspAccess } = require('../middleware/auth');
const router = express.Router();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wellnet_db',
    timezone: '+00:00' // UTC
};

/**
 * POST /api/insertar-cliente
 * 
 * Inserta un nuevo cliente con datos de ubicación ONE
 * 
 * Request Body:
 * {
 *   "usuarioId": 123,
 *   "id_isp": "12",
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "telefono1": "8091234567",
 *   "telefono2": "8097654321",
 *   "direccion": "Provincia Santiago, Municipio Moca, Sector Los Jardines",
 *   "latitud": "19.3914",
 *   "longitud": "-70.5314",
 *   "correoElect": "juan@example.com",
 *   "cedula": "00112345678",
 *   "persona_juridica": false,
 *   "rnc": null,
 *   "razon_social": null
 * }
 */
router.post('/insertar-cliente', authenticateToken, verifyIspAccess, async (req, res) => {
    let connection = null;
    
    try {
        console.log(`${new Date().toISOString()} - POST /api/insertar-cliente`);
        console.log('🏠 [CLIENT] Datos recibidos:', JSON.stringify(req.body, null, 2));
        
        const {
            usuarioId,
            id_isp,
            nombres,
            apellidos,
            telefono1,
            telefono2,
            direccion,
            latitud,
            longitud,
            correoElect,
            pasaporte,
            referencia,
            cedula,
            persona_juridica = false,
            rnc = null,
            razon_social = null,
            // Campos ONE de ubicación
            provincia,
            municipio,
            distritoMunicipal,
            seccion,
            paraje,
            // Campos adicionales de dirección
            sectorBarrio,
            calle,
            numero,
            edificio,
            apartamento,
            codigoPostal,
            referenciaExacta
        } = req.body;

        // Validar campos requeridos
        if (!nombres || !id_isp || !usuarioId) {
            console.error('❌ [CLIENT] Campos requeridos faltantes:', { nombres, id_isp, usuarioId });
            return res.status(422).json({
                success: false,
                message: 'Campos requeridos faltantes: nombres, id_isp, usuarioId'
            });
        }

        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ [CLIENT] Conexión a base de datos establecida');

        // Insertar cliente
        const insertQuery = `
            INSERT INTO clientes (
                usuario_id, 
                id_isp, 
                nombres, 
                apellidos, 
                telefono1, 
                telefono2, 
                direccion, 
                latitud, 
                longitud, 
                correo_electronico, 
                pasaporte, 
                referencia,
                cedula,
                persona_juridica,
                rnc,
                razon_social,
                fecha_creacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await connection.execute(insertQuery, [
            usuarioId,
            id_isp,
            nombres,
            apellidos,
            telefono1 || null,
            telefono2 || null,
            direccion || null,
            latitud || null,
            longitud || null,
            correoElect || null,
            pasaporte || null,
            referencia || null,
            cedula || null,
            persona_juridica,
            rnc,
            razon_social
        ]);

        console.log('✅ [CLIENT] Cliente insertado exitosamente:', {
            clienteId: result.insertId,
            affectedRows: result.affectedRows
        });

        res.status(201).json({
            success: true,
            message: 'Cliente guardado exitosamente',
            clienteId: result.insertId,
            data: {
                id: result.insertId,
                nombres,
                apellidos,
                direccion
            }
        });

    } catch (error) {
        console.error('❌ [CLIENT] Error al insertar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al guardar cliente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 [CLIENT] Conexión a base de datos cerrada');
        }
    }
});

/**
 * PUT /api/actualizar-cliente
 * 
 * Actualiza un cliente existente con datos de ubicación ONE
 */
router.put('/actualizar-cliente/:clienteId', authenticateToken, verifyIspAccess, async (req, res) => {
    let connection = null;
    
    try {
        console.log(`${new Date().toISOString()} - PUT /api/actualizar-cliente/${req.params.clienteId}`);
        console.log('🔄 [CLIENT] Datos de actualización:', JSON.stringify(req.body, null, 2));
        
        const { clienteId } = req.params;
        const {
            nombres,
            apellidos,
            telefono1,
            telefono2,
            direccion,
            latitud,
            longitud,
            correoElect,
            pasaporte,
            referencia,
            cedula,
            persona_juridica = false,
            rnc = null,
            razon_social = null
        } = req.body;

        // Validar clienteId
        if (!clienteId || isNaN(clienteId)) {
            return res.status(422).json({
                success: false,
                message: 'ID de cliente inválido'
            });
        }

        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);

        // Actualizar cliente
        const updateQuery = `
            UPDATE clientes SET 
                nombres = ?,
                apellidos = ?,
                telefono1 = ?,
                telefono2 = ?,
                direccion = ?,
                latitud = ?,
                longitud = ?,
                correo_electronico = ?,
                pasaporte = ?,
                referencia = ?,
                cedula = ?,
                persona_juridica = ?,
                rnc = ?,
                razon_social = ?,
                fecha_actualizacion = NOW()
            WHERE id = ? AND id_isp = ?
        `;

        const [result] = await connection.execute(updateQuery, [
            nombres,
            apellidos,
            telefono1 || null,
            telefono2 || null,
            direccion || null,
            latitud || null,
            longitud || null,
            correoElect || null,
            pasaporte || null,
            referencia || null,
            cedula || null,
            persona_juridica,
            rnc,
            razon_social,
            clienteId,
            req.body.id_isp || req.user.id_isp
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado o sin permisos para actualizar'
            });
        }

        console.log('✅ [CLIENT] Cliente actualizado exitosamente:', {
            clienteId,
            affectedRows: result.affectedRows
        });

        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            clienteId: parseInt(clienteId)
        });

    } catch (error) {
        console.error('❌ [CLIENT] Error al actualizar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar cliente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;