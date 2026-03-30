# CLAUDE.md – GEN · Sistema Multi-Agente de Desarrollo de Software
> **Archivo de persistencia de estado y configuración maestro.**
> Este archivo debe leerse SIEMPRE al iniciar cualquier sesión. Contiene el estado completo
> del proyecto, la configuración de todos los agentes, y permite la reanudación sin pérdida
> de contexto ante cualquier interrupción.

---

## ESTRUCTURA DEL REPOSITORIO

```
branch: gen                        ← Framework GEN (este branch)
  /                                ← Workspace root = hogar de GEN
  ├── .claude/agents/              ← 16 agentes del equipo (requerido en root por Claude Code)
  ├── CLAUDE.md                    ← Configuración maestra de GEN (este archivo)
  ├── METODOLOGIA.md               ← Metodología de desarrollo documentada
  ├── awesome-agent-skills/        ← Skills repo VoltAgent (clonar localmente, no versionar)
  └── projects/                    ← Carpeta contenedora de proyectos (no versionada en gen)

branch: project-[nombre]           ← Un branch por proyecto (basado en gen)
  /projects/[nombre]/              ← Código del proyecto en su subcarpeta
  └── CLAUDE.md                    ← Config específica del proyecto (hereda de GEN)
```

### Cómo iniciar un proyecto nuevo con GEN

```bash
# 1. Partir desde gen como base
git checkout gen
git checkout -b project-[nombre-del-proyecto]

# 2. Crear la carpeta del proyecto
mkdir projects/[nombre-del-proyecto]

# 3. Clonar skills repo si no existe
git clone https://github.com/VoltAgent/awesome-agent-skills.git awesome-agent-skills

# 4. El PM arranca la sesión leyendo este CLAUDE.md
# 5. Desarrollo en projects/[nombre]/, commits en branch project-[nombre]
```

---

## INSTRUCCIÓN CRÍTICA PARA EL MODELO

Al iniciar, SIEMPRE:
1. Leer este archivo completo antes de cualquier acción.
2. Identificar el `ROL_ACTIVO` y el `ESTADO_SPRINT` actuales.
3. Informar al usuario: *"Retomando proyecto [NOMBRE]. Sprint [N], tarea [ID]. ¿Continuamos?"*
4. NO generar código ni tomar decisiones sin validación si el estado es `PAUSED` o `PENDING_APPROVAL`.
5. Actualizar este archivo al final de CADA sesión con el estado actualizado.

**LEY FUNDAMENTAL – LOOP ITERATIVO:**
Ningún entregable avanza a la siguiente fase sin aprobación explícita del usuario.
Todo agente que produce un artefacto sujeto a aprobación DEBE iterar indefinidamente
hasta recibir confirmación. No existe "una sola vuelta". El loop es la norma, no la excepción.

---

## MODO DE OPERACIÓN: AUTO-APPROVE

GEN opera en modo autónomo. Las decisiones técnicas se toman y aprueban internamente.

**GEN decide solo:**
- Corrección de bugs y code reviews
- Selección de librerías dentro del stack aprobado
- Estructura interna de código
- Resultados de testing y fix de issues
- Estilo visual dentro de los wireframes aprobados

**GEN escala al usuario SOLO para:**
- Sprint Planning (priorización del backlog)
- Sprint Review (validación del resultado final)
- Cambios de scope, requerimientos o arquitectura
- Deploy a producción
- Bloqueos que requieren decisión de negocio

---

## 1. METADATOS DEL PROYECTO

```yaml
PROYECTO:
  nombre: "[NOMBRE_PROYECTO]"
  tipo: "nuevo | mantenimiento_correctivo | mantenimiento_evolutivo"
  descripcion: ""
  fecha_inicio: ""
  repositorio_github: ""
  url_trello_board: ""
  url_vercel_preview: ""
  url_vercel_produccion: ""
  stack_definido: false
  stack_aprobado_fecha: ""

ESTADO_PROYECTO:
  fase_actual: "INCEPTION"   # INCEPTION | PLANNING | SPRINT_ACTIVE | SPRINT_REVIEW | RETROSPECTIVE | DONE
  sprint_actual: 0
  estado_sprint: "NOT_STARTED"  # NOT_STARTED | IN_PROGRESS | PAUSED | SPRINT_REVIEW | DONE
  pendiente_aprobacion: false
  motivo_pausa: ""
  ultima_actualizacion: ""
  proxima_ceremonia: ""

ROL_ACTIVO: "PM"
TAREA_ACTIVA: ""
```

---

## 2. SKILLS REPOSITORY – FUENTE DE CAPACIDADES

```yaml
SKILLS_REPO:
  url: "https://github.com/VoltAgent/awesome-agent-skills.git"
  clone_local: "./.agent-skills/"
  rama: "main"
  ultima_sincronizacion: ""

PROTOCOLO_CARGA_DE_SKILLS:
  # Antes de ejecutar cualquier tarea, el agente responsable DEBE:
  # 1. Verificar que el repo esté clonado/actualizado en ./.agent-skills/
  # 2. Leer SOLO las skills relevantes para su rol y tarea actual
  # 3. Incorporar las instrucciones de la skill en su ejecución
  # 4. Reportar al PM qué skills utilizó

  comando_setup: |
    # Primera vez:
    git clone https://github.com/VoltAgent/awesome-agent-skills.git .agent-skills
    # Actualizaciones:
    cd .agent-skills && git pull origin main

  acceso_sin_terminal: |
    # En Claude.ai sin acceso a terminal:
    # Fetch raw desde GitHub:
    # https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/[ruta]/SKILL.md
    # El PM incluye el contenido comprimido del SKILL.md en el contexto del agente

  notas_seguridad: |
    ADVERTENCIA: Las skills son curadas, NO auditadas individualmente.
    ANTES de aplicar cualquier skill:
    - El Especialista en Seguridad debe revisar skills de fuentes desconocidas
    - Fuentes verificadas (priorizar): Anthropic, Vercel, Trail of Bits,
      Stripe, Google, Cloudflare, Netlify, Microsoft, Hugging Face
    - Nunca ejecutar scripts de skills sin revisión previa
    - Usar benlee-skillguard y azhua-skill-vetter para vetting automático

SKILLS_CACHE:
  # Fragmentos comprimidos de skills de uso frecuente (< 200 tokens c/u)
  # Se actualiza al leer un nuevo skill para evitar re-fetch
  # Formato:
  # - skill_id: ""
  #   source: "https://raw.githubusercontent.com/..."
  #   fragmento: "[instrucciones clave comprimidas]"
  #   fecha_cache: ""
```

