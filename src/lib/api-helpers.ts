import { AxiosError } from "axios";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types";

/**
 * The NestJS backend wraps every successful response in an envelope:
 *   { success, statusCode, message, data, timestamp }
 *
 * `unwrap` pulls the `data` field out of an Axios response body so the rest of
 * the app can work with plain payloads.
 */
export function unwrap<T>(body: ApiEnvelope<T>): T {
  return body.data;
}

/**
 * Turns any thrown error (Axios or otherwise) into a human-friendly string.
 * The backend's error envelope looks like:
 *   { success:false, statusCode, message, details?, path, timestamp }
 * For validation failures `details` is an array of field messages.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorEnvelope | undefined;

    if (data) {
      if (Array.isArray(data.details) && data.details.length > 0) {
        return String(data.details[0]);
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
    }
    // Network / CORS / server-down — client.ts sets a friendly message here.
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
