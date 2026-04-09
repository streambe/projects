# Especificacion Funcional — Gentica Team Agent Builder

**Proyecto:** Gentica
**Version:** 1.0 (Draft)
**Autora:** Ada Lovelace — Analista Funcional
**Fecha:** 2026-04-09
**Estado:** PENDIENTE APROBACION

---

## 1. Overview

Gentica es una plataforma SaaS que permite a empresas y desarrolladores crear proyectos de software a partir de equipos de subagentes IA preexistentes. Los agentes provienen de un catalogo curado por Streambe, tienen habilidades tecnicas y metodologia incorporada, y son personalizables por el usuario. La interaccion con la plataforma es conversacional.

### 1.1 Problema

Las empresas que quieren usar IA para desarrollo de software enfrentan:
- Complejidad de configurar y orquestar multiples agentes IA
- Falta de metodologia en los agentes disponibles en el mercado
- Dificultad para personalizar agentes sin conocimiento tecnico profundo
- Ausencia de plataformas que ofrezcan equipos completos pre-armados con roles definidos

### 1.2 Propuesta de valor

Agentes profesionalizados con skills y metodologia, organizados en equipos funcionales, personalizables y desplegables en multiples canales.

### 1.3 Metricas de exito

- Usuarios registrados y tasa de conversion Free a Pro
- Proyectos creados por usuario
- Tokens consumidos / MRR
- Tiempo promedio desde registro hasta primer proyecto desplegado
- NPS de usuarios Pro

---

## 2. Alcance

### 2.1 In Scope (MVP)

- Registro y autenticacion de usuarios
- Catalogo curado de agentes (23 GEN + VoltAgent), solo lectura
- Creacion de proyectos con equipos de hasta 20 subagentes
- Personalizacion de agentes: avatar (DALL-E), bio, personalidad, estilo de comunicacion
- Orquestacion: lenguaje natural + reglas simples de handoff (formulario)
- Conversacion entre agentes segun orquestacion definida
- Deploy: widget embebible + snippet HTML/JS + API publica + Slack
- Dashboard del cliente: metricas de uso, costos, historial de conversaciones
- Billing: Stripe multi-moneda ARS/USD, invoices mensuales, tiers Free/Pro/Enterprise
- Tope de gasto configurable por el cliente
- Back office Admin Streambe: gestion clientes, ingresos, costos API, suspender cuentas, ver proyectos
- Upload de documentos/bases de conocimiento a los agentes
- Wizard de onboarding guiado
- Idioma: espanol
- Aislamiento: 1 tenant por proyecto via Supabase RLS + schemas
- GDPR basico

### 2.2 Out of Scope (Fase 2 / Evolutivo)

- Editor visual de orquestacion tipo flowchart
- Canales WhatsApp Business API y Telegram
- Marketplace de equipos entre usuarios
- Roles back office: Soporte y Finanzas
- Idioma ingles
- SOC2 / HIPAA
- Migracion a Kubernetes
- Creacion de agentes desde cero por el usuario

---

## 3. Actores

| Actor | Descripcion | Permisos |
|-------|-------------|----------|
| **Visitante** | Usuario no registrado | Ver landing, pricing, registrarse |
| **Cliente Free** | Usuario registrado tier gratuito | 1 proyecto activo (stop para cambiar), 100K tokens/mes, personalizar agentes, deploy en canales MVP |
| **Cliente Pro** | Usuario registrado tier pago | 5 proyectos activos, 2M tokens incluidos + overage, todas las funcionalidades MVP |
| **Cliente Enterprise** | Empresa con contrato custom | Limites custom, soporte dedicado, contacto comercial |
| **Admin Streambe** | Administrador interno de Streambe | Gestion de clientes, ingresos, control costos API, suspender cuentas, ver todos los proyectos, gestionar catalogo de agentes |

---

## 4. Epicas

| ID | Epica | Descripcion |
|----|-------|-------------|
| EPIC-01 | Autenticacion y Onboarding | Registro, login, recuperacion de password, wizard de onboarding |
| EPIC-02 | Catalogo de Agentes | Visualizacion del catalogo curado, detalle de cada agente, filtros |
| EPIC-03 | Gestion de Proyectos | Crear, editar, pausar, eliminar proyectos |
| EPIC-04 | Armado de Equipos | Seleccionar agentes del catalogo, agregar/quitar del equipo, limite de 20 |
| EPIC-05 | Personalizacion de Agentes | Avatar DALL-E, bio, personalidad, estados emocionales, estilo comunicacion |
| EPIC-06 | Orquestacion | Definir flujo de trabajo entre agentes via lenguaje natural y reglas de handoff |
| EPIC-07 | Base de Conocimiento | Upload de documentos y archivos que los agentes pueden consultar |
| EPIC-08 | Deploy y Canales | Widget embebible, snippet HTML/JS, API publica, integracion Slack |
| EPIC-09 | Conversacion y Runtime | Motor de ejecucion multi-agente, conversacion entre agentes, interaccion usuario-agentes |
| EPIC-10 | Dashboard del Cliente | Metricas de uso, costos, historial de conversaciones, tope de gasto |
| EPIC-11 | Billing y Suscripciones | Stripe, tiers, tokens, overage, invoices, tope de gasto |
| EPIC-12 | Back Office Admin | Panel de administracion Streambe |
| EPIC-13 | Seguridad y Aislamiento | RLS, schemas por proyecto, GDPR basico |

---

## 5. Requerimientos Funcionales

