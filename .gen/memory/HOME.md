---
aliases: [index, inicio, memoria]
tags: [gen/core]
---

# GEN Memory Vault

Boveda de conocimiento persistente del framework GEN.
Cada conversacion lee y escribe aqui. El grafo crece con cada proyecto.

---

## Documentos core de GEN

| Documento | Fuente | Descripcion |
|-----------|--------|-------------|
| [[CLAUDE-md]] | `/CLAUDE.md` | Configuracion maestra — fuente de verdad |
| [[metodologia]] | `/METODOLOGIA.md` | Metodologia Scrum + PMI multi-agente |
| [[readme]] | `/README.md` | Setup rapido y estructura del repo |
| [[manual-gen]] | `/manual-gen.docx` | Manual de usuario completo v2.2.0 |
| [[ley-fundamental]] | — | Loop iterativo de aprobacion |
| [[lecciones-aprendidas]] | — | Lecciones cross-proyecto acumuladas |

---

## Navegacion por tipo

| Carpeta | Contenido | Index |
|---------|-----------|-------|
| [[feedback/INDEX\|feedback/]] | Reglas de comportamiento del agente | 12 reglas activas |
| [[user/INDEX\|user/]] | Perfil y preferencias del usuario | 1 memoria |
| [[projects/INDEX\|projects/]] | Contexto por proyecto | 2 proyectos |
| [[reference/INDEX\|reference/]] | URLs, herramientas, contactos | 1 referencia |
| [[decisions/INDEX\|decisions/]] | ADRs cross-proyecto | — |
| [[team/INDEX\|team/]] | Roster y capacidades del equipo | [[team-roster]] |
| [[retrospectives/INDEX\|retrospectives/]] | Lecciones por sprint | — |
| [[patterns/INDEX\|patterns/]] | Patrones reutilizables descubiertos | — |
| [[gen-docs/]] | Documentos core del framework | 6 docs |

---

## Por proyecto

- [[encuestas]] — App de encuestas Streambe (POC completo, branch `project-encuestas`)
- [[municipia]] — Red federada IA municipal (RSE Streambe, inception)

---

## Recientes
%% GEN actualiza esta seccion al cierre de cada sesion %%
- 2026-04-03: Creacion de boveda Obsidian, migracion de 17 memorias, inclusion de docs core

---

## Protocolo de uso

```
AL INICIO:
  1. Leer HOME.md (este archivo)
  2. Leer feedback/INDEX.md (reglas activas)
  3. Leer memorias relevantes al proyecto/tarea
  4. Verificar que CLAUDE-md.md este sincronizado con /CLAUDE.md

DURANTE:
  - Feedback del usuario → crear/actualizar en feedback/
  - Contexto de proyecto → crear/actualizar en projects/
  - Decision cross-proyecto → documentar en decisions/
  - Leccion aprendida → agregar en lecciones-aprendidas.md
  - Usar [[wikilinks]] para conectar todo

AL CIERRE:
  - Actualizar seccion "Recientes" de HOME.md
  - Sincronizar CLAUDE-md.md si hubo cambios
  - Commitear: chore(memory): update vault
```

---

*Version vault: 1.0.0 — Creada 2026-04-03*
*Abrir como vault en Obsidian: `.gen/memory/`*
