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

## Agentes del equipo

| Rol | Archivo |
|-----|---------|
| PM / Scrum Master | `.claude/agents/project-manager.md` |
| Analista Funcional | `.claude/agents/functional-analyst.md` |
| Arquitecto de Software | `.claude/agents/software-architect.md` |
| Lider Tecnico | `.claude/agents/tech-lead.md` |
| Dev Frontend | `.claude/agents/frontend-developer.md` |
| Dev Backend | `.claude/agents/backend-developer.md` |
| Dev Fullstack | `.claude/agents/fullstack-developer.md` |
| Especialista Integraciones | `.claude/agents/integrations-specialist.md` |
| Ingeniero de Datos | `.claude/agents/data-engineer.md` |
| Cientifico de Datos | `.claude/agents/data-scientist.md` |
| Tester QA | `.claude/agents/tester.md` |
| Especialista Seguridad | `.claude/agents/security-specialist.md` |
| Disenador UI/UX/CX | `.claude/agents/ui-ux-designer.md` |
| Ingeniero Cloud | `.claude/agents/cloud-engineer.md` |
| DevOps | `.claude/agents/devops.md` |

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