### EPIC-01 — Autenticacion y Onboarding

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-001 | El sistema debe permitir registro con email y password | Must |
| RF-002 | El sistema debe permitir login con email y password | Must |
| RF-003 | El sistema debe permitir recuperacion de password via email | Must |
| RF-004 | El sistema debe permitir login con proveedores OAuth (Google, GitHub) | Should |
| RF-005 | Al primer login, el sistema debe iniciar un wizard de onboarding guiado que lleve al usuario a crear su primer proyecto | Must |
| RF-006 | El wizard de onboarding debe ser conversacional — el usuario interactua con un agente guia que lo acompana paso a paso | Must |
| RF-007 | El sistema debe permitir logout y gestion de sesiones | Must |

### EPIC-02 — Catalogo de Agentes

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-008 | El sistema debe mostrar un catalogo de agentes curado por Streambe (23 agentes GEN + agentes VoltAgent) | Must |
| RF-009 | Cada agente del catalogo debe mostrar: nombre, rol, descripcion, skills, avatar por defecto | Must |
| RF-010 | El catalogo debe permitir filtrar agentes por rol, skills o busqueda de texto libre | Should |
| RF-011 | El catalogo es solo lectura para el usuario — no puede crear, editar ni eliminar agentes del catalogo | Must |
| RF-012 | El catalogo debe mostrar equipos pre-armados (ej: "Equipo GEN") que el usuario puede seleccionar completos | Should |

### EPIC-03 — Gestion de Proyectos

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-013 | El sistema debe permitir crear un nuevo proyecto con nombre y descripcion | Must |
| RF-014 | La creacion de un proyecto debe ser conversacional — el usuario describe lo que quiere y el sistema lo guia | Must |
| RF-015 | Cliente Free: maximo 1 proyecto activo. Para crear otro debe pausar (stop) el actual | Must |
| RF-016 | Cliente Pro: maximo 5 proyectos activos simultaneos | Must |
| RF-017 | El sistema debe permitir pausar un proyecto (stop) — deja de consumir tokens pero se conserva su configuracion | Must |
| RF-018 | El sistema debe permitir reactivar un proyecto pausado | Must |
| RF-019 | El sistema debe permitir eliminar un proyecto permanentemente con confirmacion doble | Must |
| RF-020 | Cada proyecto es self-contained: al crearse, se genera una copia independiente de los agentes seleccionados (no referencia viva al catalogo) | Must |
| RF-021 | El sistema debe mostrar un listado de proyectos del usuario con estado (activo, pausado), fecha de creacion, cantidad de agentes y tokens consumidos | Must |

### EPIC-04 — Armado de Equipos

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-022 | Dentro de un proyecto, el usuario debe poder agregar agentes desde el catalogo al equipo | Must |
| RF-023 | El equipo de un proyecto puede tener un maximo de 20 subagentes | Must |
| RF-024 | El usuario debe poder quitar agentes del equipo de un proyecto | Must |
| RF-025 | El usuario debe poder seleccionar un equipo pre-armado completo (ej: Equipo GEN de 23 agentes — si excede 20, el sistema informa y permite elegir cuales incluir) | Should |
| RF-026 | Al agregar un agente al equipo, se crea una copia independiente que el usuario puede personalizar sin afectar el catalogo ni otros proyectos | Must |

### EPIC-05 — Personalizacion de Agentes

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-027 | El usuario debe poder generar un avatar personalizado para cada agente describiendo en texto como quiere que se vea (generacion via DALL-E) | Must |
| RF-028 | El usuario debe poder regenerar el avatar si no le gusta el resultado | Must |
| RF-029 | El usuario debe poder escribir/editar la bio del agente (texto libre) | Must |
| RF-030 | El sistema debe mostrar un CV visible del agente con sus skills, rol y capacidades (solo lectura, derivado del catalogo) | Must |
| RF-031 | El usuario debe poder seleccionar un preset de personalidad para el agente (ej: formal, amigable, directo, creativo) | Must |
| RF-032 | El sistema debe soportar estados emocionales dinamicos que cambian por contexto de la conversacion (ej: entusiasta cuando avanza bien, cauteloso ante riesgos) | Must |
| RF-033 | El creador del proyecto debe poder editar las reglas de estados emocionales | Must |
| RF-034 | El usuario debe poder configurar el estilo de comunicacion del agente (ej: verboso vs conciso, tecnico vs accesible, idioma de respuesta) | Must |

### EPIC-06 — Orquestacion

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-035 | El usuario debe poder definir la orquestacion del equipo en lenguaje natural (ej: "cuando el analista termine los requerimientos, que pase al arquitecto") | Must |
| RF-036 | El sistema debe ofrecer un formulario de reglas simples de handoff: agente origen, condicion, agente destino | Must |
| RF-037 | Los equipos pre-armados (tipo GEN) deben traer su orquestacion predefinida que el usuario puede usar tal cual o modificar | Must |
| RF-038 | Los agentes deben poder conversar entre si automaticamente segun la orquestacion definida, sin intervencion del usuario | Must |
| RF-039 | El usuario debe poder ver el log de conversaciones inter-agente en tiempo real | Should |
| RF-040 | El sistema debe permitir al usuario intervenir en cualquier momento de la conversacion inter-agente (override manual) | Should |

