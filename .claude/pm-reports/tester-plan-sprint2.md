# Plan de Tests — Sprint 2
# CRM Ciudad Moto

**Rol**: Tester QA
**Fecha**: 2026-03-29
**Estado**: Completado
**Sprint**: 2 de N
**Total de casos de prueba**: 49

---

## Alcance del Sprint 2

| Area | RFs / USs cubiertos |
|------|---------------------|
| M-03 Actividades — filtros avanzados | RF-16 (US-014, US-017) |
| M-04 Comunicaciones (mock) | RF-18 a RF-24 (US-019 a US-025) |
| M-05 Reportes | RF-25, RF-26 (US-026, US-027, US-028) |
| DevOps | US-029 docker-compose, US-030 CI GitHub Actions |
| Regresion Sprint 1 | RF-01 a RF-15, RF-27 a RF-29 (flujos criticos) |

---

## Distribucion de casos por area

| Area | Cantidad de TCs |
|------|----------------|
| RF-16 Listado actividades con filtros | 8 |
| RF-18 a RF-24 Comunicaciones mock | 17 |
| RF-25 Reporte clientes nuevos | 5 |
| RF-26 Reporte actividades por vendedor | 5 |
| DevOps | 5 |
| Regresion Sprint 1 | 9 |
| **Total** | **49** |

---

## Precondiciones generales

Para todos los casos de prueba del Sprint 2 aplican las siguientes precondiciones base salvo que se indique lo contrario:

- La aplicacion esta corriendo (via `docker-compose up` o entorno de QA).
- Existe al menos un usuario activo: `admin@ciudadmoto.com`.
- El usuario esta autenticado con JWT valido (sesion activa).
- La base de datos tiene datos de seed: al menos 3 clientes activos, 2 oportunidades en distintas etapas y 5 actividades (mix de pendientes, realizadas, con y sin `dueAt`).
- El modo de comunicaciones es "simulado" (mock activo, sin credenciales reales de Gmail ni WhatsApp).

---

## BLOQUE 1 — RF-16: Listado de actividades con filtros

---

```
TC-001: Listado base de actividades sin filtros
US/RF: RF-16
Precondicion: El usuario esta autenticado. Existen al menos 5 actividades cargadas con distintos estados y tipos.
Pasos:
  1. Navegar a la pantalla de listado global de actividades.
  2. No aplicar ningun filtro.
  3. Observar el resultado desplegado.
Resultado esperado: Se visualizan todas las actividades activas del sistema, con columnas: tipo, titulo, cliente vinculado, responsable, fecha programada, fecha de vencimiento y estado. La pagina carga en menos de 3 segundos.
Criterio de falla: La pantalla no carga, no muestra actividades existentes, tarda mas de 3 segundos o falta alguna columna requerida por RF-16.
```

---

```
TC-002: Filtro por estado "Pendiente"
US/RF: RF-16
Precondicion: Existen actividades con estado "pendiente" y actividades con estado "realizada".
Pasos:
  1. Abrir el listado de actividades.
  2. Aplicar filtro "Estado: Pendiente".
  3. Revisar los resultados.
Resultado esperado: Solo se muestran actividades con estado "pendiente". No aparece ninguna actividad con estado "realizada".
Criterio de falla: Aparecen actividades "realizadas" mezcladas, o el filtro no reduce el listado.
```

---

```
TC-003: Filtro por estado "Realizada"
US/RF: RF-16
Precondicion: Existen actividades con estado "realizada".
Pasos:
  1. Abrir el listado de actividades.
  2. Aplicar filtro "Estado: Realizada".
  3. Revisar los resultados.
Resultado esperado: Solo se muestran actividades con estado "realizada". No aparece ninguna actividad "pendiente".
Criterio de falla: Aparecen actividades "pendientes" mezcladas, o el listado queda vacio cuando si existen actividades realizadas.
```

---

```
TC-004: Filtro por tipo de actividad
US/RF: RF-16
Precondicion: Existen actividades de los tres tipos: Llamada, Reunion y Tarea.
Pasos:
  1. Abrir el listado de actividades.
  2. Aplicar filtro "Tipo: Llamada".
  3. Verificar resultados.
  4. Cambiar filtro a "Tipo: Reunion" y verificar.
  5. Cambiar filtro a "Tipo: Tarea" y verificar.
Resultado esperado: Cada filtro muestra exclusivamente actividades del tipo seleccionado. Los tres filtros funcionan de forma independiente.
Criterio de falla: Aparecen actividades de tipos distintos al filtrado, o algun tipo de filtro no funciona.
```

---

```
TC-005: Filtro por usuario responsable
US/RF: RF-16
Precondicion: Existen al menos dos usuarios activos. Existen actividades asignadas a distintos usuarios.
Pasos:
  1. Abrir el listado de actividades.
  2. Aplicar filtro "Responsable: [usuario A]".
  3. Verificar que solo aparecen actividades cuyo campo "responsable" coincide con el usuario A.
  4. Cambiar el filtro a otro usuario y verificar que el listado cambia.
Resultado esperado: El filtro por responsable devuelve solo las actividades asignadas al usuario seleccionado.
Criterio de falla: Aparecen actividades de otros usuarios o el filtro no tiene efecto.
```

---

