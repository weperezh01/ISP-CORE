const API_BASE = 'https://wellnet-rd.com:444/api';

export const fetchEstadisticasConexiones = async (
    ispId: string,
    periodo: string,
    fechaEspecifica?: string | null
) => {
    // 🔴 MODO PRODUCCIÓN: Usando endpoint real del backend
    console.log('📊 Obteniendo estadísticas del backend:', {
        ispId,
        periodo,
        fechaEspecifica
    });

    const requestBody: any = {
        id_isp: ispId,
        periodo: periodo // 'dia', 'semana', 'mes', 'ano'
    };

    // Agregar fecha_especifica solo si está definida
    if (fechaEspecifica) {
        requestBody.fecha_especifica = fechaEspecifica;
    }

    console.log('📤 Enviando request:', JSON.stringify(requestBody));

    const response = await fetch(`${API_BASE}/estadisticas-conexiones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Response data:', JSON.stringify(result).substring(0, 200));

    if (result.success && result.data) {
        console.log('✅ Estadísticas obtenidas correctamente:', {
            periodo,
            fechaEspecifica,
            labels: result.data.labels?.length || 0,
            total: result.data.total?.length || 0,
            totalActual: result.data.totales?.total || 0
        });
        return result.data;
    } else {
        throw new Error(result.error || 'Respuesta del servidor sin datos válidos');
    }
};

// Generar estructura de datos vacía pero válida
const generarDatosVacios = (periodo: string) => {
    const getLabels = () => {
        switch (periodo) {
            case 'dia':
                return ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
            case 'semana':
                return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            case 'mes':
                return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            case 'ano':
                return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            default:
                return [];
        }
    };

    const labels = getLabels();
    return {
        labels,
        total: new Array(labels.length).fill(0),
        activas: [],
        suspendidas: [],
        bajas: [],
        totales: {
            total: 0,
            activas: 0,
            suspendidas: 0,
            bajas: 0
        }
    };
};
