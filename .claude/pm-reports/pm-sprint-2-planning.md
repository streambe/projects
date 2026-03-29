# Sprint Planning — Sprint 2
# CRM Ciudad Moto

**Fecha de planificacion**: 2026-03-29
**Sprint**: 2 de N
**Duracion estimada**: 2 semanas (2026-03-30 al 2026-04-10)
**Capacidad estimada**: ~40 story points
**Estado del Sprint 1**: APROBADO

---

## Contexto: Lo que entrego el Sprint 1

Sprint 1 cerro con los cuatro modulos core funcionando:

- M-06 Auth: login JWT, CRUD de usuarios (crear, editar, desactivar)
- M-01 Clientes: CRUD completo, deteccion de duplicados con transaccion atomica, busqueda, perfil
- M-02 Pipeline: Kanban con drag and drop, movimiento de etapas, historial, cierre con resultado
- M-03 Actividades: CRUD basico, marcar como realizada

Los 4 bugs P1 y los 8 bugs P2 identificados por QA fueron corregidos antes del Sprint Review. El frontend fue construido desde cero incluyendo el proyecto base, los hooks, el formulario de clientes y la tarjeta Kanban con 27 tests unitarios en verde.

Deuda tecnica conocida que entra al Sprint 2 como tareas de completar:
- BUG-013 a BUG-025 (P3/P4) no corregidos — la mayoria son mejoras defensivas, no bloqueantes
- `lastActivityAt` en respuesta de oportunidades aun no implementado en backend (bloqueante para RF-11 completo)
- `GET /api/v1/clients/check-duplicate` no existe como endpoint separado
- KanbanBoard (agrupacion de tarjetas por columna) no conectado en el frontend

---

## Sprint Goal

> Completar la experiencia de usuario end-to-end: agregar los modulos de Actividades con filtros, Comunicaciones simuladas (mock production-ready) y Reportes, y dejar el entorno listo para CI/CD con Docker — permitiendo la primera demo completa del CRM a Ciudad Moto.

---

## Logica de priorizacion del Sprint 2

1. **Cerrar el nucleo antes de extender**: M-03 Actividades tiene features comprometidas (RF-16) que el usuario ya espera. Se completa primero.
2. **Mock de comunicaciones antes que integracion real**: Las dependencias externas (Meta, Google OAuth) no estan resueltas. Implementar el modulo con datos simulados es la unica forma de demostrar valor sin bloquear el sprint. La arquitectura debe ser identica a la produccion para que conectar las APIs reales sea un cambio minimo.
3. **Reportes dependen de datos**: Con clientes, oportunidades y actividades cargados desde Sprint 1 (y seed de datos), los reportes ya tienen sentido.
4. **DevOps como habilitador**: Docker y CI no bloquean las features, pero son prerequisito para cualquier entrega a un entorno real. Se trabajan en paralelo.
5. **Deuda tecnica P3/P4 del Sprint 1**: Los bugs pendientes (BUG-013 a BUG-025) no son bloqueantes de negocio. Se asignan al Backend Developer y al Frontend Developer como parte de la carga del sprint, estimados en conjunto como una US de deuda tecnica.

---

## Backlog del Sprint 2

### Capacidad comprometida: 40 story points

---

### EPIC: M-03 — Actividades (completar RF-16)

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-014 | API: listado de actividades con filtros avanzados + campo `isOverdue` (RF-16) | Backend Developer | 3 | — (US-012 completado en S1) |
| US-015 | API: endpoint `GET /activities/:id` y `GET /opportunities/:id` (BUG-017, BUG-018) | Backend Developer | 1 | — |
| US-016 | API: agregar `lastActivityAt` a la respuesta de oportunidades (BUG-012) | Backend Developer | 1 | — |
| US-017 | UI: Pantalla de listado global de actividades con filtros y destacado de vencidas (RF-16) | Frontend Developer | 4 | US-014, US-015 |
| US-018 | UI: conectar KanbanBoard — agrupar KanbanCard por columna, drag and drop integrado | Frontend Developer | 3 | US-016 |

**Subtotal M-03 completar: 12 SP**

---

