# Reporte: Setup inicial del frontend — CRM Ciudad Moto
**Rol**: Frontend Developer
**Fecha**: 2026-03-29
**Estado**: Completado

## Entregables producidos

### Configuracion del proyecto
- `frontend/package.json` — dependencias completas (React 18, Vite 5, shadcn/ui, TanStack Query v5, React Router v6, Zod, Axios, dnd-kit, react-hook-form)
- `frontend/vite.config.ts` — proxy al backend en puerto 3000, alias `@/` -> `src/`
- `frontend/tailwind.config.ts` — tokens de color del sistema de diseño, fuentes DM Sans / DM Mono
- `frontend/tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — configuracion TypeScript estricta con tipos Vite client
- `frontend/postcss.config.js`
- `frontend/index.html` — fuentes Google Fonts (DM Sans, DM Mono)
- `frontend/.env.example`
- `frontend/.gitignore`

### Estilos y sistema de diseño
- `frontend/src/index.css` — variables CSS de shadcn/ui completas (light + dark mode), palette "industrial refinada": azul pizarra oscuro como primary, ambar como accent, sidebar con tokens propios

### Capa compartida
- `frontend/src/shared/lib/axios.ts` — instancia configurada con baseURL de env var, interceptor de request para JWT Bearer, interceptor de response para refresh automatico con cola de requests pendientes, sin race conditions
- `frontend/src/shared/lib/queryClient.ts` — TanStack Query con staleTime 30s, gcTime 5min, retry 1, refetchOnWindowFocus solo en produccion
- `frontend/src/shared/lib/utils.ts` — `cn()`, `formatDate()`, `formatDateTime()`, `initials()`
- `frontend/src/shared/types/index.ts` — tipos TypeScript para todos los modelos del dominio (User, Client, Opportunity, Activity, Message, tipos de enum)
- `frontend/src/shared/hooks/useDocumentTitle.ts`
- `frontend/src/shared/hooks/useDebounce.ts`

### Componentes UI (shadcn)
- `src/shared/components/ui/button.tsx`
- `src/shared/components/ui/input.tsx`
- `src/shared/components/ui/label.tsx`
- `src/shared/components/ui/card.tsx`
- `src/shared/components/ui/separator.tsx`
- `src/shared/components/ui/avatar.tsx`
- `src/shared/components/ui/tooltip.tsx`
- `src/shared/components/ui/dropdown-menu.tsx`

### Componentes de aplicacion
- `src/shared/components/Layout.tsx` — sidebar fijo 160px con logo, nav items, seccion de usuario con dropdown. Header con settings e initials del usuario. Usa `<Outlet />` de React Router.
- `src/shared/components/ProtectedRoute.tsx` — redirige a /login si no autenticado, preserva la ruta de destino en `state.from`

### Modulo auth
- `src/modules/auth/AuthContext.tsx` — contexto de autenticacion con estado `user`, acciones `login` / `logout`, hook `useAuth()`
- `src/modules/auth/pages/LoginPage.tsx` — formulario email + password con validacion Zod + react-hook-form, toggle de visibilidad de password, manejo de errores del servidor, panel branding lateral en desktop

### Paginas de modulos
- `src/modules/clients/pages/ClientsPage.tsx`
- `src/modules/pipeline/pages/PipelinePage.tsx` — estructura Kanban con columnas para las 4 etapas
- `src/modules/activities/ActivitiesPage.tsx`
- `src/modules/communications/CommunicationsPage.tsx`
- `src/pages/DashboardPage.tsx` — grid de stat cards y secciones de proximas actividades / oportunidades recientes
- `src/pages/ReportsPage.tsx`
- `src/pages/NotFoundPage.tsx`

### Enrutamiento
- `src/App.tsx` — rutas publicas (/login), rutas protegidas bajo `<ProtectedRoute>` + `<Layout>`, catch-all 404
- `src/main.tsx` — composicion de providers: QueryClientProvider > BrowserRouter > AuthProvider > App. ReactQueryDevtools solo en desarrollo.

## Resumen de lo realizado

Setup completo del proyecto frontend listo para desarrollo. La estructura de carpetas modular por dominio esta en su lugar. El build de produccion compila sin errores (`tsc -b && vite build`). El proyecto puede levantarse con `npm install && npm run dev`.

## Decisiones tomadas

- **Palette "industrial refinada"**: azul pizarra profundo (primary) + ambar (accent) en lugar de los tipicos degradados azul/violeta generico. Coherente con el rubro automotriz.
- **DM Sans + DM Mono**: fuentes con personalidad, legibles a tamanos pequeños, de uso comercial libre.
- **Tokens CSS separados para sidebar**: el sidebar tiene su propio set de variables (--sidebar, --sidebar-foreground, etc.) permitiendo un contraste fuerte sidebar oscuro / contenido claro sin necesidad de modo oscuro completo.
- **Access token en memoria**: el JWT de acceso se guarda en memoria JavaScript (no en localStorage), mientras que el refresh token viaja en HttpOnly cookie. Esto sigue el spec de seguridad RNF-03/04 del documento de arquitectura.
- **Cola de requests en interceptor de refresh**: si multiples requests simultaneas reciben 401, solo se ejecuta un refresh y el resto espera en cola. Esto evita multiples llamadas concurrentes al endpoint de refresh.
- **`noUnusedLocals` y `noUnusedParameters` activos**: el compilador es estricto desde el dia 1 para evitar deuda tecnica.
- **`refetchOnWindowFocus` solo en produccion**: reduce el ruido de requests en desarrollo al volver al foco de la ventana.

## Bloqueantes / Riesgos

- El proyecto no tiene backend todavia. El proxy de Vite esta configurado hacia `localhost:3000` pero el login mostrara error hasta que el backend este disponible. Esto es esperado.
- Las vulnerabilidades de npm reportadas son de severidad moderada y no afectan al runtime de produccion (son en dependencias de desarrollo). Se pueden revisar con `npm audit` cuando el proyecto este mas maduro.

## Recomendaciones para el siguiente rol

- **Backend developer**: el frontend espera los endpoints `POST /api/v1/auth/login` (devuelve `{ accessToken, user }`) y `POST /api/v1/auth/refresh` (devuelve `{ accessToken }`). El refresh token debe setearse como HttpOnly cookie en la respuesta del login.
- **Frontend iteracion siguiente**: las paginas de Clientes y Pipeline son scaffolds. El siguiente paso es implementar el listado real de clientes con TanStack Query y el kanban draggable con dnd-kit. Los tipos en `shared/types/index.ts` estan listos para usarse.
- **Configuracion adicional**: copiar `.env.example` a `.env` y ajustar `VITE_API_BASE_URL` segun el ambiente.