```
TC-006: Filtro por rango de fechas
US/RF: RF-16
Precondicion: Existen actividades programadas en distintos periodos (por ejemplo: enero, febrero y marzo del mismo ano).
Pasos:
  1. Abrir el listado de actividades.
  2. Ingresar fecha desde: primer dia del mes actual.
  3. Ingresar fecha hasta: ultimo dia del mes actual.
  4. Aplicar el filtro.
Resultado esperado: Solo se muestran actividades cuya fecha programada cae dentro del rango seleccionado. Actividades de otros meses no aparecen.
Criterio de falla: Aparecen actividades fuera del rango de fechas, o no aparecen actividades que deberian estar dentro del rango.
```

---

```
TC-007: Filtros combinados (estado + tipo + rango de fechas)
US/RF: RF-16
Precondicion: Existen actividades de tipo "Llamada", estado "pendiente", con fechas en el mes actual, y otras que no cumplen alguna de estas condiciones.
Pasos:
  1. Abrir el listado de actividades.
  2. Aplicar simultaneamente: Estado = Pendiente, Tipo = Llamada, rango de fechas = mes actual.
  3. Revisar los resultados.
Resultado esperado: Solo aparecen actividades que cumplen los tres criterios simultaneamente. La combinacion de filtros aplica con logica AND.
Criterio de falla: Aparecen actividades que no cumplen algun criterio del filtro combinado, o el sistema devuelve un error al combinar filtros.
```

---

```
TC-008: Destacado visual de actividades vencidas
US/RF: RF-16
Precondicion: Existe al menos una actividad con estado "pendiente" cuya fecha de vencimiento (`dueAt`) es anterior a la fecha actual.
Pasos:
  1. Abrir el listado de actividades sin filtros.
  2. Localizar la actividad vencida.
  3. Observar su representacion visual en comparacion con actividades no vencidas.
Resultado esperado: Las actividades vencidas y pendientes presentan un estilo visual diferenciado (color, badge, icono u otro indicador) que las distingue claramente del resto. No es necesario aplicar ningun filtro para verlas destacadas.
Criterio de falla: Las actividades vencidas no tienen ninguna diferenciacion visual respecto al resto del listado.
```

---

## BLOQUE 2 — RF-18 a RF-24: Modulo Comunicaciones (Mock)

---

```
TC-009: Banner de modo simulado visible en el modulo de comunicaciones
US/RF: RF-18, RF-19, RF-21, RF-23
Precondicion: El sistema esta configurado en modo mock (sin credenciales reales de Gmail ni WhatsApp).
Pasos:
  1. Navegar al perfil de cualquier cliente activo.
  2. Abrir la seccion o panel de comunicaciones.
  3. Observar la interfaz.
Resultado esperado: Se muestra un banner o badge persistente con un mensaje explicito indicando que el sistema esta en "modo simulacion" y que los emails y mensajes de WhatsApp NO se envian realmente. El banner es de color amarillo/naranja (warning), esta visible sin necesidad de hacer scroll y no puede cerrarse.
Criterio de falla: El banner no existe, puede cerrarse/ocultarse, no es visible sin scroll, o su mensaje no deja claro que la comunicacion es simulada.
```

---

```
TC-010: Envio de email simulado desde el perfil del cliente
US/RF: RF-19, RF-20
Precondicion: El cliente tiene un correo electronico registrado. El usuario esta en el perfil del cliente.
Pasos:
  1. Abrir el perfil del cliente.
  2. Acceder al formulario de envio de email.
  3. Completar los campos: destinatario (pre-completado con el email del cliente), asunto y cuerpo del mensaje.
  4. Hacer clic en "Enviar".
Resultado esperado: El sistema muestra confirmacion de envio. El email simulado queda registrado en la base de datos. Aparece en el historial de comunicaciones del cliente con: canal "Gmail", direccion "enviado", asunto, fecha/hora y contenido. No se envia ningun email real.
Criterio de falla: No aparece en el historial, el registro no se crea en DB, o el sistema envia un error al intentar enviar.
```

---

```
TC-011: Envio de email sin destinatario — validacion obligatoria
US/RF: RF-19
Precondicion: El formulario de envio de email esta abierto.
Pasos:
  1. Borrar el campo "destinatario" del formulario de email.
  2. Completar asunto y cuerpo.
  3. Intentar enviar.
Resultado esperado: El sistema muestra un mensaje de error de validacion indicando que el destinatario es obligatorio. No se crea ningun registro de comunicacion.
Criterio de falla: El sistema permite enviar sin destinatario, o el error no se muestra al usuario.
```

---

```
TC-012: Envio de email sin asunto — comportamiento permitido
US/RF: RF-19
Precondicion: El formulario de envio de email esta abierto.
Pasos:
  1. Completar destinatario y cuerpo del mensaje.
  2. Dejar el campo "asunto" vacio.
  3. Enviar el mensaje.
Resultado esperado: El sistema permite enviar el email sin asunto (campo no obligatorio segun el RF). El registro queda en el historial con asunto en blanco o "(sin asunto)".
Criterio de falla: El sistema bloquea el envio por asunto vacio cuando no deberia, o el registro no refleja el asunto en blanco.
```

---

```
TC-013: Recepcion simulada de email entrante vinculado a cliente existente
US/RF: RF-20
Precondicion: Existe un cliente con email registrado `carlos@ejemplo.com`. El sistema tiene un mecanismo para simular la recepcion de un email entrante (endpoint de webhook simulado o funcion de test).
Pasos:
  1. Disparar la recepcion simulada de un email desde `carlos@ejemplo.com` con un asunto y cuerpo de prueba.
  2. Navegar al perfil del cliente correspondiente.
  3. Revisar el historial de comunicaciones.
Resultado esperado: El email recibido aparece en el historial del cliente con: canal "Gmail", direccion "recibido", remitente, asunto, contenido y fecha/hora. La vinculacion es automatica por coincidencia de email.
Criterio de falla: El email no aparece en el historial, o aparece sin vinculacion al cliente correcto.
```