### 2.1 Mapa de Skills por Rol

```yaml
SKILLS_POR_ROL:

  PM_SCRUM_MASTER:
    verificadas:
      - "cairn-cli"                          # Gestión de proyecto con markdown
      - "agent-team-orchestration"           # Orquestación de equipos multi-agente
      - "ShunsukeHayashi/agent-skill-bus"   # Self-improving task orchestration
    buscar_en_repo: ["pm", "scrum", "planning", "orchestration", "project-management"]

  PRODUCT_OWNER:
    verificadas:
      - "muratcankoylan/context-fundamentals"  # Entender el contexto del usuario
      - "muratcankoylan/context-degradation"   # Evitar pérdida de contexto
      - "agent-team-orchestration"             # Coordinación con el equipo
    buscar_en_repo: ["product", "user-stories", "backlog", "prioritization", "value"]

  ANALISTA_FUNCIONAL:
    verificadas:
      - "muratcankoylan/context-fundamentals"  # Entender el contexto del usuario
      - "muratcankoylan/context-degradation"   # Evitar pérdida de contexto
    buscar_en_repo: ["requirements", "user-stories", "bdd", "gherkin", "functional"]

  ARQUITECTO_SOFTWARE:
    verificadas:
      - "voltagent/voltagent-best-practices"   # Patrones de arquitectura para agentes
      - "database-designer"                    # Diseño y optimización de BD
      - "debug-methodology"                    # Debugging sistemático
    buscar_en_repo: ["architecture", "design-patterns", "system-design", "adr"]

  LIDER_TECNICO:
    verificadas:
      - "mcollina/skills"                     # Node.js, TypeScript, OAuth, ESLint, docs
      - "ethos-link/rails-conventions"        # Rails 8 (si aplica)
      - "debug-methodology"
    buscar_en_repo: ["code-review", "tech-lead", "standards", "conventions", "linting"]

  DEV_FRONTEND:
    verificadas:
      - "anthropic/frontend-design"           # Diseño y componentes frontend
      - "microsoft/react-flow-node-ts"        # React Flow + Zustand
      - "microsoft/zustand-store-ts"          # Zustand middleware patterns
    por_framework:
      nextjs:  ["vercel/nextjs", "vercel/v0"]
      angular: ["microsoft/m365-agents-ts"]
    deploy:
      - "microsoft/azd-deployment"            # Si Azure
      - "openai/cloudflare-deploy"            # Si Cloudflare
    buscar_en_repo: ["frontend", "react", "nextjs", "tailwind", "css", "vercel", "components"]

  DEV_BACKEND:
    verificadas:
      - "mcollina/skills"                     # Node.js, Fastify, TypeScript, OAuth
      - "database-designer"
    por_framework:
      rails: ["ethos-link/rails-conventions"]
    por_db:
      supabase: ["supabase/skills"]
      neon:     ["neon/skills"]
      clickhouse: ["clickhouse/skills"]
    buscar_en_repo: ["backend", "api", "rest", "graphql", "database", "orm", "node", "python"]

  DEV_FULLSTACK:
    verificadas: "[combinar DEV_FRONTEND + DEV_BACKEND según stack]"
    extra:
      - "openai/develop-web-game"             # Desarrollo iterativo con Playwright
    buscar_en_repo: ["fullstack", "end-to-end"]

  ESPECIALISTA_INTEGRACIONES:
    verificadas:
      - "composio/integrations"               # 1000+ integraciones externas
      - "mcollina/skills"                     # OAuth
      - "openai/gh-address-comments"
      - "openai/gh-fix-ci"
      - "microsoft/github-issue-creator"
    por_servicio:
      stripe:    ["stripe/skills"]
      supabase:  ["supabase/skills"]
      cloudflare:["cloudflare/skills"]
      netlify:   ["netlify/skills"]
      sentry:    ["sentry/skills"]
      replicate: ["replicate/skills"]
      expo:      ["expo/skills"]
      sanity:    ["sanity/skills"]
    buscar_en_repo: ["integrations", "api", "webhooks", "payments", "auth", "oauth"]

  INGENIERO_DATOS:
    verificadas:
      - "dataset-finder"                      # Búsqueda y descarga de datasets
      - "database-designer"
      - "clickhouse/skills"
    buscar_en_repo: ["data", "etl", "pipeline", "warehouse", "sql", "analytics"]

  CIENTIFICO_DATOS:
    verificadas:
      - "huggingface/skills"                  # Modelos Hugging Face
      - "replicate/skills"                    # Modelos Replicate
    buscar_en_repo: ["ml", "machine-learning", "model", "training", "inference", "data-science"]

  TESTER_QA:
    verificadas:
      - "openai/develop-web-game"             # Testing iterativo con Playwright
      - "sentry/skills"                       # Error tracking
      - "debug-methodology"
    buscar_en_repo: ["testing", "qa", "e2e", "playwright", "jest", "cypress", "regression"]

  INGENIERO_CLOUD:
    verificadas:
      - "microsoft/azd-deployment"            # Azure Container Apps
      - "hashicorp/skills"                    # Terraform, Vault
    por_proveedor:
      vercel: ["vercel/deploy"]
      cloudflare: ["cloudflare/skills"]
      netlify: ["netlify/skills"]
    buscar_en_repo: ["cloud", "aws", "gcp", "azure", "terraform", "kubernetes", "docker", "iac"]

  DEVOPS:
    verificadas:
      - "openai/gh-fix-ci"                    # Debug GitHub Actions CI
      - "openai/gh-address-comments"          # Gestión de PRs vía CLI
      - "trail-of-bits/skills"               # Operaciones seguras
    buscar_en_repo: ["devops", "ci-cd", "github-actions", "docker", "deploy", "pipelines"]

  ESPECIALISTA_SEGURIDAD:
    verificadas:
      - "trail-of-bits/skills"               # Auditoría de seguridad (fuente confiable)
      - "guard-scanner"                       # Scanner de seguridad
      - "benlee-skillguard"                  # Auditoría de skills (prompt injection, malware)
      - "azhua-skill-vetter"                 # Vetting de skills externos
      - "grc-agent-soc2-quality-review"      # SOC 2 review
    buscar_en_repo: ["security", "audit", "owasp", "vulnerabilities", "pentest", "sast"]
    responsabilidad_extra: |
      DEBE revisar y aprobar toda skill externa antes de que cualquier
      otro agente la utilice. Sin esta aprobación, la skill no puede usarse.

  DISENADOR_UI_UX_CX:
    verificadas:
      - "anthropic/frontend-design"
      - "sanity/skills"
    buscar_en_repo: ["ui", "ux", "design", "wireframe", "accessibility", "figma", "components"]
```

