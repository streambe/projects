# Acta de Constitución — POC Encuestas Streambe

**Fecha:** 2026-04-01
**Sponsor:** Streambe
**PM:** Alan Turing

---

## 1. Descripción del Proyecto

Aplicación web para crear, enviar y analizar encuestas de satisfacción de clientes de Streambe. Proof of Concept (POC) con funcionalidad completa pero scope acotado.

## 2. Alcance

### In Scope
- F1: Crear encuesta (título, descripción, preguntas: texto libre, opción múltiple, escala 1-5, sí/no)
- F2: Gestionar encuestas (CRUD, activar/desactivar)
- F3: Compartir encuesta via link único
- F4: Responder encuesta (pública, sin login, mobile-first)
- F5: Dashboard de resultados (gráficos por pregunta, tabla de respuestas)
- F6: Exportar resultados a CSV/Excel
- F7: Auth básico (email + password)

### Out of Scope
- Envío por email/WhatsApp
- Lógica condicional en preguntas
- Multi-idioma
- Roles/permisos (un solo tipo de usuario admin)
- Identificación de encuestados (todas anónimas)

## 3. Requerimientos No Funcionales
- Responsive (mobile-first para encuestados)
- Carga < 2s
- Soporte para ~100 encuestas y ~1000 respuestas

## 4. Stack Tecnológico (Aprobado)

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| BD | PostgreSQL (Neon serverless) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials) |
| Charts | Recharts |
| Export | xlsx |
| Deploy | Vercel |
| Testing | Vitest + Playwright |

## 5. Equipo Asignado

| Rol | Nombre | Agente |
|-----|--------|--------|
| PM / Scrum Master | Alan Turing | project-manager |
| Product Owner | Marie Curie | product-owner |
| Analista Funcional | Ada Lovelace | functional-analyst |
| Analista Funcional 2 | Hypatia de Alejandría | functional-analyst-2 |
| Arquitecto Software | Nikola Tesla | software-architect |
| Líder Técnico | Linus Torvalds | tech-lead |
| Frontend Lead | Grace Hopper | frontend-developer |
| Frontend 2 | Katherine Johnson | frontend-developer-2 |
| Frontend 3 | Emmy Noether | frontend-developer-3 |
| Backend Lead | Alan Kay | backend-developer-2 |
| Backend 2 | John von Neumann | backend-developer-3 |
| Backend 3 | Blaise Pascal | fullstack-developer |
| Fullstack | Tim Berners-Lee | integrations-specialist |
| QA Lead | Richard Feynman | tester |
| QA 2 | Niels Bohr | tester-2 |
| QA 3 | Dorothy Hodgkin | tester-3 |
| Seguridad | Hedy Lamarr | cloud-engineer |
| Cloud | Carl Sagan | cloud-engineer |
| DevOps | Margaret Hamilton | devops |
| UX/UI | Leonardo Da Vinci | ui-ux-designer |
| Data Engineer | Rosalind Franklin | data-engineer |
| Data Scientist | Werner Heisenberg | data-scientist |
| Product Owner | Marie Curie | product-owner |

## 6. Plan de Trabajo

### Sprint 1 — Fundación + CRUD (31 SP)
**Goal:** Usuario puede loguearse, crear encuestas y compartir link.

| Story | SP | Asignado |
|-------|----|----------|
| US-001 Setup frontend | 3 | Grace Hopper |
| US-002 Setup Prisma + Neon | 3 | Alan Kay |
| US-003 Setup Vercel + CI | 2 | Margaret Hamilton + Carl Sagan |
| US-004 NextAuth.js credentials | 3 | Alan Kay |
| US-005 Login + layout | 2 | Grace Hopper |
| US-006 API CRUD encuestas | 5 | John von Neumann |
| US-007 Dashboard listado | 3 | Katherine Johnson |
| US-008 Crear/Editar encuesta | 5 | Grace Hopper |
| US-009 Gestionar encuesta | 3 | Katherine Johnson |
| US-010 Validaciones backend | 2 | Alan Kay |

### Sprint 2 — Respuestas + Resultados (18 SP)
**Goal:** Encuesta pública funcional, resultados con gráficos y exportación.

| Story | SP | Asignado |
|-------|----|----------|
| US-011 API respuestas | 3 | Alan Kay |
| US-012 Pantalla pública | 3 | Grace Hopper |
| US-013 Confirmación post-envío | 2 | Emmy Noether |
| US-014 API resultados | 3 | John von Neumann |
| US-015 Pantalla resultados + gráficos | 5 | Katherine Johnson |
| US-016 Exportar Excel/CSV | 2 | Blaise Pascal |

**Total: 49 SP | 2 Sprints | ~4 semanas**

## 7. Riesgos y Mitigación

| Riesgo | Mitigación |
|--------|-----------|
| Neon free tier límites | Connection pooling Prisma |
| Spam endpoint público | Rate limiting middleware |
| Scope creep | 7 features fijas, extras a backlog post-POC |
| Form dinámico complejo | Empezar simple, iterar |

## 8. Criterios de Éxito
- Las 7 features funcionando en producción
- 0 bugs P1/P2
- Carga < 2s
- Mobile responsive
- Usuario puede crear, compartir y analizar encuestas end-to-end

## 9. Supuestos y Restricciones
- No hay sistema existente a integrar
- Sin deadline fijo, priorizar velocidad
- Free tier de Neon y Vercel suficiente para POC
- Un solo tipo de usuario admin

## 10. Aprobaciones

| Item | Estado | Fecha |
|------|--------|-------|
| Requerimientos | APROBADO | 2026-04-01 |
| Stack tecnológico | APROBADO | 2026-04-01 |
| Arquitectura | APROBADO | 2026-04-01 |
| Wireframes UX/UI | APROBADO | 2026-04-01 |
| Plan de Trabajo | APROBADO | 2026-04-01 |
| Acta de Constitución | PENDIENTE | — |

---

*Generado por el equipo GEN — Alan Turing, PM*
