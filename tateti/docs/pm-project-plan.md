# Plan de Proyecto: Tateti (Tic-Tac-Toe)

**Autor**: Alan Turing - PM / Scrum Master
**Fecha**: 2026-04-01
**Estado**: Sprint 1 completado

---

## 1. Overview del Proyecto

| Campo | Valor |
|-------|-------|
| Nombre | Tateti (Tic-Tac-Toe) |
| Tipo | Nuevo - Demo de validacion del framework GEN |
| Objetivo | Validar el flujo completo multi-agente de GEN con un proyecto simple |
| Stack | HTML5 + CSS3 + Vanilla JS (archivo unico, sin dependencias) |
| Deploy | Vercel (static site) |
| Sprints planificados | 1 |
| Sprints completados | 1 |

---

## 2. Equipo Asignado

| Rol | Nombre | Participacion |
|-----|--------|---------------|
| PM / Scrum Master | Alan Turing | Coordinacion general |
| Analista Funcional | Ada Lovelace | Requerimientos y user stories |
| Arquitecto Software | Nikola Tesla | Arquitectura tecnica |
| Lider Tecnico | Linus Torvalds | Estandares y review |
| Dev Frontend | Grace Hopper | Implementacion |
| Tester QA | Richard Feynman | Testing manual y validacion |
| Disenador UX/UI | Leonardo Da Vinci | Wireframes y diseno |

---

## 3. Historias de Usuario

| ID | Titulo | SP | Sprint | Estado |
|----|--------|----|--------|--------|
| US-001 | Realizar una jugada | 3 | 1 | Done |
| US-002 | Ganar la partida | 3 | 1 | Done |
| US-003 | Reiniciar partida | 2 | 1 | Done |
| US-004 | Marcador de victorias | 2 | 1 | Done |
| US-005 | Diseno responsive | 2 | 1 | Done |
| US-006 | Deteccion de empate | 1 | 1 | Done |
| **Total** | | **13** | | |

---

## 4. Capacidad y Camino Critico

- **Velocidad estimada**: 13 SP
- **Velocidad real**: 13 SP (100% de cumplimiento)
- **Duracion**: 1 sprint

### Camino Critico

```
US-001 (Jugada) → US-002 (Ganador) → US-006 (Empate) → US-004 (Marcador)
                                                        ↗
US-005 (Responsive) ─────────────────────────────────────
US-003 (Reiniciar) ──────────────────────────────────────
```

La deteccion de ganador y empate dependia de la logica de jugada. Marcador dependia de la deteccion de resultados. Responsive y reiniciar eran independientes.

---

## 5. Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigacion | Estado |
|----|--------|-------|---------|------------|--------|
| R-001 | Complejidad subestimada por ser "simple" | Baja | Bajo | Mantener scope minimo, sin features extra | Cerrado |
| R-002 | Incompatibilidad entre navegadores | Baja | Medio | Usar solo APIs estandar (sin polyfills) | Cerrado |
| R-003 | Scope creep (agregar IA, animaciones) | Media | Medio | Out of scope definido y respetado | Cerrado |

---

## 6. Assumptions

- Proyecto demo, no requiere backend ni persistencia.
- Un solo archivo HTML con CSS y JS inline.
- Deploy estatico en Vercel sin configuracion especial.
- UI en espanol, sin internacionalizacion.
- Sin requisitos de seguridad especiales (no hay datos de usuario).

---

## 7. Sprint 1 - Review

**Sprint Goal**: Implementar el juego completo de Tateti funcional y desplegado en Vercel.

**Resultado**: Goal cumplido al 100%.

| Metrica | Valor |
|---------|-------|
| SP comprometidos | 13 |
| SP completados | 13 |
| Stories completadas | 6/6 |
| Bugs P1/P2 | 0 |
| Deploy exitoso | Si |

### Features entregados
- Tablero 3x3 interactivo con turnos alternados (X/O)
- Deteccion de ganador por filas, columnas y diagonales
- Deteccion de empate
- Boton de reinicio (mantiene marcador)
- Marcador acumulado de victorias y empates
- Diseno responsive (mobile + desktop)
- Archivo unico index.html desplegado en Vercel

---

## 8. Sprint 1 - Retrospectiva

### Que salio bien
- El scope reducido permitio completar todo en un solo sprint.
- La arquitectura de archivo unico elimino complejidad de build/deploy.
- El framework GEN funciono de punta a punta para un proyecto simple.
- Todos los criterios de aceptacion Gherkin se cumplieron.

### Que se puede mejorar
- Para proyectos mas grandes, definir mejor las dependencias entre stories antes del sprint.
- El flujo de documentacion formal es pesado para proyectos demo; considerar un "modo lite".

### Acciones
- Documentar este proyecto como caso de referencia para futuros demos de GEN.
- Usar la velocidad de 13 SP como baseline para proyectos similares de complejidad baja.

---

## 9. Lecciones Aprendidas

1. **Simplicidad como estrategia**: Un archivo unico HTML elimina toda la friccion de tooling, build y deploy. Para demos y prototipos, es la opcion ideal.

2. **Scope cerrado desde el inicio**: Definir explicitamente el "out of scope" (IA, online, persistencia) evito el scope creep por completo.

3. **Vanilla JS es suficiente**: Para proyectos pequenos, no se necesitan frameworks. El resultado es mas rapido, mas liviano y mas facil de mantener.

4. **GEN funciona para proyectos simples**: El flujo completo (requerimientos, arquitectura, diseno, implementacion, testing, deploy) se ejecuto sin bloqueos. La sobrecarga de proceso es aceptable si se adapta al tamano del proyecto.

5. **Deploy estatico en Vercel es trivial**: Un solo archivo, sin configuracion. Ideal para validacion rapida.