---

```
TC-014: Envio de mensaje de WhatsApp simulado desde el perfil del cliente
US/RF: RF-21
Precondicion: El cliente tiene un numero de WhatsApp registrado. El usuario esta en el perfil del cliente.
Pasos:
  1. Abrir el perfil del cliente.
  2. Acceder al panel o hilo de mensajes de WhatsApp.
  3. Escribir un mensaje de texto.
  4. Hacer clic en "Enviar".
Resultado esperado: El mensaje simulado queda registrado en la base de datos. Aparece en el hilo de conversacion con indicacion de: canal "WhatsApp", direccion "enviado", contenido y fecha/hora. No se envia ningun mensaje real via Meta API.
Criterio de falla: El mensaje no aparece en el hilo, no se crea el registro en DB, o el sistema lanza un error al enviar.
```

---

```
TC-015: Envio de mensaje WhatsApp a cliente sin numero de WhatsApp registrado
US/RF: RF-21
Precondicion: Existe un cliente activo sin numero de WhatsApp registrado.
Pasos:
  1. Abrir el perfil del cliente sin numero de WhatsApp.
  2. Intentar acceder al panel de WhatsApp o al boton de envio de mensaje.
Resultado esperado: El sistema muestra un mensaje indicando que el cliente no tiene numero de WhatsApp registrado y que es necesario agregar uno antes de poder enviar mensajes. La opcion de envio esta deshabilitada o no disponible.
Criterio de falla: El sistema permite intentar enviar sin numero registrado, o no hay ningun mensaje de advertencia al usuario.
```

---

```
TC-016: Recepcion simulada de mensaje WhatsApp vinculado a cliente existente
US/RF: RF-22
Precondicion: Existe un cliente con numero de WhatsApp `+5491112345678`. El sistema tiene un mecanismo para simular la recepcion de un mensaje entrante (webhook simulado).
Pasos:
  1. Disparar la recepcion simulada de un mensaje de WhatsApp desde `+5491112345678`.
  2. Navegar al perfil del cliente correspondiente.
  3. Revisar el hilo de mensajes de WhatsApp.
Resultado esperado: El mensaje aparece en el hilo del cliente con: canal "WhatsApp", direccion "recibido", numero remitente, contenido y fecha/hora. La vinculacion es automatica por coincidencia de numero.
Criterio de falla: El mensaje no aparece en el hilo, o no se vincula automaticamente al cliente correcto.
```

---

```
TC-017: Historial unificado de comunicaciones en el perfil del cliente
US/RF: RF-23
Precondicion: El cliente tiene al menos 1 email enviado, 1 email recibido, 1 mensaje WhatsApp enviado y 1 mensaje WhatsApp recibido registrados en el sistema.
Pasos:
  1. Abrir el perfil del cliente.
  2. Navegar a la seccion de historial de comunicaciones.
  3. Revisar el listado completo.
Resultado esperado: Se muestra un historial unificado con todas las comunicaciones (email y WhatsApp mezclados), ordenadas cronologicamente (mas reciente primero o mas antiguo primero, de forma consistente). Cada registro muestra: canal (Gmail / WhatsApp), direccion (enviado / recibido), contenido, fecha y hora.
Criterio de falla: El historial muestra solo un canal, el orden cronologico es incorrecto, o faltan los indicadores de canal y direccion.
```

---

```
TC-018: Ordenamiento cronologico del historial de comunicaciones
US/RF: RF-23
Precondicion: Existen comunicaciones registradas en distintas fechas y horas para un mismo cliente.
Pasos:
  1. Abrir el perfil del cliente.
  2. Revisar el historial de comunicaciones.
  3. Verificar el orden de los registros comparando fechas y horas.
Resultado esperado: Los registros aparecen ordenados por fecha/hora de forma consistente (ascendente o descendente, pero nunca aleatorio). Las fechas mas recientes o mas antiguas aparecen primero segun el orden elegido por el sistema.
Criterio de falla: El orden de los registros es aleatorio o no sigue ningun criterio cronologico.
```

---

```
TC-019: Comunicaciones no vinculadas — email de remitente desconocido va a bandeja general
US/RF: RF-24
Precondicion: El sistema no tiene registrado ningun cliente con el email `desconocido@ejemplo.com`.
Pasos:
  1. Disparar la recepcion simulada de un email desde `desconocido@ejemplo.com`.
  2. Navegar a la bandeja de entrada general de comunicaciones no vinculadas.
Resultado esperado: El email aparece en la bandeja de entrada general. No esta vinculado a ningun cliente. El usuario puede ver el remitente, asunto y contenido desde la bandeja.
Criterio de falla: El email no aparece en ninguna parte del sistema, o el sistema lanza un error al recibir un email de remitente desconocido.
```

---

