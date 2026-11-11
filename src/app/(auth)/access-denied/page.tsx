import { ButtonLink } from "@/components/ui/button";

import { ContentContainer } from "@/components/ui/content-container";

import { StatusBadge } from "@/components/ui/status-badge";

import { Surface } from "@/components/ui/surface";

import styles from "../auth.module.css";

/*
 * MÓDULO 25.5 — ACCESS DENIED
 *
 * No mostramos información de propiedades
 * ni operaciones administrativas.
 */
export default function AccessDeniedPage() {
  return (
    <main className={styles.screen}>
      <ContentContainer>
        <Surface className={styles.panel}>
          <p className={styles.eyebrow}>Bookify / Acceso</p>

          <StatusBadge tone="destructive">Acceso restringido</StatusBadge>

          <h1 className={styles.title}>No tienes acceso a esta sección</h1>

          <p className={styles.description}>
            Tu cuenta no cuenta con los permisos necesarios para acceder al área
            administrativa.
          </p>

          <div className={styles.actions}>
            <ButtonLink href="/account">Volver a mi sesión</ButtonLink>

            <ButtonLink href="/" variant="secondary">
              Ir al inicio
            </ButtonLink>
          </div>
        </Surface>
      </ContentContainer>
    </main>
  );
}
