# Sprint Planning — Sprint 1
# CRM Ciudad Moto

**Fecha de planificacion**: 2026-03-29
**Sprint**: 1 de N
**Duracion estimada**: 2 semanas (2026-03-30 al 2026-04-10)
**Capacidad del equipo**: ~40 story points (equipo de 4 agentes, sprint de 2 semanas)

---

## Sprint Goal

> Permitir que un vendedor de Ciudad Moto registre, busque y edite clientes, gestione oportunidades en el pipeline Kanban y registre actividades, accediendo al sistema con login seguro — entregando el flujo comercial basico completo sin dependencias externas.

---

## Logica de priorizacion

El Sprint 1 se construye sobre tres principios:

1. **Valor primero**: la feature critica es el Alta de Cliente (RF-01). Todo el CRM gira alrededor de tener clientes registrados.
2. **Sin dependencias externas en Sprint 1**: Gmail API y WhatsApp Business API tienen dependencias fuera del control del equipo (aprobacion de Meta, configuracion de Google Cloud Pub/Sub, OAuth del cliente). Bloquear el sprint en estas integraciones es un riesgo inaceptable para una prueba/demo.
3. **Demo funcional al final del sprint**: al terminar el Sprint 1, debe poder hacerse una demo completa del flujo vendedor: login -> registrar cliente -> crear oportunidad -> mover en Kanban -> registrar actividad.

---

## Backlog del Sprint 1

### Capacidad comprometida: 39 story points

---

### EPIC: M-06 — Autenticacion (base de todo)

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-001 | Setup del proyecto: scaffolding frontend + backend | Backend Developer | 3 | — |
| US-002 | Schema de base de datos + migraciones Prisma | Backend Developer | 3 | US-001 |
| US-003 | Login con email y contrasena (JWT + cookie HttpOnly) | Backend Developer | 3 | US-002 |
| US-004 | Pantalla de login y proteccion de rutas en frontend | Frontend Developer | 2 | US-003 |
| US-005 | Gestion de usuarios (crear, editar, desactivar) | Backend Developer | 2 | US-003 |

**Subtotal M-06: 13 SP**

---

### EPIC: M-01 — Gestion de Clientes

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-006 | API: CRUD completo de clientes con deteccion de duplicados (RF-01, RF-02, RF-03, RF-06) | Backend Developer | 5 | US-002 |
| US-007 | UI: Formulario de alta y edicion de cliente (RF-01, RF-03) | Frontend Developer | 5 | US-006 |
| US-008 | UI: Listado de clientes con busqueda (RF-04) | Frontend Developer | 3 | US-006 |
| US-009 | UI: Perfil del cliente — seccion datos personales (RF-05, parcial) | Frontend Developer | 3 | US-007 |

**Subtotal M-01: 16 SP**

---

### EPIC: M-02 — Pipeline de Ventas

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-010 | API: Oportunidades — CRUD + movimiento de etapas + historial (RF-07, RF-08, RF-09, RF-10) | Backend Developer | 5 | US-002 |
| US-011 | UI: Vista Kanban del pipeline (RF-11) | Frontend Developer | 5 | US-010 |

**Subtotal M-02: 10 SP**

---

### EPIC: M-03 — Actividades (alcance reducido)

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-012 | API: CRUD de actividades (RF-13, RF-14, RF-15) | Backend Developer | 3 | US-002 |
| US-013 | UI: Crear actividad desde perfil del cliente | Frontend Developer | 2 | US-012 |

**Subtotal M-03 (parcial): 5 SP**

---

**TOTAL SPRINT 1: 44 SP comprometidos**

> Nota para el equipo: si la capacidad real del sprint es 39 SP, las US-012 y US-013 (actividades) son las primeras candidatas a pasar a Sprint 2. Se incluyen porque el flujo de demo mejora significativamente con actividades, pero se pueden cortar sin comprometer el Sprint Goal.

---

## Lo que queda para Sprint 2

### M-03 — Actividades (completar)

| ID | Titulo | Razon de postergacion |
|----|--------|-----------------------|
| US-A01 | UI: Listado de actividades con filtros (RF-16) | El listado completo con filtros es menos critico para la demo que poder crear actividades. |
| US-A02 | Actividades en perfil del cliente — seccion completa (RF-17) | Depende del listado; se hace en Sprint 2 junto con el perfil completo. |

---

### M-04 — Comunicaciones (Gmail + WhatsApp) — SPRINT 2 completo

