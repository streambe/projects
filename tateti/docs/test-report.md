# Test Report - Sprint 1: Tateti

**Responsable**: Tester QA - Richard Feynman
**Fecha**: 2026-04-01
**Sprint**: 1
**Veredicto**: APROBADO - 0 bugs P1, 0 bugs P2

---

## 1. Plan de Tests

### Alcance

Validacion completa del juego Tateti (Tic-Tac-Toe) implementado en un unico archivo `index.html`. El testing cubre funcionalidad del juego, interfaz de usuario, accesibilidad y responsividad.

### Estrategia

| Capa | Enfoque | Herramienta |
|------|---------|-------------|
| Funcional | Logica del juego, turnos, victoria, empate, puntaje | Playwright (manual + automatizado) |
| UI | Estilos, animaciones, estados visuales | Inspeccion visual en browser |
| Accesibilidad | Navegacion por teclado, aria labels, focus states | Playwright + revision manual |
| Responsive | Mobile (360px), Tablet (768px), Desktop (1024px+) | Playwright viewports |

### Criterios de aceptacion cubiertos

- CA-01: Tablero 3x3 con 9 celdas clickeables
- CA-02: Alternancia de turnos (X inicia)
- CA-03: Deteccion de victoria (8 combinaciones)
- CA-04: Deteccion de empate
- CA-05: Marcador de puntaje (X, O, Empates)
- CA-06: Boton de nueva partida (reset)
- CA-07: Diseno responsive (mobile + desktop)
- CA-08: Accesibilidad (teclado, aria, focus)

---

## 2. Casos de Test

### 2.1 Funcionales

| ID | Caso de Test | Pasos | Resultado Esperado | Estado |
|----|-------------|-------|-------------------|--------|
| TC-F01 | Tablero se renderiza al cargar | Abrir index.html | 9 celdas vacias visibles, status "Turno de: X" | PASS |
| TC-F02 | X juega primero | Click en celda vacia | Celda muestra "X", turno cambia a O | PASS |
| TC-F03 | Alternancia de turnos | Click X, luego click O | Turnos alternan correctamente X -> O -> X | PASS |
| TC-F04 | No se puede jugar en celda ocupada | Click en celda con X o O | No ocurre nada, turno no cambia | PASS |
| TC-F05 | Victoria horizontal fila 1 | X en [0,1,2] | Mensaje "X gana!", celdas resaltadas, puntaje +1 | PASS |
| TC-F06 | Victoria horizontal fila 2 | X en [3,4,5] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F07 | Victoria horizontal fila 3 | X en [6,7,8] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F08 | Victoria vertical col 1 | X en [0,3,6] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F09 | Victoria vertical col 2 | X en [1,4,7] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F10 | Victoria vertical col 3 | X en [2,5,8] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F11 | Victoria diagonal principal | X en [0,4,8] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F12 | Victoria diagonal secundaria | X en [2,4,6] | Mensaje "X gana!", celdas resaltadas | PASS |
| TC-F13 | Victoria de O | O completa linea | Mensaje "O gana!", puntaje O +1 | PASS |
| TC-F14 | Empate | Llenar tablero sin ganador | Mensaje "Empate!", puntaje Empates +1 | PASS |
| TC-F15 | No se puede jugar tras victoria | Ganar y click en celda vacia | No ocurre nada | PASS |
| TC-F16 | No se puede jugar tras empate | Empatar y click en celda vacia | No ocurre nada | PASS |
| TC-F17 | Puntaje acumulativo | Jugar 3 partidas | Puntaje refleja todas las partidas | PASS |
| TC-F18 | Boton Nueva Partida resetea tablero | Click "Nueva Partida" | Tablero vacio, turno X, puntaje se mantiene | PASS |
| TC-F19 | Puntaje persiste tras reset | Ganar, luego Nueva Partida | Puntaje anterior se conserva | PASS |

### 2.2 Interfaz de Usuario

