/**
 * Filtra la lista de conexiones según los criterios seleccionados.
 *
 * @param {Object[]} connectionList               – array de conexiones originales
 * @param {string}   searchQuery                  – texto de búsqueda libre
 * @param {number[]} selectedEstados              – ids de Estado de Conexión
 * @param {string}   diaMesFiltro                 – día del mes (string) o '' si no aplica
 * @param {number[]} selectedTiposConexion        – ids de Tipo de Conexión
 * @param {number[]} selectedCiclosBase           – ids de Ciclo Base
 * @returns {Object[]} lista filtrada
 */

export interface Connection {
  id_conexion: number;
  direccion?: string;
  direccion_ip?: string;
  cliente?: string | null;    // ← puede venir null
  nombres?: string;
  apellidos?: string;
  id_estado_conexion: number;
  id_tipo_conexion: number;
  ciclo_base?: { id_ciclo_base: number; dia_mes: number };
}

interface Args {
  connectionList: Connection[];
  searchQuery: string;
  selectedEstados: number[];
  diaMesFiltro: string;          // '' si no filtras por día
  selectedTiposConexion: number[];
  selectedCiclosBase: number[];
}

export const applyFilters = ({
  connectionList,
  searchQuery,
  selectedEstados,
  diaMesFiltro,
  selectedTiposConexion,
  selectedCiclosBase,
}: Args) => {
  const q = searchQuery.trim().toLowerCase();

  return connectionList.filter((c) => {
    /* ====== Búsqueda libre ====== */
    const nombreCompleto =
      c.nombres ? `${c.nombres} ${c.apellidos ?? ''}`.toLowerCase() : '';

    const matchesSearch =
      q === '' ||
      (c.cliente?.toLowerCase?.().includes(q) ?? false) ||
      nombreCompleto.includes(q) ||
      c.direccion?.toLowerCase().includes(q) ||
      c.direccion_ip?.toLowerCase().includes(q) ||
      String(c.id_conexion).includes(q);

    /* ====== Filtros individuales ====== */
    const matchesEstados =
      selectedEstados.length === 0 ||
      selectedEstados.includes(c.id_estado_conexion);

    const matchesTipo =
      selectedTiposConexion.length === 0 ||
      selectedTiposConexion.includes(c.id_tipo_conexion);

    const matchesDiaMes =
      diaMesFiltro === '' ||
      (c.ciclo_base &&
        (c.ciclo_base.dia_mes === Number(diaMesFiltro) ||
          c.ciclo_base.id_ciclo_base === Number(diaMesFiltro)));

    const matchesCiclosBase =
      selectedCiclosBase.length === 0 ||
      (c.ciclo_base &&
        selectedCiclosBase.includes(c.ciclo_base.id_ciclo_base));

    return (
      matchesSearch &&
      matchesEstados &&
      matchesTipo &&
      matchesDiaMes &&
      matchesCiclosBase
    );
  });
};
