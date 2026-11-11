import { ContentContainer } from "@/components/ui/content-container";

import styles from "./page.module.css";

/*
 * MÓDULO 26.1 — LOADING
 *
 * FEEDBACK-001: Calm & Contextual.
 */

export default function PropertyLoading() {
  return (
    <main className={styles.page}>
      <ContentContainer>
        <div
          aria-busy="true"
          aria-live="polite"
          className={styles.errorContent}
        >
          <p>Cargando información del alojamiento…</p>
        </div>
      </ContentContainer>
    </main>
  );
}
