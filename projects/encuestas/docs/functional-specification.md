# Especificacion Funcional — POC Encuestas Streambe

**Proyecto:** POC Encuestas Streambe
**Responsable:** Ada Lovelace — Analista Funcional
**Fecha:** 2026-04-01
**Estado:** APROBADO
**Version:** 1.0

---

## 1. Alcance del Proyecto

### Descripcion General

Aplicacion web tipo POC (Proof of Concept) que permite a Streambe crear, compartir y analizar encuestas de satisfaccion de sus clientes. El administrador crea encuestas con distintos tipos de preguntas, genera un link unico para compartir, y los encuestados responden sin necesidad de registrarse. Los resultados se visualizan en un dashboard con graficos y pueden exportarse.

### En Alcance

- Creacion y edicion de encuestas con 4 tipos de preguntas
- Gestion del ciclo de vida de encuestas (activar, desactivar, eliminar)
- Compartir encuestas via link unico publico
- Respuesta publica sin autenticacion, optimizada para mobile
- Dashboard de resultados con graficos y tabla de respuestas
- Exportacion de resultados a CSV y Excel
- Autenticacion basica con email y password (rol unico: admin)

### Fuera de Alcance

- Envio automatico de encuestas por email o WhatsApp
- Logica condicional entre preguntas (branching)
- Soporte multi-idioma
- Sistema de roles y permisos (solo existe admin)
- Identificacion o autenticacion de encuestados
- Integraciones con sistemas externos (CRM, analytics, etc.)
- Personalizacion visual avanzada de encuestas (branding, temas)

---

## 2. Requerimientos Funcionales

| ID | Nombre | Descripcion |
|----|--------|-------------|
| F1 | Crear encuesta | El admin puede crear una encuesta con titulo, descripcion y preguntas de 4 tipos: texto libre, opcion multiple, escala 1-5 y si/no |
| F2 | Gestionar encuestas | El admin puede listar, editar, activar, desactivar y eliminar encuestas |
| F3 | Compartir encuesta | El sistema genera un link unico publico para cada encuesta activa |
| F4 | Responder encuesta | Cualquier persona con el link puede responder sin login, con interfaz mobile-first |
| F5 | Dashboard de resultados | El admin visualiza resultados con graficos por pregunta y tabla de respuestas individuales |
| F6 | Exportar resultados | El admin puede exportar las respuestas de una encuesta a CSV o Excel |
| F7 | Autenticacion | Login con email y password para un unico rol admin |

### Reglas de Negocio

- BR-001: Solo usuarios autenticados (admin) pueden crear, editar o eliminar encuestas
- BR-002: Una encuesta desactivada no acepta nuevas respuestas pero sus resultados siguen visibles
- BR-003: Una encuesta eliminada es borrado logico; no se pierden respuestas historicas
- BR-004: El link publico solo funciona si la encuesta esta activa
- BR-005: No hay limite de respuestas por encuesta en el POC
- BR-006: Las preguntas de opcion multiple requieren al menos 2 opciones
- BR-007: La escala siempre es de 1 a 5

---

## 3. Requerimientos No Funcionales

| ID | Categoria | Descripcion |
|----|-----------|-------------|
| NFR-01 | Responsividad | La interfaz de respuesta debe ser mobile-first. El panel admin debe ser responsive |
| NFR-02 | Performance | Tiempo de carga inicial menor a 2 segundos |
| NFR-03 | Capacidad | Soporte para aproximadamente 100 encuestas y 1000 respuestas totales |
| NFR-04 | Seguridad | HTTPS en todos los ambientes. Passwords hasheados. Tokens JWT para sesion |
| NFR-05 | Disponibilidad | No hay requerimiento de SLA para el POC |
| NFR-06 | Navegadores | Chrome, Firefox, Safari y Edge en sus ultimas 2 versiones |

---

## 4. User Stories con Criterios de Aceptacion

### Epic 1: Autenticacion

#### US-001: Login de administrador

**Como** administrador,
**quiero** iniciar sesion con mi email y password,
**para** acceder al panel de gestion de encuestas.

