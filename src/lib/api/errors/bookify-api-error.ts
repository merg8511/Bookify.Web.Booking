export type BookifyApiErrorKind =
  | "problem"
  | "http"
  | "network"
  | "aborted"
  | "unexpected";

export type BookifyApiError = {
  kind: BookifyApiErrorKind;
  status: number | null;
  type: string | null;
  title: string;
  detail: string;
  instance: string | null;
  code: string | null;
  traceId: string | null;
  correlationId: string | null;
  retryAfterSeconds: number | null;
};

export type BookifyApiResult<TData> =
  | {
      ok: true;
      status: number;
      data: TData | undefined;
      response: Response;
    }
  | {
      ok: false;
      error: BookifyApiError;
    };
