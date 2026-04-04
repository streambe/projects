# Especificacion Funcional — LeadGen

**Proyecto**: LeadGen - Generacion de leads B2B via LinkedIn para Streambe
**Version**: 1.0
**Fecha**: 2026-04-03
**Responsable**: Ada Lovelace (Analista Funcional)
**Estado**: DRAFT - Pendiente aprobacion del usuario

---

## 1. Overview

LeadGen es una aplicacion web que permite al equipo de marketing y comercial de Streambe captar, gestionar y convertir leads B2B del sector salud en LATAM a traves de LinkedIn. Incluye CRM con pipeline visual, gestion de secuencias de outreach, scoring automatico de leads y dashboard de metricas.

### 1.1 Contexto de negocio

- **Problema**: Streambe no tiene proceso sistematizado de captacion de clientes B2B. Las acciones comerciales son ad-hoc, sin tracking ni metricas.
- **Usuarios**: Area de marketing (1 persona) y comercial (dueño + 1 comercial) de Streambe.
- **Valor**: Pipeline comercial predecible con metricas de conversion en cada etapa.
- **Metricas de exito**: 15-25 MQLs/mes, 8-12 reuniones/mes, 1-2 clientes nuevos/mes.

---

## 2. Alcance

### 2.1 In Scope — MVP (3 dias)

| ID | Modulo | Funcionalidad |
|----|--------|---------------|
| MVP-01 | Auth | Login basico con email/password, 2 roles (admin, comercial) |
| MVP-02 | CRM/Pipeline | Kanban drag & drop con 9 etapas del funnel |
| MVP-03 | CRM/Pipeline | Ficha de lead: datos de perfil, score, notas, historial |
| MVP-04 | CRM/Pipeline | Filtros por etapa, score, empresa, fecha ultimo contacto |
| MVP-05 | LinkedIn Import | Import manual: pegar LinkedIn URL y scrape basico de datos |
| MVP-06 | LinkedIn Import | Import CSV desde Sales Navigator |
| MVP-07 | LinkedIn Import | Deduplicacion por LinkedIn URL |
| MVP-08 | Outreach | CRUD de templates de mensaje con variables |
| MVP-09 | Outreach | Asignar lead a secuencia con pasos por dia |
| MVP-10 | Outreach | Tracking manual: marcar mensaje enviado, respondio, no respondio |
| MVP-11 | Outreach | Vista: en que paso de la secuencia esta cada lead |
| MVP-12 | Scoring | Score calculado automaticamente segun reglas definidas |
| MVP-13 | Scoring | Alertas cuando lead cruza threshold MQL (40) o SQL (70) |
| MVP-14 | Scoring | Decaimiento automatico de score por inactividad |
| MVP-15 | Dashboard | Leads por etapa (funnel chart) |
| MVP-16 | Dashboard | Actividad semanal (mensajes, respuestas, reuniones) |
| MVP-17 | Dashboard | Leads calientes (score >70) |
| MVP-18 | Dashboard | Tasa de conversion por etapa |

### 2.2 Out of Scope — v2 (post-MVP)

| ID | Funcionalidad | Razon de exclusion |
|----|---------------|--------------------|
| V2-01 | Integracion directa con LinkedIn API (enviar mensajes desde la app) | Riesgo de ban, complejidad tecnica |
| V2-02 | Automatizacion real de envio de secuencias | Approach conservador, MVP es tracking manual |
| V2-03 | Integracion Calendly | No critico para arrancar |
| V2-04 | Integracion WhatsApp Business | Canal secundario |
| V2-05 | Integracion email (SMTP/IMAP) | Canal secundario |
| V2-06 | Enriquecimiento automatico de datos (scraping avanzado) | Complejidad tecnica |
| V2-07 | Reportes exportables (PDF, Google Sheets) | Nice to have |
| V2-08 | Multi-perfil LinkedIn (vista consolidada) | MVP trabaja con 2 perfiles sin separacion |
| V2-09 | Calendario de contenido / sugerencias de posts | No critico |
| V2-10 | ABM dashboard (vista por empresa) | Complejidad, bajo volumen inicial |
| V2-11 | Recordatorios y tareas pendientes por lead | Nice to have |
| V2-12 | Deteccion automatica de señales de compra | Requiere scraping avanzado |

---

## 3. Requerimientos Funcionales por Modulo

