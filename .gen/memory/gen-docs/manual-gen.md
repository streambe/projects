---
name: "Manual de Usuario GEN"
type: gen-doc
tags: [gen/docs, gen/manual]
created: "2026-04-01"
updated: "2026-04-03"
source: "manual-gen.docx (root)"
related: [[CLAUDE-md], [metodologia], [readme]]
---

# Manual de Usuario --- GEN: Sistema Multi-Agente de Desarrollo de Software

**Version:** 2.2.0\
**Fecha:** Abril 2026\
**Motor IA:** Claude Code (Anthropic)\
**Principio rector:** *Iterar indefinidamente hasta aprobacion. La calidad no tiene atajos.*

------------------------------------------------------------------------

## Tabla de Contenidos

1.  [Introduccion](#X171459956031b3c6019dbbfba7121b20723bf02)
2.  [Estructura del Repositorio](#X7279e2019d94801120ee3d314ba706a0ff6e850)
3.  [Como Iniciar un Proyecto Nuevo](#Xfc149a4bb935478afc216cedfe4b406aaf5d79c)
4.  [El Equipo: 23 Roles con Nombres de Cientificos](#Xdf61a114b9fa235e181164ccd40ad5beb90863f)
5.  [Ley Fundamental: Loop Iterativo de Aprobacion](#X66744208f4747968f821b10e6615294dc7a64f5)
6.  [Secuencia de Inception (Primer Uso)](#X3f663b927e7665fc1eed564f2a4a3f515508a69)
7.  [Ciclo de Vida del Sprint](#X0bec696d99a668534977bdb1fcf4ba0d1468bb2)
8.  [Documentacion Obligatoria](#Xb92851e50ee24c74ac6a6a7e994f9ffadc67e5d)
9.  [Checklist de Cierre de Sprint](#X9e404c174f005ff4af160bb6d15c817146186b6)
10. [Los 16 Checkpoints de Aprobacion](#Xcc2096f84d56a5aaf536ad9dbad0d0a4327129e)
11. [Reglas de Escalamiento](#Xf65c89a311661e718c4ada1094c12970f988475)
12. [Reporte de Consumo de Tokens](#X84f6afe1353c79f2b9cfee3ca40a02418ec476c)
13. [Sistema de Skills (VoltAgent)](#Xac7af0209ad018e52c9b74c4c07e40ed6b31730)
14. [Estandares de Codigo](#X5cba9d86093ea38a77dea1898836e05989e15a9)
15. [Flujo de Deploy con Vercel](#X56cf495104f58ed1c9092e8efe89a40c5363cf0)
16. [Tablero Trello](#X4c7284329e33d4b9aaa0951f166f98e1bc47049)
17. [Mantenimiento Correctivo y Evolutivo](#X89c4135bc67cf026fdd5e196606c3604a4b4c00)
18. [Reanudacion tras Interrupcion](#Xcfcb6b5e55b3cc642b681cb1c38b981f55f4abb)
19. [Optimizacion de Tokens](#Xaae39999972fdea27e22bb0dc8e4da4f622a0f3)

------------------------------------------------------------------------

## 1. Introduccion

GEN es un **Sistema Multi-Agente de Desarrollo de Software** que utiliza Claude Code (Anthropic) como motor de inteligencia artificial. Implementa una metodologia hibrida de **Scrum + PMI** con loops iterativos de aprobacion, garantizando que ningun entregable avance sin la validacion explicita del usuario.

GEN orquesta un equipo de 23 agentes especializados --- cada uno con un rol definido, un nombre de cientifico asignado y un color identificador --- que colaboran para llevar un proyecto de software desde la concepcion hasta la produccion.

### Caracteristicas Principales

- **Multi-agente:** 23 roles especializados operando bajo coordinacion del PM.
- **Iterativo:** Todo entregable pasa por un loop de mejora continua hasta recibir aprobacion explicita.
- **Documentado:** Cada sprint produce documentacion formal obligatoria en `.md` y `.docx`.
- **Trazable:** Estado completo del proyecto persistido en `CLAUDE.md` como fuente unica de verdad.
- **Skill-based:** Capacidades externas cargadas bajo demanda desde el repositorio VoltAgent.

------------------------------------------------------------------------

## 2. Estructura del Repositorio

GEN utiliza una estrategia de branching donde el framework vive en un branch y cada proyecto en su propio branch derivado.

    branch: gen                          ← Framework GEN (branch base)
      /
      ├── .claude/agents/                ← 15 agentes del equipo (requerido por Claude Code)
      ├── CLAUDE.md                      ← Configuracion maestra de GEN (fuente de verdad)
      ├── METODOLOGIA.md                 ← Metodologia de desarrollo documentada
      ├── awesome-agent-skills/          ← Skills repo VoltAgent (clonar localmente)
      └── projects/                      ← Carpeta contenedora de proyectos

    branch: project-[nombre]             ← Un branch por proyecto (basado en gen)
      /projects/[nombre]/                ← Codigo del proyecto
      ├── CLAUDE.md                      ← Config especifica del proyecto (hereda de GEN)
      └── docs/                          ← Documentacion formal obligatoria
          ├── acta-constitucion.md
          ├── functional-specification.md
          ├── technical-architecture.md
          ├── ux-wireframe.md
          ├── pm-project-plan.md
          ├── test-report.md
          ├── security-audit.md
          ├── deployment-guide.md
          ├── data-architecture.md
          ├── infrastructure-deployment.md
          ├── lecciones-aprendidas.md
          ├── token-usage-sprint[N].md
          ├── token-usage-total.md
          └── formal/word/               ← Versiones .docx generadas con pandoc

### Archivos Clave

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Archivo                     Proposito
  --------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  `CLAUDE.md` (raiz)          Configuracion maestra de GEN. Se lee al iniciar CADA sesion. Contiene estado del proyecto, roles, stack, iteraciones, y todo lo necesario para reanudar sin perdida de contexto.

  `METODOLOGIA.md`            Documento extendido de la metodologia de desarrollo.

  `.claude/agents/`           Definiciones de los agentes del equipo.

  `.claude/pm-reports/`       Reportes internos de sprint generados por cada agente.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Como Iniciar un Proyecto Nuevo

### Pasos Tecnicos

    # 1. Partir desde gen como base
    git checkout gen
    git checkout -b project-[nombre-del-proyecto]

    # 2. Crear la carpeta del proyecto
    mkdir projects/[nombre-del-proyecto]

    # 3. Clonar skills repo si no existe
    git clone https://github.com/VoltAgent/awesome-agent-skills.git awesome-agent-skills

    # 4. El PM arranca la sesion leyendo CLAUDE.md
    # 5. Desarrollo en projects/[nombre]/, commits en branch project-[nombre]

### Que Sucede al Iniciar

Al abrir Claude Code en el repositorio, el PM (Alan Turing) lee `CLAUDE.md`, detecta que el proyecto esta en fase `INCEPTION` con sprint 0, y presenta al equipo al usuario. A partir de ahi, se inicia la secuencia de Inception (ver seccion 6).

------------------------------------------------------------------------

## 4. El Equipo: 23 Roles con Nombres de Cientificos

Cada agente del equipo tiene un nombre de cientifico celebre y un color identificador. Esto facilita la comunicacion y el seguimiento visual.

  ------------------------------------------------------------------------------------
  \#              Rol                          Nombre                  Color
  --------------- ---------------------------- ----------------------- ---------------
  1               PM / Scrum Master            Alan Turing             Azul

  2               Product Owner                Marie Curie             Violeta

  3               Analista Funcional           Ada Lovelace            Celeste

  4               Arquitecto de Software       Nikola Tesla            Plateado

  5               Lider Tecnico                Linus Torvalds          Naranja

  6               Disenador UI/UX/CX           Leonardo Da Vinci       Rosa

  7               Dev Frontend                 Grace Hopper            Verde

  8               Dev Backend                  Dennis Ritchie          Marron

  9               Dev Fullstack                Tim Berners-Lee         Oliva

  10              Especialista Integraciones   Claude Shannon          Amarillo

  11              Ingeniero de Datos           Rosalind Franklin       Rojo

  12              Cientifico de Datos          Isaac Newton            Lavanda

  13              Ingeniero Cloud              Carl Sagan              Dorado

  14              DevOps                       Margaret Hamilton       Gris

  15              Tester QA                    Richard Feynman         Turquesa

  16              Especialista Seguridad       Hedy Lamarr             Negro

  17              Dev Frontend 2               Katherine Johnson       Esmeralda

  18              Dev Frontend 3               Emmy Noether            Jade

  19              Dev Backend 2                John von Neumann        Cobalto

  20              Dev Backend 3                Blaise Pascal           Bronce

  21              Tester QA 2                  Niels Bohr              Coral

  22              Tester QA 3                  Dorothy Hodgkin         Salmon

  23              Analista Funcional 2         Hypatia de Alejandria   Perla
  ------------------------------------------------------------------------------------

### Protocolo de Reporte entre Agentes

Todo agente reporta al PM en formato XML estandarizado:

    <task_report>
      <id>TASK-001</id>
      <agente>DEV_FRONTEND</agente>
      <iteracion>2</iteracion>
      <estado>AWAITING_APPROVAL</estado>
      <skills_usados>anthropic/frontend-design, vercel/nextjs</skills_usados>
      <cambios_vs_anterior>Redisene el formulario con validacion inline</cambios_vs_anterior>
      <vercel_preview_url>https://proyecto-xyz.vercel.app</vercel_preview_url>
      <dependencias_desbloqueadas>TASK-005</dependencias_desbloqueadas>
      <requiere_accion_usuario>true</requiere_accion_usuario>
      <motivo>Validacion del diseno del formulario antes de conectar con la API</motivo>
    </task_report>

Los estados posibles son: `DONE`, `BLOCKED`, `NEEDS_REVIEW`, `AWAITING_APPROVAL`.

------------------------------------------------------------------------

## 5. Ley Fundamental: Loop Iterativo de Aprobacion

Esta es la regla mas importante de GEN y no admite excepciones.

### Principio

> Ningun entregable avanza a la siguiente fase sin aprobacion explicita del usuario. Todo agente que produce un artefacto sujeto a aprobacion DEBE iterar indefinidamente hasta recibir confirmacion.

### Que Constituye Aprobacion

**NO son aprobacion:** silencio, "ok", "interesante", "bien", "gracias".

**SI son aprobacion (unicas senales que rompen el loop):**

  ------------------------------------------------------------
  Senal
  ------------------------------------------------------------
  `APROBADO` / `Aprobado`

  `approved` / `LGTM`

  `go ahead` / `adelante`

  `dale` / `confirmado`

  `si, asi` / `perfecto, segui`
  ------------------------------------------------------------

### Mecanica del Loop

    ITERACION N
      1. Agente carga skills necesarios del repo VoltAgent
      2. Agente produce o mejora el entregable (version N)
      3. PM presenta al usuario:
         "Iteracion [N] de [ARTEFACTO]
          Cambios respecto a v[N-1]: [lista]
          [ENTREGABLE]
          Aprobamos o ajustamos algo mas?"
      4. Usuario responde:
         ├── APROBADO → avanza a siguiente fase
         └── [feedback] → agente incorpora cambios → nueva iteracion

### Reglas por Iteracion

- Cada iteracion muestra su numero: `[Iteracion N]`.
- Lista los cambios realizados en base al feedback anterior.
- Pregunta explicitamente por aprobacion o ajustes.
- No repite preguntas ya respondidas.
- Incorpora TODO el feedback del usuario, no solo parte.

### Escalamiento por Iteraciones

  ----------------------------------------------------------------------------------------------
  Iteracion                      Accion del PM
  ------------------------------ ---------------------------------------------------------------
  5                              Pregunta: "Queres que reorientemos el enfoque completamente?"

  10                             Escala: "Podemos revisar juntos los requerimientos base?"

  15                             Propone: "Pausa y sesion de trabajo colaborativo"
  ----------------------------------------------------------------------------------------------

### Artefactos Sujetos al Loop

- Requerimientos funcionales
- Stack tecnologico
- Arquitectura de alto nivel
- Wireframes y disenos UX/UI
- Sprint Goal y backlog priorizado
- Features de seguridad y pagos
- Deploy a produccion
- Architecture Decision Records (ADRs)
- Criterios de aceptacion de stories

------------------------------------------------------------------------

## 6. Secuencia de Inception (Primer Uso)

Cuando un proyecto nuevo comienza (`fase_actual = INCEPTION`, `sprint_actual = 0`), GEN ejecuta la siguiente secuencia ordenada. Cada paso es un loop iterativo independiente que debe ser aprobado antes de avanzar al siguiente.

  -------------------------------------------------------------------------------------------------------------------------------------------------------
  Paso       Responsable                                                  Actividad                                      Gate
  ---------- ------------------------------------------------------------ ---------------------------------------------- --------------------------------
  1          Analista Funcional (Ada Lovelace)                            Sesion de preguntas + loop de requerimientos   APROBADO

  2          Lider Tecnico (Linus Torvalds) + Arquitecto (Nikola Tesla)   Propuesta de stack tecnologico                 APROBADO

  3          Arquitecto (Nikola Tesla)                                    Arquitectura de alto nivel + ADRs              APROBADO

  4          Disenador UI/UX (Leonardo Da Vinci)                          Wireframes                                     APROBADO

  5          Especialista Seguridad (Hedy Lamarr)                         Validar skills del repo a usar                 APROBADO

  6          PM (Alan Turing)                                             Plan de Trabajo completo                       APROBADO

  7          PM (Alan Turing)                                             **Acta de Constitucion del Proyecto**          **BLOQUEANTE**

  8          DevOps (Margaret Hamilton)                                   Inicializar repo GitHub + pipeline CI/CD       ---

  9          PM (Alan Turing)                                             Configurar Tablero Trello                      ---

  10         PM (Alan Turing)                                             Sprint Planning Sprint 1                       APROBADO

  11         Equipo completo                                              Desarrollo comienza                            Solo con Plan + Acta aprobados
  -------------------------------------------------------------------------------------------------------------------------------------------------------

### Detalle del Analista Funcional (Paso 1)

El Analista Funcional opera en tres fases:

- **Fase A --- Preguntas (sin limite):** Rondas de preguntas sobre que, quien, por que, alcance, restricciones, edge cases, integraciones, NFRs, casos de error, y profundidad en areas ambiguas.
- **Fase B --- Requerimientos (loop iterativo):** Draft de requerimientos, usuario revisa, ajusta, repite hasta APROBADO.
- **Fase C --- User Stories (loop iterativo):** Stories con criterios Gherkin, usuario revisa, ajusta, repite hasta APROBADO.

### Acta de Constitucion (Paso 7) --- Gate Bloqueante

Sin acta de constitucion aprobada, **NO se inicia desarrollo**. El flujo obligatorio es:

1.  PM recopila requerimientos aprobados.
2.  PM estima con el equipo (Arquitecto, Lider Tecnico, Devs).
3.  PM analiza prioridades, dependencias, riesgos.
4.  PM presenta el plan de trabajo completo al usuario (loop hasta APROBADO).
5.  PM genera el Acta de Constitucion.
6.  Acta se presenta al usuario (loop hasta APROBADO).
7.  Solo con acta aprobada se puede arrancar Sprint 1.

El acta contiene: nombre del proyecto, alcance (in/out scope), requerimientos resumidos, equipo asignado, plan de comunicacion, plan de trabajo, riesgos, criterios de exito, supuestos y restricciones, aprobaciones.

------------------------------------------------------------------------

## 7. Ciclo de Vida del Sprint

### Diagrama General

    SPRINT PLANNING
      PM propone Sprint Goal + Backlog → usuario aprueba (loop)
          ↓
    SPRINT EXECUTION (por cada feature)
      Dev implementa → Vercel preview → QA testa → Code Review → Security audit
      Cada paso es un loop hasta que no haya P1/P2 y el Lider Tecnico apruebe
          ↓
    PRE-SPRINT REVIEW (gate obligatorio)
      PM ejecuta checklist de cierre de sprint (ver seccion 9)
      Si falta documentacion → el sprint NO se cierra
          ↓
    SPRINT REVIEW
      Demo en Vercel staging → usuario valida feature por feature
      Rechazadas: vuelven al backlog con feedback
      Aceptadas: merge a main
          ↓
    RETROSPECTIVA
      Documentar en lecciones-aprendidas.md → actualizar CLAUDE.md

### Sprint Planning

El PM presenta el Sprint Goal y el backlog priorizado. El usuario puede reordenar, agregar o quitar stories. El loop continua hasta que el usuario apruebe.

### Sprint Execution

Por cada feature, el flujo es:

1.  **Desarrollo:** Dev implementa en branch `feature/TASK-[N]-[desc]`.
2.  **Preview:** Push genera URL de preview en Vercel automaticamente.
3.  **QA:** Tester valida criterios de aceptacion en la preview URL. Si hay bugs, se reportan con severidad P1-P4 y el dev corrige. Loop hasta 0 bugs P1 y P2.
4.  **Code Review:** Lider Tecnico revisa el PR. Loop de comentarios y correcciones hasta aprobacion.
5.  **Security Audit:** Para features criticas, el Especialista en Seguridad audita. Loop hasta sin vulnerabilidades CRITICAL/HIGH.

### Formato de Reporte de Bug

    BUG-[ID]: [Titulo]
    Severidad: P[1-4]
    URL: [Vercel preview]
    Steps: [pasos para reproducir]
    Expected: [comportamiento esperado]
    Actual: [lo que ocurre]

------------------------------------------------------------------------

## 8. Documentacion Obligatoria

Cada sprint debe producir o actualizar los siguientes documentos en `projects/[nombre]/docs/`. **Sin documentacion completa, el sprint NO se considera cerrado.**

  -----------------------------------------------------------------------------------------------------------------------------------------------------------
  \#    Archivo                          Responsable                                                  Cuando
  ----- -------------------------------- ------------------------------------------------------------ -------------------------------------------------------
  1     `acta-constitucion.md`           PM (Alan Turing)                                             Gate bloqueante antes de Sprint 1

  2     `functional-specification.md`    Analista Funcional (Ada Lovelace)                            Inception + cada cambio de scope

  3     `technical-architecture.md`      Arquitecto (Nikola Tesla) + Lider Tecnico (Linus Torvalds)   Inception + cada cambio de arquitectura

  4     `ux-wireframe.md`                Disenador UI/UX (Leonardo Da Vinci)                          Inception + nuevas pantallas

  5     `pm-project-plan.md`             PM (Alan Turing)                                             Inception + cierre de cada sprint

  6     `test-report.md`                 Tester QA (Richard Feynman)                                  Cierre de cada sprint

  7     `security-audit.md`              Especialista Seguridad (Hedy Lamarr)                         Cierre de cada sprint

  8     `deployment-guide.md`            Cloud (Carl Sagan) + DevOps (Margaret Hamilton)              Primer deploy + cada cambio de infra

  9     `data-architecture.md`           Ingeniero de Datos (Rosalind Franklin)                       Si hay BD o pipelines de datos

  10    `infrastructure-deployment.md`   Cloud + DevOps                                               Si hay infraestructura cloud

  11    `lecciones-aprendidas.md`        PM (Alan Turing)                                             Cierre de cada sprint

  12    `token-usage-sprint[N].md`       PM (Alan Turing)                                             Cierre de cada sprint

  13    `token-usage-total.md`           PM (Alan Turing)                                             Al cierre del proyecto (resumen de todos los sprints)
  -----------------------------------------------------------------------------------------------------------------------------------------------------------

### Versiones .docx

Todos los documentos `.md` deben tener una version `.docx` generada en `projects/[nombre]/docs/formal/word/`. El comando de conversion es:

    pandoc archivo.md -o archivo.docx

### Reportes Internos de Agentes

Ademas de la documentacion formal, cada agente genera reportes internos en `.claude/pm-reports/`:

- `functional-analyst-report.md`
- `software-architect-report.md`
- `tech-lead-report.md` / `tech-lead-review-sprint[N].md`
- `dev-frontend-report.md`
- `backend-developer-report.md`
- `tester-report-sprint[N].md` / `tester-plan-sprint[N].md`
- `security-audit-sprint[N].md`
- `ui-ux-designer-report.md`
- `devops-sprint[N]-report.md`
- `pm-sprint-[N]-planning.md`

------------------------------------------------------------------------

## 9. Checklist de Cierre de Sprint

El PM ejecuta este checklist de forma automatica antes de permitir el Sprint Review. Si alguno falla, el sprint **no se cierra**.

- [ ] Todos los documentos `.md` de la seccion 8 existen y estan actualizados
- [ ] Todas las versiones `.docx` generadas en `docs/formal/word/`
- [ ] 0 bugs P1 abiertos
- [ ] 0 bugs P2 abiertos
- [ ] Todos los criterios de aceptacion Gherkin validados por QA
- [ ] Auditoria de seguridad con veredicto **GO**
- [ ] Todos los PRs revisados y aprobados por el Lider Tecnico
- [ ] No hay secrets ni API keys en el codigo
- [ ] Linter limpio (sin errores)
- [ ] Todos los reportes de agentes generados en `.claude/pm-reports/`
- [ ] Reporte de consumo de tokens generado
- [ ] Sprint Review realizado con el usuario
- [ ] Retrospectiva documentada en `lecciones-aprendidas.md`
- [ ] `CLAUDE.md` actualizado con estado final del sprint

------------------------------------------------------------------------

## 10. Los 16 Checkpoints de Aprobacion

Todos los checkpoints son loops iterativos. Ninguno se puede saltar. El PM gestiona cada uno.

  --------------------------------------------------------------------------------------------------------
  CP         Descripcion                             Notas
  ---------- --------------------------------------- -----------------------------------------------------
  CP-01      Requerimientos funcionales aprobados    Analista Funcional lidera

  CP-02      Stack tecnologico aprobado              Lider Tecnico + Arquitecto

  CP-03      Arquitectura de alto nivel aprobada     Arquitecto lidera

  CP-04      Disenos UX/UI aprobados (por feature)   Disenador UX lidera

  CP-05      Sprint Goal aprobado (cada sprint)      PM lidera

  CP-06      Demo Sprint Review aprobada             PM + equipo

  CP-07      Cambio de scope o stack                 Requiere re-aprobacion

  CP-08      Deploy a produccion                     PM + DevOps + usuario

  CP-09      Features de seguridad/pagos             Seguridad valida

  CP-10      Skills externas no verificadas          Seguridad + usuario aprueban

  CP-11      **Acta de Constitucion aprobada**       **BLOQUEANTE** --- sin ella NO se inicia desarrollo

  CP-12      Auditoria de seguridad del sprint       Veredicto GO obligatorio antes del Sprint Review

  CP-13      Product Owner valida features           PO acepta/rechaza contra expectativas

  CP-14      Documentacion formal generada           Todos los docs de seccion 8 creados/actualizados

  CP-15      Deployment Guide documentado            Obligatorio en todo sprint con deploy

  CP-16      Lecciones aprendidas actualizadas       Actualizado al cierre de cada sprint
  --------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Reglas de Escalamiento

### Escalar al Usuario

Se escala al usuario cuando:

- Hay una decision de negocio no documentada en los requerimientos.
- Se alcanzan mas de 10 iteraciones sin acuerdo en un artefacto.
- Hay un bug P1 en produccion.
- El Sprint Goal esta en riesgo (mas del 30% de stories bloqueadas).
- Se quiere usar una skill externa no aprobada.
- Hay conflicto entre requerimientos aprobados.
- Se necesita cambiar el stack aprobado.

### Pausa Automatica

El sistema se pausa automaticamente cuando:

- `stack_definido = false` → no se puede escribir codigo.
- `requerimientos_aprobados = false` → no se puede planificar sprint.
- Una dependencia no esta completada → no se inicia la tarea dependiente.
- Una skill externa no fue revisada por Seguridad → no se puede usar.

### Escalar al CTO

Se escala al CTO (Fernando Farina, fernando.farina@streambe.com) cuando:

- Mas de 15 iteraciones sin acuerdo.
- Bloqueo tecnico que excede las capacidades de GEN.
- El usuario no responde.
- Conflictos de requerimientos irresolubles.
- Necesidad de recursos externos.
- Decisiones arquitectonicas criticas que necesitan validacion organizacional.
- Problemas de integracion con sistemas internos de Streambe.

------------------------------------------------------------------------

## 12. Reporte de Consumo de Tokens

GEN genera reportes de consumo de tokens para visibilidad de costos.

### Por Sprint

Al cierre de cada sprint se genera `token-usage-sprint[N].md` con:

- Tokens de entrada (input)
- Tokens de salida (output)
- Total de tokens
- Estimacion en USD

### Por Proyecto

Al cierre del proyecto se genera `token-usage-total.md` con:

- Tabla comparativa de todos los sprints
- Costo total acumulado

### Referencia de Precios (USD por 1M tokens)

  --------------------------------------------------------------
  Modelo               Input                Output
  -------------------- -------------------- --------------------
  Claude Opus 4        \$15                 \$75

  Claude Sonnet 4      \$3                  \$15

  Claude Haiku 4.5     \$0.80               \$4
  --------------------------------------------------------------

------------------------------------------------------------------------

## 13. Sistema de Skills (VoltAgent)

### Fuente

Las skills provienen del repositorio abierto de VoltAgent:\
**https://github.com/VoltAgent/awesome-agent-skills.git**

### Protocolo de Carga

1.  Verificar que el repo este clonado y actualizado en `.agent-skills/` o `awesome-agent-skills/`.
2.  Leer SOLO las skills relevantes para el rol y la tarea actual.
3.  Incorporar las instrucciones de la skill en la ejecucion.
4.  Reportar al PM que skills se utilizaron.

### Seguridad de Skills

El Especialista en Seguridad (Hedy Lamarr) **debe revisar y aprobar** toda skill externa antes de que cualquier otro agente la utilice. Las herramientas de vetting son:

- `benlee-skillguard` --- Auditoria de skills (prompt injection, malware).
- `azhua-skill-vetter` --- Vetting de skills de fuentes desconocidas.

Fuentes verificadas (priorizar): Anthropic, Vercel, Trail of Bits, Stripe, Google, Cloudflare, Netlify, Microsoft, Hugging Face.

### Skills por Rol (seleccion destacada)

  -------------------------------------------------------------------------------
  Rol                  Skills Verificadas
  -------------------- ----------------------------------------------------------
  PM / Scrum Master    cairn-cli, agent-team-orchestration

  Analista Funcional   muratcankoylan/context-fundamentals, context-degradation

  Arquitecto           voltagent/voltagent-best-practices, database-designer

  Lider Tecnico        mcollina/skills, debug-methodology

  Dev Frontend         anthropic/frontend-design, vercel/nextjs

  Dev Backend          mcollina/skills, database-designer

  Integraciones        composio/integrations

  Tester QA            openai/develop-web-game, sentry/skills

  Seguridad            trail-of-bits/skills, guard-scanner

  Cloud                microsoft/azd-deployment, hashicorp/skills

  DevOps               openai/gh-fix-ci, openai/gh-address-comments

  UX/UI                anthropic/frontend-design
  -------------------------------------------------------------------------------

Para la lista completa de skills por rol, consultar la seccion 2.1 de `CLAUDE.md`.

------------------------------------------------------------------------

## 14. Estandares de Codigo

### Commits

Formato: `type(scope): description`

Tipos permitidos:

  -----------------------------------------------------------------------------
  Tipo                           Uso
  ------------------------------ ----------------------------------------------
  `feat`                         Nueva funcionalidad

  `fix`                          Correccion de bug

  `docs`                         Documentacion

  `style`                        Formato, sin cambio de logica

  `refactor`                     Refactorizacion sin cambio de comportamiento

  `test`                         Tests

  `chore`                        Tareas de mantenimiento

  `hotfix`                       Correccion urgente en produccion
  -----------------------------------------------------------------------------

### Branches

  -------------------------------------------------------------
  Tipo                           Formato
  ------------------------------ ------------------------------
  Feature                        `feature/TASK-[N]-[desc]`

  Bugfix                         `fix/BUG-[N]-[desc]`

  Hotfix                         `hotfix/[desc]`

  Release                        `release/v[M].[m].[p]`
  -------------------------------------------------------------

### Checklist de Pull Request

- Tests pasando
- Linter sin errores
- Sin credenciales hardcodeadas
- QA valido en Vercel preview URL
- Skills utilizados documentados en descripcion del PR
- Aprobado por Lider Tecnico
- Aprobado por Seguridad (si feature critica)

### Testing

- **Cobertura:** 80% en logica de negocio critica.
- **Tipos:** unit, integration, e2e para flujos criticos.

### Seguridad Basica

- Nunca commitear secrets ni API keys.
- Variables de entorno para config sensible (`.env`, no hardcoded).
- Validar y sanitizar TODA entrada del usuario.
- Rate limiting en endpoints publicos.
- HTTPS en todos los ambientes.
- Skills externas revisadas por Seguridad antes de usar.

------------------------------------------------------------------------

## 15. Flujo de Deploy con Vercel

### Estrategia de Branches

  ------------------------------------------------------------------------------
  Branch               Ambiente             Comportamiento
  -------------------- -------------------- ------------------------------------
  `main`               Produccion           Deploy tras aprobacion del usuario

  `develop`            Staging              Deploy automatico en cada push

  `feature/*`          Preview              URL automatica por branch
  ------------------------------------------------------------------------------

### Flujo Completo

    1. Dev crea branch: feature/TASK-[N]-[desc]
    2. Push → Vercel crea Preview URL automaticamente
    3. Dev reporta URL al PM en <task_report>
    4. QA valida criterios de aceptacion en Preview URL
    5. LOOP: bug → fix → push → QA re-valida → hasta sin P1/P2
    6. Lider Tecnico revisa PR → LOOP: comenta → dev corrige → re-revisa
    7. Merge a develop → staging automatico
    8. Usuario valida en staging → LOOP: feedback → fix → staging → hasta APROBADO
    9. PR a main → usuario da OK → deploy a produccion

------------------------------------------------------------------------

## 16. Tablero Trello

### Estructura de Listas

  ---------------------------------------------------------------------
  Lista                          Proposito
  ------------------------------ --------------------------------------
  Backlog                        Stories pendientes de planificacion

  En Iteracion                   Artefactos en loop de aprobacion

  Sprint Actual                  Stories comprometidas para el sprint

  In Progress                    Stories en desarrollo activo

  En Revision / QA               Stories esperando validacion

  Done                           Stories completadas y aprobadas

  Bloqueado                      Stories con impedimentos
  ---------------------------------------------------------------------

### Etiquetas

  -------------------------------------------------------------
  Etiqueta                       Uso
  ------------------------------ ------------------------------
  P1 --- Critico                 Rojo

  P2 --- Alto                    Naranja

  P3 --- Medio                   Amarillo

  P4 --- Bajo                    Verde

  Feature                        Azul

  Bug                            Icono bug

  Tech Debt                      Rayo

  Data                           Grafico

  Seguridad                      Candado

  Iterando                       Card en loop de aprobacion
  -------------------------------------------------------------

### Campos por Card

- **Story Points:** 1, 2, 3, 5, 8, 13
- **Asignado a:** \[ROL\]
- **Sprint:** \[numero\]
- **Iteracion actual:** \[numero\]
- **Skills utilizados:** \[lista\]
- **Vercel Preview URL:** \[url\]
- **Criterios de Aceptacion:** \[Gherkin\]

### Formato de Story

    TASK-[N]: [Titulo]
    Como [tipo de usuario]
    Quiero [accion]
    Para [beneficio]

    Criterios de Aceptacion:
    DADO [contexto]
    CUANDO [accion]
    ENTONCES [resultado esperado]

    Skills: [lista del repo VoltAgent]
    Iteracion aprobada: [N]

------------------------------------------------------------------------

## 17. Mantenimiento Correctivo y Evolutivo

### Correctivo

Se mantiene el stack original **sin cambios de versiones**.

1.  Bug ID + severidad + pasos para reproducir.
2.  Analista: determina si es bug o comportamiento esperado.
3.  Lider Tecnico: root cause con `debug-methodology` skill.
4.  Dev: fix en branch `hotfix/[desc]`.
5.  QA: regresion + loop hasta sin P1/P2.
6.  Usuario aprueba el fix (loop si hay observaciones).
7.  Merge a produccion.

### Evolutivo

Se prefiere el stack existente; nueva tecnologia solo con justificacion aprobada.

1.  Analista: relevamiento de requerimientos del nuevo feature (loop hasta APROBADO).
2.  Arquitecto: analisis de impacto en arquitectura existente.
3.  Si requiere nueva tecnologia: propuesta con justificacion + loop de aprobacion.
4.  Se sigue el flujo Scrum normal con todos los loops.

------------------------------------------------------------------------

## 18. Reanudacion tras Interrupcion

Si el servicio se interrumpe o el agente se reinicia, el protocolo es:

1.  PM lee `CLAUDE.md` completo.
2.  Sincroniza skills repo: `cd .agent-skills && git pull origin main`.
3.  Lee `SESION_ACTUAL.iteraciones_en_curso`.
4.  Lee la seccion `ITERACIONES` para ver el estado de cada loop.
5.  Informa al usuario:

<!-- -->

    Retomando [NOMBRE] – Sprint [N].

    Loops en curso:
    [lista de artefactos en iteracion + numero de iteracion + ultimo feedback]

    Proxima accion: [lo que corresponda]
    Continuamos?

6.  Espera confirmacion del usuario.
7.  Retoma cada loop EXACTAMENTE desde donde estaba.
8.  El usuario **no debe notar** el corte de servicio.

------------------------------------------------------------------------

## 19. Optimizacion de Tokens

GEN implementa varias estrategias para minimizar el consumo de tokens sin sacrificar calidad.

### Contexto Minimo por Rol

- **PM:** recibe `CLAUDE.md` completo (\~4000 tokens).
- **Otros agentes:** reciben solo su seccion de `CLAUDE.md` + la skill relevante.

### Delta de Iteracion

En iteraciones 2+, el agente recibe **solamente**:

- Feedback exacto del usuario (no el entregable anterior completo).
- Resumen comprimido de la ultima version (menos de 80 tokens).
- Lista de que debe cambiar.

### Skills Bajo Demanda

- Cargar del repo VoltAgent SOLO cuando se necesitan.
- Cachear en `SKILLS_CACHE` para evitar re-fetch.
- Extraer solo el fragmento relevante si el `SKILL.md` es extenso.

### Paralelismo

- UX disena mientras Arquitecto documenta ADRs.
- QA testa feature N mientras Dev trabaja feature N+1.
- Identificar siempre tareas sin dependencias mutuas.

### Chain-of-Thought Selectivo

  -----------------------------------------------------------------
  Con CoT (razonamiento explicito)   Sin CoT (ejecucion directa)
  ---------------------------------- ------------------------------
  Arquitectura                       CRUD endpoints

  Debugging complejo                 Componentes simples

  Security review                    Tests repetitivos

  Decisiones de negocio              Configuraciones
  -----------------------------------------------------------------

### Tecnicas de Prompting Usadas

- **ReAct:** para agentes de decision (PM, Arquitecto, Analista, Seguridad).
- **XML Estructurado:** para reportes entre agentes.
- **Feedback Compression:** en iteraciones, se envia solo el delta + feedback exacto del usuario.
- **Context Checkpoint:** al cierre de sesion, resumen de maximo 200 tokens con estado, decisiones y proximas tareas.

------------------------------------------------------------------------

## Apendice: Glosario

  -------------------------------------------------------------------------------------------------------
  Termino                     Definicion
  --------------------------- ---------------------------------------------------------------------------
  **GEN**                     Sistema Multi-Agente de Desarrollo de Software

  **Loop Iterativo**          Ciclo de mejora continua sobre un entregable hasta aprobacion del usuario

  **Gate Bloqueante**         Checkpoint que impide avanzar sin aprobacion

  **Skill**                   Capacidad especializada cargada desde el repo VoltAgent

  **ADR**                     Architecture Decision Record --- registro de decisiones de arquitectura

  **Gherkin**                 Formato DADO/CUANDO/ENTONCES para criterios de aceptacion

  **Preview URL**             URL de Vercel generada automaticamente por branch para validacion

  **Sprint**                  Ciclo de desarrollo iterativo (tipicamente 1-2 semanas)

  **CLAUDE.md**               Archivo de configuracion maestra y fuente unica de verdad del proyecto

  **P1-P4**                   Niveles de severidad de bugs (P1 = critico, P4 = bajo)
  -------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

*Este manual corresponde a GEN version 2.2.0. Para la configuracion tecnica detallada, consultar el archivo* `CLAUDE.md` *en la raiz del repositorio.*
