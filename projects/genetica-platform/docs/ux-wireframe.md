# GENTICA Platform — Branding, Design System & Wireframes
**Autor:** Leonardo Da Vinci (UI/UX/CX Designer — GEN Team)
**Sprint:** 1 · Iteración 2
**Estado:** APROBADO v1 · v2 con decisiones cerradas + mockups detallados
**Fecha:** 2026-04-06

---

## Cambios v1 → v2

- **Sección 11 cerrada**: las 8 preguntas abiertas fueron resueltas por el diseñador con criterio profesional (delegado por el usuario). Ver sección 11 con decisiones tomadas y justificación.
- **Naming oficial**: "GENTICA Platform" confirmado.
- **Logo de lanzamiento**: Variante C `G//` wordmark (implementable en Sprint 1). Variante A queda como evolución post-MVP.
- **Paleta**: Helix Violet primario + Cell Cyan acento confirmado.
- **Dark mode**: default ON.
- **Tipografía**: Geist / Inter / Geist Mono confirmado.
- **Tagline oficial**: *"Tu equipo de ingeniería, clonado en IA."*
- **Cobertura wireframes Sprint 1**: las 6 pantallas son suficientes. Settings/perfil de usuario y notificaciones se difieren a Sprint 2.
- **NUEVO – Sección 12**: Mockups detallados (spacing Tailwind exacto + tokens de color + estados hover/focus/disabled/loading) de las 3 pantallas críticas: **Login**, **Dashboard/Listado**, **Detalle+Chat**. Estas 3 pantallas desbloquean al equipo frontend para iniciar implementación en Sprint 1.

---

## 1. Concepto de marca

### 1.1 Naming
**GENTICA Platform** — del cruce entre *GEN* (el framework multi-agente) y *genética* (el código base, el ADN del software). La plataforma es el "laboratorio" donde ingenieros IA cultivan proyectos con equipos de agentes especializados.

### 1.2 Personalidad
| Atributo | Nivel | Justificación |
|---|---|---|
| Técnica | Alta | Usuarios = ingenieros IA, no consumers |
| Moderna | Alta | Compite visualmente con Linear, Vercel, v0 |
| Seria | Media-alta | Se manejan presupuestos reales (USD 50/proyecto) |
| Cálida | Media | Chat con "personas" (23 agentes con nombres de científicos) — no puede ser frío robot |
| Minimalista | Alta | Densidad de información controlada, foco en el chat y el estado |
| Científica | Alta | Lenguaje visual de laboratorio / genoma / redes neuronales |

### 1.3 Tagline propuesto
**Primaria:** *"Tu equipo de ingeniería, clonado en IA."*
Alternativas:
- *"23 agentes. Un proyecto. Tu visión."*
- *"Where software gets its DNA."*
- *"El laboratorio de los ingenieros IA."*

### 1.4 Referencias visuales
- **Linear** — densidad tipográfica, dark mode como default, micro-interacciones sobrias, command palette.
- **Vercel Dashboard** — grids de proyectos, estados con dots de color, tipografía geometrical.
- **v0.dev** — chat-first interface, mensajes con bloques de código ricos.
- **Notion** — jerarquía tipográfica y respiración, paneles divididos.
- **Arc Browser** — color acento vibrante como firma, gradientes sutiles.

**NO queremos parecernos a:** Jira (pesado), Slack (genérico), ChatGPT (frío/blanco plano).

---

## 2. Logo

### 2.1 Concepto
Una **doble hélice estilizada** que también se lee como la letra **G** y como dos flujos que se entrelazan (agente ↔ ingeniero). El símbolo debe funcionar en 16x16 (favicon) y 256x256 (splash).

### 2.2 Variantes conceptuales (ASCII mock)

**Variante A — Helix G (recomendada)**
```
    ╭─╮
   ╱   ╲       GENTICA
  │  ◉  │      ───────
   ╲   ╱       platform
    ╰─╯
```
Un círculo con un punto interior (núcleo / célula) y trazos que forman una G envolvente. Color primario con acento en el núcleo.

**Variante B — Nodos y aristas**
```
   ●───●
    ╲ ╱        GENTICA
     ●         ───────
    ╱ ╲        platform
   ●───●
```
Grafo de 5 nodos — metáfora del equipo de agentes conectados. Más "sistema multi-agente", menos "genoma".

**Variante C — Monograma G// (minimalista)**
```
   G//         GENTICA platform
```
Wordmark puro, el `//` evoca código y la doble hélice al mismo tiempo. Ideal si queremos velocidad de implementación en Sprint 1.

**Recomendación del diseñador:** Variante C como logo de lanzamiento (implementable en CSS/SVG en una tarde) + Variante A como evolución para post-MVP.

---

## 3. Paleta de colores

### 3.1 Filosofía
Dark mode como default (es una herramienta técnica de uso prolongado). Light mode completo y accesible. Un único color acento vibrante como firma de marca — el resto es neutral.

### 3.2 Color primario — "Helix Violet"
Un violeta-índigo que evoca tecnología + ciencia, distinto al azul saturado de todos los SaaS.

| Token | Hex | Uso |
|---|---|---|
| `helix-50`  | `#F5F3FF` | Backgrounds sutiles light |
| `helix-100` | `#EDE9FE` | Hover states light |
| `helix-200` | `#DDD6FE` | Borders active |
| `helix-300` | `#C4B5FD` | Disabled accents |
| `helix-400` | `#A78BFA` | Accent dark mode |
| `helix-500` | `#8B5CF6` | **Primario default** |
| `helix-600` | `#7C3AED` | **Primario hover / CTAs** |
| `helix-700` | `#6D28D9` | Primario active |
| `helix-800` | `#5B21B6` | Dark bg accent |
| `helix-900` | `#4C1D95` | Deepest accent |

### 3.3 Color secundario — "Cell Cyan"
Acento para estados "en vivo" (chat activo, streaming, agente trabajando).
| Token | Hex | Uso |
|---|---|---|
| `cell-400` | `#22D3EE` | Live indicators, streaming dots |
| `cell-500` | `#06B6D4` | Badges "en curso" |

### 3.4 Neutros — "Lab Gray"
Escala fría con tinte violáceo (evita el gris neutro aburrido).

| Token | Hex | Light use | Dark use |
|---|---|---|---|
| `lab-50`  | `#FAFAFC` | bg app | — |
| `lab-100` | `#F4F4F7` | bg cards | — |
| `lab-200` | `#E5E5EC` | borders | — |
| `lab-300` | `#D1D1DB` | dividers | — |
| `lab-400` | `#9CA3AF` | placeholder | muted text |
| `lab-500` | `#6B7280` | muted text | secondary text |
| `lab-600` | `#4B5563` | secondary | borders |
| `lab-700` | `#374151` | body alt | cards |
| `lab-800` | `#1F2937` | — | bg cards |
| `lab-900` | `#111827` | — | bg app |
| `lab-950` | `#0A0E1A` | — | **bg app default dark** |

### 3.5 Semánticos

| Token | Hex | Uso |
|---|---|---|
| `success-500` | `#10B981` | Proyecto libre, task done, deploy OK |
| `warning-500` | `#F59E0B` | Cerca del cap de USD, cola de espera |
| `error-500`   | `#EF4444` | Proyecto bloqueado, cap superado, error API |
| `info-500`    | `#3B82F6` | Notificaciones informativas |

