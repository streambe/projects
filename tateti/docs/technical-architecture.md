# Arquitectura Tecnica - Tateti (Tic-Tac-Toe)

**Autor**: Nikola Tesla (Arquitecto de Software)
**Fecha**: 2026-03-31
**Estado**: Propuesto

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Markup | HTML5 |
| Estilos | CSS3 (inline en `<style>`) |
| Logica | Vanilla JavaScript ES6+ (inline en `<script>`) |
| Deploy | Vercel (static site) |
| Dependencias externas | Ninguna |
| Build step | Ninguno |
| Backend | Ninguno |

## Arquitectura

### Single File Architecture

El proyecto consiste en un unico archivo `index.html` que contiene todo:

```
index.html
  +-- <style>    CSS del tablero, celdas, estados, responsive
  +-- <body>     Markup del tablero 3x3, indicador de turno, boton reset
  +-- <script>   Logica del juego: turnos, deteccion de victoria, empate
```

### Componentes logicos (dentro del mismo archivo)

1. **Estado del juego**: Array de 9 posiciones, turno actual (X/O), flag de juego terminado.
2. **Renderizado**: Funciones que actualizan el DOM segun el estado.
3. **Logica de victoria**: Evaluacion de las 8 combinaciones ganadoras.
4. **Control de flujo**: Manejo de clicks, cambio de turno, reset.

### Diagrama de flujo

```
Click en celda
  -> celda ocupada o juego terminado? -> ignorar
  -> marcar celda con simbolo del turno actual
  -> hay ganador? -> mostrar mensaje de victoria, fin
  -> tablero lleno? -> mostrar empate, fin
  -> cambiar turno
```

## Deploy

Vercel sirve `index.html` como static site. No requiere configuracion especial.

```
vercel.json (opcional, no requerido para un archivo estatico)
```

El deploy se hace con `vercel --prod` o push al branch conectado.

## ADR-001: Single HTML File, Zero Dependencies

**Estado**: Propuesto

### Contexto

Se necesita un juego de Tateti web. El juego es trivial: tablero 3x3, dos jugadores alternando turnos, deteccion de victoria/empate.

### Decision

Un solo archivo `index.html` con CSS y JS inline. Sin frameworks, sin dependencias, sin build tools, sin backend.

### Justificacion

- El juego tiene ~100 lineas de logica. Un framework agrega complejidad sin beneficio.
- Zero dependencies = zero vulnerabilidades de terceros, zero mantenimiento de dependencias.
- Sin build step = el archivo fuente ES el archivo de produccion.
- Cualquier navegador moderno ejecuta ES6+ sin transpilacion.
- Deploy instantaneo: un archivo estatico en cualquier hosting.

### Consecuencias

- No hay separacion de archivos (aceptable para este tamano).
- No hay tests automatizados (el juego es verificable manualmente en segundos).
- Si el proyecto crece significativamente, se deberia migrar a una estructura con archivos separados.
