/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 * Estado del inventario con signals: productos, historial de movimientos, alertas y valorización.
 */
import { computed, effect, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { Movimiento, Producto, PRODUCTOS_INICIALES, TipoMovimiento } from './modelos';

export const ALMACENAMIENTO = new InjectionToken<Storage | null>('almacenamiento', {
  providedIn: 'root',
  factory: () => (typeof localStorage === 'undefined' ? null : localStorage),
});

const CLAVE = 'inventario/v1';

interface Persistido {
  productos: Producto[];
  movimientos: Movimiento[];
}

export class ErrorInventario extends Error {}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly almacenamiento = inject(ALMACENAMIENTO);
  private readonly estado = signal<Persistido>(this.cargar());

  readonly productos = computed(() => this.estado().productos);
  readonly movimientos = computed(() => [...this.estado().movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha)));
  readonly alertas = computed(() =>
    this.productos()
      .filter((p) => p.stock <= p.minimo)
      .sort((a, b) => a.stock / Math.max(a.minimo, 1) - b.stock / Math.max(b.minimo, 1)),
  );
  readonly valorTotal = computed(() => this.productos().reduce((s, p) => s + p.stock * p.costo, 0));
  readonly unidades = computed(() => this.productos().reduce((s, p) => s + p.stock, 0));

  constructor() {
    effect(() => {
      try {
        this.almacenamiento?.setItem(CLAVE, JSON.stringify(this.estado()));
      } catch {
        /* sin almacenamiento disponible: el estado vive en memoria */
      }
    });
  }

  producto(sku: string): Producto | undefined {
    return this.productos().find((p) => p.sku === sku);
  }

  historial(sku: string): Movimiento[] {
    return this.movimientos().filter((m) => m.sku === sku);
  }

  registrar(sku: string, tipo: TipoMovimiento, cantidad: number, motivo: string, fecha = new Date()): Movimiento {
    const producto = this.producto(sku);
    if (!producto) throw new ErrorInventario(`No existe el producto ${sku}.`);
    if (!Number.isInteger(cantidad) || cantidad < 0 || (tipo !== 'ajuste' && cantidad === 0)) {
      throw new ErrorInventario('La cantidad debe ser un entero positivo.');
    }
    if (!motivo.trim()) throw new ErrorInventario('Indique el motivo del movimiento.');

    const stockResultante =
      tipo === 'entrada' ? producto.stock + cantidad : tipo === 'salida' ? producto.stock - cantidad : cantidad;
    if (stockResultante < 0) {
      throw new ErrorInventario(`Stock insuficiente: hay ${producto.stock} unidades de ${producto.nombre}.`);
    }
    const movimiento: Movimiento = {
      id: crypto.randomUUID(),
      sku,
      tipo,
      cantidad,
      motivo: motivo.trim(),
      fecha: fecha.toISOString(),
      stockResultante,
    };
    this.estado.update(({ productos, movimientos }) => ({
      productos: productos.map((p) => (p.sku === sku ? { ...p, stock: stockResultante } : p)),
      movimientos: [...movimientos, movimiento],
    }));
    return movimiento;
  }

  /** Cantidad sugerida para reponer hasta el doble del mínimo. */
  sugerenciaCompra(p: Producto): number {
    return Math.max(0, p.minimo * 2 - p.stock);
  }

  reiniciar(): void {
    this.estado.set({ productos: structuredClone(PRODUCTOS_INICIALES), movimientos: [] });
  }

  private cargar(): Persistido {
    try {
      const datos = JSON.parse(this.almacenamiento?.getItem(CLAVE) ?? 'null') as Persistido | null;
      if (datos && Array.isArray(datos.productos) && Array.isArray(datos.movimientos)) return datos;
    } catch {
      /* datos dañados: se vuelve al estado inicial */
    }
    return { productos: structuredClone(PRODUCTOS_INICIALES), movimientos: [] };
  }
}
