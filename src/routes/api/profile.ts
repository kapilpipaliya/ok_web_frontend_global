import { APIEvent } from "@solidjs/start/dist/server";
import { deleteNodeMGCall } from "~/cypher_api/functions/deleteNode";
import { findVertexByIdMGCall } from "~/cypher_api/functions/findVertex";
import { newRowMGCall } from "~/cypher_api/functions/newRow";
import { getChildVertexes } from "~/cypher_api/lib/Traverse";
import { getDriver, isIntegerId } from "~/lib/global";
import { checkPropertyExists } from "~/lib/functions";

/**
 * Handles errors and responses in a consistent way.
 * @param {Function} func - The async function to execute.
 * @param {object} [params] - The parameters to pass to the function, optional.
 * @returns {Promise<object>} - A standard response object.
 */
async function handleRequest(func: Function, params = {}) {
  try {
    return await func(params);
  } catch (error: any) {
    console.error("Error :", error);
    return new Response(error.message, { status: 500 });
  }
}

export async function POST({ request }: APIEvent) {
  const { panel, ...payload } = await request.json();

  if (!panel) {
    return { error: "Missing panel" };
  }

  switch (panel) {
    case "profile":
      // payload: { panel: 'profile',userId, username, email }
      return handleRequest(profile, payload);
    case "password":
      // payload: { panel: 'password',currentPassword, username, newPassword  }
      return handleRequest(password, payload);
    case "pricing":
      // payload: { panel: 'pricing' }
      return handleRequest(pricing);
    case "supportTicket":
      return handleRequest(supportTicket, payload);
    default:
      return { error: "Invalid action" };
  }
}

const profile = async (payload: any) => {
  const { userId, username, email } = payload;

  const session = getDriver("super").session();
  // Ensure user exists
  const userExists = await session.run(
    `MATCH (u:User) WHERE id(u) = $userId RETURN u;`,
    { userId },
  );
  if (userExists.records.length === 0) {
    return { status: 404, error: "User not exists" };
  }

  // Check if email and username already exists
  if (email && (await checkPropertyExists("User", session, "email", email))) {
    return { status: 500, error: "Email address already exists" };
  }
  if (
    username &&
    (await checkPropertyExists("User", session, "username", username))
  ) {
    return { status: 500, error: "Username already exists" };
  }
  // Update user profile
  let query = `MATCH (u:User) WHERE id(u) = $userId SET `;
  const updates = [];
  if (email) updates.push(`u.email = $email`);
  if (username) updates.push(`u.username = $username`);
  query += updates.join(", ") + " RETURN u;";

  const result = await session.run(query, { userId, email, username });
  const user = result.records[0]?.get("u");
  return { message: "Profile updated successfully", user: user.properties };
};

const password = async (payload: any) => {
  const { currentPassword, username, newPassword } = payload;

  const neoSession = getDriver("super").session();

  const findUserQuery = `MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u;`;
  const findUserResult = await neoSession.run(findUserQuery, {
    password: currentPassword,
    username: username,
  });
  if (findUserResult.records.length === 0) {
    return { error: "Current Password is not valid" };
  }

  const query = `MATCH (u:User) WHERE u.username = $username SET u.password = $password RETURN u;`;
  const result = await neoSession.run(query, {
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

const pricing = async () => {
  const neoSession = getDriver("super").session();

  const query = `MATCH (n:Pricing) RETURN n;`;
  const result = await neoSession.run(query);
  const plans = result.records.map((r) => r.get("n").properties);
  return {
    plans: plans,
  };
};

const supportTicket = async (data: any) => {
  const { action, ...payload } = data;

  switch (action) {
    case "getTicktes":
      // payload: { panel: 'supportTicket',action: 'getTicktes', email}
      return await getTicket(payload);
    case "create":
      // payload: { panel: 'supportTicket',action: 'create',name, email, subject, message }
      return await createTicket(payload);
    case "updateStatus":
      // payload: { panel: 'supportTicket',action: 'updateStatus',id, status }
      return await updateStatus(payload);
    case "chat":
      // payload: { panel: 'supportTicket',action: 'chat',name, email, subject, message }
      return await chat(payload);
    case "delete":
      // payload: { panel: 'supportTicket',action: 'delete',id }
      return await deleteTicket(payload);
    default:
      return { status: 400, error: "Invalid support ticket action" };
  }

  async function getTicket(payload: any) {
    const { email } = payload;
    console.log(email, payload);
    const neoSession = getDriver("super").session();

    const query = `MATCH (n:Support {email: $email}) RETURN n;`;
    const result = await neoSession.run(query, { email });

    const data = result.records.map((r) => {
      const data = r.get("n").properties;
      data["id"] = r.get("n").identity;
      return data;
    });

    return {
      contact: data,
    };
  }

  async function createTicket(payload: any) {
    const { name, email, subject, message } = payload;

    const neoSession = getDriver("super").session();

    const query = `CREATE (n:Support {name: $name, email: $email,subject: $subject, message: $message, status: "pending"}) RETURN n;`;
    await neoSession.run(query, {
      name: name,
      email: email,
      subject: subject,
      message: message,
    });
    return {
      message: "Message sent successfully",
    };
  }

  async function updateStatus(payload: any) {
    const { id, status } = payload;
    const neoSession = getDriver("super").session();

    const query = `MATCH (n) WHERE id(n) = $id SET n.status = $status RETURN n;`;
    await neoSession.run(query, { id: id, status: status });
    return {
      message: "Status updated successfully",
    };
  }

  async function chat(payload: any) {
    const { subAction, parentVertexId, newMessage } = payload;
    const neoSession = getDriver("super").session();
    switch (subAction) {
      case "send":
        const data = await newRowMGCall(
          { driver: getDriver("super"), session: neoSession },
          parentVertexId,
          "SupportUser",
          "",
          newMessage,
        );
        return data;
      case "get":
        const result = await findVertexByIdMGCall(
          { driver: getDriver("super"), session: neoSession },
          parentVertexId,
        );
        const message = await getChildVertexes(
          { driver: getDriver("super"), session: neoSession },
          ["SupportUser"],
          [result.vertex!],
        );
        return message;
    }
  }

  async function deleteTicket(payload: any) {
    const { id } = payload;
    const neoSession = getDriver("super").session();
    await deleteNodeMGCall(
      { driver: getDriver("super"), session: neoSession },
      id,
    );
    return {
      message: "Support Ticket deleted successfully",
    };
  }
};
