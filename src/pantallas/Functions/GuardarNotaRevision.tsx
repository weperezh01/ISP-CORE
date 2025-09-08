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
        const responseNota = await axios.post(
            'https://wellnet-rd.com:444/api/factura/nota/agregar',
            {
                id_factura: idFactura,
                id_usuario: idUsuario,
                nota: nuevaNota,
                id_nota_revisada: idNotaSeleccionada, // Aquí enviamos el id_nota de la nota seleccionada
            }
        );

        if (responseNota.status === 200) {
            // Actualizar el estado local para incluir la nueva nota
            setFacturaData(prevState => ({
                ...prevState,
                notas: [...prevState.notas, responseNota.data],
            }));

            if (notaMarcadaComoRevisada) {
                // Si se marcó como revisada, actualizar el estado de la nota original
                const responseRevision = await axios.post(
                    'https://wellnet-rd.com:444/api/factura/revision/actualizar',
                    {
                        id_factura: idFactura,
                        id_usuario_aprueba: idUsuario,
                        comentario: nuevaNota,
                        id_nota_revisada: idNotaSeleccionada, // Enviamos el id_nota al backend
                    }
                );

                if (responseRevision.status === 200) {
                    Alert.alert('Éxito', 'La nota ha sido marcada como revisada.');
                    // Actualizar el estado de la nota en facturaData.notas
                    setFacturaData(prevState => {
                        const notasActualizadas = prevState.notas.map(nota => {
                            if (nota.id_nota === idNotaSeleccionada) {
                                return { ...nota, estado_revision: 'revisada' };
                            }
                            return nota;
                        });
                        return { ...prevState, notas: notasActualizadas };
                    });
                } else {
                    const errorMsg = responseRevision.data.error || 'No se pudo actualizar la revisión.';
                    Alert.alert('Error', errorMsg);
                }
            } else {
                Alert.alert('Éxito', 'Nota guardada correctamente.');
            }
        } else {
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