### EPIC-07 — Base de Conocimiento

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-041 | El usuario debe poder subir documentos (PDF, TXT, MD, DOCX) a un proyecto para que los agentes los consulten | Must |
| RF-042 | El sistema debe procesar y indexar los documentos para busqueda semantica | Must |
| RF-043 | Los agentes del proyecto deben poder consultar la base de conocimiento durante sus conversaciones | Must |
| RF-044 | El usuario debe poder eliminar documentos de la base de conocimiento | Must |
| RF-045 | El sistema debe mostrar el tamano total de la base de conocimiento y un limite por tier | Should |

### EPIC-08 — Deploy y Canales

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-046 | El sistema debe generar un widget embebible (iframe/web component) que el usuario puede insertar en su sitio web | Must |
| RF-047 | El sistema debe generar un snippet HTML/JS copiable para integrar el widget | Must |
| RF-048 | El sistema debe exponer una API publica REST documentada para interactuar con los agentes del proyecto | Must |
| RF-049 | La API debe requerir autenticacion via API key generada por proyecto | Must |
| RF-050 | El sistema debe permitir conectar un proyecto con un workspace de Slack (cuenta Streambe) para interactuar con los agentes via Slack | Must |
| RF-051 | El usuario debe poder ver el estado de cada canal de deploy (activo/inactivo) y desactivarlos individualmente | Should |
| RF-052 | El widget debe ser personalizable en colores y posicion basicos (marca del cliente) | Should |

### EPIC-09 — Conversacion y Runtime

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-053 | El sistema debe proveer un motor de ejecucion multi-agente que ejecute las conversaciones segun la orquestacion definida | Must |
| RF-054 | El usuario debe poder iniciar una conversacion con el equipo de agentes de su proyecto desde la plataforma | Must |
| RF-055 | El sistema debe enrutar mensajes del usuario al agente correspondiente segun la orquestacion | Must |
| RF-056 | Los agentes deben usar el modelo Anthropic Claude para generar respuestas | Must |
| RF-057 | El sistema debe registrar el historial completo de conversaciones por proyecto | Must |
| RF-058 | El sistema debe contabilizar los tokens consumidos por cada conversacion y acumularlos en el consumo mensual del proyecto | Must |
| RF-059 | El sistema debe detener la conversacion si el usuario alcanza su limite de tokens mensual (Free) o su tope de gasto configurado | Must |

### EPIC-10 — Dashboard del Cliente

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-060 | El cliente debe tener un dashboard con metricas de uso: tokens consumidos (diario, semanal, mensual), por proyecto y por agente | Must |
| RF-061 | El dashboard debe mostrar el costo acumulado del periodo actual y la proyeccion al cierre del mes | Must |
| RF-062 | El dashboard debe mostrar el historial de conversaciones con filtros por proyecto, fecha y agente | Must |
| RF-063 | El cliente debe poder configurar un tope de gasto mensual en USD. Al alcanzarlo, el sistema pausa los proyectos y notifica | Must |
| RF-064 | El dashboard debe mostrar el estado de la suscripcion: tier, tokens incluidos, tokens consumidos, overage acumulado | Must |
| RF-065 | El dashboard debe mostrar alertas cuando el consumo alcanza el 80% y 100% del limite | Should |

### EPIC-11 — Billing y Suscripciones

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-066 | El sistema debe integrar Stripe para gestion de suscripciones | Must |
| RF-067 | Tier Free: 1 proyecto activo, 100K tokens/mes. Al agotar tokens, se bloquea el uso hasta el proximo periodo. Sin cobro | Must |
| RF-068 | Tier Pro: USD 49/mes, 5 proyectos activos, 2M tokens incluidos. Overage: USD 15 por millon adicional | Must |
| RF-069 | Tier Enterprise: pricing custom, contactar a comercial. Formulario de contacto | Must |
| RF-070 | El sistema debe soportar multi-moneda: ARS y USD via Stripe | Must |
| RF-071 | El sistema debe generar invoices mensuales automaticos via Stripe | Must |
| RF-072 | El usuario debe poder upgrade/downgrade de tier desde la plataforma | Must |
| RF-073 | Al hacer downgrade de Pro a Free, si tiene mas de 1 proyecto activo, debe pausar los excedentes antes de confirmar | Must |
| RF-074 | El sistema debe permitir al cliente configurar un tope de gasto mensual maximo (aplica a overage Pro) | Must |

### EPIC-12 — Back Office Admin

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-075 | El panel Admin debe listar todos los clientes registrados con su tier, estado, fecha de registro, tokens consumidos | Must |
| RF-076 | El Admin debe poder suspender/reactivar una cuenta de cliente | Must |
| RF-077 | El Admin debe poder ver el dashboard de ingresos: MRR, ingresos por tier, overage total | Must |
| RF-078 | El Admin debe poder ver el costo total de API (tokens consumidos en Anthropic/DALL-E) y el margen | Must |
| RF-079 | El Admin debe poder ver todos los proyectos de cualquier cliente | Must |
| RF-080 | El Admin debe poder gestionar el catalogo de agentes: agregar, editar, desactivar agentes | Must |
| RF-081 | El Admin debe poder ver logs de actividad del sistema | Should |

### EPIC-13 — Seguridad y Aislamiento

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-082 | Cada proyecto debe estar aislado via Supabase RLS — un cliente no puede acceder a datos de otro | Must |
| RF-083 | El sistema debe implementar schemas por proyecto para aislamiento de datos | Must |
| RF-084 | El sistema debe cumplir GDPR basico: el usuario puede solicitar exportacion y eliminacion de sus datos | Must |
| RF-085 | Las API keys deben ser revocables por el usuario en cualquier momento | Must |
| RF-086 | El sistema debe sanitizar todo input del usuario antes de enviarlo al modelo IA (prevencion de prompt injection basica) | Must |
| RF-087 | Los documentos subidos deben almacenarse con cifrado at rest | Should |

