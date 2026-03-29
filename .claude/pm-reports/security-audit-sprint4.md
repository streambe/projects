# Auditoría de Seguridad — Sprint 4: Pipeline Kanban

**Agente:** Especialista en Seguridad
**Fecha:** 2026-03-29
**Alcance:** Frontend — módulo `pipeline` (Kanban Board, columnas, cards, diálogo de cierre, página, hook)
**Archivos auditados:**

| # | Archivo |
|---|---------|
| 1 | `modules/pipeline/components/KanbanBoard.tsx` |
| 2 | `modules/pipeline/components/KanbanColumn.tsx` |
| 3 | `modules/pipeline/components/KanbanDraggableCard.tsx` |
| 4 | `modules/pipeline/components/KanbanCard.tsx` |
| 5 | `modules/pipeline/components/CloseOpportunityDialog.tsx` |
| 6 | `modules/pipeline/pages/PipelinePage.tsx` |
| 7 | `modules/pipeline/hooks/usePipeline.ts` |
| 8 | `lib/api.ts` (complementario — capa HTTP) |
| 9 | `App.tsx` (complementario — routing) |

---

## 1. Pruebas Ejecutadas

| ID | Criterio | Descripción | Resultado | Notas |
|----|----------|-------------|-----------|-------|
| SEC-01 | XSS — dangerouslySetInnerHTML | Búsqueda de `dangerouslySetInnerHTML`, `innerHTML`, `__html` en todo el módulo pipeline | **PASS** | No se encontró ningún uso. Todos los valores de usuario (`clientName`, `motoInterest`, `lostReason`, `lastActivityLabel`) se renderizan vía JSX text content, que React escapa automáticamente. |
| SEC-02 | XSS — href/src dinámicos | Verificación de atributos `href`, `src`, `action` con valores dinámicos | **PASS** | No existen links ni imágenes dinámicas en los componentes auditados. |
| SEC-03 | XSS — eval / Function() | Búsqueda de `eval()`, `new Function()`, `setTimeout(string)` | **PASS** | No se encontró ningún uso. |
| SEC-04 | Injection — API calls | Revisión de construcción de URLs para API calls | **PASS** | `api.put(/opportunities/${opportunityId}/stage)` usa IDs provenientes del modelo de datos (UUID del backend). El `opportunityId` no proviene de input de usuario directo. Axios codifica parámetros correctamente. |
| SEC-05 | Injection — query params | Verificación de parámetros enviados a la API | **PASS** | `usePipelineOpportunities` envía `{ isOpen: true, limit: 200 }` — valores estáticos. Los filtros (`filterVendedor`, `filterSucursal`) se aplican client-side sobre datos ya cargados, nunca se envían como query params. |
| SEC-06 | Secrets hardcodeados | Búsqueda de API keys, tokens, passwords, secrets en el código | **PASS** | La URL de la API se lee de `import.meta.env.VITE_API_URL` con fallback a localhost. El token se lee de `window.__accessToken` en runtime. No hay secrets hardcodeados. |
| SEC-07 | Validación de inputs | Revisión del formulario `CloseOpportunityDialog` | **PASS** | El campo `lostReason` se valida con `.trim().length > 0` antes de habilitar submit. El `result` se selecciona desde botones con valores constantes (`OPPORTUNITY_RESULT.ganado/perdido`), no desde input libre. El `.trim()` se aplica antes de enviar al backend. |
| SEC-08 | Autenticación — rutas protegidas | Verificación de que `/pipeline` esté detrás de autenticación | **WARN** | La ruta `/pipeline` en `App.tsx` NO está envuelta en un componente de protección (ej: `ProtectedRoute`, `AuthGuard`). Sin embargo, esto es consistente con TODAS las demás rutas de la app (`/clientes`, `/actividades`, etc.) — ninguna tiene protección explícita en el router. La protección se delega a: (a) el interceptor de Axios que agrega `Bearer token` a cada request, y (b) el backend que rechaza requests sin token válido. **Ver hallazgo LOW-01.** |
| SEC-09 | Autenticación — API layer | Revisión del interceptor de Axios en `lib/api.ts` | **PASS** | El interceptor agrega `Authorization: Bearer {token}` a todas las requests. `withCredentials: true` está habilitado para cookies. |
| SEC-10 | Headers de seguridad | Verificación de CSP, X-Frame-Options, etc. | **N/A** | Los headers de seguridad son responsabilidad del servidor/hosting (Vercel en este caso), no del código frontend. Vercel aplica headers por defecto. Se recomienda verificar la configuración en `vercel.json` si existe. |
| SEC-11 | Dependencias — @dnd-kit CVEs | Verificación de vulnerabilidades conocidas en @dnd-kit/core@^6.3.1 y @dnd-kit/utilities@^3.2.2 | **PASS** | `npm audit` no reporta vulnerabilidades en @dnd-kit. No hay CVEs conocidos publicados para estas versiones. |
| SEC-12 | Dependencias — npm audit general | Ejecución de `npm audit` en el proyecto | **PASS (con nota)** | Se encontraron 5 vulnerabilidades de severidad **moderate**, todas relacionadas con `esbuild <=0.24.2` (dependencia transitiva de Vite/Vitest). Afectan SOLO al dev server local (requests cross-origin al dev server). No impactan producción. **Ver hallazgo INFO-01.** |
| SEC-13 | Broken Access Control — drag & drop | Verificación de que el drag & drop no permita operaciones no autorizadas | **PASS** | El cambio de stage se ejecuta vía `api.put()` al backend, que valida permisos server-side. El frontend no toma decisiones de autorización propias (correcto). |
| SEC-14 | Data exposure en drag events | Revisión de datos expuestos en `event.active.data` | **PASS** | Se pasa el objeto `opportunity` completo en `data: { opportunity }`. Esto es seguro porque los datos ya están en memoria del cliente (cargados del API). No se exponen datos adicionales. |
| SEC-15 | Prototype pollution | Revisión de spread operators y object merges con datos de usuario | **PASS** | Los spread operators en `changeStage` (`{ stage, ...(result !== undefined && { result }) }`) usan valores tipados, no datos de usuario crudos. |

