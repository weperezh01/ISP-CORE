import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TipoConexionSelection = ({ selectedTipoConexion, setSelectedTipoConexion }) => {
    const [tiposConexion, setTiposConexion] = useState([]);
    const [openTipoConexion, setOpenTipoConexion] = useState(false);

    useEffect(() => {
        const fetchTiposConexion = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (storedIspId === null) {
                    throw new Error('ID ISP no encontrado en el almacenamiento local');
                }
                const ispIdParsed = JSON.parse(storedIspId);

                const response = await fetch('https://wellnet-rd.com:444/api/conexion-tipos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_isp: ispIdParsed })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Fallo al obtener los tipos de conexión');
                }
                setTiposConexion(data.data.map(tipo => ({
                    label: tipo.descripcion_tipo_conexion,
                    value: tipo.id_tipo_conexion
                })));
            } catch (error) {
                console.error('Error al cargar tipos de conexión:', error);
            }
        };
        fetchTiposConexion();
    }, []);

    return (
        <View>
            <Text>Tipo conexión</Text>
            <DropDownPicker
                open={openTipoConexion}
                setOpen={setOpenTipoConexion}
                items={tiposConexion}
                value={selectedTipoConexion}
                setValue={setSelectedTipoConexion}
            />
        </View>
    );
};

export default TipoConexionSelection;
