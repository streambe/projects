# Wireframes y Especificaciones UI/UX -- LeadGen MVP

**Proyecto**: LeadGen - Generacion de leads B2B via LinkedIn
**Version**: 1.0 (Iteracion 1)
**Fecha**: 2026-04-03
**Responsable**: Leonardo Da Vinci (Disenador UI/UX/CX)
**Estado**: DRAFT - Pendiente aprobacion del usuario

---

## 1. Decisiones de Diseno Global

### 1.1 Navegacion: Sidebar fija

Sidebar izquierda colapsable (iconos) + area de contenido principal. Razon: la app tiene 6+ secciones, top nav no escala. Sidebar permite navegacion rapida sin perder contexto.

```
SIDEBAR (240px expandida / 64px colapsada)
─────────────────────────────────────
  [Logo LeadGen]

  Dashboard          (BarChart3 icon)
  Pipeline           (Kanban icon)
  Acciones del dia   (CalendarCheck icon)
  Secuencias         (GitBranch icon)
  Templates          (FileText icon)
  Import             (Upload icon)

  ─── separador ───

  [Avatar] Gaston    (Settings, Logout)
```

### 1.2 Paleta de colores

Profesional B2B, oscura pero no intimidante. Compatible con shadcn/ui.

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#2563eb` (blue-600) | CTAs, links, sidebar activo, focus rings |
| Primary hover | `#1d4ed8` (blue-700) | Hover en CTAs |
| Success | `#16a34a` (green-600) | Respuesta positiva, conversion, cliente |
| Warning | `#d97706` (amber-600) | Leads enfriandose, alertas medianas |
| Danger | `#dc2626` (red-600) | Respuesta negativa, errores, eliminar |
| Neutral BG | `#f8fafc` (slate-50) | Fondo de pagina |
| Neutral Card | `#ffffff` | Cards, modales |
| Neutral Border | `#e2e8f0` (slate-200) | Bordes |
| Text Primary | `#0f172a` (slate-900) | Texto principal |
| Text Secondary | `#64748b` (slate-500) | Texto secundario, labels |
| Score Cold | `#94a3b8` (slate-400) | Score 0-19 |
| Score Warm | `#f59e0b` (amber-500) | Score 20-39 |
| Score MQL | `#f97316` (orange-500) | Score 40-69 |
| Score SQL | `#ef4444` (red-500) | Score 70-99 |
| Score Hot | `#dc2626` (red-600) | Score 100+ |

### 1.3 Tipografia

- **Font**: Inter (ya incluida en shadcn/ui por defecto)
- **Body**: 14px / 0.875rem -- densidad alta, herramienta interna
- **Headings**: 18px (h3), 20px (h2), 24px (h1)
- **Labels/captions**: 12px
- **Monospace** (scores, numeros): Tabular nums via `font-variant-numeric: tabular-nums`

### 1.4 Responsive

**NO para MVP**. Solo desktop 1280px+. El equipo de Streambe trabaja desde desktop. Si alguien abre en tablet, el layout se mantiene con scroll horizontal antes que romperse.

### 1.5 Componentes shadcn/ui a usar

| Componente | Uso |
|------------|-----|
| Button | CTAs, acciones |
| Card | Lead cards, metricas |
| Dialog/Sheet | Detalle de lead, formularios |
| DropdownMenu | Acciones contextuales |
| Input/Textarea | Formularios |
| Badge | Score, etapas, tags |
| Table | Vista lista, templates |
| Tabs | Navegacion interna |
| Toast | Feedback de acciones |
| Select | Filtros |
| Tooltip | Info adicional |
| Command | Busqueda rapida (Cmd+K) |

---

## 2. Wireframes por Pantalla

