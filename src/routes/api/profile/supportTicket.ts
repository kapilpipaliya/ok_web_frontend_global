import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getSelectionOptionsAPICall } from "~/cypher/get/client/getSelectionOptionsAPICall";

export async function supportTicket(
  data: any,
  dbSession: Session,
  subDomain: string,
) {
  const { action, ...payload } = data;

  switch (action) {
    case "chat":
      // payload: { panel: 'supportTicket',action: 'chat',key, email, subject, message }
      return await chat(payload, dbSession, subDomain);
    case "create":
      // payload: { panel: 'supportTicket',action: 'create',key, email, subject, message }
      return await createTicket(payload, dbSession);
    case "delete":
      // payload: { panel: 'supportTicket',action: 'delete',id }
      return await deleteTicket(payload, dbSession, subDomain);
    case "getTicktes":
      // payload: { panel: 'supportTicket',action: 'getTicktes', email}
      return await getTicket(payload, dbSession);
    case "updateStatus":
      // payload: { panel: 'supportTicket',action: 'updateStatus',id, status }
      return await updateStatus(payload, dbSession);
    default:
      return { error: "Invalid support ticket action", status: 400 };
  }

  async function getTicket(payload: any, dbSession: Session) {
    const { email } = payload;

    const query = "MATCH (n:Support {email: $email}) RETURN n;";
    const result = await dbSession.run(query, { email });

    const data = result.records.map((r) => {
      const data = r.get("n").properties;
      data.id = r.get("n").elementId;
      return data;
    });

    return {
      contact: data,
    };
  }

  async function createTicket(payload: any, dbSession: Session) {
    const { email, key, message, subject } = payload;

    const query = `CREATE (n:Support {key: $key, email: $email,subject: $subject, message: $message, status: "pending"}) SET n.createdAt = localDateTime() RETURN n;`;
    await dbSession.run(query, {
      email: email,
      key: key,
      message: message,
      subject: subject,
    });
    return {
      message: "Message sent successfully",
    };
  }

  async function updateStatus(payload: any, dbSession: Session) {
    const { id, status } = payload;

    const query =
      "MATCH (n) WHERE elementId(n) = $id SET n.status = $status SET n.updatedAt = localDateTime() RETURN n;";
    await dbSession.run(query, { id: id, status: status });
    return {
      message: "Status updated successfully",
    };
  }

  async function chat(payload: any, dbSession: Session, _subDomain: string) {
    const { newMessage, parentVertexId, subAction } = payload;
    switch (subAction) {
      case "get": {
        const query = "MATCH (v) WHERE elementId(v) = $id RETURN v";
        const result = await dbSession.run(query, { id: parentVertexId });

        const messagesResult = await getSelectionOptionsAPICall(
          [convertNodeToJson(result.records[0].get("v"))],
          "->SupportUser",
          undefined,
          10,
        );
        return messagesResult.result;
      }
      case "send": {
        // deleted this function intentionally, use mutation handler instead
        /*const data = await newRowAPICall(
          parentVertexId,
          "SupportUser",
          "",
          newMessage,
        );
        return data;*/
      }
    }
  }

  async function deleteTicket(
    payload: any,
    _dbSession: Session,
    _subDomain: string,
  ) {
    const { id } = payload;
    // deleted this function intentionally, use mutation handler instead
    /*await deleteVertexAPICall(id);
    return {
      message: "Support Ticket deleted successfully",
    };*/
  }
}