### 3.1 Modulo Auth (MVP-01)

**RF-AUTH-01**: El sistema debe permitir login con email y password.
**RF-AUTH-02**: Existen 2 roles: `admin` (dueño, ve todo, configura todo) y `comercial` (ve sus leads asignados y datos generales del dashboard).
**RF-AUTH-03**: El admin puede crear y desactivar usuarios.
**RF-AUTH-04**: Sesion expira despues de 24 horas de inactividad.

### 3.2 Modulo CRM / Pipeline (MVP-02 a MVP-04)

**RF-CRM-01**: El pipeline se visualiza como tablero Kanban con las siguientes 9 columnas (en orden):
1. Lead frio
2. Conectado
3. Engaged
4. MQL
5. SQL
6. Oportunidad
7. Propuesta
8. Negociacion
9. Cliente

**RF-CRM-02**: Los leads se mueven entre etapas via drag & drop.
**RF-CRM-03**: Al mover un lead a una etapa, el sistema registra automaticamente una interaccion de tipo `cambio_etapa` con timestamp.
**RF-CRM-04**: La ficha de lead contiene:
- Datos de perfil: nombre, apellido, empresa, cargo, headline, LinkedIn URL, tier (1/2/3)
- Score actual (calculado, no editable manualmente)
- Perfil asignado (dueño o comercial)
- Secuencia activa y paso actual
- Fecha ultimo contacto
- Fecha proxima accion
- Tags (lista libre)
- Notas (texto libre, multiples entradas con timestamp)
- Historial de interacciones (timeline cronologico)

**RF-CRM-05**: Filtros disponibles en la vista de pipeline y en vista lista:
- Por etapa del funnel
- Por rango de score
- Por empresa
- Por tier (1/2/3)
- Por perfil asignado
- Por fecha de ultimo contacto (rango)
- Por tags

**RF-CRM-06**: Vista alternativa en formato lista/tabla ademas del Kanban.
**RF-CRM-07**: Busqueda rapida por nombre, empresa o LinkedIn URL.

### 3.3 Modulo LinkedIn Import (MVP-05 a MVP-07)

**RF-IMP-01**: El usuario puede pegar una URL de perfil de LinkedIn. El sistema extrae: nombre, apellido, cargo, empresa, headline. Si no puede scrapear, permite carga manual de esos campos.
**RF-IMP-02**: El usuario puede subir un CSV exportado desde Sales Navigator. El sistema mapea las columnas automaticamente (nombre, apellido, cargo, empresa, LinkedIn URL).
**RF-IMP-03**: Al importar, si ya existe un lead con la misma LinkedIn URL, el sistema muestra alerta de duplicado y ofrece: (a) saltar, (b) actualizar datos existentes.
**RF-IMP-04**: Al importar multiples leads via CSV, el sistema muestra resumen pre-importacion: total de registros, duplicados detectados, registros nuevos. El usuario confirma antes de ejecutar.
**RF-IMP-05**: El tier se asigna manualmente al importar o se deja en blanco para asignar despues.

### 3.4 Modulo Outreach — Secuencias y Templates (MVP-08 a MVP-11)

**RF-OUT-01**: CRUD de templates de mensaje con las siguientes variables soportadas:
- `[Nombre]` — nombre de pila del lead
- `[empresa]` — nombre de la empresa
- `[cargo]` — cargo del lead
- `[headline]` — headline de LinkedIn

**RF-OUT-02**: Cada template tiene: nombre, contenido (texto con variables), tipo (`conexion`, `follow_up`, `inmail`, `breakup`), canal (`linkedin`, `inmail`).
**RF-OUT-03**: Una secuencia es una lista ordenada de pasos. Cada paso tiene: dia (relativo al inicio, ej: dia 0, 1, 4, 7, 14, 21), template asociado, canal.
**RF-OUT-04**: CRUD de secuencias. Se pre-cargan las secuencias definidas en la estrategia de marketing (secuencia post-conexion de 5 pasos).
**RF-OUT-05**: Un lead puede estar asignado a una sola secuencia activa a la vez.
**RF-OUT-06**: El usuario marca manualmente cada paso como: `pendiente`, `enviado`, `respondio_positivo`, `respondio_neutral`, `respondio_negativo`, `no_respondio`.
**RF-OUT-07**: Al marcar un paso, el sistema registra una interaccion y actualiza el score automaticamente segun las reglas de scoring.
**RF-OUT-08**: Si el lead responde (positivo o negativo), la secuencia se pausa automaticamente. El usuario decide si continuar o sacar de secuencia.
**RF-OUT-09**: Vista de "cola de acciones del dia": lista de leads que tienen un paso de secuencia pendiente para hoy, con el template pre-renderizado con las variables del lead.
**RF-OUT-10**: El template pre-renderizado se puede copiar al clipboard con un click para pegarlo en LinkedIn.

