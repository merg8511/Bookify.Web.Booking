import Link from "next/link";

import { BookifyLogo } from "@/components/brand/bookify-logo";
import { ContentContainer } from "@/components/ui/content-container";

import styles from "./public-footer.module.css";

/*
 * BOOKIFY — PUBLIC FOOTER
 *
 * Solo rutas existentes.
 * Horizon aprobado, sin reconstruir wordmark.
 */
export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <ContentContainer>
        <div className={styles.content}>
          <div className={styles.identity}>
            <BookifyLogo context="public" href="/" className={styles.logo} />

            <p>Una experiencia pensada para recibirte mejor.</p>
          </div>

          <nav
            aria-label="Navegación del pie de página"
            className={styles.links}
          >
            <Link href="/">Inicio</Link>
            <Link href="/login">Acceso del equipo</Link>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© Bookify</span>

          <span>Identidad Editorial Hospitality</span>
        </div>
      </ContentContainer>
    </footer>
  );
}