### 2.1 Login

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│              ┌─────────────────┐                 │
│              │   [Logo]        │                 │
│              │   LeadGen       │                 │
│              │                 │                 │
│              │  Email          │                 │
│              │  ┌───────────┐  │                 │
│              │  │           │  │                 │
│              │  └───────────┘  │                 │
│              │                 │                 │
│              │  Password       │                 │
│              │  ┌───────────┐  │                 │
│              │  │           │  │                 │
│              │  └───────────┘  │                 │
│              │                 │                 │
│              │  [  Ingresar ]  │                 │
│              │                 │                 │
│              └─────────────────┘                 │
│                                                  │
│          Streambe - Herramienta interna          │
└──────────────────────────────────────────────────┘
```

**Notas UX**:
- Centrado vertical y horizontal, card con sombra sutil
- Sin "olvidaste tu password" en MVP (2 usuarios, se resetea manual)
- Sin registro publico (admin crea usuarios)
- Error inline bajo el campo que fallo
- Rate limiting: mostrar countdown "Intenta en X segundos"

---

### 2.2 Dashboard

```
┌────┬─────────────────────────────────────────────────────┐
│ S  │  Dashboard                          [Buscar Cmd+K] │
│ I  │─────────────────────────────────────────────────────│
│ D  │                                                     │
│ E  │  Filtro: [Esta semana v]  [Este mes]  [3 meses]    │
│ B  │                                                     │
│ A  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│ R  │  │ 12       │ │ 3        │ │ 45%      │ │ 5      ││
│    │  │ Leads    │ │ Reuniones│ │ Tasa     │ │ Leads  ││
│    │  │ nuevos   │ │ agendadas│ │ respuesta│ │ hot    ││
│    │  │ +4 vs ant│ │ +1 vs ant│ │ +5% vs   │ │ >70 sc ││
│    │  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│    │                                                     │
│    │  ┌─────────────────────────┐ ┌─────────────────────┐│
│    │  │ FUNNEL                  │ │ ALERTAS ACTIVAS     ││
│    │  │                         │ │                     ││
│    │  │ Lead frio      ██ 45   │ │ ! Juan P. cruzo SQL ││
│    │  │ Conectado      ██ 32   │ │ ! Maria L. se enfria││
│    │  │ Engaged        ██ 18   │ │ ! 3 acciones hoy    ││
│    │  │ MQL            ██ 8    │ │ ! Nuevo MQL: Pedro  ││
│    │  │ SQL            ██ 3    │ │                     ││
│    │  │ Oportunidad    ██ 2    │ │ [Ver todas]         ││
│    │  │ Propuesta      ██ 1    │ │                     ││
│    │  │ Negociacion    ██ 1    │ └─────────────────────┘│
│    │  │ Cliente        ██ 0    │                         │
│    │  └─────────────────────────┘                        │
│    │                                                     │
│    │  ┌─────────────────────────┐ ┌─────────────────────┐│
│    │  │ ACTIVIDAD SEMANAL       │ │ LEADS CALIENTES     ││
│    │  │                         │ │ score > 70          ││
│    │  │ Invitaciones: 25  (+5)  │ │                     ││
│    │  │ Mensajes:     18  (+3)  │ │ Juan Perez    82 ██ ││
│    │  │ Respuestas:    8  (+2)  │ │ HospitalItal.      ││
│    │  │ Reuniones:     3  (+1)  │ │                     ││
│    │  │                         │ │ Ana Gomez     75 ██ ││
│    │  │ [barras de progreso]    │ │ Clinica Norte      ││
│    │  └─────────────────────────┘ └─────────────────────┘│
└────┴─────────────────────────────────────────────────────┘
```

**Notas UX**:
- Las 4 metricas top son KPIs con comparacion vs periodo anterior (delta verde/rojo)
- Funnel chart: barras horizontales, clickeables (va al pipeline filtrado por esa etapa)
- Alertas: clickeables, llevan directo a la ficha del lead
- Leads calientes: top 5 por score, click abre ficha
- Layout: 2 columnas (funnel + alertas arriba, actividad + hot leads abajo)

---

### 2.3 Pipeline Kanban

```
┌────┬─────────────────────────────────────────────────────────────────┐
│ S  │  Pipeline    [Kanban | Lista]    [Filtros v]   [Buscar Cmd+K]  │
│ I  │─────────────────────────────────────────────────────────────────│
│ D  │  Filtros activos: Score > 20  x  |  Tier 1  x  |  [Limpiar]  │
│ E  │                                                                 │
│ B  │  Lead frio(45) Conectado(32) Engaged(18) MQL(8) SQL(3) Oport..│
│ A  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────┐  ┌────┐       │
│ R  │  │ Juan P. │  │ Ana G.  │  │ Pedro M.│  │... │  │... │       │
│    │  │ HospIt  │  │ CliNort │  │ SanCar  │  │    │  │    │       │
│    │  │ ██ 35   │  │ ██ 52   │  │ ██ 41   │  │    │  │    │       │
│    │  │ Tier 1  │  │ Tier 2  │  │ Tier 1  │  │    │  │    │       │
│    │  │ hace 2d │  │ hace 1d │  │ hoy     │  │    │  │    │       │
│    │  └─────────┘  └─────────┘  └─────────┘  └────┘  └────┘       │
│    │  ┌─────────┐  ┌─────────┐                                      │
│    │  │ Maria L.│  │ Carlos R│                                      │
│    │  │ Medicus │  │ SaludPl │                                      │
│    │  │ ██ 12   │  │ ██ 28   │                                      │
│    │  │ Tier 3  │  │ Tier 1  │                                      │
│    │  │ hace 5d │  │ hace 3d │                                      │
│    │  └─────────┘  └─────────┘                                      │
│    │                                                                 │
│    │  [scroll horizontal para ver todas las columnas -->]            │
└────┴─────────────────────────────────────────────────────────────────┘
```

**Lead Card (dentro del Kanban)**:
```
┌─────────────────────┐
│ Juan Perez        > │  ← click abre ficha (Sheet desde derecha)
│ Hospital Italiano   │
│ CTO                 │
│ ██████░░ 35         │  ← barra de score con color segun rango
│ Tier 1  ·  hace 2d  │  ← tier badge + ultimo contacto relativo
│ [Secuencia: Paso 3] │  ← solo si tiene secuencia activa
└─────────────────────┘
```

**Interacciones**:
- **Drag & drop**: mover cards entre columnas. Al soltar, si salta etapas, dialog de confirmacion. Si mueve a "Cliente", dialog especial.
- **Click en card**: abre Sheet (panel lateral derecho) con ficha completa
- **Toggle Kanban/Lista**: switch en header. Vista lista = tabla con todas las columnas del lead
- **Filtros**: dropdown multiple con chips activos. Se pueden combinar.
- **Buscar**: Cmd+K abre command palette con busqueda de leads
- **Scroll horizontal**: las 9 columnas no caben, scroll suave. Columnas con mas leads tienen scroll vertical interno.

**Columna header**:
```
┌──────────────────┐
│ MQL (8)    [+]   │  ← nombre etapa + count + boton agregar lead rapido
├──────────────────┤
```

---

### 2.4 Detalle de Lead (Sheet / Panel lateral)

Se abre como Sheet (slide-in desde la derecha, 600px ancho). NO como pagina completa -- asi el usuario no pierde contexto del pipeline.

```
┌────────────────────────────────────────────────────┐
│  [<- Cerrar]                    [Abrir LinkedIn >] │
│                                                    │
│  Juan Perez                                        │
│  CTO - Hospital Italiano                           │
│  linkedin.com/in/juanperez                         │
│                                                    │
│  Score: ██████████░░ 82  [SQL]     Tier: [1]       │
│  Etapa: SQL                        Asignado: Gaston│
│  Ultimo contacto: hace 1 dia                       │
│  Proxima accion: Manana (Paso 4 de secuencia)      │
│                                                    │
│  Tags: [salud] [buenos-aires] [+]                  │
│                                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Historial] [Notas] [Secuencia] [Datos]     │   │
│  ├─────────────────────────────────────────────┤   │
│  │                                             │   │
│  │  HISTORIAL (timeline)                       │   │
│  │                                             │   │
│  │  03 abr - Respondio positivo (+15)          │   │
│  │           "Me interesa, contame mas"        │   │
│  │                                             │   │
│  │  01 abr - Mensaje enviado (Paso 3)          │   │
│  │           Secuencia: Post-conexion          │   │
│  │                                             │   │
│  │  28 mar - Acepto conexion (+5)              │   │
│  │                                             │   │
│  │  27 mar - Invitacion enviada                │   │
│  │           Movido a: Conectado               │   │
│  │                                             │   │
│  │  25 mar - Importado via CSV                 │   │
│  │           Score inicial: 45                 │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  [+ Registrar interaccion]  [+ Agregar nota]       │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Tabs del detalle**:
- **Historial**: timeline cronologico (mas reciente arriba) con interacciones, cambios de etapa, notas
- **Notas**: lista de notas con textarea para agregar nueva
- **Secuencia**: estado de la secuencia activa, pasos completados, boton copiar mensaje del paso actual
- **Datos**: formulario editable con todos los campos del lead (empresa, cargo, tier, region, etc.)

