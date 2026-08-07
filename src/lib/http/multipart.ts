/**
 * Compatibility shape matching H3 v1 MultiPartData.
 * SolidStart v2 / H3 v2 use native FormData instead.
 */
export type MultipartPart = {
  name?: string;
  filename?: string;
  type?: string;
  data: Buffer;
};

/**
 * Convert a web FormData into the legacy multipart part list used by upload helpers.
 */
export async function formDataToMultipartParts(
  formData: FormData,
): Promise<MultipartPart[]> {
  const parts: MultipartPart[] = [];

  for (const [name, value] of formData.entries()) {
    if (typeof value === "string") {
      parts.push({
        name,
        data: Buffer.from(value, "utf8"),
      });
      continue;
    }

    const file = value as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    parts.push({
      name,
      filename: file.name || undefined,
      type: file.type || undefined,
      data: buffer,
    });
  }

  return parts;
}

export async function readMultipartFormDataFromRequest(
  request: Request,
): Promise<MultipartPart[]> {
  const formData = await request.formData();
  return formDataToMultipartParts(formData);
}
