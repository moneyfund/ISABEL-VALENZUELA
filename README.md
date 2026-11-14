# Isabel Valenzuela | Bienes Raíces

Plataforma inmobiliaria de Isabel Valenzuela, creada por XARCON con **Next.js 16, React 19, TypeScript y Firebase**.

## Qué incluye
- Sitio público responsive: inicio editorial, catálogo con filtros, fichas individuales, contacto por WhatsApp o correo, animaciones y SEO.
- Identidad visual propia (azul petróleo, blanco, dorado), logotipo vectorial y favicon.
- Panel privado en `/admin`: inicio con Google, autorización mediante dos correos de Google verificados, creación/edición/eliminación de inmuebles, publicación y carga de imágenes a Firebase Storage.
- Editor de contenido institucional, héroe, fotografía, zonas de atención y canales de contacto.
- Modo demostración con inmuebles **ficticios y rotulados DEMO** mientras no existan propiedades publicadas.
- Reglas seguras para Firestore y Storage. El panel solo acepta las dos cuentas de Google autorizadas y verificadas.

## Configurar
1. Instala Node 20.9+ y ejecuta `npm install` y `npm run dev`.
2. Copia `.env.example` a `.env.local` y completa las variables `NEXT_PUBLIC_FIREBASE_*` con los datos de tu proyecto Firebase.
3. En Firebase Authentication, habilita **Google** y agrega el dominio de Vercel a **Authorized domains**.
4. Crea una base Firestore (Native mode) y un bucket de Cloud Storage.
5. Publica las reglas con `firebase deploy --only firestore:rules,storage` (tras asociar el proyecto con Firebase CLI) o copia los archivos `firestore.rules` y `storage.rules` a sus consolas respectivas.
6. Accede a `/admin` con Google utilizando exclusivamente `norvingarcia220@gmail.com` o `valenzuela.ing120@gmail.com`. No necesitas documentos `admins/{uid}`. Aplica las reglas antes de publicar.
7. Conserva el proyecto Vercel existente `isabelvalenzuela`; está vinculado al repositorio en `main`. Evita importar una copia. Ajusta los dominios autorizados en Firebase Authentication.

## Estructura de datos
`properties/{id}`: título, ubicación, operación, tipo, precio USD, área, dormitorios, baños, fotos, descripción, atributos, destacada y publicada.
`site/public`: identidad textual, mensaje principal, imágenes, biografía, áreas de servicio, correo, WhatsApp, Facebook, TikTok e Instagram.
Autorización de administradores: lista explícita de dos correos verificados en reglas de Firestore y Storage. No se usa colección `admins`.

## Seguridad y operación
- Los ejemplos son únicamente de presentación; no son inmuebles en oferta y nunca se envían como registros a Firestore.
- Las lecturas públicas de inmuebles solo permiten documentos `published == true`; los borradores solo son accesibles a administradores.
- Las reglas de Storage permiten publicar fotos, con control de tipo y límite de 8 MB por archivo.
- Verifica correo y teléfono reales antes de publicar y elimina los ejemplos cuando entren anuncios reales.
- Para publicar en producción, haz primero una prueba con una cuenta no autorizada de que no puede escribir ni leer borradores.
- El marcado publicitario y las fotografías de demostración no constituyen ofertas inmobiliarias reales.

## Comandos
```bash
npm run dev
npm run typecheck
npm run build
```

## Firebase de Isabel (12 nov 2026)
La configuración del cliente Firebase Web SDK ya está incorporada como valores de reserva en `lib/firebase.ts` para `isabelvalenzuela-52364`. Los valores públicos `NEXT_PUBLIC_*` definidos en Vercel tienen prioridad; nunca incorpores contraseñas, llaves de service account ni tokens de administrador al código.

La foto compartida por Isabel está integrada como `public/isabel-valenzuela.webp` (versión web optimizada) y se usa en «Sobre Isabel». Puede reemplazarse desde el editor de contenidos con una imagen de Firebase Storage.

