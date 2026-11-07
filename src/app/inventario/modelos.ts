/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 * Modelos del dominio.
 */

export type Categoria = 'insumos' | 'herramientas' | 'repuestos' | 'limpieza';
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface Producto {
  sku: string;
  nombre: string;
  categoria: Categoria;
  stock: number;
  minimo: number;
  costo: number; // pesos uruguayos por unidad
  ubicacion: string;
}

export interface Movimiento {
  id: string;
  sku: string;
  tipo: TipoMovimiento;
  /** Entrada y salida: unidades movidas. Ajuste: stock resultante luego del conteo físico. */
  cantidad: number;
  motivo: string;
  fecha: string; // ISO 8601
  stockResultante: number;
}

export const CATEGORIAS: Record<Categoria, string> = {
  insumos: 'Insumos',
  herramientas: 'Herramientas',
  repuestos: 'Repuestos',
  limpieza: 'Limpieza',
};

export const PRODUCTOS_INICIALES: Producto[] = [
  { sku: 'INS-001', nombre: 'Guantes de nitrilo (caja x100)', categoria: 'insumos', stock: 14, minimo: 10, costo: 420, ubicacion: 'A-1' },
  { sku: 'INS-002', nombre: 'Cinta aisladora 20 m', categoria: 'insumos', stock: 6, minimo: 12, costo: 95, ubicacion: 'A-2' },
  { sku: 'HER-010', nombre: 'Taladro percutor 750 W', categoria: 'herramientas', stock: 3, minimo: 2, costo: 4890, ubicacion: 'B-4' },
  { sku: 'HER-011', nombre: 'Juego de destornilladores', categoria: 'herramientas', stock: 8, minimo: 4, costo: 1150, ubicacion: 'B-1' },
  { sku: 'REP-120', nombre: 'Filtro de aceite motor fuera de borda', categoria: 'repuestos', stock: 2, minimo: 5, costo: 640, ubicacion: 'C-3' },
  { sku: 'REP-121', nombre: 'Bujía NGK BR6HS', categoria: 'repuestos', stock: 25, minimo: 10, costo: 210, ubicacion: 'C-1' },
  { sku: 'LIM-300', nombre: 'Desengrasante 5 L', categoria: 'limpieza', stock: 0, minimo: 3, costo: 780, ubicacion: 'D-2' },
];
