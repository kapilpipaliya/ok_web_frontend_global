import { logError } from "./errorLogger";

/**
 * Sets up global error handlers for unhandled exceptions and promise rejections
 */
export function setupGlobalErrorHandlers(): void {
  // Handle synchronous errors
  window.addEventListener("error", (event) => {
    logError(event.error || new Error(event.message), {
      type: "unhandled_error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logError(error, { type: "unhandled_promise_rejection" });
  });
} 