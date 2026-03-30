# Plan de Proyecto: CRM Ciudad Moto

**Documento**: Plan de Proyecto
**Fecha de creacion**: 2026-03-29
**Ultima actualizacion**: 2026-03-30
**Preparado por**: Project Manager -- Equipo GEN
**Estado**: Proyecto completado (MVP)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Alcance](#2-alcance)
3. [Stakeholders](#3-stakeholders)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [MVPs y Sprints](#5-mvps-y-sprints)
6. [Cronograma](#6-cronograma)
7. [Estimaciones](#7-estimaciones)
8. [Resource Planning](#8-resource-planning)
9. [Riesgos y Mitigaciones](#9-riesgos-y-mitigaciones)
10. [Assumptions](#10-assumptions)
11. [Sprint Reviews](#11-sprint-reviews)
12. [Lecciones Aprendidas](#12-lecciones-aprendidas)
13. [Estado Final](#13-estado-final)

---

## 1. Resumen Ejecutivo

El CRM Ciudad Moto es un sistema web de gestion comercial desarrollado para Ciudad Moto, una cadena dedicada a la venta de motocicletas. El objetivo del proyecto es centralizar el ciclo comercial completo: desde el primer contacto con un cliente potencial hasta el cierre de una venta, integrando comunicaciones por Gmail y WhatsApp.

El sistema permite a vendedores y duenos registrar clientes, hacer seguimiento de oportunidades de venta a traves de un pipeline Kanban, registrar actividades comerciales (llamadas, reuniones, tareas) y gestionar comunicaciones con los clientes, todo desde una unica plataforma.

El proyecto se ejecuto en 4 sprints de 2 semanas cada uno, siguiendo metodologia Scrum con el equipo multi-agente GEN. El MVP entregado cubre los 6 modulos funcionales definidos: Autenticacion, Gestion de Clientes, Pipeline de Ventas, Actividades, Comunicaciones (modo simulacion) y Reportes.

**Stack tecnologico**: React 18 + TypeScript + Vite (frontend), Fastify 4 + TypeScript + Prisma 5 (backend), PostgreSQL 16 (base de datos). Desplegado en Vercel (frontend) y Render (backend + base de datos).

---

## 2. Alcance

### 2.1 Incluido en el MVP

| Modulo | ID | Descripcion |
|--------|----|-------------|
| Autenticacion | M-06 | Login/logout con JWT, gestion de usuarios (crear, editar, desactivar) |
| Gestion de Clientes | M-01 | Alta, edicion, busqueda, perfil del cliente, deteccion de duplicados por DNI/telefono, eliminacion logica |
| Pipeline de Ventas | M-02 | Oportunidades con 4 etapas (Consulta, Prueba de manejo, Presupuesto, Cierre), vista Kanban con drag & drop, historial de cambios de etapa, cierre con resultado Ganado/Perdido |
| Actividades | M-03 | Registro de llamadas, reuniones y tareas vinculadas a clientes y oportunidades, filtros avanzados, marcado de actividades vencidas |
| Comunicaciones | M-04 | Historial unificado de emails y mensajes WhatsApp, envio y recepcion simulados (mock production-ready), bandeja de entrada general para mensajes no vinculados |
| Reportes | M-05 | Reporte de clientes nuevos por periodo, reporte de actividades por vendedor desglosado por tipo |
| Infraestructura | DevOps | Docker + docker-compose para desarrollo local, GitHub Actions CI (lint + typecheck + tests), deploy en Vercel + Render |

### 2.2 Excluido del MVP

| Item | Razon |
|------|-------|
| Gestion de stock / inventario | Pipeline independiente del stock; futura fase |
| Diferenciacion de roles y permisos | Todos los usuarios tienen mismo acceso en MVP |
| Aplicacion movil (iOS / Android) | Solo version web de escritorio |
| Diseno responsivo / mobile-first | No requerido en MVP |
| Cotizador / presupuestador de motos | "Presupuesto" es un estado del pipeline, no un modulo de calculo |
| Integracion con sistemas contables o ERP | No contemplado |
| Integracion con redes sociales (Instagram, Facebook) | Solo Gmail y WhatsApp |
| Automatizaciones y campanas de marketing | Envios masivos no incluidos |
| Gestion de clientes juridicos (empresas) | Solo personas fisicas |
| Asignacion / reasignacion de clientes entre vendedores | Sin propiedad de cliente por vendedor |
| Facturacion o gestion de pagos | No contemplado |
| Exportacion de reportes a Excel / PDF | Reportes en pantalla; exportacion es mejora futura |
| Integracion real con Gmail API | Pendiente configuracion OAuth con el cliente |
| Integracion real con WhatsApp Business API | Pendiente aprobacion de Meta y numero dedicado |

---

## 3. Stakeholders

### 3.1 Usuarios del Sistema

| Rol | Descripcion | Cantidad estimada |
|-----|-------------|-------------------|
| Vendedor | Opera el CRM en el dia a dia: registra clientes, gestiona oportunidades, registra actividades, se comunica con clientes | Equipo pequeno (< 10) |
| Dueno | Utiliza el sistema con las mismas capacidades que el vendedor. Accede a reportes de gestion | 1-2 personas |

Ambos roles tienen acceso identico a todas las funcionalidades. No existe diferenciacion de permisos en el MVP.

### 3.2 Equipo de Desarrollo

| Rol | Responsabilidad |
|-----|----------------|
| Project Manager / Scrum Master | Planificacion, seguimiento, gestion de riesgos, comunicacion con stakeholders |
| Analista Funcional | Relevamiento de requerimientos, especificacion funcional, user stories con criterios Gherkin |
| Arquitecto de Software | Arquitectura de alto nivel, ADRs, diseno de base de datos |
| Lider Tecnico | Definicion del stack, estandares de codigo, code review, ADRs tecnicos |
| Dev Backend | Implementacion de API REST, logica de negocio, integraciones |
| Dev Frontend | Implementacion de UI, componentes React, integracion con API |
| Tester QA | Plan de tests, revision estatica de codigo, verificacion de bugs, reportes de calidad |
| DevOps Engineer | Docker, CI/CD, configuracion de despliegue |
| Especialista en Seguridad | Auditoria de seguridad por sprint, verificacion OWASP |
| Disenador UI/UX | Wireframes, patrones de interaccion |

---

## 4. Historias de Usuario

### 4.1 Sprint 1 -- Core del CRM (44 SP comprometidos)

| ID | Titulo | Epic | SP |
|----|--------|------|----|
| US-001 | Setup del proyecto: scaffolding frontend + backend | M-06 Auth | 3 |
| US-002 | Schema de base de datos + migraciones Prisma | M-06 Auth | 3 |
| US-003 | Login con email y contrasena (JWT + cookie HttpOnly) | M-06 Auth | 3 |
| US-004 | Pantalla de login y proteccion de rutas en frontend | M-06 Auth | 2 |
| US-005 | Gestion de usuarios (crear, editar, desactivar) | M-06 Auth | 2 |
| US-006 | API: CRUD completo de clientes con deteccion de duplicados | M-01 Clientes | 5 |
| US-007 | UI: Formulario de alta y edicion de cliente | M-01 Clientes | 5 |
| US-008 | UI: Listado de clientes con busqueda | M-01 Clientes | 3 |
| US-009 | UI: Perfil del cliente -- seccion datos personales | M-01 Clientes | 3 |
| US-010 | API: Oportunidades -- CRUD + movimiento de etapas + historial | M-02 Pipeline | 5 |
| US-011 | UI: Vista Kanban del pipeline | M-02 Pipeline | 5 |
| US-012 | API: CRUD de actividades | M-03 Actividades | 3 |
| US-013 | UI: Crear actividad desde perfil del cliente | M-03 Actividades | 2 |

### 4.2 Sprint 2 -- Experiencia Completa (56 SP backlog, 40 SP capacidad)

| ID | Titulo | Epic | SP |
|----|--------|------|----|
| US-014 | API: listado de actividades con filtros avanzados + isOverdue | M-03 Actividades | 3 |
| US-015 | API: endpoint GET /activities/:id y GET /opportunities/:id | M-03 Actividades | 1 |
| US-016 | API: agregar lastActivityAt a oportunidades | M-03 Actividades | 1 |
| US-017 | UI: Listado global de actividades con filtros y vencidas destacadas | M-03 Actividades | 4 |
| US-018 | UI: KanbanBoard conectado con drag and drop | M-02 Pipeline | 3 |
| US-019 | API: modulo Comunicaciones -- schema, servicio y endpoints | M-04 Comunicaciones | 3 |
| US-020 | API: mock de envio de email via Gmail | M-04 Comunicaciones | 3 |
| US-021 | API: mock de envio/recepcion de WhatsApp | M-04 Comunicaciones | 3 |
| US-022 | API: historial de comunicaciones por cliente | M-04 Comunicaciones | 2 |
| US-023 | UI: panel de comunicaciones en perfil del cliente | M-04 Comunicaciones | 4 |
| US-024 | UI: formulario de envio de email mock | M-04 Comunicaciones | 3 |
| US-025 | UI: chat/hilo de WhatsApp mock | M-04 Comunicaciones | 3 |
| US-026 | API: reporte clientes nuevos por periodo | M-05 Reportes | 2 |
| US-027 | API: reporte actividades por vendedor | M-05 Reportes | 2 |
| US-028 | UI: pantalla de reportes con graficos | M-05 Reportes | 4 |
| US-029 | Dockerfile backend + frontend + docker-compose | DevOps | 3 |
| US-030 | GitHub Actions CI: lint + typecheck + tests | DevOps | 2 |
| US-031 | Deuda tecnica P3/P4 backend | Deuda Tecnica | 3 |
| US-032 | Deuda tecnica P3/P4 frontend | Deuda Tecnica | 2 |

### 4.3 Sprint 3 -- Bugfixes y Estabilizacion

Sprint enfocado en correccion de bugs identificados por QA en Sprint 2, incluyendo:

| Task | Descripcion | Severidad |
|------|-------------|-----------|
| TASK-S3-01 | Fix campo sentAt en mensajes (mapeo sentReceivedAt -> sentAt) | P2 |
| TASK-S3-02 | Fix filtros de fecha en actividades (formato ISO) | P2 |
| TASK-S3-03 | Fix linkMessage retornando campo crudo de Prisma | P3 |
| TASK-S3-04 | Validacion rango de fechas en reportes (from <= to) | P3 |
| BUG-S3-01/04 | Fix useMarkActivityDone: endpoint incorrecto (/activities/:id -> /activities/:id/complete) | P2 |

### 4.4 Sprint 4 -- Pipeline Kanban Completo + Auth Frontend + Deploy

| Componente | Descripcion |
|------------|-------------|
| Pipeline Kanban (RF-11) | 4 columnas con drag & drop, dialogo de cierre Ganado/Perdido, filtros por vendedor |
| Modulo Auth Frontend | AuthContext + LoginPage + ProtectedRoute, token en memoria, silent refresh, interceptor axios |
| Deploy produccion | Frontend en Vercel, backend + PostgreSQL en Render, seed idempotente |

---

## 5. MVPs y Sprints

### Sprint 1 -- Flujo Comercial Basico

**Sprint Goal**: Permitir que un vendedor registre, busque y edite clientes, gestione oportunidades en el pipeline Kanban y registre actividades, accediendo al sistema con login seguro.

**Entregables**:
- M-06 Auth: login JWT con access token (15 min) + refresh token (7 dias) en cookie HttpOnly, CRUD de usuarios
- M-01 Clientes: CRUD completo con deteccion de duplicados atomica (transaccion Prisma), busqueda por nombre/apellido/DNI/telefono, perfil del cliente
- M-02 Pipeline: CRUD de oportunidades, 4 etapas del pipeline, historial de cambios de etapa, cierre con resultado
- M-03 Actividades: CRUD basico de llamadas, reuniones y tareas

**QA**: 24 bugs identificados (4 P1, 8 P2, 7 P3, 5 P4). Todos los P1 y P2 fueron corregidos antes del Sprint Review.

### Sprint 2 -- Experiencia End-to-End

**Sprint Goal**: Completar la experiencia de usuario end-to-end con actividades filtradas, comunicaciones simuladas (mock production-ready) y reportes, dejando el entorno listo para CI/CD con Docker.

**Entregables**:
- M-03 Actividades completado: listado global con filtros (estado, tipo, responsable, rango de fechas), actividades vencidas destacadas
- M-04 Comunicaciones mock: envio simulado de email y WhatsApp, historial unificado por cliente, bandeja de entrada general, indicador visual de modo simulacion
- M-05 Reportes: clientes nuevos por periodo, actividades por vendedor desglosado por tipo
- DevOps: Dockerfile multi-stage para backend y frontend, docker-compose con PostgreSQL + Redis + backend + frontend (nginx), GitHub Actions CI con lint + typecheck + tests en paralelo
- Deuda tecnica Sprint 1 (P3/P4) parcialmente resuelta

**QA**: 12 bugs identificados. 8 corregidos y re-verificados antes del Sprint Review. Veredicto GO.

### Sprint 3 -- Estabilizacion y Bugfixes

**Sprint Goal**: Corregir bugs pendientes del Sprint 2, estabilizar la integracion frontend-backend, preparar para el deploy.

**Entregables**:
- Fix de mapeo sentReceivedAt -> sentAt en comunicaciones
- Fix de filtros de fecha (formato ISO datetime)
- Fix de useMarkActivityDone (endpoint correcto /activities/:id/complete)
- Validacion de rango de fechas en reportes
- Re-verificacion completa por QA

**QA**: 3 bugs originales + 1 nuevo (BUG-S3-04). Todos resueltos en la re-verificacion final.

### Sprint 4 -- Pipeline Kanban + Auth + Deploy

**Sprint Goal**: Implementar la vista Kanban completa con drag & drop, completar el modulo de autenticacion frontend, y realizar el primer deploy a produccion.

**Entregables**:
- Pipeline Kanban completo: 4 columnas, drag & drop con @dnd-kit, dialogo de cierre con resultado Ganado/Perdido, filtros por vendedor
- Modulo de autenticacion frontend: AuthContext con token en memoria (useRef), LoginPage, ProtectedRoute como layout route, interceptor de axios con cola de requests pendientes durante refresh
- Deploy: frontend en Vercel con vercel.json (rewrites SPA), backend en Render con render.yaml, PostgreSQL en Render (plan free), seed idempotente en JS puro

**QA**: 0 P1, 0 P2, 3 P3 (deuda tecnica del modelo). Veredicto GO.
**Seguridad**: Auditoria completa del modulo Pipeline. 0 vulnerabilidades CRITICAL/HIGH/MEDIUM. Veredicto GO.
**Code Review**: Aprobado por Lider Tecnico con observaciones menores.

---

## 6. Cronograma

| Fase | Inicio | Fin | Duracion | Estado |
|------|--------|-----|----------|--------|
| Inception (requerimientos, stack, arquitectura, wireframes) | 2026-03-29 | 2026-03-29 | 1 dia | Completado |
| Sprint 1 -- Core del CRM | 2026-03-30 | 2026-04-10 | 2 semanas | Completado |
| Sprint Review 1 + Retro | 2026-04-10 | 2026-04-10 | 1 dia | Completado |
| Sprint 2 -- Experiencia Completa | 2026-04-11 | 2026-04-24 | 2 semanas | Completado |
| Sprint Review 2 + Retro | 2026-04-24 | 2026-04-24 | 1 dia | Completado |
| Sprint 3 -- Estabilizacion | 2026-04-25 | 2026-05-08 | 2 semanas | Completado |
| Sprint Review 3 + Retro | 2026-05-08 | 2026-05-08 | 1 dia | Completado |
| Sprint 4 -- Kanban + Auth + Deploy | 2026-05-09 | 2026-05-22 | 2 semanas | Completado |
| Sprint Review 4 + Demo Final | 2026-05-22 | 2026-05-22 | 1 dia | Completado |

**Duracion total del proyecto**: 8 semanas (4 sprints de 2 semanas)

### Hitos Clave

| Hito | Fecha | Descripcion |
|------|-------|-------------|
| Requerimientos aprobados | 2026-03-29 | Especificacion funcional v1.0 con 29 RFs, 8 RNFs |
| Stack aprobado | 2026-03-29 | 5 ADRs documentados (Fastify, Prisma, JWT, Gmail API, WhatsApp API) |
| Arquitectura aprobada | 2026-03-29 | Monolito modular, 8 tablas PostgreSQL, flujos de integracion |
| Wireframes aprobados | 2026-03-29 | Layout, lista de clientes, perfil, pipeline Kanban |
| Sprint 1 completado | 2026-04-10 | Flujo comercial basico funcional |
| Sprint 2 completado | 2026-04-24 | Todos los modulos implementados (comunicaciones en mock) |
| Sprint 3 completado | 2026-05-08 | Bugs criticos resueltos, sistema estable |
| Primer deploy a produccion | 2026-05-22 | Frontend en Vercel, backend en Render |
| Entrega MVP | 2026-05-22 | Demo end-to-end aprobada |

---

## 7. Estimaciones

### 7.1 Story Points por Sprint

| Sprint | SP Comprometidos | SP Entregados | Velocidad Real | Notas |
|--------|-----------------|---------------|-----------------|-------|
| Sprint 1 | 44 | 44 | 44 | Todos los SP entregados; 24 bugs encontrados y los criticos corregidos |
| Sprint 2 | 56 (backlog) / 40 (capacidad) | ~45 | 45 | Se aplicaron reglas de corte; comunicaciones mock simplificadas |
| Sprint 3 | ~15 (bugfix sprint) | 15 | 15 | Sprint de estabilizacion, menor velocidad esperada |
| Sprint 4 | ~25 | 25 | 25 | Kanban + Auth + Deploy; menor scope por foco en calidad |

### 7.2 Velocidad Promedio

- **Velocidad promedio por sprint**: ~32 SP
- **Capacidad estimada inicial**: 40 SP por sprint (equipo de 4 agentes, sprint de 2 semanas)
- **Velocidad real ajustada**: Los sprints de estabilizacion y deploy naturalmente tienen menor throughput de features nuevas

### 7.3 Distribucion por Modulo

| Modulo | SP Totales (estimados) |
|--------|----------------------|
| M-06 Autenticacion | 13 SP (Sprint 1) + Auth Frontend (Sprint 4) |
| M-01 Gestion de Clientes | 16 SP |
| M-02 Pipeline de Ventas | 10 SP + 3 SP (Kanban conectado S2) + Kanban completo S4 |
| M-03 Actividades | 5 SP (parcial S1) + 9 SP (completar S2) |
| M-04 Comunicaciones | 21 SP (mock) |
| M-05 Reportes | 8 SP |
| DevOps / Infra | 5 SP (Docker + CI) + deploy S4 |
| Deuda Tecnica | 5 SP (S2) + bugfixes (S3) |

---

## 8. Resource Planning

### 8.1 Roles y Dedicacion por Sprint

| Rol | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|-----|----------|----------|----------|----------|
| PM / Scrum Master | 100% | 100% | 100% | 100% |
| Analista Funcional | 100% (Inception) | 10% (soporte) | 10% | 10% |
| Arquitecto de Software | 100% (Inception) | 10% | 10% | 10% |
| Lider Tecnico | 30% (ADRs, stack) | 30% (code review) | 30% | 40% (code review + practicas) |
| Dev Backend | 100% | 100% | 80% | 60% |
| Dev Frontend | 100% | 100% | 80% | 100% |
| Tester QA | 80% | 80% | 100% | 80% |
| DevOps Engineer | 0% | 100% | 20% | 60% (deploy) |
| Especialista Seguridad | 0% | 0% | 0% | 40% (auditoria) |
| Disenador UI/UX | 100% (Inception) | 10% | 0% | 0% |

### 8.2 Distribucion de Carga Sprint 2 (Sprint mas demandante)

| Agente | User Stories | SP |
|--------|-------------|-----|
| Backend Developer | US-014, US-015, US-016, US-019-022, US-026, US-027, US-031 | 21 SP |
| Frontend Developer | US-017, US-018, US-023-025, US-028, US-032 | 23 SP |
| DevOps | US-029, US-030 | 5 SP |
| Tester QA | Testing transversal (no SP separado, parte del DoD) | -- |

---

## 9. Riesgos y Mitigaciones

### 9.1 Riesgos Identificados Durante el Proyecto

| ID | Riesgo | Prob. | Impacto | Mitigacion Aplicada | Resultado |
|----|--------|-------|---------|---------------------|-----------|
| R-01 | Dependencias externas de WhatsApp Business API (aprobacion Meta, numero dedicado) bloquean Sprint 2 | Alta | Alto | Se implemento modulo completo en modo mock production-ready. La arquitectura es identica a produccion; conectar las APIs reales requiere 2-3 dias de trabajo. | Mitigado. Mock funcional entregado. |
| R-02 | Dependencias externas de Gmail API (OAuth, Google Cloud Pub/Sub) bloquean integracion | Alta | Alto | Misma estrategia mock que WhatsApp. Se necesita sesion de configuracion con el cliente. | Mitigado. Mock funcional entregado. |
| R-03 | Frontend no integrado al repositorio al cierre de Sprint 1 | Media | Critico | Detectado por QA como BUG-001 (P1). Frontend desarrollado y mergeado antes del Sprint Review. | Materializado y resuelto. |
| R-04 | Race condition en deteccion de duplicados (DNI/telefono) | Media | Alto | Detectado por QA como BUG-003 (P1). Resuelto con transaccion Prisma atomica (findDuplicate + create en misma transaccion). | Materializado y resuelto. |
| R-05 | Endpoint /register sin autenticacion expuesto publicamente | Alta | Critico | Detectado por QA como BUG-002 (P1). Protegido con fastify.authenticate antes del Sprint Review. | Materializado y resuelto. |
| R-06 | Desalineacion de tipos entre frontend y backend (enums, campos, endpoints) | Alta | Medio | Recurrente durante todo el proyecto (BUG-S3-01/04, BUG-005 Sprint 2). Mitigado con code review obligatorio y verificacion de endpoints en rutas del backend antes de escribir hooks. | Parcialmente mitigado. Recomiendacion: tests de contrato. |
| R-07 | Capacidad real del equipo menor a 40 SP por sprint | Media | Medio | Reglas de corte definidas en Sprint 2 Planning. Deuda tecnica como primer candidato a postergar. | El Sprint 2 backlog (56 SP) se ajusto correctamente. |
| R-08 | Complejidad de drag & drop en Kanban subestimada | Media | Medio | Se uso @dnd-kit (libreria madura). 5 SP fue adecuado. | No se materializo. |
| R-09 | Docker compose no funciona en entorno de desarrollo | Baja | Medio | Redis faltante detectado y corregido (DevOps fix report). Inconsistencia main vs start en package.json corregida. | Materializado (menor) y resuelto. |
| R-10 | Cookies SameSite=Strict no funcionan cross-origin | Media | Alto | Documentado en lecciones aprendidas. Para produccion con dominios diferentes, usar SameSite=None + Secure o proxy reverso. | Documentado como limitacion conocida. |

### 9.2 Riesgos Activos (Post-MVP)

| Riesgo | Prob. | Impacto | Accion Requerida |
|--------|-------|---------|------------------|
| Ciudad Moto no avanza en gestion de WhatsApp Business API con Meta | Alta | Alto para integracion real | Escalar al stakeholder. Sin aprobacion de Meta, las comunicaciones quedan en modo simulacion indefinidamente. |
| Contrasena de seed conocida (Admin1234!) puede llegar a produccion | Media | Critico | Cambiar contrasena inmediatamente post-deploy. Hacer que el seed lea password de variable de entorno. |
| ProtectedRoute no implementado como guard de ruta global | Baja | Bajo (backend rechaza 401) | Implementar en proximo sprint. UX degradada pero sin riesgo de seguridad real. |

---

## 10. Assumptions

### 10.1 Supuestos del Negocio

1. Ciudad Moto dispone (o dispondra) de una cuenta de WhatsApp Business con acceso a la API oficial de Meta. Sin este requisito, la integracion de WhatsApp no puede activarse.
2. El negocio opera con una unica cuenta de Gmail para comunicaciones comerciales, o esta dispuesto a definir cual/cuales cuentas vincular.
3. No se requiere migracion de datos historicos desde ningun sistema anterior. El CRM arranca desde cero.
4. El equipo de usuarios concurrentes es pequeno (< 10 personas).
5. El volumen de datos estimado es acotado (~5.000 clientes).
6. No se requiere soporte mobile en el MVP. Los usuarios acceden desde escritorio (minimo 1366x768).
7. Los navegadores soportados son Google Chrome y Microsoft Edge (versiones actuales).

### 10.2 Supuestos Tecnicos

1. La arquitectura monolitica modular es suficiente para la escala del sistema. Si la escala crece significativamente, los modulos pueden extraerse a servicios independientes gracias a las interfaces claras entre ellos (ver ADR-001).
2. El procesamiento asincrono de mensajes entrantes se resuelve con BullMQ + Redis dentro del mismo servidor. No se requiere un sistema de mensajeria distribuida.
3. La agregacion en memoria para reportes es aceptable en el MVP. Si el volumen crece, se migrara a consultas SQL con GROUP BY.
4. Los tokens OAuth de Gmail y el API token de WhatsApp se almacenan cifrados en la base de datos (AES-256-GCM). La clave maestra esta en variable de entorno.
5. El plan gratuito de Render es suficiente para el periodo de validacion/demo. Para produccion sostenida, se requerira un plan pago.

### 10.3 Preguntas Abiertas (pendientes de confirmacion)

| ID | Pregunta | Impacto |
|----|----------|---------|
| Q-01 | Cuantas cuentas de Gmail se vincularan (una compartida o una por vendedor) | Diseno de integracion Gmail |
| Q-02 | El numero de WhatsApp Business es uno solo o uno por vendedor | Distribucion de mensajes entrantes |
| Q-03 | Que sucede con mensajes recibidos fuera del horario comercial | Posible modulo de notificaciones |
| Q-04 | Se requieren notificaciones internas (vencimiento de actividades) | Feature no contemplada en MVP |
| Q-05 | Existe lista predefinida de modelos de motos o es texto libre | Calidad de datos y reportes futuros |

---

## 11. Sprint Reviews

### Sprint Review 1

**Fecha**: 2026-04-10
**Estado al inicio de la review**: 24 bugs identificados por QA (4 P1, 8 P2, 7 P3, 5 P4). QA emitio veredicto NO-GO inicial.

**Acciones correctivas pre-review**:
- BUG-001 (P1): Frontend integrado al repositorio
- BUG-002 (P1): Endpoint /register protegido con autenticacion
- BUG-003 (P1): Race condition resuelta con transaccion atomica
- BUG-004 (P1): Graceful shutdown corregido
- BUG-005 a BUG-012 (P2): Todos corregidos

**Resultado**: Sprint aprobado tras correcciones. Deuda tecnica P3/P4 (BUG-013 a BUG-025) transferida al Sprint 2.

**Demo**: Login -> Alta de cliente con deteccion de duplicados -> Crear oportunidad -> Mover en Kanban -> Registrar actividad -> Logout.

### Sprint Review 2

**Fecha**: 2026-04-24
**Estado al inicio de la review**: 12 bugs identificados por QA (3 P1, 3 P2, 3 P3, 3 P4). QA emitio veredicto NO-GO inicial.

**Acciones correctivas pre-review**:
- 8 bugs corregidos y re-verificados por QA
- BUG-006 (P2 condicional) documentado como pendiente de verificacion en entorno real

**Resultado**: Sprint aprobado. Veredicto GO con observaciones. Bugs pendientes (BUG-006, BUG-008, BUG-009) al backlog Sprint 3.

**Demo**: Login -> Clientes -> Pipeline Kanban -> Actividades con filtros -> Comunicaciones (mock con indicador visual) -> Reportes -> Logout.

### Sprint Review 3

**Fecha**: 2026-05-08
**Estado**: Sprint de estabilizacion. 3 bugs originales + 1 nuevo (BUG-S3-04) resueltos.

**Hallazgo critico**: El fix de BUG-S3-01 fue incompleto en primera instancia. El metodo HTTP se cambio de PATCH a PUT, pero el endpoint destino seguia siendo incorrecto (/activities/:id en vez de /activities/:id/complete). QA detecto esto en la re-verificacion y se corrigio.

**Resultado**: Sprint aprobado tras segunda ronda de correcciones. 0 bugs P1/P2 abiertos.

### Sprint Review 4

**Fecha**: 2026-05-22
**Estado**: Sprint final del MVP. Pipeline Kanban completo, modulo Auth frontend completo, deploy a produccion realizado.

**Verificaciones realizadas**:
- QA: 0 P1, 0 P2, 3 P3 (deuda tecnica). Veredicto GO.
- Seguridad: 15 pruebas ejecutadas, 0 vulnerabilidades CRITICAL/HIGH/MEDIUM, 1 LOW (ProtectedRoute ausente como guard global, compensado por backend), 1 INFO (esbuild dev-only). Veredicto GO.
- Code Review: Aprobado por Lider Tecnico con 5 observaciones no-bloqueantes.

**Resultado**: Sprint aprobado. MVP entregado y desplegado.

---

## 12. Lecciones Aprendidas

Las lecciones completas estan documentadas en `projects/crm/docs/lecciones-aprendidas.md`. A continuacion, un resumen de las mas relevantes:

### 12.1 Deploy

| Leccion | Impacto | Accion |
|---------|---------|--------|
| Todo proyecto SPA necesita `vercel.json` con rewrites desde el dia 1 | Vercel devuelve 404 en todas las rutas excepto `/` | Incluir en checklist de scaffolding |
| Variables de entorno en Vercel: solo el valor, nunca el nombre de la variable | URL relativa invalida que rompe la app | Verificar con `vercel env ls` |
| `render.yaml` debe estar en la raiz del repositorio, no en subcarpetas | Render no encuentra la configuracion | Documentado en estructura del proyecto |
| Usar `prisma db push` si no hay migraciones generadas | `prisma migrate deploy` no hace nada sin archivos de migracion | Para produccion real, generar migraciones |
| Seed debe ser `.js` puro, no `.ts` | `tsx` es devDependency, no disponible en produccion | Scripts de infra siempre en JS puro |
| Seed debe ser idempotente | Re-deploys causan errores por duplicados | Verificar existencia antes de crear |

### 12.2 Autenticacion Cross-Origin

| Leccion | Impacto | Accion |
|---------|---------|--------|
| CORS_ORIGIN debe coincidir exactamente con el dominio del frontend | Requests fallan silenciosamente | Usar variable de entorno |
| Cookies SameSite=Strict no funcionan cross-origin | Refresh token nunca llega al backend | Usar SameSite=None + Secure o proxy reverso |
| /auth/refresh debe devolver datos del usuario ademas del token | Tras refresh, el frontend no sabe quien es el usuario | Siempre devolver `{ accessToken, user }` |
| Token en memoria, nunca en localStorage | Se pierde al cerrar tab (intencional, por seguridad) | Persistencia via refresh token en HttpOnly cookie |

### 12.3 Bugs Recurrentes

| Leccion | Impacto | Accion |
|---------|---------|--------|
| Hooks que usan metodo HTTP incorrecto (PATCH vs PUT) | Operaciones "funcionan" pero no hacen nada | Verificar metodo exacto en routes del backend |
| Hooks que llaman endpoints incorrectos | Frontend inventa rutas que no existen | Hooks deben mapear 1:1 con rutas del backend |
| Enums desalineados entre frontend y backend | Datos incompatibles | Derivar tipos del frontend del schema Prisma |
| Reportes sin filtros base correctos | Incluyen datos inactivos o incorrectos | Todo query de reportes debe inicializar `where` con filtros base |

### 12.4 Proceso

| Leccion | Impacto | Accion |
|---------|---------|--------|
| QA debe ejecutarse por tarea, no al final del sprint | Acumulacion de bugs costosos | Tester en paralelo con Dev, tarea por tarea |
| Code Review es gate obligatorio antes de cada commit | Sin review pasan bugs de integracion | Lider Tecnico revisa antes del merge |
| Auditoria de seguridad debe ser por sprint | Endpoints sin auth pasan desapercibidos | Entregable formal del Especialista en Seguridad |
| El modulo de auth del frontend no es opcional | Rutas abiertas en deploy publico | Implementar en Sprint 1, no como "despues" |

---

## 13. Estado Final

### 13.1 URLs de Deploy

| Componente | URL | Plataforma | Plan |
|------------|-----|------------|------|
| Frontend | https://frontend-two-mu-94.vercel.app | Vercel | Free |
| Backend API | ciudadmoto-api.onrender.com | Render | Free |
| Base de datos | ciudadmoto-db (internal) | Render PostgreSQL | Free |

### 13.2 Credenciales de Demo

| Campo | Valor |
|-------|-------|
| Email | admin@ciudadmoto.com |
| Contrasena | Admin1234! |

**ADVERTENCIA**: Cambiar la contrasena del usuario admin antes de entregar al cliente. El seed crea usuarios adicionales (juan@ciudadmoto.com, maria@ciudadmoto.com, carlos@ciudadmoto.com) con la misma contrasena.

### 13.3 Estado de Cada Modulo

| Modulo | Estado | Notas |
|--------|--------|-------|
| M-06 Autenticacion | Completo | Login, logout, gestion de usuarios, JWT + refresh token, ProtectedRoute |
| M-01 Gestion de Clientes | Completo | CRUD, duplicados atomicos, busqueda, perfil, eliminacion logica |
| M-02 Pipeline de Ventas | Completo | Kanban 4 columnas, drag & drop, cierre Ganado/Perdido, historial de etapas |
| M-03 Actividades | Completo | CRUD, filtros avanzados, actividades vencidas destacadas, marcar como realizada |
| M-04 Comunicaciones | Parcial (Mock) | Arquitectura completa, envio/recepcion simulados. Pendiente: conectar Gmail API y WhatsApp Business API cuando el cliente complete las gestiones con Google y Meta |
| M-05 Reportes | Completo | Clientes nuevos por periodo, actividades por vendedor por tipo |
| DevOps / Infra | Completo | Docker + docker-compose, GitHub Actions CI, deploy Vercel + Render |

### 13.4 Deuda Tecnica Conocida

| Item | Severidad | Modulo | Descripcion |
|------|-----------|--------|-------------|
| Valor monetario en columna Kanban | P3 | Pipeline | `totalValue = 0` hardcodeado; Opportunity no tiene campo de valor monetario |
| Filtro de sucursal no-operativo | P3 | Pipeline | No hay campo branch en el modelo de datos |
| Lista de vendedores vacia en filtro Kanban | P3 | Pipeline | Falta conectar con useUsers() |
| ProtectedRoute como guard global de rutas | LOW | Auth | La proteccion se delega al backend (401), pero UX degradada sin redirect a login |
| CloseOpportunityDialog deberia usar shadcn/ui Dialog | Media | Pipeline | Mejor accesibilidad (focus trap, Escape, WCAG 2.1) |
| Tests de contrato frontend-backend | Media | Transversal | Para evitar desalineacion de tipos/endpoints en futuros sprints |
| Contrasena de seed hardcodeada | P3 | Seguridad | Leer de variable de entorno o bloquear en produccion |

### 13.5 Proximos Pasos Recomendados

1. **Inmediato**: Cambiar contrasenas de demo antes de entregar acceso al cliente.
2. **Corto plazo**: Conectar Gmail API cuando el cliente complete la configuracion OAuth (estimado: medio dia de trabajo).
3. **Corto plazo**: Conectar WhatsApp Business API cuando Meta apruebe el acceso (estimado: 1-2 dias).
4. **Mediano plazo**: Resolver deuda tecnica P3 (valor monetario en Kanban, filtro de sucursal, lista de vendedores).
5. **Mediano plazo**: Implementar tests de contrato frontend-backend para prevenir bugs de integracion.
6. **Largo plazo**: Evaluar diferenciacion de roles y permisos si el negocio lo requiere.
7. **Largo plazo**: Evaluar soporte mobile si los vendedores necesitan acceso desde celular.

---

## Documentos Relacionados

| Documento | Ubicacion |
|-----------|-----------|
| Especificacion Funcional | `projects/crm/docs/functional-spec.md` |
| Arquitectura de Alto Nivel | `projects/crm/docs/architecture.md` |
| Estandares Tecnicos y ADRs | `projects/crm/docs/tech-standards.md` |
| Wireframes | `projects/crm/docs/wireframes.md` |
| Lecciones Aprendidas | `projects/crm/docs/lecciones-aprendidas.md` |
| Sprint 1 Planning | `.claude/pm-reports/pm-sprint-1-planning.md` |
| Sprint 2 Planning | `.claude/pm-reports/pm-sprint-2-planning.md` |
| Reportes QA Sprint 1-4 | `.claude/pm-reports/tester-*.md` |
| Auditoria de Seguridad Sprint 4 | `.claude/pm-reports/security-audit-sprint4.md` |
| Code Review Sprint 4 | `.claude/pm-reports/tech-lead-review-sprint4.md` |
| Configuracion de deploy | `render.yaml` (raiz), `projects/crm/frontend/vercel.json` |

---

*Documento preparado por: Project Manager -- Equipo GEN*
*Fecha de cierre del proyecto: 2026-05-22*
*Metodologia: Scrum (4 sprints de 2 semanas)*
*Estado: MVP entregado y desplegado*