---

## 2. Hallazgos

### LOW-01: Ausencia de componente ProtectedRoute en el router

- **Severidad:** LOW
- **Ubicación:** `App.tsx`, líneas 17-40
- **Descripción:** Ninguna ruta de la aplicación está envuelta en un guard de autenticación frontend. Si el token expira o no existe, el usuario verá la UI y recibirá errores 401 del backend, en lugar de ser redirigido a login.
- **Impacto:** UX degradada. No es una vulnerabilidad de seguridad real porque el backend rechaza requests no autenticados. Los datos nunca se exponen.
- **Recomendación:** Agregar un componente `ProtectedRoute` que verifique la existencia del token y redirija a `/login` si no existe. Esto es deuda técnica existente que afecta a toda la app, no solo al módulo pipeline.
- **Acción requerida:** No bloquea este sprint. Registrar como tech debt.

### INFO-01: Vulnerabilidades moderate en esbuild (dev-only)

- **Severidad:** INFO
- **Ubicación:** Dependencia transitiva `esbuild <=0.24.2` via `vite`
- **Descripción:** [GHSA-67mh-4wv8-2f99] — esbuild permite que cualquier sitio web envíe requests al dev server y lea la respuesta.
- **Impacto:** Solo afecta al entorno de desarrollo local. No existe en producción (Vite no se incluye en el bundle de producción).
- **Recomendación:** Actualizar Vite cuando haya una versión compatible estable (Vite 7+ o aplicar fix manual). No es urgente.
- **Acción requerida:** Ninguna para este sprint.

---

## 3. Resumen de Seguridad del Módulo Pipeline

| Categoría | Estado |
|-----------|--------|
| XSS (Reflected/Stored/DOM) | Sin hallazgos |
| Injection (SQL/NoSQL/Command) | Sin hallazgos |
| Broken Authentication | Delegado correctamente al backend |
| Broken Access Control | Delegado correctamente al backend |
| Secrets Exposure | Sin hallazgos |
| Input Validation | Correcta |
| Dependencias con CVEs críticos/altos | Ninguna |
| dangerouslySetInnerHTML | No utilizado |
| Prototype Pollution | Sin riesgo |

---

## 4. Veredicto

### **GO**

El módulo Pipeline Kanban del Sprint 4 **aprueba la auditoría de seguridad**. No se encontraron vulnerabilidades de severidad CRITICAL, HIGH ni MEDIUM. Los dos hallazgos registrados (LOW-01 e INFO-01) no representan riesgo de seguridad para los usuarios finales y quedan documentados como deuda técnica para futuros sprints.

El código sigue buenas prácticas de seguridad frontend:
- React JSX escaping para prevención de XSS
- Validación de inputs antes de envío
- Delegación de autenticación y autorización al backend
- Sin secrets hardcodeados
- Sin uso de APIs peligrosas (`eval`, `dangerouslySetInnerHTML`, etc.)
- Dependencias principales sin CVEs conocidos

---

*Auditoría realizada por: Especialista en Seguridad (GEN)*
*Skills utilizados: trail-of-bits/skills (metodología de auditoría), guard-scanner (análisis estático)*