---

## 6. Requerimientos No Funcionales

| ID | Categoria | Requerimiento |
|----|-----------|---------------|
| RNF-001 | Performance | Las respuestas de agentes deben iniciar streaming en menos de 2 segundos |
| RNF-002 | Performance | El dashboard debe cargar en menos de 3 segundos |
| RNF-003 | Performance | La generacion de avatar con DALL-E debe completarse en menos de 15 segundos |
| RNF-004 | Disponibilidad | 99.5% uptime mensual (excluyendo mantenimiento programado) |
| RNF-005 | Escalabilidad | El sistema debe soportar 100 usuarios concurrentes en MVP sin degradacion |
| RNF-006 | Escalabilidad | La arquitectura debe permitir escalar horizontalmente sin reescritura |
| RNF-007 | Seguridad | Todas las comunicaciones deben usar HTTPS/TLS |
| RNF-008 | Seguridad | Tokens y API keys nunca deben almacenarse en texto plano |
| RNF-009 | Seguridad | Rate limiting en todos los endpoints publicos |
| RNF-010 | Seguridad | Validacion y sanitizacion de toda entrada del usuario |
| RNF-011 | Usabilidad | La plataforma debe funcionar en Chrome, Firefox, Safari y Edge (ultimas 2 versiones) |
| RNF-012 | Usabilidad | Responsive design: desktop y tablet. Mobile: funcional pero no optimizado en MVP |
| RNF-013 | Observabilidad | Logging estructurado y error tracking (Sentry) |
| RNF-014 | Observabilidad | Metricas de consumo de tokens en tiempo real |
| RNF-015 | Idioma | Interfaz y agentes en espanol en MVP |
| RNF-016 | Mantenibilidad | Cobertura de tests 80% en logica de negocio critica |
| RNF-017 | Mantenibilidad | Documentacion de API publica con OpenAPI/Swagger |

---

## 7. User Stories con Criterios de Aceptacion

### EPIC-01 — Autenticacion y Onboarding

#### US-001: Registro de usuario

```
Como visitante,
quiero registrarme con mi email y password,
para poder crear proyectos con agentes IA.
```

```gherkin
Escenario: Registro exitoso
  Dado que estoy en la pagina de registro
  Cuando ingreso un email valido y un password de al menos 8 caracteres
  Y hago click en "Registrarme"
  Entonces se crea mi cuenta
  Y recibo un email de verificacion
  Y soy redirigido al wizard de onboarding

Escenario: Registro con email ya existente
  Dado que estoy en la pagina de registro
  Cuando ingreso un email que ya esta registrado
  Entonces veo un mensaje "Este email ya esta registrado"
  Y se me ofrece la opcion de iniciar sesion

Escenario: Registro con password debil
  Dado que estoy en la pagina de registro
  Cuando ingreso un password de menos de 8 caracteres
  Entonces veo un mensaje indicando los requisitos del password
  Y no se crea la cuenta
```

#### US-002: Login

```
Como usuario registrado,
quiero iniciar sesion con mi email y password,
para acceder a mis proyectos.
```

```gherkin
Escenario: Login exitoso
  Dado que estoy en la pagina de login
  Cuando ingreso mi email y password correctos
  Entonces soy redirigido a mi dashboard de proyectos

Escenario: Login con credenciales invalidas
  Dado que estoy en la pagina de login
  Cuando ingreso un password incorrecto
  Entonces veo un mensaje "Credenciales invalidas"
  Y permanezco en la pagina de login
```

#### US-003: Wizard de onboarding

```
Como usuario nuevo,
quiero ser guiado paso a paso para crear mi primer proyecto,
para entender como funciona la plataforma sin fricccion.
```

```gherkin
Escenario: Onboarding completo
  Dado que acabo de registrarme y es mi primer login
  Cuando el wizard se inicia
  Entonces un agente guia me pregunta que tipo de proyecto quiero crear
  Y me sugiere un equipo pre-armado adecuado
  Y me guia para personalizar al menos un agente
  Y me muestra como iniciar una conversacion con el equipo
  Y al finalizar tengo un proyecto funcional creado

Escenario: Skip del onboarding
  Dado que estoy en el wizard de onboarding
  Cuando hago click en "Saltar"
  Entonces soy redirigido al dashboard vacio
  Y puedo acceder al wizard desde un boton "Empezar tour"
```

### EPIC-03 — Gestion de Proyectos

#### US-004: Crear proyecto

```
Como cliente,
quiero crear un nuevo proyecto describiendo lo que necesito,
para que la plataforma me arme un equipo de agentes adecuado.
```

```gherkin
Escenario: Creacion conversacional de proyecto
  Dado que estoy en mi dashboard y tengo capacidad de proyectos disponible
  Cuando hago click en "Nuevo Proyecto"
  Entonces se abre una interfaz conversacional
  Y un agente me pregunta que quiero construir
  Y basado en mi respuesta sugiere un nombre, descripcion y equipo de agentes
  Y me pide confirmacion para crear el proyecto

Escenario: Limite de proyectos alcanzado (Free)
  Dado que soy cliente Free y tengo 1 proyecto activo
  Cuando intento crear un nuevo proyecto
  Entonces veo un mensaje "Debes pausar tu proyecto actual o hacer upgrade a Pro"
  Y se me ofrecen ambas opciones

Escenario: Limite de proyectos alcanzado (Pro)
  Dado que soy cliente Pro y tengo 5 proyectos activos
  Cuando intento crear un nuevo proyecto
  Entonces veo un mensaje "Alcanzaste el limite de 5 proyectos. Contacta a comercial para Enterprise o pausa un proyecto existente"
```

