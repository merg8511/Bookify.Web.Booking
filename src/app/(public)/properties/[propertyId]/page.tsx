import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentContainer } from "@/components/ui/content-container";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiErrorNotice } from "@/components/ui/api-error-notice";
import { getPublicProperty } from "@/features/property/get-public-property";
import styles from "./page.module.css";

/*
 * MÓDULO 26.1 — PUBLIC PROPERTY PAGE
 *
 * Solo contexto de Property.
 * Sin disponibilidad, cotización o reservas.
 */
type PropertyPageProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

const PROPERTY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidPropertyId(value: string): boolean {
  return (
    PROPERTY_ID_PATTERN.test(value) &&
    value.toLocaleLowerCase() !== "00000000-0000-0000-0000-000000000000"
  );
}

function formatTime(value: string): string {
  return /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value;
}

/*
 * Metadatos de la propiedad real.
 *
 * Se mantiene noindex porque todavía no contamos
 * con suficiente contenido comercial público.
 */
export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { propertyId } = await params;

  if (!isValidPropertyId(propertyId)) {
    return {
      title: "Alojamiento no encontrado | Bookify",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const result = await getPublicProperty(propertyId);

  return {
    title:
      result.ok && result.data
        ? `${result.data.name} | Bookify`
        : "Alojamiento | Bookify",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { propertyId } = await params;

  if (!isValidPropertyId(propertyId)) {
    notFound();
  }

  const result = await getPublicProperty(propertyId);

  if (!result.ok) {
    if (result.error.status === 404) {
      notFound();
    }

    return (
      <main id="contenido-principal" tabIndex={-1} className={styles.page}>
        <ContentContainer>
          <div className={styles.errorContent}>
            <ApiErrorNotice error={result.error} />

            {result.error.status !== 429 && (
              <a
                href={`/properties/${propertyId}`}
                className={styles.retryLink}
              >
                Intentar nuevamente
              </a>
            )}
          </div>
        </ContentContainer>
      </main>
    );
  }

  const property = result.data;

  if (!property) {
    return (
      <main id="contenido-principal" tabIndex={-1} className={styles.page}>
        <ContentContainer>
          <p role="alert">
            No fue posible obtener la información del alojamiento.
          </p>
        </ContentContainer>
      </main>
    );
  }

  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.content}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Bookify / Tu alojamiento</p>

            <h1 className={styles.title}>{property.name}</h1>

            <p className={styles.description}>
              Conoce la información de tu alojamiento antes de elegir tu
              estancia.
            </p>

            <StatusBadge tone={property.isActive ? "success" : "warning"}>
              {property.isActive
                ? "Alojamiento activo"
                : "No disponible para nuevas reservas"}
            </StatusBadge>
          </header>

          <section
            aria-labelledby="property-information-title"
            className={styles.section}
          >
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Información de la estancia</p>

              <h2 id="property-information-title">Horarios del alojamiento</h2>
            </div>

            <Surface className={styles.detailsPanel}>
              <dl className={styles.details}>
                <div className={styles.detail}>
                  <dt>Check-in</dt>
                  <dd>{formatTime(property.checkInTime)}</dd>
                </div>

                <div className={styles.detail}>
                  <dt>Check-out</dt>
                  <dd>{formatTime(property.checkOutTime)}</dd>
                </div>

                <div className={styles.detail}>
                  <dt>Zona horaria</dt>
                  <dd className={styles.timeZoneId}>{property.timeZoneId}</dd>
                </div>
              </dl>
            </Surface>
          </section>

          {!property.isActive && (
            <p className={styles.inactiveNotice}>
              Este alojamiento no está habilitado para recibir nuevas reservas.
            </p>
          )}
        </div>
      </ContentContainer>
    </main>
  );
}