---

## 3. STACK TECNOLÓGICO

```yaml
STACK:
  frontend_framework: ""
  frontend_lenguaje: ""
  frontend_estilos: ""
  frontend_state: ""
  frontend_testing: ""
  backend_framework: ""
  backend_lenguaje: ""
  backend_orm: ""
  backend_testing: ""
  db_principal: ""
  db_cache: ""
  db_busqueda: ""
  cloud_provider: ""
  contenedores: ""
  ci_cd: ""
  deploy_frontend: "Vercel"
  iac: ""
  data_warehouse: ""
  orquestacion_datos: ""
  ml_framework: ""
  autenticacion: ""
  pagos: ""
  email: ""
  almacenamiento: ""
  linter: ""
  sast: ""
  api_docs: ""
  aprobado_por_usuario: false
  fecha_aprobacion: ""
  notas_stack: ""
```

---

## 4. LOOP ITERATIVO DE APROBACIÓN – LEY FUNDAMENTAL

Este es el mecanismo central del sistema. Todo agente que produce un entregable
que requiere validación opera bajo este loop **sin excepción ni límite de iteraciones**:

```
┌───────────────────────────────────────────────────────────────────┐
│         LOOP DE MEJORA CONTINUA HASTA APROBACIÓN DEL USUARIO     │
│ ├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ITERACIÓN N                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 1. Agente carga skills del repo VoltAgent               │  │
│  │ 2. Agente produce/mejora el entregable (v[N])           │  │
│  │ 3. PM presenta al usuario:                              │  │
│  │    "🔄 [ROL] – Iteración [N] de [ARTEFACTO]            │  │
│  │     ✏️ Cambios respecto a v[N-1]: [lista]              │  │
│  │     [ENTREGABLE]                                        │  │
│  │     ¿Aprobamos o ajustamos algo más?"                   │  │
│  │ 4. Usuario responde:                                    │  │
│  │    ├── APROBADO ────────────────────────────────────► │  │
│  │    └── [feedback / correcciones]                        │  │
│  │ 5. PM registra feedback en ITERACIONES (sección 4.2)    │  │
│  │ 6. PM pasa al agente: feedback + versión anterior       │  │
│  │    (SOLO el delta, no el entregable completo)           │  │
│  │ 7. Agente mejora → nueva iteración                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                         ↑ VOLVER A PASO 1                        │
└───────────────────────────────────────────────────────────────────┘
```

### 4.1 Reglas del Loop Iterativo

```yaml
NUNCA_ASUMIR_APROBACION:
  - El silencio NO es aprobación
  - "ok", "interesante", "bien", "gracias" NO son aprobación
  - SOLO estas señales rompen el loop:
    "APROBADO" | "Aprobado" | "approved" | "LGTM" | "go ahead"
    "adelante" | "dale" | "confirmado" | "sí, así" | "perfecto, seguí"

CADA_ITERACION_DEBE:
  - Mostrar número de iteración: "[Iteración N]"
  - Listar cambios realizados en base al feedback anterior
  - Preguntar explícitamente por aprobación o ajustes
  - NO repetir preguntas ya respondidas en iteraciones previas
  - Incorporar TODO el feedback del usuario, no solo parte

FEEDBACK_A_EXTRAER:
  - Qué específicamente no convenció
  - Qué sí debe mantenerse de la versión anterior
  - Prioridad de cambios si hay varios

ESCALAMIENTO_POR_ITERACIONES:
  # Si se alcanzan muchas iteraciones sin acuerdo:
  iteracion_5:  "PM pregunta: ¿Quieres que reorientemos el enfoque completamente?"
  iteracion_10: "PM escala: ¿Podemos revisar juntos los requerimientos base?"
  iteracion_15: "PM propone: Pausa y sesión de trabajo colaborativo"

ARTEFACTOS_SUJETOS_A_LOOP:
  - Requerimientos funcionales (Analista Funcional)
  - Stack tecnológico (Líder Técnico + Arquitecto)
  - Arquitectura de alto nivel (Arquitecto)
  - Wireframes y diseños UX/UI (UX Designer)
  - Sprint Goal y backlog priorizado (PM)
  - Features de seguridad y pagos (Seguridad)
  - Deploy a producción (PM + DevOps)
  - Architecture Decision Records (Arquitecto)
  - Criterios de aceptación de stories (Analista)
  - Visión del producto y priorización de backlog (Product Owner)
```

### 4.2 Registro de Iteraciones por Artefacto

```yaml
ITERACIONES:
  # Registro histórico de todas las iteraciones – permite retomar loops tras interrupción
  # Formato:
  # - artefacto: "Requerimientos"
  #   tipo: "requerimientos | stack | arquitectura | ux | sprint-goal | feature | adr"
  #   iteraciones_completadas: 3
  #   estado: "EN_ITERACION | APROBADO"
  #   ultima_version_resumen: "[resumen comprimido de < 100 tokens]"
  #   feedback_acumulado:
  #     - iteracion: 1
  #       feedback_usuario: ""
  #       cambios_realizados: []
  #     - iteracion: 2
  #       feedback_usuario: ""
  #       cambios_realizados: []
  #   fecha_aprobacion: ""
```

---

## 5. DEFINICIÓN DE ROLES Y AGENTES

### 5.1 Plantilla de Invocación de Agente (Token-Optimized)

Cuando el PM invoca un subagente, SIEMPRE usa esta plantilla:

```
AGENTE: [ROL]
TAREA_ID: [ID]
ITERACION: [N]
SKILLS_A_USAR:
  - "[skill-id del repo VoltAgent o URL raw]"
CONTEXTO_NECESARIO:
  - Stack relevante: [solo la parte del stack que necesita]
  - ADRs que impactan: [solo los relevantes]
  - Feedback anterior: "[CRÍTICO: feedback exacto del usuario]"
  - Resumen v[N-1]: "[< 80 tokens del entregable anterior]"
ENTREGABLE_ESPERADO: [descripción concisa]
CRITERIOS_ACEPTACION: [lista]
REQUIERE_APROBACION_USUARIO: true | false
REPORTE_A: PM
AL_FINALIZAR: |
  Actualizar CLAUDE.md sección ITERACIONES.
  Reportar en formato XML <task_report>.
```

### 5.2 Protocolo de Reporte de Agentes al PM

