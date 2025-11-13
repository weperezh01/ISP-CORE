/**
 * Función para registrar eventos de factura
 *
 * Registra todas las acciones que un usuario realiza sobre una factura
 * en la base de datos para mantener un historial completo de auditoría
 *
 * @param {number} id_factura - ID de la factura
 * @param {number} id_usuario - ID del usuario que realiza la acción
 * @param {string} tipoEvento - Tipo de evento (ej: "Factura creada", "Artículo agregado")
 * @param {string} descripcion - Descripción detallada del evento
 * @param {string} detalles - Detalles adicionales opcionales (JSON stringificado)
 * @returns {Promise<boolean>} - true si se registró exitosamente, false si hubo error
 */
const registrarEventoFactura = async (
    id_factura,
    id_usuario,
    tipoEvento,
    descripcion = '',
    detalles = ''
) => {
    try {
        // Obtener fecha y hora en zona horaria de República Dominicana (America/Santo_Domingo - UTC-4)
        const fechaActual = new Date();

        // Convertir a hora de República Dominicana usando toLocaleString con opciones específicas
        const opcionesRD = {
            timeZone: 'America/Santo_Domingo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const partes = new Intl.DateTimeFormat('en-US', opcionesRD).formatToParts(fechaActual);

        // Extraer los valores de las partes
        const valores = {};
        partes.forEach(parte => {
            if (parte.type !== 'literal') {
                valores[parte.type] = parte.value;
            }
        });

        // Formatear fecha YYYY-MM-DD
        const fecha = `${valores.year}-${valores.month}-${valores.day}`;

        // Formatear hora HH:MM:SS
        const hora = `${valores.hour}:${valores.minute}:${valores.second}`;

        // Formatear fecha_hora completa en formato MySQL DATETIME
        const fecha_hora = `${fecha} ${hora}`;

        const eventoData = {
            id_factura,
            id_usuario,
            tipo_evento: tipoEvento,
            descripcion,
            detalles,
            fecha,
            hora,
            fecha_hora
        };

        console.log('📝 [RegistrarEventoFactura] Registrando evento:', {
            id_factura,
            tipo_evento: tipoEvento,
            usuario: id_usuario,
            fecha,
            hora,
            fecha_hora
        });

        console.log('📤 [RegistrarEventoFactura] Datos completos del evento:', JSON.stringify(eventoData, null, 2));

        const response = await fetch('https://wellnet-rd.com:444/api/factura/registrar-evento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventoData),
        });

        console.log('📥 [RegistrarEventoFactura] Response status:', response.status);

        const data = await response.json();
        console.log('📥 [RegistrarEventoFactura] Response data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('❌ [RegistrarEventoFactura] Error del servidor:', data);
            throw new Error(data.message || 'Error al registrar el evento');
        }

        console.log('✅ [RegistrarEventoFactura] Evento registrado exitosamente:', tipoEvento, '- ID:', data.id_evento);
        return true;

    } catch (error) {
        console.error('❌ [RegistrarEventoFactura] Error al registrar evento:', error);
        // No mostramos alerta al usuario para no interrumpir el flujo
        // Solo registramos el error en consola
        return false;
    }
};

export default registrarEventoFactura;

/**
 * TIPOS DE EVENTOS SOPORTADOS:
 *
 * - "Factura creada"
 * - "Factura visualizada"
 * - "Artículo agregado"
 * - "Artículo editado"
 * - "Artículo eliminado"
 * - "Factura impresa"
 * - "Factura compartida - WhatsApp"
 * - "Factura compartida - Email"
 * - "Factura compartida - PDF"
 * - "Factura compartida - Texto"
 * - "Nota agregada"
 * - "Nota revisada"
 * - "Revisión registrada"
 * - "Pago procesado"
 * - "Monto editado"
 * - "Descuento aplicado"
 * - "Impuestos recalculados"
 * - "Estado actualizado"
 *
 * EJEMPLOS DE USO:
 *
 * // Registrar cuando se crea una factura
 * await registrarEventoFactura(
 *     id_factura,
 *     idUsuario,
 *     "Factura creada",
 *     `Factura #${id_factura} creada para cliente ${nombreCliente}`,
 *     JSON.stringify({ id_cliente, id_ciclo, monto_total })
 * );
 *
 * // Registrar cuando se agrega un artículo
 * await registrarEventoFactura(
 *     id_factura,
 *     idUsuario,
 *     "Artículo agregado",
 *     `Artículo "${descripcionArticulo}" agregado por ${formatMoney(precio)}`,
 *     JSON.stringify({ id_articulo, cantidad, precio_unitario })
 * );
 *
 * // Registrar cuando se imprime
 * await registrarEventoFactura(
 *     id_factura,
 *     idUsuario,
 *     "Factura impresa",
 *     `Factura impresa en impresora ${nombreImpresora}`,
 *     JSON.stringify({ mac_address: impresoraMac })
 * );
 *
 * // Registrar cuando se comparte
 * await registrarEventoFactura(
 *     id_factura,
 *     idUsuario,
 *     "Factura compartida - WhatsApp",
 *     `Factura compartida por WhatsApp a ${telefonoCliente}`,
 *     JSON.stringify({ telefono: telefonoCliente })
 * );
 */
