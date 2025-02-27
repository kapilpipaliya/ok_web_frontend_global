import type {APIEvent} from "@solidjs/start/server";
import type {Session} from "neo4j-driver";

import type {Vertex} from "~/lib/graph/graph";

import {generateSecureToken} from "~/lib/auth/secureToken";
import {encodeUserData} from "~/lib/auth/userDataEncoder";
import {sendNotificationEmail} from "~/lib/playwright/sendNotificationEmail";
import {EMAIL_TEMPLATES} from "~/pages/settings/constants";

export async function sendEmailConfirmation(request: APIEvent["request"], oldUser: Vertex, newEmail: string, userNew: Vertex, subDomain: string, dbSession: Session) {
  const userData = encodeUserData({
    email: oldUser.P.email,
    newEmail,
    uuid: userNew.P.uuid
  });

  const confirmToken = await generateSecureToken(userData, dbSession);
  const protocol = request.url.startsWith('https') ? 'https' : 'http';
  const host = request.headers.get("host") || "";
  const url = `${protocol}://${host}/api/auth/confirmEmailChange?token=${confirmToken}`;

  sendNotificationEmail(
    EMAIL_TEMPLATES.EmailChanged,
    { email: oldUser.P.email },
    "Email Change Notification",
    userNew,
    subDomain
  );

  sendNotificationEmail(
    EMAIL_TEMPLATES.EmailConfirmation,
    { email: newEmail, url },
    "Confirm Your New Email Address",
    userNew,
    subDomain
  );
}