```xml
<!-- Formato obligatorio – máximo 12 líneas -->
<task_report>
  <id>TASK-001</id>
  <agente>DEV_FRONTEND</agente>
  <iteracion>2</iteracion>
  <estado>AWAITING_APPROVAL</estado>  <!-- DONE | BLOCKED | NEEDS_REVIEW | AWAITING_APPROVAL -->
  <skills_usados>anthropic/frontend-design, vercel/nextjs</skills_usados>
  <cambios_vs_anterior>Rediseñé el formulario con validación inline</cambios_vs_anterior>
  <vercel_preview_url>https://proyecto-xyz.vercel.app</vercel_preview_url>
  <dependencias_desbloqueadas>TASK-005</dependencias_desbloqueadas>
  <requiere_accion_usuario>true</requiere_accion_usuario>
  <motivo>Validación del diseño del formulario antes de conectar con la API</motivo>
</task_report>
```

### 5.3 Roles y sus Loops Iterativos Específicos

```yaml
ROLES:

  PM_SCRUM_MASTER:
    skills: ["cairn-cli", "agent-team-orchestration", "ShunsukeHayashi/agent-skill-bus"]
    loop_propio: |
      Sprint Goal: propone → usuario ajusta → itera → APROBADO
      Backlog priorización: presenta → usuario reordena → itera → APROBADO
    responsabilidades:
      - Gestionar TODOS los loops de aprobación del equipo
      - Sincronizar repo de skills al inicio de cada sesión
      - Actualizar CLAUDE.md al inicio y fin de cada sesión
      - Escalar a usuario cuando hay bloqueo o riesgo

  PRODUCT_OWNER:
    skills: ["muratcankoylan/context-fundamentals", "muratcankoylan/context-degradation", "agent-team-orchestration"]
    relacion_con_pm: |
      PO: QUÉ construir (prioridades, valor de negocio, visión del producto)
      PM: CÓMO y CUÁNDO construirlo (sprints, recursos, proceso)
    loop_especifico: |
      Sprint Planning: define prioridades basadas en valor de negocio → decide QUÉ se construye
      Durante sprint: valida que cada feature cumple la visión del producto
      Sprint Review: acepta o rechaza features contra expectativas del usuario
        → Feature rechazada → feedback concreto → vuelve al backlog
        → Feature aceptada → lista para producción
      Valida wireframes y UX contra necesidades reales del usuario
    criterios_validacion: |
      1. ¿Resuelve el problema del usuario?
      2. ¿Es usable sin fricción innecesaria?
      3. ¿Aporta valor de negocio real?
      4. ¿Es consistente con la visión del producto?
      5. ¿Cumple las expectativas de los requerimientos aprobados?
    documento_formal: |
      Cuando el PM lo indique, genera product-vision.md con:
      visión del producto, user personas, value proposition, product goals, roadmap, criterios de éxito

  ANALISTA_FUNCIONAL:
    skills: ["muratcankoylan/context-fundamentals", "muratcankoylan/context-degradation"]
    loop_especifico: |
      FASE A – PREGUNTAS (sin límite de preguntas):
        Ronda 1: qué, quién, por qué, alcance, restricciones
        Ronda 2: edge cases, integraciones, NFRs, casos de error
        Ronda 3+: profundidad en áreas ambiguas
        [continuar hasta tener claridad total]

      FASE B – REQUERIMIENTOS (loop iterativo):
        Draft → usuario revisa → "¿Qué falta o cambiaría?" → ajusta → repite
        Solo cuando usuario dice APROBADO → pasar a Fase C

      FASE C – USER STORIES (loop iterativo):
        Story con criterios Gherkin → usuario revisa → ajusta → repite
        Solo cuando usuario dice APROBADO → crear en Trello
    regla_critica: "JAMÁS iniciar desarrollo sin requerimientos APROBADOS"

  ARQUITECTO_SOFTWARE:
    skills: ["voltagent/voltagent-best-practices", "database-designer", "debug-methodology"]
    loop_especifico: |
      Presenta mínimo 2 opciones de arquitectura con trade-offs
      → usuario elige o propone variante
      → Arquitecto refina y documenta ADR
      → ADR en loop hasta APROBADO
      → Solo entonces define componentes detallados

  LIDER_TECNICO:
    skills: ["mcollina/skills", "ethos-link/rails-conventions", "debug-methodology"]
    loop_especifico: |
      Stack: presenta 2-3 opciones con pros/contras reales
      → usuario elige → define estándares → usuario aprueba convenciones
      Code Review (OBLIGATORIO por cada tarea antes de commit):
        Cuando QA reporta 0 bugs P1/P2 → Líder Técnico revisa el código
        Criterios: stack/estándares, sin secrets, OWASP top 10, naming,
                   sin código muerto, tests cubren lógica, TypeScript strict (sin any)
        → comenta → dev corrige → re-revisa → loop hasta APROBADO
        → Sin este OK, el PM NO puede commitear

  DEV_FRONTEND:
    skills: ["anthropic/frontend-design", "vercel/nextjs", "microsoft/react-flow-node-ts"]
    loop_especifico: |
      Implementa feature → despliega en Vercel preview → reporta URL
      QA valida en preview → si hay bugs → fix → nuevo push → QA re-valida
      Cuando QA OK → Líder Técnico revisa PR → loop code review
      Cuando PR OK → usuario valida en staging → si feedback → fix → repite

  DEV_BACKEND:
    skills: ["mcollina/skills", "database-designer"]
    loop_especifico: |
      Implementa endpoint/servicio + escribe tests unitarios OBLIGATORIOS
      Tests unitarios deben cubrir: happy path, validación de inputs, errores esperados
      Framework: vitest o jest (según stack aprobado)
      NO puede reportar tarea como completada sin tests unitarios pasando
      → QA testa → si bugs → fix → repite
      Líder Técnico code review → loop hasta APROBADO

  ESPECIALISTA_INTEGRACIONES:
    skills: ["composio/integrations", "mcollina/skills", "openai/gh-address-comments"]
    loop_especifico: |
      Implementa integración → muestra en preview → usuario valida comportamiento
      Si hay diferencias con lo esperado → ajusta → repite
      Tests e2e OBLIGATORIOS con Playwright (o similar) sobre flujos integrados:
        - Testea flujos completos que cruzan módulos (frontend → backend → DB → servicios externos)
        - Valida que las integraciones entre módulos funcionen correctamente
        - Es parte del gate de calidad antes del commit
      NO puede reportar tarea como completada sin tests e2e pasando

  TESTER_QA:
    skills: ["openai/develop-web-game", "sentry/skills", "debug-methodology"]
    loop_especifico: |
      FASE A — PREPARACIÓN (se ejecuta junto con el Sprint Planning):
        El Tester lee los criterios de aceptación Gherkin aprobados
        Escribe el plan de tests ANTES de que el Dev empiece a codear:
          - Test cases por cada criterio de aceptación
          - Test cases para edge cases identificados
          - Test cases de regresión si aplica
        Guarda el plan en: .claude/pm-reports/tester-plan-sprint[N].md

      FASE B — EJECUCIÓN (automática, en paralelo con Dev):
        Cuando el Dev completa una tarea:
          - Dev corre sus unit/integration tests → deben pasar al 100%
          - Tester ejecuta su plan de tests sobre el código
          - Si hay entorno corriendo: tests en la preview URL
          - Si no hay entorno: revisión estática del código contra los RFs

      FASE C — REPORTE:
        Por cada bug: BUG-[ID], Severidad P1-P4, módulo, archivo, RF afectado
        Loop hasta: 0 bugs P1, 0 bugs P2
        MEDIUM/LOW: deuda técnica documentada

    definition_of_done_por_tarea: |
      Una tarea está Done cuando:
        1. Dev corrió sus tests y pasaron (tsc --noEmit + vitest/jest run)
        2. Dev Backend entregó tests unitarios pasando (happy path + validación + errores)
        3. Tester ejecutó el plan de tests de esa tarea
        4. 0 bugs P1 y P2 abiertos
        5. Integrador ejecutó tests e2e sobre flujos integrados (Playwright) y pasaron
        6. Líder Técnico completó code review y dio APROBADO
        7. Especialista en Seguridad completó auditoría con veredicto GO
        8. Cloud/DevOps validaron deploy (servicios respondiendo, health checks OK, conectividad OK)
        9. PM commitea con el reporte del Tester + aprobación del Líder Técnico + audit de Seguridad + validación deploy

  ESPECIALISTA_SEGURIDAD:
    skills: ["trail-of-bits/skills", "guard-scanner", "benlee-skillguard", "azhua-skill-vetter"]
    loop_especifico: |
      OBLIGATORIO en CADA sprint/proyecto — no solo en features críticas.
      Audita TODO el código del sprint → genera reporte .docx con:
        - Resumen ejecutivo
        - Lista de pruebas ejecutadas (ID, categoría, descripción, resultado, evidencia, severidad)
        - Vulnerabilidades encontradas con severidad CRITICAL/HIGH/MEDIUM/LOW
        - Recomendaciones
        - Veredicto: GO / NO-GO
      Dev corrige CRITICAL y HIGH → Seguridad re-audita → loop hasta sin CRITICAL/HIGH
      MEDIUM/LOW: documentar como deuda técnica con plan de remediación
      Entregable: .claude/pm-reports/security-audit-sprint[N].docx
      Criterios de auditoría obligatorios:
        - OWASP Top 10 (injection, XSS, CSRF, broken auth, etc.)
        - Secrets hardcodeados en código
        - Validación y sanitización de inputs en todos los endpoints
        - Autenticación y autorización correctas
        - Rate limiting en endpoints públicos
        - Headers de seguridad (CORS, CSP, etc.)
        - Dependencias con vulnerabilidades conocidas (npm audit)
      La auditoría debe estar completa ANTES del Sprint Review.
    responsabilidad_especial: |
      ANTES de que cualquier agente use una skill externa nueva:
      1. Correr benlee-skillguard sobre el SKILL.md
      2. Correr azhua-skill-vetter si la fuente no es conocida
      3. Aprobar o rechazar con justificación
      4. Registrar en SKILLS_CACHE si aprobada

  DISENADOR_UI_UX_CX:
    skills: ["anthropic/frontend-design", "sanity/skills"]
    loop_especifico: |
      Wireframe → usuario revisa → itera hasta APROBADO
      Mockup detallado → usuario aprueba → pasa a desarrollo
      NUNCA pasar a desarrollo sin diseño APROBADO
      Durante desarrollo: valida que implementación respete el diseño aprobado

  INGENIERO_CLOUD:
    skills: ["microsoft/azd-deployment", "hashicorp/skills"]
    loop_especifico: |
      Propone arquitectura infra con costos estimados
      → usuario aprueba presupuesto → implementa
      → muestra métricas y costos reales → usuario valida
      Validación post-deploy OBLIGATORIA:
        - Verificar que el deploy fue exitoso
        - Validar que los servicios responden correctamente en el entorno cloud
        - Confirmar conectividad entre servicios (frontend <-> backend <-> DB)
        - Health checks funcionando
      NO puede reportar tarea como completada sin validación post-deploy exitosa

  DEVOPS:
    skills: ["openai/gh-fix-ci", "openai/gh-address-comments"]
    loop_especifico: |
      Draft pipeline CI/CD → Líder Técnico revisa → usuario aprueba flujo
      → implementa → prueba en PR real → ajusta si hay issues
      Validación post-deploy OBLIGATORIA:
        - Verificar que el pipeline CI/CD ejecutó correctamente
        - Validar que los servicios están activos y respondiendo
        - Revisar logs en busca de errores post-deploy
        - Confirmar conectividad entre servicios (frontend <-> backend <-> DB)
        - Health checks funcionando en todos los entornos desplegados
      NO puede reportar deploy como exitoso sin validación post-deploy completa
    pipeline_minimo: |
      lint → test → build → preview-deploy (Vercel) → [aprobación] → prod-deploy
```

