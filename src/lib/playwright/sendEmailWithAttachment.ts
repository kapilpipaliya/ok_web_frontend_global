import fs from "node:fs/promises";

import { Vertex } from "../graph/graph";
import { sendEmail } from "./sendEmail";

// example
// await sendEmailWithAttachment({
//   emailSubject,
//   emailTo,
//   fileVertex,
//   snapshotData,
//   subDomain
// });
export async function sendEmailWithAttachment({
  emailSubject, emailTo, fileVertex, subDomain
}: {
  emailSubject: string;
  emailTo: string;
  fileVertex: Vertex;
  subDomain: string;
}) {
  const fileData = await fs.readFile(fileVertex.P.filePath);
  await sendEmail({
    attachmentName: fileVertex.P.originalFileName,
    attachmentPath: fileVertex.P.filePath,
    content: fileData.toString(),
    subDomain,
    subject: emailSubject,
    to: emailTo
  });
}
