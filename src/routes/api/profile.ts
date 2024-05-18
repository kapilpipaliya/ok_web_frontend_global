import { APIEvent } from "@solidjs/start/dist/server";
import { Session } from "neo4j-driver";
import { deleteVertexMGCall } from "~/cypher_api/functions/deleteVertex";
import { findVertexByIdMGCall } from "~/cypher_api/functions/findVertex";
import { newRowMGCall } from "~/cypher_api/functions/newRow";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import { getDriver, getDriverWithPort } from "~/cypher_api/server/driver";
import { getHttpsSession } from "~/cypher_api/server/auth/getHttpsSession";
import { isVertexExistWithPropMGCall } from "~/cypher_api/functions/isVertexExistWithPropMGCall";
import { getChildVertexesMGCall } from "~/cypher_api/lib/graph/get/async/traverse";

/**
 * Handles errors and responses in a consistent way.
 * @param {Function} func - The async function to execute.
 * @param {object} [params] - The parameters to pass to the function, optional.
 * @returns {Promise<object>} - A standard response object.
 */
async function handleRequest(
  func: Function,
  params = {},
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
  const subdomain = getSubDomain(request.headers.get("host")!);
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
  const { userId, username, email, profileImage, uId } = payload;

  // Ensure user exists
  const userExists = await session.run(
    `MATCH (u:User) WHERE u.uId = $uId RETURN u;`,
    { uId },
  );
  if (userExists.records.length === 0) {
    return { status: 404, error: "User not exists" };
  }

  // Check if email and username already exists
  if (email && (await isVertexExistWithPropMGCall("User", session, "email", email))) {
    return { status: 500, error: "Email address already exists" };
  }
  if (
    username &&
    (await isVertexExistWithPropMGCall("User", session, "username", username))
  ) {
    return { status: 500, error: "Username already exists" };
  }

  // Update user profile
  let query = `MATCH (u:User) WHERE u.uId = $uId SET `;
  const updates = [];
  if (email) updates.push(`u.email = $email`);
  if (username) updates.push(`u.username = $username`);
  if (profileImage) updates.push(`u.profileImage = $profileImage`);
  query += updates.join(", ") + " RETURN u;";

  const result = await session.run(query, {
    userId,
    email,
    uId,
    username,
    profileImage,
  });
  const user = result.records[0]?.get("u");

  const session2 = (
    await getDriverWithPort(user.properties.driverPort)
  ).session();
  await session2.run(query, {
    userId,
    email,
    uId,
    username,
    profileImage,
  });
  console.log(query);

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
  const { currentPassword, username, newPassword } = payload;

  const findUserQuery = `MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u;`;
  const findUserResult = await session.run(findUserQuery, {
    password: currentPassword,
    username: username,
  });
  if (findUserResult.records.length === 0) {
    return { error: "Current Password is not valid" };
  }

  const query = `MATCH (u:User) WHERE u.username = $username SET u.password = $password RETURN u;`;
  const result = await session.run(query, {
    username: username,
    password: newPassword,
  });
  if (result.records.length === 0) {
    return { error: "Failed to update password" };
  }
  return {
    message: "Password updated successfully",
  };
};

const pricing = async (payload: any, session: Session) => {
  const query = `MATCH (n:Pricing) RETURN n;`;
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
      return { status: 400, error: "Invalid support ticket action" };
  }

  async function getTicket(payload: any, session: Session) {
    const { email } = payload;

    const query = `MATCH (n:Support {email: $email}) RETURN n;`;
    const result = await session.run(query, { email });

    const data = result.records.map((r) => {
      const data = r.get("n").properties;
      data["id"] = r.get("n").identity;
      return data;
    });

    return {
      contact: data,
    };
  }

  async function createTicket(payload: any, session: Session) {
    const { name, email, subject, message } = payload;

    const query = `CREATE (n:Support {name: $name, email: $email,subject: $subject, message: $message, status: "pending"}) RETURN n;`;
    await session.run(query, {
      name: name,
      email: email,
      subject: subject,
      message: message,
    });
    return {
      message: "Message sent successfully",
    };
  }

  async function updateStatus(payload: any, session: Session) {
    const { id, status } = payload;

    const query = `MATCH (n) WHERE id(n) = $id SET n.status = $status RETURN n;`;
    await session.run(query, { id: id, status: status });
    return {
      message: "Status updated successfully",
    };
  }

  async function chat(payload: any, session: Session, subdomain: string) {
    const { subAction, parentVertexId, newMessage } = payload;
    switch (subAction) {
      case "send":
        const data = await newRowMGCall(
          { driver: await getDriver(subdomain), session: session },
          parentVertexId,
          "SupportUser",
          "",
          newMessage,
        );
        return data;
      case "get":
        const result = await findVertexByIdMGCall(
          { driver: await getDriver(subdomain), session: session },
          parentVertexId,
        );
        const message = await getChildVertexesMGCall(
          { driver: await getDriver(subdomain), session: session },
          ["SupportUser"],
          [result.vertex!],
        );
        return message;
    }
  }

  async function deleteTicket(
    payload: any,
    session: Session,
    subdomain: string,
  ) {
    const { id } = payload;
    await deleteVertexMGCall(
      { driver: await getDriver(subdomain), session: session },
      id,
    );
    return {
      message: "Support Ticket deleted successfully",
    };
  }
};
