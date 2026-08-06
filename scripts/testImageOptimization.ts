/**
 * Focused unit checks for image optimization helpers.
 * Run: npx tsx scripts/testImageOptimization.ts
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";

import {
  DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
  isAllowedVariantName,
  parseImageOptimizationConfig,
  parseVariantsJson,
  validateImageSettingProps,
} from "../src/lib/files/imageOptimizationConfig";
import {
  resolveVariantDiskPath,
  variantPath,
} from "../src/lib/files/imageVariantPaths";
import { processImageVariants } from "../src/lib/files/processImageVariants";
import { buildPublicImagePayload } from "../src/lib/files/publicImageUrl";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

async function createTestJpeg(
  filePath: string,
  width: number,
  height: number,
): Promise<void> {
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 40, g: 120, b: 200 },
    },
  })
    .jpeg({ quality: 90 })
    .toFile(filePath);
}

async function main() {
  console.log("imageOptimizationConfig");
  assert(isAllowedVariantName("thumb"), "thumb is allowed");
  assert(!isAllowedVariantName("xlarge"), "xlarge is not allowed");
  assert(
    parseVariantsJson(DEFAULT_IMAGE_OPTIMIZATION_CONFIG.variants).length === 4,
    "default variants parse",
  );
  const cfg = parseImageOptimizationConfig({
    imageOptimizationEnabled: true,
    quality: "85",
    variantsJson: JSON.stringify([{ name: "thumb", width: 200 }]),
  });
  assert(cfg.quality === 85, "quality parsed");
  assert(cfg.variants.length === 1, "custom variants parsed");
  assert(
    validateImageSettingProps({ quality: 200 })?.quality != null,
    "invalid quality rejected",
  );

  console.log("publicImageUrl");
  const processing = buildPublicImagePayload({
    fileName: "a.jpg",
    status: "processing",
  });
  assert(processing?.placeholder === true, "processing shows placeholder");
  assert(processing?.url === "", "processing has empty url (no original)");
  const ready = buildPublicImagePayload({
    fileName: "a.jpg",
    status: "ready",
    width: 1000,
    height: 800,
    variantsJson: JSON.stringify({
      thumb: "/tmp/a_thumb.webp",
      small: "/tmp/a_small.webp",
    }),
  });
  assert(ready?.ready === true, "ready payload");
  assert(!!ready?.srcset.includes("200w"), "srcset includes 200w");
  assert(!!ready?.url.includes("variant=small"), "prefers small variant");

  console.log("imageVariantPaths");
  const vp = variantPath("/uploads/a.jpg", "small");
  assert(vp.endsWith("a_small.webp"), "variant path naming");
  assert(
    resolveVariantDiskPath(
      {
        filePath: "/uploads/a.jpg",
        variantsJson: JSON.stringify({ small: "/uploads/a_small.webp" }),
      },
      "small",
    ) === "/uploads/a_small.webp",
    "resolve allowlisted variant",
  );
  assert(
    resolveVariantDiskPath(
      {
        filePath: "/uploads/a.jpg",
        variantsJson: JSON.stringify({ small: "/etc/passwd" }),
      },
      "small",
    ) === null,
    "reject path outside original dir",
  );

  console.log("processImageVariants");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "img-opt-"));
  try {
    const largePath = path.join(tmp, "large.jpg");
    await createTestJpeg(largePath, 2000, 1500);
    const largeResult = await processImageVariants(largePath, {
      ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
    });
    assert(largeResult.width === 2000, "large width stored");
    assert(
      Object.keys(largeResult.variants).length === 4,
      "large creates 4 variants",
    );
    assert(fs.existsSync(largePath), "original kept");
    for (const p of Object.values(largeResult.variants)) {
      assert(!!p && fs.existsSync(p), `variant exists ${path.basename(p!)}`);
      const meta = await sharp(p!).metadata();
      assert(meta.format === "webp", "variant is webp");
    }

    const tinyPath = path.join(tmp, "tiny.jpg");
    await createTestJpeg(tinyPath, 120, 90);
    const tinyResult = await processImageVariants(tinyPath, {
      ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
    });
    assert(
      Object.keys(tinyResult.variants).length === 1 &&
        !!tinyResult.variants.thumb,
      "tiny images only get thumb",
    );

    // Non-enlargement: 400px image should not get medium/large
    const midPath = path.join(tmp, "mid.jpg");
    await createTestJpeg(midPath, 400, 300);
    const midResult = await processImageVariants(midPath, {
      ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
    });
    assert(!!midResult.variants.thumb, "mid has thumb");
    assert(!!midResult.variants.small === false, "mid skips small (400<=500)");
    assert(!midResult.variants.medium, "mid skips medium");

    // Non-image should throw
    const txtPath = path.join(tmp, "note.txt");
    fs.writeFileSync(txtPath, "not an image");
    let threw = false;
    try {
      await processImageVariants(txtPath, DEFAULT_IMAGE_OPTIMIZATION_CONFIG);
    } catch {
      threw = true;
    }
    assert(threw, "non-image throws");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
