# Reporte: Pantallas de Clientes CRM Ciudad Moto (US-007, US-008, US-009)
**Rol**: Frontend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

### Modulo de clientes
- `src/modules/clients/hooks/useClients.ts` — TanStack Query hooks completos
- `src/modules/clients/components/ClientForm.tsx` — formulario alta/edicion con validacion
- `src/modules/clients/components/ClientFormDialog.tsx` — dialog wrapper del formulario
- `src/modules/clients/pages/ClientsPage.tsx` — lista de clientes (reemplaza placeholder)
- `src/modules/clients/pages/ClientProfilePage.tsx` — perfil del cliente con 2 columnas + tabs

### Nuevos componentes shadcn/ui
- `src/shared/components/ui/dialog.tsx` — Dialog (Radix `@radix-ui/react-dialog` ya instalado)
- `src/shared/components/ui/select.tsx` — Select (Radix `@radix-ui/react-select` ya instalado)
- `src/shared/components/ui/badge.tsx` — Badge con variantes (default, success, warning, info, destructive)
- `src/shared/components/ui/textarea.tsx` — Textarea
- `src/shared/components/ui/tabs.tsx` — Tabs (implementacion custom sin Radix — no estaba instalado)

### Actualizaciones
- `src/App.tsx` — agregada ruta `clientes/:id` para el perfil

## Resumen de lo realizado

### US-008 — Lista de Clientes (ClientsPage)
- Busqueda en tiempo real con debounce 350ms
- Tabla con columnas: Nombre/DNI, Telefono, Email, Ciudad, Estado
- Click en nombre navega al perfil
- Menu de acciones [...] por fila: Ver / Editar / Desactivar
- Paginacion server-side (20 por pagina)
- Estados: loading (spinner), error, empty state con/sin busqueda
- Dialog de edicion controlado desde la tabla

### US-007 — Formulario Alta/Edicion (ClientForm + ClientFormDialog)
- React Hook Form + Zod: validacion de los 4 campos obligatorios
- Todos los campos del wireframe implementados
- Select nativo para "como nos conocio" con 6 opciones
- Deteccion de duplicados en tiempo real: DNI y Telefono con debounce 500ms
- Alerta de duplicado muestra nombre + DNI del cliente existente y boton "Ver cliente"
- ClientFormDialog es reutilizable: modo alta (sin `client`) y modo edicion (con `client`)
- En alta exitosa: cierra dialog y navega al perfil del nuevo cliente

### US-009 — Perfil del Cliente (ClientProfilePage)
- Breadcrumb: Clientes / Nombre
- Header: avatar con iniciales, nombre + badge estado, chips de contacto clicables (tel/wa/mail/ubicacion)
- Acciones: Volver, Editar, Desactivar/Reactivar
- Layout 2 columnas: datos a la izquierda, tabs a la derecha
- Izquierda: datos personales, contacto, origen, notas
- Derecha: 3 tabs (Oportunidades, Actividad, Comunicaciones) con placeholders
- Hooks useClients.ts
- Query key factory para invalidaciones precisas
- keepPreviousData para paginacion sin parpadeo
- useCheckDuplicate habilitado solo cuando value >= 3 caracteres (DNI) o >= 6 (telefono)
- useDeactivateClient invalida lista y detalle
- useUpdateClient actualiza cache del detalle optimistamente

## Decisiones tomadas

- **Tabs sin Radix**: `@radix-ui/react-tabs` no estaba instalado. Se implemento una version lightweight con Context + estado interno que es 100% funcional y no requiere instalar dependencias.
- **Duplicate check como TanStack Query**: usa `useQuery` en lugar de state manual para aprovechar cache y evitar requests redundantes. Se deshabilita cuando el valor es muy corto.
- **ClientFormDialog acepta ambos modos (controlado/no controlado)**: el trigger DOM se renderiza solo cuando el dialogo es no controlado. Cuando es controlado (p.ej. edicion desde tabla), el trigger no existe.
- **Confirmacion con window.confirm**: para desactivar clientes se usa confirm nativo. Sencillo para este sprint; se puede reemplazar con un AlertDialog en el futuro.
- **Formateo sin dependencias extra**: formatPhone usa regex inline para no agregar librerias de telefono.

## Bloqueantes / Riesgos

- **ESLint config**: el proyecto tiene un problema de configuracion (ESLint v9 requiere `eslint.config.js` pero el script referencia el formato antiguo). No es un bloqueo para compilar ni para TypeScript. Requiere atencion del team antes de CI.
- **Endpoint `/clients/check-duplicate`**: el hook asume que el backend expone `GET /api/v1/clients/check-duplicate?dni=X` o `?phone_primary=X`. Si el contrato del backend difiere, el hook debe actualizarse.
- **Paginacion del backend**: se asume que el endpoint `/clients` acepta `?page=N&limit=N&search=S` y retorna `PaginatedResponse<Client>`. Si el contrato difiere, ajustar `fetchClients`.

## Recomendaciones para el siguiente rol

- **Backend developer**: confirmar los endpoints `/clients/check-duplicate` y parametros de busqueda/paginacion de `/clients`.
- **Proximo sprint**: los 3 tabs del perfil (Oportunidades, Actividad, Comunicaciones) tienen placeholders listos para ser reemplazados por sus modulos cuando esten disponibles.
- **UX**: considerar agregar un AlertDialog de Radix para reemplazar `window.confirm` en la accion de desactivar.
- **Tests**: los hooks y el formulario son buenos candidatos para testing con React Testing Library + MSW.
