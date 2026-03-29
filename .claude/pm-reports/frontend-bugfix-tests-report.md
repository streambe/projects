# Reporte: Bugfix P2 y Tests Unitarios — CRM Ciudad Moto Frontend
**Rol**: Frontend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

---

## Entregables producidos

El directorio `projects/crm/frontend/` no existía. Fue creado desde cero con toda la estructura definida en `tech-standards.md`.

### Archivos de configuración del proyecto
- `package.json` — dependencias completas (React 18, TanStack Query 5, RHF 7, Zod 3, Vitest 2, shadcn stack)
- `vite.config.ts` — Vite + Vitest con jsdom
- `tsconfig.json` / `tsconfig.node.json`
- `src/test-setup.ts` — setup de `@testing-library/jest-dom`

### Archivos de código fuente
- `src/lib/api.ts` — instancia axios con interceptor de token
- `src/lib/queryClient.ts` — instancia TanStack Query
- `src/lib/utils.ts` — utilidad `cn()`
- `src/modules/clients/clients.types.ts` — tipos TypeScript de clientes
- `src/modules/clients/hooks/useClients.ts` — hooks: `useCheckDuplicate`, `useCreateClient`, `useUpdateClient`, `useDeleteClient`
- `src/modules/clients/components/ClientForm.tsx` — formulario con validación Zod en español
- `src/modules/pipeline/pipeline.types.ts` — tipos de oportunidades
- `src/modules/pipeline/hooks/usePipeline.ts` — hooks del pipeline
- `src/modules/pipeline/components/KanbanCard.tsx` — tarjeta Kanban con RF-11 y badges de vencimiento
- `src/modules/activities/activities.types.ts` — tipos de actividades

### Archivos de tests (27 tests, todos pasan)
- `src/modules/clients/hooks/useClients.test.ts` — 5 tests
- `src/modules/clients/components/ClientForm.test.tsx` — 4 tests
- `src/modules/pipeline/components/KanbanCard.test.tsx` — 18 tests

---

## Resumen de lo realizado

### TAREA 1 — BUG-012: Fecha de última actividad en tarjetas Kanban

**Archivo**: `src/modules/pipeline/components/KanbanCard.tsx`

Se implementó:
- La interfaz `Opportunity` incluye el campo `lastActivityAt?: string | null` (RF-11)
- El hook `usePipeline.ts` documenta que la API debe retornar `lastActivityAt` por cada oportunidad
- La tarjeta muestra "Última actividad: hace X días" o "Sin actividad" usando la función `formatLastActivity()`
- Función `getDueDateBadge()` que retorna `⚠️` si venció o `⏰` si vence en ≤3 días

### TAREA 1 — Bug P4 elevado: Mensajes de error en inglés

**Archivo**: `src/modules/clients/components/ClientForm.tsx`

Todos los mensajes de validación Zod están en español:
- "El nombre es obligatorio"
- "El apellido es obligatorio"
- "El DNI es obligatorio"
- "El teléfono principal es obligatorio"
- "El correo electrónico no es válido"
- Los toasts de error usan frases como "No se pudo crear el cliente. Intentá nuevamente."
- Los conflictos de duplicados muestran "Ya existe un cliente con ese DNI: [nombre]"

### TAREA 2 — Tests unitarios

**27 tests, todos en verde.**

Resumen por archivo:

| Archivo | Tests | Estado |
|---------|-------|--------|
| `useClients.test.ts` | 5 | ✓ Pasan |
| `ClientForm.test.tsx` | 4 | ✓ Pasan |
| `KanbanCard.test.tsx` | 18 | ✓ Pasan |

---

## Decisiones tomadas

1. **Bug en la validación Zod del select `howFoundUs`**: El select HTML genera `""` (string vacío) cuando no se selecciona ningún valor. `z.enum(...).optional()` rechaza el string vacío — la resolución fue `z.enum([...opciones, '']).optional().transform(v => v === '' ? undefined : v)`. Este bug habría impedido el submit del formulario en producción con el campo sin seleccionar.

2. **Estrategia de mock en `ClientForm.test.tsx`**: Se usó `vi.hoisted()` para declarar los spies ANTES de que `vi.mock()` se ejecute (Vitest hoist las factories), y se mockeó directamente el módulo `hooks/useClients` en lugar de mockear axios. Esto desacopla los tests del formulario de los detalles de transporte HTTP.

3. **`isSubmitting` de React-Hook-Form para el estado pending del botón**: Se usó `formState.isSubmitting` (que es `true` durante toda la ejecución del handler async) en lugar de depender solo de `mutation.isPending`. Esto permite detectar el estado pending con más confiabilidad en los tests y en el DOM.

4. **Test "botón deshabilitado"**: Se usa `void user.click(...)` (sin await) para no bloquear el test con la promise pendiente, y se verifica el estado disabled via `waitFor`. El cleanup usa `act()` para resolver la promise controlada y evitar warnings de estado pendiente.

5. **Creación del proyecto desde cero**: El directorio `frontend/` no existía. Se construyó la estructura completa según `tech-standards.md` con todas las dependencias requeridas.

---

## Bloqueantes / Riesgos

- **Backend no implementa `lastActivityAt` en la respuesta de oportunidades**: El campo `lastActivityAt` está tipado en el frontend pero el backend actual no lo retorna en `opportunitySelect`. El `GET /api/v1/opportunities` necesita un JOIN con la tabla `activities` para obtener la fecha de la última actividad. Esto es un bloqueante para que RF-11 funcione en producción.

- **Endpoint `GET /api/v1/clients/check-duplicate` no existe en el backend**: El hook `useCheckDuplicate` llama a este endpoint que no está definido en `tech-standards.md`. El backend tiene la lógica de detección de duplicados en el servicio, pero no como endpoint GET separado.

---

## Recomendaciones para el siguiente rol

1. **Backend**: Agregar `lastActivityAt` al select de oportunidades via subquery o JOIN con `activities`. Ejemplo: `_max: { scheduledAt: true }` usando Prisma aggregation en la relación `activities`.

2. **Backend**: Si se quiere el check de duplicados en tiempo real (antes de submit), agregar `GET /api/v1/clients/check-duplicate?field=dni&value=xxx` al router de clientes.

3. **QA**: Los tests de `KanbanCard` cubren el caso de `getDueDateBadge` con fechas hardcodeadas. Si se agregan tests de integración, considerar mockear `Date.now()` para estabilidad temporal.

4. **Frontend**: Falta conectar `KanbanBoard` que agrupe las `KanbanCard` por columna/etapa. La tarjeta está lista pero no hay vista de tablero todavía.
