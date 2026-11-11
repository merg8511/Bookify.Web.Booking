import type { BookifyApiError } from "@/lib/api/errors/bookify-api-error";
import styles from "./api-error-notice.module.css";

type ApiErrorNoticeProps = {
  error: BookifyApiError;
  className?: string;
};

export function ApiErrorNotice({ error, className = "" }: ApiErrorNoticeProps) {
  const isRateLimited = error.status === 429;

  const classes = [
    styles.notice,
    isRateLimited ? styles.warning : styles.destructive,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} role="alert">
      <div className={styles.content}>
        <h2 className={styles.title}>{error.title}</h2>

        <p className={styles.detail}>{error.detail}</p>

        {isRateLimited && error.retryAfterSeconds !== null && (
          <p className={styles.retryAfter}>
            Tiempo indicado antes de reintentar:{" "}
            <strong>{error.retryAfterSeconds} segundos</strong>
          </p>
        )}

        {(error.code || error.traceId) && (
          <div className={styles.diagnostics}>
            {error.code && (
              <p>
                Codigo: <code>{error.code}</code>
              </p>
            )}

            {error.traceId && (
              <p>
                Referencia de soporte: <code>{error.traceId}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