### EPIC: M-04 — Comunicaciones (RF-18 a RF-24) — Implementacion MOCK

Ver seccion "Approach Mock" mas abajo para el detalle de la estrategia.

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-019 | API: modulo Comunicaciones — schema Prisma, servicio y endpoints CRUD (RF-18, RF-19) | Backend Developer | 3 | — |
| US-020 | API: mock de envio de email via Gmail — endpoint que simula envio y registra en DB (RF-20) | Backend Developer | 3 | US-019 |
| US-021 | API: mock de envio/recepcion de WhatsApp — endpoint que simula envio y webhook simulado (RF-21, RF-22) | Backend Developer | 3 | US-019 |
| US-022 | API: historial de comunicaciones por cliente (RF-23, RF-24) | Backend Developer | 2 | US-019 |
| US-023 | UI: panel de comunicaciones en perfil del cliente — historial y formulario de nueva comunicacion (RF-23, RF-24) | Frontend Developer | 4 | US-022 |
| US-024 | UI: formulario de envio de email mock con indicador visual "modo simulado" (RF-20) | Frontend Developer | 3 | US-020, US-023 |
| US-025 | UI: chat/hilo de mensajes WhatsApp mock con indicador visual "modo simulado" (RF-21, RF-22) | Frontend Developer | 3 | US-021, US-023 |

**Subtotal M-04 mock: 21 SP**

---

### EPIC: M-05 — Reportes (RF-25, RF-26)

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-026 | API: endpoint reporte clientes nuevos por periodo con selector de fechas (RF-25) | Backend Developer | 2 | — |
| US-027 | API: endpoint reporte actividades por vendedor desglosado por tipo (RF-26) | Backend Developer | 2 | — |
| US-028 | UI: pantalla de reportes con graficos y selector de fechas (RF-25, RF-26) | Frontend Developer | 4 | US-026, US-027 |

**Subtotal M-05: 8 SP**

---

### EPIC: DevOps — Setup basico

| ID | Titulo | Agente | SP | Dependencias |
|----|--------|--------|----|--------------|
| US-029 | Dockerfile para backend y frontend + docker-compose para desarrollo local | DevOps | 3 | — |
| US-030 | GitHub Actions CI: lint + typecheck + tests en cada PR | DevOps | 2 | US-029 |

**Subtotal DevOps: 5 SP**

---

### Deuda tecnica Sprint 1 (BUG-013 a BUG-025, P3/P4)

| ID | Titulo | Agente | SP | Bugs cubiertos |
|----|--------|--------|----|----------------|
| US-031 | Correccion de deuda tecnica P3/P4 backend (filtros, validaciones, dead code) | Backend Developer | 3 | BUG-013, BUG-014, BUG-015, BUG-016, BUG-019, BUG-020, BUG-021, BUG-023, BUG-024, BUG-025 |
| US-032 | Correccion deuda tecnica P3/P4 frontend (check-duplicate endpoint, mensajes error restantes) | Frontend Developer | 2 | BUG-022 (mensajes restantes), endpoint check-duplicate |

**Subtotal deuda tecnica: 5 SP**

---

### NOTA DE CAPACIDAD

**Total comprometido: 56 SP**

La estimacion inicial es de 40 SP de capacidad. El backlog tiene 56 SP. Se aplica la siguiente regla de corte en orden de prioridad si el equipo detecta restriccion de capacidad durante el sprint:

1. Primer corte: US-031 y US-032 (deuda tecnica P3/P4) pasan al backlog — son mejoras no bloqueantes.
2. Segundo corte: US-028 (UI de reportes) se reduce a una pantalla basica sin graficos — tablas simples son suficientes para la demo.
3. Tercer corte: US-024 y US-025 (UI detallada del mock de comunicaciones) se simplifican — mostrar el historial sin el formulario de envio inline si no hay tiempo.

El DevOps (US-029, US-030) y el completar M-03 (US-014 a US-018) son no negociables para la demo.

---

## Criterio de Done del Sprint 2

El Sprint 2 se considera exitoso cuando se cumplen TODOS los siguientes criterios:

