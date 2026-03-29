# Especificación Funcional: CRM Básico — Ciudad Moto

**Versión**: 1.0 (Draft)
**Fecha**: 2026-03-29
**Preparado por**: Analista Funcional — Equipo GEN
**Estado**: Pendiente de aprobación del cliente

---

## 1. Descripción General

Ciudad Moto es una cadena dedicada a la venta de motocicletas. El presente documento especifica los requerimientos funcionales del CRM básico (Customer Relationship Management) que se desarrollará para gestionar el ciclo comercial completo: desde el primer contacto con un cliente potencial hasta el cierre de una venta.

El sistema permitirá a los vendedores y dueños registrar clientes, hacer seguimiento de las oportunidades de venta a través de un pipeline, registrar actividades comerciales (llamadas, reuniones, tareas) y comunicarse con los clientes por Gmail y WhatsApp, con todo el historial centralizado en el perfil del cliente.

### Usuarios del sistema
- **Vendedor**: opera el CRM en el día a día.
- **Dueño**: utiliza el sistema con las mismas capacidades que el vendedor.

Ambos roles tienen acceso idéntico a todas las funcionalidades. No existe diferenciación de permisos entre ellos en este MVP.

### Stack tecnológico definido
- Frontend: React JS
- Backend: Node JS
- Base de datos: PostgreSQL
- Integraciones: Gmail API y WhatsApp Business API

---

## 2. Módulos / EPICs

| ID | Módulo | Descripción resumida |
|----|--------|----------------------|
| M-01 | Gestión de Clientes | Alta, edición, consulta y detección de duplicados de clientes. |
| M-02 | Pipeline de Ventas | Seguimiento de oportunidades comerciales por etapas. |
| M-03 | Actividades | Registro y seguimiento de llamadas, reuniones y tareas vinculadas a clientes u oportunidades. |
| M-04 | Comunicaciones | Integración con Gmail y WhatsApp para enviar y recibir mensajes desde el CRM. |
| M-05 | Reportes | Reportes básicos de gestión comercial. |
| M-06 | Autenticación | Acceso seguro al sistema mediante usuario y contraseña. |

---

## 3. Requerimientos Funcionales

### M-01 — Gestión de Clientes

**RF-01 — Alta de cliente**
El sistema debe permitir registrar un nuevo cliente con los siguientes campos:

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| Nombre | Si | |
| Apellido | Si | |
| DNI | Si | Debe ser único en el sistema |
| Teléfono principal | Si | Debe ser único en el sistema |
| Teléfono alternativo | No | |
| Correo electrónico | No | Se usa para vincular comunicaciones de Gmail |
| Número de WhatsApp | No | Se usa para vincular comunicaciones de WhatsApp; puede coincidir con teléfono principal |
| Localidad / Ciudad | No | |
| Provincia | No | |
| Fecha de nacimiento | No | Útil para seguimiento comercial |
| Cómo nos conoció | No | Lista de opciones: Instagram, Facebook, Google, Referido, Visita directa, Otro |
| Notas internas | No | Campo de texto libre para observaciones del vendedor |

**RF-02 — Detección de duplicados en el alta**
Antes de guardar un nuevo cliente, el sistema debe verificar si ya existe un cliente registrado con el mismo DNI o el mismo número de teléfono principal. Si se detecta un duplicado, el sistema debe mostrar una alerta al usuario indicando qué cliente existente coincide y permitir al usuario decidir si continúa con el alta o cancela la operación.

**RF-03 — Edición de cliente**
El sistema debe permitir editar todos los campos del perfil de un cliente en cualquier momento. La detección de duplicados (RF-02) también debe ejecutarse al modificar DNI o teléfono principal.

**RF-04 — Consulta y búsqueda de clientes**
El sistema debe ofrecer una vista de listado de clientes con capacidad de búsqueda por: nombre, apellido, DNI y teléfono. El listado debe mostrar como mínimo: nombre completo, DNI, teléfono principal y fecha de alta.

**RF-05 — Perfil del cliente**
Cada cliente debe tener una página de perfil que centralice: sus datos personales, el historial de oportunidades de venta asociadas, las actividades registradas y el historial de comunicaciones (emails y mensajes de WhatsApp).

