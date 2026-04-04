# Reporte: Propuesta de Stack Tecnologico LeadGen
**Rol**: Software Architect + Tech Lead
**Fecha**: 2026-04-03
**Estado**: En progreso (pendiente aprobacion del usuario)

## Entregables producidos
- `projects/leadgen/docs/technical-architecture.md`

## Resumen de lo realizado
Se evaluaron 2 opciones de stack para el MVP de LeadGen (3 dias):
- Opcion A: Next.js fullstack monolito + Supabase
- Opcion B: Next.js frontend + Fastify backend separado

Se recomienda Opcion A por velocidad de desarrollo y simplicidad de deploy.
Documento incluye: trade-offs, diagrama de componentes, modelo de deploy, integraciones, estructura de carpetas, y ADR-001.

## Decisiones tomadas
- Recomendacion de Opcion A (monolito Next.js + Supabase) — pendiente aprobacion
- ADR-001 redactado como Proposed

## Bloqueantes / Riesgos
- Ninguno. Ambas opciones son viables. La decision es de trade-off tiempo vs separacion.

## Recomendaciones para el siguiente rol
- Esperar aprobacion del usuario sobre el stack
- Una vez aprobado, el Arquitecto debe disenar el schema Prisma
- UX Designer puede arrancar wireframes en paralelo (no depende del stack)