```
TC-020: Asignacion manual de comunicacion no vinculada a cliente existente
US/RF: RF-24
Precondicion: Existe al menos una comunicacion en la bandeja de entrada general (remitente desconocido). Existe un cliente activo al que se desea asignar la comunicacion.
Pasos:
  1. Abrir la bandeja de entrada general.
  2. Seleccionar la comunicacion no vinculada.
  3. Usar la opcion "Asignar a cliente existente".
  4. Buscar y seleccionar el cliente destino.
  5. Confirmar la asignacion.
Resultado esperado: La comunicacion desaparece de la bandeja general y aparece en el historial de comunicaciones del cliente seleccionado con todos sus datos originales (canal, direccion, contenido, fecha).
Criterio de falla: La comunicacion no se mueve al historial del cliente, permanece en la bandeja general despues de asignarla, o los datos se pierden en el proceso.
```

---

```
TC-021: Comunicacion no vinculada — WhatsApp de numero desconocido va a bandeja general
US/RF: RF-24
Precondicion: El sistema no tiene registrado ningun cliente con el numero `+5499999999`.
Pasos:
  1. Disparar la recepcion simulada de un mensaje WhatsApp desde `+5499999999`.
  2. Navegar a la bandeja de entrada general.
Resultado esperado: El mensaje aparece en la bandeja general sin vinculacion a cliente. Se puede ver el numero remitente y el contenido del mensaje.
Criterio de falla: El mensaje se pierde, el sistema lanza un error o el mensaje aparece erroneamente vinculado a algun cliente.
```

---

```
TC-022: Envio de email desde una oportunidad
US/RF: RF-19
Precondicion: Existe una oportunidad abierta vinculada a un cliente con email registrado.
Pasos:
  1. Abrir el detalle de la oportunidad.
  2. Usar la opcion de envio de email disponible desde la oportunidad.
  3. Completar y enviar el email simulado.
Resultado esperado: El email se registra correctamente y aparece tanto en el historial de comunicaciones del cliente como (opcionalmente) referenciado en la oportunidad. El flujo de envio funciona igual que desde el perfil del cliente.
Criterio de falla: El boton de envio de email no existe desde la oportunidad, o el envio falla o no queda registrado.
```

---

```
TC-023: Indicadores MOCK en el codigo — comentarios de integracion real presentes
US/RF: RF-18 (criterio tecnico del DoD)
Precondicion: Acceso al codigo fuente del backend (revision estatica).
Pasos:
  1. Abrir el archivo del servicio de Gmail mock en el backend.
  2. Buscar el comentario `// MOCK: reemplazar con` en la funcion de envio.
  3. Abrir el archivo del servicio de WhatsApp mock.
  4. Buscar el mismo patron de comentario.
  5. Verificar que las variables de entorno `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN` estan definidas en `.env.example`.
Resultado esperado: Ambos servicios tienen comentarios `// MOCK:` que identifican exactamente que libreria usar y que variables de entorno configurar cuando se active la integracion real. Todas las variables de entorno mencionadas estan en `.env.example` con placeholders.
Criterio de falla: Los comentarios MOCK estan ausentes, incompletos o no mencionan la libreria ni la condicion de activacion. Las variables de entorno no estan en `.env.example`.
```

---

```
TC-024: Envio de mensaje WhatsApp — validacion de numero vacio
US/RF: RF-21
Precondicion: El formulario de envio de WhatsApp esta disponible.
Pasos:
  1. Intentar enviar un mensaje de WhatsApp con el campo de texto del mensaje vacio.
Resultado esperado: El sistema valida que el mensaje no puede estar vacio y muestra un error de validacion. No se crea ningun registro de comunicacion.
Criterio de falla: El sistema registra un mensaje vacio o no muestra ninguna validacion al usuario.
```

---

```
TC-025: Historial de comunicaciones paginado con muchos registros
US/RF: RF-23
Precondicion: Un cliente tiene mas de 20 comunicaciones registradas (entre emails y WhatsApp).
Pasos:
  1. Abrir el perfil del cliente.
  2. Navegar al historial de comunicaciones.
  3. Verificar si existe paginacion, scroll infinito o algun mecanismo de carga incremental.
Resultado esperado: El historial no carga los 20+ registros en una sola respuesta de forma que bloquee la UI. Existe algun mecanismo de paginacion, carga por paginas o scroll incremental que permite navegar el historial sin degradar el rendimiento.
Criterio de falla: La pagina tarda mas de 3 segundos en cargar con 20+ comunicaciones, o el sistema lanza un timeout.
```

---

## BLOQUE 3 — RF-25: Reporte Clientes Nuevos por Periodo

---

```
TC-026: Generacion del reporte de clientes nuevos con rango de fechas valido
US/RF: RF-25
Precondicion: Existen clientes dados de alta en distintas fechas (algunos dentro del rango a seleccionar, otros fuera).
Pasos:
  1. Navegar a la pantalla de Reportes.
  2. Seleccionar el reporte "Clientes nuevos por periodo".
  3. Ingresar fecha desde: primer dia del mes pasado. Fecha hasta: ultimo dia del mes pasado.
  4. Ejecutar el reporte.
Resultado esperado: El reporte muestra la cantidad total de clientes dados de alta en el rango seleccionado. El detalle lista los clientes incluidos con: nombre, fecha de alta y canal de origen ("Como nos conocio"). Solo aparecen clientes cuya fecha de alta esta dentro del rango.
Criterio de falla: Aparecen clientes fuera del rango, no aparecen clientes que si deberian estar, o la pantalla lanza un error.
```

---

```
TC-027: Reporte de clientes nuevos con rango de fechas que no tiene resultados
US/RF: RF-25
Precondicion: No existen clientes dados de alta en un periodo especifico del pasado (por ejemplo, hace dos anos).
Pasos:
  1. Ir a la pantalla de Reportes.
  2. Seleccionar "Clientes nuevos por periodo".
  3. Ingresar un rango de fechas sin datos (por ejemplo, hace dos anos).
  4. Ejecutar el reporte.
