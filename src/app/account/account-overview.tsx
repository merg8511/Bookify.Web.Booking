import {
  IconArrowRight,
  IconLogout,
  IconShieldCheck,
  IconUserCircle,
} from "@tabler/icons-react";

import { BookifyLogo } from "@/components/brand/bookify-logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { StatusBadge } from "@/components/ui/status-badge";

import { canAccessAdministration, type BookifyRole } from "@/lib/auth/roles";

import styles from "./page.module.css";

type AccountOverviewProps = {
  subject: string;
  roles: readonly BookifyRole[];
  signOutAction: () => Promise<void>;
};

/*
 * BOOKIFY — ACCOUNT OVERVIEW 04.3
 *
 * DS-002: Concierge Admin A2.
 * COLOR-002: Ice & Navy.
 * TIP-002: Inter.
 * ICON-002: Tabler.
 *
 * Componente de presentación del servidor.
 *
 * No realiza solicitudes OIDC.
 * No expone access tokens.
 * No sustituye los guards de autorización.
 */

export function AccountOverview({
  subject,
  roles,
  signOutAction,
}: AccountOverviewProps) {
  const canAccessAdmin = canAccessAdministration(roles);

  const rolesDescription =
    roles.length > 0 ? roles.join(", ") : "Sin roles Bookify asignados";

  return (
    <div className={styles.screen}>
      <a href="#contenido-cuenta" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <main id="contenido-cuenta" tabIndex={-1} className={styles.main}>
        <ContentContainer className={styles.container}>
          {/* IDENTIDAD */}

          <header className={styles.topline}>
            <BookifyLogo context="admin" className={styles.logo} />

            <span className={styles.toplineLabel}>CENTRO DE CUENTA</span>
          </header>

          {/* PRESENTACIÓN */}

          <div className={styles.introduction}>
            <div className={styles.introCopy}>
              <p className={styles.eyebrow}>IDENTIDAD Y ACCESO</p>

              <h1 className={styles.title}>Mi cuenta</h1>

              <p className={styles.description}>
                Consulta la información de tu identidad y los roles reconocidos
                en tu sesión de Bookify.
              </p>
            </div>

            <StatusBadge tone="success">Sesión activa</StatusBadge>
          </div>

          {/* CONTENIDO */}

          <div className={styles.workspace}>
            {/* INFORMACIÓN REAL DE SESIÓN */}

            <section
              className={styles.identityPanel}
              aria-labelledby="identity-title"
            >
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon} aria-hidden="true">
                  <IconUserCircle size={22} stroke={1.8} />
                </span>

                <div>
                  <h2 id="identity-title">Información de sesión</h2>

                  <p>Datos reconocidos durante la autenticación.</p>
                </div>
              </div>

              <dl className={styles.details}>
                <div className={styles.detail}>
                  <dt>Identificador de identidad</dt>

                  <dd className={styles.subject}>{subject}</dd>
                </div>

                <div className={styles.detail}>
                  <dt>Roles reconocidos</dt>

                  <dd>{rolesDescription}</dd>
                </div>
              </dl>

              <p className={styles.identityNote}>
                Los permisos sobre propiedades, reservas y pagos se verifican
                individualmente en el backend.
              </p>
            </section>

            {/* ACCIONES SEGÚN ROL */}

            <section
              className={styles.actionsPanel}
              aria-labelledby="account-actions-title"
            >
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon} aria-hidden="true">
                  <IconShieldCheck size={22} stroke={1.8} />
                </span>

                <div>
                  <h2 id="account-actions-title">Accesos y sesión</h2>

                  <p>Opciones disponibles para tu cuenta.</p>
                </div>
              </div>

              <p className={styles.accessDescription}>
                {canAccessAdmin
                  ? "Tu sesión incluye un rol reconocido para acceder al área administrativa."
                  : "Tu sesión no incluye un rol habilitado para acceder al panel administrativo."}
              </p>

              <div className={styles.actions}>
                {canAccessAdmin && (
                  <ButtonLink href="/admin" className={styles.actionButton}>
                    <span>Ir a administración</span>

                    <IconArrowRight size={19} stroke={1.8} aria-hidden="true" />
                  </ButtonLink>
                )}

                <form action={signOutAction} className={styles.signOutForm}>
                  <Button
                    type="submit"
                    variant="secondary"
                    className={styles.actionButton}
                  >
                    <IconLogout size={19} stroke={1.8} aria-hidden="true" />
                    Cerrar sesión
                  </Button>
                </form>

                <ButtonLink
                  href="/"
                  variant="secondary"
                  className={styles.actionButton}
                >
                  Volver al inicio
                </ButtonLink>
              </div>

              <p className={styles.signOutNote}>
                Cerrar sesión finaliza tu sesión en Bookify. Si el proveedor de
                identidad mantiene una sesión SSO activa, podría reconocerte
                nuevamente al ingresar.
              </p>
            </section>
          </div>
        </ContentContainer>
      </main>
    </div>
  );
}