### 3.5 Modulo Scoring (MVP-12 a MVP-14)

**RF-SCO-01**: El score de un lead se calcula automaticamente como la suma de puntos demograficos + puntos de comportamiento.

**Puntos demograficos (se asignan al crear/editar el lead)**:

| Criterio | Puntos |
|----------|--------|
| Cargo C-level (CEO, CTO, CIO) | +20 |
| Cargo VP / Director | +15 |
| Cargo Gerente | +10 |
| Cargo Coordinador/Jefe | +5 |
| Otro cargo | 0 |
| Empresa Tier 1 | +20 |
| Empresa Tier 2 | +10 |
| Empresa Tier 3 | +5 |
| Region Argentina | +5 |
| Region LATAM (no Argentina) | +3 |

**Puntos de comportamiento (se suman/restan al registrar interacciones)**:

| Accion | Puntos |
|--------|--------|
| Acepto conexion | +5 |
| Respondio mensaje (positivo) | +15 |
| Respondio mensaje (neutral/pregunta) | +10 |
| Respondio "no me interesa" | -20 |
| Visito perfil de Streambe | +5 |
| Like a post de Streambe | +3 |
| Comento post de Streambe | +10 |
| Compartio post de Streambe | +15 |
| Pidio mas info | +20 |
| Acepto reunion | +30 |
| No responde en 30 dias | -10 |
| Descargo contenido/reporte | +10 |
| Menciono presupuesto o timeline | +25 |
| Menciono competencia | +15 |

**RF-SCO-02**: Thresholds:
- 0-19: Lead frio
- 20-39: Lead tibio
- 40-69: MQL
- 70-99: SQL
- 100+: Hot lead

**RF-SCO-03**: Cuando un lead cruza el threshold de MQL (40) o SQL (70), el sistema genera una alerta visible en el dashboard y en la ficha del lead.
**RF-SCO-04**: Decaimiento automatico: cada semana, si un lead no tuvo interaccion en los ultimos 30 dias, pierde 5 puntos. Si no tuvo en 60 dias, pierde 10 adicionales.
**RF-SCO-05**: Si el score baja mas de 20 puntos en 7 dias, se genera alerta "lead se enfria".
**RF-SCO-06**: El cargo del lead se clasifica automaticamente en categoria (C-level, VP/Director, Gerente, Coordinador, Otro) basandose en keywords del campo cargo.

### 3.6 Modulo Dashboard (MVP-15 a MVP-18)

**RF-DASH-01**: Funnel chart mostrando cantidad de leads en cada etapa del pipeline.
**RF-DASH-02**: Resumen de actividad semanal: invitaciones enviadas, mensajes enviados, respuestas recibidas, reuniones agendadas.
**RF-DASH-03**: Lista de leads calientes (score >70) con acceso directo a la ficha.
**RF-DASH-04**: Tasas de conversion entre etapas consecutivas del funnel.
**RF-DASH-05**: Panel de alertas activas: leads que cruzaron thresholds, leads enfriandose, leads con acciones pendientes para hoy.
**RF-DASH-06**: Filtro temporal: esta semana, este mes, ultimos 3 meses, personalizado.

---

## 4. Requerimientos No Funcionales

### 4.1 Performance

- **RNF-PERF-01**: Carga inicial de la app < 3 segundos.
- **RNF-PERF-02**: Transiciones de pagina < 500ms.
- **RNF-PERF-03**: Drag & drop en Kanban debe ser fluido con hasta 500 leads en pipeline.
- **RNF-PERF-04**: Import de CSV de hasta 1000 registros debe completarse en < 30 segundos.

### 4.2 Seguridad

