import { Button, ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { Surface } from "@/components/ui/surface";
import { signInWithBookify } from "@/lib/auth/actions";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <main className={styles.screen}>
      <ContentContainer>
        <Surface className={styles.panel}>
          <p className={styles.eyebrow}>Bookify / Acceso</p>

          <h1 className={styles.title}>Iniciar sesión</h1>

          <p className={styles.description}>
            Accede mediante el proveedor de identidad configurado para Bookify.
          </p>

          <form action={signInWithBookify} className={styles.actionForm}>
            <Button type="submit">Continuar con identidad</Button>
          </form>

          <div className={styles.actions}>
            <ButtonLink href="/" variant="secondary">
              Volver al inicio
            </ButtonLink>
          </div>

          <p className={styles.note}>
            Bookify no almacena contraseñas de los usuarios.
          </p>
        </Surface>
      </ContentContainer>
    </main>
  );
}
