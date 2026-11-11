import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Surface } from "@/components/ui/surface";

import { signOutOfBookify } from "@/lib/auth/actions";
import { requireAdminSession } from "@/lib/auth/session";

import styles from "./page.module.css";

/*
 * BOOKIFY — ADMIN ROOT PAGE
 *
 * Se mantiene el guard original.
 * No hay dashboard operativo todavía:
 * sus funciones pertenecen al Módulo 27.
 */
export default async function AdminPage() {
  const session = await requireAdminSession();

  return (
    <section aria-labelledby="admin-page-title" className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>BOOKIFY / ADMINISTRACIÓN</p>

        <StatusBadge tone="success">Acceso autorizado</StatusBadge>

        <h1 id="admin-page-title" className={styles.title}>
          Área administrativa protegida
        </h1>

        <p className={styles.description}>
          Tu sesión tiene un rol de administración reconocido por Bookify.
        </p>
      </header>

      <Surface className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Tu sesión administrativa</h2>

          <p>
            Información de la identidad autenticada y sus roles reconocidos.
          </p>
        </div>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>Identidad</dt>
            <dd>{session.user.subject}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Roles</dt>
            <dd>{session.user.roles.join(", ")}</dd>
          </div>
        </dl>

        <p className={styles.note}>
          Las funcionalidades del panel se incorporarán en el Módulo 27. Los
          accesos a recursos específicos seguirán sujetos a la autorización del
          backend.
        </p>

        <form action={signOutOfBookify} className={styles.actionForm}>
          <Button type="submit" variant="secondary">
            Cerrar sesión
          </Button>
        </form>
      </Surface>
    </section>
  );
}