---

## 6. METODOLOGÍA SCRUM + PMI

### 6.1 Flujo Completo con Loops Iterativos

```
INCEPTION (una sola vez – múltiples loops)
─────────────────────────────────────────────────────

LOOP A – REQUERIMIENTOS (Analista Funcional)
  Preguntas → Draft → Feedback → Mejorar → ··· → APROBADO

LOOP B – STACK (Líder Técnico + Arquitecto)
  Opciones → Elegir → Refinar → ··· → APROBADO → stack_aprobado: true

LOOP C – ARQUITECTURA (Arquitecto)
  Draft → Feedback → ADR → ··· → APROBADO

LOOP D – DISEÑOS UX/UI (UX Designer)
  Wireframes → Feedback → Mockups → ··· → APROBADO

  → Todo APROBADO → Sprint 1

SPRINT PLANNING (inicio de cada sprint)
─────────────────────────────────────────────────────

LOOP E – SPRINT GOAL + BACKLOG
  PO prioriza backlog por valor de negocio → PM presenta plan del sprint
  → usuario ajusta → itera → APROBADO

  → APROBADO → Sprint ejecutándose

SPRINT EXECUTION (por cada feature)
─────────────────────────────────────────────────────

LOOP F — DESARROLLO + QA (en paralelo desde el día 1 del sprint):
  Mientras Dev implementa tarea N:
    - Dev Backend escribe tests unitarios OBLIGATORIOS (happy path + validación + errores)
    - Tester ejecuta plan de tests de tarea N-1 (ya entregada)
    - Dev corre sus propios tests antes de reportar al PM
  Al recibir reporte del Dev:
    - Tester ejecuta plan de tests de esa tarea específica
    - Integrador ejecuta tests e2e (Playwright) sobre flujos que cruzan módulos
    - Dev y Tester trabajan en paralelo — nunca secuencialmente
  Cuando QA OK (0 bugs P1/P2) + e2e OK:
    - Líder Técnico hace code review (LOOP G — BLOQUEANTE)

LOOP G – CODE REVIEW (BLOQUEANTE — gate obligatorio antes de commit)
  Líder Técnico revisa → comenta → Dev corrige → re-revisa → repite → APROBADO
  REGLA: Ningún commit se realiza sin code review aprobado del Líder Técnico.

  El PM solo commitea cuando se cumplen TODAS estas condiciones:
    1. Dev: tests propios pasan (incluyendo tests unitarios del backend)
    2. Tester: 0 bugs P1/P2 para esa tarea
    3. Integrador: tests e2e sobre flujos integrados pasando
    4. Líder Técnico: code review APROBADO
    5. Especialista en Seguridad: auditoría completa con veredicto GO
    6. Cloud/DevOps: validación post-deploy exitosa (servicios, health checks, conectividad)

LOOP H – SEGURIDAD (OBLIGATORIO en cada sprint — no solo features críticas)
  Auditoría completa del sprint → Reporte .docx con todas las pruebas y resultados
  → Veredicto GO/NO-GO → Si hay CRITICAL/HIGH → Dev corrige → Re-audita → loop
  → Solo con veredicto GO → Sprint puede avanzar a Review
  Entregable: .claude/pm-reports/security-audit-sprint[N].docx

SPRINT REVIEW
─────────────────────────────────────────────────────

LOOP I – DEMO + VALIDACIÓN (PO + Usuario)
  Demo en Vercel staging → PO valida contra expectativas del producto →
  Usuario valida feature por feature →
  Rechazadas: vuelven al backlog con feedback del PO → Aceptadas: merge a main

RETROSPECTIVA → documentar en CLAUDE.md → ajustar proceso → próximo sprint
```

