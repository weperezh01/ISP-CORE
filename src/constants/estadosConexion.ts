/**
 * Constantes de Estados de Conexión
 *
 * Estos IDs corresponden a la tabla EstadoConexion en la base de datos.
 * NO modificar estos valores sin verificar la base de datos.
 */

export const ESTADOS_CONEXION = {
  PENDIENTE_INSTALACION: 1,
  EN_EJECUCION: 2,
  ACTIVA: 3,              // ← Estado activo principal
  SUSPENDIDA: 4,          // ← Estado suspendido
  BAJA_VOLUNTARIA: 5,
  BAJA_FORZADA: 6,
  AVERIADA: 7,
  PENDIENTE_RECONEXION: 8,
} as const;

/**
 * Helper para verificar si una conexión está activa
 */
export const isConexionActiva = (idEstado: number): boolean => {
  return idEstado === ESTADOS_CONEXION.ACTIVA;
};

/**
 * Helper para verificar si una conexión está suspendida
 */
export const isConexionSuspendida = (idEstado: number): boolean => {
  return idEstado === ESTADOS_CONEXION.SUSPENDIDA;
};

/**
 * Helper para verificar si una conexión está inactiva
 * (cualquier estado que no sea activa ni suspendida)
 */
export const isConexionInactiva = (idEstado: number): boolean => {
  return idEstado !== ESTADOS_CONEXION.ACTIVA &&
         idEstado !== ESTADOS_CONEXION.SUSPENDIDA;
};

/**
 * Obtener el nombre del estado
 */
export const getNombreEstado = (idEstado: number): string => {
  const nombres: Record<number, string> = {
    [ESTADOS_CONEXION.PENDIENTE_INSTALACION]: 'Pendiente de Instalación',
    [ESTADOS_CONEXION.EN_EJECUCION]: 'En Ejecución',
    [ESTADOS_CONEXION.ACTIVA]: 'Activa',
    [ESTADOS_CONEXION.SUSPENDIDA]: 'Suspendida',
    [ESTADOS_CONEXION.BAJA_VOLUNTARIA]: 'Baja Voluntaria',
    [ESTADOS_CONEXION.BAJA_FORZADA]: 'Baja Forzada',
    [ESTADOS_CONEXION.AVERIADA]: 'Averiada',
    [ESTADOS_CONEXION.PENDIENTE_RECONEXION]: 'Pendiente de Reconexión',
  };
  return nombres[idEstado] || 'Estado Desconocido';
};

/**
 * Obtener el color asociado al estado (para UI)
 */
export const getColorEstado = (idEstado: number): string => {
  const colores: Record<number, string> = {
    [ESTADOS_CONEXION.PENDIENTE_INSTALACION]: '#F59E0B', // Amarillo
    [ESTADOS_CONEXION.EN_EJECUCION]: '#3B82F6', // Azul
    [ESTADOS_CONEXION.ACTIVA]: '#10B981', // Verde
    [ESTADOS_CONEXION.SUSPENDIDA]: '#F59E0B', // Naranja
    [ESTADOS_CONEXION.BAJA_VOLUNTARIA]: '#6B7280', // Gris
    [ESTADOS_CONEXION.BAJA_FORZADA]: '#EF4444', // Rojo
    [ESTADOS_CONEXION.AVERIADA]: '#DC2626', // Rojo oscuro
    [ESTADOS_CONEXION.PENDIENTE_RECONEXION]: '#8B5CF6', // Púrpura
  };
  return colores[idEstado] || '#6B7280';
};

export default ESTADOS_CONEXION;