Resultado esperado: El reporte muestra un conteo de 0 clientes y un estado vacio amigable ("No hay clientes en el periodo seleccionado" o equivalente). No se lanza ningun error.
Criterio de falla: La pantalla muestra un error 500, lanza una excepcion o no muestra ninguna indicacion de que el resultado es vacio.
```

---

```
TC-028: Reporte clientes nuevos — fecha "hasta" anterior a fecha "desde"
US/RF: RF-25
Precondicion: El selector de fechas del reporte esta disponible.
Pasos:
  1. Ir al reporte de clientes nuevos.
  2. Ingresar fecha desde: 2026-03-20 y fecha hasta: 2026-03-10 (hasta anterior a desde).
  3. Intentar ejecutar el reporte.
Resultado esperado: El sistema muestra un mensaje de validacion indicando que el rango de fechas es invalido (la fecha "hasta" no puede ser anterior a la fecha "desde"). No se ejecuta la consulta.
Criterio de falla: El sistema ejecuta el reporte con un rango invalido y devuelve resultados incorrectos o un error tecnico sin mensaje amigable.
```

---

```
TC-029: Reporte clientes nuevos — columna "Como nos conocio" presente en el detalle
US/RF: RF-25
Precondicion: Existen clientes con el campo "Como nos conocio" completado con distintos valores (Instagram, Referido, Google, etc.).
Pasos:
  1. Generar el reporte de clientes nuevos para un rango que incluya esos clientes.
  2. Revisar el detalle de cada cliente en la tabla del reporte.
Resultado esperado: La columna "Como nos conocio" muestra el valor registrado para cada cliente que lo tiene completado. Para clientes sin ese dato, muestra un valor vacio o "No indicado".
Criterio de falla: La columna no aparece en el reporte, o aparece siempre vacia aunque los clientes tengan el dato cargado.
```

---

```
TC-030: Reporte clientes nuevos — clientes inactivos no incluidos por defecto
US/RF: RF-25, RF-06
Precondicion: Existe un cliente dado de alta en el rango a consultar que luego fue marcado como inactivo (eliminacion logica).
Pasos:
  1. Generar el reporte de clientes nuevos para el rango que incluye al cliente inactivo.
  2. Verificar si el cliente inactivo aparece en el reporte.
Resultado esperado: Los clientes marcados como inactivos no aparecen en el reporte de clientes nuevos por defecto, ya que representan bajas logicas del sistema.
Criterio de falla: El cliente inactivo aparece en el reporte como si fuera un cliente activo del periodo.
```

---

## BLOQUE 4 — RF-26: Reporte Actividades por Vendedor

---

```
TC-031: Generacion del reporte de actividades por vendedor con datos
US/RF: RF-26
Precondicion: Existen actividades realizadas por al menos dos vendedores distintos en el periodo a consultar, incluyendo distintos tipos (llamada, reunion, tarea).
Pasos:
  1. Navegar a la pantalla de Reportes.
  2. Seleccionar el reporte "Actividades por vendedor".
  3. Ingresar un rango de fechas que incluya las actividades de prueba.
  4. Ejecutar el reporte.
Resultado esperado: El reporte muestra una tabla agrupada por usuario responsable. Para cada vendedor se desglosa la cantidad de actividades por tipo: llamadas, reuniones y tareas. El total por vendedor coincide con la suma de los tres tipos. Solo se incluyen actividades del rango de fechas seleccionado.
Criterio de falla: Los totales no coinciden, faltan vendedores, no hay desglose por tipo, o aparecen actividades fuera del rango.
```

---

```
TC-032: Reporte actividades por vendedor — rango sin datos
US/RF: RF-26
Precondicion: No existen actividades en un periodo especifico (por ejemplo, hace dos anos).
Pasos:
  1. Ejecutar el reporte de actividades por vendedor con un rango sin datos.
Resultado esperado: El reporte muestra estado vacio con mensaje amigable. Contadores en cero. Sin error tecnico.
Criterio de falla: El sistema lanza un error 500 o muestra una excepcion en lugar de un estado vacio controlado.
```

---

```
TC-033: Reporte actividades — solo actividades "realizadas" incluidas
US/RF: RF-26
Precondicion: En el rango a consultar existen actividades con estado "pendiente" y con estado "realizada" para el mismo vendedor.
Pasos:
  1. Ejecutar el reporte de actividades por vendedor.
  2. Comparar el conteo del reporte con la cantidad real de actividades del vendedor.
Resultado esperado: El reporte cuenta unicamente las actividades con estado "realizada". Las actividades pendientes no se incluyen en el conteo, ya que el RF especifica "actividades realizadas".
Criterio de falla: El reporte incluye actividades pendientes en el conteo, inflando los numeros.
```

---

```
TC-034: Reporte actividades — consistencia entre desglose y total
US/RF: RF-26
Precondicion: Existe un vendedor con actividades en el periodo: 3 llamadas, 2 reuniones y 1 tarea (total esperado: 6).
Pasos:
  1. Ejecutar el reporte de actividades por vendedor para ese periodo.
  2. Verificar los valores del vendedor: llamadas, reuniones, tareas y total.