- **RNF-SEC-01**: Passwords hasheados con bcrypt (o equivalente).
- **RNF-SEC-02**: Sesiones con JWT, expiracion configurable.
- **RNF-SEC-03**: HTTPS obligatorio en todos los ambientes.
- **RNF-SEC-04**: Validacion y sanitizacion de toda entrada del usuario.
- **RNF-SEC-05**: No almacenar credenciales de LinkedIn en la app.
- **RNF-SEC-06**: Rate limiting en endpoints de login (max 5 intentos por minuto).

### 4.3 Usabilidad

- **RNF-UX-01**: Responsive para desktop (1280px+) y tablet (768px+). Mobile no es prioridad MVP.
- **RNF-UX-02**: Copiar template renderizado al clipboard con un solo click.
- **RNF-UX-03**: No mas de 3 clicks para llegar a cualquier funcionalidad desde el dashboard.

### 4.4 Compliance LinkedIn ToS

- **RNF-LIN-01**: La app NO interactua directamente con LinkedIn (no API calls, no browser automation, no scraping automatizado masivo).
- **RNF-LIN-02**: El scraping de URL individual (RF-IMP-01) se limita a datos publicos del perfil y debe respetar delays.
- **RNF-LIN-03**: La app es un sistema de tracking y CRM. Todas las acciones en LinkedIn las ejecuta el usuario manualmente.
- **RNF-LIN-04**: Los limites diarios definidos en la estrategia de marketing se muestran como referencia en la UI, no se enforcement desde la app en MVP.

### 4.5 Disponibilidad

- **RNF-DISP-01**: Disponibilidad target 99% (tolerancia a caidas breves).
- **RNF-DISP-02**: Backup diario de base de datos.

---

## 5. Reglas de Negocio

- **BR-001**: Un lead se identifica de forma unica por su LinkedIn URL.
- **BR-002**: Un lead solo puede estar en una etapa del funnel a la vez.
- **BR-003**: Un lead solo puede tener una secuencia activa a la vez.
- **BR-004**: Si un lead responde negativamente ("no me interesa"), la secuencia se detiene y no se puede reactivar la misma secuencia para ese lead.
- **BR-005**: No se puede contactar a mas de 2 personas de la misma empresa simultaneamente (advertencia en UI, no bloqueo duro).
- **BR-006**: El score nunca puede ser menor a 0.
- **BR-007**: Al mover un lead a la etapa "Cliente", se pide confirmacion y se registra como conversion.
- **BR-008**: Los templates pre-cargados de la estrategia de marketing no se pueden eliminar (solo desactivar).
- **BR-009**: El admin ve todos los leads. El rol comercial solo ve los leads asignados a el.
- **BR-010**: Un lead en etapa "Lead frio" no puede saltar directamente a "SQL" o posterior. Debe pasar por las etapas intermedias (el sistema advierte pero permite override con confirmacion).

---

## 6. Integraciones

### 6.1 MVP

| Integracion | Tipo | Descripcion |
|-------------|------|-------------|
| LinkedIn (scraping individual) | Lectura, on-demand | Pegar URL -> extraer datos publicos del perfil |
| Sales Navigator CSV | Import de archivos | Upload de CSV exportado desde Sales Navigator |

### 6.2 v2

| Integracion | Tipo | Prioridad |
|-------------|------|-----------|
| LinkedIn API / Chrome Extension | Bidireccional | Alta |
| Calendly | Lectura | Media |
| Google Sheets | Export | Media |
| WhatsApp Business API | Bidireccional | Media |
| Email SMTP/IMAP | Bidireccional | Baja |
| Slack/Discord | Notificaciones | Baja |

---

## 7. Modelo de Datos (MVP)

### 7.1 Entidades principales

**Lead**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| linkedin_url | String | Si | Unique |
| nombre | String | Si | |
| apellido | String | Si | |
| empresa | String | No | |
| cargo | String | No | |
| cargo_categoria | Enum | No | c_level, vp_director, gerente, coordinador, otro — calculado automaticamente |
| headline | String | No | |
| tier | Enum | No | 1, 2, 3 |
| region | Enum | No | argentina, latam, otro |
| score | Integer | Si | Default 0, calculado |
| etapa_funnel | Enum | Si | Las 9 etapas |
| perfil_asignado | FK User | No | |
| secuencia_activa | FK Secuencia | No | |
| paso_secuencia_actual | Integer | No | |
| fecha_ultimo_contacto | DateTime | No | |
| fecha_proxima_accion | DateTime | No | |
| tags | String[] | No | |
| created_at | DateTime | Si | |
| updated_at | DateTime | Si | |

