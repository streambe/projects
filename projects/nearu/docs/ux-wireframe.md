# nearU — UX / Wireframes

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** Diseñador UI/UX/CX (Leonardo Da Vinci)
**Estado:** APROBADO

---

## 1. Sistema de Diseño

### 1.1 Paleta de Colores (Dark Theme)

| Token | Hex | Uso |
|---|---|---|
| `bg-base` | `#0f172a` (slate-950) | Fondo principal de la app |
| `bg-card` | `#1e293b` (slate-900) | Cards, panels, modales |
| `bg-elevated` | `#334155` (slate-800) | Hover states, inputs |
| `accent` | `#14b8a6` (teal-500) | CTAs, badges activos, links |
| `accent-hover` | `#0d9488` (teal-600) | Hover de CTAs |
| `text-primary` | `#f8fafc` (slate-50) | Texto principal |
| `text-secondary` | `#94a3b8` (slate-400) | Texto secundario, labels |
| `success` | `#22c55e` | Check-in exitoso, online |
| `warning` | `#f59e0b` | Beacon con batería baja |
| `danger` | `#ef4444` | Errores, bajas de beacon |

### 1.2 Tipografía

- **Geist Sans** — UI general, headings, body.
- **Geist Mono** — códigos de acceso, IDs de beacon, timestamps.
- Escalas: `text-xs (12)`, `text-sm (14)`, `text-base (16)`, `text-lg (18)`, `text-2xl (24)`, `text-4xl (36)`.

### 1.3 Componentes Base

| Componente | Especificación |
|---|---|
| Card | `bg-card`, border `slate-800`, radius `rounded-xl`, padding `p-4` |
| Button primary | `bg-accent`, text white, `rounded-lg`, `py-3 px-6`, `min-h-12` |
| Button ghost | transparente, border `slate-700`, hover `bg-elevated` |
| Badge | `rounded-full`, `text-xs`, padding `py-1 px-3` |
| Input | `bg-elevated`, border `slate-700`, focus ring teal, `min-h-12` |
| Avatar | `rounded-full`, tamaños: 40px (list), 80px (detail), 120px (profile) |
| Chart | CSS puro (bars + lines), sin librería externa |

### 1.4 Responsive Breakpoints

| Breakpoint | Rango | Uso |
|---|---|---|
| Mobile | <640px | App participante, check-in en tablet vertical |
| Tablet | 640-1024px | Check-in en tablet horizontal |
| Desktop | >=1024px | Backoffice organizador |

### 1.5 Accesibilidad

- Contraste mínimo WCAG AA: 4.5:1 en texto normal, 3:1 en texto grande.
- Touch targets mínimo 44x44 px; en check-in se usan targets de 48x48 px para velocidad.
- Focus ring visible teal de 2px en todos los elementos interactivos.
- Todas las imágenes con alt-text; iconos con aria-label.

---

## 2. Wireframes (11 pantallas)

### 2.1 Login (App participante)

```
+---------------------------+
|         nearU logo        |
|                           |
|   Ingresá tu código       |
|   +-------------------+   |
|   |   X 7 K 2 M 9     |   |  <- Geist Mono, tracking wide
|   +-------------------+   |
|                           |
|   [  Entrar          ]    |  <- Button primary, full-width
|                           |
|   Lo recibiste en puerta  |
+---------------------------+
```

### 2.2 Nearby (lista principal)

```
+---------------------------+
| nearU       [filter] [=]  |
+---------------------------+
| Cerca tuyo (3)            |
|                           |
| +-----------------------+ |
| | [av] Ana Rodriguez    | |
| |      ACME · CTO       | |
| |      1.2m        now  | |
| +-----------------------+ |
| +-----------------------+ |
| | [av] Bruno Diaz       | |
| |      XYZ · CEO        | |
| |      2.8m        now  | |
| +-----------------------+ |
| +-----------------------+ |
| | [av] Carla Luna       | |
| |      DEF · PM         | |
| |      4.5m        now  | |
| +-----------------------+ |
+---------------------------+
| Nearby  History  Profile  |  <- tab bar
+---------------------------+
```

### 2.3 Person Detail

```
+---------------------------+
| <-                        |
|         [avatar 80]       |
|       Ana Rodriguez       |
|          ACME                 |
|           CTO             |
|                           |
|   Distancia: 1.2m         |
|   Primera vez: 14:32      |
|   Tiempo juntos: 3 min    |
|                           |
|   [ Ver historial       ] |
+---------------------------+
```

### 2.4 Filter Modal

```
+---------------------------+
| Filtros              [X]  |
+---------------------------+
| Buscar por nombre         |
| [_______________________] |
|                           |
| Rol                       |
| ( ) Todos                 |
| (o) Speaker               |
| ( ) Sponsor               |
| ( ) Attendee              |
|                           |
| Empresa                   |
| [_______________________] |
|                           |
| [  Aplicar            ]   |
+---------------------------+
```

### 2.5 History