**Antes de activar el panel:**
1. Habilitar Google Sign-In en Firebase Authentication.
2. Agregar el dominio desplegado a Authentication → Settings → Authorized domains.
3. Crear Firestore y Cloud Storage y aplicar `firestore.rules` y `storage.rules`. Tener un proyecto Firebase y la configuración del SDK no crea por sí solo los servicios ni instala las reglas.
4. Verificar que el inicio de sesión con Google funciona para `norvingarcia220@gmail.com` y `valenzuela.ing120@gmail.com` y que otras cuentas no pueden crear, editar ni consultar borradores.
5. Publicar las propiedades reales. Hasta entonces se muestran fichas **DEMO** sin grabarlas en Firestore.

**Despliegue Vercel:** el código funciona con la configuración pública de Firebase que ya se incluye. No se requieren variables de entorno para este proyecto concreto, aunque se recomienda configurarlas desde Vercel para mantener todos los entornos explícitos. No se debe afirmar que el panel está operativo hasta activar los servicios de Firebase y aplicar las reglas.

## Navegación multipágina y redes sociales (2026-11-13)
Rutas independientes con enlaces permanentes:
- `/` — Inicio editorial y selección de propiedades.
- `/propiedades` — Catálogo filtrable y búsqueda por ubicación.
- `/servicios` — Servicios y proceso.
- `/sobre-isabel` — Perfil profesional y fotografía oficial.
- `/contacto` — Canales de contacto oficiales.
- `/admin` — Panel privado para publicar inmuebles y actualizar el contenido.

El hero incorpora una secuencia suave de tres fotografías, acentos arquitectónicos animados, fotografía de Isabel, botones de acción y buscador conectado al catálogo. El comportamiento respeta `prefers-reduced-motion`.

En `/admin` → **Contenido del sitio** se configuran Facebook, Instagram, TikTok y número de WhatsApp (con prefijo). Solo se admiten enlaces HTTPS de los dominios oficiales; los enlaces vacíos aparecen como pendientes, **sin inventar perfiles ni números**. El número oficial de WhatsApp predeterminado es `+505 5725 1888` y puede modificarse desde el administrador. Se editarán asimismo tres imágenes del hero mediante URL o Storage.

**Despliegue único**: conservar el proyecto existente `isabelvalenzuela` en Vercel con repositorio `moneyfund/ISABEL-VALENZUELA`, rama de producción `main`. La tarjeta «New repository detected» de Vercel es un aviso de importación, no un segundo despliegue. No importarlo otra vez. Al integrar cambios en `main`, el proyecto vinculado puede generar despliegues automáticamente.

## Acceso administrativo autorizado (13 nov 2026)
El panel /admin comprueba que la sesión sea Google y que su correo esté verificado y pertenezca a una lista exacta: `norvingarcia220@gmail.com` y `valenzuela.ing120@gmail.com`.
Las reglas de `firestore.rules` y `storage.rules` replican la misma restricción en Firebase, con acceso público únicamente a anuncios `published == true` y al documento `site/public`. Las imágenes publicitarias de Storage son de lectura pública.
**IMPORTANTE:** la seguridad efectiva depende de publicar ambas reglas en Firebase Console; cambiar archivos en GitHub no actualiza automáticamente las reglas del servidor Firebase.
El teléfono WhatsApp predeterminado es `+505 5725 1888` (`50557251888`), vinculado en todas las vistas públicas. Un documento antiguo con WhatsApp vacío utiliza el valor predeterminado.


## Guía de compra como captación de consultas (noviembre 2026)
La ruta pública `/guia-de-compra` solicita **nombre y apellido en la primera pantalla**.
El visitante responde la modalidad de pago, tipo de propiedad, estado de inscripción,
si ya tiene un inmueble identificado, origen de los ingresos, residencia y presupuesto
opcional. Antes de obtener la guía, debe aceptar expresamente el almacenamiento de
esos datos para atención comercial y pulsar **Enviar guía**.

Solo tras confirmarse la escritura en Firestore se muestra la guía personalizada,
junto con una referencia `IV-XXXXXXXX`. El botón WhatsApp precarga nombre y referencia,
no vuelca a WhatsApp los datos financieros: el equipo los consulta en `/admin`.

