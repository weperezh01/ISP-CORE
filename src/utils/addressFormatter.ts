export interface GpsCoords {
    lat: number;
    lng: number;
}

export interface AddressInfo {
    original: string;
    principal: string;
    referencia: string;
    gps: string;
    coords: GpsCoords | null;
}

const addressLabelRegex = /^(paraje|seccion|sección|dm|municipio|provincia|cp)\s*[:\-]?\s*/i;

const buildStringFromObject = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        return value.map(buildStringFromObject).filter(Boolean).join(', ');
    }
    if (typeof value === 'object') {
        return Object.values(value)
            .map(buildStringFromObject)
            .filter(Boolean)
            .join(', ');
    }
    return String(value);
};

const normalizeDireccionTexto = (texto: string) => {
    if (!texto) {
        return '';
    }

    const partes = texto
        .split(',')
        .map(parte => parte.trim())
        .filter(Boolean);

    const vistos = new Set<string>();
    const resultado: string[] = [];

    partes.forEach(parte => {
        const cleaned = parte.replace(addressLabelRegex, '').trim();
        const valor = cleaned || parte;
        const hasColon = /:\s*/.test(valor);
        const normalizado = valor.toLowerCase();

        if (!hasColon) {
            if (vistos.has(normalizado)) {
                return;
            }
            vistos.add(normalizado);
        }

        resultado.push(valor);
    });

    return resultado.join(', ');
};

const formatDireccionString = (direccion: any) => {
    if (!direccion) {
        return '';
    }

    let texto = '';

    if (typeof direccion === 'string') {
        try {
            const parsed = JSON.parse(direccion);
            texto = buildStringFromObject(parsed);
        } catch (error) {
            texto = direccion;
        }
    } else {
        texto = buildStringFromObject(direccion);
    }

    return normalizeDireccionTexto(texto);
};

const parseDireccionExtras = (texto: string) => {
    if (!texto) {
        return { principal: '', referencia: '', gps: '' };
    }

    const partes = texto
        .split(',')
        .map(parte => parte.trim())
        .filter(Boolean);

    const principal: string[] = [];
    let referencia = '';
    let gps = '';
    const coordRegex = /^-?\d+(\.\d+)?$/;

    for (let i = 0; i < partes.length; i += 1) {
        const parte = partes[i];
        const lower = parte.toLowerCase();

        if (lower.startsWith('ref')) {
            referencia = parte.replace(/^ref\s*[:\-]?\s*/i, '').trim() || parte;
            continue;
        }

        if (lower.startsWith('gps')) {
            let valor = parte.replace(/^gps\s*[:\-]?\s*/i, '').trim();
            const coords: string[] = [];
            if (valor) {
                coords.push(valor);
            }

            while (i + 1 < partes.length) {
                const siguiente = partes[i + 1];
                const normalizado = siguiente.replace(/[°\s]/g, '');
                if (coordRegex.test(normalizado)) {
                    coords.push(siguiente);
                    i += 1;
                } else {
                    break;
                }
            }

            gps = coords.length > 0 ? coords.join(', ') : valor || parte;
            continue;
        }

        principal.push(parte);
    }

    return {
        principal: principal.join(', '),
        referencia,
        gps
    };
};

const parseGpsCoordinates = (gpsTexto: string | null) => {
    if (!gpsTexto) {
        return null;
    }

    const matches = gpsTexto.match(/-?\d+(?:\.\d+)?/g);
    if (matches && matches.length >= 2) {
        const lat = parseFloat(matches[0]);
        const lng = parseFloat(matches[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }

    return null;
};

export const buildAddressInfo = (direccion: any, explicitReference?: string): AddressInfo => {
    const formatted = formatDireccionString(direccion);
    const metadata = parseDireccionExtras(formatted);
    const referencia = explicitReference?.trim() ? explicitReference.trim() : metadata.referencia;
    const principal = metadata.principal || formatted;
    const gps = metadata.gps;
    const coords = parseGpsCoordinates(gps);

    return {
        original: formatted,
        principal,
        referencia,
        gps,
        coords
    };
};
