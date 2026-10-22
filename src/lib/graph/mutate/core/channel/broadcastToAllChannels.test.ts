import { afterEach, describe, expect, it, vi } from "vitest";
import { broadcastToAllChannels } from "./broadcastToAllChannels";
import { channels } from "./channels";
import { getChannel } from "./getChannel";

describe("broadcastToAllChannels", () => {
  afterEach(async () => {
    for (const [name, channel] of channels) {
      await channel.close();
      channels.delete(name);
    }
  });

  it("posts to all channels except skipChannel", () => {
    const a = getChannel("bc-a");
    const b = getChannel("bc-b");
    const postA = vi.spyOn(a, "postMessage");
    const postB = vi.spyOn(b, "postMessage");

    broadcastToAllChannels(["bc-a", "bc-b"], "bc-a", { hello: 1 });

    expect(postA).not.toHaveBeenCalled();
    expect(postB).toHaveBeenCalledWith(JSON.stringify({ hello: 1 }));
  });
});
