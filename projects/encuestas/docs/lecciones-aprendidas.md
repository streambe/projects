# Lecciones Aprendidas — POC Encuestas Streambe

**Responsable**: Alan Turing (PM / Scrum Master)
**Ultima actualizacion**: 2026-04-01

---

## Sprint 1

### Prisma 7 Breaking Changes

- **Problema**: Prisma 7 no soporta la propiedad `url` directamente en el bloque `datasource`. La configuracion que funcionaba en Prisma 5/6 rompe en la version 7.
- **Solucion**: Usar la nueva sintaxis de configuracion de Prisma 7 y agregar `prisma generate` como script `postinstall` en package.json para que Vercel genere el client durante el build.
- **Checklist derivado**: Al iniciar un proyecto con Prisma, verificar la version y consultar el migration guide oficial antes de copiar configuraciones de proyectos anteriores.

### Next.js 16 — Middleware Deprecado

- **Problema**: Next.js 16 depreco el sistema de middleware tradicional a favor de un nuevo sistema llamado "proxy". Los params de rutas dinamicas ahora son `Promise` y deben ser awaited.
- **Solucion**: Mantener el middleware actual (funciona con warning) y planificar migracion cuando la nueva API se estabilice. Para params dinamicos, usar `await params` en todos los route handlers.
- **Checklist derivado**: Al actualizar Next.js a una major version, revisar el changelog completo y probar middleware y rutas dinamicas antes de avanzar con el desarrollo.

### shadcn/ui v2 con base-ui

- **Problema**: shadcn/ui v2 migro a base-ui internamente. La prop `asChild` ya no existe y causa errores silenciosos o de compilacion.
- **Solucion**: Usar la prop `render` en su lugar para composicion de componentes.
- **Checklist derivado**: Verificar la version de shadcn/ui y leer la guia de migracion antes de usar patrones de versiones anteriores.

### Deploy en Vercel — Prisma Generate

- **Problema**: El build en Vercel falla si Prisma client no esta generado. Localmente funciona porque el client se genera al correr `prisma migrate`, pero en Vercel no hay paso de migracion automatico.
- **Solucion**: Agregar `"postinstall": "prisma generate"` en package.json.
- **Checklist derivado**: Todo proyecto con Prisma desplegado en Vercel necesita el script postinstall.

### Paralelizacion de Agentes

- **Observacion**: Lanzar agentes que no tienen dependencias mutuas en paralelo (por ejemplo, frontend y backend trabajando en features independientes) reduce significativamente el tiempo total del sprint.
- **Recomendacion**: En Sprint Planning, identificar explicitamente las tareas paralelizables y asignarlas a agentes distintos desde el inicio.