**RF-06 — Eliminación lógica de clientes**
El sistema debe permitir marcar un cliente como inactivo (no eliminarlo físicamente de la base de datos). Los clientes inactivos no deben aparecer en los listados por defecto, pero deben poder consultarse mediante un filtro específico.

---

### M-02 — Pipeline de Ventas

**RF-07 — Creación de oportunidad**
El sistema debe permitir crear una oportunidad de venta asociada a un cliente existente. Una oportunidad debe registrar como mínimo: cliente vinculado, modelo de moto de interés (texto libre), usuario responsable (quien la crea), fecha de creación y etapa actual.

**RF-08 — Etapas del pipeline**
El pipeline debe tener las siguientes etapas, en este orden:

1. Consulta
2. Prueba de manejo
3. Presupuesto
4. Cierre

**RF-09 — Movimiento entre etapas**
El sistema debe permitir mover una oportunidad a cualquier etapa del pipeline de forma manual, sin restricciones de orden secuencial obligatorio. El cambio de etapa debe quedar registrado en el historial de la oportunidad con fecha y usuario que realizó el cambio.

**RF-10 — Cierre de oportunidad**
Al mover una oportunidad a la etapa "Cierre", el sistema debe solicitar al usuario que indique el resultado: Ganado o Perdido. Si el resultado es "Perdido", debe poder registrarse un motivo de cierre en texto libre.

**RF-11 — Vista del pipeline (Kanban)**
El sistema debe ofrecer una vista tipo tablero Kanban donde cada columna represente una etapa del pipeline y cada tarjeta represente una oportunidad. Las tarjetas deben mostrar al menos: nombre del cliente, modelo de moto de interés y fecha de la última actividad.

**RF-12 — Independencia del stock**
El pipeline de ventas es completamente independiente del inventario de motos. El sistema no valida disponibilidad de stock al crear ni gestionar oportunidades.

---

### M-03 — Actividades

**RF-13 — Tipos de actividad**
El sistema debe soportar los siguientes tipos de actividad: Llamada, Reunión/Visita y Tarea.

**RF-14 — Creación de actividad**
El sistema debe permitir crear una actividad con los siguientes campos:

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| Tipo | Si | Llamada / Reunión / Tarea |
| Título / Asunto | Si | |
| Cliente vinculado | Si | |
| Oportunidad vinculada | No | Permite asociar la actividad a una oportunidad específica |
| Fecha y hora | Si | |
| Fecha de vencimiento | No | Para actividades pendientes o tareas con deadline |
| Usuario responsable | Si | Por defecto el usuario logueado |
| Notas / Resumen | No | Campo de texto libre para registrar el resultado o detalle de la actividad |
| Estado | Si | Pendiente / Realizada |

**RF-15 — Registro del resultado de una actividad**
Al marcar una actividad como "Realizada", el sistema debe permitir (no obligar) registrar un resumen en texto libre sobre lo conversado o acordado.

**RF-16 — Listado de actividades**
El sistema debe ofrecer una vista de listado de actividades con capacidad de filtrar por: estado (pendiente / realizada), tipo, usuario responsable y rango de fechas. Las actividades vencidas y pendientes deben destacarse visualmente.

**RF-17 — Actividades en el perfil del cliente**
El historial de actividades de un cliente debe ser visible desde su perfil (RF-05).

---

### M-04 — Comunicaciones (Gmail y WhatsApp)

**RF-18 — Vinculación de cuentas**
El sistema debe permitir conectar una o más cuentas de Gmail y una cuenta de WhatsApp Business. La vinculación se realiza una sola vez a nivel de configuración del sistema.

**RF-19 — Envío de email desde el CRM**
Desde el perfil de un cliente o desde una oportunidad, el sistema debe permitir redactar y enviar un email al cliente utilizando la cuenta de Gmail vinculada.

**RF-20 — Recepción de emails**
El sistema debe recibir los emails entrantes de la cuenta de Gmail vinculada. Si el remitente coincide con el correo electrónico de un cliente registrado, el email debe vincularse automáticamente al perfil de ese cliente.

