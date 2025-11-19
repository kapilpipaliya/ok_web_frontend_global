import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { getCookiesForRequest, syncCookiesFromResponse } from "./capacitorCookieSync";

/**
 * Common function to make GET requests to a specified URL.
 * @param {string} url - The URL to which the GET request is sent.
 * @returns {Promise<any>} - The promise that resolves to the response data.
 */
export async function getAPI(url: string): Promise<Record<string, unknown>> {
  // Get cookies for the request (handles both web and Capacitor)
  const cookies = await getCookiesForRequest(url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(cookies && { "Cookie": cookies }),
    },
    method: "GET",
  });

  // Sync response cookies to Capacitor storage
  await syncCookiesFromResponse(response, url);

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    // Attempt to parse error message from JSON or default to status text
    const errorMessage = contentType?.includes("application/json")
      ? getErrorMessage(await response.json())
      : contentType?.includes("text/plain")
        ? await response.text()
        : response.statusText;

    // Throw an error with status code and message
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  if (responseData.error) {
    throw new Error(responseData.error);
  }

  return responseData;
}