**Interacciones**:
- "Registrar interaccion": dropdown con tipos (mensaje enviado, respuesta positiva, etc.) -- al seleccionar, se actualiza score automaticamente y se muestra el delta
- "Agregar nota": textarea + boton guardar
- "Abrir LinkedIn": abre perfil en nueva pestana
- Tags: click en [+] abre input, escribir y Enter para agregar
- Etapa: se puede cambiar desde aca tambien (dropdown), con misma logica de confirmacion que drag & drop

---

### 2.5 Import de Leads

```
┌────┬──────────────────────────────────────────────────────┐
│ S  │  Importar Leads                                      │
│ I  │──────────────────────────────────────────────────────│
│ D  │                                                      │
│ E  │  ┌────────────────────────┐ ┌───────────────────────┐│
│ B  │  │                        │ │                       ││
│ A  │  │  DESDE LINKEDIN URL    │ │  DESDE CSV            ││
│ R  │  │                        │ │  (Sales Navigator)    ││
│    │  │  Pega la URL del       │ │                       ││
│    │  │  perfil de LinkedIn    │ │  Arrastra tu CSV      ││
│    │  │                        │ │  o click para subir   ││
│    │  │  ┌──────────────────┐  │ │                       ││
│    │  │  │ linkedin.com/in/ │  │ │  ┌─────────────────┐  ││
│    │  │  └──────────────────┘  │ │  │  [Icono upload]  │  ││
│    │  │                        │ │  │  .csv hasta 1MB  │  ││
│    │  │  [ Extraer datos ]     │ │  └─────────────────┘  ││
│    │  │                        │ │                       ││
│    │  └────────────────────────┘ └───────────────────────┘│
│    │                                                      │
│    │  ── RESULTADO (despues de extraer/subir) ──────────  │
│    │                                                      │
│    │  Resumen: 47 nuevos | 3 duplicados | 50 total       │
│    │                                                      │
│    │  ┌────────────────────────────────────────────────┐  │
│    │  │ # │ Nombre     │ Empresa      │ Cargo │ Estado │  │
│    │  │ 1 │ Juan Perez │ Hospital It. │ CTO   │ Nuevo  │  │
│    │  │ 2 │ Ana Gomez  │ Clinica N.   │ Dir.  │ Nuevo  │  │
│    │  │ 3 │ Pedro M.   │ San Carlos   │ Ger.  │ DUPL.  │  │
│    │  │   │            │              │       │ [Accion]│  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  Duplicados: [Saltar todos v]                        │
│    │  Tier por defecto: [Sin asignar v]                   │
│    │                                                      │
│    │  [ Cancelar ]                [ Importar 47 leads ]   │
│    │                                                      │
└────┴──────────────────────────────────────────────────────┘
```

