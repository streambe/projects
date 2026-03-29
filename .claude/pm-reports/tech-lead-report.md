# Reporte: Estándares Técnicos CRM Ciudad Moto
**Rol**: Líder Técnico
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos
- `projects/crm/docs/tech-standards.md` — documento completo de estándares técnicos y decisiones de arquitectura

## Resumen de lo realizado
Se formalizó el stack tecnológico completo y se establecieron los estándares del proyecto mediante 5 ADRs y secciones de referencia operativa. El documento cubre: stack con versiones, estructura de carpetas (frontend y backend), convenciones de código y naming, estándares de API REST con formato de respuesta unificado, estrategia de autenticación con JWT + HttpOnly cookie, e implementación de las integraciones con Gmail API y WhatsApp Business API.

## Decisiones tomadas
- **Fastify v4 sobre Express**: mayor throughput y validación integrada sin middleware fragmentado
- **Prisma v5 sobre TypeORM/Drizzle**: tipos generados del schema, migraciones predecibles, mejor DX para equipos mixtos
- **JWT en memoria + refresh token en HttpOnly cookie**: elimina XSS persistente sin depender de servicios de auth externos; apropiado dado que ambos roles tienen permisos idénticos en MVP
- **Gmail Cloud API con Google Pub/Sub**: evita polling, entrega push en tiempo real
- **WhatsApp Cloud API de Meta**: elimina necesidad de hosting propio del servidor de WhatsApp Business
- **shadcn/ui + Tailwind**: componentes sin vendor lock-in, total control sobre el markup
- **Zustand sobre Redux/Context**: mínima boilerplate, suficiente para el scope del MVP

## Bloqueantes / Riesgos
- Ciudad Moto debe proveer un **número de teléfono dedicado** para WhatsApp antes del inicio de la integración (no puede estar activo en la app móvil)
- Los **Message Templates de WhatsApp** deben crearse y enviarse a aprobación de Meta antes del go-live; el proceso puede tomar varios días
- El flujo OAuth de Gmail requiere una sesión de configuración con el cliente para la autorización inicial
- Los entornos de staging y producción necesitan SSL válido para los webhooks de Pub/Sub; en local se necesita ngrok

## Recomendaciones para el siguiente rol
- El Arquitecto de Software debe revisar la estructura de módulos propuesta y validar que el diseño de base de datos (que surge implícitamente de los servicios) sea consistente con los requerimientos funcionales del `functional-spec.md`
- El siguiente paso natural es un diagrama de entidades (ERD) de PostgreSQL antes de comenzar a codificar el schema de Prisma
- Coordinar con Ciudad Moto las acciones de plataforma requeridas (número WA dedicado, templates, autorización OAuth) en paralelo al inicio del desarrollo para no bloquear el sprint de integraciones