**Interaccion**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| lead_id | FK Lead | Si | |
| tipo | Enum | Si | conexion_enviada, conexion_aceptada, mensaje_enviado, respuesta_positiva, respuesta_neutral, respuesta_negativa, like, comment, share, reunion_agendada, reunion_realizada, propuesta_enviada, no_interesado, cambio_etapa, nota |
| canal | Enum | No | linkedin, inmail, email, telefono, whatsapp |
| contenido | Text | No | |
| score_delta | Integer | No | Puntos sumados/restados |
| created_at | DateTime | Si | |
| created_by | FK User | Si | |

**Secuencia**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| nombre | String | Si | |
| activa | Boolean | Si | Default true |
| es_sistema | Boolean | Si | Default false — templates pre-cargados |
| created_at | DateTime | Si | |

**PasoSecuencia**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| secuencia_id | FK Secuencia | Si | |
| orden | Integer | Si | |
| dia_relativo | Integer | Si | Dia 0, 1, 4, 7, 14, 21 |
| template_id | FK Template | Si | |
| canal | Enum | Si | linkedin, inmail |

**Template**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| nombre | String | Si | |
| contenido | Text | Si | Con variables [Nombre], [empresa], etc |
| tipo | Enum | Si | conexion, follow_up, inmail, breakup |
| canal | Enum | Si | linkedin, inmail |
| es_sistema | Boolean | Si | Default false |
| activo | Boolean | Si | Default true |
| created_at | DateTime | Si | |

**Empresa**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| nombre | String | Si | |
| industria | String | No | |
| tamaño_empleados | String | No | |
| tier | Enum | No | 1, 2, 3 |
| linkedin_url | String | No | |
| notas | Text | No | |

**User**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| email | String | Si | Unique |
| password_hash | String | Si | |
| nombre | String | Si | |
| rol | Enum | Si | admin, comercial |
| activo | Boolean | Si | Default true |
| created_at | DateTime | Si | |

**Alerta**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Si | PK |
| lead_id | FK Lead | Si | |
| tipo | Enum | Si | threshold_mql, threshold_sql, lead_enfriandose, accion_pendiente |
| mensaje | String | Si | |
| leida | Boolean | Si | Default false |
| created_at | DateTime | Si | |

---

## 8. User Stories con Criterios de Aceptacion (MVP)

### US-01: Login de usuario

**Como** usuario de LeadGen,
**quiero** iniciar sesion con email y password,
**para** acceder a la plataforma de forma segura.

```gherkin
Scenario: Login exitoso
  Given estoy en la pagina de login
  When ingreso un email y password validos
  Then soy redirigido al dashboard
  And veo mi nombre en la barra superior

Scenario: Login fallido
  Given estoy en la pagina de login
  When ingreso credenciales invalidas
  Then veo el mensaje "Credenciales invalidas"
  And permanezco en la pagina de login

Scenario: Rate limiting
  Given intente loguearme 5 veces con password incorrecto en el ultimo minuto
  When intento loguearme nuevamente
  Then veo "Demasiados intentos. Intenta en 1 minuto"
```

### US-02: Visualizar pipeline Kanban

**Como** usuario de LeadGen,
**quiero** ver todos mis leads en un tablero Kanban organizado por etapa del funnel,
**para** tener visibilidad del estado de todo mi pipeline de un vistazo.

```gherkin
Scenario: Ver pipeline con leads
  Given tengo leads en diferentes etapas del funnel
  When accedo a la vista de pipeline
  Then veo un tablero con 9 columnas (Lead frio hasta Cliente)
  And cada columna muestra los leads correspondientes con nombre, empresa y score
  And las columnas muestran la cantidad de leads

Scenario: Pipeline vacio
  Given no tengo leads cargados
  When accedo a la vista de pipeline
  Then veo las 9 columnas vacias con un mensaje "Sin leads en esta etapa"
```

### US-03: Mover lead entre etapas via drag & drop

**Como** usuario de LeadGen,
**quiero** arrastrar un lead de una etapa a otra en el Kanban,
**para** actualizar su estado rapidamente.

