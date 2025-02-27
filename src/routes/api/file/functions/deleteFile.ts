import type { Session } from "neo4j-driver";

import fs from "node:fs/promises";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { Vertex } from "~/lib/graph/graph";
import { deleteFileMetadata } from "~/routes/api/file/functions/functions/deleteFileMetadata";
import { getFileMetadata } from "~/routes/api/file/functions/functions/getFileMetadata";

export async function deleteFile(fileId: string, neo4jSession: Session, user: Vertex) {
  const fileMetadata = await getFileMetadata(neo4jSession, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const filePath = fileMetadata.P.filePath;
    await fs.unlink(filePath); // Delete the file from the disk

    const deletedFile = await deleteFileMetadata(neo4jSession, fileId);

    if (deletedFile) {
      await createActivityLog(
        neo4jSession,
        "file_delete",
        "File",
        fileId as string,
        user.P.email,
        `File deleted: ${deletedFile?.P.fileName} (${deletedFile?.P.contentType})`
      );
    }
    return {
      graph: {
        deleted_vertexes: [fileId],
      },
      success: true,
    };
  } catch (error: any) {
    return {
      error: `Error deleting file ${error.message}`,
      success: false,
    };
  }
}