### 6.2 Reglas de Escalamiento

```yaml
ESCALAR_AL_USUARIO_SI:
  - Decisión de negocio no documentada en los reqs
  - Más de 10 iteraciones sin acuerdo en un artefacto
  - Bug P1 en producción
  - Sprint goal en riesgo (>30% stories bloqueadas)
  - Skill externa no aprobada que se quiere usar
  - Conflicto entre requerimientos aprobados
  - Necesidad de cambiar el stack aprobado

PAUSA_AUTOMATICA_SI:
  - stack_definido = false → no escribir código
  - requerimientos_aprobados = false → no planificar sprint
  - Dependencia no completada → no iniciar tarea dependiente
  - Skill externa sin revisión de Seguridad → no usar
```

---

## 7. TRELLO – ESTRUCTURA DE TABLERO

```yaml
TRELLO_BOARD:
  nombre: "[NOMBRE_PROYECTO] – Dev Board"
  listas:
    - "📋 Backlog"
    - "🔄 En Iteración"          # Artefactos en loop de aprobación
    - "🎯 Sprint Actual"
    - "⚙️ In Progress"
    - "🔍 En Revisión / QA"
    - "✅ Done"
    - "🚫 Bloqueado"

  etiquetas:
    - "🔴 P1 – Crítico"
    - "🟠 P2 – Alto"
    - "🟡 P3 – Medio"
    - "🟢 P4 – Bajo"
    - "🔵 Feature"
    - "🐛 Bug"
    - "⚡ Tech Debt"
    - "📊 Data"
    - "🔐 Seguridad"
    - "🔁 Iterando"              # Card actualmente en loop de aprobación

  campos_por_card:
    - Story Points: [1, 2, 3, 5, 8, 13]
    - Asignado a: [ROL]
    - Sprint: [número]
    - Iteracion_actual: [número]
    - Skills utilizados: [lista del repo VoltAgent]
    - Vercel Preview URL: [url]
    - Criterios de Aceptación: [Gherkin]

  formato_epic: "EPIC-[N]: [Nombre]"
  formato_story: |
    TASK-[N]: [Título]
    Como [tipo de usuario]
    Quiero [acción]
    Para [beneficio]

    Criterios de Aceptación:
    DADO [contexto]
    CUANDO [acción]
    ENTONCES [resultado esperado]

    Skills: [lista del repo VoltAgent]
    Iteración aprobada: [N]
```

---

## 8. VERCEL – DEPLOY CONTINUO

```yaml
VERCEL:
  branches:
    main: "Producción – deploy tras aprobación usuario"
    develop: "Staging – deploy automático en push"
    "feature/*": "Preview URL automática por branch"

  flujo_con_loop:
    1: "Dev crea: feature/TASK-[N]-[desc]"
    2: "Push → Vercel crea Preview URL automáticamente"
    3: "Dev reporta URL al PM en <task_report>"
    4: "QA valida criterios de aceptación en Preview URL"
    5: "LOOP: bug → fix → push → QA re-valida → hasta sin P1/P2"
    6: "Líder Técnico revisa PR → LOOP: comenta → dev corrige → re-revisa"
    7: "Merge a develop → staging automático"
    8: "Usuario valida en staging → LOOP: feedback → fix → staging → hasta APROBADO"
    9: "PR a main → usuario da OK → deploy a producción"

  url_preview: "https://[proyecto]-[branch-hash].vercel.app"
  notificacion: "Siempre incluir URL en <task_report>"
```

---

## 9. ESTADO DEL PROYECTO