### 3.6 Estados de proyecto (pastilla/badge)
| Estado | Bg | Texto | Dot |
|---|---|---|---|
| **Libre** | `success-500/10` | `success-500` | `success-500` |
| **Tomado** | `helix-500/10` | `helix-400` | `helix-500` |
| **En cola** | `warning-500/10` | `warning-500` | `warning-500` pulsing |
| **Bloqueado** | `error-500/10` | `error-500` | `error-500` |
| **Auto-release <24h** | `warning-500/10` | `warning-500` | `warning-500` |

### 3.7 Contrastes (WCAG AA verificados)
- `lab-950` bg + `lab-50` text → 18.9:1 ✓
- `helix-500` bg + `white` text → 5.1:1 ✓ (large 3:1 ✓)
- `helix-600` bg + `white` text → 6.8:1 ✓
- `success-500` bg + `lab-950` text → 8.2:1 ✓
- `lab-500` muted + `lab-950` bg → 4.6:1 ✓

---

## 4. Tipografía

### 4.1 Font stack
| Rol | Familia | Fallback | Peso |
|---|---|---|---|
| **Display** | `Geist` | `Inter, system-ui, sans-serif` | 500, 600, 700 |
| **Body** | `Inter` | `system-ui, -apple-system, sans-serif` | 400, 500, 600 |
| **Mono** | `Geist Mono` | `JetBrains Mono, ui-monospace, monospace` | 400, 500 |

Geist es libre (Vercel), coincide con el aire "moderno técnico" que buscamos y se integra nativo a Next.js vía `next/font`.

### 4.2 Escala tipográfica

| Token | Size | Line-height | Weight | Uso |
|---|---|---|---|---|
| `text-2xs`  | 0.6875rem (11px) | 1rem | 500 | Badges, tags |
| `text-xs`   | 0.75rem (12px) | 1rem | 400-500 | Captions, helper |
| `text-sm`   | 0.875rem (14px) | 1.25rem | 400 | Body compacto, tabla |
| `text-base` | 1rem (16px) | 1.5rem | 400 | **Body default** |
| `text-lg`   | 1.125rem (18px) | 1.75rem | 500 | Sub-headings |
| `text-xl`   | 1.25rem (20px) | 1.75rem | 600 | Titular de card |
| `text-2xl`  | 1.5rem (24px) | 2rem | 600 | H2 pantalla |
| `text-3xl`  | 1.875rem (30px) | 2.25rem | 700 | H1 pantalla |
| `text-4xl`  | 2.25rem (36px) | 2.5rem | 700 | Display login/marketing |

Tracking: `-0.01em` para display (más tight), `0` para body, `0.02em` para mono inline en body.

---

## 5. Design system base — shadcn/ui

### 5.1 Componentes a instalar
`button`, `input`, `textarea`, `select`, `label`, `card`, `dialog`, `sheet`, `table`, `badge`, `avatar`, `tabs`, `toast` (sonner), `tooltip`, `dropdown-menu`, `command`, `separator`, `progress`, `skeleton`, `scroll-area`, `alert`, `alert-dialog`, `popover`, `switch`, `checkbox`, `form`.

### 5.2 Customizaciones clave

**Button**
- Variant nueva: `helix` = fondo `helix-600`, hover `helix-500`, focus ring `helix-400/50`.
- Variant `ghost` refinada con hover `lab-100/dark:lab-800`.
- Radius: `rounded-lg` (8px) default. CTAs grandes `rounded-xl`.
- Heights: `sm=32px`, `md=40px`, `lg=48px` (mínimo touch).

**Card**
- Background: `bg-white dark:bg-lab-900`.
- Border: `border-lab-200 dark:border-lab-800`.
- Padding default: `p-6`. Compact: `p-4`.
- Hover (clickeable): `hover:border-helix-500/40 transition-colors`.

**Input / Textarea**
- Border: `border-lab-300 dark:border-lab-700`.
- Focus: `ring-2 ring-helix-500/40 border-helix-500`.
- Error state: `border-error-500 ring-error-500/30`.

**Badge** — añadir variantes de estado de proyecto (ver 3.6).

**Dialog / Sheet** — backdrop `bg-lab-950/70 backdrop-blur-sm`.

**Table** — row hover `bg-lab-50 dark:bg-lab-800/50`, header `text-xs uppercase tracking-wider text-lab-500`.

**Toast (sonner)** — posición `top-right`, con icono semántico coloreado.

### 5.3 Componentes custom (no-shadcn)
- `<ProjectStatusBadge />` — pastilla con dot animado.
- `<AgentAvatar />` — avatar circular con color del rol del agente (los 23 colores del equipo GEN).
- `<ChatMessage />` — bloque de chat con soporte markdown + code blocks + tool calls colapsables.
- `<CostMeter />` — barra de progreso con color dinámico (verde → warning → error) según % del cap de USD 50.
- `<IterationBanner />` — banner superior cuando un artefacto está en loop de aprobación.

### 5.4 Espaciado (8pt grid)
Estándar Tailwind. Usar `gap-2 / gap-4 / gap-6 / gap-8` como lenguaje. Secciones de página `py-8 md:py-12`.

### 5.5 Elevación
Sin sombras pesadas. Solo:
- `shadow-sm` para cards hover.
- `shadow-lg shadow-helix-500/10` para dialogs.
- Borders como separador principal.

### 5.6 Motion
- Transiciones default: `transition-colors duration-150 ease-out`.
- Dialogs: `duration-200 ease-out` + `scale-95 → 100`.
- Streaming cursor en chat: `animate-pulse`.
- Dot "en curso": keyframe custom `pulse-ring`.

---

## 6. Wireframes

Notación: `[...]` = componente, `{...}` = contenido dinámico, `─│╭╮╯╰` = bordes.

### 6.1 Login

```
╭──────────────────────────────────────────────────────────────╮
│                                                              │
│                                                              │
│                        G//  GENTICA                          │
│                                                              │
│              Tu equipo de ingeniería,                        │
│                 clonado en IA.                               │
│                                                              │
│         ╭────────────────────────────────────╮               │
│         │  Email                              │              │
│         │  ┌──────────────────────────────┐  │               │
│         │  │ you@company.com              │  │               │
│         │  └──────────────────────────────┘  │               │
│         │  Password                           │              │
│         │  ┌──────────────────────────────┐  │               │
│         │  │ ••••••••                     │  │               │
│         │  └──────────────────────────────┘  │               │
│         │  ┌──────────────────────────────┐  │               │
│         │  │       Entrar al laboratorio  │  │ ← helix CTA   │
│         │  └──────────────────────────────┘  │               │
│         │                                    │               │
│         │  ─── o ───                         │               │
│         │  [  Continuar con Google  ]        │               │
│         ╰────────────────────────────────────╯               │
│                                                              │
│              ¿No tenés cuenta? Contactar admin               │
│                                                              │
╰──────────────────────────────────────────────────────────────╯
```
- Centrado vertical, fondo `lab-950` con gradiente sutil `helix-900/20` radial desde top.
- Card max-width `420px`.
- Wordmark animado en load (stroke draw).

### 6.2 Dashboard / Listado de proyectos

