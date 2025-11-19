import { getErrorMessage } from "./getErrorMessage";
import { isValidResponse } from "./isValidResponse";
import { getCookiesForRequest, syncCookiesFromResponse } from "./capacitorCookieSync";

// must use this function in try catch block
export async function postAPI(
  url: string,
  data: object,
  action: "DELETE" | "POST" = "POST",
): Promise<Record<string, unknown>> {
  // Get cookies for the request (handles both web and Capacitor)
  const cookies = await getCookiesForRequest(url);

  const response = await fetch(url, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(cookies && { "Cookie": cookies }),
    },
    method: action,
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
  if (!isValidResponse(responseData)) {
    throw new Error(getErrorMessage(responseData));
  }

  return responseData;
}
