/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Inventario', loadComponent: () => import('./inventario/panel').then((m) => m.Panel) },
  {
    path: 'productos/:sku',
    title: 'Ficha de producto',
    loadComponent: () => import('./inventario/detalle').then((m) => m.Detalle),
  },
  { path: '**', redirectTo: '' },
];
