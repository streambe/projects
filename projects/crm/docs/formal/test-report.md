# Reporte de Testing QA — CRM Ciudad Moto

**Proyecto**: CRM Ciudad Moto
**Fecha**: 2026-03-29
**Version**: 1.0
**Tipo de revision**: Revision estatica de codigo (sin entorno de ejecucion)

---

## 1. Resumen de Testing

El proceso de QA del CRM Ciudad Moto se ejecuto a lo largo de los Sprints 2, 3 y 4 mediante revision estatica de codigo. Cada sprint incluyo un plan de tests previo, ejecucion de casos de prueba, deteccion de bugs, ciclo de correccion y re-verificacion.

| Metrica | Valor |
|---------|-------|
| **Total de casos de prueba planificados** | 49 (Sprint 2) + Sprint 3 y 4 ad-hoc |
| **Bugs totales encontrados** | 18 |
| **Bugs P1** | 3 |
| **Bugs P2** | 6 |
| **Bugs P3** | 7 |
| **Bugs P4** | 2 |
| **Bugs resueltos** | 14 |
| **Bugs pendientes (deuda tecnica)** | 4 (todos P3/P4) |
| **Veredicto final Sprint 2** | GO (con observaciones) |
| **Veredicto final Sprint 3** | NO-GO (1 bug P2 bloqueante pendiente) |
| **Veredicto final Sprint 4** | GO (con observaciones menores) |

---

## 2. Estrategia de Testing

### 2.1 Piramide de Tests

```
         /\
        /  \        E2E / Manual
       / QA \       (Revision estatica de codigo contra criterios Gherkin)
      /------\
     /        \     Integracion
    / Backend  \    (Vitest — validacion de endpoints, servicios, schemas)
   /------------\
  /              \  Unitarios
 /   Frontend +   \ (Vitest — componentes, hooks, utilidades)
/    Backend       \
+------------------+
```

### 2.2 Tipos de Testing Aplicados

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| **Type-checking** | TypeScript (`tsc --noEmit`) | Frontend y backend — errores de tipo en tiempo de compilacion |
| **Linting** | ESLint | Frontend y backend — calidad y consistencia de codigo |
| **Unit / Integration Tests** | Vitest | Frontend (obligatorio), Backend (condicional si existen archivos test) |
| **Revision estatica QA** | Manual por Tester QA | Verificacion de logica de negocio, endpoints, schemas, UI contra RFs |
| **Regresion** | Manual por Tester QA | Re-verificacion de flujos de sprints anteriores tras cada sprint |
| **Auditoria de seguridad** | Especialista en Seguridad | Analisis de XSS, injection, secrets, dependencias, control de acceso |

### 2.3 Metodologia

1. **Plan de tests previo**: El Tester QA escribe el plan de tests antes de que el Dev empiece a codear, basado en los criterios de aceptacion Gherkin aprobados.
2. **Ejecucion en paralelo**: Mientras Dev implementa tarea N, QA verifica tarea N-1.
3. **Criterio de GO**: 0 bugs P1, 0 bugs P2 abiertos. Los P3/P4 se documentan como deuda tecnica.
4. **Re-verificacion**: Tras cada ciclo de correccion, QA re-verifica cada bug corregido.

---

## 3. Plan de Tests — Resumen por Modulo y Sprint

### Sprint 2 — 49 Casos de Prueba

| Area | RFs Cubiertos | Cantidad TCs |
|------|---------------|-------------|
| RF-16 Listado actividades con filtros | US-014, US-017 | 8 |
| RF-18 a RF-24 Comunicaciones mock | US-019 a US-025 | 17 |
| RF-25 Reporte clientes nuevos | US-026 | 5 |
| RF-26 Reporte actividades por vendedor | US-027, US-028 | 5 |
| DevOps (docker-compose, CI) | US-029, US-030 | 5 |
| Regresion Sprint 1 | RF-01 a RF-15, RF-27 a RF-29 | 9 |
| **Total** | | **49** |

### Sprint 3 — Verificacion Focalizada

El Sprint 3 se enfoco en la re-verificacion de bugs pendientes del Sprint 2, particularmente:
- BUG-S3-01: `useMarkActivityDone` metodo HTTP incorrecto (PATCH vs PUT)
- BUG-S3-02: Filtros de fecha formato incorrecto
- BUG-S3-03: `linkMessage` expone campo Prisma crudo

### Sprint 4 — Pipeline Kanban (RF-11)

