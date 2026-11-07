# Inventario del depósito (Angular)

Aplicación para controlar el stock de un depósito: indicadores, alertas de reposición, búsqueda y filtros,
ficha por producto con registro de entradas, salidas y ajustes por conteo, e historial de movimientos.

**Tecnologías:** Angular 22 (componentes *standalone*, *signals*, control de flujo `@if`/`@for`, *zoneless*),
TypeScript, RxJS, formularios reactivos, Vitest con TestBed y GitHub Actions. Publicado en Vercel.

## Qué demuestra

- **Estado con signals:** `signal`, `computed` y `effect` en un servicio inyectable; los componentes leen estado
  derivado (alertas ordenadas por urgencia, valorización, unidades) sin suscripciones manuales.
- **Interoperabilidad con RxJS:** la búsqueda usa `valueChanges` con `debounceTime` y `distinctUntilChanged`,
  convertida a signal con `toSignal`.
- **Formularios reactivos** tipados (`FormBuilder.nonNullable`) con validadores y mensajes accesibles.
- **Ruteo con carga diferida** (`loadComponent`) y parámetros de ruta enlazados a `input()` con
  `withComponentInputBinding`.
- **Reglas del negocio** en el servicio: no se permite stock negativo, el ajuste fija el stock contado, todo
  movimiento exige motivo y queda en el historial con el stock resultante; sugerencia de compra.
- **Inyección de dependencias** con `InjectionToken` para el almacenamiento, reemplazado en las pruebas.
- **Localización es-UY** (moneda y fechas) y diseño adaptable con modo oscuro.
- **Pruebas** del servicio y de los componentes con el ejecutor Vitest de Angular.

## Uso

```bash
npm install
npm start          # http://localhost:4200
npm test -- --watch=false
npm run build
```

## Autoría

Desarrollado por **Matías Nicolás Echeveste Cardozo**. Licencia MIT.