**Flujo URL individual**:
1. Pegar URL -> click "Extraer datos"
2. Si exito: muestra formulario pre-llenado (nombre, empresa, cargo, headline) editable
3. Si falla: muestra formulario vacio con URL pre-cargada, mensaje "No se pudieron extraer datos, completa manualmente"
4. Si duplicado: alerta con opciones "Ver existente" / "Actualizar"
5. Guardar -> lead aparece en pipeline como "Lead frio"

**Flujo CSV**:
1. Drag & drop o click para subir
2. Muestra tabla preview con mapping automatico
3. Resumen: nuevos / duplicados / total
4. Opcion global para duplicados: saltar todos / actualizar todos
5. Opcion de tier por defecto
6. Confirmar -> progress bar -> resultado final

---

### 2.6 Acciones del Dia (Outreach diario)

```
┌────┬──────────────────────────────────────────────────────┐
│ S  │  Acciones del dia          Hoy: 3 abril 2026        │
│ I  │──────────────────────────────────────────────────────│
│ D  │                                                      │
│ E  │  8 acciones pendientes para hoy                      │
│ B  │                                                      │
│ A  │  ┌────────────────────────────────────────────────┐  │
│ R  │  │  Juan Perez - Hospital Italiano                │  │
│    │  │  Secuencia: Post-conexion · Paso 3 (Dia 7)     │  │
│    │  │  Canal: LinkedIn                                │  │
│    │  │                                                 │  │
│    │  │  ┌──────────────────────────────────────────┐   │  │
│    │  │  │ Hola Juan, vi que en Hospital Italiano   │   │  │
│    │  │  │ estan expandiendo el area de tecnologia. │   │  │
│    │  │  │ Te comparto este caso de exito que...    │   │  │
│    │  │  └──────────────────────────────────────────┘   │  │
│    │  │                                                 │  │
│    │  │  [Copiar mensaje]  [Enviado] [Respondio v] [Skip]│  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  ┌────────────────────────────────────────────────┐  │
│    │  │  Ana Gomez - Clinica Norte                     │  │
│    │  │  Secuencia: Post-conexion · Paso 1 (Dia 1)     │  │
│    │  │  ...                                           │  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  ... (6 mas)                                         │
│    │                                                      │
└────┴──────────────────────────────────────────────────────┘
```