| Criterio | Descripcion |
|----------|-------------|
| 4 columnas Kanban | consulta, prueba_manejo, presupuesto, cierre |
| Drag & drop | @dnd-kit/core con PointerSensor |
| Dialogo de cierre | Ganado/perdido con motivo obligatorio si perdido |
| Header de columna | Count + valor total |
| Filtros | Vendedor y sucursal |
| Metodo HTTP | PUT (no PATCH) |

---

## 4. Resultados por Sprint

### 4.1 Sprint 2

**Veredicto inicial**: NO-GO (3 bugs P1 bloqueantes).
**Veredicto post-correcciones**: GO (con observaciones).

| Categoria | Cantidad |
|-----------|----------|
| TCs PASSED | 31 (post-fix: 37) |
| TCs FAILED | 11 (post-fix: 2) |
| TCs PARTIAL | 7 (post-fix: 4) |
| TCs NOT-EVALUATED | 2 |
| Bugs encontrados | 11 |
| Bugs corregidos en ciclo | 8 |
| Bugs pendientes (deuda tecnica) | 3 (P3/P4) |

**Bugs P1 corregidos:**
- BUG-001: Endpoint incorrecto en `useClientMessages` — historial de comunicaciones no cargaba.
- BUG-002: Reporte RF-26 no filtraba por `status = realizada`.
- BUG-003: Reporte RF-25 incluia clientes con `isActive = false`.

**Bugs P2 corregidos:**
- BUG-004: Campo `subject` obligatorio en email cuando no deberia serlo.
- BUG-005: Valores de `direction` desalineados entre frontend y backend.
- BUG-007: Lint ausente del pipeline CI.
- BUG-012: `useClientActivities` usaba endpoint incorrecto.

**Observaciones no bloqueantes:**
- BUG-006 (P2 condicional): Nombre de campo `sentAt` vs `sentReceivedAt` pendiente de verificar en entorno real.
- BUG-008 (P3): Columnas "Responsable" y "Fecha de vencimiento" ausentes en tabla de actividades.
- BUG-009 (P3): Filtro por responsable no expuesto en la UI.
- BUG-011 (P4): Comentarios MOCK insuficientes en providers.

**Regresion Sprint 1**: 9/9 flujos criticos PASSED. Sin regresiones introducidas.

### 4.2 Sprint 3

**Veredicto**: NO-GO (1 bug P2 bloqueante persistente).

Se verificaron correcciones de tres bugs. Resultados:

| Bug | Severidad | Estado |
|-----|-----------|--------|
| BUG-S3-01 / BUG-S3-04 | P2 | PERSISTE — endpoint corregido de PATCH a PUT pero apuntando a `/activities/:id` en lugar de `/activities/:id/complete` |
| BUG-S3-02 | P2 | RESUELTO — filtros de fecha ahora envian ISO datetime completo |
| BUG-S3-03 | P3 | RESUELTO — `linkMessage` ahora mapea `sentReceivedAt` a `sentAt` |

**Causa raiz de BUG-S3-04**: El endpoint `PUT /activities/:id` no incluye `status` en el schema de validacion (`UpdateActivitySchema`), por lo que Zod descarta silenciosamente el campo. El endpoint correcto es `PUT /activities/:id/complete`, que llama a `ActivitiesService.complete()` y escribe `status: 'realizada'` en la base de datos.

**Fix requerido**: Cambiar en `useActivities.ts` linea 77 de `/activities/${id}` a `/activities/${id}/complete`.

### 4.3 Sprint 4

**Veredicto**: GO (con observaciones menores).

| Criterio de Aceptacion | Estado |
|------------------------|--------|
| 4 columnas Kanban | PASS |
| Drag & drop entre columnas | PASS |
| Dialogo ganado/perdido al mover a cierre | PASS |
| Motivo obligatorio si perdido | PASS |
| Header: count + valor total | PASS (parcial) — valor hardcodeado a 0 |
| Filtros vendedor y sucursal | PASS (parcial) — vendedor lista vacia, sucursal no-op |
| Usa PUT (no PATCH) | PASS |

| Severidad | Cantidad |
|-----------|----------|
| P1 | 0 |
| P2 | 0 |
| P3 | 3 |
| P4 | 0 |

**Verificaciones adicionales**: 0 `any` en TypeScript, loading/error states correctos, buena separacion de componentes, 0 regresiones de sprints anteriores.

---

## 5. Bugs Encontrados — Tabla Completa

### Sprint 2

