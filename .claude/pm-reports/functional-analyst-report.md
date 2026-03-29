# Reporte: Especificacion Funcional CRM Ciudad Moto
**Rol**: Analista Funcional
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos
- `c:\Gaston\Projects\Git repository\projects\crm\docs\functional-spec.md`

## Resumen de lo realizado
Se redacto el documento de especificacion funcional completo del CRM basico para Ciudad Moto, basado en las dos rondas de respuestas del cliente. El documento cubre 6 modulos, 29 requerimientos funcionales numerados (RF-01 a RF-29), 8 requerimientos no funcionales (RNF-01 a RNF-08), 12 items fuera de scope del MVP, 5 supuestos documentados y 5 preguntas abiertas.

## Decisiones tomadas
- **Campos del cliente (RF-01)**: Se incluyeron campos estandar para una moto-dealership. Solo nombre, apellido, DNI y telefono principal son obligatorios para no entorpecer el alta rapida.
- **Deteccion de duplicados (RF-02 y RF-03)**: Aplica tanto en alta como en edicion de DNI o telefono. El sistema alerta pero no bloquea obligatoriamente, dejando la decision al usuario.
- **Cierre de oportunidad con resultado (RF-10)**: Se agrego la distincion Ganado/Perdido con motivo de cierre en texto libre. No fue explicitado por el cliente pero es estandar en cualquier pipeline y aporta valor inmediato a los reportes futuros.
- **Bandeja de comunicaciones no vinculadas (RF-24)**: Se agrego este requerimiento porque es un caso inevitable — siempre habra mensajes de contactos no registrados. Sin este manejo la integracion queda incompleta operativamente.
- **Eliminacion logica de clientes (RF-06)**: Se opto por baja logica en lugar de fisica para preservar el historial de actividades y comunicaciones asociadas al cliente.
- **Movimiento libre entre etapas del pipeline (RF-09)**: No se impone un orden secuencial obligatorio ya que el negocio puede necesitar retroceder etapas o saltear pasos segun cada cliente.

## Bloqueantes / Riesgos
- **Q-01 y Q-02 (preguntas abiertas)**: La arquitectura de la integracion de Gmail y WhatsApp depende de si es una cuenta por negocio o una por vendedor. Debe resolverse antes de iniciar el desarrollo del modulo M-04.
- **WhatsApp Business API**: Requiere aprobacion de Meta y puede tener tiempos de activacion de varios dias hábiles. Se recomienda iniciar el tramite en paralelo al desarrollo del resto del sistema.
- **Multiples oportunidades por cliente**: El cliente no especifico si puede haber mas de una oportunidad abierta para el mismo cliente simultaneamente. Se asumio que si, pero conviene confirmarlo.

## Recomendaciones para el siguiente rol
- El arquitecto/tech lead debe revisar las preguntas Q-01 a Q-05 de la seccion 7 del documento antes de comenzar el diseno tecnico, especialmente lo referente a la API de WhatsApp Business.
- El diseniador UI/UX debe priorizar la pantalla de alta de cliente (RF-01 y RF-02) — identificada por el cliente como la feature mas importante — y la vista Kanban del pipeline (RF-11).
- El equipo de QA puede comenzar a elaborar casos de prueba directamente a partir de los requerimientos funcionales numerados.
- Se recomienda presentar el documento `functional-spec.md` al cliente para aprobacion formal antes de iniciar el desarrollo, con foco en la seccion 5 (fuera de scope), seccion 6 (supuestos) y seccion 7 (preguntas abiertas).
