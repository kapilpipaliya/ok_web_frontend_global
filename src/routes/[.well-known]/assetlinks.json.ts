import { type APIEvent } from "@solidjs/start/server";
import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";

/**
 * GET API endpoint for Android App Links verification
 * Returns Digital Asset Links JSON for app deep linking
 * https://capacitorjs.com/docs/guides/deep-links
 */
export async function GET(event: APIEvent) {
  try {
    // Execute the assetlinks server function
    const result = await executeNamedServerFunctionCore(
      {
        functionName: "assetlinks",
        contextData: {},
      },
      {
        nodes: {},
        relationships: {},
        vertexes: undefined as any,
        request: event.request,
      },
    );

    // Check if the function returned an error
    if (result.error) {
      console.error("Error executing assetlinks function:", result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Return the assetlinks JSON
    return new Response(JSON.stringify(result.result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error in assetlinks API endpoint:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate assetlinks" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
