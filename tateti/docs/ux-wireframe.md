# Tateti - Wireframe UI/UX
**Rol**: Leonardo Da Vinci (UI/UX Designer)
**Fecha**: 2026-03-31
**Iteracion**: 1
**Estado**: PENDIENTE APROBACION

---

## Layout General

Pantalla unica, contenido centrado vertical y horizontalmente. Mobile-first.

```
┌──────────────────────────────────────────┐
│                                          │
│              T A T E T I                 │  ← h1, 36px, blanco, centrado
│                                          │
│            Turno de: X                   │  ← 18px, color dinamico (cyan/magenta)
│                                          │
│         ┌───────┬───────┬───────┐        │
│         │       │       │       │        │
│         │   X   │       │   O   │        │  row 1
│         │       │       │       │        │
│         ├───────┼───────┼───────┤        │
│         │       │       │       │        │
│         │       │   X   │       │        │  row 2
│         │       │       │       │        │
│         ├───────┼───────┼───────┤        │
│         │       │       │       │        │
│         │   O   │       │       │        │  row 3
│         │       │       │       │        │
│         └───────┴───────┴───────┘        │
│                                          │
│          Gano X!                    │  ← 24px, aparece al terminar
│                                          │
│       X: 0  |  O: 0  |  Empates: 0      │  ← 14px, gris claro
│                                          │
│           [ Nueva Partida ]              │  ← boton principal
│                                          │
└──────────────────────────────────────────┘
```

Fondo pagina: `#1a1a2e`

---

## Especificaciones de Componentes

### 1. Titulo
- Texto: "TATETI" (uppercase, letter-spacing 8px)
- Font: sans-serif (Inter o system)
- Size: 36px / 2.25rem
- Color: `#ffffff`
- Margin-bottom: 16px

### 2. Indicador de Turno
- Texto: "Turno de: X" o "Turno de: O"
- Size: 18px / 1.125rem
- Color: cyan `#00d2ff` cuando X, magenta `#ff00aa` cuando O
- Margin-bottom: 24px
- Se oculta cuando hay resultado

### 3. Tablero 3x3
- Contenedor: CSS Grid 3x3
- Tamano celda: 100px x 100px (desktop), 90px x 90px (mobile)
- Borde celda: 1px solid `rgba(255,255,255,0.15)`
- Border-radius celda: 8px
- Background celda: `rgba(255,255,255,0.05)`
- Gap: 4px
- Cursor: pointer en celdas vacias

#### Estados de celda
| Estado | Visual |
|--------|--------|
| Vacia default | fondo semitransparente |
| Vacia hover | `box-shadow: 0 0 15px rgba(255,255,255,0.1)` |
| X marcada | letra "X", 40px bold, color `#00d2ff`, `text-shadow: 0 0 10px rgba(0,210,255,0.5)` |
| O marcada | letra "O", 40px bold, color `#ff00aa`, `text-shadow: 0 0 10px rgba(255,0,170,0.5)` |
| Celda ganadora | glow intensificado, borde color del ganador |
| Disabled (partida terminada) | cursor default, sin hover |

### 4. Mensaje de Resultado
- Aparece solo al terminar la partida (reemplaza indicador de turno)
- Textos posibles: "Gano X!", "Gano O!", "Empate!"
- Size: 24px / 1.5rem, bold
- Color: cyan si gano X, magenta si gano O, blanco si empate
- Animacion: fade-in 300ms ease

### 5. Marcador
- Layout: inline, separado por `|`
- Formato: `X: 0  |  O: 0  |  Empates: 0`
- Size: 14px / 0.875rem
- Color: `rgba(255,255,255,0.6)`
- "X" en cyan, "O" en magenta (solo la letra, no el numero)
- Margin-top: 24px

### 6. Boton Nueva Partida
- Texto: "Nueva Partida"
- Padding: 12px 32px
- Font: 16px, semi-bold
- Background: transparent
- Border: 1px solid `rgba(255,255,255,0.3)`
- Color: `#ffffff`
- Border-radius: 8px
- Margin-top: 16px
- Hover: `border-color: #00d2ff`, `box-shadow: 0 0 15px rgba(0,210,255,0.2)`
- Active: scale(0.97)
- Transition: all 200ms ease

---

## Responsive

| Breakpoint | Cambios |
|------------|---------|
| >= 768px (desktop) | Celda 100x100, titulo 36px |
| < 768px (mobile) | Celda 90x90, titulo 28px, padding lateral 16px |
| < 360px (small) | Celda 80x80, titulo 24px |

Touch targets: celdas cumplen minimo 80x80px (supera 44px requerido).

---

## Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| bg-page | `#1a1a2e` | Fondo |
| color-x | `#00d2ff` | Ficha X, glows X |
| color-o | `#ff00aa` | Ficha O, glows O |
| text-primary | `#ffffff` | Titulo, boton |
| text-muted | `rgba(255,255,255,0.6)` | Marcador |
| border-cell | `rgba(255,255,255,0.15)` | Bordes celdas |
| cell-bg | `rgba(255,255,255,0.05)` | Fondo celdas |

---

## Accesibilidad
- Celdas: `role="button"`, `aria-label="Fila 1, Columna 1"` (o "X" / "O" si ocupada)
- Indicador de turno: `aria-live="polite"`
- Mensaje resultado: `aria-live="assertive"`
- Focus visible en celdas y boton (outline cyan)
- Navegacion por teclado: Tab entre celdas, Enter/Space para marcar
- Contraste: texto blanco sobre `#1a1a2e` = ratio > 12:1