### Funcional
- [ ] Un vendedor puede ver el listado global de actividades filtrado por estado, tipo, responsable y rango de fechas.
- [ ] Las actividades con `dueAt` en el pasado y estado pendiente se destacan visualmente en el listado.
- [ ] El Kanban muestra las oportunidades agrupadas por columna con drag and drop funcionando y con la fecha de ultima actividad en cada tarjeta.
- [ ] Un vendedor puede ver el historial de comunicaciones de un cliente (emails y mensajes WA simulados).
- [ ] Un vendedor puede enviar un email simulado desde el perfil del cliente — el sistema registra el envio en la DB y muestra un indicador claro de que es una simulacion.
- [ ] Un vendedor puede ver un hilo de mensajes de WhatsApp simulados — el sistema muestra un indicador claro de que es una simulacion.
- [ ] Un administrador puede ver el reporte de clientes nuevos por periodo seleccionando un rango de fechas.
- [ ] Un administrador puede ver el reporte de actividades por vendedor desglosado por tipo.
- [ ] La aplicacion levanta completa con `docker-compose up` — un solo comando, sin pasos manuales adicionales.
- [ ] El CI en GitHub Actions corre lint, typecheck y tests automaticamente en cada PR y bloquea el merge si falla.

### Tecnico
- [ ] Los endpoints de comunicaciones siguen la misma estructura de respuesta que el resto de la API (paginacion, manejo de errores, autenticacion JWT).
- [ ] Cada punto de integracion con Gmail y WhatsApp tiene un comentario `// MOCK: reemplazar con [libreria/API] cuando [condicion]` que identifica exactamente que cambiar.
- [ ] Las variables de entorno para Gmail y WhatsApp estan definidas en `.env.example` con placeholders, aunque sus valores reales sean vacios.
- [ ] Los Dockerfiles pasan `docker build` sin errores.
- [ ] El CI corre en menos de 5 minutos.

### Calidad
- [ ] No hay bugs P1 ni P2 conocidos al cierre del sprint.
- [ ] Los flujos principales del sprint fueron probados por el Tester.
- [ ] El codigo paso code review del Tech Lead.
- [ ] Los indicadores de "modo simulado" en comunicaciones son suficientemente visibles para que Ciudad Moto entienda el estado sin explicacion adicional.

### Demo
- [ ] Se puede realizar una demo end-to-end: login -> clientes -> pipeline Kanban -> actividades con filtros -> comunicaciones (mock) -> reportes -> logout.

---

## Approach Mock para el Modulo de Comunicaciones (M-04)

### Por que mock y no integracion real

Las siguientes dependencias externas NO estan resueltas al inicio del Sprint 2:

| Dependencia | Estado | Tiempo estimado de resolucion |
|-------------|--------|-------------------------------|
| Numero de telefono dedicado para WhatsApp Business API | Pendiente Ciudad Moto | Desconocido |
| Aprobacion de Meta para acceso a WhatsApp Business API | Pendiente Meta | 2-8 semanas tipicamente |
| Templates de mensajes WA aprobados por Meta | Pendiente Ciudad Moto + Meta | Simultaneo a lo anterior |
| Proyecto GCP + Gmail OAuth configurado con el cliente | Pendiente sesion con Ciudad Moto | 1-2 semanas una vez coordinado |

Bloquear el sprint en estas dependencias es inaceptable. La decision es implementar el modulo completo con datos simulados.

### Que significa "mock production-ready"

La arquitectura del codigo es identica a la que correria con las APIs reales. La diferencia esta solo en la capa de transporte:

**Lo que se construye igual que en produccion:**
- Schema Prisma con tablas `Communication`, `CommunicationType`, `CommunicationStatus`
- Endpoints REST completos: POST, GET, paginacion, filtros por cliente
- Servicio con la logica de negocio: validaciones, registro en DB, historial
- Variables de entorno definidas en `.env.example` (aunque vacias)
- Tipos TypeScript compartidos entre frontend y backend

**Lo que se simula en lugar de llamar a la API real:**