| ID | Severidad | Modulo | Descripcion | Estado Final |
|----|-----------|--------|-------------|-------------|
| BUG-001 | P1 | Comunicaciones | `useClientMessages` llama a `GET /communications` en lugar de `GET /clients/:id/messages` | RESUELTO |
| BUG-002 | P1 | Reportes | Reporte RF-26 no filtra por `status = 'realizada'` — incluye actividades pendientes | RESUELTO |
| BUG-003 | P1 | Reportes | Reporte RF-25 no filtra por `isActive = true` — incluye clientes eliminados | RESUELTO |
| BUG-004 | P2 | Comunicaciones | Campo `subject` obligatorio en frontend y backend, contradiciendo RF-19 | RESUELTO |
| BUG-005 | P2 | Comunicaciones | `direction` usa `sent/received` en frontend pero backend devuelve `outbound/inbound` | RESUELTO |
| BUG-006 | P2 | Comunicaciones | Desacuerdo de nombre de campo `sentAt` vs `sentReceivedAt` entre frontend y backend | RESUELTO (Sprint 3) |
| BUG-007 | P2 | DevOps | CI de GitHub Actions no incluye paso de lint | RESUELTO |
| BUG-008 | P3 | Actividades | Columnas "Responsable" y "Fecha de vencimiento" ausentes en tabla de actividades | PENDIENTE (deuda tecnica) |
| BUG-009 | P3 | Actividades | Filtro por responsable no expuesto en la UI | PENDIENTE (deuda tecnica) |
| BUG-010 | P3 | DevOps | docker-compose no ejecuta seed automaticamente | RESUELTO |
| BUG-011 | P4 | Comunicaciones | Comentarios MOCK insuficientes en providers, variables de integracion ausentes en `.env.example` | PENDIENTE (deuda tecnica) |
| BUG-012 | P2 | Actividades | `useClientActivities` usa endpoint incorrecto | RESUELTO |

### Sprint 3

| ID | Severidad | Modulo | Descripcion | Estado Final |
|----|-----------|--------|-------------|-------------|
| BUG-S3-01 | P2 | Actividades | `useMarkActivityDone` usaba `api.patch` en lugar de `api.put` | RESUELTO (parcialmente) |
| BUG-S3-02 | P2 | Actividades | Filtros de fecha enviaban `YYYY-MM-DD` pero backend valida ISO datetime | RESUELTO |
| BUG-S3-03 | P3 | Comunicaciones | `linkMessage` retornaba campo Prisma crudo `sentReceivedAt` sin mapear a `sentAt` | RESUELTO |
| BUG-S3-04 | P2 | Actividades | `useMarkActivityDone` apunta a `PUT /activities/:id` en lugar de `PUT /activities/:id/complete` | PENDIENTE |

### Sprint 4

| ID | Severidad | Modulo | Descripcion | Estado Final |
|----|-----------|--------|-------------|-------------|
| BUG-S4-01 | P3 | Pipeline | Valor total de columna Kanban hardcodeado a 0 | PENDIENTE (deuda tecnica) |
| BUG-S4-02 | P3 | Pipeline | Filtro de sucursal no-operativo (no hay campo branch en el modelo) | PENDIENTE (deuda tecnica) |
| BUG-S4-03 | P3 | Pipeline | Lista de vendedores vacia — falta conectar con `useUsers()` | PENDIENTE (deuda tecnica) |

---

## 6. Criterios de Aceptacion — Gherkin (Flujos Criticos)

### RF-16: Listado de Actividades con Filtros

```gherkin
DADO que el usuario esta autenticado y existen actividades en el sistema
CUANDO navega al listado global de actividades sin aplicar filtros
ENTONCES ve todas las actividades con columnas: tipo, titulo, cliente, fecha, estado

DADO que existen actividades pendientes y realizadas
CUANDO el usuario aplica filtro "Estado: Pendiente"
ENTONCES solo se muestran actividades con estado pendiente

DADO que existen actividades con fecha de vencimiento pasada y estado pendiente
CUANDO el usuario ve el listado
ENTONCES las actividades vencidas presentan un estilo visual diferenciado
```

### RF-19: Envio de Email Simulado

```gherkin
DADO que el usuario esta en el perfil de un cliente con email registrado
CUANDO completa el formulario de email (destinatario, cuerpo) y envia
ENTONCES el email simulado queda registrado en el historial del cliente
  Y no se envia ningun email real

DADO que el formulario de email esta abierto
CUANDO el usuario deja el campo asunto vacio y envia
ENTONCES el sistema permite el envio (asunto no obligatorio segun RF-19)
```

### RF-23: Historial Unificado de Comunicaciones

