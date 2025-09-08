export const fetchOrderTypes = async (isp_id, setOrderTypes, showAlert) => {
    try {
        const response = await fetch(`https://wellnet-rd.com:444/api/order-types?id_isp=${isp_id}`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Error en el servidor:', data.error);
            showAlert('Error', data.error);
        } else {
            setOrderTypes(data);
        }
    } catch (error) {
        console.error('Error al cargar los tipos de órdenes:', error);
        showAlert('Error', 'Hubo un problema al cargar los tipos de órdenes.');
    }
};

export const fetchClientes = async (isp_id, usuarioId, setClientes, setFilteredClientes, showAlert) => {
    try {
        const response = await fetch(`https://wellnet-rd.com:444/api/lista-clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isp_id, usuarioId }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Error en el servidor:', data.error);
            showAlert('Error', data.error);
        } else {
            setClientes(data.clientes || []);
            setFilteredClientes(data.clientes || []);
        }
    } catch (error) {
        console.error('Error al cargar los clientes:', error);
        showAlert('Error', 'Hubo un problema al cargar los clientes.');
    }
};

export const fetchServicios = async (isp_id, usuarioId, setServicios, setFilteredServicios, showAlert) => {
    try {
        const response = await fetch(`https://wellnet-rd.com:444/api/lista-servicios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isp_id, usuarioId }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Error en el servidor:', data.error);
            showAlert('Error', data.error);
        } else {
            setServicios(data.servicios || []);
            setFilteredServicios(data.servicios || []);
        }
    } catch (error) {
        console.error('Error al cargar los servicios:', error);
        showAlert('Error', 'Hubo un problema al cargar los servicios.');
    }
};