| ID | Caso de Test | Resultado Esperado | Estado |
|----|-------------|-------------------|--------|
| TC-U01 | Tema visual oscuro | Fondo #1a1a2e, texto blanco | PASS |
| TC-U02 | Color X (cyan #00d2ff) | X se muestra en cyan con text-shadow | PASS |
| TC-U03 | Color O (magenta #ff00aa) | O se muestra en magenta con text-shadow | PASS |
| TC-U04 | Hover en celda vacia | Box-shadow sutil aparece | PASS |
| TC-U05 | Celdas ganadoras resaltadas | Border y glow del color del ganador | PASS |
| TC-U06 | Animacion fade en status | Mensaje de victoria/empate aparece con fade | PASS |
| TC-U07 | Boton hover/focus | Borde cyan y glow al hacer hover/focus | PASS |
| TC-U08 | Titulo centrado con letter-spacing | "TATETI" en mayusculas, spacing 8px | PASS |

### 2.3 Accesibilidad

| ID | Caso de Test | Resultado Esperado | Estado |
|----|-------------|-------------------|--------|
| TC-A01 | Navegacion por Tab | Tab recorre las 9 celdas y el boton | PASS |
| TC-A02 | Activar celda con Enter | Presionar Enter en celda con focus | PASS |
| TC-A03 | Activar celda con Espacio | Presionar Space en celda con focus | PASS |
| TC-A04 | aria-label en celda vacia | "Celda X,Y vacia" | PASS |
| TC-A05 | aria-label actualizado tras jugada | "Celda X,Y X" o "Celda X,Y O" | PASS |
| TC-A06 | aria-live en status | Cambios de turno anunciados por screen reader | PASS |
| TC-A07 | role="button" en celdas | Cada celda tiene role button | PASS |
| TC-A08 | role="group" en tablero | Tablero tiene aria-label descriptivo | PASS |
| TC-A09 | Focus visible (outline) | Outline cyan 2px al navegar con teclado | PASS |
| TC-A10 | lang="es" en html | Documento marcado como espanol | PASS |

### 2.4 Responsive

| ID | Caso de Test | Viewport | Resultado Esperado | Estado |
|----|-------------|----------|-------------------|--------|
| TC-R01 | Desktop (1024px+) | 1280x800 | Celdas 100x100px, layout centrado | PASS |
| TC-R02 | Tablet (768px) | 768x1024 | Celdas 100x100px, layout centrado | PASS |
| TC-R03 | Mobile (375px) | 375x667 | Celdas 90x90px, todo visible sin scroll horizontal | PASS |
| TC-R04 | Mobile pequeno (320px) | 320x568 | Celdas 80x80px, fuente reducida a 32px | PASS |

---

## 3. Resultados de Ejecucion

### Resumen

| Categoria | Total | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| Funcional | 19 | 19 | 0 | 0 |
| UI | 8 | 8 | 0 | 0 |
| Accesibilidad | 10 | 10 | 0 | 0 |
| Responsive | 4 | 4 | 0 | 0 |
| **Total** | **41** | **41** | **0** | **0** |

### Cobertura de criterios de aceptacion

| Criterio | Tests asociados | Cubierto |
|----------|----------------|----------|
| CA-01: Tablero 3x3 | TC-F01 | Si |
| CA-02: Alternancia de turnos | TC-F02, TC-F03 | Si |
| CA-03: Deteccion de victoria (8 combos) | TC-F05 a TC-F13 | Si |
| CA-04: Deteccion de empate | TC-F14 | Si |
| CA-05: Marcador de puntaje | TC-F17, TC-F19 | Si |
| CA-06: Boton reset | TC-F18, TC-F19 | Si |
| CA-07: Responsive | TC-R01 a TC-R04 | Si |
| CA-08: Accesibilidad | TC-A01 a TC-A10 | Si |

---

## 4. Bugs Encontrados

| ID | Severidad | Descripcion | Estado |
|----|-----------|-------------|--------|
| — | — | No se encontraron bugs P1 ni P2 | — |

### Observaciones menores (P4 - cosmetic)

| ID | Severidad | Descripcion | Estado |
|----|-----------|-------------|--------|
| BUG-001 | P4 | En viewport 320px el espaciado entre scoreboard items es ajustado pero funcional | Aceptado como deuda tecnica |

---

## 5. Veredicto Final

**APROBADO para Sprint Review.**

- 0 bugs P1 (criticos)
- 0 bugs P2 (altos)
- 41/41 tests pasando (100%)
- 8/8 criterios de aceptacion cubiertos
- Accesibilidad validada (teclado, aria, focus)
- Responsive validado (320px a 1280px+)

El juego Tateti cumple con todos los criterios de aceptacion definidos para el Sprint 1 y esta listo para la validacion del usuario en la Sprint Review.
