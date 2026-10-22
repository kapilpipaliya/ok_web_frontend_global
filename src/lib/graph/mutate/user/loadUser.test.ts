import { describe, expect, it, vi } from "vitest";
import { handleUserNavigation } from "./loadUser";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("handleUserNavigation", () => {
  it("returns true when user is present", () => {
    expect(
      handleUserNavigation({
        user: createVertex("u1", ["User"], { email: "a@b.com" }),
      }),
    ).toBe(true);
  });

  it("navigates to sign-in with redirect when user missing", () => {
    const navigate = vi.fn();
    const location = {
      pathname: "/admin/pages",
      search: "?tab=1",
    } as never;

    expect(handleUserNavigation(null, navigate, location)).toBe(false);
    expect(navigate).toHaveBeenCalled();
    const [url, opts] = navigate.mock.calls[0];
    expect(url).toContain("redirectUrl=%2Fadmin%2Fpages");
    expect(opts).toEqual({ replace: true });
  });
});
