import fs from "node:fs/promises";

import { Vertex } from "../graph/graph";
import { sendEmail } from "./sendEmail";

// await sendEmailWithAttachment({
//   emailSubject,
//   emailTo,
//   fileVertex,
//   snapshotData
// });
export async function sendEmailWithAttachment({
  emailSubject, emailTo, fileVertex,
}: {
  emailSubject: string;
  emailTo: string;
  fileVertex: Vertex;
}) {
  const fileData = await fs.readFile(fileVertex.P.filePath);
  await sendEmail({
    attachmentName: fileVertex.P.originalFileName,
    attachmentPath: fileVertex.P.filePath,
    content: fileData.toString(),
    subject: emailSubject,
    to: emailTo,
  });
}