Resultado esperado: El total del vendedor (6) coincide exactamente con la suma de llamadas (3) + reuniones (2) + tareas (1). No hay discrepancias entre el desglose y el total.
Criterio de falla: El total no coincide con la suma de los tipos, indicando un bug de calculo en la consulta.
```

---

```
TC-035: Reporte actividades — vendedor sin actividades en el periodo no aparece
US/RF: RF-26
Precondicion: Existe un vendedor activo que no tiene ninguna actividad en el rango a consultar.
Pasos:
  1. Ejecutar el reporte de actividades por vendedor para el rango sin actividades del vendedor.
  2. Verificar si el vendedor sin actividades aparece en el reporte.
Resultado esperado: El vendedor sin actividades en el periodo no aparece en la tabla del reporte (no se muestran filas con todos los contadores en cero). El reporte solo lista usuarios que tienen al menos una actividad realizada en el rango.
Criterio de falla: Aparecen todos los usuarios del sistema aunque no tengan actividades, generando ruido innecesario en el reporte.
```

---

## BLOQUE 5 — DevOps: Docker Compose y CI/CD

---

```
TC-036: docker-compose up levanta el sistema completo sin errores
US/RF: US-029
Precondicion: Docker Desktop o Docker Engine esta instalado y corriendo. El repositorio esta clonado con los archivos `docker-compose.yml`, `Dockerfile` del backend y `Dockerfile` del frontend presentes. El archivo `.env` o `.env.example` esta configurado con los valores minimos necesarios.
Pasos:
  1. Desde la raiz del repositorio, ejecutar: `docker-compose up --build`.
  2. Observar los logs de los contenedores durante el arranque.
  3. Esperar a que todos los servicios reporten estado "healthy" o "started".
  4. Intentar acceder a la aplicacion desde el navegador (por ejemplo, `http://localhost:3000`).
  5. Intentar hacer login con el usuario del seed.
Resultado esperado: El comando `docker-compose up --build` completa sin errores fatales. Los contenedores de backend, frontend y base de datos arrancan y reportan estado saludable. La aplicacion es accesible desde el navegador y el login funciona correctamente. El proceso completo toma menos de 5 minutos en una maquina estandar.
Criterio de falla: El build falla con errores de Dockerfile, algun contenedor no arranca, la aplicacion no es accesible despues del arranque, o el login falla por problemas de conectividad entre contenedores.
```

---

```
TC-037: docker-compose up sin necesidad de pasos manuales adicionales
US/RF: US-029
Precondicion: Mismo que TC-036. El repositorio acaba de ser clonado en una maquina limpia.
Pasos:
  1. Ejecutar `docker-compose up` (sin build previo adicional, sin comandos de migracion manuales, sin seed manual).
  2. Verificar que las migraciones de base de datos se ejecutan automaticamente.
  3. Verificar que el seed de datos se aplica automaticamente (o que la DB queda en un estado usable).
Resultado esperado: Un solo comando es suficiente para levantar la aplicacion completa, incluyendo la preparacion de la base de datos. No se requiere ejecutar `npm run prisma:migrate`, `npm run prisma:seed` ni ningun otro comando adicional de forma manual.
Criterio de falla: El sistema requiere que el usuario ejecute comandos adicionales despues del `docker-compose up` para tener la aplicacion funcional.
```

---

```
TC-038: Los Dockerfiles pasan docker build sin errores de forma individual
US/RF: US-029
Precondicion: Docker esta instalado. Se tienen los Dockerfiles del backend y del frontend.
Pasos:
  1. Desde el directorio del backend, ejecutar: `docker build -t crm-backend .`
  2. Verificar que el build completa sin errores.
  3. Desde el directorio del frontend, ejecutar: `docker build -t crm-frontend .`
  4. Verificar que el build completa sin errores.
Resultado esperado: Ambos builds completan exitosamente generando imagenes validas. No hay errores de dependencias, de typescript, ni de configuracion.
Criterio de falla: Cualquiera de los dos builds falla con un error durante la construccion de la imagen.
```

---

```
TC-039: GitHub Actions CI corre lint + typecheck + tests en un Pull Request
US/RF: US-030
Precondicion: Existe un repositorio en GitHub con la configuracion de GitHub Actions. Se tiene acceso para crear una rama y abrir un PR.
Pasos:
  1. Crear una rama de prueba desde `master`.
  2. Realizar un cambio menor (por ejemplo, agregar un comentario en un archivo).
  3. Abrir un Pull Request hacia `master`.
  4. Observar el resultado del workflow de CI en la pestana "Checks" del PR.
  5. Verificar que el workflow incluye los pasos: lint, typecheck y tests.
Resultado esperado: El workflow de GitHub Actions se dispara automaticamente al abrir el PR. Ejecuta lint, typecheck y tests. Si todos pasan, el check queda en verde. El workflow completo toma menos de 5 minutos.
Criterio de falla: El workflow no se dispara, alguno de los tres pasos (lint, typecheck, tests) no esta presente, o el workflow tarda mas de 5 minutos.
```

---

```
TC-040: GitHub Actions CI bloquea el merge si los tests fallan
US/RF: US-030
Precondicion: Repositorio configurado con GitHub Actions y branch protection en `master` que requiere que los checks pasen.
Pasos:
  1. Crear una rama con un cambio que rompa un test existente (por ejemplo, modificar la logica de una funcion sin actualizar su test).
  2. Abrir un Pull Request hacia `master`.
  3. Esperar a que el CI ejecute.
  4. Verificar el estado del boton "Merge" en el PR.
