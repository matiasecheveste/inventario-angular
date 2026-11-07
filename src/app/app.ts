/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 */
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { InventarioService } from './inventario/inventario.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <h1><a routerLink="/">Inventario del depósito</a></h1>
      <button type="button" (click)="reiniciar()">Restablecer datos de ejemplo</button>
    </header>
    <main><router-outlet /></main>
  `,
})
export class App {
  private readonly inventario = inject(InventarioService);

  protected reiniciar(): void {
    if (confirm('¿Restablecer los datos de ejemplo? Se perderán los movimientos registrados.')) this.inventario.reiniciar();
  }
}
