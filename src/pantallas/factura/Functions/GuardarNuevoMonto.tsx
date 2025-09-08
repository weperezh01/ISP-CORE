import axios from 'axios';
import { Alert } from 'react-native';

const guardarNuevoMonto = async (id_factura, nuevoMontoTotal, setFacturaData, cerrarEditModal) => {
    try {
        const response = await axios.post(
            'https://wellnet-rd.com:444/api/actualizar-monto-total',
            {
                id_factura,
                nuevoMontoTotal: parseFloat(nuevoMontoTotal)
            }
        );
        if (response.status === 200) {
            setFacturaData(prevState => ({
                ...prevState,
                factura: {
                    ...prevState.factura,
                    monto_total: parseFloat(nuevoMontoTotal)
                }
            }));
            cerrarEditModal();
            Alert.alert('Éxito', 'Monto total actualizado correctamente.');
        } else {
            Alert.alert('Error', 'No se pudo actualizar el monto total.');
        }
    } catch (error) {
        console.error('Error al actualizar el monto total:', error);
        Alert.alert('Error', 'No se pudo actualizar el monto total.');
    }
};

export default guardarNuevoMonto;