Resultado esperado: El CI reporta fallo en el paso de tests. El boton de "Merge pull request" esta bloqueado o marcado como no recomendado hasta que los checks pasen. No es posible hacer merge sin resolver el fallo.
Criterio de falla: El CI falla pero el merge no esta bloqueado, o el CI no reporta el fallo correctamente.
```

---

## BLOQUE 6 — Regresion Sprint 1

---

```
TC-041: Login con credenciales validas — RF-27 (regresion)
US/RF: RF-27
Precondicion: El usuario `admin@ciudadmoto.com` existe y su contrasena es conocida. La aplicacion esta corriendo.
Pasos:
  1. Navegar a la pantalla de login.
  2. Ingresar email y contrasena correctos.
  3. Hacer clic en "Ingresar".
Resultado esperado: El usuario accede al sistema y es redirigido al dashboard o pantalla principal. La sesion JWT queda activa.
Criterio de falla: El login falla con credenciales correctas, no hay redireccion, o el token JWT no se genera.
```

---

```
TC-042: Alta de cliente con todos los campos obligatorios — RF-01 (regresion)
US/RF: RF-01
Precondicion: El usuario esta autenticado.
Pasos:
  1. Navegar al formulario de alta de cliente.
  2. Completar nombre, apellido, DNI y telefono principal con valores validos y unicos.
  3. Guardar el cliente.
Resultado esperado: El cliente se crea correctamente y aparece en el listado de clientes con los datos ingresados.
Criterio de falla: El cliente no se crea, aparece un error inesperado, o los datos no se persisten correctamente.
```

---

```
TC-043: Deteccion de duplicados por DNI en alta de cliente — RF-02 (regresion)
US/RF: RF-02
Precondicion: Existe un cliente con DNI `12345678`.
Pasos:
  1. Intentar dar de alta un nuevo cliente con el mismo DNI `12345678`.
  2. Observar el comportamiento del sistema.
Resultado esperado: El sistema muestra una alerta indicando que ya existe un cliente con ese DNI, mostrando los datos del cliente existente. El usuario puede elegir cancelar o continuar.
Criterio de falla: El sistema permite crear el duplicado sin advertencia, o lanza un error 500 en lugar de una alerta amigable.
```

---

```
TC-044: Creacion de oportunidad vinculada a cliente — RF-07 (regresion)
US/RF: RF-07
Precondicion: Existe al menos un cliente activo.
Pasos:
  1. Abrir el perfil del cliente activo.
  2. Crear una nueva oportunidad con: modelo de moto de interes y etapa inicial "Consulta".
  3. Guardar la oportunidad.
Resultado esperado: La oportunidad se crea y aparece en el pipeline Kanban en la columna "Consulta" con el nombre del cliente y el modelo de moto. El responsable es el usuario logueado.
Criterio de falla: La oportunidad no se crea, no aparece en el Kanban, o el responsable es incorrecto.
```

---

```
TC-045: Movimiento de oportunidad entre etapas del pipeline — RF-09 (regresion)
US/RF: RF-09
Precondicion: Existe una oportunidad en etapa "Consulta".
Pasos:
  1. Abrir el Kanban.
  2. Mover la oportunidad de "Consulta" a "Presupuesto" (drag and drop o boton de cambio de etapa).
  3. Verificar el historial de la oportunidad.
Resultado esperado: La oportunidad aparece en la columna "Presupuesto". El historial registra el cambio de etapa con fecha y usuario que realizo el movimiento.
Criterio de falla: La oportunidad no se mueve, el cambio no queda registrado en el historial, o el Kanban no refleja el nuevo estado.
```

---

```
TC-046: Creacion de actividad vinculada a cliente — RF-14 (regresion)
US/RF: RF-14
Precondicion: El usuario esta autenticado. Existe al menos un cliente activo.
Pasos:
  1. Crear una nueva actividad con: tipo "Llamada", titulo, cliente vinculado, fecha/hora y estado "Pendiente".
  2. Guardar la actividad.
Resultado esperado: La actividad se crea correctamente y aparece en el listado de actividades y en el perfil del cliente vinculado.
Criterio de falla: La actividad no se crea, no aparece en el listado, o no aparece en el perfil del cliente.
```

---

```
TC-047: Marcar actividad como realizada con resumen — RF-15 (regresion)
US/RF: RF-15
Precondicion: Existe una actividad con estado "pendiente".
Pasos:
  1. Abrir la actividad pendiente.
  2. Marcar la actividad como "Realizada".
  3. Ingresar un resumen opcional de lo conversado.
  4. Guardar.
Resultado esperado: La actividad cambia su estado a "realizada". El resumen queda registrado en la actividad. La actividad no aparece como vencida.
Criterio de falla: El estado no cambia, el resumen no se guarda, o el sistema lanza un error al completar la actividad.
```

---

```
TC-048: Cierre de oportunidad como "Ganado" — RF-10 (regresion)
US/RF: RF-10
Precondicion: Existe una oportunidad abierta en cualquier etapa.
Pasos:
  1. Mover la oportunidad a la etapa "Cierre".
  2. El sistema solicita el resultado: seleccionar "Ganado".
  3. Confirmar.
