// Estados que vienen del backend:
// - "aprobada" → nota revisada y aprobada
// - null → nota pendiente de revisión
// - "en_revision" → nota en proceso de revisión (si existe)
export type NotaEstado = 'aprobada' | 'en_revision' | 'pendiente' | null;

export interface NotaPreview {
  id_nota: number;
  nombre: string | null;
  apellido: string | null;
  estado_revision: NotaEstado;
}

export interface FacturaListItem {
  id_factura: number;
  id_cliente: number;
  id_ciclo: number;
  nombres: string;
  apellidos: string;
  telefono1: string;
  direccion: string;
  monto_total: number;
  estado: 'pagado' | 'pendiente' | 'vencido';
  fecha_emision: string;
  notes_preview?: NotaPreview[] | null;
  notes_count?: number | null;
}
