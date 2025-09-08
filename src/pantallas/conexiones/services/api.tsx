export const fetchEstadosConexion = async () => {
    const response = await fetch('https://wellnet-rd.com/api/estados-conexion');
    if (!response.ok) {
        throw new Error(`Error al obtener los estados: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export const fetchTiposConexion = async (ispId) => {
    const response = await fetch('https://wellnet-rd.com/api/conexion-tipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_isp: ispId }),
    });
    if (!response.ok) {
        throw new Error('Error al obtener los tipos de conexión');
    }
    const data = await response.json();
    return data.data;
};

export const fetchConnectionList = async (ispId) => {
    const response = await fetch('https://wellnet-rd.com:444/api/lista-conexiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_isp: ispId }),
    });
    if (!response.ok) {
        throw new Error('Error al obtener datos de conexiones');
    }
    const data = await response.json();
    return data.data || [];
};

export const fetchCiclosBase = async (id_isp) => {
    const response = await fetch('https://wellnet-rd.com/api/ciclos-base/por-isp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ispId: id_isp }),
    });

    if (!response.ok) {
        throw new Error('Error al obtener los ciclos base');
    }

    const data = await response.json();
    return data;
};