Resultado esperado: La oportunidad queda en estado "Cierre" con resultado "Ganado". La oportunidad queda marcada como cerrada y no aparece en el Kanban activo por defecto.
Criterio de falla: El sistema no solicita el resultado al llegar a "Cierre", o la oportunidad sigue visible en el Kanban como si estuviera abierta.
```

---

```
TC-049: Eliminacion logica de cliente — RF-06 (regresion)
US/RF: RF-06
Precondicion: Existe un cliente activo con al menos una actividad y una oportunidad asociadas.
Pasos:
  1. Abrir el perfil del cliente activo.
  2. Ejecutar la accion de "Desactivar cliente" o "Marcar como inactivo".
  3. Confirmar la operacion.
  4. Verificar el listado general de clientes.
  5. Aplicar el filtro para ver clientes inactivos.
Resultado esperado: El cliente desaparece del listado por defecto (no se elimina fisicamente). Al aplicar el filtro de inactivos, el cliente aparece. Sus datos, actividades y oportunidades historicas se conservan en la base de datos.
Criterio de falla: El cliente sigue apareciendo en el listado activo, el cliente se elimina fisicamente, o los datos historicos del cliente se pierden.
```

---

## Matriz de cobertura de RFs

| RF | Descripcion | TCs que lo cubren |
|----|-------------|-------------------|
| RF-06 | Eliminacion logica de clientes | TC-030, TC-049 |
| RF-16 | Listado actividades con filtros | TC-001 a TC-008 |
| RF-18 | Vinculacion de cuentas (mock) | TC-009, TC-023 |
| RF-19 | Envio de email desde el CRM | TC-010, TC-011, TC-012, TC-022 |
| RF-20 | Recepcion de emails | TC-013 |
| RF-21 | Envio de mensajes WhatsApp | TC-014, TC-015, TC-024 |
| RF-22 | Recepcion de mensajes WhatsApp | TC-016 |
| RF-23 | Historial de comunicaciones | TC-017, TC-018, TC-025 |
| RF-24 | Comunicaciones no vinculadas | TC-019, TC-020, TC-021 |
| RF-25 | Reporte clientes nuevos | TC-026 a TC-030 |
| RF-26 | Reporte actividades por vendedor | TC-031 a TC-035 |
| DevOps docker-compose | US-029 | TC-036, TC-037, TC-038 |
| DevOps CI | US-030 | TC-039, TC-040 |
| RF-27 | Login | TC-041 |
| RF-01 | Alta de cliente | TC-042 |
| RF-02 | Deteccion duplicados | TC-043 |
| RF-07 | Creacion de oportunidad | TC-044 |
| RF-09 | Movimiento entre etapas | TC-045 |
| RF-14 | Creacion de actividad | TC-046 |
| RF-15 | Resultado de actividad | TC-047 |
| RF-10 | Cierre de oportunidad | TC-048 |
| RF-06 | Eliminacion logica | TC-049 |

---

## Criterios de Go / No-Go para Sprint Review

### Bloqueantes absolutos (impiden el Go):
- TC-036 o TC-037 fallan: `docker-compose up` no levanta la aplicacion.
- TC-039 falla: el CI no corre automaticamente.
- TC-009 falla: el banner de modo simulado no existe en comunicaciones.
- Cualquier TC de regresion (TC-041 a TC-049) falla: un flujo del Sprint 1 se rompio.

### Bloqueantes de feature (impiden demostrar el modulo):
- TC-001 falla: el listado de actividades no carga.
- TC-010 falla: el envio de email simulado no funciona.
- TC-014 falla: el envio de WhatsApp simulado no funciona.
- TC-026 falla: el reporte de clientes nuevos no genera resultados.
- TC-031 falla: el reporte de actividades por vendedor no genera resultados.

### Defectos tolerables para la demo (P3/P4, no bloquean Go):
- TC-025: el historial de comunicaciones no pagina correctamente con muchos registros.
- TC-035: el reporte incluye vendedores sin actividades con contadores en cero.

---

## Entregables producidos
- `c:/Gaston/Projects/Git repository/projects/.claude/pm-reports/tester-plan-sprint2.md` — este documento

## Decisiones tomadas
- El bloque de comunicaciones cubre los 7 RFs (RF-18 a RF-24) con 17 TCs porque es el modulo nuevo mas complejo y de mayor riesgo en Sprint 2.
- Los TCs de regresion se restringen a los 9 flujos mas criticos del Sprint 1 para no duplicar el trabajo del plan anterior.
- TC-023 (inspeccion de comentarios MOCK) se incluye como caso de prueba tecnico porque es un criterio explicito del DoD tecnico del sprint.
- No se incluyen TCs para RNF-01 (rendimiento) en este sprint dado que la base de datos de prueba es pequena; se recomienda agregar un TC de carga antes del sprint de produccion.

## Bloqueantes / Riesgos
- Si el frontend del modulo de comunicaciones no implementa el banner de modo simulado (TC-009), toda la demo queda comprometida ante el cliente.
- Si docker-compose no funciona (TC-036/037), el criterio de Done del sprint no puede cerrarse.
- Los TCs de comunicaciones no vinculadas (TC-019 a TC-021) dependen de que exista un endpoint o mecanismo de bandeja general que puede no haber sido implementado si se aplico el recorte de capacidad definido en el Sprint Planning.

## Recomendaciones para el siguiente rol
- El PM debe revisar si los criterios de Go/No-Go de este plan son consistentes con los criterios del DoD del Sprint 2.
- El Tech Lead debe validar que el sistema de recepcion simulada de mensajes/emails (webhooks mock) este implementado antes de que QA ejecute TC-013, TC-016, TC-019 y TC-021.
- Para el Sprint 3, se recomienda agregar TCs de carga (RNF-01) y de seguridad (RNF-03, RNF-04) que este plan no cubre por estar fuera del scope del Sprint 2.
