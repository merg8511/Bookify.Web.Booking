import { IconShieldLock } from "@tabler/icons-react";

import { BookifyLogo } from "@/components/brand/bookify-logo";
import { ButtonLink } from "@/components/ui/button";

import styles from "./page.module.css";

/*
 * BOOKIFY — ACCESS DENIED 04.2
 *
 * Concierge Admin A2.
 * FEEDBACK-002: Operational Feedback.
 *
 * Esta pantalla es exclusivamente
 * presentacional.
 *
 * La autorización continúa en
 * requireAdminSession().
 */

export default function AccessDeniedPage() {
  return (
    <main className={styles.screen}>
      <div className={styles.frame}>
        {/* IDENTIDAD INSTITUCIONAL */}

        <div className={styles.brandPanel}>
          <div className={styles.brandHeader}>
            <BookifyLogo context="admin" inverted className={styles.logo} />

            <p className={styles.brandCaption}>BOOKIFY · ADMINISTRACIÓN</p>
          </div>

          <div className={styles.brandContent}>
            <p className={styles.brandEyebrow}>ESPACIO DE TRABAJO</p>

            <p className={styles.brandTitle}>
              Un espacio de trabajo protegido.
            </p>

            <p className={styles.brandDescription}>
              Cada área de Bookify cuenta con controles de acceso para mantener
              una operación organizada y segura.
            </p>
          </div>
        </div>

        {/* ESTADO DE ACCESO */}

        <section
          className={styles.contentPanel}
          aria-labelledby="access-denied-title"
        >
          <div className={styles.content}>
            <div className={styles.statusIcon} aria-hidden="true">
              <IconShieldLock size={26} stroke={1.7} />
            </div>

            <p className={styles.eyebrow}>ACCESO RESTRINGIDO</p>

            <h1 id="access-denied-title" className={styles.title}>
              No tienes acceso a esta sección
            </h1>

            <p className={styles.description}>
              No podemos habilitar este espacio con los permisos de la sesión
              actual. Puedes revisar tu sesión o regresar al inicio de Bookify.
            </p>

            <div className={styles.actions}>
              <ButtonLink href="/account" className={styles.actionLink}>
                Volver a mi sesión
              </ButtonLink>

              <ButtonLink
                href="/"
                variant="secondary"
                className={styles.actionLink}
              >
                Ir al inicio
              </ButtonLink>
            </div>

            <p className={styles.supportNote}>
              Si consideras que deberías tener acceso, consulta con quien
              administra tu cuenta.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
