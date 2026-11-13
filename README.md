# Isabel Valenzuela | Bienes Raíces

Plataforma inmobiliaria de Isabel Valenzuela, creada por XARCON con **Next.js 16, React 19, TypeScript y Firebase**.

## Qué incluye
- Sitio público responsive: inicio editorial, catálogo con filtros, fichas individuales, contacto por WhatsApp o correo, animaciones y SEO.
- Identidad visual propia (azul petróleo, blanco, dorado), logotipo vectorial y favicon.
- Panel privado en `/admin`: inicio con Google, autorización mediante `admins/{uid}`, creación/edición/eliminación de inmuebles, publicación y carga de imágenes a Firebase Storage.
- Editor de contenido institucional, héroe, fotografía, zonas de atención y canales de contacto.
- Modo vista previa sin Firebase con inmuebles **ficticios y rotulados DEMO**. Cuando Firebase está configurado, **NO** muestra datos falsos si la colección está vacía.
- Reglas seguras para Firestore y Storage. El panel no acepta usuarios que no estén registrados en `admins`.

## Configurar
1. Instala Node 20.9+ y ejecuta `npm install` y `npm run dev`.
2. Copia `.env.example` a `.env.local` y completa las variables `NEXT_PUBLIC_FIREBASE_*` con los datos de tu proyecto Firebase.
3. En Firebase Authentication, habilita **Google** y agrega el dominio de Vercel a **Authorized domains**.
4. Crea una base Firestore (Native mode) y un bucket de Cloud Storage.
5. Publica las reglas con `firebase deploy --only firestore:rules,storage` (tras asociar el proyecto con Firebase CLI) o copia los archivos `firestore.rules` y `storage.rules` a sus consolas respectivas.
6. Accede a `/admin` con Google. Copia el UID que muestra la pantalla de acceso pendiente y crea **manualmente desde Firebase Console** el documento `admins/EL_UID` (puede contener `role: "owner"`). No hay auto-registro de administradores. Actualiza la página.
7. En Vercel importa el repositorio, selecciona framework Next.js, añade las mismas `NEXT_PUBLIC_FIREBASE_*` variables y despliega. No necesitas servidor propio. Ajusta los dominios autorizados en Firebase Authentication.

## Estructura de datos
`properties/{id}`: título, ubicación, operación, tipo, precio USD, área, dormitorios, baños, fotos, descripción, atributos, destacada y publicada.
`site/public`: identidad textual, mensaje principal, imágenes, biografía, áreas de servicio, email, WhatsApp e Instagram.
`admins/{uid}`: documentos provisionados fuera de la app que conceden acceso al panel.

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
4. Aprovisionar manualmente cada administrador por UID en la colección `admins`.
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

En `/admin` → **Contenido del sitio** se configuran Facebook, Instagram, TikTok y número de WhatsApp (con prefijo). Solo se admiten enlaces HTTPS de los dominios oficiales; los enlaces vacíos aparecen como pendientes, **sin inventar perfiles ni números**. Se editarán asimismo tres imágenes del hero mediante URL o Storage.

**Despliegue único**: conservar el proyecto existente `isabelvalenzuela` en Vercel con repositorio `moneyfund/ISABEL-VALENZUELA`, rama de producción `main`. La tarjeta «New repository detected» de Vercel es un aviso de importación, no un segundo despliegue. No importarlo otra vez. Al integrar cambios en `main`, el proyecto vinculado puede generar despliegues automáticamente.