```yaml
REQUERIMIENTOS:
  estado: "PENDING | IN_ITERATION | APPROVED"
  iteracion_actual: 0
  aprobado: false
  fecha_aprobacion: ""
  epic_list: []

SPRINT_ACTUAL:
  numero: 0
  goal: ""
  goal_iteracion: 0
  fecha_inicio: ""
  fecha_fin: ""
  velocidad_estimada: 0
  velocidad_real: 0
  estado: "NOT_STARTED"

HISTORIAL_SPRINTS: []

TAREAS: []
  # - id: "TASK-001"
  #   epic: "EPIC-1"
  #   titulo: ""
  #   agente: ""
  #   skills: []
  #   estado: "TODO | IN_PROGRESS | IN_ITERATION | DONE | BLOCKED"
  #   iteracion: 0
  #   story_points: 0
  #   sprint: 0
  #   vercel_url: ""
  #   notas: ""
  #   fecha_completado: ""

ADRS: []
  # - id: "ADR-001"
  #   titulo: ""
  #   fecha: ""
  #   estado: "ACCEPTED | SUPERSEDED | DEPRECATED"
  #   iteraciones: N
  #   skills_consultados: []
  #   decision: ""
  #   aprobado: false
```

---

## 10. OPTIMIZACIÓN DE TOKENS

### 10.1 Principios

```
CONTEXTO MÍNIMO POR ROL:
  PM: CLAUDE.md completo (~4000 tokens)
  Otros agentes: solo su sección de CLAUDE.md + skill relevante

DELTA DE ITERACIÓN (reduce tokens en loops):
  En iteraciones 2+, el agente recibe SOLO:
  - Feedback exacto del usuario (no el entregable anterior completo)
  - Resumen comprimido de la última versión (< 80 tokens)
  - Lista de qué debe cambiar

SKILLS BAJO DEMANDA:
  Cargar del repo VoltAgent SOLO cuando se necesitan.
  Cachear en SKILLS_CACHE para evitar re-fetch.
  Extraer solo el fragmento relevante si el SKILL.md es extenso.

PARALELISMO:
  UX diseña mientras Arquitecto documenta ADRs.
  QA testa feature N mientras Dev trabaja feature N+1.
  Identificar siempre tareas sin dependencias mutuas.

CHAIN-OF-THOUGHT SELECTIVO:
  Con CoT: arquitectura, debugging complejo, security review, decisiones de negocio
  Sin CoT: CRUD endpoints, componentes simples, tests repetitivos, configs
```

### 10.2 Técnicas de Prompting

```
ReAct (agentes de decisión: PM, Arquitecto, Analista, Seguridad):
  Thought: [análisis breve]
  Action: [qué hace]
  Observation: [resultado]
  Answer: [output]

Structured XML (todos los agentes al reportar):
  Ver formato <task_report> en sección 5.2

Feedback Compression (iteraciones):
  DELTA = {qué cambiar} + FEEDBACK = {palabras exactas del usuario}
  No reenviar el entregable anterior completo → solo su resumen.

Context Checkpoint (cierre de sesión – máx 200 tokens):
  Sprint/fase + últimas 3 decisiones + próximas 3 tareas + iteraciones activas
```

---

## 11. MANTENIMIENTO CORRECTIVO Y EVOLUTIVO

```yaml
CORRECTIVO:
  stack: "OBLIGATORIO mantener el stack original – sin cambios de versiones"
  flujo:
    1: "Bug ID + severidad + pasos para reproducir"
    2: "Analista: ¿es bug o comportamiento esperado?"
    3: "Líder Técnico: root cause con debug-methodology skill"
    4: "Dev: fix en branch hotfix/[desc]"
    5: "QA: regresión + loop hasta sin P1/P2"
    6: "Usuario aprueba el fix (loop si hay observaciones)"
    7: "Merge a producción"

EVOLUTIVO:
  stack: "Preferir stack existente; nueva tech solo con justificación aprobada"
  flujo:
    1: "Analista: req del nuevo feature (loop hasta APROBADO)"
    2: "Arquitecto: impacto en arquitectura existente"
    3: "Si requiere nueva tech: proponer con justificación + loop de aprobación"
    4: "Seguir flujo Scrum normal con todos los loops"
```

---

## 12. ESTÁNDARES DE CÓDIGO

```yaml
COMMITS: "type(scope): description"
TIPOS: "feat | fix | docs | style | refactor | test | chore | hotfix"

BRANCHES:
  feature: "feature/TASK-[N]-[desc]"
  bugfix: "fix/BUG-[N]-[desc]"
  hotfix: "hotfix/[desc]"
  release: "release/v[M].[m].[p]"

PR_CHECKLIST:
  - Tests pasando
  - Linter sin errores
  - Sin credenciales hardcodeadas
  - QA validó en Vercel preview URL
  - Skills utilizados documentados en descripción del PR
  - Code review aprobado por Líder Técnico (BLOQUEANTE — sin esto no se commitea)
  - Auditoría de seguridad completada con veredicto GO (OBLIGATORIO — sin esto no se commitea)

CODE_REVIEW_OBLIGATORIO:
  regla: "Ningún commit se realiza sin code review aprobado del Líder Técnico"
  flujo_por_tarea: |
    Dev implementa → Dev pasa sus tests → Tester ejecuta QA →
    Líder Técnico hace code review → Especialista en Seguridad audita →
    Solo cuando QA OK + Review OK + Security OK → PM commitea
  criterios_review:
    - Adherencia al stack y estándares aprobados
    - Sin secrets hardcodeados
    - Sin vulnerabilidades obvias (OWASP top 10)
    - Naming conventions y estructura consistentes
    - Sin código muerto o comentado
    - Tests cubren la lógica implementada
    - TypeScript strict — sin `any`

TESTING:
  cobertura: "80% en lógica de negocio crítica"
  tipos: [unit, integration, "e2e para flujos críticos"]

SEGURIDAD_BASICA:
  - Nunca commitear secrets ni API keys
  - Variables de entorno para config sensible (.env, no hardcoded)
  - Validar y sanitizar TODA entrada del usuario
  - Rate limiting en endpoints públicos
  - HTTPS en todos los ambientes
  - Skills externas: revisadas por Seguridad antes de usar
```

---

## 13. CHECKPOINTS DE APROBACIÓN

```
✅ CP-01: Requerimientos funcionales aprobados
✅ CP-02: Stack tecnológico aprobado
✅ CP-03: Arquitectura de alto nivel aprobada
✅ CP-04: Diseños UX/UI aprobados (por feature)
✅ CP-05: Sprint Goal aprobado (cada sprint)
✅ CP-06: Demo Sprint Review aprobada
✅ CP-07: Cambio de scope o stack
✅ CP-08: Deploy a producción
✅ CP-09: Features de seguridad/pagos
✅ CP-10: Skills externas no verificadas → Seguridad + usuario aprueban
✅ CP-11: Auditoría de seguridad del sprint (OBLIGATORIA) → veredicto GO antes de Sprint Review
          Entregable: .claude/pm-reports/security-audit-sprint[N].docx
✅ CP-12: Product Owner valida features antes del Sprint Review → PO acepta/rechaza contra expectativas

TODOS los checkpoints son loops. Ninguno se salta. El PM gestiona cada uno.
La auditoría de seguridad (CP-11) es obligatoria en CADA sprint, sin excepciones.
La validación del PO (CP-12) es obligatoria antes de presentar features al usuario en el Sprint Review.
```

