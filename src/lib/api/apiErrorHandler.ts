export class APIError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        details: error.details,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: error.status,
      },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  return new Response(JSON.stringify({ error: message }), {
    headers: { "Content-Type": "application/json" },
    status: 500,
  });
}