```
+---------------------------+
| Historial            (12) |
+---------------------------+
| Hoy                       |
| +-----------------------+ |
| | [av] Ana R.           | |
| |  ACME · CTO           | |
| |  14:32 · 3 min        | |
| +-----------------------+ |
| +-----------------------+ |
| | [av] Bruno D.         | |
| |  XYZ · CEO            | |
| |  14:18 · 1 min        | |
| +-----------------------+ |
|                           |
| Ayer                      |
| +-----------------------+ |
| | [av] Carla L.         | |
| |  DEF · PM             | |
| |  19:45 · 5 min        | |
| +-----------------------+ |
+---------------------------+
```

### 2.6 Profile

```
+---------------------------+
| Mi perfil           [edit]|
+---------------------------+
|       [avatar 120]        |
|     Gaston Castillo       |
|         Streambe          |
|           CEO             |
|                           |
|  gaston@streambe.com      |
|                           |
|  Eventos asistidos: 7     |
|  Personas conocidas: 42   |
|                           |
|  [ Cerrar sesión       ]  |
+---------------------------+
```

### 2.7 Events List (Backoffice)

```
+-----------------------------------------------+
| nearU Admin              Gaston  [logout]     |
+-----------------------------------------------+
| Eventos                       [+ Nuevo evento]|
|                                               |
| +-------------------------------------------+ |
| | DevConf 2026                              | |
| | 2026-04-15 -- 2026-04-17 · BsAs           | |
| | 342 participantes · 89 check-in           | |
| | [Ver]                                     | |
| +-------------------------------------------+ |
| +-------------------------------------------+ |
| | TechMeetup                                | |
| | 2026-05-02 · Rosario                      | |
| | 120 participantes · 0 check-in            | |
| | [Ver]                                     | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

### 2.8 Event Detail (Backoffice)

```
+-----------------------------------------------+
| < Eventos                                     |
| DevConf 2026                      [Editar]    |
+-----------------------------------------------+
| Info | Participantes | Beacons | Analytics    |
+-----------------------------------------------+
| Fechas: 2026-04-15 -- 2026-04-17              |
| Lugar: BsAs, Centro de Convenciones           |
| UUID: a1b2c3d4-...                            |
|                                               |
| Resumen                                       |
| +-------+ +-------+ +-------+ +-------+       |
| |  342  | |  89   | |  47   | |  156  |       |
| | regs  | | check | |beacons| |interc.|       |
| +-------+ +-------+ +-------+ +-------+       |
+-----------------------------------------------+
```

### 2.9 Create Event (Backoffice)

```
+-----------------------------------------------+
| Nuevo evento                                  |
+-----------------------------------------------+
| Nombre *                                      |
| [_______________________________________]     |
|                                               |
| Descripcion                                   |
| [_______________________________________]     |
| [_______________________________________]     |
|                                               |
| Fecha inicio *   Fecha fin *                  |
| [___________]    [___________]                |
|                                               |
| Ubicacion                                     |
| [_______________________________________]     |
|                                               |
| Logo   [ Subir imagen ]                       |
|                                               |
| [Cancelar]          [Crear evento]            |
+-----------------------------------------------+
```

### 2.10 Analytics Dashboard (Backoffice)

```
+-----------------------------------------------+
| Analytics · DevConf 2026      [Export CSV]    |
+-----------------------------------------------+
| +---------+ +---------+ +---------+ +-------+ |
| |  156    | |  4.2min | |  14:00  | |  89%  | |
| |interac. | | prom.   | |  pico   | | check | |
| +---------+ +---------+ +---------+ +-------+ |
|                                               |
| Interacciones por hora                        |
| |                     ##                      |
| |                   ####                      |
| |                 ######                      |
| |               ########                      |
| |  _ _ _ _ __ __########__                    |
| +------------------------>                    |
|  09  11  13  15  17  19                       |
|                                               |
| Top networkers                                |
| 1. Ana Rodriguez    -- 23 encuentros          |
| 2. Bruno Diaz       -- 18 encuentros          |
| 3. Carla Luna       -- 15 encuentros          |
+-----------------------------------------------+
```

### 2.11 Check-in (Web responsive tablet)

```
+-----------------------------------------------+
| Check-in · DevConf 2026         89/342        |
+-----------------------------------------------+
|                                               |
|  Buscar participante                          |
|  [__________________________]  [Buscar]       |
|                                               |
|  Ana Rodriguez                                |
|  ana@acme.com · ACME · CTO                    |
|                                               |
|  Asignar beacon                               |
|  [ Beacon #0042  v ]                          |
|                                               |
|  +-----------------------------------------+  |
|  |                                         |  |
|  |         CONFIRMAR CHECK-IN              |  |   <- botón grande 80px
|  |                                         |  |
|  +-----------------------------------------+  |
|                                               |
|  Codigo a entregar: X 7 K 2 M 9               |
+-----------------------------------------------+
```

---

## 3. Estados y Feedback Visual

| Estado | Indicador |
|---|---|
| BLE escaneando | Badge teal "Buscando..." en header |
| Sin conexión | Banner amarillo "Sin conexión — se sincronizará después" |
| Nueva persona cerca | Push local + animación fade-in en la card |
| Beacon bajo batería | Badge warning en inventory |
| Check-in completo | Toast verde + avance a siguiente búsqueda |

---
