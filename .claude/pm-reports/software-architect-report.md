# Reporte: Arquitectura de Alto Nivel — CRM Ciudad Moto
**Rol**: Arquitecto de Software
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos
- `crm/docs/architecture.md` — Documento de arquitectura de alto nivel

## Resumen de lo realizado

Se diseñó la arquitectura completa del CRM básico para Ciudad Moto, cubriendo:

1. **Diagrama de componentes** en tres niveles: contexto del sistema, contenedores de despliegue y módulos internos del backend.
2. **Diseño de base de datos** con 8 tablas principales: `users`, `clients`, `opportunities`, `opportunity_history`, `activities`, `messages`, `gmail_credentials`, `whatsapp_config`, con sus campos clave y relaciones.
3. **Flujo de integraciones** detallado para los cuatro escenarios: Gmail entrante (via Pub/Sub push), Gmail saliente, WhatsApp entrante (via webhook), WhatsApp saliente. Incluye la lógica central del `VinculacionService` y el flujo de la bandeja general.
4. **ADR-001**: Monolito Modular vs. Microservicios — se optó por monolito modular con argumentación explícita de trade-offs.
5. **Consideraciones de seguridad** por capa.
6. **Estrategia de despliegue** con servicios recomendados.

## Decisiones tomadas

- **Monolito modular sobre microservicios**: la escala (~5.000 clientes, <10 usuarios concurrentes) no justifica la complejidad operacional de microservicios. El diseño usa seams claros que permiten extraer módulos en el futuro si fuera necesario.
- **BullMQ + Redis para procesamiento asíncrono**: maneja el procesamiento de mensajes entrantes de Gmail y WhatsApp sin bloquear el ciclo de requests HTTP, y sin necesidad de un broker externo (SQS, RabbitMQ) que añadiría complejidad operacional.
- **Vinculación por match exacto**: el `VinculacionService` usa búsqueda exacta (email o número de teléfono) sin fuzzy matching, priorizando precisión sobre recall para evitar vinculaciones incorrectas.
- **Idempotencia por `external_id`**: los mensajes se desduplichan por el ID nativo de Gmail/WhatsApp antes de insertarse, permitiendo que los webhooks sean procesados más de una vez sin consecuencias.
- **Tokens de integración cifrados en reposo**: los tokens OAuth de Gmail y el API token de WhatsApp se almacenan cifrados en la base de datos. La clave de cifrado vive en variables de entorno / secrets manager, nunca en código ni en la DB.
- **JWT con refresh token en cookie HttpOnly**: sesiones de corta duración con renovación silenciosa, sin exponer el refresh token al JavaScript del frontend.

## Bloqueantes / Riesgos

- **Q-02 (WhatsApp)**: si Ciudad Moto requiere múltiples números de WhatsApp (uno por vendedor), el modelo actual de una sola `whatsapp_config` necesita revisión. La API estándar de WhatsApp Business opera con un número por cuenta.
- **Cuenta de WhatsApp Business API**: el cliente debe tener aprobado el acceso a la API oficial de Meta antes del inicio del desarrollo. Sin esto, la integración de WhatsApp no puede implementarse ni probarse.
- **Gmail Pub/Sub**: requiere configurar un proyecto en Google Cloud Platform para la suscripción de notificaciones push. Es una dependencia de infraestructura externa al código.

## Recomendaciones para el siguiente rol

- **Tech Lead**: el documento de arquitectura está listo para revisión. Los puntos más importantes a evaluar son: (1) la elección de ORM/query builder para Node.js (el doc menciona Knex.js pero se puede usar Prisma o Drizzle según preferencia del equipo), y (2) la estrategia de migraciones de base de datos.
- **Backend Developer**: revisar la sección de flujo de integraciones antes de comenzar los módulos `gmail` y `whatsapp`. La lógica de `VinculacionService` es el corazón del módulo de comunicaciones y debe implementarse como un servicio compartido, no duplicarse en cada módulo.
- **Integrations Specialist**: las preguntas Q-01 y Q-02 (número de cuentas de Gmail y WhatsApp) deben resolverse con el cliente antes de comenzar la implementación de integraciones.
