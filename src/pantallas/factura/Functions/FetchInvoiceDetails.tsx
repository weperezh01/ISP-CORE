const fetchFacturaDetails = async (id_factura, setFacturaData, setError, setLoading, controller) => {
    try {
        const response = await fetch('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_factura }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFacturaData(data);  // Las notas ahora vienen incluidas en "data"
    } catch (error) {
        if (!controller.signal.aborted) {
            setError('Failed to fetch data: ' + error.message);
            console.error('Error fetching data:', error);
        }
    } finally {
        setLoading(false);
    }
};

export default fetchFacturaDetails;
