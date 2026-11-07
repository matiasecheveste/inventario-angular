/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 * Panel principal: indicadores, búsqueda con RxJS (debounce) y tabla filtrable y ordenable.
 */
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { InventarioService } from './inventario.service';
import { Categoria, CATEGORIAS, Producto } from './modelos';

type Orden = 'nombre' | 'stock' | 'valor';

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

@Component({
  selector: 'app-panel',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './panel.html',
})
export class Panel {
  protected readonly inventario = inject(InventarioService);
  protected readonly categorias = Object.entries(CATEGORIAS) as [Categoria, string][];

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly categoria = signal<Categoria | ''>('');
  protected readonly soloAlertas = signal(false);
  protected readonly orden = signal<Orden>('nombre');

  private readonly texto = toSignal(
    this.busqueda.valueChanges.pipe(debounceTime(250), map(normalizar), distinctUntilChanged()),
    { initialValue: '' },
  );

  protected readonly filas = computed(() => {
    const texto = this.texto();
    const categoria = this.categoria();
    const filas = this.inventario
      .productos()
      .filter((p) => !categoria || p.categoria === categoria)
      .filter((p) => !this.soloAlertas() || p.stock <= p.minimo)
      .filter((p) => !texto || normalizar(`${p.sku} ${p.nombre} ${p.ubicacion}`).includes(texto));
    const criterio: Record<Orden, (a: Producto, b: Producto) => number> = {
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      stock: (a, b) => a.stock - b.stock,
      valor: (a, b) => b.stock * b.costo - a.stock * a.costo,
    };
    return filas.sort(criterio[this.orden()]);
  });

  protected estado(p: Producto): 'agotado' | 'bajo' | 'ok' {
    return p.stock === 0 ? 'agotado' : p.stock <= p.minimo ? 'bajo' : 'ok';
  }

  protected nombreCategoria(c: Categoria): string {
    return CATEGORIAS[c];
  }
}