Colección Firestore: `purchase_requests`. Campos:
`firstName`, `lastName`, `payment`, `property`, `income`, `residence`,
`documents`, `identified`, `price`, `savings`, `consent`,
`status` (nuevo, contactado, atendido) y `createdAt` (timestamp del servidor).

`/admin` → **Guías recibidas** muestra las 150 consultas recientes, con búsqueda
por nombre o código, fecha/hora en zona `America/Managua`, todas las respuestas,
gestión de estado y borrado definitivo autorizado.

**Paso manual obligatorio:** publicar la versión íntegra de `firestore.rules` en
Firebase Console. Sin esa actualización, el sistema público no podrá enviar solicitudes
y el panel no podrá leerlas; la UI mostrará un error en vez de confirmar un envío no
guardado. Storage no necesita cambios para esta funcionalidad.

**Privacidad y seguridad:** las respuestas no se publican ni se consultan sin iniciar
sesión con uno de los dos correos administrativos verificados. Las reglas permiten
crear solicitudes únicamente con campos y valores validados, pero un formulario
público podría recibir spam. Antes de campañas de alto tráfico, habilitar Firebase App
Check o un endpoint protegido con verificación antispam, y definir una política de
retención/eliminación de solicitudes. No se solicitan cédulas, contraseñas ni cuentas
bancarias. No se almacena automáticamente el número del remitente de WhatsApp.

## Celular del solicitante y retirada de propiedades DEMO (13 nov 2026)

- La primera pantalla de `/guia-de-compra` ahora solicita **nombre, apellido y número celular**.
  Acepta números nicaragüenses de 8 dígitos (se les agrega `+505`) y números internacionales con prefijo.
  El teléfono se guarda en `purchase_requests.phone` junto al resto de respuestas y el consentimiento
  expreso de seguimiento por **llamada o WhatsApp**. El administrador lo ve en
  **Guías recibidas** y puede pulsarlo para llamar. Consultas previas sin `phone` se mantienen legibles.
- **Acción de Firebase obligatoria:** sustituir y publicar las reglas de Firestore con el archivo
  completo `firestore.rules`. La versión anterior en el repositorio contenía un fragmento
  malformado; ahora se reparó. El nuevo esquema de envío exige `phone` y solo admite
  que un visitante cree la consulta; nunca puede leerla, modificarla o eliminarla.
  Storage no requiere actualización.
- En `/admin` → **Propiedades** → **Propiedades DEMO** aparece una lista de las 6 fichas
  locales. `Quitar` guarda su ID mediante `arrayUnion` en `site/public.hiddenDemoIds` y
  elimina su presencia del catálogo y del enlace directo. `Restaurar` hace `arrayRemove`.
  No se borran anuncios reales de Firestore. Es una baja persistente del ejemplo; el
  archivo fuente de las 6 fichas sigue disponible en `lib/demo.ts`.
- El catálogo público escucha el documento de configuración y los anuncios publicados;
  si no hay reales, solo presenta demos aún habilitadas. **Si se retiran todas, el catálogo
  queda vacío en lugar de volver a publicar demos automáticamente.**

Las pruebas de interfaz necesitan Firebase Authentication, Firestore y reglas publicadas
antes de efectuar una solicitud real de prueba. Las verificaciones CI no sustituyen ese
paso ni realizan un envío de datos de un usuario.


## Ubicación geográfica de los inmuebles (noviembre 2026)

La pantalla `/admin` → **Propiedades** → nueva/editar contiene ahora **Ubicación en el mapa**.
El selector usa Leaflet 1.9.4 y las teselas de OpenStreetMap (attribution visible), con
interacción por clic, zoom y desplazamiento. También permite pegar manualmente
latitud y longitud y pulsar `Usar coordenadas`. No utiliza la ubicación del
dispositivo ni rellena un punto ficticio.

