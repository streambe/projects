# nearU — Security Audit

**Versión:** 1.0
**Fecha:** 2026-04-05
**Responsable:** Especialista Seguridad (Hedy Lamarr)
**Estado:** GO condicional

---

## 1. Resumen Ejecutivo

Se auditó la superficie completa del MVP nearU: backend Supabase, API Edge Functions, cliente web/PWA, y la capa nativa Capacitor. El MVP es **apto para testing interno y TestFlight/Internal Track** pero **NO apto para manejar datos reales de participantes en producción** hasta completar el tightening de RLS y reemplazar el login por access code con un esquema JWT propio.

**Veredicto:** **GO para MVP / testing** — **NO-GO para producción con datos reales**.

---

## 2. Amenazas Identificadas

| # | Amenaza | Severidad | Estado |
|---|---|---|---|
| T-01 | Sin Supabase Auth: access codes son el único factor de autenticación | MEDIO | Aceptado para MVP |
| T-02 | Datos personales de participantes (GDPR/LPDP) sin consent ni cifrado en reposo extra | MEDIO | Mitigación pendiente |
| T-03 | RLS permisivas para desarrollo rápido | MEDIO | Migration 003 creada, tightening pendiente |
| T-04 | Beacon spoofing por clonación de UUID+minor | BAJO | Mitigación v2 con rotating keys |
| T-05 | Access codes de 6 chars con rate limit débil | BAJO | Edge Function con rate limit implementado |
| T-06 | Push tokens sin validación de ownership | BAJO | Mitigado en `/api/auth/code` |
| T-07 | Storage bucket público de fotos | BAJO | Aceptado — fotos son públicas en el evento |

---

## 3. Pruebas Ejecutadas

### 3.1 OWASP-like Checklist

| Categoría | Resultado | Notas |
|---|---|---|
| Injection (SQL) | PASS | Supabase client parametriza todo; no hay raw SQL en cliente |
| XSS | PASS | React auto-escape + no usamos `dangerouslySetInnerHTML` |
| CSRF | N/A | API es stateless con JWT en Authorization header |
| Broken Auth | **WARN** | Access code es el único factor — documentado como riesgo aceptado en MVP |
| Sensitive Data Exposure | **WARN** | Emails y nombres viajan sin cifrado extra (TLS suficiente para MVP) |
| Broken Access Control | **WARN** | RLS permisivas — tightening pendiente (ver sección 4) |
| Security Misconfiguration | PASS | Supabase por defecto tiene TLS, backups, logs |
| Insecure Deserialization | PASS | Solo JSON, sin deserialización custom |
| Components with Known Vulns | PASS | `npm audit` sin vulnerabilidades HIGH/CRITICAL |
| Insufficient Logging | PASS | Supabase logs + Vercel logs activos |

### 3.2 Input Validation
- Access code: regex `/^[A-Z0-9]{6}$/`, rechazos loggeados.
- Email: validación RFC básica en cliente y servidor.
- CSV import: sanitización de caracteres de control, límite 10k filas.
- Nombres/empresas: max 200 chars, HTML escape.

### 3.3 Rate Limiting
- `/api/auth/code`: 5 intentos por IP por minuto (Edge Function).
- `/api/sync`: 10 batches por minuto por participant.
- `/api/proximity`: 60 req/min por participant.

### 3.4 Secrets
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` es pública por diseño (RLS protege).
- No hay secrets hardcodeados en el repo (verificado con grep).
- `.env` excluido de git.

---

## 4. Recomendaciones

### Obligatorias antes de producción

1. **Implementar custom JWT** vía Edge Function:
   - Validar access code.
   - Emitir JWT con claims `{participant_id, event_id, exp}`.
   - Firmar con secret de Supabase JWT.
2. **Tightening de RLS** (`003_rls_policies.sql`):
   - `events`: write solo `created_by = auth.uid()`.
   - `proximity_events`: read solo si eres `observer_id` u organizador del evento.
   - `encounters`: read solo si eres `participant_a` o `participant_b`.
   - `participants`: read solo propio perfil o mismos eventos.
3. **Consent GDPR** en el login:
   - Texto corto con link a política de privacidad.
   - Checkbox obligatorio antes de aceptar el código.
4. **Encriptar SQLite local** con Capacitor Secure Storage plugin.
5. **Audit logs** para accesos admin al backoffice.

### Recomendadas

6. **Rotating beacon keys** en v2 para evitar spoofing.
7. **Monitoreo de anomalías** — alertar si un beacon detecta >1000 encuentros/hora.
8. **Política de retención** — eliminar `proximity_events` 90 días post-evento.
9. **Right to be forgotten** — endpoint para borrar perfil y encuentros.

---

## 5. Cumplimiento

| Norma | Aplica | Estado MVP |
|---|---|---|
| GDPR / LPDP | Sí | Parcial — consent pendiente |
| PCI-DSS | No | No se manejan pagos |
| HIPAA | No | No se manejan datos de salud |
| SOC 2 | No (MVP) | Futuro si se comercializa |

---

## 6. Veredicto Final

**GO** para:
- Testing interno del equipo.
- Demo a sponsor.
- TestFlight / Google Play Internal Track con datos ficticios.

**NO-GO** para:
- Producción con datos reales de participantes.
- Eventos públicos con más de 50 personas reales.

**Condiciones para levantar el NO-GO:**
1. JWT custom implementado.
2. RLS tightening aplicado y verificado.
3. Consent GDPR agregado al login.
4. SQLite local encriptado.

---
