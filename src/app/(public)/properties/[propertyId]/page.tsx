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

// M26.2 — Selección de fechas y huéspedes.
import { StaySelectionForm } from "@/features/booking/stay-selection/stay-selection-form";

import { getTodayInPropertyTimeZone } from "@/features/booking/stay-selection/stay-dates";

import styles from "./page.module.css";

/*
 * BOOKIFY — PROPERTY EDITORIAL P1
 *
 * M26.1: contexto real de Property.
 * M26.2: selección de fechas y huéspedes.
 *
 * DS-001: Editorial Hospitality.
 * GEOM-001: Editorial Airy.
 * RESP-001: Editorial Continuity.
 *
 * No consulta disponibilidad ni precios.
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
    value.toLowerCase() !== "00000000-0000-0000-0000-000000000000"
  );
}

function formatTime(value: string): string {
  return /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value;
}

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
            <p className={styles.eyebrow}>
              INFORMACIÓN TEMPORALMENTE NO DISPONIBLE
            </p>

            <h1 className={styles.feedbackTitle}>
              No pudimos mostrar este alojamiento.
            </h1>

            <ApiErrorNotice error={result.error} />

            <div className={styles.feedbackActions}>
              {result.error.status !== 429 && (
                <a
                  href={`/properties/${propertyId}`}
                  className={styles.retryLink}
                >
                  Intentar nuevamente
                </a>
              )}

              <ButtonLink href="/" variant="secondary">
                Volver al inicio
              </ButtonLink>
            </div>
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
            <p className={styles.eyebrow}>INFORMACIÓN INCOMPLETA</p>

            <h1 className={styles.feedbackTitle}>
              No pudimos mostrar este alojamiento.
            </h1>

            <p className={styles.feedbackDescription} role="alert">
              La consulta no devolvió la información necesaria para presentar
              esta propiedad. Puedes intentar cargarla nuevamente.
            </p>

            <div className={styles.feedbackActions}>
              <a
                href={`/properties/${propertyId}`}
                className={styles.retryLink}
              >
                Intentar nuevamente
              </a>

              <ButtonLink href="/" variant="secondary">
                Volver al inicio
              </ButtonLink>
            </div>
          </div>
        </ContentContainer>
      </main>
    );
  }

  return (
    <main id="contenido-principal" tabIndex={-1} className={styles.page}>
      <ContentContainer>
        <div className={styles.content}>
          {/* NAVEGACIÓN CONTEXTUAL — M26.1 */}

          <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>

            <span aria-hidden="true" className={styles.breadcrumbSeparator}>
              /
            </span>

            <span aria-current="page">Alojamiento</span>
          </nav>

          {/* HERO EDITORIAL — M26.1 */}

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
                    ? "El registro de esta propiedad está activo. La disponibilidad se consulta por separado."
                    : "Esta propiedad figura como inactiva. No se muestran opciones para reservar."}
                </p>
              </div>
            </header>

            {/* Recurso ilustrativo, NO media de Property */}

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

          {/* DATOS REALES DEL BACKEND — M26.1 */}

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

          {/*
           * M26.2 — NUEVA SECCIÓN FUNCIONAL.
           *
           * La propiedad activa permite seleccionar
           * criterios, no confirmar disponibilidad.
           *
           * La propiedad inactiva NO muestra el
           * formulario de reserva.
           */}

          <section
            className={styles.nextStep}
            aria-labelledby="next-step-title"
          >
            <div className={styles.nextStepContent}>
              <p className={styles.eyebrow}>TU ESTANCIA, PASO A PASO</p>

              <h2 id="next-step-title" className={styles.nextStepTitle}>
                {property.isActive
                  ? "Tu estancia comienza con una buena elección."
                  : "Este alojamiento no recibe nuevas reservas."}
              </h2>

              <p className={styles.nextStepDescription}>
                {property.isActive
                  ? "Elige tus fechas y la cantidad de huéspedes. Podrás revisar los criterios antes de consultar opciones reales."
                  : "Puedes consultar la información del alojamiento, pero la selección de una nueva estancia no está habilitada."}
              </p>
            </div>

            <div className={styles.nextStepAction}>
              <ButtonLink href="/" variant="secondary">
                Volver al inicio
              </ButtonLink>
            </div>
          </section>

          {property.isActive && (
            <StaySelectionForm
              todayInPropertyTimeZone={getTodayInPropertyTimeZone(
                property.timeZoneId,
              )}
            />
          )}
        </div>
      </ContentContainer>
    </main>
  );
}
