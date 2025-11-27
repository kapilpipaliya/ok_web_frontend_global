/**
 * API endpoint to create YouTube Organizer (YTO) database indices
 *
 * This endpoint creates all necessary Neo4j indices for optimal query performance
 * in the YouTube Organizer feature.
 *
 * Usage:
 * POST /api/admin/createYTOIndices
 *
 * Requires: Admin authentication
 *
 * Returns:
 * {
 *   success: true,
 *   message: "YTO indices created successfully",
 *   created: 15,
 *   skipped: 4,
 *   failed: 0
 * }
 */

import type { APIEvent } from "@solidjs/start/server";
import { createYTOIndices } from "~/cypher/mutate/createYTOIndices";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

export async function POST(event: APIEvent) {
  try {
    const { dbSession } = await getDBSessionForSubdomain(event.request);

    const user = await getUserFromSession(event.request);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Admin permission required to create database indices",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create YTO indices (session management handled internally)
    console.log("[API] Creating YTO indices...");
    await createYTOIndices(event.request);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "YTO indices created successfully. Check server logs for details.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[API] Error creating YTO indices:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create YTO indices",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