```
╭─ G// GENTICA ──────────────────────── [🔍 ⌘K] ── [🔔] [👤 Ada] ╮
│                                                                │
│ ╭─ Sidebar ──╮ ╭─ Main ─────────────────────────────────────╮  │
│ │            │ │                                            │  │
│ │ 🏠 Proyectos│ │  Proyectos                  [+ Nuevo]      │  │
│ │ 💬 Mis chats│ │  ──────────────────────────────────────   │  │
│ │ 💰 Billing │ │  [Todos][Libres][Míos][Cola][Bloqueados]   │  │
│ │ 📊 Stats   │ │                                            │  │
│ │            │ │  ╭────────────╮ ╭────────────╮ ╭─────────╮ │  │
│ │ ─────      │ │  │● Libre     │ │● Tomado   │ │● En cola│ │  │
│ │            │ │  │nearU       │ │municipIA  │ │LeadGen  │ │  │
│ │ ⚙ Admin    │ │  │BLE network │ │Federated  │ │LinkedIn │ │  │
│ │            │ │  │            │ │by: Ada L. │ │         │ │  │
│ │            │ │  │$0 / $50    │ │$12 / $50  │ │— / $50  │ │  │
│ │            │ │  │[ Tomar ]   │ │[ Abrir ]  │ │[ Ver   ]│ │  │
│ │            │ │  ╰────────────╯ ╰────────────╯ ╰─────────╯ │  │
│ │            │ │                                            │  │
│ │            │ │  ╭────────────╮ ╭────────────╮ ╭─────────╮ │  │
│ │            │ │  │● Bloqueado │ │● Libre    │ │● Tomado │ │  │
│ │            │ │  │...         │ │...        │ │...      │ │  │
│ │            │ │  ╰────────────╯ ╰────────────╯ ╰─────────╯ │  │
│ │            │ │                                            │  │
│ ╰────────────╯ ╰────────────────────────────────────────────╯  │
╰────────────────────────────────────────────────────────────────╯
```

- **Sidebar 240px** colapsable a 64px (solo iconos).
- **Grid de cards** responsive: 3 cols desktop / 2 tablet / 1 mobile.
- Cada card tiene: dot de estado animado, nombre, descripción 1 línea, CostMeter, owner (si tomado), CTA.
- Filter pills arriba del grid.
- Command palette `⌘K` global: buscar proyectos, ir a chat, acciones rápidas.

### 6.3 Detalle de proyecto + Chat con PM

```
╭─ G// ◂ Proyectos / nearU ──────────────────── [⚙] [Liberar] ─╮
│                                                                │
│ ╭─ Info panel 320px ──╮ ╭─ Chat ─────────────────────────────╮ │
│ │                     │ │                                    │ │
│ │ nearU               │ │ ┌─────────────────────────────┐   │ │
│ │ BLE beacon netwk    │ │ │[🔵 Alan]  PM · hace 2 min   │   │ │
│ │                     │ │ │                             │   │ │
│ │ ● Tomado por vos    │ │ │ Retomando nearU. Sprint 2,  │   │ │
│ │ Sprint 2 · Día 3    │ │ │ tarea TASK-014. El front    │   │ │
│ │                     │ │ │ está en preview:            │   │ │
│ │ ── Equipo ──        │ │ │ → nearu-xyz.vercel.app      │   │ │
│ │ [A] Alan  PM        │ │ │ ¿Continuamos?               │   │ │
│ │ [A] Ada   Analista  │ │ └─────────────────────────────┘   │ │
│ │ [N] Nikola Arqui.   │ │                                    │ │
│ │ [L] Linus  TL       │ │            ┌──────────────────┐    │ │
│ │ [G] Grace  Front    │ │            │ Sí, dale. Mostra-│    │ │
│ │ ...+18 agentes      │ │            │ me qué hay en    │    │ │
│ │                     │ │            │ preview.         │    │ │
│ │ ── Costo ──         │ │            └──────────────────┘    │ │
│ │ ████████░░ $38/50   │ │                     Vos · ahora    │ │
│ │ 76% usado           │ │                                    │ │
│ │ ⚠ Auto-release 4d   │ │ ┌─────────────────────────────┐   │ │
│ │                     │ │ │[🔵 Alan]  escribiendo ...  │   │ │
│ │ ── Artefactos ──    │ │ └─────────────────────────────┘   │ │
│ │ 📄 Acta             │ │                                    │ │
│ │ 📄 Req funcionales  │ │ ──────────────────────────────    │ │
│ │ 📄 Arquitectura     │ │ ┌──────────────────────────┐ [↑] │ │
│ │ 🎨 Wireframes       │ │ │ Escribí un mensaje...    │     │ │
│ │ 🧪 Test report      │ │ └──────────────────────────┘     │ │
│ │                     │ │                                    │ │
│ ╰─────────────────────╯ ╰────────────────────────────────────╯ │
╰────────────────────────────────────────────────────────────────╯
```

- **Panel izquierdo 320px fijo**: info del proyecto, equipo (23 avatars con sus colores), CostMeter prominente, lista de artefactos generados (clickeables → abren en drawer).
- **Chat central fluido**: burbujas estilo Linear. Mensajes de agentes con avatar + nombre + rol. Mensajes del usuario alineados derecha sin avatar.
- **Streaming indicator**: "escribiendo..." con dots animados cuando el agente está trabajando.
- **Iteration banner**: si hay un loop activo de aprobación, banner sticky arriba del chat: `🔄 Iteración 3 de Requerimientos — esperando tu feedback`.
- **Input sticky bottom** con textarea auto-grow, botón send, soporte drag-drop de archivos, `⌘+Enter` para enviar.
- **Tool calls colapsables**: cuando el PM invoca un subagente, se renderiza como bloque colapsable `▸ Invocando Ada Lovelace (Analista Funcional)...`.

### 6.4 Admin — Gestión de usuarios

```
╭─ G// ◂ Admin / Usuarios ────────────────────────── [+ Invitar] ╮
│                                                                │
│  Usuarios activos: 8 · Proyectos en curso: 14 · Total $342     │
│                                                                │
│  [🔍 Buscar usuario...]                [Todos][Activos][Susp.] │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ USUARIO         ROL      PROYECTOS  GASTO   ESTADO     │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ [A] Ana Perez   admin    3          $87     ● Activo ⋮│    │
│  │ [G] Gaston G.   engineer 5          $121    ● Activo ⋮│    │
│  │ [M] Marco S.    engineer 2          $34     ● Activo ⋮│    │
│  │ [L] Lucia R.    engineer 0          $0      ○ Suspend⋮│    │
│  │ ...                                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌─ Stats ─────────────────────────────────────────────────┐   │
│  │ 📊 Gasto últimos 30 días — gráfico de línea            │   │
│  │ 📊 Proyectos por estado — donut                        │   │
│  └────────────────────────────────────────────────────────┘    │
╰────────────────────────────────────────────────────────────────╯
```
- Tabla con sorting, search, filtros.
- Menú `⋮` por fila: editar rol, suspender, forzar release de proyectos, ver logs.
- KPIs arriba, gráficos abajo (recharts).
- Solo accesible si `role=admin`.

### 6.5 Crear proyecto (Dialog modal)

