import type { BookifyApiResult } from "./bookify-api-error";
import {
  normalizeHttpError,
  normalizeThrownError,
} from "./normalize-api-error";

type ApiFetchOutcome<TData> = {
  data?: TData;
  error?: unknown;
  response: Response;
};

export async function executeBookifyRequest<TData>(
  request: () => Promise<ApiFetchOutcome<TData>>,
): Promise<BookifyApiResult<TData>> {
  try {
    const result = await request();

    if (result.response.ok) {
      return {
        ok: true,
        status: result.response.status,
        data: result.data,
        response: result.response,
      };
    }

    return {
      ok: false,
      error: normalizeHttpError(result.error, result.response),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: normalizeThrownError(error),
    };
  }
}
