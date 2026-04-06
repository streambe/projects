# nearU — Lecciones Aprendidas

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** PM / Scrum Master (Alan Turing)
**Alcance:** Sprints 1-4 (MVP completo)

---

## 1. Qué salió bien

### 1.1 Spike BLE temprano
Ejecutar un spike de BLE en el **primer día del Sprint 1** nos permitió validar que la API nativa iBeacon de iOS y Android BLE scanning eran suficientes. Evitó la dependencia del SDK FeasyBeacon y eliminó el riesgo más alto del proyecto antes de escribir una línea de código productivo.

### 1.2 Capacitor + Next.js con codebase único
Unificar web y mobile en un único codebase Next.js + Capacitor funcionó mejor de lo esperado. La PWA y las apps nativas comparten ~95% del código. Solo la capa BLE es nativa.

### 1.3 Web mock del plugin BLE
Implementar un mock del plugin BLE que funciona en navegador permitió a todos los devs frontend trabajar sin hardware físico. Acelero Sprint 2 y 3 notablemente.

### 1.4 Static export
Usar `output: 'export'` de Next.js simplificó el deploy a Vercel y la integración con Capacitor (que requiere static assets). Redujo complejidad de infraestructura.

### 1.5 Tests tempranos
Escribir tests Vitest en paralelo al desarrollo (no al final) detectó 6 bugs en Sprint 3 que hubieran sido dolorosos en Sprint 4.

---

## 2. Qué salió mal

### 2.1 Next.js 16 + static export con dynamic routes
`[id]` routes no funcionan con `output: 'export'` si no se pre-definen en `generateStaticParams`. Tuvimos que refactorizar a query params (`?id=xxx`) en la mitad del Sprint 2. Pérdida: ~1 día.

### 2.2 Ausencia de Supabase Auth complicó RLS
La decisión de usar access codes en lugar de Supabase Auth hizo que no pudiéramos usar `auth.uid()` en las políticas RLS. Nos forzó a RLS permisivas para el MVP y a planificar un JWT custom para producción. Lección: si tu RLS depende del auth nativo, pensarlo antes.

### 2.3 Permisos de agentes
Varios agentes tuvieron problemas intermitentes de permisos para escribir archivos durante el desarrollo, especialmente en tareas de refactor. Afectó pequeños bloques de tiempo en múltiples sprints.

### 2.4 Timeline subestimado en testing
Sprint 4 se extendió 2 días por subestimar el tiempo de escribir 76 tests y el audit de seguridad. Lección: testing + security audit deberían valer al menos 30% de la capacity del último sprint.

---

## 3. Decisiones Clave — Evaluación

| Decisión | Resultado | ¿Volvería a tomarla? |
|---|---|---|
| iBeacon nativo en lugar de FeasyBeacon SDK | Éxito | Sí |
| localStorage + access codes en lugar de Supabase Auth | Mixto — funcionó para MVP, complica producción | Reconsideraría para producción desde día uno |
| Charts CSS puros en lugar de librería | Éxito — bundle más liviano | Sí |
| Query params en lugar de dynamic routes | Forzado por Next.js 16 | Sí, pero lo validaría antes del Sprint 1 |
| Web mock del plugin Capacitor | Éxito enorme | Sí, siempre |
| Offline queue con batch sync | Éxito | Sí |
| Static export + Capacitor | Éxito | Sí |

---

## 4. Patrones para Reutilizar (→ `.gen/memory/patterns/`)

### 4.1 Plugin Capacitor con web mock
Cualquier plugin nativo de Capacitor debería tener una implementación web mock que emule el comportamiento para permitir desarrollo sin device. Esto es reutilizable en cualquier proyecto Capacitor futuro.

### 4.2 Offline queue + batch sync
El patrón de "guardar en localStorage / SQLite cuando no hay red, sync batch cuando vuelve" con dedupe en servidor por tupla única es aplicable a cualquier app mobile con conectividad intermitente.

### 4.3 Edge Function para lógica server-side cross-tenant
Cuando hay lógica que no puede vivir en el cliente (como detección mutua para disparar push a ambos), Edge Functions de Supabase son un buen fit. Reutilizable.

### 4.4 Passwordless login con code corto
Para apps de evento o one-shot, un código alfanumérico de 6 chars es suficiente como factor único. Rápido para el usuario. **Importante:** combinarlo con JWT custom y rate limiting.

### 4.5 Spike de riesgo técnico en día 1
Cualquier proyecto con un componente técnico incierto (BLE, ML, integración externa rara) debe empezar con un spike de 1-2 días antes del planning definitivo del Sprint 1.

---

## 5. Checklist Derivado para Próximos Proyectos

- [ ] ¿Hay componentes técnicos inciertos? → Spike en día 1.
- [ ] ¿Es una app Capacitor? → Implementar web mocks de plugins nativos.
- [ ] ¿Vas a usar RLS de Supabase? → Definir auth strategy ANTES del modelo de datos.
- [ ] ¿Usás Next.js con export estático? → Validar todas las rutas dinámicas antes del Sprint 1.
- [ ] ¿El último sprint incluye testing + security? → Reservar 30% de capacity.
- [ ] ¿Hay datos personales? → Consent GDPR desde el MVP, aunque sea mínimo.
- [ ] ¿Offline es requisito? → Diseñar dedupe keys en servidor antes del cliente.
- [ ] ¿Los devs necesitan hardware especial? → Mock desde día 1.

---

## 6. Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Sprints | 4 |
| Duración | 8 semanas (+2 días) |
| Story Points | 73 |
| Velocidad promedio | 18.25 SP/sprint |
| Tareas completadas | 19 |
| Tests escritos | 76 |
| Bugs encontrados | 6 (0 abiertos al cierre) |
| Documentos formales | 6 + deployment guide |
| Agentes GEN involucrados | 13 de 23 |

---
