# Isabel Valenzuela | Bienes Raíces

Sitio inmobiliario y gestor de propiedades desarrollado por **XARCON** con Next.js 16, React 19, TypeScript y Firebase.

## Funcionalidades principales

- Sitio público multipágina con identidad azul petróleo, blanco y dorado.
- Catálogo, filtros, fichas con fotografías y ubicación en mapa (Leaflet / OpenStreetMap).
- Panel privado en `/admin` para crear, editar, publicar y eliminar inmuebles reales, administrar imágenes y editar el contenido público.
- Inicio de sesión con Google limitado a dos administradores autorizados.
- Centro `/guias` con cuatro guías: compra, venta, búsqueda de local en renta y oferta de local en renta.
- Solicitudes enviadas desde las guías a Firestore con consentimiento, fecha/hora, teléfono y código `IV-XXXXXXXX`. La bandeja **Guías recibidas** permite consultar detalles, filtrar, cambiar estados y eliminar solicitudes.
- Contacto directo por WhatsApp y vínculos configurables a Facebook, Instagram y TikTok.

**El catálogo público solo muestra anuncios reales publicados desde Firestore.** No incluye propiedades ficticias, datos de prueba ni publicaciones precargadas. Si el inventario está vacío, se presenta un mensaje invitando a contactar a Isabel.

## Configuración local

1. Usar Node.js 20.9+.
2. Instalar dependencias mediante `npm install`.
3. Copiar `.env.example` a `.env.local` y configurar las variables `NEXT_PUBLIC_FIREBASE_*` del proyecto `isabelvalenzuela-52364`.
4. Habilitar autenticación con Google en Firebase Authentication y autorizar los dominios.
5. Activar Cloud Firestore y Firebase Storage y **publicar** `firestore.rules` y `storage.rules` desde Firebase Console o Firebase CLI.
6. Iniciar con `npm run dev`.

Para comprobar el proyecto:

```bash
npm run typecheck
npm run build
```

## Firebase

- `properties/{id}`: anuncio inmobiliario real. Guarda título, ciudad, ubicación, tipo, operación, precio en USD, área, fotografías, descripción, atributos, estado de publicación y selección destacada. El campo opcional `coordinates` almacena `{ lat, lng }`.
- `site/public`: nombre y textos institucionales, hero, biografía, zonas de atención, WhatsApp y redes sociales.
- `purchase_requests/{id}`: consultas de las cuatro guías. La compra mantiene el esquema de preguntas original; las otras tres usan `guideType` y el mapa `answers`. Incluyen nombre, apellido, teléfono, consentimiento, estado y marca temporal del servidor.

Las reglas permiten consultar al público únicamente inmuebles con `published == true`. Los documentos de solicitudes solo pueden leerlos o gestionarlos las cuentas administradoras autorizadas. No se crean administradores mediante registro público.

**Cuentas administradoras:**
- `norvingarcia220@gmail.com`
- `valenzuela.ing120@gmail.com`

**WhatsApp predeterminado de Isabel:** `+505 5725 1888`. Puede actualizarse desde el administrador.

El navegador únicamente accede al SDK público de Firebase. Nunca se deben incorporar claves privadas de cuentas de servicio a este repositorio.

## Navegación

| Ruta | Función |
| --- | --- |
| `/` | Presentación y propiedades destacadas reales |
| `/propiedades` | Catálogo y filtros |
| `/propiedades/[id]` | Ficha individual y mapa si se guardaron coordenadas |
| `/guias` | Selección de cuatro guías |
| `/guias/compra` | Compra con crédito o de contado |
| `/guias/venta` | Venta de inmueble |
| `/guias/buscar-renta` | Búsqueda de local comercial |
| `/guias/ofrecer-renta` | Oferta de local en renta |
| `/guia-de-compra` | Ruta histórica compatible |
| `/servicios` | Servicios |
| `/sobre-isabel` | Perfil de Isabel |
| `/contacto` | Contacto y redes |
| `/admin` | Administración privada |

## Ubicación de propiedades

En el formulario administrativo puede hacerse clic sobre el mapa para colocar un marcador o ingresar latitud y longitud manualmente. La ubicación guardada se muestra al abrir la ficha pública; si no se proporcionan coordenadas, no se dibuja ningún punto inventado. Para viviendas ocupadas se recomienda usar una ubicación aproximada cuando el propietario requiera privacidad.

## Seguridad y operación

- Los cambios en archivos `firestore.rules` y `storage.rules` de GitHub **no** se publican automáticamente en Firebase: hay que aplicarlos.
- El público puede crear consultas validadas en `purchase_requests`, pero no leerlas ni modificarlas.
- Para las cuatro guías se solicita consentimiento antes de guardar información personal y mostrar los resultados.
- Se recomienda añadir App Check u otra defensa antispam antes de campañas de captación masiva, además de un plazo de retención de consultas.
- Las imágenes en Storage se restringen a JPEG, PNG y WebP menores de 8 MB y las escrituras requieren sesión administrativa.
- Probar las reglas de Firebase con usuarios autorizados y no autorizados antes de campañas o de publicar datos de clientes reales.

## Despliegue

Usar el proyecto Vercel existente **`isabelvalenzuela`**, vinculado a `moneyfund/ISABEL-VALENZUELA` en la rama `main`. No importar una segunda copia del repositorio.

Los cambios fusionados a `main` pueden generar un despliegue automático. Verificar el estado de compilación y publicación en Vercel.