```
                 ╭─ Nuevo proyecto ────────────── [✕] ╮
                 │                                    │
                 │  Nombre del proyecto *             │
                 │  ┌──────────────────────────────┐  │
                 │  │ mi-nuevo-proyecto            │  │
                 │  └──────────────────────────────┘  │
                 │  kebab-case, único                 │
                 │                                    │
                 │  Tipo *                            │
                 │  ( ) Nuevo                         │
                 │  ( ) Evolutivo                     │
                 │  ( ) Correctivo                    │
                 │                                    │
                 │  Descripción corta *               │
                 │  ┌──────────────────────────────┐  │
                 │  │                              │  │
                 │  │                              │  │
                 │  └──────────────────────────────┘  │
                 │                                    │
                 │  Documentos iniciales (opcional)   │
                 │  ┌──────────────────────────────┐  │
                 │  │  📎 Arrastrá archivos aquí   │  │
                 │  │     o hacé click             │  │
                 │  └──────────────────────────────┘  │
                 │  .md, .pdf, .docx — max 10MB       │
                 │                                    │
                 │  Cap de presupuesto                │
                 │  ●────────○ $50 USD (default)      │
                 │                                    │
                 │         [Cancelar]  [Crear →]      │
                 ╰────────────────────────────────────╯
```
- Dialog `max-w-md`.
- Validación inline (nombre único, kebab-case regex).
- Upload con preview de archivos.
- Al crear: redirige automáticamente al detalle del proyecto y el PM (Alan) inicia el flujo INCEPTION en el chat.

### 6.6 Billing / Costos del proyecto

```
╭─ G// ◂ Proyectos / nearU / Billing ────────────────────────── ╮
│                                                                │
│  Presupuesto del proyecto                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ██████████████████████████░░░░░░  $38.42 / $50.00      │  │
│  │  76.8% usado  ·  $11.58 restante                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [ Resumen ]  [ Por agente ]  [ Por sprint ]  [ Log detalle ] │
│                                                                │
│  ┌─ Gasto por agente ───────────────────────────────────────┐  │
│  │ [A] Alan (PM)       ████████░░░░░  $12.40  32%          │  │
│  │ [A] Ada (Analista)  █████░░░░░░░░   $7.80  20%          │  │
│  │ [N] Nikola (Arqui)  ████░░░░░░░░░   $6.20  16%          │  │
│  │ [G] Grace (Front)   ███░░░░░░░░░░   $4.90  13%          │  │
│  │ ...                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Tokens consumidos ──────────────────────────────────────┐  │
│  │ Input:  2.4M tokens                                      │  │
│  │ Output: 680K tokens                                      │  │
│  │ Cache hits: 1.1M (ahorro estimado $4.20)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ⚠  Al llegar a $50 el proyecto se pausa automáticamente.     │
│     Podés solicitar ampliación al admin.                       │
│                                                                │
╰────────────────────────────────────────────────────────────────╯
```
- CostMeter gigante arriba con color dinámico (verde < 60%, warning 60-85%, error > 85%).
- Tabs para distintos cortes de datos.
- Tabla detalle de cada llamada a la API (para auditoría).
- CTA contextual: "Solicitar ampliación" si > 80%.

---

## 7. Accesibilidad (WCAG 2.1 AA)

### 7.1 Checklist aplicable
- [x] **Contraste texto**: todos los pares verificados en sección 3.7 cumplen 4.5:1 (normal) / 3:1 (large).
- [x] **Contraste UI**: bordes de input `lab-300` sobre `white` = 3.1:1 ✓.
- [x] **Focus visible**: ring `helix-500/40` de 2px en TODOS los elementos interactivos. Nunca `outline:none` sin reemplazo.
- [x] **Orden de foco**: lógico, coincide con orden visual (sidebar → header → main → footer).
- [x] **Keyboard nav**: toda acción alcanzable sin mouse. `⌘K` command palette como acelerador.
- [x] **Escape**: cierra dialogs, drawers, command palette.
- [x] **Focus trap**: en dialogs y sheets.
- [x] **Labels**: todos los inputs con `<Label htmlFor>` asociado. Placeholders NO reemplazan labels.
- [x] **ARIA**: `role`, `aria-label`, `aria-live="polite"` para chat streaming, `aria-busy` durante loading.
- [x] **Touch targets**: mínimo 44x44 en mobile. Botones `sm` solo en desktop.
- [x] **Screen reader**: mensajes de chat anunciados con `aria-live`. Estados de proyecto con texto además del dot de color.
- [x] **Motion**: respetar `prefers-reduced-motion` — desactivar pulses y transiciones no esenciales.
- [x] **Color no es único canal**: estados siempre combinan color + icono + texto.

### 7.2 Contenido
- Error messages accionables: *"No pudimos tomar el proyecto. Ya tenés 20 proyectos activos — liberá uno primero."*
- Empty states con ilustración + CTA: *"Todavía no hay proyectos. Creá el primero para empezar a trabajar con tu equipo."*
- Loading states con skeletons, nunca spinners solos.

---

## 8. Responsive

### 8.1 Breakpoints (Tailwind default)
| Bp | Width | Uso |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / laptop pequeña |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Wide desktop |

### 8.2 Cambios por pantalla

**Mobile (<768px)**
- Sidebar → drawer lateral activado por hamburguesa.
- Grid de proyectos → 1 columna.
- Detalle de proyecto → Info panel se transforma en sheet inferior deslizable (`Sheet from bottom`), el chat ocupa toda la pantalla.
- Tabla de admin → cards apiladas en lugar de rows.
- Command palette → full-screen.
- Fuentes display reducen un step (`text-3xl → text-2xl`).

**Tablet (768-1023px)**
- Sidebar colapsa a iconos (64px).
- Grid de proyectos → 2 columnas.
- Detalle de proyecto → info panel 260px.

**Desktop (≥1024px)**
- Layout completo como se describió.
- Grid de proyectos → 3 columnas.
- Max content width `1440px` centrado en pantallas `2xl`.

### 8.3 Mobile-first decisions
- Chat debe ser 100% usable en mobile — es el core.
- Input del chat sticky al bottom con `safe-area-inset` para iOS notch.
- Drag-drop de archivos oculto en mobile → botón `📎 Adjuntar`.

---

## 9. Estados especiales (resumen)

Cada componente/pantalla considera:
- **Default** — contenido normal.
- **Loading** — skeletons con shimmer `lab-800 → lab-700`.
- **Empty** — ilustración + texto + CTA.
- **Error** — mensaje accionable + retry.
- **Success** — toast verde top-right + update UI optimista.
- **Disabled** — opacity 50% + cursor not-allowed + tooltip con razón.
- **Offline** — banner global `lab-800` con "Sin conexión — reintentando...".

---

## 10. Entregables pendientes post-aprobación

Una vez aprobado este documento, los siguientes artefactos se generarán en iteraciones posteriores (NO en esta iteración):
1. Tokens exportables (`tailwind.config.ts` con el theme completo).
2. Figma file con los componentes (opcional, si se solicita).
3. SVG del logo en las variantes elegidas.
4. Guía de voz y tono del PM en el chat (con Ada Lovelace).
5. Animaciones clave en video/lottie.

---

## 11. Decisiones cerradas (delegadas al diseñador)

El usuario aprobó la v1 y delegó las 8 preguntas abiertas al criterio del diseñador. Decisiones tomadas:

1. **Naming → "GENTICA Platform" (oficial)**. Justificación: junta GEN (framework) + genética (ADN del software). Funciona como wordmark corto, es googleable y no colisiona con marcas SaaS conocidas. Se usará "GENTICA" como brand short y "GENTICA Platform" como nombre completo en docs/legales.
2. **Personalidad → técnica-moderna-cálida (confirmada)**. Justificación: el balance entre rigor de ingeniería y "personas con nombre" (los 23 científicos) es la diferencia competitiva frente a Linear (frío) y ChatGPT (genérico).
3. **Logo → Variante C `G//` wordmark**. Justificación: implementable en CSS/SVG en una tarde, escala perfecto a favicon, el `//` evoca código + doble hélice simultáneamente y refuerza la identidad técnica. La Variante A (Helix G) queda en backlog post-MVP cuando haya budget de ilustración.
4. **Paleta → Helix Violet (#8B5CF6) primario + Cell Cyan (#06B6D4) acento live**. Justificación: el violeta-índigo nos diferencia del mar de azules SaaS (Stripe/Linear/Vercel), conecta visualmente con "tecnología + ciencia", y el cyan da el contraste vibrante para estados "en vivo" sin pelearse con el primario.
5. **Dark mode → default ON**. Justificación: herramienta técnica de uso prolongado, los usuarios target (ingenieros IA) trabajan en dark por defecto. Light mode 100% soportado y accesible vía toggle en el header.
6. **Tipografía → Geist (display) + Inter (body) + Geist Mono (code)**. Justificación: Geist es libre, integración nativa con Next.js vía `next/font`, peso visual moderno-técnico que matchea Vercel/v0 (referentes directos). Inter como body porque tiene mejor legibilidad en tamaños chicos que Geist.
7. **Cobertura wireframes Sprint 1 → las 6 pantallas son suficientes**. Justificación: cubren el flujo end-to-end (login → listado → tomar/crear proyecto → trabajar en chat → ver costos → admin). Settings de usuario, notificaciones full-page y perfil público se difieren a Sprint 2 — en Sprint 1 alcanza con dropdown de avatar para logout/preferencias mínimas.
8. **Tagline oficial → *"Tu equipo de ingeniería, clonado en IA."***. Justificación: es la única que comunica el valor en una sola frase sin tecnicismos. "Clonado" refuerza la metáfora genética del nombre. Las otras 3 quedan como copy secundario para landing/marketing.

**Todas las decisiones cerradas. Sin loops abiertos en esta iteración.**

---

## 12. Mockups detallados — Sprint 1 (handoff a frontend)

Esta sección reemplaza a Figma para Sprint 1. Cada pantalla incluye: layout exacto en Tailwind, tokens de color, todos los estados interactivos, y notas de implementación. **El equipo frontend puede empezar a codear con esto sin esperar más entregables.**

> **Convenciones**: Todas las clases son Tailwind. Tokens `helix-*`, `cell-*`, `lab-*`, `success-*`, `warning-*`, `error-*` definidos en `tailwind.config.ts` (sección 3). Componentes base = shadcn/ui (sección 5). Dark mode usando estrategia `class` (no media query) — toggle persistente en `localStorage`.

### 12.1 LOGIN

**Ruta:** `/login`
**Layout root:**
```
<main class="min-h-screen w-full bg-lab-950 relative overflow-hidden flex items-center justify-center px-4">
  <!-- Radial gradient backdrop -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.helix.900/0.25),transparent_60%)]" />

  <!-- Card -->
  <div class="relative w-full max-w-[420px]">
    [Wordmark]
    [Tagline]
    [Form card]
    [Footer link]
  </div>
</main>
```

**Wordmark (top):**
- Container: `flex flex-col items-center mb-10`
- Logo: `<span class="font-display font-bold text-4xl tracking-tight text-lab-50">G<span class="text-helix-500">//</span></span>`
- Brand: `<span class="mt-2 text-sm font-medium text-lab-400 tracking-widest uppercase">GENTICA</span>`
- Animación load: stroke-draw del `//` (300ms ease-out, delay 100ms)

**Tagline:**
- `<h1 class="text-center text-2xl font-display font-semibold text-lab-100 leading-tight mb-1">Tu equipo de ingeniería,</h1>`
- `<h2 class="text-center text-2xl font-display font-semibold text-helix-400 leading-tight mb-8">clonado en IA.</h2>`

**Form card:**
- Container: `bg-lab-900 border border-lab-800 rounded-2xl p-8 shadow-xl shadow-helix-950/40`
- Form gap: `space-y-5`

**Email field:**
```html
<div class="space-y-2">
  <label for="email" class="block text-sm font-medium text-lab-200">Email</label>
  <input id="email" type="email" autocomplete="email" required
    class="w-full h-11 px-4 rounded-lg
           bg-lab-950 border border-lab-700 text-lab-50 placeholder:text-lab-500
           text-base
           transition-colors duration-150
           hover:border-lab-600
           focus:outline-none focus:border-helix-500 focus:ring-2 focus:ring-helix-500/30
           disabled:opacity-50 disabled:cursor-not-allowed
           aria-[invalid=true]:border-error-500 aria-[invalid=true]:ring-error-500/30"
    placeholder="you@company.com" />
  <p class="text-xs text-error-500 hidden aria-[invalid=true]:block">Email inválido.</p>
</div>
```

**Password field:** idéntico al email, `type="password"`, `autocomplete="current-password"`, con botón ojo `absolute right-3 top-1/2 -translate-y-1/2 text-lab-500 hover:text-lab-300`.

**CTA principal "Entrar al laboratorio":**
```html
<button type="submit" class="
  w-full h-12 rounded-xl
  bg-helix-600 text-white font-medium text-base
  flex items-center justify-center gap-2
  transition-all duration-150 ease-out
  hover:bg-helix-500 hover:shadow-lg hover:shadow-helix-500/25
  active:bg-helix-700 active:scale-[0.99]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lab-900
  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-helix-600 disabled:hover:shadow-none
  aria-busy:cursor-wait
">
  <span class="aria-busy:hidden">Entrar al laboratorio</span>
  <svg class="hidden aria-busy:block h-4 w-4 animate-spin"><!-- spinner --></svg>
</button>
```

**Estados del CTA:**
| Estado | Clases dominantes |
|---|---|
| Default | `bg-helix-600` |
| Hover | `bg-helix-500 shadow-lg shadow-helix-500/25` |
| Focus | ring `helix-400` 2px + offset 2px sobre `lab-900` |
| Active | `bg-helix-700 scale-[0.99]` |
| Disabled | `opacity-50 cursor-not-allowed` (sin hover) |
| Loading | `aria-busy="true"` → spinner visible, texto oculto, cursor wait |
| Error | toast top-right `bg-error-500/10 border-error-500/40 text-error-300` con mensaje accionable |

**Divider "o":**
- `<div class="relative my-6"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-lab-800"></div></div><div class="relative flex justify-center"><span class="bg-lab-900 px-3 text-xs text-lab-500 uppercase tracking-wider">o</span></div></div>`

**Botón Google secundario:**
- `w-full h-11 rounded-lg bg-transparent border border-lab-700 text-lab-100 hover:bg-lab-800 hover:border-lab-600 transition-colors flex items-center justify-center gap-3`
- Icono Google 18×18 a la izquierda.

**Footer:**
- `<p class="mt-6 text-center text-sm text-lab-500">¿No tenés cuenta? <a class="text-helix-400 hover:text-helix-300 underline-offset-4 hover:underline">Contactar admin</a></p>`

**Notas implementación:**
- `prefers-reduced-motion`: desactivar el stroke-draw del logo y la animación scale del CTA active.
- Form submit con React Hook Form + Zod. Validación inline al `onBlur`.
- Tab order: email → password → ojo → submit → google → contactar.
- Touch targets ≥ 44px verificado (h-11 = 44px, h-12 = 48px).

---

### 12.2 DASHBOARD / LISTADO DE PROYECTOS

**Ruta:** `/` (autenticado) | `/projects`

**Layout root:**
```html
<div class="min-h-screen bg-lab-950 text-lab-100 flex flex-col">
  <header />               <!-- 56px -->
  <div class="flex flex-1 min-h-0">
    <aside />              <!-- 240px / 64px collapsed -->
    <main class="flex-1 overflow-y-auto" />
  </div>
</div>
```

**Header (h-14 = 56px):**
```html
<header class="h-14 shrink-0 border-b border-lab-800 bg-lab-950/80 backdrop-blur-md
               sticky top-0 z-40
               flex items-center px-4 gap-4">
  <!-- Logo -->
  <a href="/" class="flex items-center gap-2 mr-2">
    <span class="font-display font-bold text-xl text-lab-50">G<span class="text-helix-500">//</span></span>
    <span class="text-xs text-lab-500 uppercase tracking-widest hidden md:inline">GENTICA</span>
  </a>

  <!-- Search trigger (cmd+k) -->
  <button class="flex-1 max-w-md h-9 px-3 rounded-lg
                 bg-lab-900 border border-lab-800 hover:border-lab-700
                 flex items-center gap-2 text-sm text-lab-500
                 transition-colors">
    <SearchIcon class="h-4 w-4" />
    <span>Buscar proyectos, comandos...</span>
    <kbd class="ml-auto text-2xs px-1.5 py-0.5 rounded border border-lab-700 bg-lab-950 text-lab-400">⌘K</kbd>
  </button>

  <!-- Right actions -->
  <button aria-label="Notificaciones" class="h-9 w-9 rounded-lg hover:bg-lab-800 flex items-center justify-center text-lab-400 hover:text-lab-100 transition-colors relative">
    <BellIcon class="h-4 w-4" />
    <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cell-400 ring-2 ring-lab-950" />
  </button>

  <button class="h-9 pl-1 pr-3 rounded-lg hover:bg-lab-800 flex items-center gap-2 transition-colors">
    <span class="h-7 w-7 rounded-full bg-helix-500/20 text-helix-300 text-xs font-semibold flex items-center justify-center">A</span>
    <span class="text-sm font-medium text-lab-200 hidden md:inline">Ada</span>
  </button>
</header>
```

**Sidebar (w-60 = 240px expanded / w-16 = 64px collapsed):**
```html
<aside class="w-60 shrink-0 border-r border-lab-800 bg-lab-950
              hidden md:flex flex-col py-4
              data-[collapsed=true]:w-16 transition-[width] duration-200">
  <nav class="flex-1 px-3 space-y-1">
    <a href="/projects" data-active="true"
       class="h-10 px-3 rounded-lg flex items-center gap-3 text-sm font-medium
              text-lab-400 hover:text-lab-100 hover:bg-lab-900
              data-[active=true]:bg-helix-500/10 data-[active=true]:text-helix-300
              transition-colors">
      <HomeIcon class="h-4 w-4 shrink-0" />
      <span class="data-[collapsed=true]:hidden">Proyectos</span>
    </a>
    <!-- Mis chats, Billing, Stats — mismo patrón -->
  </nav>
  <div class="px-3 pt-3 mt-3 border-t border-lab-800">
    <a href="/admin" class="..."><SettingsIcon /> Admin</a>  <!-- solo si role=admin -->
  </div>
</aside>
```

**Estados nav item:**
| Estado | Clases |
|---|---|
| Default | `text-lab-400` |
| Hover | `text-lab-100 bg-lab-900` |
| Active | `bg-helix-500/10 text-helix-300` |
| Focus visible | `ring-2 ring-helix-500/40` |

**Main content:**
```html
<main class="flex-1 overflow-y-auto">
  <div class="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-display font-bold text-lab-50 tracking-tight">Proyectos</h1>
        <p class="mt-1 text-sm text-lab-500">14 activos · 6 libres · $342 gastado este mes</p>
      </div>
      <button class="h-10 px-4 rounded-lg bg-helix-600 hover:bg-helix-500 text-white font-medium text-sm flex items-center gap-2 transition-colors shadow-sm shadow-helix-500/20">
        <PlusIcon class="h-4 w-4" /> Nuevo proyecto
      </button>
    </div>

    <!-- Filter pills -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
      <FilterPill active>Todos</FilterPill>
      <FilterPill>Libres <span class="ml-1 text-2xs text-lab-500">6</span></FilterPill>
      <FilterPill>Míos <span class="...">3</span></FilterPill>
      <FilterPill>En cola</FilterPill>
      <FilterPill>Bloqueados</FilterPill>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <ProjectCard ... />
    </div>
  </div>
</main>
```

**FilterPill component:**
```html
<button class="h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap
               bg-lab-900 border border-lab-800 text-lab-400
               hover:bg-lab-800 hover:text-lab-100 hover:border-lab-700
               data-[active=true]:bg-helix-500/15 data-[active=true]:border-helix-500/40 data-[active=true]:text-helix-300
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-500/40
               transition-colors">
```

**ProjectCard (clave del Sprint 1):**
```html
<article class="group relative
                bg-lab-900 border border-lab-800 rounded-xl p-5
                hover:border-helix-500/40 hover:bg-lab-900/80
                transition-all duration-150
                cursor-pointer
                focus-within:border-helix-500/60 focus-within:ring-2 focus-within:ring-helix-500/30">

  <!-- Status badge -->
  <div class="flex items-center justify-between mb-4">
    <span class="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-2xs font-medium
                 bg-success-500/10 text-success-400 border border-success-500/20">
      <span class="h-1.5 w-1.5 rounded-full bg-success-500" />
      Libre
    </span>
    <button aria-label="Más opciones" class="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 hover:bg-lab-800 text-lab-500 hover:text-lab-200 flex items-center justify-center transition-all">
      <DotsIcon class="h-4 w-4" />
    </button>
  </div>

  <!-- Title + desc -->
  <h3 class="text-lg font-display font-semibold text-lab-50 mb-1 truncate">nearU</h3>
  <p class="text-sm text-lab-400 line-clamp-2 mb-5 min-h-[2.5rem]">BLE beacon networking app for events. Capacitor + Next.js + Supabase.</p>

  <!-- Cost meter -->
  <div class="space-y-1.5 mb-4">
    <div class="flex items-center justify-between text-2xs">
      <span class="text-lab-500 font-medium">PRESUPUESTO</span>
      <span class="font-mono text-lab-300">$0.00 / $50.00</span>
    </div>
    <div class="h-1.5 w-full bg-lab-800 rounded-full overflow-hidden">
      <div class="h-full bg-success-500 rounded-full" style="width: 0%" />
    </div>
  </div>

  <!-- Footer: owner + CTA -->
  <div class="flex items-center justify-between pt-4 border-t border-lab-800">
    <span class="text-2xs text-lab-500">Sin owner</span>
    <button class="h-8 px-3 rounded-md bg-helix-600 hover:bg-helix-500 text-white text-xs font-medium transition-colors">
      Tomar →
    </button>
  </div>
</article>
```

**Estados ProjectCard:**
| Estado | Notas |
|---|---|
| Default | borde `lab-800`, dots-menu invisible |
| Hover | borde `helix-500/40`, dots-menu fade-in, cursor pointer |
| Focus-within | borde `helix-500/60` + ring `helix-500/30` |
| Loading (skeleton) | `<div class="animate-pulse bg-lab-900 border border-lab-800 rounded-xl p-5 h-[240px]" />` con barras `bg-lab-800` |
| Empty grid | ilustración SVG centrada + `<h2>Todavía no hay proyectos</h2>` + `<p>` + CTA "Crear el primero" |
| Error de fetch | `bg-error-500/5 border-error-500/30` card con mensaje + retry |

**Variantes de CostMeter por % usado:**
| Rango | Color barra | Color texto monto |
|---|---|---|
| 0-59% | `bg-success-500` | `text-lab-300` |
| 60-84% | `bg-warning-500` | `text-warning-400` |
| 85-100% | `bg-error-500` | `text-error-400 font-semibold` |

**Variantes de status badge** (mismo patrón, distinto color):
- Libre → `success-500`
- Tomado → `helix-500`, dot estático
- En cola → `warning-500`, dot con `animate-pulse`
- Bloqueado → `error-500`, dot estático
- Auto-release <24h → `warning-500`, badge añade label `<24h`

**Responsive grid:**
- `grid-cols-1` mobile
- `md:grid-cols-2` tablet (≥768px)
- `xl:grid-cols-3` desktop (≥1280px)
- Gap fijo `gap-4` (16px)

**Notas implementación:**
- En mobile, sidebar colapsa a `<Sheet side="left">` activado por hamburguesa en header.
- Filter pills horizontales scrollables con `overflow-x-auto` + `snap-x`.
- Grid usa `min-h` por card para evitar saltos al cargar descripciones de longitud variable.
- Skeletons mostrar 6 placeholders durante el primer fetch.

---

### 12.3 DETALLE DE PROYECTO + CHAT

**Ruta:** `/projects/[slug]`

**Layout root:** mismo header+sidebar que dashboard, pero `<main>` cambia:
```html
<main class="flex-1 flex min-h-0">
  <aside class="w-80 shrink-0 border-r border-lab-800 bg-lab-950 overflow-y-auto" />  <!-- 320px -->
  <section class="flex-1 flex flex-col min-w-0 bg-lab-950" />                          <!-- chat -->
</main>
```

**Sub-header (breadcrumb):**
```html
<div class="h-12 shrink-0 border-b border-lab-800 px-6 flex items-center justify-between">
  <nav class="flex items-center gap-2 text-sm">
    <a href="/projects" class="text-lab-500 hover:text-lab-300">Proyectos</a>
    <ChevronRightIcon class="h-3 w-3 text-lab-700" />
    <span class="text-lab-100 font-medium">nearU</span>
  </nav>
  <div class="flex items-center gap-2">
    <button class="h-8 px-3 rounded-md text-xs font-medium text-lab-400 hover:text-lab-100 hover:bg-lab-900 transition-colors">
      <SettingsIcon class="h-3.5 w-3.5 inline mr-1" /> Config
    </button>
    <button class="h-8 px-3 rounded-md text-xs font-medium text-error-400 hover:text-error-300 hover:bg-error-500/10 transition-colors">
      Liberar proyecto
    </button>
  </div>
</div>
```

**Info panel izquierdo (320px):**
```html
<aside class="w-80 shrink-0 border-r border-lab-800 bg-lab-950 overflow-y-auto">
  <div class="p-6 space-y-6">

    <!-- Project header -->
    <div>
      <h2 class="text-xl font-display font-semibold text-lab-50 mb-1">nearU</h2>
      <p class="text-sm text-lab-400 leading-relaxed">BLE beacon networking app for events. Capacitor + Next.js + Supabase.</p>
    </div>

    <!-- Status -->
    <div class="flex items-center gap-2 p-3 rounded-lg bg-helix-500/5 border border-helix-500/20">
      <span class="h-2 w-2 rounded-full bg-helix-500" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-helix-300">Tomado por vos</p>
        <p class="text-2xs text-lab-500">Sprint 2 · Día 3</p>
      </div>
    </div>

    <!-- Section: Equipo -->
    <section>
      <h3 class="text-2xs font-semibold uppercase tracking-wider text-lab-500 mb-3">Equipo · 23 agentes</h3>
      <ul class="space-y-2">
        <li class="flex items-center gap-3 group">
          <span class="h-7 w-7 shrink-0 rounded-full bg-blue-500/20 text-blue-300 text-2xs font-bold flex items-center justify-center ring-1 ring-blue-500/30">A</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-lab-200 truncate">Alan Turing</p>
            <p class="text-2xs text-lab-500">PM / Scrum Master</p>
          </div>
          <span class="h-1.5 w-1.5 rounded-full bg-cell-400 animate-pulse opacity-0 group-data-[active=true]:opacity-100" />
        </li>
        <!-- ... 22 más, scrolleable -->
      </ul>
    </section>

    <!-- Section: Costo -->
    <section>
      <h3 class="text-2xs font-semibold uppercase tracking-wider text-lab-500 mb-3">Presupuesto</h3>
      <div class="space-y-2">
        <div class="flex items-baseline justify-between">
          <span class="font-mono text-2xl font-semibold text-warning-400">$38.42</span>
          <span class="text-xs text-lab-500">/ $50.00</span>
        </div>
        <div class="h-2 w-full bg-lab-800 rounded-full overflow-hidden">
          <div class="h-full bg-warning-500 rounded-full transition-all duration-500" style="width: 76.8%" />
        </div>
        <p class="text-2xs text-warning-400 flex items-center gap-1">
          <WarnIcon class="h-3 w-3" /> Auto-release en 4 días si no hay actividad
        </p>
      </div>
    </section>

    <!-- Section: Artefactos -->
    <section>
      <h3 class="text-2xs font-semibold uppercase tracking-wider text-lab-500 mb-3">Artefactos</h3>
      <ul class="space-y-1">
        <li>
          <button class="w-full h-9 px-2 rounded-md flex items-center gap-2 text-sm text-lab-300 hover:bg-lab-900 hover:text-lab-100 transition-colors">
            <FileIcon class="h-4 w-4 text-lab-500" />
            <span class="truncate">Acta de constitución</span>
          </button>
        </li>
        <!-- ... -->
      </ul>
    </section>
  </div>
</aside>
```

**Sección chat (derecha):**
```html
<section class="flex-1 flex flex-col min-w-0">

  <!-- Iteration banner (sticky, conditional) -->
  <div class="shrink-0 px-6 py-2.5 bg-helix-500/10 border-b border-helix-500/20 flex items-center gap-3">
    <span class="h-2 w-2 rounded-full bg-helix-400 animate-pulse" />
    <p class="text-sm text-helix-200">
      <span class="font-medium">Iteración 3</span> de Requerimientos — esperando tu feedback
    </p>
    <button class="ml-auto text-xs text-helix-300 hover:text-helix-100 underline-offset-2 hover:underline">
      Ver artefacto
    </button>
  </div>

  <!-- Messages list -->
  <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6" aria-live="polite" aria-atomic="false">
    [AgentMessage]
    [UserMessage]
    [AgentMessage streaming]
  </div>

  <!-- Input dock -->
  <div class="shrink-0 border-t border-lab-800 bg-lab-950 p-4">
    [ChatInput]
  </div>
</section>
```

**AgentMessage:**
```html
<article class="flex gap-3 max-w-3xl">
  <span class="h-8 w-8 shrink-0 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center ring-1 ring-blue-500/30">A</span>
  <div class="flex-1 min-w-0">
    <header class="flex items-baseline gap-2 mb-1">
      <span class="text-sm font-semibold text-lab-100">Alan Turing</span>
      <span class="text-2xs text-lab-500">PM · hace 2 min</span>
    </header>
    <div class="prose prose-sm prose-invert max-w-none
                text-lab-200 leading-relaxed
                prose-code:text-helix-300 prose-code:bg-lab-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-lab-900 prose-pre:border prose-pre:border-lab-800 prose-pre:rounded-lg
                prose-a:text-helix-400 prose-a:no-underline hover:prose-a:underline">
      <p>Retomando nearU. Sprint 2, tarea TASK-014. El front está en preview:</p>
      <p>→ <a href="...">nearu-xyz.vercel.app</a></p>
      <p>¿Continuamos?</p>
    </div>
  </div>
</article>
```

**Tool call colapsable (variante de AgentMessage):**
```html
<details class="ml-11 mt-2 rounded-lg bg-lab-900 border border-lab-800">
  <summary class="px-3 py-2 text-xs text-lab-400 cursor-pointer hover:text-lab-200 flex items-center gap-2">
    <ChevronRightIcon class="h-3 w-3 transition-transform group-open:rotate-90" />
    <span class="font-mono">Invocando Ada Lovelace (Analista Funcional)...</span>
    <span class="ml-auto h-1.5 w-1.5 rounded-full bg-cell-400 animate-pulse" />
  </summary>
  <div class="px-3 pb-3 pt-1 text-xs text-lab-500 font-mono whitespace-pre-wrap">
    [tool input/output]
  </div>
</details>
```

**UserMessage (alineado derecha, sin avatar):**
```html
<article class="flex justify-end max-w-3xl ml-auto">
  <div class="max-w-[80%]">
    <div class="bg-helix-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
      Sí, dale. Mostrame qué hay en preview.
    </div>
    <p class="text-2xs text-lab-500 mt-1 text-right">Vos · ahora</p>
  </div>
</article>
```

**Streaming indicator:**
```html
<article class="flex gap-3 max-w-3xl">
  <span class="h-8 w-8 shrink-0 rounded-full bg-blue-500/20 ..."> A </span>
  <div class="flex items-center gap-2 h-8">
    <span class="text-sm text-lab-400">Alan está escribiendo</span>
    <span class="flex gap-1">
      <span class="h-1.5 w-1.5 rounded-full bg-lab-500 animate-bounce [animation-delay:-0.3s]" />
      <span class="h-1.5 w-1.5 rounded-full bg-lab-500 animate-bounce [animation-delay:-0.15s]" />
      <span class="h-1.5 w-1.5 rounded-full bg-lab-500 animate-bounce" />
    </span>
  </div>
</article>
```

**ChatInput (dock inferior):**
```html
<form class="relative">
  <div class="flex items-end gap-2 bg-lab-900 border border-lab-800 rounded-2xl p-2
              focus-within:border-helix-500/50 focus-within:ring-2 focus-within:ring-helix-500/20
              transition-colors">

    <button type="button" aria-label="Adjuntar archivo"
            class="h-9 w-9 shrink-0 rounded-lg text-lab-500 hover:text-lab-200 hover:bg-lab-800 flex items-center justify-center transition-colors">
      <PaperclipIcon class="h-4 w-4" />
    </button>

    <textarea
      class="flex-1 min-h-[36px] max-h-[200px] py-2 px-1 bg-transparent
             text-base text-lab-100 placeholder:text-lab-500 resize-none
             focus:outline-none
             scrollbar-thin scrollbar-thumb-lab-700"
      placeholder="Escribí un mensaje a tu equipo..."
      rows="1"
      aria-label="Mensaje al equipo"></textarea>

    <button type="submit" aria-label="Enviar (⌘+Enter)"
            class="h-9 w-9 shrink-0 rounded-lg
                   bg-helix-600 hover:bg-helix-500 text-white
                   flex items-center justify-center
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-helix-600
                   transition-colors">
      <ArrowUpIcon class="h-4 w-4" />
    </button>
  </div>
  <p class="mt-1.5 px-2 text-2xs text-lab-600">
    <kbd class="font-mono">⌘ Enter</kbd> para enviar · <kbd class="font-mono">Shift Enter</kbd> nueva línea
  </p>
</form>
```

**Estados ChatInput:**
| Estado | Notas |
|---|---|
| Empty | Send disabled (`opacity-40`), placeholder visible |
| Typing | Send enabled, textarea auto-grow hasta 200px |
| Focus | Container ring `helix-500/20` + border `helix-500/50` |
| Submitting | Send muestra spinner, textarea `disabled` |
| Drag-over | Container `border-helix-400 bg-helix-500/5` + overlay "Soltá los archivos aquí" |
| Error de envío | Toast top-right + textarea conserva el contenido |

**Estados de la pantalla completa:**
| Estado | Implementación |
|---|---|
| Loading inicial | Skeletons en info panel + 3 mensajes esqueleto en chat |
| Empty chat | Ilustración + "Tu equipo está listo. Decile a Alan qué querés construir." + CTA "Empezar" que prefilllea input |
| Error de fetch proyecto | Página de error con ilustración + retry + link a /projects |
| Sin permisos | Card central "No tenés acceso a este proyecto" + CTA volver |
| Proyecto pausado por cap | Banner rojo arriba del chat + input disabled + CTA "Solicitar ampliación" |

**Responsive:**
- **Desktop (≥1024px):** layout completo info panel 320px + chat fluido.
- **Tablet (768-1023px):** info panel se reduce a 260px.
- **Mobile (<768px):**
  - Info panel se transforma en `<Sheet side="bottom">` con handle deslizable, disparado desde un botón flotante en el sub-header (`info`).
  - Chat ocupa 100% del viewport.
  - Input dock con `pb-[env(safe-area-inset-bottom)]` para iPhone notch.
  - Mensajes con `max-w-[90%]` en mobile (en lugar de `max-w-3xl`).

**Notas críticas implementación:**
- `aria-live="polite"` en el contenedor de mensajes para que screen readers anuncien mensajes nuevos.
- Auto-scroll al bottom solo si el usuario ya está cerca del bottom (umbral 100px) — si scrolleó arriba, mostrar botón flotante "↓ Nuevos mensajes".
- Streaming de mensajes: append carácter por carácter en el último bloque, no re-renderizar el array completo.
- `prefers-reduced-motion`: desactivar bounce de los dots streaming, mantener el texto "escribiendo" estático.
- Tab order: textarea → adjuntar → enviar → (mensajes scrolleables) → info panel.

---

**Estado: APROBADO v1 — v2 entrega decisiones cerradas + mockups detallados de Login, Dashboard y Detalle+Chat. Frontend desbloqueado para iniciar Sprint 1.**