```gherkin
Scenario: Login exitoso
  Given estoy en la pagina de login
  When ingreso un email y password validos
  Then soy redirigido al dashboard principal
  And veo el listado de mis encuestas

Scenario: Login fallido
  Given estoy en la pagina de login
  When ingreso credenciales incorrectas
  Then veo un mensaje de error "Credenciales invalidas"
  And permanezco en la pagina de login

Scenario: Acceso a ruta protegida sin sesion
  Given no tengo sesion activa
  When intento acceder al dashboard
  Then soy redirigido a la pagina de login
```

#### US-002: Logout

**Como** administrador,
**quiero** cerrar mi sesion,
**para** proteger el acceso al panel.

```gherkin
Scenario: Logout exitoso
  Given tengo sesion activa en el panel
  When hago click en "Cerrar sesion"
  Then mi sesion se invalida
  And soy redirigido a la pagina de login
```

---

### Epic 2: Gestion de Encuestas

#### US-003: Crear encuesta

**Como** administrador,
**quiero** crear una encuesta con titulo, descripcion y preguntas,
**para** recopilar feedback de mis clientes.

```gherkin
Scenario: Crear encuesta con datos validos
  Given estoy en la pagina de crear encuesta
  When completo titulo, descripcion y agrego al menos una pregunta
  And hago click en "Guardar"
  Then la encuesta se crea en estado "borrador"
  And aparece en mi listado de encuestas

Scenario: Crear encuesta sin titulo
  Given estoy en la pagina de crear encuesta
  When dejo el titulo vacio y hago click en "Guardar"
  Then veo un mensaje de error "El titulo es obligatorio"
  And la encuesta no se crea

Scenario: Crear encuesta sin preguntas
  Given estoy en la pagina de crear encuesta
  When completo titulo pero no agrego preguntas
  And hago click en "Guardar"
  Then veo un mensaje de error "Debe agregar al menos una pregunta"
```

#### US-004: Agregar pregunta de texto libre

**Como** administrador,
**quiero** agregar una pregunta de texto libre a mi encuesta,
**para** obtener respuestas abiertas de los encuestados.

```gherkin
Scenario: Agregar pregunta de texto libre
  Given estoy editando una encuesta
  When selecciono tipo "Texto libre" y escribo el enunciado
  And hago click en "Agregar pregunta"
  Then la pregunta aparece en la lista de preguntas de la encuesta
```

#### US-005: Agregar pregunta de opcion multiple

**Como** administrador,
**quiero** agregar una pregunta de opcion multiple,
**para** que los encuestados elijan entre opciones predefinidas.

```gherkin
Scenario: Agregar pregunta con opciones validas
  Given estoy editando una encuesta
  When selecciono tipo "Opcion multiple", escribo el enunciado y agrego 3 opciones
  And hago click en "Agregar pregunta"
  Then la pregunta aparece con sus opciones en la lista

Scenario: Agregar pregunta con menos de 2 opciones
  Given estoy editando una encuesta
  When selecciono tipo "Opcion multiple" y agrego solo 1 opcion
  Then veo un mensaje "Debe agregar al menos 2 opciones"
```

#### US-006: Agregar pregunta de escala 1-5

**Como** administrador,
**quiero** agregar una pregunta de escala del 1 al 5,
**para** medir niveles de satisfaccion de forma cuantitativa.

```gherkin
Scenario: Agregar pregunta de escala
  Given estoy editando una encuesta
  When selecciono tipo "Escala 1-5" y escribo el enunciado
  And hago click en "Agregar pregunta"
  Then la pregunta aparece configurada con escala del 1 al 5
```

#### US-007: Agregar pregunta de si/no

**Como** administrador,
**quiero** agregar una pregunta de si/no,
**para** obtener respuestas binarias claras.

```gherkin
Scenario: Agregar pregunta si/no
  Given estoy editando una encuesta
  When selecciono tipo "Si/No" y escribo el enunciado
  And hago click en "Agregar pregunta"
  Then la pregunta aparece con opciones "Si" y "No"
```

#### US-008: Listar encuestas

**Como** administrador,
**quiero** ver todas mis encuestas en una lista,
**para** gestionar su estado y acceder a sus resultados.

```gherkin
Scenario: Ver listado de encuestas
  Given tengo sesion activa y existen encuestas creadas
  When accedo al dashboard
  Then veo una lista con todas las encuestas
  And cada encuesta muestra titulo, estado, cantidad de respuestas y fecha de creacion

Scenario: Listado vacio
  Given tengo sesion activa y no existen encuestas
  When accedo al dashboard
  Then veo un mensaje "No hay encuestas creadas" y un boton para crear una
```

