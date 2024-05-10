import { getDriver, isIntegerId } from "~/lib/server/driver";
import { APIEvent } from "@solidjs/start/dist/server";
import { getHttpsSession } from "~/lib/auth/_server";
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export async function POST({ request, nativeEvent }: APIEvent) {
    const form = new IncomingForm();
    form.parse(request, (err, fields, files) => {
        if (err) {
            console.error('Error parsing the files');
            // return res.status(400).json({ message: "Error parsing the files" });
        }

        // Assuming one file for simplicity
        let uploadedFile = files.file;
        const oldPath = uploadedFile.filepath;
        const newPath = path.join(__dirname, 'uploads', uploadedFile.originalFilename);

        // Read the file from temp path and write to the new path
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error('Error saving the file');
                // return res.status(500).json({ message: "Error saving the file" });
            }
            // res.status(200).json({ message: "File uploaded and moved successfully" });
        });
    });
    try {
        return {
            "sad":'asd',
        };
    } catch (error) {
        console.error("Server error Failed to login:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
