import { postAPI } from "../api/postApi";

interface ErrorLogData {
  message: string;
  stack?: string;
  location?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Logs an error to the server for tracking and analysis
 * @param {Error | string} error - The error object or error message
 * @param {object} additionalData - Optional additional context data
 */
export async function logError(
  error: Error | string,
  additionalData?: Record<string, unknown>
): Promise<void> {
  try {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorData: ErrorLogData = {
      message: errorMessage,
      stack: errorStack,
      location: window.location.href,
      additionalData
    };

    await postAPI("/api/error/logError", errorData);
  } catch (loggingError) {
    // Silently fail if error logging itself fails
    console.error("Failed to log error:", loggingError);
  }
} 