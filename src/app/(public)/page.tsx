import { ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { Surface } from "@/components/ui/surface";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.content}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Bookify / Frontend</p>

            <StatusBadge tone="neutral">Arquitectura en desarrollo</StatusBadge>

            <h1 className={styles.title}>
              Una base sólida para una mejor experiencia de reservas.
            </h1>

            <p className={styles.description}>
              Estamos construyendo los fundamentos compartidos de Bookify, antes
              de incorporar los flujos públicos y administrativos.
            </p>

            <div className={styles.action}>
              <ButtonLink
                href="https://github.com/merg8511/Bookify.Services.Booking"
                variant="primary"
                external
              >
                Ver repositorio Backend
              </ButtonLink>
            </div>
          </header>

          <section
            className={styles.section}
            aria-labelledby="foundations-title"
          >
            <div className={styles.sectionHeader}>
              <h2 id="foundations-title">Fundamentos compartidos</h2>

              <p>
                La estructura se prepara para reutilizar criterios de diseño,
                accesibilidad y organización.
              </p>
            </div>

            <div className={styles.grid}>
              <Surface>
                <h3 className={styles.cardTitle}>Arquitectura</h3>

                <p className={styles.cardDescription}>
                  Rutas, funcionalidades y componentes con responsabilidades
                  diferenciadas.
                </p>
              </Surface>
              <Surface>
                <h3 className={styles.cardTitle}>Diseño consistente</h3>

                <p className={styles.cardDescription}>
                  Tokens semánticos y componentes reutilizables para ambas
                  experiencias.
                </p>
              </Surface>
              <Surface>
                <h3 className={styles.cardTitle}>Accesibilidad</h3>

                <p className={styles.cardDescription}>
                  Semántica clara, navegación por teclado y adaptación a
                  diferentes tamaños de pantalla.
                </p>
              </Surface>
            </div>
          </section>
          <p className={styles.note}>
            Esta página es una vista técnica provisional. Todavía no consulta
            datos del backend.
          </p>
        </div>
      </ContentContainer>
    </main>
  );
}
