# Plan de Proyecto — POC Encuestas Streambe

**Responsable**: Alan Turing (PM / Scrum Master)
**Fecha de inicio**: 2026-04-01
**Ultima actualizacion**: 2026-04-01

---

## 1. Datos Generales

| Campo | Valor |
|-------|-------|
| Proyecto | POC Encuestas Streambe |
| Tipo | Nuevo (Proof of Concept) |
| Sprints planificados | 2 |
| Story Points totales | 49 SP |
| Metodologia | Scrum (framework GEN, 23 agentes) |

---

## 2. Equipo Asignado (23 Agentes)

| Rol | Nombre | Color |
|-----|--------|-------|
| PM / Scrum Master | Alan Turing | Azul |
| Product Owner | Marie Curie | Violeta |
| Analista Funcional | Ada Lovelace | Ambar |
| Analista Funcional 2 | Hypatia de Alejandria | Perla |
| Arquitecto de Software | Nikola Tesla | Plata |
| Lider Tecnico | Linus Torvalds | Dorado |
| Dev Frontend 1 | Grace Hopper | Turquesa |
| Dev Frontend 2 | Katherine Johnson | Esmeralda |
| Dev Frontend 3 | Emmy Noether | Jade |
| Dev Backend 1 | Claude Shannon | Rojo |
| Dev Backend 2 | John von Neumann | Cobalto |
| Dev Backend 3 | Blaise Pascal | Bronce |
| Dev Fullstack | Tim Berners-Lee | Naranja |
| Especialista Integraciones | Vint Cerf | Magenta |
| Ingeniero de Datos | Rosalind Franklin | Indigo |
| Cientifico de Datos | Albert Einstein | Blanco |
| Tester QA 1 | Richard Feynman | Verde |
| Tester QA 2 | Niels Bohr | Coral |
| Tester QA 3 | Dorothy Hodgkin | Salmon |
| Especialista Seguridad | Hedy Lamarr | Negro |
| Disenador UI/UX/CX | Leonardo Da Vinci | Rosa |
| Ingeniero Cloud | Carl Sagan | Celeste |
| DevOps | Margaret Hamilton | Gris |

---

## 3. Plan de Sprints

### Sprint 1 — Setup + Auth + CRUD Encuestas (COMPLETADO)

| Metrica | Valor |
|---------|-------|
| Story Points comprometidos | 31 SP |
| Story Points completados | 31 SP |
| Estado | COMPLETADO |

**Epicas cubiertas:**
- Setup del proyecto (Next.js 16, Prisma 7, Neon, Vercel)
- Autenticacion (NextAuth con JWT strategy)
- CRUD de encuestas (crear, editar, eliminar, listar)

### Sprint 2 — Respuestas Publicas + Resultados + Exportacion (PENDIENTE)

| Metrica | Valor |
|---------|-------|
| Story Points comprometidos | 18 SP |
| Estado | PENDIENTE |

**Epicas cubiertas:**
- Endpoint publico para responder encuestas por slug
- Visualizacion de resultados (conteos, porcentajes)
- Exportacion de resultados (CSV)

---

## 4. Camino Critico

```
Setup DB (Neon + Prisma)
  --> Auth (NextAuth + JWT)
    --> API CRUD Encuestas
      --> API Respuestas Publicas
        --> API Resultados + Exportacion
```

Cada etapa depende de la anterior. Cualquier bloqueo en el camino critico impacta directamente la fecha de entrega.

---

## 5. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|-------------|---------|------------|
| R-001 | Neon/Render free tier: limites de conexiones o almacenamiento | Media | Medio | Monitorear uso, tener plan de upgrade documentado |
| R-002 | Spam en endpoint publico de respuestas | Alta | Medio | Implementar rate limiting en Sprint 2 |
| R-003 | Scope creep: pedidos de features fuera del POC | Media | Alto | Mantener scope acotado, derivar features al backlog futuro |
| R-004 | Formulario dinamico complejo: renderizado condicional de tipos de pregunta | Media | Medio | Validar con QA en cada iteracion, tests unitarios por tipo |

---

## 6. Sprint 1 Review

- Todas las stories completadas: 31/31 SP
- Deploy funcional en Vercel
- Base de datos pendiente de conexion final (Neon free tier)
- 46 tests API + 20 tests auth pasando
- Build exitoso en todas las iteraciones

---

## 7. Lecciones Aprendidas Sprint 1

- **Prisma 7**: requiere configuracion diferente a versiones anteriores (no soporta `url` en datasource, necesita `prisma generate` en postinstall)
- **Next.js 16**: middleware deprecado a favor de "proxy", params de rutas dinamicas son Promise
- **Paralelizacion**: lanzar agentes sin dependencias mutuas en paralelo reduce tiempos significativamente

---

## 8. Plan para Sprint 2

**Objetivos:**
1. Endpoint publico para responder encuestas (con rate limiting)
2. API de resultados con conteos y porcentajes
3. Exportacion CSV
4. Tests e2e con Playwright para flujo publico