#### US-005: Pausar proyecto

```
Como cliente Free,
quiero pausar mi proyecto actual,
para poder crear uno nuevo sin perder la configuracion del anterior.
```

```gherkin
Escenario: Pausar proyecto exitosamente
  Dado que tengo un proyecto activo
  Cuando hago click en "Pausar proyecto"
  Y confirmo la accion
  Entonces el proyecto cambia a estado "Pausado"
  Y deja de consumir tokens
  Y sus canales de deploy se desactivan
  Y su configuracion y datos se conservan intactos

Escenario: Reactivar proyecto pausado
  Dado que tengo un proyecto pausado y capacidad disponible
  Cuando hago click en "Reactivar"
  Entonces el proyecto vuelve a estado "Activo"
  Y sus canales de deploy se reactivan
```

### EPIC-04 — Armado de Equipos

#### US-006: Agregar agentes al equipo

```
Como cliente,
quiero seleccionar agentes del catalogo para mi equipo,
para armar el equipo que necesito para mi proyecto.
```

```gherkin
Escenario: Agregar agente exitosamente
  Dado que estoy en la configuracion de mi proyecto
  Y mi equipo tiene menos de 20 agentes
  Cuando selecciono un agente del catalogo y hago click en "Agregar al equipo"
  Entonces se crea una copia independiente del agente en mi proyecto
  Y aparece en la lista de mi equipo con su avatar y rol
  Y puedo proceder a personalizarlo

Escenario: Limite de 20 agentes alcanzado
  Dado que mi equipo ya tiene 20 agentes
  Cuando intento agregar otro agente
  Entonces veo un mensaje "Limite de 20 agentes alcanzado. Quita un agente para agregar otro"

Escenario: Seleccionar equipo pre-armado
  Dado que estoy creando un proyecto
  Cuando selecciono el equipo pre-armado "Equipo GEN"
  Y el equipo tiene 23 agentes que exceden el limite de 20
  Entonces el sistema me informa que debo elegir 20 de los 23
  Y me muestra los 23 con su rol para que deseleccione 3
```

### EPIC-05 — Personalizacion de Agentes

#### US-007: Generar avatar con DALL-E

```
Como cliente,
quiero describir como quiero que se vea mi agente,
para darle una identidad visual unica.
```

```gherkin
Escenario: Generacion exitosa de avatar
  Dado que estoy editando un agente de mi proyecto
  Cuando escribo una descripcion del avatar (ej: "Un robot amigable con gafas y bata de laboratorio")
  Y hago click en "Generar Avatar"
  Entonces el sistema genera una imagen con DALL-E basada en mi descripcion
  Y la muestra como preview
  Y puedo aceptarla o regenerar con la misma o nueva descripcion

Escenario: Regenerar avatar
  Dado que el avatar generado no me gusta
  Cuando hago click en "Regenerar"
  Entonces se genera una nueva imagen con la misma descripcion
  Y puedo repetir el proceso sin limite
```

#### US-008: Configurar personalidad y estados emocionales

```
Como cliente,
quiero configurar la personalidad y los estados emocionales de mis agentes,
para que interactuen de una forma coherente con mi marca y proyecto.
```

```gherkin
Escenario: Seleccionar preset de personalidad
  Dado que estoy editando un agente
  Cuando selecciono el preset "Amigable" de la lista de presets
  Entonces el agente adopta el estilo de comunicacion definido por ese preset
  Y puedo ver un preview de como responderia el agente

Escenario: Configurar estados emocionales dinamicos
  Dado que estoy editando un agente
  Cuando defino una regla de estado emocional (ej: "Cuando el proyecto avanza bien, mostrarse entusiasta")
  Entonces el agente ajusta su tono dinamicamente segun el contexto de la conversacion
  Y puedo agregar, editar y eliminar reglas de estados emocionales

Escenario: Configurar estilo de comunicacion
  Dado que estoy editando un agente
  Cuando configuro "Nivel de detalle: conciso" y "Registro: tecnico"
  Entonces el agente responde de forma breve y tecnica en las conversaciones
```

### EPIC-06 — Orquestacion

#### US-009: Definir orquestacion en lenguaje natural

```
Como cliente,
quiero definir como trabajan juntos mis agentes escribiendo instrucciones en lenguaje natural,
para no tener que aprender un lenguaje de programacion.
```

```gherkin
Escenario: Orquestacion por lenguaje natural
  Dado que estoy en la configuracion de orquestacion de mi proyecto
  Cuando escribo "Cuando un usuario pide una nueva funcionalidad, el analista hace las preguntas, luego pasa al arquitecto, y despues al desarrollador"
  Entonces el sistema interpreta las instrucciones
  Y muestra un resumen estructurado del flujo (agente origen -> condicion -> agente destino)
  Y me pide confirmacion

Escenario: Orquestacion por formulario de reglas
  Dado que estoy en la configuracion de orquestacion
  Cuando uso el formulario para crear una regla: origen "Analista", condicion "Requerimientos completados", destino "Arquitecto"
  Entonces la regla se agrega a la lista de reglas de handoff
  Y puedo agregar mas reglas, editarlas o eliminarlas

Escenario: Equipo pre-armado con orquestacion predefinida
  Dado que seleccione un equipo pre-armado como "Equipo GEN"
  Cuando voy a la configuracion de orquestacion
  Entonces veo la orquestacion predefinida del equipo
  Y puedo modificarla o usarla tal cual
```

