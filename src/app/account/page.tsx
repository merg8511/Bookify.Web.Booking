import { Button, ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { Surface } from "@/components/ui/surface";
import { signOutOfBookify } from "@/lib/auth/actions";
import { canAccessAdministration } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/session";
import styles from "@/app/(auth)/auth.module.css";

export default async function AccountPage() {
  const session = await requireSession();
  const canAccessAdmin = canAccessAdministration(session.user.roles);
  const rolesDescription =
    session.user.roles.length > 0
      ? session.user.roles.join(", ")
      : "Sin roles Bookify asignados";

  return (
    <main className={styles.screen}>
      <ContentContainer>
        <Surface className={styles.panel}>
          <p className={styles.eyebrow}>Bookify / Sessión</p>

          <StatusBadge tone="success">Sesión activa</StatusBadge>

          <h1 className={styles.title}>Acceso confirmado</h1>

          <p className={styles.description}>
            La identidad fue autenticada y el token destinado a Bookify superó
            la validación del frontend.
          </p>

          <dl className={styles.details}>
            <dt>Identidad</dt>
            <dd>{session.user.subject}</dd>

            <dt>Roles conocidos</dt>
            <dd>{rolesDescription}</dd>
          </dl>

          <div className={styles.actions}>
            {canAccessAdmin && (
              <ButtonLink href="/admin">Ir a administración</ButtonLink>
            )}

            <form action={signOutOfBookify} className={styles.actionForm}>
              <Button type="submit" variant="secondary">
                Cerrar sesión
              </Button>
            </form>

            <ButtonLink href="/" variant="secondary">
              Inicio
            </ButtonLink>
          </div>

          <p className={styles.note}>
            Los permisos sobre propiedades, reservas y pagos se comprueban
            individualmente en el backend.
          </p>
        </Surface>
      </ContentContainer>
    </main>
  );
}
