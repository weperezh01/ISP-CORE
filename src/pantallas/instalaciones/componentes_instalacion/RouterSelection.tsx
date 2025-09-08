import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RouterSelection = ({ selectedRouter, setSelectedRouter, selectedRedIP }) => {
    const [routers, setRouters] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchRouters = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (storedIspId === null) {
                    throw new Error('ID ISP no encontrado en el almacenamiento local');
                }
                const ispIdParsed = JSON.parse(storedIspId);

                const response = await fetch('https://wellnet-rd.com:444/api/routers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_isp: ispIdParsed })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Fallo al obtener datos de los routers');
                }

                setRouters(data.data.map(router => ({
                    label: `ID: ${router.id_router}, ${router.descripcion}`,
                    value: router.id_router
                })));
            } catch (error) {
                console.error('Error al cargar datos de routers:', error);
            }
        };
        fetchRouters();
    }, []);

    return (
        <View>
            <Text>Router principal</Text>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                items={routers}
                value={selectedRouter}
                setValue={setSelectedRouter}
                disabled={selectedRedIP !== null}
            />
        </View>
    );
};

export default RouterSelection;