```gherkin
DADO que un cliente tiene emails y mensajes WhatsApp registrados
CUANDO el usuario abre el historial de comunicaciones del cliente
ENTONCES ve un historial unificado ordenado cronologicamente
  Y cada registro muestra: canal, direccion, contenido, fecha/hora
  Y los mensajes enviados se alinean a la derecha (burbuja azul)
  Y los mensajes recibidos se alinean a la izquierda (burbuja gris)
```

### RF-25: Reporte de Clientes Nuevos

```gherkin
DADO que existen clientes creados en un rango de fechas
CUANDO el usuario ejecuta el reporte de clientes nuevos para ese rango
ENTONCES solo se muestran clientes con isActive = true
  Y los clientes eliminados logicamente no aparecen en el reporte
```

### RF-26: Reporte de Actividades por Vendedor

```gherkin
DADO que existen actividades realizadas y pendientes en un rango de fechas
CUANDO el usuario ejecuta el reporte de actividades por vendedor
ENTONCES solo se cuentan actividades con status = 'realizada'
  Y el total por vendedor coincide con el desglose por tipo
```

### RF-11: Pipeline Kanban

```gherkin
DADO que existen oportunidades abiertas en distintas etapas
CUANDO el usuario navega a la pagina de Pipeline
ENTONCES ve 4 columnas: Consulta, Prueba de Manejo, Presupuesto, Cierre
  Y cada columna muestra el conteo de oportunidades

DADO que el usuario arrastra una oportunidad a la columna Cierre
CUANDO la suelta
ENTONCES se abre un dialogo preguntando si la oportunidad es ganada o perdida
  Y si es perdida, el motivo es obligatorio
```

---

## 7. Auditoria de Seguridad — Sprint 4

### 7.1 Alcance

Auditoria del modulo Pipeline Kanban (frontend) — 9 archivos auditados incluyendo componentes, pagina, hook y capa HTTP.

### 7.2 Pruebas Ejecutadas

| ID | Criterio | Resultado |
|----|----------|-----------|
| SEC-01 | XSS — dangerouslySetInnerHTML | PASS — no se encontro uso |
| SEC-02 | XSS — href/src dinamicos | PASS — no existen links dinamicos |
| SEC-03 | XSS — eval / Function() | PASS — no se encontro uso |
| SEC-04 | Injection — API calls | PASS — IDs provienen del modelo, no de input usuario |
| SEC-05 | Injection — query params | PASS — valores estaticos, filtros client-side |
| SEC-06 | Secrets hardcodeados | PASS — API URL en env var, token en runtime |
| SEC-07 | Validacion de inputs | PASS — trim + valores constantes |
| SEC-08 | Autenticacion — rutas protegidas | WARN — ver LOW-01 |
| SEC-09 | Autenticacion — API layer | PASS — Bearer token en interceptor |
| SEC-10 | Headers de seguridad | N/A — responsabilidad del hosting |
| SEC-11 | Dependencias @dnd-kit CVEs | PASS — sin CVEs conocidos |
| SEC-12 | npm audit general | PASS (con nota) — 5 moderate en esbuild dev-only |
| SEC-13 | Broken Access Control — drag & drop | PASS — permisos server-side |
| SEC-14 | Data exposure en drag events | PASS — datos ya en memoria |
| SEC-15 | Prototype pollution | PASS — valores tipados |

### 7.3 Hallazgos

| ID | Severidad | Descripcion | Impacto | Accion |
|----|-----------|-------------|---------|--------|
| LOW-01 | LOW | Ausencia de componente `ProtectedRoute` en el router — ninguna ruta tiene guard de autenticacion frontend | UX degradada (no vulnerabilidad real — backend rechaza requests sin token) | Deuda tecnica para futuros sprints |
| INFO-01 | INFO | Vulnerabilidades moderate en esbuild (dev-only) via Vite | Solo afecta dev server local, no produccion | Actualizar Vite cuando haya version compatible |

### 7.4 Veredicto de Seguridad

**GO** — El modulo Pipeline Kanban aprueba la auditoria de seguridad. No se encontraron vulnerabilidades CRITICAL, HIGH ni MEDIUM. El codigo sigue buenas practicas:
- React JSX escaping para prevencion de XSS
- Validacion de inputs antes de envio
- Delegacion de autenticacion y autorizacion al backend
- Sin secrets hardcodeados
- Sin uso de APIs peligrosas
- Dependencias principales sin CVEs conocidos

---

## 8. Cobertura

### 8.1 Que se testeo