```gherkin
Scenario: Mover lead a etapa adyacente
  Given tengo un lead "Juan Perez" en etapa "Conectado"
  When arrastro la tarjeta a la columna "Engaged"
  Then el lead aparece en la columna "Engaged"
  And se registra una interaccion de tipo "cambio_etapa" con timestamp
  And el historial del lead muestra el movimiento

Scenario: Mover lead a etapa no adyacente
  Given tengo un lead "Maria Lopez" en etapa "Lead frio"
  When arrastro la tarjeta a la columna "SQL"
  Then veo un dialogo de confirmacion "Estas saltando etapas intermedias. Confirmar?"
  And si confirmo, el lead se mueve a "SQL"

Scenario: Mover lead a Cliente
  Given tengo un lead en etapa "Negociacion"
  When arrastro la tarjeta a "Cliente"
  Then veo dialogo de confirmacion "Marcar como cliente cerrado?"
  And si confirmo, se registra como conversion
```

### US-04: Importar lead desde LinkedIn URL

**Como** usuario de LeadGen,
**quiero** pegar una URL de perfil de LinkedIn y que se extraigan los datos automaticamente,
**para** cargar leads rapidamente sin tipeo manual.

```gherkin
Scenario: Import exitoso desde URL
  Given estoy en la pantalla de nuevo lead
  When pego una URL de LinkedIn valida (linkedin.com/in/...)
  Then el sistema extrae nombre, apellido, cargo, empresa y headline
  And puedo revisar y editar los datos antes de guardar
  And al guardar, el lead aparece en etapa "Lead frio"

Scenario: URL duplicada
  Given ya existe un lead con LinkedIn URL "linkedin.com/in/juanperez"
  When intento importar la misma URL
  Then veo alerta "Este lead ya existe" con opciones: "Ver lead existente" o "Actualizar datos"

Scenario: Scraping falla
  Given pego una URL de LinkedIn valida
  When el sistema no puede extraer los datos (perfil privado, error de red)
  Then veo mensaje "No se pudieron extraer los datos automaticamente"
  And se muestra formulario manual con la URL pre-cargada
```

### US-05: Importar leads desde CSV de Sales Navigator

**Como** usuario de LeadGen,
**quiero** subir un CSV exportado de Sales Navigator,
**para** cargar multiples leads de una vez.

```gherkin
Scenario: Import CSV exitoso
  Given tengo un CSV de Sales Navigator con 50 leads
  When lo subo en la pantalla de importacion
  Then veo resumen: "50 registros detectados, 3 duplicados, 47 nuevos"
  And puedo elegir que hacer con duplicados: saltar o actualizar
  When confirmo la importacion
  Then se crean 47 leads nuevos en etapa "Lead frio"
  And veo mensaje de exito con cantidad importada

Scenario: CSV con formato incorrecto
  Given subo un archivo CSV que no tiene las columnas esperadas
  When el sistema intenta procesarlo
  Then veo mensaje "Formato no reconocido. Asegurate de exportar desde Sales Navigator"
```

### US-06: Gestionar templates de mensaje

**Como** usuario de LeadGen,
**quiero** crear y editar templates de mensaje con variables,
**para** tener mensajes reutilizables y personalizables.

```gherkin
Scenario: Crear template
  Given estoy en la seccion de templates
  When creo un template con nombre "Conexion - Referencia a contenido"
  And escribo el contenido con variables "[Nombre]" y "[empresa]"
  And selecciono tipo "conexion" y canal "linkedin"
  Then el template se guarda exitosamente
  And aparece en la lista de templates

Scenario: Preview de template con datos de lead
  Given tengo un template con variable "[Nombre]" y "[empresa]"
  When veo el preview para el lead "Juan Perez" de "Hospital Italiano"
  Then veo el mensaje con "Juan" y "Hospital Italiano" reemplazados
  And puedo copiar el texto renderizado al clipboard
```

### US-07: Asignar lead a secuencia de outreach

**Como** usuario de LeadGen,
**quiero** asignar un lead a una secuencia de mensajes,
**para** trackear el progreso del outreach paso a paso.

