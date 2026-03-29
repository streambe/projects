# Wireframes — CRM Ciudad Moto
**Versión**: 1.0 (Aprobado)
**Fecha**: 2026-03-29
**Estado**: APROBADO

---

## 1. Layout General / Navegación

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CIUDAD MOTO CRM                                        [Usuario: Juan V.]  [⚙]  [?] │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                        │
│  [🏠] Inicio │   << CONTENIDO PRINCIPAL (cambia por pantalla) >>                     │
│              │                                                                        │
│  [👥] Clientes│                                                                       │
│              │                                                                        │
│  [📋] Pipeline│                                                                       │
│              │                                                                        │
│  [📅] Agenda │                                                                        │
│              │                                                                        │
│  [📊] Reportes│                                                                       │
│              │                                                                        │
│  ──────────  │                                                                        │
│              │                                                                        │
│  [🏪] Sucursal│                                                                       │
│   Norte  ▼  │                                                                        │
│              │                                                                        │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
  ←160px→       ←————————————————————— resto del ancho —————————————————————→
```

**Notas:**
- Sidebar fijo izquierdo, 160px
- Item activo resaltado con fondo diferenciado
- Header top: identidad, usuario logueado, ajustes

---

## 2. Lista de Clientes

```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│  sidebar     │  Clientes                                       [+ Nuevo cliente]     │
│              ├──────────────────────────────────────────────────────────────────────┤
│              │                                                                        │
│              │  [ 🔍 Buscar por nombre, teléfono, email...        ]  [Filtros ▼]     │
│              │                                                                        │
│              │  Filtros activos:  [Sucursal: Norte ×]  [Estado: Activo ×]             │
│              │                                                                        │
│              │ ┌──────┬────────────────┬───────────────┬──────────┬────────┬───────┐ │
│              │ │  □   │ NOMBRE         │ TELÉFONO      │ INTERÉS  │ ESTADO │       │ │
│              │ ├──────┼────────────────┼───────────────┼──────────┼────────┼───────┤ │
│              │ │  □   │ García, Laura  │ 11-4455-6677  │ Honda CB │ Activo │ [···] │ │
│              │ ├──────┼────────────────┼───────────────┼──────────┼────────┼───────┤ │
│              │ │  □   │ Pérez, Marcos  │ 11-2233-4455  │ Yamaha R3│ Activo │ [···] │ │
│              │ ├──────┼────────────────┼───────────────┼──────────┼────────┼───────┤ │
│              │ │  □   │ Rossi, Diana   │ 11-9988-7766  │ —        │ Lead   │ [···] │ │
│              │ ├──────┼────────────────┼───────────────┼──────────┼────────┼───────┤ │
│              │ │  □   │ Molina, Sergio │ 11-5544-3322  │ Bajaj NS │ Activo │ [···] │ │
│              │ └──────┴────────────────┴───────────────┴──────────┴────────┴───────┘ │
│              │                                                                        │
│              │  Mostrando 1–25 de 143 clientes          [ < ]  1  2  3 ...  [ > ]   │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

- CTA principal `[+ Nuevo cliente]` siempre arriba a la derecha
- Menú `[···]` por fila → Ver / Editar / Nueva oportunidad / Desactivar
- Click en nombre → abre perfil del cliente

---

## 3. Perfil del Cliente

