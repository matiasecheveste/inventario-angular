/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 * Pruebas del servicio (signals) y de los componentes con TestBed.
 */
import { registerLocaleData } from '@angular/common';
import localeEsUy from '@angular/common/locales/es-UY';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Detalle } from './inventario/detalle';
import { ALMACENAMIENTO, ErrorInventario, InventarioService } from './inventario/inventario.service';
import { normalizar, Panel } from './inventario/panel';

registerLocaleData(localeEsUy);

class AlmacenEnMemoria implements Storage {
  private datos = new Map<string, string>();
  get length() {
    return this.datos.size;
  }
  clear() {
    this.datos.clear();
  }
  getItem(k: string) {
    return this.datos.get(k) ?? null;
  }
  key(i: number) {
    return [...this.datos.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.datos.delete(k);
  }
  setItem(k: string, v: string) {
    this.datos.set(k, v);
  }
}

let almacen: AlmacenEnMemoria;

beforeEach(() => {
  almacen = new AlmacenEnMemoria();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ALMACENAMIENTO, useValue: almacen }],
  });
});

describe('InventarioService', () => {
  it('calcula alertas ordenadas por urgencia y valor total', () => {
    const s = TestBed.inject(InventarioService);
    expect(s.alertas().map((p) => p.sku)).toEqual(['LIM-300', 'REP-120', 'INS-002']);
    expect(s.valorTotal()).toBe(14 * 420 + 6 * 95 + 3 * 4890 + 8 * 1150 + 2 * 640 + 25 * 210);
  });

  it('registra entradas, salidas y ajustes y guarda el historial', () => {
    const s = TestBed.inject(InventarioService);
    s.registrar('REP-120', 'entrada', 10, 'Compra a proveedor', new Date('2026-03-01T10:00:00Z'));
    s.registrar('REP-120', 'salida', 3, 'Mantenimiento lancha', new Date('2026-03-02T10:00:00Z'));
    s.registrar('REP-120', 'ajuste', 8, 'Conteo mensual', new Date('2026-03-03T10:00:00Z'));
    expect(s.producto('REP-120')?.stock).toBe(8);
    expect(s.historial('REP-120').map((m) => m.stockResultante)).toEqual([8, 9, 12]);
    expect(s.alertas().some((p) => p.sku === 'REP-120')).toBe(false);
  });

  it('impide stock negativo y datos inválidos', () => {
    const s = TestBed.inject(InventarioService);
    expect(() => s.registrar('LIM-300', 'salida', 1, 'Uso')).toThrow(ErrorInventario);
    expect(() => s.registrar('INS-001', 'entrada', 0, 'x')).toThrow('entero positivo');
    expect(() => s.registrar('INS-001', 'entrada', 1.5, 'x')).toThrow('entero positivo');
    expect(() => s.registrar('INS-001', 'entrada', 1, '  ')).toThrow('motivo');
    expect(() => s.registrar('NO-EXISTE', 'entrada', 1, 'x')).toThrow('No existe');
  });

  it('persiste el estado y lo recupera', () => {
    const s = TestBed.inject(InventarioService);
    s.registrar('INS-001', 'salida', 4, 'Uso en taller');
    TestBed.tick();
    expect(JSON.parse(almacen.getItem('inventario/v1')!).productos[0].stock).toBe(10);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: ALMACENAMIENTO, useValue: almacen }] });
    expect(TestBed.inject(InventarioService).producto('INS-001')?.stock).toBe(10);
  });

  it('sugiere reponer hasta el doble del mínimo', () => {
    const s = TestBed.inject(InventarioService);
    expect(s.sugerenciaCompra(s.producto('INS-002')!)).toBe(18);
    expect(s.sugerenciaCompra(s.producto('REP-121')!)).toBe(0);
  });
});

describe('Panel', () => {
  it('muestra indicadores y filtra por categoría y alertas', async () => {
    const f = TestBed.createComponent(Panel);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[data-prueba="alertas"]')?.textContent?.trim()).toBe('3');
    expect(el.querySelectorAll('tbody tr').length).toBe(7);

    const [categoria] = Array.from(el.querySelectorAll('select'));
    categoria!.value = 'repuestos';
    categoria!.dispatchEvent(new Event('change'));
    await f.whenStable();
    expect(el.querySelectorAll('tbody tr').length).toBe(2);

    const casilla = el.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    casilla.click();
    await f.whenStable();
    expect(Array.from(el.querySelectorAll('tbody tr td:first-child')).map((td) => td.textContent)).toEqual(['REP-120']);
  });

  it('normaliza el texto de búsqueda', () => {
    expect(normalizar('  BUJÍA ')).toBe('bujia');
  });
});

describe('Detalle', () => {
  it('registra una salida desde el formulario y muestra errores de negocio', async () => {
    const f = TestBed.createComponent(Detalle);
    f.componentRef.setInput('sku', 'HER-010');
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    const [cantidad, motivo] = Array.from(el.querySelectorAll<HTMLInputElement>('form input'));

    cantidad!.value = '2';
    cantidad!.dispatchEvent(new Event('input'));
    motivo!.value = 'Préstamo a obra';
    motivo!.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await f.whenStable();
    expect(el.querySelector('[data-prueba="stock"]')?.textContent).toContain('1 (mínimo 2)');
    expect(el.querySelectorAll('tbody tr').length).toBe(1);

    cantidad!.value = '5';
    cantidad!.dispatchEvent(new Event('input'));
    motivo!.value = 'Otra salida';
    motivo!.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await f.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Stock insuficiente');
  });

  it('informa cuando el producto no existe', async () => {
    const f = TestBed.createComponent(Detalle);
    f.componentRef.setInput('sku', 'XYZ');
    await f.whenStable();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Producto no encontrado');
  });
});
