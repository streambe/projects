# Especificacion Funcional: Tateti (Tic-Tac-Toe)

**Autor**: Ada Lovelace - Analista Funcional
**Fecha**: 2026-03-31
**Estado**: APROBADO (demo)

---

## Overview

Juego de Tateti (Tic-Tac-Toe) web para 2 jugadores en la misma pantalla. Ejercicio de demo del framework GEN.

## Business Context

- **Problema**: Demostrar el flujo completo del framework GEN con un proyecto simple.
- **Usuarios**: Cualquier persona con un navegador web.
- **Valor**: Validar la metodologia multi-agente de GEN de punta a punta.

## Scope

### In Scope
- Tablero 3x3 interactivo
- 2 jugadores locales (X y O), turnos alternados
- Deteccion de ganador y empate
- Reinicio de partida
- Marcador de victorias acumulado
- Diseño responsive (mobile + desktop)

### Out of Scope
- Juego contra IA
- Multijugador online
- Persistencia de datos (localStorage, BD)
- Autenticacion de usuarios
- Sonidos o animaciones complejas

---

## Requerimientos Funcionales

### RF-001: Tablero de juego
El sistema muestra un tablero de 3x3 celdas vacias al iniciar.

### RF-002: Turnos alternados
- El jugador X siempre comienza.
- Los turnos alternan entre X y O tras cada jugada valida.
- El sistema indica de quien es el turno actual.

### RF-003: Realizar jugada
- El jugador hace clic en una celda vacia para colocar su marca (X u O).
- Una celda ya ocupada no acepta nuevas jugadas.
- No se pueden realizar jugadas si la partida termino.

### RF-004: Deteccion de ganador
El sistema detecta ganador cuando un jugador completa 3 marcas en linea:
- Horizontal (3 filas)
- Vertical (3 columnas)
- Diagonal (2 diagonales)

Al detectar ganador, el sistema muestra un mensaje indicando quien gano.

### RF-005: Deteccion de empate
Si las 9 celdas estan ocupadas y no hay ganador, el sistema declara empate.

### RF-006: Reinicio de partida
Un boton "Reiniciar" limpia el tablero y comienza una nueva partida. X siempre inicia. El marcador NO se resetea.

### RF-007: Marcador de victorias
El sistema muestra y actualiza un marcador con:
- Victorias de X
- Victorias de O
- Empates

El marcador persiste entre partidas pero se pierde al recargar la pagina.

### RF-008: Diseño responsive
La interfaz se adapta a mobile (>= 320px) y desktop. El tablero es usable con touch y con mouse.

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| BR-001 | X siempre comienza cada partida |
| BR-002 | Una celda ocupada no puede ser sobreescrita |
| BR-003 | La partida termina al detectar ganador o empate |
| BR-004 | El marcador acumula resultados entre partidas |
| BR-005 | Reiniciar limpia el tablero pero no el marcador |

---

## User Stories con Criterios de Aceptacion

### US-001: Realizar una jugada

```
Como jugador,
quiero hacer clic en una celda vacia,
para colocar mi marca y avanzar la partida.
```

```gherkin
Scenario: Jugada valida
  Given es el turno de X
  And la celda central esta vacia
  When hago clic en la celda central
  Then la celda muestra "X"
  And el turno pasa a O

Scenario: Jugada en celda ocupada
  Given la celda central tiene una "X"
  When hago clic en la celda central
  Then no ocurre ningun cambio
  And el turno no cambia
```

### US-002: Ganar la partida

```
Como jugador,
quiero que el sistema detecte cuando completo 3 en linea,
para saber que gane.
```

```gherkin
Scenario: Victoria por fila
  Given X ocupa las celdas (0,0) y (0,1)
  And es el turno de X
  When X juega en (0,2)
  Then el sistema muestra "Gano X!"
  And el marcador de X incrementa en 1
  And no se permiten mas jugadas

Scenario: Empate
  Given 8 celdas estan ocupadas sin ganador
  And es el turno del jugador correspondiente
  When juega en la ultima celda vacia
  And no se forma linea de 3
  Then el sistema muestra "Empate!"
  And el marcador de empates incrementa en 1
```

### US-003: Reiniciar partida

```
Como jugador,
quiero reiniciar la partida,
para jugar de nuevo sin perder el marcador.
```

```gherkin
Scenario: Reiniciar partida
  Given hay una partida en curso o terminada
  When hago clic en "Reiniciar"
  Then el tablero se limpia (todas las celdas vacias)
  And el turno es de X
  And el marcador mantiene sus valores
```

---

## Non-Functional Requirements

- **Performance**: Respuesta inmediata al clic (< 50ms).
- **Compatibilidad**: Chrome, Firefox, Safari, Edge (ultimas 2 versiones).
- **Accesibilidad**: Contraste suficiente, tamaño minimo de celda 44x44px en mobile.
- **Responsive**: Usable desde 320px de ancho.

---

## Assumptions

- No se requiere persistencia entre sesiones del navegador.
- No se requiere internacionalizacion; UI en español.
- El proyecto es una demo, no requiere backend.
