import { Alert } from 'react-native';
import axios from 'axios';

const handleGuardarNotaRevision = async (notaRevisada, notaActual, facturaData, idUsuario, setFacturaData, setModalNotaRevisionVisible, setNotaRevisada, setNotaMarcadaComoRevisada, setNotaActual, notaMarcadaComoRevisada) => {
    if (notaRevisada.trim() === '') {
        Alert.alert('Error', 'Debe escribir una nota de revisión.');
        return;
    }

    if (!notaActual || !notaActual.id_nota) {
        Alert.alert('Error', 'No se ha seleccionado ninguna nota válida.');
        return;
    }

    try {
        const idFactura = facturaData.factura.id_factura;
        const idNotaSeleccionada = notaActual.id_nota; // Obtenemos el id_nota de la nota actual
        const nuevaNota = notaRevisada.trim();

        // Enviar el id_nota al backend al agregar una nueva nota de revisión
        const responseNota = await fetch('https://wellnet-rd.com:444/api/guardar-nota-factura', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nota: nuevaNota,
                id_usuario: idUsuario,
                id_factura: idFactura,
                id_recibo: 0,
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('en-GB')
            })
        });

        const notaData = await responseNota.json();

        if (responseNota.ok) {
            console.log('✅ Nota guardada correctamente:', notaData);

            // Obtener el id de la nota recién creada
            const idNotaNueva = notaData.id_nota;

            if (notaMarcadaComoRevisada) {
                console.log('📝 Marcando nota original como revisada...', {
                    id_factura: idFactura,
                    id_usuario_aprueba: idUsuario,
                    id_nota_original: idNotaSeleccionada,
                    comentario_revision: nuevaNota
                });

                // Actualizar el estado de la nota ORIGINAL usando el endpoint correcto
                const responseRevision = await axios.post(
                    'https://wellnet-rd.com:444/api/factura/revision/actualizar',
                    {
                        id_factura: idFactura,
                        id_usuario_aprueba: idUsuario,
                        comentario: nuevaNota,
                        id_nota_revisada: idNotaSeleccionada  // ID de la nota ORIGINAL que se está revisando
                    }
                );

                const revisionData = responseRevision.data;
                console.log('🔍 Respuesta del backend (actualizar revisión):', revisionData);

                // Validar si tiene success: true O si el mensaje indica éxito
                const esExitoso = revisionData.success === true ||
                                  (revisionData.message && revisionData.message.includes('exitosamente'));

                if (responseRevision.status === 200 && esExitoso) {
                    Alert.alert('Éxito', 'La nota ha sido marcada como revisada.');

                    // Recargar los datos completos de la factura para asegurar sincronización
                    const responseFetch = await axios.post(
                        'https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura',
                        { id_factura: idFactura }
                    );

                    console.log('✅ Datos de factura recargados:', responseFetch.data);

                    // Log específico para ver el estado de las notas
                    if (responseFetch.data.notas) {
                        console.log('📋 Notas después de recargar:');
                        responseFetch.data.notas.forEach((nota, index) => {
                            console.log(`  Nota ${index + 1}:`, {
                                id_nota: nota.id_nota,
                                estado_revision: nota.estado_revision,
                                autor: `${nota.nombre} ${nota.apellido}`,
                                nota: nota.nota?.substring(0, 50) + '...'
                            });
                        });

                        // Verificar la nota ORIGINAL (debería estar marcada como aprobada)
                        const notaOriginal = responseFetch.data.notas.find(n => n.id_nota === idNotaSeleccionada);
                        if (notaOriginal) {
                            console.log('✅ Estado de la nota ORIGINAL después de marcar como revisada:', {
                                id_nota: notaOriginal.id_nota,
                                estado_revision: notaOriginal.estado_revision,
                                esperado: 'aprobada',
                                coincide: notaOriginal.estado_revision === 'aprobada' ? 'SÍ ✓' : 'NO ✗'
                            });
                        } else {
                            console.warn('⚠️ No se encontró la nota original en la respuesta');
                        }

                        // Verificar la nota NUEVA (comentario de revisión)
                        const notaNuevaCreada = responseFetch.data.notas.find(n => n.id_nota === idNotaNueva);
                        if (notaNuevaCreada) {
                            console.log('✅ Nota de revisión creada:', {
                                id_nota: notaNuevaCreada.id_nota,
                                autor: `${notaNuevaCreada.nombre} ${notaNuevaCreada.apellido}`,
                                contenido: notaNuevaCreada.nota?.substring(0, 50) + '...'
                            });
                        }
                    }

                    setFacturaData(responseFetch.data);
                } else {
                    const errorMsg = revisionData?.error || revisionData?.message || 'No se pudo actualizar la revisión.';
                    console.error('❌ Error al actualizar revisión:', errorMsg);
                    Alert.alert('Error', errorMsg);
                }
            } else {
                Alert.alert('Éxito', 'Nota guardada correctamente.');

                // Recargar datos aunque no se marque como revisada
                const responseFetch = await axios.post(
                    'https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura',
                    { id_factura: idFactura }
                );
                setFacturaData(responseFetch.data);
            }
        } else {
            console.error('❌ Error al guardar nota. Status:', responseNota.status);
            Alert.alert('Error', 'No se pudo guardar la nota.');
        }

        // Cerrar el modal y reiniciar los estados
        setModalNotaRevisionVisible(false);
        setNotaRevisada('');
        setNotaMarcadaComoRevisada(false);
        setNotaActual(null); // Reiniciar la nota actual
    } catch (error) {
        console.error('Error al guardar la nota:', error);
        Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
};

export default handleGuardarNotaRevision;
