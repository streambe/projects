# Reporte: Propuesta de Stack Tecnológico MunicipIA
**Rol**: Software Architect (Nikola Tesla) + Tech Lead (Linus Torvalds)
**Fecha**: 2026-04-02
**Estado**: En progreso (Iteración 1, pendiente aprobación)

## Entregables producidos
- `projects/municipia/docs/technical-architecture.md` — Propuesta completa con 2 opciones por capa, stack recomendado, costos y ADR-001

## Resumen de lo realizado
- Evaluamos 2 opciones para cada una de las 9 capas del stack (frontend, backend, DB, vectores, embeddings, pipeline, infra, CI/CD, monitoreo, auth admin)
- Propusimos stack recomendado: Next.js 15 monolito + Supabase (pgvector) + Voyage AI + GitHub Actions
- Estimamos costos: $0 infraestructura, solo ~$15-30/mo de API Anthropic (cubierto por Streambe)
- Redactamos ADR-001 con la decisión y rationale

## Decisiones tomadas
- pgvector en Supabase en lugar de servicio vectorial dedicado (elimina un servicio, $0 adicional)
- Edge Runtime para streaming de chat (evita timeout de 10s de Vercel Hobby)
- GitHub Actions para pipeline de ingestion (gratis para open source)
- Voyage AI para embeddings (free tier de 200M tokens)
- Monolito Next.js en lugar de backend separado (simplicidad)

## Bloqueantes / Riesgos
- Vercel Hobby puede quedar corto si el tráfico supera expectativas (plan B: upgrade a Pro $20/mo o migrar API)
- Supabase free tier 500MB: monitorear crecimiento con 8 municipios + historial
- Voyage AI puede cambiar free tier (plan B: OpenAI embeddings)

## Recomendaciones para el siguiente rol
- Esperar aprobación del usuario sobre el stack antes de definir schemas, contratos API o componentes detallados
- UX Designer puede avanzar en paralelo con wireframes (no depende del stack)