**RF-21 — Envío de mensajes de WhatsApp desde el CRM**
Desde el perfil de un cliente o desde una oportunidad, el sistema debe permitir enviar un mensaje de WhatsApp al número registrado del cliente.

**RF-22 — Recepción de mensajes de WhatsApp**
El sistema debe recibir los mensajes de WhatsApp entrantes. Si el número remitente coincide con el número de WhatsApp de un cliente registrado, el mensaje debe vincularse automáticamente al perfil de ese cliente.

**RF-23 — Historial de comunicaciones en el perfil del cliente**
El perfil del cliente (RF-05) debe mostrar el historial unificado de emails y mensajes de WhatsApp, ordenado cronológicamente, con indicación del canal (Gmail o WhatsApp), la dirección (enviado / recibido), el contenido y la fecha/hora.

**RF-24 — Comunicaciones no vinculadas**
Los emails y mensajes de WhatsApp recibidos cuyo remitente no coincida con ningún cliente registrado deben quedar en una bandeja de entrada general, desde donde el usuario podrá asignarlos manualmente a un cliente existente o crear un nuevo cliente.

---

### M-05 — Reportes

**RF-25 — Reporte: Clientes nuevos por período**
El sistema debe generar un reporte que muestre la cantidad de clientes dados de alta en un rango de fechas seleccionable. El reporte debe poder visualizarse en pantalla y debe mostrar el detalle de los clientes incluidos (nombre, fecha de alta, cómo nos conoció).

**RF-26 — Reporte: Actividades por vendedor**
El sistema debe generar un reporte que muestre, para un rango de fechas seleccionable, la cantidad de actividades realizadas agrupadas por usuario responsable, desglosadas por tipo de actividad (llamada, reunión, tarea).

---

### M-06 — Autenticación

**RF-27 — Login**
El sistema debe requerir autenticación mediante email y contraseña para acceder a cualquier funcionalidad.

**RF-28 — Gestión de usuarios**
El sistema debe permitir crear, editar y desactivar usuarios. Cada usuario debe tener: nombre completo, email (usado como nombre de usuario) y contraseña. No existe diferenciación de roles ni permisos en el MVP.

**RF-29 — Cierre de sesión**
El sistema debe permitir al usuario cerrar su sesión de forma explícita.

---

## 4. Requerimientos No Funcionales

**RNF-01 — Rendimiento**
Las pantallas principales (listado de clientes, pipeline, listado de actividades) deben cargar en menos de 3 segundos con hasta 5.000 registros de clientes en la base de datos.

**RNF-02 — Disponibilidad**
El sistema debe estar disponible al menos el 99% del tiempo en horario comercial (lunes a sábado, 8:00 a 20:00 hs).

**RNF-03 — Seguridad — Autenticación**
Todas las rutas de la aplicación deben requerir sesión activa. Las contraseñas deben almacenarse hasheadas (bcrypt o equivalente). Las sesiones deben expirar tras un período de inactividad configurable.

**RNF-04 — Seguridad — Datos**
La comunicación entre el cliente y el servidor debe realizarse mediante HTTPS. Las credenciales de las integraciones (Gmail, WhatsApp) deben almacenarse de forma segura y no exponerse en el frontend.

**RNF-05 — Usabilidad**
La interfaz debe ser utilizable en pantallas de escritorio (resolución mínima 1366x768). No se requiere soporte mobile en el MVP.

**RNF-06 — Compatibilidad de navegadores**
El sistema debe funcionar correctamente en las versiones actuales de Google Chrome y Microsoft Edge.

**RNF-07 — Integridad de datos**
El sistema debe garantizar que no puedan existir dos clientes con el mismo DNI o el mismo número de teléfono principal. Esta restricción debe aplicarse tanto a nivel de aplicación como a nivel de base de datos.

**RNF-08 — Trazabilidad**
Los cambios de etapa en las oportunidades deben quedar registrados con fecha y usuario, de forma que sea posible reconstruir el historial de movimientos de cada oportunidad.

---

## 5. Fuera de Scope (MVP)

Los siguientes elementos quedan explícitamente excluidos del alcance de este MVP:

