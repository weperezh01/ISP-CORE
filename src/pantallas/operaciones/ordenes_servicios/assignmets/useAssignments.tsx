import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const useAssignments = (isp, usuarioId) => {
    const [assignments, setAssignments] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [filteredTecnicos, setFilteredTecnicos] = useState([]);
    const [tecnicoModalVisible, setTecnicoModalVisible] = useState(false);

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes/${isp.id_isp}`);
            const data = await response.json();
            setAssignments(data.assignments || []);
        } catch (error) {
            console.error('Error al cargar asignaciones:', error);
        }
    };

    const fetchTecnicos = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ispId: isp.id_isp }),
            });
            const data = await response.json();
            setTecnicos(data || []);
            setFilteredTecnicos(data || []);
        } catch (error) {
            console.error('Error al cargar técnicos:', error);
        }
    };

    const actualizarTecnicoEnOrden = async (tecnicoId) => {
        // Lógica para actualizar técnico en orden
    };

    useFocusEffect(
        useCallback(() => {
            fetchAssignments();
            fetchTecnicos();
        }, [isp.id_isp])
    );

    return {
        assignments,
        tecnicos,
        filteredTecnicos,
        tecnicoModalVisible,
        fetchAssignments,
        fetchTecnicos,
        actualizarTecnicoEnOrden,
        setTecnicoModalVisible,
        setFilteredTecnicos,
    };
};

export default useAssignments;