**Cada card de accion**:
- Nombre del lead (clickeable -> abre ficha)
- Secuencia + paso + dia
- Template renderizado con los datos del lead (preview completo)
- Botones:
  - **Copiar mensaje**: copia al clipboard, toast "Mensaje copiado"
  - **Enviado**: marca como enviado, avanza al siguiente paso
  - **Respondio**: dropdown (positivo/neutral/negativo) -- pausa secuencia si responde
  - **Skip**: saltar este paso (mover al siguiente sin marcar enviado)

**Estado vacio**: "No hay acciones pendientes para hoy. Buen trabajo!" con ilustracion simple.

---

### 2.7 Secuencias

```
┌────┬──────────────────────────────────────────────────────┐
│ S  │  Secuencias                      [+ Nueva secuencia] │
│ I  │──────────────────────────────────────────────────────│
│ D  │                                                      │
│ E  │  ┌────────────────────────────────────────────────┐  │
│ B  │  │  Post-conexion estandar          [Sistema]     │  │
│ A  │  │  5 pasos · 21 dias · 12 leads activos          │  │
│ R  │  │  [Ver detalle]  [Duplicar]                      │  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  ┌────────────────────────────────────────────────┐  │
│    │  │  Secuencia InMail VIP            [Activa]      │  │
│    │  │  3 pasos · 14 dias · 4 leads activos            │  │
│    │  │  [Ver detalle]  [Editar]  [Desactivar]          │  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  ── Detalle de secuencia (expandido) ──────────────  │
│    │                                                      │
│    │  Post-conexion estandar                              │
│    │                                                      │
│    │  Dia 0  ──●── Nada (solo conectar)                   │
│    │            │                                         │
│    │  Dia 1  ──●── Agradecimiento + valor                 │
│    │            │   Template: "Conexion - Agradecimiento" │
│    │            │   Canal: LinkedIn                        │
│    │            │                                         │
│    │  Dia 4  ──●── Engagement                              │
│    │            │   Template: "Follow-up - Engagement"    │
│    │            │   Canal: LinkedIn                        │
│    │            │                                         │
│    │  Dia 7  ──●── Pregunta descubrimiento                 │
│    │            │   Template: "Follow-up - Descubrimiento"│
│    │            │                                         │
│    │  Dia 14 ──●── Contenido + CTA                         │
│    │            │   Template: "Follow-up - Contenido"     │
│    │            │                                         │
│    │  Dia 21 ──●── Breakup                                  │
│    │                Template: "Breakup"                    │
│    │                                                      │
└────┴──────────────────────────────────────────────────────┘
```

**Interacciones**:
- Lista de secuencias con badges (Sistema = no eliminable, Activa/Inactiva)
- Click en "Ver detalle" expande inline la timeline visual de pasos
- Editar secuencia: reordenar pasos, cambiar templates, cambiar dias
- Nueva secuencia: nombre + agregar pasos uno a uno (dia + template + canal)
- Secuencias de sistema: solo se pueden duplicar, no editar/eliminar

---

### 2.8 Templates