El documento `properties/{propertyId}` admite el campo opcional:
```json
"coordinates": { "lat": 12.925, "lng": -85.916 }
```
Los valores son números en grados decimales, con rangos validados en la interfaz
(latitud de -90 a 90 y longitud de -180 a 180). Si el agente no indica ubicación,
se guarda `null`. No se necesita migrar inmuebles existentes ni modificar reglas
de Firestore/Storage. Las fichas públicas con coordenadas válidas muestran el
**mismo punto** en el mapa y un enlace a OpenStreetMap para abrirlo.

La ubicación seleccionada **se hace pública** cuando se publica el anuncio:
recomendar a la agente elegir un punto aproximado si no desea difundir la
dirección exacta de una residencia particular.

**Estado de los ejemplos:** las 6 propiedades `demo-*` son únicamente datos
de diseño y no representan ofertas inmobiliarias. Ya no aparecen en la web pública,
ni siquiera cuando Firestore no contiene inmuebles reales, y sus rutas directas
retornan el estado "Esta propiedad no está disponible". Se eliminaron de Inicio,
Catálogo y Detalle los avisos visuales grandes de demostración, porque las fichas
ficticias no se exponen. Isabel puede retirarlas/archivarlas desde la lista de
ejemplos internos del administrador. Los anuncios reales publicados sí aparecen
inmediatamente.

Los mapas cargan de forma diferida la versión fijada de Leaflet mediante CDN.
Requieren conexión a Internet tanto para la biblioteca como para las teselas.
Si el mapa no carga, el administrador mantiene los campos manuales de coordenadas.


## Centro de Guías (noviembre 2026)

- La navegación pública se denomina **Guías** y abre `/guias`, una portada editorial con cuatro opciones que no muestra ningún formulario hasta elegir el objetivo.
- **Compra:** `/guias/compra`, conserva el cuestionario de compra previamente existente, incluyendo crédito/contado, ingreso, residencia, inmueble y documentación.
- **Venta:** `/guias/venta`, distingue inmueble, ubicación general, escritura, cargas, ocupación, fecha deseada y precio orientativo.
- **Buscar local en renta:** `/guias/buscar-renta`, pregunta actividad comercial, zona, tamaño, presupuesto, inicio, etapa del negocio y plazo.
- **Ofrecer un local en renta:** `/guias/ofrecer-renta`, recoge tipo de espacio, zona, metraje, estado, derecho a arrendar, disponibilidad, servicios y renta orientativa.
- La ruta histórica `/guia-de-compra` permanece activa por compatibilidad con enlaces anteriores, y la nueva ruta `/guias/compra` reutiliza el mismo formulario.
- Todas solicitan nombre, apellido y celular, requieren consentimiento expreso, guardan en Firestore antes de mostrar resultados y generan referencia IV-XXXXXXXX, recomendaciones adaptadas, copia, impresión y enlace a WhatsApp que incluye la referencia.
- Todas llegan a **Admin → Guías recibidas**. Hay filtros por categoría/estado/búsqueda y acceso a las respuestas completas, celular y fecha/hora en Nicaragua. Las solicitudes de compra antiguas permanecen sin migración.
- Firestore usa la colección existente `purchase_requests`. Los tres tipos nuevos tienen `guideType` `venta | buscar-renta | ofrecer-renta` y un mapa `answers` con campos delimitados por esquema. Compra conserva el esquema anterior sin `guideType`.
- **Acción indispensable:** publicar el archivo `firestore.rules` actualizado en Firebase Console. El repositorio no aplica reglas automáticamente. Los nuevos formularios no mostrarán guía ni confirmación si su solicitud no queda guardada.
- El consentimiento indica que los datos se usan para atender la solicitud; solo los dos correos administradores autorizados pueden leerlos. La validación del cliente y las reglas restringen tamaño, campos y valores.
- Fuentes generales de orientación: Código Civil de Nicaragua (arrendamiento) y Registro Público de la Propiedad. Requisitos, tributos, permisos, garantías y disponibilidad deben confirmarse para cada caso. No se ofrece aprobación bancaria ni asesoramiento jurídico definitivo.

Recomendación antes de ejecutar campañas de captación pública: habilitar verificación antispam mediante App Check o un endpoint seguro y establecer un plazo de conservación y eliminación de consultas.
