import { describe, expect, it } from "vitest";
import { extractComponentNames } from "./extractComponentNames";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("extractComponentNames", () => {
  it("collects custom Attr/PageLayout componentName and skips Html/Slot", () => {
    const names = extractComponentNames({
      a: createVertex("a", ["Attr"], { componentName: "SystemButton" }),
      b: createVertex("b", ["Attr"], { componentName: "Html" }),
      c: createVertex("c", ["PageLayout"], { componentName: "MainLayout" }),
      d: createVertex("d", ["Attr"], { componentName: "Slot" }),
    });
    expect([...names].sort()).toEqual(["MainLayout", "SystemButton"]);
  });

  it("collects dynamicComponent as array or comma string on Page/Component", () => {
    const names = extractComponentNames({
      p: createVertex("p", ["Page"], {
        dynamicComponent: ["Card", "Hero"],
      }),
      c: createVertex("c", ["Component"], {
        dynamicComponent: " Foo , Bar ",
      }),
    });
    expect([...names].sort()).toEqual(["Bar", "Card", "Foo", "Hero"]);
  });
});