```
┌────┬──────────────────────────────────────────────────────┐
│ S  │  Templates                          [+ Nuevo template]│
│ I  │──────────────────────────────────────────────────────│
│ D  │                                                      │
│ E  │  Filtro: [Todos v]  [conexion] [follow_up] [inmail]  │
│ B  │                                                      │
│ A  │  ┌────────────────────────────────────────────────┐  │
│ R  │  │ Nombre           │ Tipo      │ Canal   │       │  │
│    │  │──────────────────│───────────│─────────│───────│  │
│    │  │ Conexion - Var A │ conexion  │ LinkedIn│ [Edit]│  │
│    │  │ Conexion - Var B │ conexion  │ LinkedIn│ [Edit]│  │
│    │  │ Conexion - Var C │ conexion  │ LinkedIn│ [Edit]│  │
│    │  │ Follow-up Dia 1  │ follow_up │ LinkedIn│ [Edit]│  │
│    │  │ Follow-up Dia 4  │ follow_up │ LinkedIn│ [Edit]│  │
│    │  │ InMail Tier 1    │ inmail    │ InMail  │ [Edit]│  │
│    │  │ Breakup          │ breakup   │ LinkedIn│ [Edit]│  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
│    │  ── Editor de template (dialog) ───────────────────  │
│    │                                                      │
│    │  ┌────────────────────────────────────────────────┐  │
│    │  │  Nombre: [Conexion - Variante A          ]     │  │
│    │  │  Tipo: [conexion v]    Canal: [LinkedIn v]     │  │
│    │  │                                                │  │
│    │  │  Contenido:                                    │  │
│    │  │  ┌──────────────────────────────────────────┐  │  │
│    │  │  │ Hola [Nombre], vi que en [empresa]      │  │  │
│    │  │  │ estan trabajando en transformacion       │  │  │
│    │  │  │ digital del sector salud...             │  │  │
│    │  │  └──────────────────────────────────────────┘  │  │
│    │  │                                                │  │
│    │  │  Variables: [Nombre] [empresa] [cargo]         │  │
│    │  │  (click para insertar en cursor)               │  │
│    │  │                                                │  │
│    │  │  Preview con: [Juan Perez v]                   │  │
│    │  │  ┌──────────────────────────────────────────┐  │  │
│    │  │  │ Hola Juan, vi que en Hospital Italiano   │  │  │
│    │  │  │ estan trabajando en transformacion       │  │  │
│    │  │  │ digital del sector salud...             │  │  │
│    │  │  └──────────────────────────────────────────┘  │  │
│    │  │                                                │  │
│    │  │  [Cancelar]                    [Guardar]        │  │
│    │  └────────────────────────────────────────────────┘  │
│    │                                                      │
└────┴──────────────────────────────────────────────────────┘
```

**Notas UX**:
- Variables como botones clickeables que insertan en la posicion del cursor
- Preview en tiempo real con datos de un lead real seleccionable
- Templates de sistema: se pueden editar contenido pero no eliminar (badge "Sistema")
- Contador de caracteres (LinkedIn tiene limite de ~300 para conexion, ~1900 para mensaje)

---

## 3. Componentes Reutilizables

### 3.1 Lead Card (Kanban)

```
Tamano: ~200px ancho, alto variable
Padding: 12px
Border: 1px slate-200, border-radius 8px
Hover: shadow-sm, border-primary (sutil)
Drag: opacity 0.5, shadow-lg en clone

Contenido:
- Nombre (14px, semibold, truncate 1 linea)
- Empresa (13px, text-secondary, truncate 1 linea)
- Barra de score (alto 4px, color segun rango, ancho proporcional a 100)
- Score numero (12px, bold, color segun rango)
- Tier badge (12px, outline badge)
- Ultimo contacto relativo (12px, text-secondary)
- Indicador de secuencia activa (solo si tiene, 12px, text-primary)
```

### 3.2 Score Badge

```
Rangos y colores:
  0-19:   slate-400  bg-slate-50   "Frio"
  20-39:  amber-500  bg-amber-50   "Tibio"
  40-69:  orange-500 bg-orange-50  "MQL"
  70-99:  red-500    bg-red-50     "SQL"
  100+:   red-600    bg-red-100    "HOT"

Formato: [██ 82 SQL] -- barra + numero + label
```

### 3.3 Alerta Card

```
Tipos y colores:
  threshold_mql:     orange icon, "Nuevo MQL"
  threshold_sql:     red icon, "Nuevo SQL"
  lead_enfriandose:  amber icon, "Se enfria"
  accion_pendiente:  blue icon, "Accion pendiente"

Formato: [icon] [Nombre Lead] [mensaje] [hace X]
Click: navega a ficha del lead
```