### EPIC-08 — Deploy y Canales

#### US-010: Generar widget embebible

```
Como cliente,
quiero obtener un widget para insertar en mi sitio web,
para que mis visitantes puedan interactuar con mis agentes.
```

```gherkin
Escenario: Generar snippet del widget
  Dado que mi proyecto tiene al menos un agente y orquestacion definida
  Cuando voy a la seccion "Deploy" y selecciono "Widget Web"
  Entonces el sistema genera un snippet HTML/JS copiable
  Y puedo copiar el codigo al portapapeles con un click
  Y el widget se activa inmediatamente al insertar el codigo en cualquier pagina web

Escenario: Personalizar widget
  Dado que estoy en la configuracion del widget
  Cuando cambio el color primario y la posicion (esquina inferior derecha/izquierda)
  Entonces el preview del widget se actualiza en tiempo real
  Y el snippet se regenera con los nuevos parametros
```

#### US-011: Conectar con Slack

```
Como cliente,
quiero conectar mi proyecto a un canal de Slack,
para interactuar con mis agentes desde Slack.
```

```gherkin
Escenario: Conexion exitosa con Slack
  Dado que estoy en la seccion "Deploy" de mi proyecto
  Cuando selecciono "Slack" y autorizo la conexion con el workspace
  Entonces los agentes del proyecto quedan disponibles en el canal de Slack configurado
  Y puedo interactuar con ellos mencionandolos o en DM
```

### EPIC-09 — Conversacion y Runtime

#### US-012: Conversar con el equipo de agentes

```
Como cliente,
quiero iniciar una conversacion con mi equipo de agentes desde la plataforma,
para que trabajen en mi proyecto.
```

```gherkin
Escenario: Iniciar conversacion
  Dado que mi proyecto tiene agentes configurados y orquestacion definida
  Cuando abro la interfaz de conversacion del proyecto
  Y escribo un mensaje (ej: "Necesito una landing page para mi producto")
  Entonces el sistema enruta mi mensaje al agente correspondiente segun la orquestacion
  Y el agente responde en streaming
  Y puedo ver a que agente estoy hablando

Escenario: Conversacion inter-agente
  Dado que un agente completo su tarea y la orquestacion define un handoff
  Cuando el agente origen termina
  Entonces automaticamente pasa el contexto al agente destino
  Y puedo ver el log de la conversacion inter-agente
  Y puedo intervenir en cualquier momento

Escenario: Limite de tokens alcanzado
  Dado que soy cliente Free y consumi 100K tokens este mes
  Cuando intento enviar un nuevo mensaje
  Entonces veo un mensaje "Alcanzaste tu limite de tokens mensual. Hace upgrade a Pro o espera al proximo periodo"
  Y no se procesa el mensaje
```

### EPIC-10 — Dashboard del Cliente

#### US-013: Ver metricas de uso

```
Como cliente,
quiero ver cuantos tokens consumi y cuanto me costo,
para controlar mis gastos.
```

```gherkin
Escenario: Dashboard con metricas
  Dado que estoy logueado y tengo al menos un proyecto
  Cuando accedo a mi dashboard
  Entonces veo los tokens consumidos del periodo actual (total y por proyecto)
  Y veo el costo acumulado y la proyeccion al cierre del mes
  Y veo el estado de mi suscripcion (tier, tokens incluidos, consumidos)
  Y veo alertas si estoy por encima del 80% de mi limite

Escenario: Configurar tope de gasto
  Dado que soy cliente Pro
  Cuando configuro un tope de gasto de USD 100/mes
  Y mi overage acumulado alcanza USD 100
  Entonces el sistema pausa automaticamente todos mis proyectos
  Y me envia una notificacion por email
  Y puedo reactivar aumentando el tope o esperando al proximo periodo
```

### EPIC-11 — Billing

#### US-014: Upgrade de tier

```
Como cliente Free,
quiero hacer upgrade a Pro,
para tener mas proyectos y tokens.
```

```gherkin
Escenario: Upgrade exitoso
  Dado que soy cliente Free
  Cuando selecciono "Upgrade a Pro"
  Y ingreso mi metodo de pago en Stripe
  Entonces mi cuenta se actualiza a Pro inmediatamente
  Y puedo crear hasta 5 proyectos
  Y mi limite de tokens pasa a 2M/mes
  Y recibo un email de confirmacion con el invoice

Escenario: Downgrade de Pro a Free
  Dado que soy cliente Pro con 3 proyectos activos
  Cuando selecciono "Cambiar a Free"
  Entonces el sistema me informa que debo pausar 2 proyectos antes de confirmar
  Y no permite el downgrade hasta que solo quede 1 proyecto activo
```

### EPIC-12 — Back Office

#### US-015: Gestion de clientes (Admin)

```
Como Admin Streambe,
quiero gestionar los clientes de la plataforma,
para asegurar el buen funcionamiento del servicio.
```

