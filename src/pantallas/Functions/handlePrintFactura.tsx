const handlePrintFactura = async (facturaData, loadSelectedPrinter, selectedPrinter) => {
    if (!facturaData) {
        Alert.alert('Error', 'No hay detalles de factura para imprimir');
        return;
    }

    const printerCharactersPerLine = 32;

    const centerText = (text) => {
        let spaces = (printerCharactersPerLine - text.length) / 2;
        return spaces >= 0 ? ' '.repeat(spaces) + text : text;
    };

    const formatCurrency = (amount) => {
        const parsedAmount = parseFloat(amount) || 0; // Asegúrate de que amount sea un número
        return `RD$ ${parsedAmount.toFixed(2)}`; // Formatea a 2 decimales
    };

    const formatLine = (left, right) => {
        const totalLength = printerCharactersPerLine;
        const spaceLength = totalLength - (left.length + right.length);
        const spaces = ' '.repeat(spaceLength > 0 ? spaceLength : 0);
        return `${left}${spaces}${right}`;
    };

    let facturaString = '\x1B\x40'; // Inicializar impresora
    facturaString += '\x1B\x5D\x01'; // Seleccionar fuente B

    // Encabezado
    facturaString += centerText(`NOMBRE DE TU EMPRESA`) + '\n';
    facturaString += centerText(`Dirección de la empresa`) + '\n';
    facturaString += centerText(`Tel: (+XX) XXX XXX XXX`) + '\n';
    facturaString += centerText(`contacto@empresa.com`) + '\n';
    facturaString += centerText(`NIF/CIF: ABC123456789`) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    // Detalles de la factura
    facturaString += formatLine(
        `Factura Nº: ${facturaData.factura.id_factura}`,
        `Fecha: ${facturaData.factura.fecha_emision
            ? new Date(facturaData.factura.fecha_emision).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'N/A'}`
    ) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';
    facturaString += formatLine(
        `Ciclo:`,
        `${facturaData.ciclo.inicio ? new Date(facturaData.ciclo.inicio).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} - ${facturaData.ciclo.final ? new Date(facturaData.ciclo.final).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}`
    ) + '\n';

    // Información del cliente
    facturaString += `Cliente:\n`;
    facturaString += `${facturaData.cliente.nombres} ${facturaData.cliente.apellidos}\n`;
    facturaString += `${facturaData.cliente.direccion}\n`;
    facturaString += `Tel: ${formatPhoneNumber(facturaData.cliente.telefono1)}\n`;
    facturaString += `Correo: ${facturaData.cliente.correo_elect || 'N/A'}\n`;
    facturaString += `NIF/CIF: ${facturaData.cliente.cedula || facturaData.cliente.rnc || 'N/A'}\n`;
    facturaString += centerText(`--------------------------------`) + '\n';

    // Descripción de servicios/productos
    facturaString += centerText(`Descripción de servicios:`) + '\n';
    facturaString += formatLine(`Cant`, `Importe`) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    facturaData.articulos.forEach((articulo) => {
        facturaString += `${articulo.descripcion}\n`;
        facturaString += formatLine(
            ` ${articulo.cantidad_articulo}`,
            formatCurrency(articulo.cantidad_articulo * articulo.precio_unitario)
        ) + '\n';
    });

    facturaString += centerText(`--------------------------------`) + '\n';

    // Totales
    facturaString += formatLine('Subtotal:', formatCurrency(calcularSubtotal())) + '\n';
    facturaString += formatLine('Descuento:', formatCurrency(facturaData.factura.descuento)) + '\n';
    facturaString += formatLine('ITBIS:', formatCurrency(facturaData.factura.itbis)) + '\n';
    facturaString += formatLine('Total:', formatCurrency(facturaData.factura.monto_total)) + '\n';
    facturaString += centerText(`--------------------------------`) + '\n';

    // Notas adicionales
    facturaString += `Forma de pago:\n`;
    facturaString += `[Transferencia bancaria]\n`;
    facturaString += `Número de cuenta:\n[Detalles bancarios]\n`;
    facturaString += centerText(`--------------------------------`) + '\n';
    facturaString += `Notas:\nGracias por su confianza.\n`;
    facturaString += `Pago vence en 30 días.\n`;
    facturaString += `Para dudas, contáctenos.\n`;

    await loadSelectedPrinter();
    // Configuración para la impresora
    const printerConfig = {
        macAddress: selectedPrinter?.macAddress || '', // Cambia esto por la MAC de tu impresora
        payload: facturaString,
        printerNbrCharactersPerLine: printerCharactersPerLine, // Ajusta según tu impresora
    };

    try {
        await ThermalPrinterModule.printBluetooth(printerConfig);
        Alert.alert('Éxito', 'Factura impresa correctamente.');
    } catch (error) {
        console.error('Error al imprimir:', error);
        Alert.alert('Error', 'No se pudo imprimir la factura. Verifica la conexión con la impresora.');
    }
};

export default handlePrintFactura;