```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│  sidebar     │  ← Volver a clientes                                                  │
│              ├──────────────────────────────────────────────────────────────────────┤
│              │  ┌─── ENCABEZADO ──────────────────────────────────────────────────┐ │
│              │  │  [LC]  Laura García                    [Editar]  [+ Actividad]  │ │
│              │  │        laura@email.com · 11-4455-6677 · Activo ●               │ │
│              │  └────────────────────────────────────────────────────────────────┘ │
│              │                                                                        │
│              │  ┌─── COL IZQUIERDA (33%) ──┐  ┌─── COL DERECHA (67%) ────────────┐ │
│              │  │                          │  │                                   │ │
│              │  │  DATOS PERSONALES        │  │  [ Oportunidades | Actividad |    │ │
│              │  │  DNI:    32.111.222       │  │    Comunicaciones | Archivos  ]   │ │
│              │  │  Edad:   34               │  │  ───────────────────────────────  │ │
│              │  │  Ciudad: CABA             │  │                                   │ │
│              │  │  Origen: Instagram        │  │  TAB OPORTUNIDADES (default)      │ │
│              │  │                          │  │  [+ Nueva oportunidad]            │ │
│              │  │  PREFERENCIAS            │  │  ┌────────────────────────────┐  │ │
│              │  │  Moto:   Honda CB 300     │  │  │ Honda CB 300 · $4.200 USD  │  │ │
│              │  │  Presup: $3.000–$5.000    │  │  │ Etapa: Presupuesto         │  │ │
│              │  │                          │  │  │ Cierre est.: 15 abr   ⏰    │  │ │
│              │  │  NOTAS                   │  │  │ [Ver detalle]              │  │ │
│              │  │  "Viene del local Norte,  │  │  └────────────────────────────┘  │ │
│              │  │   preguntó por            │  │                                   │ │
│              │  │   financiación..."        │  │  TAB COMUNICACIONES               │ │
│              │  │  [Editar notas]           │  │  [WhatsApp]  [Email]              │ │
│              │  │                          │  │  ┌───────────────────────────┐   │ │
│              │  └──────────────────────────┘  │  │ 24/03 · WhatsApp · enviado │   │ │
│              │                                │  │ "Hola Laura, te mandamos   │   │ │
│              │                                │  │  el presupuesto..."        │   │ │
│              │                                │  └───────────────────────────┘   │ │
│              │                                │  ┌───────────────────────────┐   │ │
│              │                                │  │ 20/03 · Email · recibido   │   │ │
│              │                                │  │ "Consulta sobre financiac."│   │ │
│              │                                │  └───────────────────────────┘   │ │
│              │                                └───────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

- Columna izquierda: datos fijos (consulta secundaria)
- Columna derecha: zona de mayor uso diario (historial, oportunidades, comunicaciones)
- Historial de comunicaciones: cronológico, indica canal (Gmail/WhatsApp) y dirección (enviado/recibido)

---

## 4. Pipeline Kanban

```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│  sidebar     │  Pipeline de ventas              [Filtrar vendedor ▼]  [Sucursal ▼]  │
│              ├──────────────────────────────────────────────────────────────────────┤
│              │                                                                        │
│              │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────┐│
│              │  │  CONSULTA     │  │ PRUEBA MANEJO │  │  PRESUPUESTO  │  │  CIERRE ││
│              │  │  6 oport.     │  │  4 oport.     │  │  5 oport.     │  │ 2 oport.││
│              │  │  $44.000      │  │  $31.000      │  │  $67.000      │  │ $18.000 ││
│              │  ├───────────────┤  ├───────────────┤  ├───────────────┤  ├─────────┤│
│              │  │ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌───────────┐ │  │┌───────┐││
│              │  │ │L. García  │ │  │ │M. Pérez   │ │  │ │L. García  │ │  ││S.Rojas│││
│              │  │ │Honda CB   │ │  │ │Yamaha R3  │ │  │ │Honda CB   │ │  ││KTM Duke││
│              │  │ │$4.200     │ │  │ │$5.800     │ │  │ │15 abr ⏰  │ │  ││22 abr │││
│              │  │ └───────────┘ │  │ └───────────┘ │  │ └───────────┘ │  │└───────┘││
│              │  │ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌───────────┐ │  │┌───────┐││
│              │  │ │D. Rossi   │ │  │ │A. Torres  │ │  │ │M. Álvarez │ │  ││P.Lima │││
│              │  │ │Bajaj NS   │ │  │ │Honda Wave │ │  │ │Vence hoy ⚠│ │  ││$5.400 │││
│              │  │ └───────────┘ │  │ └───────────┘ │  │ └───────────┘ │  │└───────┘││
│              │  │  [+ Agregar]  │  │  [+ Agregar]  │  │  [+ Agregar]  │  │[+ Agre]││
│              │  └───────────────┘  └───────────────┘  └───────────────┘  └─────────┘│
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

- Drag & drop entre columnas para cambiar etapa
- Click en tarjeta → panel lateral con detalle rápido (sin salir del kanban)
- `[+ Agregar]` en cada columna crea oportunidad directo en esa etapa
- Header de columna: cantidad de oportunidades + valor total
- Íconos ⏰⚠ para oportunidades próximas a vencer o vencidas

---

## Patrones de diseño consistentes

| Elemento | Comportamiento |
|----------|----------------|
| CTA principal | Siempre arriba a la derecha del contenido |
| Búsqueda | Barra ancha, siempre visible en vistas de lista |
| Acciones masivas | Aparecen solo al seleccionar ítems |
| Alertas de fecha | ⏰ próximo a vencer · ⚠ vencido |
| Sidebar | Fijo, ítem activo resaltado |
| Navegación interna | Tabs horizontales dentro del perfil |