| # | Elemento excluido | Razón / Nota |
|---|-------------------|--------------|
| 1 | Gestión de stock / inventario | El pipeline es independiente del stock. Se podría integrar en una fase futura. |
| 2 | Diferenciación de roles y permisos | Todos los usuarios tienen el mismo nivel de acceso. Posible mejora futura. |
| 3 | Aplicación móvil (iOS / Android) | Solo se desarrolla versión web de escritorio. |
| 4 | Diseño responsivo / mobile-first | No requerido en este MVP. |
| 5 | Cotizador / presupuestador de motos | La etapa "Presupuesto" en el pipeline es un estado, no un módulo de cálculo. |
| 6 | Integración con sistemas contables o ERP | No contemplado. |
| 7 | Integración con redes sociales (Instagram, Facebook) | Solo Gmail y WhatsApp en este MVP. |
| 8 | Automatizaciones y campañas de marketing | Envíos masivos o secuencias automatizadas no están incluidos. |
| 9 | Gestión de clientes jurídicos (empresas) | Solo se gestionan personas físicas. |
| 10 | Asignación / reasignación de clientes entre vendedores | No hay propiedad de cliente por vendedor en este MVP. |
| 11 | Facturación o gestión de pagos | No contemplado. |
| 12 | Exportación de reportes a Excel / PDF | Los reportes se visualizan en pantalla; la exportación es una mejora futura. |

---

## 6. Supuestos y Restricciones

- Ciudad Moto dispone de una cuenta de WhatsApp Business con acceso a la API oficial (WhatsApp Business API). Sin este requisito, la integración de WhatsApp no puede implementarse.
- El negocio opera con una única cuenta de Gmail para comunicaciones comerciales, o está dispuesto a definir cuál/cuáles cuentas vincular antes del inicio del desarrollo.
- No se requiere migración de datos históricos desde ningún sistema anterior. El sistema arranca desde cero.
- El equipo de desarrollo es responsable del hosting e infraestructura; las decisiones de despliegue quedan fuera del alcance de este documento.

---

## 7. Preguntas Abiertas

Estos puntos requieren confirmación del cliente antes o durante el desarrollo:

| # | Pregunta | Impacto |
|---|----------|---------|
| Q-01 | ¿Con cuántas cuentas de Gmail se integrará el sistema? ¿Una por vendedor o una cuenta compartida del negocio? | Afecta el diseño de la integración de Gmail. |
| Q-02 | ¿El número de WhatsApp Business es uno solo para todo el negocio, o cada vendedor tiene el suyo? | Afecta cómo se vinculan y distribuyen los mensajes entrantes. |
| Q-03 | ¿Qué debe suceder con los mensajes de WhatsApp / emails recibidos fuera del horario comercial? ¿Solo se almacenan, o se necesita alguna notificación? | Puede requerir un sistema de notificaciones no contemplado en el MVP. |
| Q-04 | ¿Se requiere que el sistema envíe notificaciones internas (por ejemplo, al vencer una actividad pendiente)? | Feature de notificaciones no está en el scope actual. |
| Q-05 | ¿Existe alguna lista predefinida de modelos de motos que se venden, o el modelo de interés siempre se ingresa como texto libre? | Podría mejorar la calidad de los datos y los reportes futuros. |

---

## 8. Glosario

| Término | Definición |
|---------|------------|
| CRM | Customer Relationship Management. Sistema para gestionar la relación con los clientes. |
| Pipeline | Embudo o flujo de ventas. Representa el progreso de una oportunidad desde el primer contacto hasta el cierre. |
| Oportunidad | Una posibilidad de venta concreta asociada a un cliente y un modelo de moto de interés. |
| Actividad | Interacción comercial registrada: llamada telefónica, reunión presencial/virtual o tarea pendiente. |
| DNI | Documento Nacional de Identidad. Identificador único de la persona física. |
| WhatsApp Business API | API oficial de Meta para integrar WhatsApp en sistemas de software. Diferente a la app de WhatsApp Business estándar. |
| Alta | Acto de registrar por primera vez un cliente en el sistema. |
| MVP | Minimum Viable Product. Versión inicial del producto con las funcionalidades esenciales. |

---

*Documento sujeto a revisión y aprobación por parte de Ciudad Moto antes del inicio del desarrollo.*
