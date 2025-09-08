import axios from 'axios';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const procesarRecepcion = async (montoRecibido, facturaData, idUsuario, id_ciclo, cerrarModal) => {
    const navigation = useNavigation();
    const montoRecibidoFormatted = parseFloat(montoRecibido).toFixed(2);

    const datosParaEnviar = {
        id_cliente: facturaData.factura.id_cliente,
        monto: montoRecibidoFormatted,
        id_usuario: idUsuario,
        id_ciclo: id_ciclo,
        facturas: [{
            id_factura: facturaData.factura.id_factura,
            monto_cobrado: montoRecibidoFormatted,
            nota: '',
        }],
        cargos: [],
    };

    console.log('Enviando datos al backend:', datosParaEnviar);

    try {
        const response = await axios.post(
            'https://wellnet-rd.com:444/api/facturas-procesar-cobro',
            datosParaEnviar,
        );
        const reciboData = response.data;
        navigation.navigate('ReciboScreen', {
            reciboData: {
                ...reciboData,
                totalRecibir: montoRecibidoFormatted,
                facturas: [facturaData],
            },
        });
        cerrarModal();
    } catch (error) {
        console.error('Error al enviar datos:', error);
        Alert.alert('Error', 'No se pudo procesar el cobro correctamente.');
    }
};

export default procesarRecepcion;
