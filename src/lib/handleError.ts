export async function handleError(title: string, error: unknown) {
  return { error: title + (title ? " " : "") + (error instanceof Error ? error.message : "Unknown error") };
}