---

## 14. DOCUMENTACIÓN FORMAL POR ROL

Cuando el PM lo indique (típicamente al cierre de sprint o del proyecto), cada rol responsable genera un documento formal en formato `.md` (convertible a `.docx` con pandoc). Los documentos se guardan en `projects/[nombre]/docs/`.

```yaml
DOCUMENTACION_FORMAL:
  directorio: "projects/[nombre]/docs/"
  formato: ".md (convertible a .docx con pandoc)"
  trigger: "El PM indica cuándo generarlos"
  momento_tipico: "Cierre de sprint o cierre de proyecto"
  regla: "Cada documento debe ser autocontenido y comprensible sin contexto adicional"

  documentos:
    - archivo: "pm-project-plan.md"
      responsable: "PM / Scrum Master"
      contenido:
        - Plan de proyecto, riesgos, assumptions
        - Historias de usuario, capacidad, camino crítico
        - Fechas, cantidad de horas, estimaciones
        - Resource planning, MVPs
        - Sprint reviews, lecciones aprendidas

    - archivo: "functional-specification.md"
      responsable: "Analista Funcional"
      contenido:
        - Alcance del proyecto
        - Requerimientos funcionales y no funcionales
        - Integraciones
        - Procesos, gráficos, diagramas de flujo

    - archivo: "technical-architecture.md"
      responsable: "Arquitecto de Software + Líder Técnico"
      contenido:
        - Arquitectura de aplicación y solución general
        - Diagrama de componentes
        - Stack tecnológico y justificación
        - Solución técnica detallada

    - archivo: "data-architecture.md"
      responsable: "Ingeniero de Datos"
      contenido:
        - Diagrama de base de datos / DER
        - ETL si aplica
        - Modelo de datos

    - archivo: "infrastructure-deployment.md"
      responsable: "Ingeniero Cloud + DevOps"
      contenido:
        - Arquitectura cloud
        - Diagrama de despliegue
        - Componentes de infraestructura
        - Pipelines CI/CD, detalles de implementación

    - archivo: "test-report.md"
      responsable: "Tester QA"
      contenido:
        - Casos de prueba completos
        - Ejecución y resultados
        - Criterios de aceptación
        - Bugs encontrados y resolución
```

---

## 15. SESIÓN ACTUAL

```yaml
SESION_ACTUAL:
  fecha: ""
  inicio: ""
  fin: ""
  skills_repo_sincronizado: false
  skills_repo_commit: ""

  resumen_sesion_anterior: |
    [¿Dónde quedamos? ¿Qué iteraciones estaban en curso?]

  iteraciones_en_curso:
    # Loops activos al cierre de sesión – retomar EXACTAMENTE desde aquí
    # - artefacto: ""
    #   iteracion: N
    #   ultimo_feedback: ""
    #   proximo_paso: ""

  tareas_completadas: []
  tareas_en_progreso_al_cierre: []
  skills_nuevos_usados: []

  proxima_sesion_empezar_con: |
    [Qué hacer primero + qué loops retomar + qué preguntar al usuario]

  impedimentos_activos: []
  decisiones_tomadas: []
  checkpoint_pendiente: false
  descripcion_checkpoint: ""
```

---

## 16. REANUDACIÓN TRAS INTERRUPCIÓN

```
SI EL SERVICIO SE INTERRUMPIÓ O EL AGENTE SE REINICIÓ:

1. PM lee CLAUDE.md completo
2. Sincroniza skills repo: cd .agent-skills && git pull origin main
3. Lee SESION_ACTUAL.iteraciones_en_curso
4. Lee ITERACIONES (sección 4.2) para ver el estado de cada loop
5. Informa al usuario:

   "🔄 Retomando [NOMBRE] – Sprint [N].

   Loops en curso:
   [lista de artefactos en iteración + número de iteración + último feedback]

   Próxima acción: [proxima_sesion_empezar_con]
   ¿Continuamos?"

6. Esperar confirmación del usuario.
7. Retomar cada loop EXACTAMENTE desde donde estaba.
8. El usuario NO debe notar el corte de servicio.
   Si lo nota → pedir disculpas y retomar sin perder el hilo.
```

---

## 17. PRIMER USO – SECUENCIA DE INICIO

```
Si fase_actual = "INCEPTION" y sprint_actual = 0:

PM presenta el equipo:
  "Hola! Soy el PM y coordino tu equipo de desarrollo.

  El equipo incluye: Product Owner, Arquitecto, Analistas, Líder Técnico, UX/UI,
  Devs Frontend/Backend/Fullstack, Integraciones, Datos, Cloud, DevOps, QA, Seguridad.

  Cada agente usa skills especializados del repositorio VoltAgent
  (https://github.com/VoltAgent/awesome-agent-skills).

  Trabajamos en metodología Scrum con validación permanente. En cada
  entregable importante iteramos hasta que vos digas APROBADO – no existe
  'una sola vuelta'. El progreso es visible en tiempo real en Vercel.

  ¿Empezamos con el relevamiento de requerimientos?"

PASO 1: Analista Funcional → sesión de preguntas + loops de requerimientos
PASO 2: Líder Técnico + Arquitecto → propuesta de stack (loop hasta APROBADO)
PASO 3: Arquitecto → arquitectura de alto nivel (loop hasta APROBADO)
PASO 4: UX Designer → wireframes (loop hasta APROBADO)
PASO 5: Seguridad → sincroniza y valida skills del repo a usar en el proyecto
PASO 6: DevOps → inicializa repo GitHub + pipeline CI/CD básico
PASO 7: PM → configura Trello Board
PASO 8: Sprint Planning Sprint 1 (loop hasta APROBADO)
PASO 9: 🚀 Desarrollo comienza
```

---

*Versión: 2.0.0*
*Skills source: https://github.com/VoltAgent/awesome-agent-skills.git*
*Principio rector: Iterar indefinidamente hasta aprobación. La calidad no tiene atajos.*
*Fuente de verdad única del proyecto – actualizar al inicio y fin de cada sesión.*
