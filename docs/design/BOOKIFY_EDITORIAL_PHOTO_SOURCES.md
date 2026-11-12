# Bookify — Fuentes fotográficas editoriales

## Entrega 03.1

Las siguientes imágenes son provisionales.
No representan propiedades ni habitaciones
almacenadas en el backend de Bookify.

### Home hero

- Archivo: `public/images/demo/home-hero.jpg`
- Autor: Anton Sobotyak
- Fuente:
  https://unsplash.com/photos/a-bed-sitting-in-a-bedroom-next-to-a-window-8XNaO7HpaDo

### Home room

- Archivo: `public/images/demo/home-room.jpg`
- Autor: Clay Banks
- Fuente:
  https://unsplash.com/photos/cozy-bedroom-with-wood-paneled-walls-and-a-view-0v7DOW9cT_o

### Home terrace

- Archivo: `public/images/demo/home-terrace.jpg`
- Autor: Sara Abilova
- Fuente:
  https://unsplash.com/photos/outdoor-patio-with-table-chairs-and-ocean-view-3rADKQSylpQ

## Licencia

Unsplash License:
https://unsplash.com/license

Las fotografías deben utilizarse de acuerdo
con los términos vigentes de su licencia.

## Reglas de uso

- No vincular fotografías ilustrativas a IDs
  de propiedades reales como si fueran sus fotos.
- No generar precios, destinos o disponibilidad
  a partir de estas imágenes.
- Mantener identificación visual de su carácter
  ilustrativo mientras estén en producción.
- Sustituir las imágenes cuando exista soporte
  de medios reales y autorizados.
- Mantener registro de autor y procedencia.

## Entrega 03.2 — Property editorial

La presentación pública de Property reutiliza:

- Archivo: `public/images/demo/home-room.jpg`
- Fuente y autor: registrados en la entrega 03.1.
- Uso: fotografía editorial ilustrativa.
- Configuración: `src/features/property/property-media.ts`.

### Restricciones

- No corresponde a ningún `propertyId`.
- No representa una habitación o unidad disponible.
- No forma parte de la respuesta OpenAPI de Property.
- Debe mantenerse el aviso visible:
  "Fotografía ilustrativa. No corresponde a este alojamiento."
- No debe utilizarse para generar información comercial
  sobre una propiedad real.

El soporte de fotografías reales requiere un contrato
backend explícito y su correspondiente actualización
del roadmap antes de implementarse.