### 3.4 Timeline Item (Historial)

```
Formato vertical con linea conectora:
  ● Fecha relativa + absoluta
  │ Tipo de interaccion (badge con color)
  │ Detalle/contenido (si hay)
  │ Score delta: +15 (verde) o -10 (rojo)
  │
  ● Siguiente evento...
```

---

## 4. Estados de Componentes

### 4.1 Estados globales

| Estado | Visual |
|--------|--------|
| Loading (pagina) | Skeleton loaders en cards y metricas |
| Loading (accion) | Spinner en boton + boton disabled |
| Error (pagina) | Ilustracion + "Algo salio mal" + boton reintentar |
| Error (formulario) | Borde rojo en campo + mensaje inline debajo |
| Empty (pipeline) | Columna con texto gris "Sin leads" + boton "Importar" |
| Empty (dashboard) | Cards con 0 + CTA "Importa tus primeros leads" |
| Empty (acciones) | Ilustracion + "No hay acciones hoy" |
| Success (toast) | Toast verde esquina inferior derecha, 3s auto-dismiss |

### 4.2 Formularios

- Validacion on-blur (no en cada keystroke)
- Errores en rojo debajo del campo, campo con borde rojo
- Boton submit disabled mientras hay errores
- Loading state en submit: spinner + texto "Guardando..."

---

## 5. Navegacion y Flujos

### 5.1 Mapa de navegacion

```
Login
  └── Dashboard (home)
        ├── Pipeline (Kanban/Lista)
        │     └── Lead Detail (Sheet)
        │           ├── Historial
        │           ├── Notas
        │           ├── Secuencia
        │           └── Datos
        ├── Acciones del dia
        │     └── Lead Detail (Sheet)
        ├── Secuencias
        │     └── Detalle/Editor secuencia
        ├── Templates
        │     └── Editor template (Dialog)
        └── Import
              ├── Via URL
              └── Via CSV
```

### 5.2 Atajos de teclado

| Atajo | Accion |
|-------|--------|
| Cmd+K | Busqueda rapida de leads |
| Escape | Cerrar Sheet/Dialog/Filtros |
| 1-6 | Navegar secciones del sidebar (Dashboard=1, Pipeline=2, etc.) |

---

## 6. Pantalla Gmail (EXCLUIDA del MVP)

Segun la especificacion funcional, la integracion de email (SMTP/IMAP) esta en v2 (V2-05). **No se disena pantalla de Gmail para el MVP**. El outreach se hace via LinkedIn con copy-paste manual.

Si se requiere en el futuro, se disenara como tab adicional en el detalle del lead o como seccion nueva en el sidebar.

---

## 7. Accesibilidad (minimo viable para herramienta interna)

- Contraste AA en todos los textos (verificado con la paleta propuesta)
- Focus visible en todos los interactivos (ring blue-600)
- Labels en todos los inputs
- Aria-labels en iconos sin texto
- Keyboard navigation: Tab para navegar, Enter para activar, Escape para cerrar
- Drag & drop: alternativa via menu contextual "Mover a..." para accesibilidad

---

## 8. Resumen de Prioridades para MVP de 3 dias

| Prioridad | Pantalla | Complejidad |
|-----------|----------|-------------|
| P0 | Pipeline Kanban + Lead Detail | Alta (drag & drop, sheet) |
| P0 | Import CSV + URL | Media |
| P0 | Login | Baja |
| P1 | Acciones del dia | Media |
| P1 | Dashboard | Media (graficos) |
| P1 | Templates CRUD | Baja |
| P2 | Secuencias | Media |
| P2 | Vista Lista (alternativa al Kanban) | Baja |

Recomendacion: si el tiempo aprieta, priorizar Pipeline + Import + Acciones del dia. Dashboard y Templates pueden ser mas simples. Secuencias se pueden simplificar a solo vista (CRUD basico sin timeline visual fancy).

---

*Documento preparado por Leonardo Da Vinci, Disenador UI/UX/CX del equipo GEN.*
*Version 1.0 -- Iteracion 1 -- 2026-04-03*
*Estado: DRAFT -- Pendiente aprobacion del usuario*
