import type { Session } from "neo4j-driver";

import { int } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";

export async function supportTicket(
  data: any,
  session: Session,
  subDomain: string,
) {
  const { action, ...payload } = data;

  switch (action) {
    case "chat":
      // payload: { panel: 'supportTicket',action: 'chat',key, email, subject, message }
      return await chat(payload, session, subDomain);
    case "create":
      // payload: { panel: 'supportTicket',action: 'create',key, email, subject, message }
      return await createTicket(payload, session);
    case "delete":
      // payload: { panel: 'supportTicket',action: 'delete',id }
      return await deleteTicket(payload, session, subDomain);
    case "getTicktes":
      // payload: { panel: 'supportTicket',action: 'getTicktes', email}
      return await getTicket(payload, session);
    case "updateStatus":
      // payload: { panel: 'supportTicket',action: 'updateStatus',id, status }
      return await updateStatus(payload, session);
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
    const { email, key, message, subject } = payload;

    const query = `CREATE (n:Support {key: $key, email: $email,subject: $subject, message: $message, status: "pending"}) SET n.createdAt = localDateTime() RETURN n;`;
    await session.run(query, {
      email: email,
      key: key,
      message: message,
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

  async function chat(payload: any, _session: Session, _subdomain: string) {
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
        const query = "MATCH (v) WHERE id(v) = $id RETURN v";
        const result = await session.run(query, { id: parentVertexId });

        const messagesResult = await getSelectionOptionsMGCall(
          [convertNodeToJson(result.records[0].get("v"))],
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
    _session: Session,
    _subdomain: string,
  ) {
    const { id } = payload;
    // deleted this function intentionally, use mutation handler instead
    /*await deleteVertexMGCall(id);
    return {
      message: "Support Ticket deleted successfully",
    };*/
  }
}