```gherkin
Escenario: Listar clientes
  Dado que estoy logueado como Admin
  Cuando accedo al panel de administracion
  Entonces veo la lista de todos los clientes con tier, estado, fecha de registro, tokens consumidos del periodo
  Y puedo filtrar por tier, estado y buscar por email/nombre

Escenario: Suspender cuenta
  Dado que estoy viendo el detalle de un cliente
  Cuando hago click en "Suspender cuenta" y confirmo
  Entonces la cuenta del cliente se suspende
  Y sus proyectos se pausan
  Y no puede iniciar sesion
  Y recibe un email de notificacion

Escenario: Ver metricas de negocio
  Dado que estoy en el dashboard Admin
  Cuando accedo a la seccion "Ingresos"
  Entonces veo el MRR total, desglosado por tier
  Y veo el costo total de APIs (Anthropic + DALL-E)
  Y veo el margen bruto
```

---

## 8. Integraciones

| Sistema | Tipo | Proposito | Detalle |
|---------|------|-----------|---------|
| **Anthropic Claude** | API | Modelo IA para respuestas de agentes | API de chat/completions con streaming. Contabilizacion de tokens in/out por request |
| **OpenAI DALL-E** | API | Generacion de avatares | API de image generation. Un request por generacion/regeneracion de avatar |
| **Stripe** | API + Webhooks | Billing, suscripciones, invoices | Checkout, customer portal, webhooks para eventos de pago. Multi-moneda ARS/USD |
| **Supabase** | BaaS | Auth, DB, Storage, RLS | Autenticacion (email + OAuth), Postgres con RLS, Storage para documentos/avatares |
| **Slack** | API (@slack/bolt) | Canal de deploy | Bot que conecta agentes del proyecto a canales de Slack. Cuenta Streambe |
| **Sentry** | SDK | Error tracking | Monitoreo de errores en frontend y backend |
| **Upstash** | API | Rate limiting y cache | Redis serverless para rate limiting de endpoints publicos |
| **Vercel** | Hosting | Deploy de la aplicacion | Frontend Next.js + API routes / serverless functions |

---

## 9. Diagramas de Flujo

### 9.1 Registro y Onboarding

```
[Visitante llega a landing]
         |
         v
   [Click "Registrarse"]
         |
         v
   [Ingresa email + password]
         |
    +----+----+
    |         |
  valido   invalido
    |         |
    v         v
 [Crear    [Mostrar
  cuenta]   error]
    |
    v
 [Email de verificacion]
    |
    v
 [Primer login]
    |
    v
 [Wizard de onboarding conversacional]
    |
    +-------+--------+
    |                |
  completa         skip
    |                |
    v                v
 [Proyecto      [Dashboard
  creado]        vacio]
```

### 9.2 Crear Proyecto

```
[Dashboard del cliente]
         |
         v
   [Click "Nuevo Proyecto"]
         |
    +----+----+
    |         |
  con       sin
  capacidad capacidad
    |         |
    v         v
 [Interfaz  [Mensaje:
  conversa-  pausar o
  cional]    upgrade]
    |
    v
 [Agente guia pregunta
  que quiere construir]
    |
    v
 [Usuario describe proyecto]
    |
    v
 [Sistema sugiere nombre,
  descripcion, equipo]
    |
    v
 [Usuario confirma o ajusta]
    |
    v
 [Proyecto creado con
  copias independientes
  de agentes]
    |
    v
 [Redirige a configuracion
  del proyecto]
```

### 9.3 Armar y Personalizar Equipo

```
[Configuracion del proyecto]
         |
         v
   [Catalogo de agentes]
         |
    +----+----+
    |         |
  individual equipo
    |       pre-armado
    v         |
 [Seleccionar v
  agente]   [Seleccionar equipo]
    |         |
    |    +----+----+
    |    |         |
    |  <=20      >20
    |    |         |
    |    v         v
    |  [Agregar  [Elegir cuales
    |   todos]    incluir (max 20)]
    |    |         |
    +----+---------+
         |
         v
   [Copias independientes
    creadas en el proyecto]
         |
         v
   [Para cada agente:]
    +----+----+----+
    |    |    |    |
   avatar bio pers estilo
    |    |    |    |
    v    v    v    v
  [DALL-E][texto][preset][config]
         |
         v
   [Equipo listo]
```

### 9.4 Deploy en Canales

```
[Proyecto con equipo y orquestacion]
         |
         v
   [Seccion "Deploy"]
         |
    +----+----+----+----+
    |    |    |         |
  Widget Snippet API   Slack
    |    |    |         |
    v    v    v         v
 [Config [Copiar [Generar [Autorizar
  color/  HTML/   API      workspace]
  pos]    JS]     key]      |
    |    |    |         v
    v    v    v      [Seleccionar
 [Preview][Listo] [Docs    canal]
    |              API]      |
    v                        v
 [Copiar snippet]        [Bot activo
                          en canal]
```

### 9.5 Billing

```
[Usuario en dashboard]
         |
         v
   [Seccion "Suscripcion"]
         |
    +----+----+
    |         |
  upgrade   downgrade
    |         |
    v         v
 [Stripe   [Verificar
  Checkout]  proyectos]
    |         |
    v    +----+----+
 [Pago   |         |
  OK]   <=1       >1
    |   activo   activos
    v     |         |
 [Tier    v         v
  actualizado]  [Pausar
    |           excedentes]
    v              |
 [Email +          v
  invoice]    [Confirmar
              downgrade]
                   |
                   v
              [Tier Free
               activo]

--- Flujo de overage (Pro) ---

[Tokens consumidos > 2M]
         |
         v
   [Calcular overage
    USD 15 / millon adicional]
         |
    +----+----+
    |         |
  < tope    >= tope
  gasto      gasto
    |         |
    v         v
 [Acumular [Pausar todos
  en        los proyectos]
  invoice]     |
               v
           [Notificar
            por email]
```