| Razon de postergacion |
|-----------------------|
| Dependencia de Meta: aprobacion de acceso a WhatsApp Business API puede tomar semanas. Sin cuenta aprobada no se puede desarrollar ni testear. |
| Dependencia de Google Cloud: requiere configurar proyecto GCP, habilitar Pub/Sub, configurar credenciales OAuth. Requiere sesion de configuracion con el cliente. |
| Complejidad tecnica alta: BullMQ + Redis, webhooks con firma HMAC, flujo OAuth con refresh. Construir esto en el Sprint 1 junto con el core del CRM es demasiado riesgo para una demo. |
| Estrategia recomendada: iniciar en paralelo las gestiones de plataforma (numero WA, aprobacion Meta, proyecto GCP) mientras el equipo completa Sprint 1 y Sprint 2 de core. |

RFs postergados: RF-18, RF-19, RF-20, RF-21, RF-22, RF-23, RF-24

---

### M-05 — Reportes — SPRINT 2

| Razon de postergacion |
|-----------------------|
| Los reportes son utiles solo cuando hay datos cargados. Sin clientes ni actividades en el sistema, un reporte de clientes nuevos no demuestra valor. |
| No es parte del flujo critico de la demo. |

RFs postergados: RF-25, RF-26

---

### M-01 — Perfil del cliente completo — SPRINT 2

| ID | Titulo | Razon |
|----|--------|-------|
| US-A03 | Perfil del cliente: seccion historial de oportunidades | Requiere M-02 completado. Se integra en Sprint 2. |
| US-A04 | Perfil del cliente: seccion historial de comunicaciones | Requiere M-04 completado. Sprint 2 o 3. |

---

## Criterio de Done del Sprint 1

El Sprint 1 se considera exitoso cuando se cumplen TODOS los siguientes criterios:

### Funcional
- [ ] Un usuario puede iniciar sesion con email y contrasena y cerrar sesion.
- [ ] Un usuario puede registrar un cliente nuevo con los campos del RF-01.
- [ ] El sistema detecta duplicados por DNI y telefono antes de guardar (RF-02).
- [ ] Un usuario puede editar un cliente existente.
- [ ] Un usuario puede buscar clientes por nombre, apellido, DNI o telefono.
- [ ] Un usuario puede crear una oportunidad vinculada a un cliente.
- [ ] Un usuario puede mover una oportunidad entre etapas del Kanban.
- [ ] Al mover a "Cierre", el sistema solicita resultado Ganado/Perdido.
- [ ] La vista Kanban muestra las oportunidades agrupadas por etapa.
- [ ] Un usuario puede registrar una actividad (llamada, reunion, tarea) vinculada a un cliente.

### Tecnico
- [ ] Todas las rutas de la API requieren JWT valido.
- [ ] Las contrasenas se almacenan con bcrypt.
- [ ] El schema de Prisma esta migrado y funcionando en PostgreSQL.
- [ ] Los constraints UNIQUE de DNI y telefono estan aplicados a nivel de DB.
- [ ] La aplicacion levanta en entorno local con un solo comando (docker-compose o npm script documentado).

### Calidad
- [ ] No hay bugs criticos ni bloqueantes conocidos.
- [ ] Los flujos principales fueron probados por el Tester en entorno de staging o local.
- [ ] El codigo paso revision (code review de Tech Lead).

### Demo
- [ ] Se puede realizar una demo end-to-end del flujo: login -> alta de cliente -> crear oportunidad -> mover Kanban -> registrar actividad -> logout.

---

## Riesgos del Sprint 1

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Subestimacion del setup inicial (scaffolding, Docker, CI) | Media | Alto | Reservar US-001 como primera tarea; si tarda mas de 2 dias, escalar. |
| La UI del Kanban resulta mas compleja de lo estimado | Media | Medio | Usar libreria de drag-and-drop madura (dnd-kit). 5 SP es conservador. |
| Capacidad real del equipo menor a la estimada | Baja | Alto | US-012 y US-013 (Actividades) son el primer cut si hay falta de tiempo. |
| Preguntas abiertas Q-01/Q-02 bloquean decisiones de diseno | Baja | Bajo | No afectan Sprint 1. Deben resolverse antes del inicio de Sprint 2. |

---

## Dependencias externas a gestionar en paralelo (para Sprint 2)

Estas acciones deben iniciarse AHORA para no bloquear Sprint 2:

1. Ciudad Moto: conseguir numero de telefono dedicado para WhatsApp Business API (no puede estar activo en la app movil).
2. Ciudad Moto: iniciar proceso de aprobacion de acceso a WhatsApp Business API con Meta.
3. Ciudad Moto: preparar templates de mensajes de WhatsApp para aprobacion de Meta.
4. Ciudad Moto + equipo: sesion de configuracion para autorizar OAuth de Gmail.
5. Equipo DevOps: crear proyecto en Google Cloud Platform y configurar Pub/Sub.

---

*Documento preparado por el Project Manager — Equipo GEN*
*Fecha: 2026-03-29*
*Estado: Pendiente de aprobacion*
