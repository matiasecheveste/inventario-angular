/*
 * Inventario — Matías Nicolás Echeveste Cardozo
 */
import { registerLocaleData } from '@angular/common';
import localeEsUy from '@angular/common/locales/es-UY';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

registerLocaleData(localeEsUy);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'es-UY' },
  ],
};
