import { ContentContainer } from "@/components/ui/content-container";

import styles from "./page.module.css";

/*
 * BOOKIFY — PROPERTY LOADING
 *
 * FEEDBACK-001: Calm & Contextual.
 * Skeleton estático y discreto.
 *
 * No representa información real hasta
 * que la API devuelve la Property.
 */

export default function PropertyLoading() {
  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.loadingContent}>
          <p role="status" aria-live="polite" className={styles.visuallyHidden}>
            Cargando información del alojamiento…
          </p>

          <div className={styles.loadingLayout} aria-hidden="true">
            {/* Breadcrumb */}

            <div className={`${styles.skeleton} ${styles.loadingBreadcrumb}`} />

            {/* Hero */}

            <div className={styles.loadingHero}>
              <div className={styles.loadingCopy}>
                <div
                  className={`${styles.skeleton} ${styles.loadingEyebrow}`}
                />

                <div className={`${styles.skeleton} ${styles.loadingTitle}`} />

                <div
                  className={`${styles.skeleton} ${styles.loadingTitleShort}`}
                />

                <div className={`${styles.skeleton} ${styles.loadingText}`} />

                <div
                  className={`${styles.skeleton} ${styles.loadingTextShort}`}
                />

                <div className={`${styles.skeleton} ${styles.loadingBadge}`} />
              </div>

              <div className={`${styles.skeleton} ${styles.loadingMedia}`} />
            </div>

            {/* Información operativa */}

            <div className={styles.loadingInformation}>
              <div
                className={`${styles.skeleton} ${styles.loadingSectionTitle}`}
              />

              <div className={styles.loadingDetails}>
                {[0, 1, 2].map((index) => (
                  <div key={index} className={styles.loadingDetail}>
                    <div
                      className={`${styles.skeleton} ${styles.loadingDetailLabel}`}
                    />

                    <div
                      className={`${styles.skeleton} ${styles.loadingDetailValue}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
    </main>
  );
}
