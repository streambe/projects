# GEN - Sistema Multi-Agente de Desarrollo de Software

Framework de desarrollo basado en **Claude Code** con un equipo de 15 agentes especializados que trabajan con metodologia Scrum y validacion iterativa.

## Requisitos

- [Claude Code](https://claude.ai/claude-code) instalado y autenticado
- Node.js 18+ (para MCPs via npx)
- Git

## Setup rapido

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd <nombre-del-repo>

# 2. Ir al branch gen
git checkout gen

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys (ver seccion "API Keys" abajo)

# 4. (Opcional) Clonar skills de VoltAgent
git clone https://github.com/VoltAgent/awesome-agent-skills.git awesome-agent-skills

# 5. Abrir Claude Code en este directorio
claude
```

## API Keys necesarias

| Servicio | Variable | Donde obtenerla | Para que se usa |
|----------|----------|-----------------|-----------------|
| Composio | `COMPOSIO_API_KEY` | [app.composio.dev/settings](https://app.composio.dev/settings) | Integracion con Trello (gestion de backlog) |

> **Nota:** Composio es opcional. Sin ella, el PM no podra gestionar Trello automaticamente pero el resto del framework funciona igual.

## Estructura

```
.claude/agents/     15 agentes especializados (PM, Arquitecto, Devs, QA, etc.)
.claude/settings.json  MCPs del proyecto (Trello via Composio)
CLAUDE.md           Configuracion maestra y estado del proyecto
METODOLOGIA.md      Metodologia de desarrollo documentada
projects/           Carpeta para proyectos (un branch por proyecto)
```

## Como iniciar un proyecto

```bash
# Crear branch de proyecto desde gen
git checkout gen
git checkout -b project-mi-proyecto
mkdir projects/mi-proyecto

# Abrir Claude Code y el PM arranca automaticamente
claude
```

El PM leera `CLAUDE.md` y te guiara por todo el proceso: relevamiento, arquitectura, diseno, sprints y deploy.

## Agentes del equipo (23 roles)

| Rol | Nombre | Archivo |
|-----|--------|---------|
| PM / Scrum Master | Alan Turing | `project-manager.md` |
| Product Owner | Marie Curie | `product-owner.md` |
| Analista Funcional | Ada Lovelace | `functional-analyst.md` |
| Analista Funcional 2 | Hypatia de Alejandria | `functional-analyst-2.md` |
| Arquitecto de Software | Nikola Tesla | `software-architect.md` |
| Lider Tecnico | Linus Torvalds | `tech-lead.md` |
| Disenador UI/UX/CX | Leonardo Da Vinci | `ui-ux-designer.md` |
| Dev Frontend | Grace Hopper | `frontend-developer.md` |
| Dev Frontend 2 | Katherine Johnson | `frontend-developer-2.md` |
| Dev Frontend 3 | Emmy Noether | `frontend-developer-3.md` |
| Dev Backend | Dennis Ritchie | `backend-developer.md` |
| Dev Backend 2 | John von Neumann | `backend-developer-2.md` |
| Dev Backend 3 | Blaise Pascal | `backend-developer-3.md` |
| Dev Fullstack | Tim Berners-Lee | `fullstack-developer.md` |
| Especialista Integraciones | Claude Shannon | `integrations-specialist.md` |
| Ingeniero de Datos | Rosalind Franklin | `data-engineer.md` |
| Cientifico de Datos | Isaac Newton | `data-scientist.md` |
| Tester QA | Richard Feynman | `tester.md` |
| Tester QA 2 | Niels Bohr | `tester-2.md` |
| Tester QA 3 | Dorothy Hodgkin | `tester-3.md` |
| Especialista Seguridad | Hedy Lamarr | `security-specialist.md` |
| Ingeniero Cloud | Carl Sagan | `cloud-engineer.md` |
| DevOps | Margaret Hamilton | `devops.md` |

Todos los archivos estan en `.claude/agents/`.

## Personalizar permisos

El archivo `.claude/settings.local.json` no se versiona. Si queres modo auto-approve:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allowedTools": ["*"]
  }
}
```
