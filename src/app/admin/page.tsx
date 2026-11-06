import { Button, ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { Surface } from "@/components/ui/surface";
import { signOutOfBookify } from "@/lib/auth/actions";
import { requireAdminSession } from "@/lib/auth/session";
import styles from "@/app/(auth)/auth.module.css";

export default async function AdminPage() {
  const session = await requireAdminSession();

  return (
    <main className={styles.screen}>
      <ContentContainer>
        <Surface className={styles.panel}>
          <p className={styles.eyebrow}>Bookify / Administración</p>

          <StatusBadge tone="success">Acceso autorizado</StatusBadge>

          <h1 className={styles.title}>Área administrativa protegida.</h1>

          <p className={styles.description}>
            Tu sesión tiene un rol de administración reconocido por Bookify.
          </p>

          <dl className={styles.details}>
            <dt>Identidad</dt>
            <dd>{session.user.subject}</dd>

            <dt>Roles</dt>
            <dd>{session.user.roles.join(", ")}</dd>
          </dl>

          <p className={styles.note}>
            El panel funcional se construirá en el Módulo 27. Lo accesos a
            recursos específicos continuarán sujetos a autorización del backend.
          </p>

          <div className={styles.actions}>
            <ButtonLink href="/account" variant="secondary">
              Mi sesión
            </ButtonLink>

            <form action={signOutOfBookify} className={styles.actionForm}>
              <Button type="submit" variant="secondary">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </Surface>
      </ContentContainer>
    </main>
  );
}
