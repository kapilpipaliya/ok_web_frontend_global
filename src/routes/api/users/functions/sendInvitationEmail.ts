import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { getEmailDomain } from "~/lib/email/getEmailDomain";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function sendInvitationEmail(
  request: APIEvent["request"],
  user: Vertex,
  subDomain: string,
  dbSession: Session,
  host?: string,
) {
  const userData = encodeUserData({
    email: user.P.email,
    uuid: user.P.uuid,
  });

  const inviteToken = await generateSecureToken(userData, dbSession);
  const host_ = host ? host : await getEmailDomain(request, subDomain);
  const url = `https://${host_}/api/auth/confirmInvitation?token=${inviteToken}`;

  sendNotificationEmail(
    EMAIL_TEMPLATES.InvitationEmail,
    { email: user.P.email, url },
    "Invitation to Join",
    user,
    subDomain,
  );
}
