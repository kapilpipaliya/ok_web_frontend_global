import { logout } from "../../server/logout";

export async function POST() {
  try {
    await logout();
    return {
      message: "Logout successfully",
    };
  } catch (_error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
