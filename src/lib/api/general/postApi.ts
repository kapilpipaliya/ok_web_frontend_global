import { getErrorMessage } from "./getErrorMessage";
import { isValidResponse } from "./isValidResponse";
import {
  toUserFacingNetworkMessage,
  withTimeout,
} from "~/lib/api/withNetworkRetry";

// must use this function in try catch block
// Timeout + friendly network messages only — no auto-retry (mutations).
export async function postAPI(
  url: string,
  data: object | FormData,
  action: "DELETE" | "POST" | "PUT" = "POST",
): Promise<Record<string, unknown>> {
  try {
    return await withTimeout(async () => {
      const isFormData = data instanceof FormData;
      const response = await fetch(url, {
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            },
        method: action,
      });

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
    });
  } catch (error) {
    throw new Error(toUserFacingNetworkMessage(error));
  }
}
