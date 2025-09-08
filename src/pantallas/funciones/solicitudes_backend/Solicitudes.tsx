
    /////////////////////////////////////////////////////////////////////////////
    // 1. PRIMERO: obtenemos el id_isp real consultando al endpoint /datos-usuario
    /////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/usuarios/datos-usuario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: usuarioId }),
                });
                const data = await response.json();
                // console.log('Respuesta del backend (datos-usuario):', data);
                console.log('Datos del usuario (JSON):', JSON.stringify(data, null, 2));
                console.log('id_isp:', data.usuario.id_isp);

                if (!response.ok) {
                    console.error('Error en /datos-usuario:', data.error);
                    Alert.alert('Error', data.error || 'Hubo un problema al obtener los datos del usuario');
                } else {
                    // Ajusta la forma en que recibes el id_isp según tu respuesta
                    if (data.usuario.id_isp) {
                        setUserIspId(data.usuario.id_isp);
                    } else {
                        Alert.alert('Error', 'No se recibió el id_isp en los datos del usuario.');
                    }
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
                Alert.alert('Error', 'Hubo un problema al obtener el id_isp del usuario.');
            }
        };

        fetchUserData();
    }, [usuarioId]);
