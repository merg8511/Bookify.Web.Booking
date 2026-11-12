import { ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";

import styles from "./page.module.css";

/*
 * BOOKIFY — PROPERTY NOT FOUND
 *
 * FEEDBACK-001: Calm & Contextual.
 *
 * No mostrar imágenes ilustrativas
 * de un alojamiento inexistente.
 *
 * No confundir recurso inexistente
 * con ausencia de disponibilidad.
 */

export default function PropertyNotFound() {
  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <section
          className={styles.notFoundContent}
          aria-labelledby="property-not-found-title"
        >
          <p className={styles.eyebrow}>ALOJAMIENTO NO ENCONTRADO</p>

          <h1 id="property-not-found-title" className={styles.title}>
            No encontramos esta propiedad.
          </h1>

          <p className={styles.notFoundDescription}>
            Comprueba que el enlace del alojamiento sea correcto. Si lo
            recibiste de otra persona, puedes solicitar que te lo comparta
            nuevamente.
          </p>

          <div className={styles.notFoundActions}>
            <ButtonLink href="/" variant="secondary">
              Volver al inicio
            </ButtonLink>
          </div>
        </section>
      </ContentContainer>
    </main>
  );
}
