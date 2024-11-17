import { useToast } from "~/components/styled/Toast";

/**
 * Common function to make GET requests to a specified URL.
 * @param {string} url - The URL to which the GET request is sent.
 * @returns {Promise<any>} - The promise that resolves to the response data.
 */
export async function getAPI(url: string): Promise<{ [key: string]: any }> {
  const { showErrorToast } = useToast();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    // Attempt to parse error message from JSON or default to status text
    const errorMessage = contentType?.includes("application/json")
      ? (await response.json()).error
      : contentType?.includes("text/plain")
        ? await response.text()
        : response.statusText;

    // Throw an error with status code and message
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  if (responseData.error) {
    showErrorToast(responseData.error);
    throw new Error(responseData.error);
  }

  return responseData;
}
