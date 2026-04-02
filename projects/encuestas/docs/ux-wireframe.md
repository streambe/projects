# Especificacion UX/UI -- POC Encuestas Streambe

**Responsable:** Leonardo Da Vinci (Disenador UI/UX/CX)
**Fecha:** 2026-04-01
**Estado:** En iteracion

---

## 1. Paleta de Colores

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#2563EB` | CTA, links, focus rings, badges activos |
| Background | `#FFFFFF` | Fondo general de pagina |
| Text | `#1F2937` | Texto principal (gray-800) |
| Secondary BG | `#F3F4F6` | Fondos secundarios, filas alternas (gray-100) |
| Success | `#22C55E` | Badges "Publicada", toasts de exito |
| Error | `#EF4444` | Validacion, toasts de error, badge cerrada |
| Warning | `#F59E0B` | Badge "Borrador" |
| Border | `#E5E7EB` | Bordes de cards, inputs, tabla (gray-200) |
| Muted Text | `#6B7280` | Texto secundario, placeholders (gray-500) |

### Contraste WCAG AA

| Combinacion | Ratio | Cumple |
|-------------|-------|--------|
| #1F2937 sobre #FFFFFF | 14.7:1 | Si |
| #2563EB sobre #FFFFFF | 4.6:1 | Si |
| #FFFFFF sobre #2563EB | 4.6:1 | Si |
| #6B7280 sobre #FFFFFF | 5.0:1 | Si |

---

## 2. Tipografia

**Familia:** Inter (Tailwind system font stack)

```
font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif
```

| Nivel | Tamano | Peso | Uso |
|-------|--------|------|-----|
| H1 | 30px / 1.875rem | 700 | Titulo de pagina |
| H2 | 24px / 1.5rem | 600 | Secciones principales |
| H3 | 20px / 1.25rem | 600 | Subtitulos |
| Body | 16px / 1rem | 400 | Texto general |
| Small | 14px / 0.875rem | 400 | Labels, helpers, tabla |
| Caption | 12px / 0.75rem | 400 | Badges, metadata |

---

## 3. Wireframes

### 3.1 Login

```
+--------------------------------------------------+
|                                                    |
|                                                    |
|          +----------------------------+            |
|          |                            |            |
|          |     [Logo Streambe]        |            |
|          |                            |            |
|          |  Encuestas Streambe        |            |
|          |                            |            |
|          |  Email                     |            |
|          |  +----------------------+  |            |
|          |  | usuario@ejemplo.com  |  |            |
|          |  +----------------------+  |            |
|          |                            |            |
|          |  Contrasena                |            |
|          |  +----------------------+  |            |
|          |  | ********        [o]  |  |            |
|          |  +----------------------+  |            |
|          |                            |            |
|          |  +----------------------+  |            |
|          |  |  Iniciar sesion      |  |            |
|          |  +----------------------+  |            |
|          |        btn primary         |            |
|          |                            |            |
|          +----------------------------+            |
|                  Card max-w-md                     |
|                  centrada vertical                 |
|                                                    |
+--------------------------------------------------+
```