#### US-009: Editar encuesta

**Como** administrador,
**quiero** editar una encuesta existente,
**para** corregir o actualizar su contenido.

```gherkin
Scenario: Editar encuesta en borrador
  Given tengo una encuesta en estado "borrador"
  When modifico el titulo y las preguntas
  And hago click en "Guardar"
  Then los cambios se persisten correctamente

Scenario: Editar encuesta activa
  Given tengo una encuesta en estado "activa" con respuestas
  When intento editar las preguntas
  Then veo una advertencia "Esta encuesta tiene respuestas. Editar puede afectar la consistencia de datos"
  And puedo elegir continuar o cancelar
```

#### US-010: Activar y desactivar encuesta

**Como** administrador,
**quiero** activar o desactivar una encuesta,
**para** controlar cuando acepta respuestas.

```gherkin
Scenario: Activar encuesta
  Given tengo una encuesta en estado "borrador" o "desactivada"
  When hago click en "Activar"
  Then la encuesta pasa a estado "activa"
  And se genera un link unico publico

Scenario: Desactivar encuesta
  Given tengo una encuesta en estado "activa"
  When hago click en "Desactivar"
  Then la encuesta deja de aceptar respuestas
  And el link publico muestra "Esta encuesta no esta disponible"
  But los resultados existentes siguen visibles en el dashboard
```

#### US-011: Eliminar encuesta

**Como** administrador,
**quiero** eliminar una encuesta,
**para** limpiar encuestas que ya no necesito.

```gherkin
Scenario: Eliminar encuesta
  Given tengo una encuesta en cualquier estado
  When hago click en "Eliminar"
  Then veo un dialogo de confirmacion "Esta seguro?"
  When confirmo la eliminacion
  Then la encuesta desaparece del listado
  But las respuestas se conservan en la base de datos (borrado logico)
```

---

### Epic 3: Compartir Encuesta

#### US-012: Obtener link de encuesta

**Como** administrador,
**quiero** copiar el link unico de una encuesta activa,
**para** compartirlo manualmente con mis clientes.

```gherkin
Scenario: Copiar link de encuesta activa
  Given tengo una encuesta en estado "activa"
  When hago click en "Copiar link"
  Then el link se copia al portapapeles
  And veo una confirmacion "Link copiado"

Scenario: Link de encuesta no activa
  Given tengo una encuesta desactivada
  When busco el boton "Copiar link"
  Then el boton no esta disponible o muestra "Activar para compartir"
```

---

### Epic 4: Responder Encuesta

#### US-013: Responder encuesta publica

**Como** encuestado,
**quiero** responder una encuesta desde mi celular sin necesidad de registrarme,
**para** dar mi feedback de forma rapida y sencilla.

```gherkin
Scenario: Responder encuesta completa
  Given accedo al link publico de una encuesta activa
  When respondo todas las preguntas
  And hago click en "Enviar"
  Then veo un mensaje de agradecimiento "Gracias por tu respuesta"
  And la respuesta se registra en el sistema

Scenario: Enviar encuesta con preguntas obligatorias sin responder
  Given accedo a una encuesta con preguntas obligatorias
  When dejo preguntas obligatorias sin responder
  And hago click en "Enviar"
  Then veo indicadores de error en las preguntas faltantes
  And la respuesta no se envia

Scenario: Acceder a encuesta no activa
  Given accedo al link de una encuesta desactivada o eliminada
  Then veo un mensaje "Esta encuesta no esta disponible"
```

---

### Epic 5: Resultados y Exportacion

#### US-014: Ver dashboard de resultados

**Como** administrador,
**quiero** ver los resultados de una encuesta en graficos y tablas,
**para** analizar el feedback de mis clientes.

```gherkin
Scenario: Ver resultados con respuestas
  Given tengo una encuesta con al menos una respuesta
  When accedo a los resultados de esa encuesta
  Then veo el total de respuestas
  And veo un grafico por cada pregunta de opcion multiple, escala y si/no
  And veo las respuestas de texto libre listadas

Scenario: Ver resultados sin respuestas
  Given tengo una encuesta sin respuestas
  When accedo a los resultados
  Then veo un mensaje "Aun no hay respuestas para esta encuesta"
```

#### US-015: Ver respuestas individuales

