# Reporte: Re-verificacion de correcciones — Sprint 2
**Rol**: Tester QA
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

- `.claude/pm-reports/tester-report-sprint2.md` — actualizado con seccion de re-verificacion al inicio del documento, detalle por bug, tabla de impacto en TCs, y veredicto final GO.

## Resumen de lo realizado

Se verificaron las correcciones de 8 bugs del Sprint 2 (BUG-001, BUG-002, BUG-003, BUG-004, BUG-005, BUG-007, BUG-010, BUG-012) mediante revision estatica de los archivos indicados. Los 8 bugs fueron verificados como RESUELTOS.

Se emitio un veredicto GO con observaciones para el Sprint 2 Review.

## Decisiones tomadas

- Se verifico cada correccion directamente contra el codigo del archivo indicado, sin inferencias.
- Se evaluo el impacto de cada correccion en la tabla de TCs del reporte original.
- BUG-006 (P2 condicional) se mantiene como observacion pendiente ya que no fue incluido en el scope de correcciones de este ciclo y su impacto real depende de la serializacion del campo `sentReceivedAt` en el backend — no verificable estaticamente sin un entorno en ejecucion.
- El veredicto cambio de NO-GO a GO porque los tres criterios de Go/No-Go del plan quedaron satisfechos: 0 bugs P1, TC-037 PASSED, TC-039 PASSED, y regresiones Sprint 1 intactas.

## Bugs verificados

| Bug | Prioridad | Resultado |
|-----|-----------|-----------|
| BUG-001 | P1 | RESUELTO — `/clients/${clientId}/messages` en useCommunications.ts linea 31 |
| BUG-002 | P1 | RESUELTO — `{ status: 'realizada' }` en reports.service.ts linea 56 |
| BUG-003 | P1 | RESUELTO — `{ isActive: true }` en reports.service.ts linea 14 |
| BUG-004 | P2 | RESUELTO — `subject: z.string().max(500).optional()` en backend; sin validacion obligatoria en frontend form |
| BUG-005 | P2 | RESUELTO — `COMM_DIRECTION = { outbound, inbound }` y `direction === 'outbound'` en MessageThread |
| BUG-007 | P2 | RESUELTO — paso `npm run lint` presente en ambos jobs del ci.yml |
| BUG-010 | P3 | RESUELTO — `npx prisma db seed` en el command del backend en docker-compose.yml |
| BUG-012 | P2 | RESUELTO — `/clients/${clientId}/activities` en useActivities.ts linea 59 |

## Bloqueantes / Riesgos

- **BUG-006 (P2 condicional)** sigue abierto: si el backend serializa el campo como `sentReceivedAt` en lugar de `sentAt`, TC-017 y TC-018 seguiran fallando en entorno real. Recomiendo confirmar este punto antes de la demo o durante el smoke test inicial.
- Los bugs P3 restantes (BUG-008, BUG-009) deben entrar al backlog del Sprint 3.

## Recomendaciones para el siguiente rol (PM)

1. El Sprint 2 Review puede realizarse. Veredicto: GO.
2. Antes de la demo, ejecutar un smoke test manual del historial de comunicaciones para confirmar que BUG-006 no es real en el entorno de staging (verificar que los mensajes muestren fechas validas).
3. Registrar BUG-006, BUG-008, BUG-009, BUG-011 y la deuda tecnica de TC-028 en el backlog del Sprint 3 con sus respectivas prioridades.
4. Considerar agregar tests de contrato frontend/backend al DoD del Sprint 3 para evitar desacuerdos de tipos en sprints futuros.