```gherkin
Scenario: Asignar secuencia
  Given tengo un lead sin secuencia activa
  When le asigno la secuencia "Post-conexion estandar"
  Then el lead muestra "Secuencia: Post-conexion estandar - Paso 1 (Dia 0)"
  And aparece en la cola de acciones del dia

Scenario: Lead ya tiene secuencia activa
  Given tengo un lead con secuencia activa
  When intento asignarle otra secuencia
  Then veo "Este lead ya tiene una secuencia activa. Desactivar la actual?"

Scenario: Marcar paso como enviado
  Given el lead esta en Paso 1 de la secuencia
  When marco el paso como "enviado"
  Then se registra interaccion "mensaje_enviado"
  And el lead avanza al Paso 2
  And la fecha_proxima_accion se actualiza al dia correspondiente al Paso 2

Scenario: Lead responde positivamente
  Given el lead esta en Paso 3 de la secuencia
  When marco "respondio positivo"
  Then la secuencia se pausa automaticamente
  And el score suma +15 puntos
  And veo opcion "Continuar secuencia" o "Sacar de secuencia"
```

### US-08: Cola de acciones del dia

**Como** usuario de LeadGen,
**quiero** ver una lista de todos los leads que tienen acciones pendientes para hoy,
**para** ejecutar mi outreach diario de forma organizada.

```gherkin
Scenario: Ver cola del dia
  Given tengo 8 leads con pasos de secuencia pendientes para hoy
  When accedo a "Acciones del dia"
  Then veo una lista de 8 leads con: nombre, empresa, paso actual, template renderizado
  And cada item tiene boton "Copiar mensaje" y opciones de marcar resultado

Scenario: Cola vacia
  Given no tengo acciones pendientes para hoy
  When accedo a "Acciones del dia"
  Then veo "No hay acciones pendientes para hoy"
```

### US-09: Score automatico de leads

**Como** usuario de LeadGen,
**quiero** que el score de cada lead se calcule automaticamente,
**para** saber cuales priorizar sin calculo manual.

```gherkin
Scenario: Score inicial al crear lead
  Given creo un lead con cargo "CTO" (C-level = +20) y tier 1 (+20) y region Argentina (+5)
  Then su score inicial es 45
  And su clasificacion es "MQL"
  And se genera alerta "Nuevo MQL: [nombre]"

Scenario: Score se actualiza con interaccion
  Given tengo un lead con score 35
  When registro interaccion "respondio positivo" (+15)
  Then su score pasa a 50
  And su clasificacion cambia de "Lead tibio" a "MQL"
  And se genera alerta de threshold

Scenario: Decaimiento por inactividad
  Given tengo un lead con score 45 cuya ultima interaccion fue hace 35 dias
  When se ejecuta el proceso semanal de decaimiento
  Then su score baja a 40
  And si baja de 40, se genera alerta "lead se enfria"
```

### US-10: Dashboard de metricas

**Como** usuario admin de LeadGen,
**quiero** ver un dashboard con metricas de actividad y pipeline,
**para** entender el rendimiento de mis esfuerzos comerciales.

```gherkin
Scenario: Ver funnel chart
  Given tengo leads distribuidos en diferentes etapas
  When accedo al dashboard
  Then veo un grafico de funnel mostrando cantidad por etapa
  And los porcentajes de conversion entre etapas

Scenario: Ver actividad semanal
  Given estoy en el dashboard con filtro "esta semana"
  Then veo contadores de: invitaciones enviadas, mensajes enviados, respuestas recibidas, reuniones agendadas
  And puedo comparar con la semana anterior

Scenario: Ver alertas activas
  Given hay 3 leads que cruzaron threshold SQL y 2 enfriandose
  When veo el panel de alertas
  Then veo 5 alertas ordenadas por fecha
  And puedo hacer click en cada una para ir a la ficha del lead
  And puedo marcar alertas como leidas
```

### US-11: Ficha detallada de lead

**Como** usuario de LeadGen,
**quiero** ver toda la informacion de un lead en una sola pantalla,
**para** tener contexto completo antes de interactuar.

```gherkin
Scenario: Ver ficha completa
  Given hago click en un lead del pipeline
  Then veo la ficha con: datos de perfil, score con indicador visual, etapa actual
  And veo el historial de interacciones como timeline cronologico
  And veo la secuencia activa con progreso
  And veo las notas ordenadas por fecha
  And puedo agregar nueva nota
  And puedo registrar nueva interaccion
  And veo link directo al perfil de LinkedIn (abre en nueva pestaña)
```

### US-12: Filtrar leads

**Como** usuario de LeadGen,
**quiero** filtrar leads por multiples criterios,
**para** encontrar rapidamente los que necesito.

