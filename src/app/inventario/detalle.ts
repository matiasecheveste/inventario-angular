/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 * Ficha de producto: datos, formulario reactivo de movimientos e historial.
 */
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorInventario, InventarioService } from './inventario.service';
import { CATEGORIAS, TipoMovimiento } from './modelos';

@Component({
  selector: 'app-detalle',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './detalle.html',
})
export class Detalle {
  /** Parámetro de ruta enlazado con withComponentInputBinding(). */
  readonly sku = input.required<string>();

  private readonly inventario = inject(InventarioService);
  protected readonly producto = computed(() => this.inventario.producto(this.sku()));
  protected readonly historial = computed(() => this.inventario.historial(this.sku()));
  protected readonly categorias = CATEGORIAS;
  protected readonly error = signal('');
  protected readonly confirmacion = signal('');

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    tipo: ['salida' as TipoMovimiento, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    motivo: ['', [Validators.required, Validators.maxLength(120)]],
  });

  protected registrar(): void {
    this.error.set('');
    this.confirmacion.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { tipo, cantidad, motivo } = this.formulario.getRawValue();
    try {
      const m = this.inventario.registrar(this.sku(), tipo, Number(cantidad), motivo);
      this.confirmacion.set(`Movimiento registrado. Stock actual: ${m.stockResultante}.`);
      this.formulario.reset({ tipo, cantidad: 1, motivo: '' });
    } catch (e) {
      this.error.set(e instanceof ErrorInventario ? e.message : 'No se pudo registrar el movimiento.');
    }
  }
}