**Como** administrador,
**quiero** ver cada respuesta individual en una tabla,
**para** analizar respuestas caso por caso.

```gherkin
Scenario: Ver tabla de respuestas
  Given estoy en el dashboard de resultados de una encuesta
  When navego a la seccion "Respuestas individuales"
  Then veo una tabla con una fila por respuesta
  And cada fila muestra la fecha y las respuestas a cada pregunta
```

#### US-016: Exportar resultados

**Como** administrador,
**quiero** exportar los resultados de una encuesta a CSV o Excel,
**para** analizarlos en herramientas externas.

```gherkin
Scenario: Exportar a CSV
  Given estoy en el dashboard de resultados de una encuesta con respuestas
  When hago click en "Exportar CSV"
  Then se descarga un archivo .csv con todas las respuestas

Scenario: Exportar a Excel
  Given estoy en el dashboard de resultados de una encuesta con respuestas
  When hago click en "Exportar Excel"
  Then se descarga un archivo .xlsx con todas las respuestas

Scenario: Exportar sin respuestas
  Given estoy en el dashboard de una encuesta sin respuestas
  When hago click en "Exportar"
  Then veo un mensaje "No hay datos para exportar"
```

---

## 5. Integraciones

No se requieren integraciones externas para este POC. La distribucion de encuestas se realiza compartiendo el link unico de forma manual (copiar y pegar en email, chat, etc.).

---

## 6. Modelo de Datos (Resumen)

### Entidades

| Entidad | Descripcion | Campos principales |
|---------|-------------|--------------------|
| User | Administrador del sistema | id, email, password_hash, name, created_at |
| Survey | Encuesta | id, user_id, title, description, status (draft/active/inactive/deleted), slug, created_at, updated_at |
| Question | Pregunta de una encuesta | id, survey_id, type (text/multiple_choice/scale/yes_no), text, order, required, created_at |
| Option | Opcion de pregunta multiple | id, question_id, text, order |
| Response | Respuesta completa de un encuestado | id, survey_id, submitted_at |
| Answer | Respuesta individual a una pregunta | id, response_id, question_id, value (texto o ID de opcion seleccionada) |

### Relaciones

- User 1 --- N Survey
- Survey 1 --- N Question
- Question 1 --- N Option (solo para tipo multiple_choice)
- Survey 1 --- N Response
- Response 1 --- N Answer
- Answer N --- 1 Question

### Estados de Encuesta

```
draft --> active --> inactive --> active (puede reactivarse)
                              --> deleted (borrado logico)
draft --> deleted
```

---

## 7. Flujos Principales

### Flujo: Crear y Publicar Encuesta

1. Admin inicia sesion
2. Admin hace click en "Nueva encuesta"
3. Admin completa titulo y descripcion
4. Admin agrega preguntas (seleccionando tipo y completando datos)
5. Admin guarda la encuesta (estado: borrador)
6. Admin activa la encuesta
7. Sistema genera link unico con slug
8. Admin copia el link y lo comparte manualmente

### Flujo: Responder Encuesta

1. Encuestado recibe link (via email, chat, etc.)
2. Encuestado abre el link en su navegador (mobile o desktop)
3. Sistema muestra titulo, descripcion y preguntas
4. Encuestado responde las preguntas
5. Encuestado hace click en "Enviar"
6. Sistema valida respuestas obligatorias
7. Sistema guarda la respuesta
8. Encuestado ve mensaje de agradecimiento

### Flujo: Analizar Resultados

1. Admin accede al dashboard de una encuesta
2. Sistema muestra total de respuestas y graficos por pregunta
3. Admin navega a respuestas individuales si necesita detalle
4. Admin exporta a CSV o Excel si necesita analisis externo

---

## 8. Supuestos

- Existe un unico usuario admin pre-cargado en la base de datos (no hay registro de usuarios)
- El volumen esperado es bajo (POC): ~100 encuestas, ~1000 respuestas
- Los encuestados tienen acceso a internet y un navegador moderno
- No se requiere persistencia offline
- El slug del link es suficientemente unico (UUID o similar)

---

## 9. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Spam de respuestas | Media | Medio | Rate limiting por IP en el endpoint de respuesta |
| Perdida de datos en borrado | Baja | Alto | Borrado logico implementado por defecto |
| Encuesta compartida con link adivinable | Baja | Bajo | Usar UUID como slug |
