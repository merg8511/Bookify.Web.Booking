import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bookify | Una estancia especial comienza aquí",
  description:
    "Descubre Bookify: una experiencia de hospitalidad diseñada para conocer tu alojamiento con claridad y preparar tu estancia.",
  robots: {
    index: false,
    follow: false,
  },
};

/*
 * BOOKIFY — HOME EDITORIAL P1
 *
 * M26.2: actualización del estado del recorrido.
 *
 * Las imágenes son referencias editoriales.
 * No representan propiedades reales del backend.
 *
 * No se muestran precios, disponibilidad,
 * destinos ni reservas ficticias.
 */

export default function HomePage() {
  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      {/* HERO EDITORIAL */}

      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.heroVisual}>
          <Image
            src="/images/demo/home-hero.jpg"
            alt="Dormitorio luminoso de tonos cálidos, utilizado como referencia editorial"
            fill
            preload
            sizes="(max-width: 940px) 100vw, 68vw"
            className={styles.heroImage}
          />

          <span className={styles.heroImageLabel}>Fotografía ilustrativa</span>
        </div>

        <ContentContainer className={styles.heroContainer}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>BOOKIFY · HOSPITALIDAD</p>

            <h1 id="home-hero-title" className={styles.heroTitle}>
              Una estancia especial comienza mucho antes de llegar.
            </h1>

            <p className={styles.heroDescription}>
              Estamos creando una forma más sencilla y cercana de conocer tu
              alojamiento y preparar cada momento de tu estancia.
            </p>

            <div className={styles.heroActions}>
              <ButtonLink href="#experiencia">
                Conocer la experiencia
              </ButtonLink>
            </div>

            <p className={styles.heroFootnote}>
              Una experiencia en construcción, pensada para recibirte mejor.
            </p>
          </div>
        </ContentContainer>
      </section>

      {/* EXPERIENCIA EDITORIAL */}

      <section
        id="experiencia"
        className={styles.experience}
        aria-labelledby="experience-title"
      >
        <ContentContainer>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionHeadingCopy}>
              <p className={styles.eyebrow}>EL VALOR DE CADA DETALLE</p>

              <h2 id="experience-title" className={styles.sectionTitle}>
                Espacios que inspiran.
                <br />
                Experiencias que permanecen.
              </h2>
            </div>

            <p className={styles.sectionDescription}>
              La hospitalidad comienza con la información adecuada, presentada
              de manera sencilla, cálida y clara.
            </p>
          </div>

          <div className={styles.gallery}>
            <figure className={styles.galleryCard}>
              <div className={styles.galleryImageFrame}>
                <Image
                  src="/images/demo/home-room.jpg"
                  alt="Habitación de madera con luz natural y vistas al exterior"
                  fill
                  sizes="(max-width: 767px) 100vw, 56vw"
                  className={styles.galleryImage}
                />
              </div>

              <figcaption className={styles.galleryCaption}>
                <span>El placer de sentirte cómodo</span>
                <small>Fotografía ilustrativa</small>
              </figcaption>
            </figure>

            <figure className={styles.galleryCard}>
              <div className={styles.galleryImageFrame}>
                <Image
                  src="/images/demo/home-terrace.jpg"
                  alt="Terraza al aire libre con una mesa y vistas al entorno natural"
                  fill
                  sizes="(max-width: 767px) 100vw, 38vw"
                  className={styles.galleryImage}
                />
              </div>

              <figcaption className={styles.galleryCaption}>
                <span>Momentos para disfrutar</span>
                <small>Fotografía ilustrativa</small>
              </figcaption>
            </figure>
          </div>

          <p className={styles.photoDisclaimer}>
            Las imágenes son referencias visuales de hospitalidad. No
            representan alojamientos disponibles en Bookify.
          </p>
        </ContentContainer>
      </section>

      {/* FUNCIONALIDAD REAL Y PRÓXIMOS PASOS */}

      <section
        id="como-funciona"
        className={styles.journey}
        aria-labelledby="journey-title"
      >
        <ContentContainer>
          <div className={styles.journeyHeader}>
            <p className={styles.eyebrow}>TU ESTANCIA, PASO A PASO</p>

            <h2 id="journey-title" className={styles.sectionTitle}>
              Cada paso merece sentirse sencillo.
            </h2>

            <p className={styles.sectionDescription}>
              Bookify está evolucionando hacia una experiencia de reserva
              completa, con información clara desde el inicio.
            </p>
          </div>

          <ol className={styles.journeySteps}>
            <li className={styles.journeyStep}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber} aria-hidden="true">
                  01
                </span>

                <span className={styles.stepStatusReady}>Disponible</span>
              </div>

              <h3>Conoce tu alojamiento</h3>

              <p>
                Desde su enlace directo, consulta el nombre, los horarios de
                entrada y salida y la zona horaria.
              </p>
            </li>

            <li className={styles.journeyStep}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber} aria-hidden="true">
                  02
                </span>

                {/* M26.2 — La selección deja de ser pendiente. */}
                <span className={styles.stepStatusReady}>Disponible</span>
              </div>

              <h3>Elige tu estancia</h3>

              <p>
                En la página de una propiedad activa, selecciona fechas, calcula
                las noches e indica cuántos huéspedes viajarán.
              </p>
            </li>

            <li className={styles.journeyStep}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber} aria-hidden="true">
                  03
                </span>

                <span className={styles.stepStatusUpcoming}>En desarrollo</span>
              </div>

              <h3>Consulta tus opciones</h3>

              <p>
                La disponibilidad y las cotizaciones se incorporarán conforme
                avancemos en el flujo de reservas.
              </p>
            </li>
          </ol>

          <div className={styles.journeyNote}>
            <p>
              <strong>¿Ya recibiste el enlace de un alojamiento?</strong> Puedes
              abrirlo directamente, conocer su información y elegir fechas y
              huéspedes. La consulta de disponibilidad y la reserva en línea
              todavía no están habilitadas desde este recorrido.
            </p>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
