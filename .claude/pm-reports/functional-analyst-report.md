# Reporte: Analista Funcional — CRM Básico

**Fecha:** 2026-03-29
**De:** Analista Funcional
**Para:** Project Manager
**Sprint/Fase:** Pre-desarrollo — Definición funcional
**Estado:** Completado

---

## Tarea Completada

Definición funcional completa del CRM Básico para el MVP. Se produjo la documentación base necesaria para que el equipo de desarrollo pueda comenzar a trabajar bajo el marco Scrum.

---

## Entregables Producidos

Todos los archivos fueron generados en `c:/Gaston/Projects/Git repository/projects/crm/docs/`.

### 1. `product-backlog.md`

Product Backlog completo con:
- **5 Epics** (una por módulo): Contactos, Empresas, Deals, Actividades, Dashboard.
- **17 User Stories** en formato estándar "Como / Quiero / Para".
- **Criterios de aceptación en Gherkin** (Given/When/Then) para cada story, incluyendo escenarios alternativos y de error.
- **Estimaciones en Story Points** usando escala Fibonacci (1, 2, 3, 5, 8). Total del backlog: **45 SP**.
- **Prioridad** asignada a cada story (Alta / Media / Baja).

Distribución de prioridades:
- P-Alta: 13 stories (39 SP)
- P-Media: 3 stories (6 SP)
- P-Baja: 1 story (1 SP)

### 2. `functional-spec.md`

Especificación funcional con 10 secciones:
- Descripción detallada de cada módulo con modelo de datos y campos.
- **24 Reglas de Negocio** identificadas y documentadas (RN-C, RN-E, RN-D, RN-A, RN-DB, RN-G).
- Validaciones de datos (texto, email, números, fechas).
- **4 flujos de usuario** principales documentados end-to-end.
- Tabla de **casos borde** identificados con comportamiento esperado.
- Tabla de manejo de errores de sistema.
- Lista explícita de lo que está **fuera del alcance** del MVP.

### 3. `user-roles.md`

Definición del modelo de roles con:
- Descripción del rol único: Vendedor / Administrador.
- Tabla de permisos CRUD por recurso.
- Restricciones funcionales del sistema (no editabilidad de deals cerrados, etc.).
- Árbol completo de casos de uso.
- **Sección de evolución futura** con roles anticipados y recomendaciones para el Arquitecto.
- 2 escenarios de uso típicos.

---

## Decisiones Tomadas

| Decisión | Justificación |
|----------|---------------|
| Rol único (Vendedor/Admin) | Simplifica el MVP; los controles de acceso se agregan en una iteración posterior cuando haya múltiples usuarios reales |
| Pipeline fijo de 3 etapas | Cubre el 80% de los casos de uso para empresas pequeñas; pipeline personalizable queda para v2 |
| Deals cerrados son inmutables | Protege la integridad del historial comercial; retroeditar un cierre introduce inconsistencias en métricas |
| Empresas con nombre no único | Las empresas homónimas son una realidad (filiales, franquicias); forzar unicidad causaría más problemas que soluciones |
| Email como identificador único de contacto | Es el campo más universalmente único para personas; evita duplicados sin necesidad de IDs artificiales para el usuario |
| No editar notas | Las notas son registros de hechos pasados; su inmutabilidad preserva la confiabilidad del historial |
| Dashboard sin filtros por período | Decisión de alcance MVP; los totales acumulados son suficientes para validar el flujo de trabajo del equipo |
| Eliminación de contacto no elimina deals | Preservar el historial comercial es más valioso que la limpieza de la base de datos |
| Búsqueda con debounce 300ms | Balance entre responsividad y carga al servidor; evita llamadas por cada tecla presionada |

---

## Riesgos e Items Abiertos

| Item | Descripción | Recomendación |
|------|-------------|---------------|
| RIESGO-01 | El sistema sin autenticación es apropiado solo para un ambiente de uso interno/confiable. Si se expone a internet sin auth, hay riesgo de acceso no autorizado. | Definir con el equipo si el MVP requiere algún nivel básico de autenticación antes del primer deploy. |
| ABIERTO-01 | La zona horaria del servidor no fue definida. Afecta la visualización de fechas de actividades. | El Arquitecto debe definir y documentar la zona horaria del servidor (sugerencia: UTC con display en zona local). |
| ABIERTO-02 | La moneda por defecto es ARS pero el campo acepta otros códigos ISO. No se especificó conversión de moneda. | Confirmar con el cliente si el sistema operará en una sola moneda o múltiples. Recomiendo fijar una sola moneda en el MVP. |
| ABIERTO-03 | No se especificó qué ocurre con las tareas vencidas (fecha pasada) en el dashboard. | Evaluar si agregar un counter de "Tareas vencidas" en el dashboard es útil para el usuario; es de bajo costo. |

---

## Recomendaciones para el Arquitecto

1. **Modelo de datos con `created_by` y `owner_id` desde el inicio.** Aunque en el MVP no hay usuarios diferenciados, agregar estos campos en el schema ahora evita una migración costosa cuando se agreguen roles.

2. **Diseñar la API con un middleware de autorización vacío/pasante.** El día que se agreguen roles, el punto de extensión ya existe y no hay que refactorizar rutas.

3. **Índices en campos de búsqueda.** El campo `email` de contactos requiere índice único. Los campos `nombre` y `apellido` requieren índices para búsqueda de texto (full-text o LIKE dependiendo del motor de base de datos).

4. **Soft delete vs hard delete.** Recomiendo evaluar implementar soft delete (campo `deleted_at`) para los registros principales. Esto permite recuperación ante eliminaciones accidentales sin necesitar papelera en la UI. El equipo debe decidir esto antes de arrancar el desarrollo del backend.

5. **Paginación en la capa de API desde el día 1.** Aunque hoy hay pocos datos, la paginación debe implementarse en el servidor (no traer todos los registros y paginar en el frontend).

6. **Estado del deal como máquina de estados.** Implementar la lógica de transiciones del pipeline como una máquina de estados en el backend para evitar que transiciones inválidas lleguen a la base de datos.

7. **Separar la lógica de "etapa" y "resultado de cierre".** El campo de etapa tiene 3 valores (Prospecto, Negociación, Cerrado) y el resultado tiene 2 (Ganado, Perdido). Son dos campos distintos en el modelo; no combinar en un solo enum con 4 valores.

---

## Estimación de Sprints Sugerida

Con 45 SP totales y asumiendo una velocidad inicial de equipo de 15-20 SP por sprint (2 semanas):

| Sprint | Stories sugeridas | SP estimados |
|--------|-------------------|--------------|
| Sprint 1 | US-001, US-002, US-003, US-004, US-005 (Contactos core) | 12 SP |
| Sprint 2 | US-006, US-007, US-008, US-009, US-010 (Empresas + Deals base) | 13 SP |
| Sprint 3 | US-011, US-012, US-013, US-014 (Pipeline visual + Actividades) | 12 SP |
| Sprint 4 | US-015, US-016, US-017 (Actividades avanzadas + Dashboard) | 8 SP |

Total: **4 sprints** (~8 semanas de desarrollo).

Esta distribución es una sugerencia para el equipo Scrum; la priorización final es responsabilidad del Product Owner.
