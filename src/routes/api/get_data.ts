import type { APIEvent } from "@solidjs/start/server";
import { getInitialData } from "./getInitialData";

export async function GET({ params }: APIEvent) {
  let data = {};
  try {
    data = getInitialData({});
  } catch (error) {
    console.error("Failed to execute query:", error);
    throw error;
  } finally {
    // TODO: If I uncomment its giving error
    // await session.close();
    // await getDriver('super').close();
  }
  return data;
}

export function POST() {
  // ...
}

export function PATCH() {
  // ...
}

export function DELETE() {
  // ...
}
