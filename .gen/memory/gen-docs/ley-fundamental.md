---
name: "Ley Fundamental — Loop Iterativo de Aprobacion"
type: gen-doc
tags: [gen/docs, gen/core, gen/proceso]
created: "2026-03-29"
updated: "2026-04-03"
related: [[CLAUDE-md], [metodologia], [auto-approve-mode]]
---

# Ley Fundamental — Loop Iterativo de Aprobacion

Mecanismo central de GEN. Todo agente que produce un entregable opera bajo este loop sin excepcion ni limite de iteraciones.

## El loop

```
1. Agente carga skills
2. Agente produce/mejora entregable (vN)
3. PM presenta al usuario con cambios vs version anterior
4. Usuario responde:
   - APROBADO → avanza
   - feedback → agente mejora → nueva iteracion (volver a 1)
```

## Senales de aprobacion validas
"APROBADO", "approved", "LGTM", "go ahead", "adelante", "dale", "confirmado", "perfecto, segui"

## NO son aprobacion
"ok", "interesante", "bien", "gracias", silencio

## Escalamiento
- Iteracion 5: PM pregunta si reorientar enfoque
- Iteracion 10: revisar requerimientos base
- Iteracion 15: pausa y sesion colaborativa

## Artefactos sujetos al loop
- Requerimientos funcionales
- Stack tecnologico
- Arquitectura de alto nivel
- Wireframes y disenos UX/UI
- Sprint Goal y backlog
- Features de seguridad y pagos
- Deploy a produccion
- ADRs
- Criterios de aceptacion

## Excepcion: [[auto-approve-mode]]
GEN aprueba internamente decisiones tecnicas. Escala al usuario solo para decisiones de negocio, deploy y cambios de arquitectura.
