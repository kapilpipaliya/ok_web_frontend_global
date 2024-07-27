import type { APIEvent } from "@solidjs/start/dist/server";

import { type Session, int } from "neo4j-driver";

import { getDriver, getDriverWithPort } from "~/cypher/driver";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { findVertexesMGCall } from "~/cypher/get/findVertex";
import { getHttpsSession } from "~/server/getHttpsSession";
import { getSubDomain } from "~/server/getSubDomain";

/**
 * Handles errors and responses in a consistent way.
 * @param {Function} func - The async function to execute.
 * @param {object} [params] - The parameters to pass to the function, optional.
 * @returns {Promise<object>} - A standard response object.
 */
async function handleRequest(
  func: Function,
  params,
  session: Session,
  subdomain: string,
) {
  try {
    return await func(params, session, subdomain);
  } catch (error: any) {
    console.error("Error :", error);
    return new Response(error.message, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function POST({ request }: APIEvent) {
  const { panel, ...payload } = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
  if (!panel) {
    return { error: "Missing panel" };
  }

  switch (panel) {
    case "profile":
      // payload: { panel: 'profile',userId, username, email, profileImage }
      return handleRequest(profile, payload, session, subdomain);
    case "password":
      // payload: { panel: 'password',currentPassword, username, newPassword  }
      return handleRequest(password, payload, session, subdomain);
    case "pricing":
      // payload: { panel: 'pricing' }
      return handleRequest(pricing, payload, session, subdomain);
    case "supportTicket":
      return handleRequest(supportTicket, payload, session, subdomain);
    default:
      return { error: "Invalid action" };
  }
}

const profile = async (payload: any, session: Session, subdomain: string) => {
  const { email, profileImage, uId, userId, username } = payload;

  // Ensure user exists
  const userExists = await session.run(
    "MATCH (u:User) WHERE u.uId = $uId RETURN u;",
    { uId },
  );
  if (userExists.records.length === 0) {
    return { error: "User not exists", status: 404 };
  }

  // Check if email and username already exists
  if (
    email &&
    !(
      await findVertexesMGCall({
        attribute: "email",
        label: "User",
        value: email,
      })
    ).error
  ) {
    return { error: "Email address already exists", status: 500 };
  }
  if (
    username &&
    !(
      await findVertexesMGCall({
        attribute: "username",
        label: "User",
        value: username,
      })
    ).error
  ) {
    return { error: "Username already exists", status: 500 };
  }

  // Update user profile
  let query = "MATCH (u:User) WHERE u.uId = $uId SET ";
  const updates = [];
  if (email) updates.push("u.email = $email");
  if (username) updates.push("u.username = $username");
  if (profileImage) updates.push("u.profileImage = $profileImage");
  query += `${updates.join(", ")} SET u.updatedAt = localDateTime() RETURN u;`;

  const result = await session.run(query, {
    email,
    profileImage,
    uId,
    userId,
    username,
  });
  const user = result.records[0]?.get("u");

  const session2 = (
    await getDriverWithPort(user.properties.driverPort)
  ).session();
  await session2.run(query, {
    email,
    profileImage,
    uId,
    userId,
    username,
  });

  if (email) {
    const http_session = await getHttpsSession();
    await http_session.update((oldData) => ({
      ...oldData,
      email: user.properties.email,
    }));
  }

  return { message: "Profile updated successfully", user: user.properties };
};

const password = async (payload: any, session: Session) => {
  const { currentPassword, newPassword, username } = payload;

  const findUserQuery =
    "MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u;";
  const findUserResult = await session.run(findUserQuery, {
    password: currentPassword,
    username: username,
  });
  if (findUserResult.records.length === 0) {
    return { error: "Current Password is not valid" };
  }

  const query =
    "MATCH (u:User) WHERE u.username = $username SET u.password = $password RETURN u;";
  const result = await session.run(query, {
    password: newPassword,
    username: username,
  });
  if (result.records.length === 0) {
    return { error: "Failed to update password" };
  }
  return {
    message: "Password updated successfully",
  };
};

const pricing = async (payload: any, session: Session) => {
  const query = "MATCH (n:Pricing) RETURN n;";
  const result = await session.run(query);
  const plans = result.records.map((r) => r.get("n").properties);
  return {
    plans: plans,
  };
};

const supportTicket = async (
  data: any,
  session: Session,
  subdomain: string,
) => {
  const { action, ...payload } = data;

  switch (action) {
    case "getTicktes":
      // payload: { panel: 'supportTicket',action: 'getTicktes', email}
      return await getTicket(payload, session);
    case "create":
      // payload: { panel: 'supportTicket',action: 'create',name, email, subject, message }
      return await createTicket(payload, session);
    case "updateStatus":
      // payload: { panel: 'supportTicket',action: 'updateStatus',id, status }
      return await updateStatus(payload, session);
    case "chat":
      // payload: { panel: 'supportTicket',action: 'chat',name, email, subject, message }
      return await chat(payload, session, subdomain);
    case "delete":
      // payload: { panel: 'supportTicket',action: 'delete',id }
      return await deleteTicket(payload, session, subdomain);
    default:
      return { error: "Invalid support ticket action", status: 400 };
  }

  async function getTicket(payload: any, session: Session) {
    const { email } = payload;

    const query = "MATCH (n:Support {email: $email}) RETURN n;";
    const result = await session.run(query, { email });

    const data = result.records.map((r) => {
      const data = r.get("n").properties;
      data.id = r.get("n").elementId;
      return data;
    });

    return {
      contact: data,
    };
  }

  async function createTicket(payload: any, session: Session) {
    const { email, message, name, subject } = payload;

    const query = `CREATE (n:Support {name: $name, email: $email,subject: $subject, message: $message, status: "pending"}) SET n.createdAt = localDateTime() RETURN n;`;
    await session.run(query, {
      email: email,
      message: message,
      name: name,
      subject: subject,
    });
    return {
      message: "Message sent successfully",
    };
  }

  async function updateStatus(payload: any, session: Session) {
    const { id, status } = payload;

    const query =
      "MATCH (n) WHERE id(n) = $id SET n.status = $status SET n.updatedAt = localDateTime() RETURN n;";
    await session.run(query, { id: int(id), status: status });
    return {
      message: "Status updated successfully",
    };
  }

  async function chat(payload: any, session: Session, subdomain: string) {
    const { newMessage, parentVertexId, subAction } = payload;
    switch (subAction) {
      case "send": {
        // deleted this function intentionally, use mutation handler instead
        /*const data = await newRowMGCall(
          parentVertexId,
          "SupportUser",
          "",
          newMessage,
        );
        return data;*/
      }
      case "get": {
        const result = await findVertexesMGCall({ id: parentVertexId });

        const messagesResult = await getSelectionOptionsMGCall(
          [result.vertexes!],
          "->SupportUser",
          undefined,
          10,
        );
        return messagesResult.result;
      }
    }
  }

  async function deleteTicket(
    payload: any,
    session: Session,
    subdomain: string,
  ) {
    const { id } = payload;
    // deleted this function intentionally, use mutation handler instead
    /*await deleteVertexMGCall(id);
    return {
      message: "Support Ticket deleted successfully",
    };*/
  }
};