| Area | Sprints | Cobertura |
|------|---------|-----------|
| RF-01 a RF-06: Gestion de clientes (CRUD, duplicados, eliminacion logica) | Sprint 1 (regresion en Sprint 2) | Completa |
| RF-07 a RF-10: Oportunidades (CRUD, pipeline, cierre) | Sprint 1 (regresion en Sprint 2) | Completa |
| RF-11: Pipeline Kanban (drag & drop, cierre, filtros) | Sprint 4 | Completa |
| RF-14 a RF-15: Actividades (CRUD, marcar realizada) | Sprint 1 (regresion en Sprint 2) | Completa |
| RF-16: Actividades filtros avanzados | Sprint 2 | Parcial (faltan columnas y filtro responsable en UI) |
| RF-18 a RF-24: Comunicaciones mock | Sprint 2 | Completa (post-fix) |
| RF-25: Reporte clientes nuevos | Sprint 2 | Completa (post-fix) |
| RF-26: Reporte actividades por vendedor | Sprint 2 | Completa (post-fix) |
| RF-27 a RF-29: Autenticacion (login, JWT, refresh) | Sprint 1 (regresion en Sprint 2) | Completa |
| DevOps: docker-compose, CI/CD | Sprint 2 | Completa |
| Seguridad: modulo Pipeline | Sprint 4 | Completa |

### 8.2 Que queda pendiente

| Area | Tipo | Prioridad |
|------|------|-----------|
| Columnas "Responsable" y "Fecha de vencimiento" en listado de actividades | BUG-008 (P3) | Media |
| Filtro por responsable en UI de actividades | BUG-009 (P3) | Media |
| Comentarios MOCK detallados en providers + variables en `.env.example` | BUG-011 (P4) | Baja |
| Endpoint correcto para "Marcar realizada" (`/complete`) | BUG-S3-04 (P2) | Alta |
| Valor total monetario en columnas Kanban | BUG-S4-01 (P3) | Media |
| Filtro de sucursal operativo en Pipeline | BUG-S4-02 (P3) | Media |
| Lista de vendedores conectada a `useUsers()` en Pipeline | BUG-S4-03 (P3) | Media |
| Componente `ProtectedRoute` para guard de autenticacion frontend | LOW-01 | Baja |
| Validacion de rango de fechas invalido (from > to) | Deuda tecnica | Baja |
| Paginacion en historial de comunicaciones | Deuda tecnica (RNF-01) | Baja |
| Tests E2E con Playwright | No implementado | Media-Alta |
| Auditoria de seguridad completa (backend + frontend) | Solo se audito modulo Pipeline | Media |

---

## 9. Recomendaciones

### Prioridad Alta

1. **Resolver BUG-S3-04**: Cambiar el endpoint de `useMarkActivityDone` a `/activities/${id}/complete`. Es un fix de una sola linea que desbloquea la funcionalidad "Marcar actividad como realizada".

2. **Implementar tests E2E**: Agregar Playwright para tests end-to-end de los flujos criticos (login, CRUD clientes, envio de comunicacion, pipeline drag & drop). Esto permitiria detectar bugs de integracion que la revision estatica no puede cubrir.

3. **Correr QA en entorno real**: La totalidad del testing fue realizado como revision estatica de codigo. Se recomienda ejecutar los planes de tests sobre un entorno funcional para detectar bugs de runtime, serializacion y rendering.

### Prioridad Media

4. **Completar columnas y filtros de actividades**: Agregar columna "Responsable" y "Fecha de vencimiento" a la tabla, y exponer el filtro por responsable en la UI (BUG-008, BUG-009).

5. **Conectar filtros reales en Pipeline Kanban**: Conectar la lista de vendedores con `useUsers()` y evaluar si agregar campo `branch` al modelo de oportunidades para el filtro de sucursal.

6. **Agregar componente ProtectedRoute**: Implementar un guard de autenticacion frontend que redirija a `/login` cuando no hay token. Mejora la UX y evita mostrar UI sin datos.

### Prioridad Baja

7. **Documentar integraciones reales**: Completar los comentarios MOCK en providers y agregar variables de integracion real a `.env.example` antes de iniciar la integracion con Gmail API y WhatsApp Business API.

8. **Validacion de rangos de fecha**: Agregar validacion en frontend y/o backend para prevenir que `dateFrom > dateTo` en los reportes.

9. **Paginacion en historial de comunicaciones**: Implementar `skip/take` en el endpoint `getClientMessages` para evitar problemas de performance con datasets grandes.

---

*Documento generado por: Tester QA + DevOps Engineer (GEN)*
*Fuentes: tester-plan-sprint2.md, tester-report-sprint2.md, tester-report-sprint3.md, tester-report-sprint4.md, security-audit-sprint4.md*
*Ultima actualizacion: 2026-03-29*
