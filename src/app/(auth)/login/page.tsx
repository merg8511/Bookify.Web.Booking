import Link from "next/link";

import {
  IconArrowLeft,
  IconArrowRight,
  IconShieldLock,
} from "@tabler/icons-react";

import { BookifyLogo } from "@/components/brand/bookify-logo";
import { Button } from "@/components/ui/button";
import { signInWithBookify } from "@/lib/auth/actions";

import styles from "./login.module.css";

/*
 * BOOKIFY — LOGIN ADMINISTRATIVO 04.1
 *
 * Concierge Admin A2 + Horizon L2.3.
 *
 * Pantalla puente de identidad OIDC.
 *
 * La autenticación de credenciales
 * permanece exclusivamente en Keycloak.
 *
 * No modificar el flujo de Auth.js.
 */

export default function LoginPage() {
  return (
    <main className={styles.screen}>
      <div className={styles.frame}>
        {/* PANEL INSTITUCIONAL */}

        <div className={styles.brandPanel}>
          <div className={styles.brandHeader}>
            {/*
             * Marca estática: no utilizar href aquí.
             * Así el botón OIDC sigue siendo
             * el primer control enfocable.
             */}
            <BookifyLogo context="admin" inverted className={styles.logo} />

            <p className={styles.brandCaption}>CONCIERGE ADMINISTRATION</p>
          </div>

          <div className={styles.brandContent}>
            <p className={styles.brandEyebrow}>ESPACIO DE TRABAJO</p>

            <h2 className={styles.brandTitle}>
              Un solo lugar para tus reservas.
            </h2>

            <p className={styles.brandDescription}>
              Una experiencia de administración diseñada para trabajar con
              claridad y mantener el control de cada estancia.
            </p>
          </div>

          <p className={styles.brandFooter}>BOOKIFY · ACCESO ADMINISTRATIVO</p>
        </div>

        {/* PANEL DE ACCESO */}

        <section className={styles.accessPanel} aria-labelledby="login-title">
          <div className={styles.accessContent}>
            <div className={styles.accessIntro}>
              <span className={styles.accessEyebrow}>ACCESO A BOOKIFY</span>

              <h1 id="login-title" className={styles.title}>
                Iniciar sesión
              </h1>

              <p className={styles.description}>
                Continúa con nuestro proveedor de identidad para acceder de
                forma autorizada a tu espacio de trabajo.
              </p>
            </div>

            <form action={signInWithBookify} className={styles.actionForm}>
              <Button type="submit" className={styles.primaryButton}>
                Continuar con identidad
                <IconArrowRight size={19} stroke={1.8} aria-hidden="true" />
              </Button>
            </form>

            <div className={styles.securityNote}>
              <IconShieldLock size={20} stroke={1.8} aria-hidden="true" />

              <p>
                Tu contraseña se introduce directamente en el proveedor de
                identidad, no en Bookify.
              </p>
            </div>

            <Link href="/" className={styles.backLink}>
              <IconArrowLeft size={18} stroke={1.8} aria-hidden="true" />
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
