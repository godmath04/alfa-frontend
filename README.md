# alfa-frontend

Portal web del sistema **Alfa Hospital**.  
Puerto producción: `80` · Puerto desarrollo: `4200` · Framework: Angular 21

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Portales por rol](#2-portales-por-rol)
3. [Arquitectura frontend](#3-arquitectura-frontend)
4. [Configuración](#4-configuración)
5. [Setup local](#5-setup-local)

---

## 1. Visión general

### Responsabilidades

- Provee la interfaz de usuario para los tres perfiles del sistema: Paciente, Médico y Administrador.
- Se comunica exclusivamente con el API Gateway (`http://localhost:8080` en desarrollo).
- Gestiona autenticación JWT: el token se almacena en `localStorage` y se adjunta automáticamente a cada request via `authInterceptor`.
- Redirige al portal correspondiente según el rol del usuario autenticado.

### Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework principal |
| Standalone Components | — | Sin NgModules |
| Signals (`signal`, `computed`) | — | Gestión de estado reactivo |
| SCSS + BEM | — | Estilos por componente |
| Lucide Icons | — | Iconografía |
| i18n propio | — | Textos desde `/public/i18n/es.json` |

---

## 2. Portales por rol

### Paciente (`/paciente/*`)

| Ruta | Descripción |
|---|---|
| `/paciente/dashboard` | Resumen: próximas citas y accesos rápidos |
| `/paciente/reservar-cita` | Flujo manual de reserva (especialidad → médico → slot) |
| `/paciente/cita-rapida` | Flujo rápido: primer disponible para una especialidad |
| `/paciente/historial` | Historial de citas con paginación |
| `/paciente/perfil` | Ver y actualizar datos personales |

### Médico (`/medico/*`)

| Ruta | Descripción |
|---|---|
| `/medico/agenda` | Citas del día con detalle de cada paciente |
| `/medico/calendario` | Vista semanal del calendario |
| `/medico/horarios` | Configurar horarios de atención propios |

### Administrador (`/admin/*`)

| Ruta | Descripción |
|---|---|
| `/admin/recursos` | Gestión de especialidades, consultorios y horarios (tabs) |
| `/admin/medicos` | Tabla de médicos + panel de asignación de horarios |
| `/admin/usuarios` | Lista de usuarios + cambio de rol inline |
| `/admin/configuracion` | Configuraciones del sistema |

---

## 3. Arquitectura frontend

### Capas (flujo estricto)

```
HTTP API  →  Service (HTTP)  →  State (signals)  →  ViewModel  →  Component
```

Los componentes nunca llaman directamente al Service o State — siempre a través del ViewModel.

### Patrones clave

- **Standalone components**: no existe ningún NgModule en el proyecto.
- **Signals**: `signal<T>()` para estado, `computed()` para derivados — no se usa `BehaviorSubject` ni `Observable` para estado local.
- **`inject()`** para inyección de dependencias — no constructores con parámetros.
- **`afterNextRender()`** para disparar la carga inicial de datos — no `ngOnInit`.
- **`@if`, `@for`, `@empty`** para flujo de control — no `*ngIf` / `*ngFor`.

### Internacionalización

Todos los textos visibles provienen de `/public/i18n/es.json` via el servicio `Translate`:

```html
{{ t.get('paciente.citas.titulo') }}
<input [placeholder]="t.get('common.buscar')">
```

Nunca se hardcodean strings en plantillas HTML.

---

## 4. Configuración

### Entornos (`src/environments/`)

| Archivo | Uso | `apiUrl` |
|---|---|---|
| `environment.ts` | Desarrollo (`ng serve`) | `http://localhost:8080` |
| `environment.prod.ts` | Producción (`ng build`) | Se configura al hacer build |

El `authInterceptor` agrega automáticamente el header `Authorization: Bearer <token>` a todos los requests que van a `apiUrl`.

---

## 5. Setup local

### Con Docker (producción local)

Ver [`alfa-docker/README.md`](../alfa-docker/README.md) — sección "Setup rápido".  
El frontend se sirve via nginx en el puerto `80`.

### Modo desarrollo (con hot reload)

1. Asegurarse de que el API Gateway esté corriendo en el puerto `8080`.

2. Instalar dependencias:
   ```bash
   cd alfa-frontend
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   ng serve
   # Disponible en http://localhost:4200
   ```

El servidor de desarrollo recarga automáticamente al guardar cualquier archivo.

### Build de producción

```bash
ng build
# Artefactos en dist/alfa-frontend/
```

La imagen Docker usa un build multi-stage: compila con Node y sirve con nginx.
