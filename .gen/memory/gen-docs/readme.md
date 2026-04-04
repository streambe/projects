---
name: "README — GEN Setup y Estructura"
type: gen-doc
tags: [gen/docs, gen/setup]
created: "2026-03-29"
updated: "2026-04-03"
source: "README.md (root)"
sync: "bidireccional"
related: [[CLAUDE-md], [manual-gen], [team-roster]]
---

# README — GEN

> Fuente: `/README.md` en la raiz del repositorio.

## Que es GEN

Framework de desarrollo basado en Claude Code con 23 agentes especializados.
Metodologia Scrum con validacion iterativa.

## Requisitos
- Claude Code instalado
- Node.js 18+
- Git

## Setup rapido
1. `git checkout gen`
2. `cp .env.example .env` → editar con API keys
3. (Opcional) `git clone VoltAgent/awesome-agent-skills`
4. `claude` → PM arranca automaticamente

## Estructura
```
.claude/agents/      23 agentes especializados
.gen/memory/         Boveda Obsidian de memoria persistente
CLAUDE.md            Configuracion maestra
METODOLOGIA.md       Metodologia documentada
projects/            Carpeta de proyectos
```

## Iniciar proyecto
```bash
git checkout gen
git checkout -b project-mi-proyecto
mkdir projects/mi-proyecto
claude
```

Ver [[team-roster]] para la lista completa de 23 agentes.
