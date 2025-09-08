import { useCallback } from 'react';
import axios from 'axios';

export const useFacturaDetails = (id_factura, setFacturaData, setLoading, setModalPrinterVisible) => {
    return useCallback(() => {
        const fetchFacturaDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.post('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
                    id_factura,
                });
                setFacturaData(response.data);
            } catch (error) {
                console.error('Error fetching factura details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id_factura) {
            fetchFacturaDetails();
        }
    }, [id_factura, setFacturaData, setLoading, setModalPrinterVisible]);
};