Para Gmail:
```typescript
// MOCK: reemplazar con nodemailer + googleapis cuando el cliente complete la configuracion OAuth.
// Requiere: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN en .env
// Referencia: https://developers.google.com/gmail/api/guides/sending
async function sendEmail(payload: EmailPayload): Promise<void> {
  // MOCK: simula envio exitoso — no llama a Gmail API
  await new Promise(resolve => setTimeout(resolve, 200)); // simula latencia de red
  logger.info({ mock: true, to: payload.to, subject: payload.subject }, 'Mock email sent');
}
```

Para WhatsApp:
```typescript
// MOCK: reemplazar con cliente de Meta Cloud API cuando se apruebe el acceso Business.
// Requiere: WA_PHONE_NUMBER_ID, WA_ACCESS_TOKEN en .env
// Referencia: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
async function sendWhatsAppMessage(payload: WaPayload): Promise<void> {
  // MOCK: simula envio exitoso — no llama a Meta Cloud API
  await new Promise(resolve => setTimeout(resolve, 200));
  logger.info({ mock: true, to: payload.to }, 'Mock WhatsApp message sent');
}
```

**Indicadores visuales en el frontend (obligatorios):**

Toda pantalla que interactue con comunicaciones debe mostrar un banner o badge persistente y no descartable:

```
[!] Modo simulacion activo — los emails y mensajes de WhatsApp NO se envian realmente.
    Para activar el envio real, contactar al equipo de desarrollo.
```

El badge debe:
- Ser de color amarillo/naranja (warning, no error)
- Estar visible sin necesidad de hacer scroll
- No poder cerrarse ni ocultarse

Esto es critico para que Ciudad Moto entienda en la demo que el modulo existe y esta construido, pero que el envio real requiere la aprobacion de Meta y la configuracion de Google.

### Que hacer cuando lleguen las credenciales reales

El cambio para activar las integraciones reales una vez resueltas las dependencias es:

1. **Gmail**: instalar `nodemailer` + `googleapis`, agregar las 3 variables de entorno y reemplazar la funcion `sendEmail` mock con la implementacion real. Estimado: medio dia.
2. **WhatsApp**: instalar `axios` o el SDK de Meta, agregar las 2 variables de entorno y reemplazar `sendWhatsAppMessage`. Para el webhook de recepcion de mensajes, agregar un endpoint `POST /webhooks/whatsapp` con verificacion de firma HMAC. Estimado: 1-2 dias incluyendo el webhook.
3. **Frontend**: remover el banner de simulacion y, si se desea, agregar estado real de entrega (enviado, leido). Estimado: medio dia.

Total de trabajo de integracion real: 2-3 dias, no un sprint completo.

---

## Dependencias externas a gestionar en paralelo (acciones para Ciudad Moto)

Estas acciones deben iniciarse por Ciudad Moto DURANTE el Sprint 2 para no bloquear el Sprint 3:

1. Conseguir numero de telefono dedicado para WhatsApp Business API. El numero no puede estar activo en la app movil de WhatsApp.
2. Crear cuenta en Meta Business Manager y comenzar el proceso de aprobacion de WhatsApp Business API.
3. Preparar al menos 3 templates de mensajes (ej: bienvenida, seguimiento, cierre de oportunidad) para envio a Meta para aprobacion.
4. Coordinar con el equipo una sesion de 2 horas para configurar Google Cloud Platform: crear proyecto, habilitar Gmail API, configurar OAuth y generar el refresh token inicial.
5. Informar al PM el resultado de cada uno de estos pasos con fecha y estado para actualizar el registro de riesgos.

---

## Registro de riesgos del Sprint 2

