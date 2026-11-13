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