---

## 10. Tabla Scope MVP vs Fase 2

| Funcionalidad | MVP | Fase 2 |
|---------------|-----|--------|
| Registro email + password | Si | -- |
| OAuth (Google, GitHub) | Si | -- |
| Catalogo de agentes curado | Si | -- |
| Creacion de agentes desde cero | No | Si |
| Marketplace de equipos | No | Si |
| Proyectos (crear, pausar, eliminar) | Si | -- |
| Equipo de hasta 20 subagentes | Si | -- |
| Equipos pre-armados | Si | -- |
| Avatar DALL-E | Si | -- |
| Bio + CV + personalidad + estados | Si | -- |
| Estilo de comunicacion | Si | -- |
| Orquestacion lenguaje natural | Si | -- |
| Orquestacion formulario de reglas | Si | -- |
| Orquestacion editor visual flowchart | No | Si |
| Base de conocimiento (upload docs) | Si | -- |
| Widget embebible | Si | -- |
| Snippet HTML/JS | Si | -- |
| API publica REST | Si | -- |
| Slack | Si | -- |
| WhatsApp Business API | No | Si |
| Telegram | No | Si |
| Runtime multi-agente | Si | -- |
| Conversacion inter-agente | Si | -- |
| Dashboard cliente (metricas, costos) | Si | -- |
| Historial de conversaciones | Si | -- |
| Tope de gasto configurable | Si | -- |
| Stripe billing multi-moneda | Si | -- |
| Tiers Free / Pro / Enterprise | Si | -- |
| Invoices automaticos | Si | -- |
| Back office Admin Streambe | Si | -- |
| Back office roles Soporte y Finanzas | No | Si |
| RLS + schemas por proyecto | Si | -- |
| GDPR basico | Si | -- |
| SOC2 / HIPAA | No | Si |
| Idioma espanol | Si | -- |
| Idioma ingles | No | Si |
| Kubernetes | No | Si (cuando MRR justifique) |
| Wizard de onboarding | Si | -- |

---

## 11. Glosario

| Termino | Definicion |
|---------|-----------|
| **Agente** | Entidad IA con rol, skills, personalidad y capacidad de conversacion |
| **Catalogo** | Coleccion curada de agentes disponibles, gestionada por Streambe |
| **Equipo** | Conjunto de agentes asignados a un proyecto (max 20) |
| **Equipo pre-armado** | Equipo con composicion y orquestacion predefinida (ej: GEN) |
| **Proyecto** | Unidad principal de trabajo del cliente. Contiene equipo, orquestacion, base de conocimiento y canales |
| **Self-contained** | Los agentes de un proyecto son copias independientes, no referencias al catalogo |
| **Orquestacion** | Reglas que definen como los agentes se pasan trabajo entre si |
| **Handoff** | Transferencia de contexto de un agente a otro segun la orquestacion |
| **Widget** | Componente web embebible para interactuar con los agentes |
| **Overage** | Tokens consumidos por encima de los incluidos en el tier, facturados adicionalmente |
| **Tope de gasto** | Limite maximo mensual en USD configurado por el cliente |
| **RLS** | Row Level Security de Supabase, mecanismo de aislamiento de datos |
| **Token** | Unidad de procesamiento del modelo IA (input + output) |

---

## 12. Supuestos

1. Streambe mantiene y actualiza el catalogo de agentes periodicamente
2. La API de Anthropic Claude esta disponible y estable para produccion
3. Stripe soporta facturacion en ARS y USD simultaneamente
4. Los usuarios tienen acceso a un workspace de Slack para la integracion (cuenta Streambe)
5. La carga de documentos en la base de conocimiento se limita a formatos texto procesable (PDF, TXT, MD, DOCX)
6. El volumen inicial de usuarios en MVP no superara los 100 usuarios concurrentes
7. Los costos de API de Anthropic y DALL-E son absorbidos por Streambe y cubiertos por el pricing de los tiers

## 13. Dependencias

| Dependencia | Impacto |
|-------------|---------|
| API Anthropic Claude disponible | Sin ella no hay runtime de agentes |
| API OpenAI DALL-E disponible | Sin ella no hay generacion de avatares (feature degradable) |
| Cuenta Stripe configurada con multi-moneda | Sin ella no hay billing |
| Supabase proyecto configurado | Sin ella no hay auth, DB ni storage |
| Slack app aprobada en workspace Streambe | Sin ella no hay canal Slack |
| Dominio y DNS configurados | Sin ello no hay deploy publico |

## 14. Preguntas Abiertas

1. Limite de tamano de documentos en la base de conocimiento por tier (MB o cantidad de archivos)?
2. Politica de retencion de historial de conversaciones (indefinido o con limite temporal)?
3. Limite de requests/minuto en la API publica por tier?
4. Flujo exacto de Enterprise: formulario de contacto llega a donde (email, CRM, Slack)?
5. Cuando el tope de gasto se alcanza y se pausan proyectos, se pausan los canales de deploy (widget, Slack) o solo se bloquean nuevas conversaciones?

---

*Documento generado por Ada Lovelace — Analista Funcional, Equipo GEN*
*Pendiente de aprobacion del usuario para avanzar a fase de User Stories detalladas por epica*
