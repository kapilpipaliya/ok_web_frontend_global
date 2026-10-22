import { afterEach, describe, expect, it } from "vitest";
import { getChannel } from "./getChannel";
import { channels } from "./channels";

describe("getChannel", () => {
  afterEach(async () => {
    for (const [name, channel] of channels) {
      await channel.close();
      channels.delete(name);
    }
  });

  it("creates and reuses BroadcastChannel instances", () => {
    const a = getChannel("test-channel-a");
    const b = getChannel("test-channel-a");
    const c = getChannel("test-channel-b");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(channels.has("test-channel-a")).toBe(true);
  });
});