```gherkin
Scenario: Filtrar por score y etapa
  Given tengo 100 leads en el sistema
  When aplico filtro: score > 40 AND etapa = "Engaged"
  Then veo solo los leads que cumplen ambos criterios
  And el contador muestra la cantidad filtrada

Scenario: Busqueda rapida
  Given escribo "Hospital" en la barra de busqueda
  Then veo todos los leads cuyo nombre, empresa o headline contiene "Hospital"
```

---

## 9. Datos Pre-cargados

El sistema debe venir pre-cargado con:

### 9.1 Templates de mensajes
Los 9 templates definidos en la estrategia de marketing:
- 3 variantes de mensaje de conexion (A, B, C)
- 4 mensajes de secuencia post-conexion (dia 1, 7, 14, 21)
- 2 templates de InMail

### 9.2 Secuencia pre-armada
- "Post-conexion estandar": 5 pasos (dia 0: nada, dia 1: agradecimiento, dia 4: engagement, dia 7: pregunta descubrimiento, dia 14: contenido + CTA, dia 21: breakup)

### 9.3 Reglas de scoring
- Todas las reglas de la seccion 6 de la estrategia de marketing pre-configuradas.

### 9.4 Usuarios iniciales
- 1 admin (dueño)
- 1 comercial

---

## 10. Flujos de Proceso Principales

### 10.1 Flujo: Captacion de lead nuevo

```
1. Usuario abre Sales Navigator → ejecuta busqueda guardada
2. Exporta CSV con resultados
3. En LeadGen: sube CSV → revisa resumen → confirma import
4. Leads aparecen en etapa "Lead frio" con score demografico calculado
5. Usuario revisa leads, asigna tiers manualmente si falta
6. Usuario asigna secuencia de outreach a leads seleccionados
```

### 10.2 Flujo: Outreach diario

```
1. Usuario abre "Acciones del dia"
2. Ve lista de leads con mensajes pendientes
3. Por cada lead:
   a. Lee template renderizado
   b. Click "Copiar mensaje"
   c. Abre LinkedIn, pega y envia manualmente
   d. Vuelve a LeadGen, marca como "enviado"
4. Si alguien respondio: marca resultado → score se actualiza
5. Si lead cruza threshold → alerta aparece en dashboard
```

### 10.3 Flujo: Lead caliente a reunion

```
1. Lead cruza score 70 → alerta SQL
2. Comercial ve alerta en dashboard
3. Abre ficha del lead → revisa historial completo
4. Envia mensaje proponiedo reunion (manual en LinkedIn)
5. Marca interaccion "reunion_agendada" (+30 puntos)
6. Mueve lead a etapa "SQL"
7. Realiza reunion → marca "reunion_realizada" → mueve a "Oportunidad"
```

---

## 11. Supuestos

1. Los 2 perfiles de LinkedIn ya estan activos y con Sales Navigator habilitado.
2. El CSV de Sales Navigator tiene un formato estandar y consistente.
3. El volumen inicial sera de <500 leads en el primer mes.
4. No se requiere integracion con sistemas existentes de Streambe (no hay CRM previo).
5. Los usuarios tienen acceso a LinkedIn en el mismo navegador donde usan LeadGen.
6. El scraping individual de perfiles LinkedIn es posible via proxy o API publica.

---

## 12. Riesgos

| ID | Riesgo | Impacto | Mitigacion |
|----|--------|---------|------------|
| R-01 | Scraping de LinkedIn URL puede ser bloqueado | Alto | Fallback a carga manual. No depender del scraping para el flujo critico. |
| R-02 | Formato CSV de Sales Navigator cambia | Medio | Mapeo flexible de columnas con preview antes de importar. |
| R-03 | Volumen de leads supera capacidad del Kanban | Bajo | Vista lista como alternativa. Paginacion. |
| R-04 | LinkedIn detecta patrones automatizados | Alto | Toda accion en LinkedIn es manual. La app solo trackea. |

---

## 13. Preguntas Abiertas

1. El scraping de perfil individual via URL: se implementa con un servicio externo (ej: Proxycurl, PhantomBuster) o con scraping propio? Esto impacta complejidad y costo.
2. Hay preferencia de base de datos (PostgreSQL, SQLite, etc.)?
3. El deploy sera en Vercel o en otro servicio?

---

*Documento preparado por Ada Lovelace, Analista Funcional del equipo GEN.*
*Version 1.0 — 2026-04-03*
*Estado: DRAFT — Pendiente aprobacion del usuario*
