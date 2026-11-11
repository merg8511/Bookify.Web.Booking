import Link from "next/link";

import { ContentContainer } from "@/components/ui/content-container";

import styles from "./page.module.css";

/*
 * MÓDULO 26.1 — PROPERTY NOT FOUND
 */

export default function PropertyNotFound() {
  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.errorContent}>
          <p className={styles.eyebrow}>Alojamiento no encontrado</p>

          <h1 className={styles.title}>No encontramos esta propiedad.</h1>

          <p className={styles.description}>
            Comprueba que el enlace del alojamiento sea correcto.
          </p>

          <Link href="/" className={styles.retryLink}>
            Volver al inicio
          </Link>
        </div>
      </ContentContainer>
    </main>
  );
}
