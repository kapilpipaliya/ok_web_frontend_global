/**
 * Common function to make POST requests to a specified URL with given data.
 * @param {string} url - The URL to which the POST request is sent.
 * @param {object} data - The payload for the POST request.
 * @returns {Promise<any>} - The promise that resolves to the response data.
 */
export async function postAPI(
  url: string,
  data: object,
): Promise<{ [key: string]: any }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
    throw new Error(responseData.error);
  }

  return responseData;
}

export default postAPI;
