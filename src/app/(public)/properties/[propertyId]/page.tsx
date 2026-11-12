import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiErrorNotice } from "@/components/ui/api-error-notice";

import { getPublicProperty } from "@/features/property/get-public-property";
import { PROPERTY_EDITORIAL_MEDIA } from "@/features/property/property-media";

import styles from "./page.module.css";

/*
 * BOOKIFY — PROPERTY EDITORIAL P1
 *
 * M26.1: contexto real de Property.
 * DS-001: Editorial Hospitality.
 * GEOM-001: Editorial Airy.
 * RESP-001: Editorial Continuity.
 *
 * No incluye fechas, unidades, cotizaciones
 * ni operaciones de reserva.
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
 * Conservamos la política noindex actual.
 * No se genera metadata con información
 * comercial que el backend no proporciona.
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

  // No consultar el backend con un UUID inválido.
  if (!isValidPropertyId(propertyId)) {
    notFound();
  }

  const result = await getPublicProperty(propertyId);

  /*
   * Mantener el contrato de errores existente.
   *
   * 404: página de no encontrado.
   * 429: aviso contextual con Retry-After;
   *      sin ofrecer reintento inmediato.
   * Otros: aviso y reintento de lectura GET.
   */
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
          <div className={styles.errorContent}>
            <p role="alert">
              No fue posible obtener la información del alojamiento.
            </p>
          </div>
        </ContentContainer>
      </main>
    );
  }

  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.content}>
          {/* NAVEGACIÓN CONTEXTUAL */}

          <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>

            <span aria-hidden="true" className={styles.breadcrumbSeparator}>
              /
            </span>

            <span aria-current="page">Alojamiento</span>
          </nav>

          {/* HERO EDITORIAL */}

          <section className={styles.hero} aria-labelledby="property-title">
            <header className={styles.heroCopy}>
              <p className={styles.eyebrow}>BOOKIFY / TU ALOJAMIENTO</p>

              <h1 id="property-title" className={styles.title}>
                {property.name}
              </h1>

              <p className={styles.description}>
                Conoce la información esencial de este alojamiento antes de
                planificar tu estancia.
              </p>

              <div className={styles.propertyStatus}>
                <StatusBadge tone={property.isActive ? "success" : "warning"}>
                  {property.isActive
                    ? "Propiedad activa"
                    : "Propiedad inactiva"}
                </StatusBadge>

                <p className={styles.statusExplanation}>
                  {property.isActive
                    ? "El registro de esta propiedad está activo. Su disponibilidad todavía no se consulta desde esta página."
                    : "Esta propiedad figura como inactiva. No se muestran opciones para reservar."}
                </p>
              </div>
            </header>

            {/* RECURSO EDITORIAL, NO MEDIA DE PROPERTY */}

            <figure className={styles.editorialFigure}>
              <div className={styles.editorialImageFrame}>
                <Image
                  src={PROPERTY_EDITORIAL_MEDIA.src}
                  alt={PROPERTY_EDITORIAL_MEDIA.alt}
                  fill
                  preload
                  sizes="(max-width: 900px) 100vw, 46vw"
                  className={styles.editorialImage}
                />
              </div>

              <figcaption className={styles.editorialCaption}>
                {PROPERTY_EDITORIAL_MEDIA.disclosure}
              </figcaption>
            </figure>
          </section>

          {/* DATOS REALES DEL BACKEND */}

          <section
            className={styles.section}
            aria-labelledby="property-information-title"
          >
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>ANTES DE LLEGAR</p>

              <h2 id="property-information-title">Horarios del alojamiento</h2>

              <p className={styles.sectionDescription}>
                Consulta las horas de entrada y salida, así como la zona horaria
                utilizada por este alojamiento.
              </p>
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

          {/* SIGUIENTE PASO: SIN CTA FICTICIO */}

          <section
            className={styles.nextStep}
            aria-labelledby="next-step-title"
          >
            <div className={styles.nextStepContent}>
              <p className={styles.eyebrow}>TU ESTANCIA, PASO A PASO</p>

              <h2 id="next-step-title" className={styles.nextStepTitle}>
                Estamos preparando los siguientes pasos.
              </h2>

              <p className={styles.nextStepDescription}>
                La selección de fechas, huéspedes y consulta de disponibilidad
                se incorporarán al flujo de reserva de Bookify. Por ahora, esta
                página presenta la información confirmada de la propiedad.
              </p>
            </div>

            <div className={styles.nextStepAction}>
              <ButtonLink href="/" variant="secondary">
                Volver al inicio
              </ButtonLink>
            </div>
          </section>
        </div>
      </ContentContainer>
    </main>
  );
}
