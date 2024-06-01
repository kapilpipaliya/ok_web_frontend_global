import fs from "node:fs";
import type { APIEvent } from "@solidjs/start/dist/server";
import path from "node:path";
import { getQuery, type HTTPEvent, readMultipartFormData } from "vinxi/http";
import { getSubDomain } from "~/cypher_api/server/domain_utils";

export async function POST({ request }: APIEvent, event: HTTPEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const query = getQuery(event);
  const fileId = query.name;
  const username = query.username;
  const data = await readMultipartFormData(event);
  const baseProfileImagesDir =
    "/root/ok_web_frontend_global/public/profile_images";
  const subdomainProfileImagesDir = path.join(baseProfileImagesDir, subdomain);

  try {
    // Check if the subdomain-specific directory exists, create it if not
    if (!fs.existsSync(subdomainProfileImagesDir)) {
      fs.mkdirSync(subdomainProfileImagesDir, { recursive: true });
    }
    if (data?.[0]?.filename) {
      const { ext, name } = path.parse(data[0].filename);
      const newFilename = `${fileId}_${username}_${new Date().toISOString()}${ext}`;
      const imagePath = path.join(subdomainProfileImagesDir, newFilename);
      fs.writeFileSync(imagePath, data[0].data);
      return {
        message: "File saved successfully",
        newFilename: `/profile_images/${subdomain}/${newFilename}`,
      };
    }
    return { error: "No file data available" };
  } catch (error) {
    console.error("Error saving file:", error);
    throw error; // Rethrow or handle as necessary
  }
}