| Riesgo | Probabilidad | Impacto | Mitigacion | Contingencia | Responsable |
|--------|-------------|---------|------------|--------------|-------------|
| Capacidad real menor a 40 SP — el backlog de 56 SP no cierra | Alta | Medio | Aplicar la regla de corte definida arriba. Comunicar al cliente que comunicaciones y reportes pueden simplificarse. | Cortar US-031/032 y simplificar UI de reportes y comunicaciones. | PM |
| BUG pendientes P3/P4 de Sprint 1 consumen mas tiempo del estimado | Media | Bajo | Timebox de 3 SP para US-031. Si no alcanza, cortar y crear tickets individuales para Sprint 3. | Pasar bugs P4 a backlog de mantenimiento. | Backend Dev |
| Frontend: complejidad del drag and drop del Kanban subestimada | Media | Medio | US-018 ya tiene la KanbanCard lista. Usar `dnd-kit` (ya en uso en Sprint 1). 3 SP es ajustado. | Si no cierra, mostrar Kanban estatico sin drag and drop para la demo. | Frontend Dev |
| Ciudad Moto no avanza en dependencias externas (WA, Gmail) | Alta | Bajo en S2 — Alto en S3 | El mock de S2 es independiente. El riesgo se materializa en S3 si no hay credenciales. | Escalar al stakeholder. Documentar impacto de la demora. | PM |
| Docker compose no funciona en el entorno de desarrollo del equipo | Baja | Medio | US-029 va en la primera semana para detectar problemas temprano. | Documentar setup manual como fallback. | DevOps |

---

## Distribucion de carga por agente

| Agente | User Stories | SP estimados |
|--------|-------------|--------------|
| Backend Developer | US-014, US-015, US-016, US-019, US-020, US-021, US-022, US-026, US-027, US-031 | 21 SP |
| Frontend Developer | US-017, US-018, US-023, US-024, US-025, US-028, US-032 | 23 SP |
| DevOps | US-029, US-030 | 5 SP |
| Tester QA | Testing de todos los modulos al cierre (no como US separada, parte del DoD) | — |

La carga de Frontend es alta (23 SP). Si durante el sprint se detecta riesgo, US-028 (pantalla de reportes) puede simplificarse a tablas sin graficos, reduciendo 2-3 SP.

---

## Orden recomendado de desarrollo

### Semana 1 (dias 1 a 5)

**Backend Developer** (en orden):
1. US-015 — GET por ID de actividades y oportunidades (1 SP, 1 dia) — desbloquea a Frontend
2. US-016 — `lastActivityAt` en oportunidades (1 SP, medio dia) — desbloquea US-018
3. US-014 — listado actividades con filtros (3 SP, 1.5 dias)
4. US-019 — schema y CRUD de comunicaciones (3 SP, 1.5 dias) — desbloquea US-020/021

**Frontend Developer** (en orden):
1. US-018 — KanbanBoard conectado (3 SP, 1.5 dias) — espera US-016, paralelo con backend
2. US-017 — listado de actividades con filtros (4 SP, 2 dias) — espera US-014/015

**DevOps**:
1. US-029 — Dockerfiles + docker-compose (3 SP, dias 1-3)

### Semana 2 (dias 6 a 10)

**Backend Developer** (en orden):
5. US-020 — mock Gmail (3 SP, 1.5 dias)
6. US-021 — mock WhatsApp (3 SP, 1.5 dias)
7. US-022 — historial de comunicaciones (2 SP, 1 dia)
8. US-026 — reporte clientes nuevos (2 SP, 1 dia)
9. US-027 — reporte actividades por vendedor (2 SP, 1 dia)
10. US-031 — deuda tecnica P3/P4 (3 SP, timebox 1.5 dias)

**Frontend Developer** (en orden):
3. US-023 — panel comunicaciones en perfil (4 SP, 2 dias) — espera US-022
4. US-024 — formulario email mock (3 SP, 1 dia) — espera US-020/023
5. US-025 — hilo WhatsApp mock (3 SP, 1 dia) — espera US-021/023
6. US-028 — pantalla de reportes (4 SP, 2 dias) — espera US-026/027
7. US-032 — deuda tecnica frontend (2 SP, timebox 1 dia)

**DevOps**:
2. US-030 — GitHub Actions CI (2 SP, dias 6-7)

---

## Definition of Ready para las US del Sprint 2

Una User Story esta lista para iniciar cuando:
- Los criterios de aceptacion estan documentados en esta planificacion
- Las dependencias tecnicas previas estan completadas
- No hay preguntas abiertas bloqueantes sobre el comportamiento esperado
- El agente asignado entiende el scope y la estimacion

---

*Documento preparado por el Project Manager — Equipo GEN*
*Fecha: 2026-03-29*
*Estado: Listo para inicio del Sprint 2*
