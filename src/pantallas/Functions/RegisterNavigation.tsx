const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const registrarNavegacion = async (id_factura, id_ciclo, id_usuario) => {
    await delay(2000);
    const fechaActual = new Date();
    const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
    const pantalla = 'DetalleFacturaScreen';

    const datos = JSON.stringify({
        id_factura: id_factura,
        id_ciclo: id_ciclo,
    });

    const navigationLogData = {
        id_usuario: id_usuario,
        fecha,
        hora,
        pantalla,
        datos
    };

    try {
        await delay(2000);
        const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(navigationLogData),
        });

        if (!response.ok) {
            throw new Error('Error al registrar la navegación.');
        }

        console.log('Navegación registrada exitosamente');
    } catch (error) {
        console.error('Error al registrar la navegación:', error);
    }
};

export default registrarNavegacion;
