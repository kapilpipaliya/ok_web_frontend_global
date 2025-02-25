import type { Vertex } from "~/lib/graph/graph";
import { getHttpsSession } from "./getHttpsSession";

export class SessionManager {
  private static instance: SessionManager;
  
  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async getSession() {
    return await getHttpsSession();
  }

  async updateSession(user: Vertex) {
    const session = await this.getSession();
    await session.update((oldData) => ({
      ...oldData,
      user,
    }));
  }

  async clearSession() {
    const session = await this.getSession();
    await session.clear();
  }

  async getUserData() {
    const session = await this.getSession();
    return session?.data?.user;
  }
}

export const sessionManager = SessionManager.getInstance(); 