import fs from 'fs';
import { APIEvent } from "@solidjs/start/dist/server";
import { IncomingForm } from 'formidable';
import path from 'path';
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { fileURLToPath } from "url";
import { HTTPEvent, eventHandler, getQuery, readMultipartFormData } from "vinxi/http";

export async function POST(event: HTTPEvent) {
    const query = getQuery(event); 
    const fileId = query['name'];    
    const data = await readMultipartFormData(event);
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const profileImagesDir = path.resolve(__dirname, '~/assets/profile_images');

    try {
        // Check if the directory exists, create it if not
        if (!fs.existsSync(profileImagesDir)) {
            fs.mkdirSync(profileImagesDir, { recursive: true });
        }
        const { ext,name } = path.parse(data![0].filename!);
        const newFilename = `${fileId}_${name}${ext}`;
        const htmlTemplatePath = path.resolve(profileImagesDir, newFilename);
        fs.writeFileSync(htmlTemplatePath, data![0].data);

        return { 
            message: 'File saved successfully', newFilename: `~/assets/profile_images/${newFilename}` };
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
}