**Especificaciones:**
- Card: `max-w-md`, padding 32px, border-radius 8px, shadow-lg
- Inputs: height 40px, border gray-200, focus ring primary
- Boton: full-width, height 40px, bg primary, text white, font-weight 500
- Validacion inline debajo de cada campo en rojo (#EF4444)
- Estado loading: spinner en boton, disabled mientras carga

---

### 3.2 Dashboard

```
+------------------------------------------------------------------+
| [Logo]  Encuestas Streambe              usuario@mail   [Salir]   |
+------------------------------------------------------------------+
|                                                                    |
|  Mis Encuestas                          [+ Nueva encuesta]        |
|                                                                    |
|  +-------------------------------+                                 |
|  | Buscar encuestas...        Q  |                                 |
|  +-------------------------------+                                 |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Nombre          | Estado     | Fecha      | Resp. | Acciones | |
|  |-----------------|------------|------------|-------|----------| |
|  | Satisfaccion Q1 | Publicada  | 01/04/2026 |   42  |  [...]   | |
|  | NPS Clientes    | Borrador   | 28/03/2026 |    0  |  [...]   | |
|  | Clima Laboral   | Cerrada    | 15/03/2026 |  128  |  [...]   | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Mostrando 1-3 de 3                    [<] [1] [2] [>]           |
|                                                                    |
+------------------------------------------------------------------+

  Menu acciones [...]:
  +------------------+
  | Editar           |
  | Ver resultados   |
  | Copiar enlace    |
  | Duplicar         |
  |------------------|
  | Eliminar         |  <- text-red
  +------------------+
```

**Badges de estado:**
- Publicada: bg-green-100, text-green-800
- Borrador: bg-yellow-100, text-yellow-800
- Cerrada: bg-gray-100, text-gray-800

**Empty state:**
```
  +----------------------------------------------+
  |                                                |
  |            [icono ClipboardList]                |
  |                                                |
  |         No tenes encuestas todavia             |
  |   Crea tu primera encuesta para empezar        |
  |        a recopilar respuestas.                  |
  |                                                |
  |          [+ Nueva encuesta]                     |
  |                                                |
  +----------------------------------------------+
```

**Especificaciones:**
- Header: height 64px, bg white, border-bottom gray-200
- Tabla: shadcn Table, filas hover bg-gray-50
- Barra busqueda: max-w-sm, icono Search a la izquierda
- Boton nueva: bg primary, text white
- Paginacion: 10 items por pagina

---

### 3.3 Crear / Editar Encuesta

```
+------------------------------------------------------------------+
| [Logo]  Encuestas Streambe              usuario@mail   [Salir]   |
+------------------------------------------------------------------+
|                                                                    |
|  <- Volver          Crear encuesta          [Guardar] [Publicar]  |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Card: Datos generales                                         | |
|  |                                                               | |
|  | Titulo *                                                      | |
|  | +----------------------------------------------------------+ | |
|  | | Encuesta de satisfaccion Q1                               | | |
|  | +----------------------------------------------------------+ | |
|  |                                                               | |
|  | Descripcion                                                   | |
|  | +----------------------------------------------------------+ | |
|  | | Queremos conocer tu opinion...                            | | |
|  | |                                                          | | |
|  | +----------------------------------------------------------+ | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Preguntas (3)                              [+ Agregar pregunta]  |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | [=] 1. Como calificarias nuestro servicio?    Obligatoria    | |
|  |    Tipo: Opcion unica                          [Editar] [X]  | |
|  +--------------------------------------------------------------+ |
|  | [=] 2. Que aspectos podemos mejorar?                         | |
|  |    Tipo: Texto libre                            [Editar] [X]  | |
|  +--------------------------------------------------------------+ |
|  | [=] 3. Recomendarias nuestro servicio?        Obligatoria    | |
|  |    Tipo: Opcion unica                          [Editar] [X]  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+

  Sheet "Agregar pregunta" (desde derecha):
  +------------------------------------+
  | Agregar pregunta              [X]  |
  |                                    |
  | Texto de la pregunta *             |
  | +------------------------------+  |
  | |                              |  |
  | +------------------------------+  |
  |                                    |
  | Tipo de pregunta                   |
  | (o) Texto libre                    |
  | (o) Opcion unica                   |
  | (o) Opcion multiple                |
  | (o) Escala numerica (1-5)          |
  |                                    |
  | Opciones (si aplica)               |
  | +------------------------------+  |
  | | Opcion 1                     |  |
  | +------------------------------+  |
  | | Opcion 2                     |  |
  | +------------------------------+  |
  | [+ Agregar opcion]                 |
  |                                    |
  | [x] Pregunta obligatoria           |
  |                                    |
  | [Agregar]              [Cancelar]  |
  +------------------------------------+
```

**Especificaciones:**
- [=] es el drag handle (icono GripVertical) para reordenar
- Preguntas: cards con border gray-200, padding 16px
- Drag & drop con dnd-kit o similar
- Sheet: width 400px desktop, full-width mobile
- Boton Guardar: variant outline; Publicar: variant default (primary)
- Dialog de confirmacion antes de Publicar
- Validacion: titulo requerido, al menos 1 pregunta

---

### 3.4 Responder Encuesta (Publica)

```
+--------------------------------------+
|  max-width: 640px, centrado          |
|                                      |
|         [Logo Streambe]              |
|                                      |
|  +--------------------------------+  |
|  | ======== 60% =========-------- |  |
|  +--------------------------------+  |
|  Progress bar                        |
|                                      |
|  Encuesta de satisfaccion Q1         |
|  Queremos conocer tu opinion...      |
|                                      |
|  +--------------------------------+  |
|  | 1. Como calificarias nuestro   |  |
|  |    servicio? *                  |  |
|  |                                |  |
|  |    (o) Excelente               |  |
|  |    (o) Bueno                   |  |
|  |    (o) Regular                 |  |
|  |    (o) Malo                    |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  | 2. Que aspectos podemos        |  |
|  |    mejorar?                    |  |
|  |                                |  |
|  |    +------------------------+  |  |
|  |    |                        |  |  |
|  |    |                        |  |  |
|  |    +------------------------+  |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  | 3. Recomendarias nuestro       |  |
|  |    servicio? *                  |  |
|  |                                |  |
|  |    (o) Si                      |  |
|  |    (o) Tal vez                 |  |
|  |    (o) No                      |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  |         Enviar respuesta        |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+

  Pagina de agradecimiento:
+--------------------------------------+
|                                      |
|         [Logo Streambe]              |
|                                      |
|          [icono check]               |
|                                      |
|    Gracias por tu respuesta!         |
|                                      |
|    Tu opinion es muy importante      |
|    para nosotros.                    |
|                                      |
+--------------------------------------+
```

**Especificaciones:**
- Mobile-first: max-width 640px, mx-auto, padding 16px
- Progress bar: bg gray-200, fill primary, height 8px, border-radius full
- Preguntas obligatorias marcadas con asterisco rojo
- Cada pregunta en Card separada, gap 16px
- Boton enviar: full-width, bg primary, height 44px (touch target)
- Pagina gracias: centrada, icono CheckCircle verde 48px
- No requiere autenticacion

---

### 3.5 Resultados

```
+------------------------------------------------------------------+
| [Logo]  Encuestas Streambe              usuario@mail   [Salir]   |
+------------------------------------------------------------------+
|                                                                    |
|  <- Volver       Resultados: Satisfaccion Q1                      |
|                                                                    |
|  +------------------+                                              |
|  |  Total respuestas |  [Exportar CSV] [Exportar Excel]           |
|  |       42          |                                             |
|  +------------------+                                              |
|                                                                    |
|  Tabs: [Graficos] [Respuestas individuales]                        |
|                                                                    |
|  --- Tab Graficos ---                                              |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | 1. Como calificarias nuestro servicio?                        | |
|  |                                                               | |
|  | Excelente  |============== 45%  (19)                          | |
|  | Bueno      |========= 30%  (13)                               | |
|  | Regular    |===== 17%  (7)                                    | |
|  | Malo       |=== 7%  (3)                                       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | 2. Que aspectos podemos mejorar?                              | |
|  |                                                               | |
|  | Respuestas de texto: 38 de 42                                 | |
|  | [Ver todas las respuestas]                                    | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | 3. Recomendarias nuestro servicio?                            | |
|  |                                                               | |
|  | Si        |================ 52%  (22)                         | |
|  | Tal vez   |========== 33%  (14)                               | |
|  | No        |==== 14%  (6)                                      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  --- Tab Respuestas individuales ---                               |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | #  | Fecha      | Pregunta 1  | Pregunta 2       | Preg. 3  | |
|  |----|------------|-------------|------------------|----------| |
|  | 1  | 01/04/2026 | Excelente   | Mejorar tiempos  | Si       | |
|  | 2  | 01/04/2026 | Bueno       | Todo bien        | Tal vez  | |
|  | 3  | 31/03/2026 | Regular     | Atencion lenta   | No       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Mostrando 1-10 de 42                  [<] [1] [2] [3] [>]      |
|                                                                    |
+------------------------------------------------------------------+
```

**Especificaciones:**
- Card de total: bg primary/10, text primary, font-size 36px bold
- Graficos de barras: div con bg primary, width porcentual, height 32px, border-radius 4px
- Tabs: shadcn Tabs para alternar entre graficos y tabla
- Tabla de respuestas: paginada 10 por pagina, scroll horizontal en mobile
- Botones exportar: variant outline, iconos FileDown
- Preguntas de texto: mostrar lista colapsable o dialog

---

## 4. Componentes shadcn/ui

| Componente | Pantalla | Uso |
|------------|----------|-----|
| Card | Todas | Contenedores principales |
| Input | Login, Crear, Dashboard | Campos de texto |
| Button | Todas | Acciones primarias y secundarias |
| Label | Login, Crear, Responder | Labels de formularios |
| Table | Dashboard, Resultados | Listados tabulares |
| Badge | Dashboard | Estado de encuestas |
| DropdownMenu | Dashboard | Menu acciones por encuesta |
| Dialog | Crear | Confirmacion de publicar, eliminar |
| Textarea | Crear, Responder | Descripcion, respuestas texto |
| RadioGroup | Responder, Crear | Opciones unicas, tipo de pregunta |
| Checkbox | Crear, Responder | Obligatoria, opciones multiples |
| Sheet | Crear | Panel lateral agregar/editar pregunta |
| Progress | Responder | Barra de progreso de encuesta |
| Pagination | Dashboard, Resultados | Navegacion de tablas |
| Sonner (toast) | Todas | Notificaciones de exito/error |
| Tabs | Resultados | Alternar graficos/respuestas |

---

## 5. Responsive Breakpoints

### Mobile (< 768px)

- **Dashboard:** tabla reemplazada por cards apiladas, cada card muestra nombre + badge + fecha + boton acciones
- **Crear encuesta:** sheet ocupa full-width, botones guardar/publicar stack vertical
- **Resultados:** tabs a full-width, tabla scroll horizontal, botones exportar stack vertical
- **Login:** card ocupa casi full-width (padding 16px lateral)
- **Responder:** ya es mobile-first, sin cambios

### Desktop (>= 768px)

- **Dashboard:** tabla completa con todas las columnas visibles
- **Crear encuesta:** sheet 400px desde la derecha
- **Resultados:** layout con espacio, graficos con mas ancho
- **Login:** card centrada max-w-md

### Espaciado general

```
Page padding:  16px mobile / 32px desktop
Card padding:  16px mobile / 24px desktop
Gap entre cards: 16px
Gap entre secciones: 32px
```

---

## 6. Accesibilidad (WCAG 2.1 AA)

### Labels y formularios

- Todo `<input>` tiene un `<label>` asociado via `htmlFor`
- Campos obligatorios marcados con `*` y `aria-required="true"`
- Mensajes de error asociados con `aria-describedby`

### Contraste

- Todos los textos cumplen ratio minimo 4.5:1 (verificado en seccion 1)
- Badges usan combinaciones verificadas (ej. green-800 sobre green-100 = 5.1:1)

### Focus

- Focus ring visible: `ring-2 ring-primary ring-offset-2` (Tailwind default de shadcn)
- Tab order sigue el orden visual de lectura
- Focus trapped en Sheet y Dialog mientras estan abiertos
- Escape cierra Sheet y Dialog

### Botones de icono

- Boton salir: `aria-label="Cerrar sesion"`
- Boton menu acciones: `aria-label="Acciones de encuesta"`
- Boton eliminar pregunta: `aria-label="Eliminar pregunta"`
- Drag handle: `aria-label="Reordenar pregunta"`
- Toggle password: `aria-label="Mostrar contrasena"`

### Touch targets

- Todos los botones: minimo 40px height (44px en formulario publico)
- Radio buttons y checkboxes: area clickeable incluye el label
- Filas de tabla: height minimo 48px

---

## 7. Micro-interacciones

| Accion | Animacion |
|--------|-----------|
| Toast aparece | Slide-in desde arriba, 200ms ease-out |
| Toast desaparece | Fade-out 150ms, auto-dismiss 4s |
| Sheet abre | Slide-in desde derecha, 200ms ease-out |
| Sheet cierra | Slide-out 150ms |
| Dialog abre | Fade-in + scale 95%->100%, 150ms |
| Drag pregunta | Opacity 80%, shadow elevada, snap on drop |
| Badge hover | Sin animacion (estatico) |
| Boton hover | bg se oscurece 10%, transition 150ms |
| Progress bar | Width transition 300ms ease |

---

## 8. Estados de componentes clave

### Boton primario

| Estado | Estilos |
|--------|---------|
| Default | bg #2563EB, text white |
| Hover | bg #1D4ED8 |
| Focus | ring-2 ring-#2563EB ring-offset-2 |
| Active | bg #1E40AF |
| Disabled | bg #93C5FD, cursor not-allowed |
| Loading | spinner 16px + texto, disabled |

### Input

| Estado | Estilos |
|--------|---------|
| Default | border #E5E7EB, bg white |
| Focus | border #2563EB, ring-1 ring-#2563EB |
| Error | border #EF4444, ring-1 ring-#EF4444 |
| Disabled | bg #F3F4F6, cursor not-allowed |

### Badge de estado

| Estado | Estilos |
|--------|---------|
| Publicada | bg #DCFCE7, text #166534 |
| Borrador | bg #FEF9C3, text #854D0E |
| Cerrada | bg #F3F4F6, text #374151 |
