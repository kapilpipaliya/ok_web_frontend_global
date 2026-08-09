/**
 * Focused checks for media (image + video) optimization helpers.
 * Run: npx tsx scripts/media/testMediaOptimization.ts
 *
 * Video tests require system ffmpeg/ffprobe.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import sharp from "sharp";

import {
  DEFAULT_MEDIA_SETTING_PROPS,
  detectMediaType,
  parseMediaOptimizationConfig,
  validateMediaSettingProps,
} from "../../src/lib/files/mediaOptimizationConfig";
import {
  parseVideoOutputsJson,
  isSafeMediaVariantKey,
} from "../../src/lib/files/videoOptimizationConfig";
import {
  mediaVariantPath,
  resolveMediaVariantDiskPath,
} from "../../src/lib/files/videoVariantPaths";
import { buildPublicVideoPayload } from "../../src/lib/files/publicMediaUrl";
import { buildPublicImagePayload } from "../../src/lib/files/publicImageUrl";
import { DEFAULT_IMAGE_OPTIMIZATION_CONFIG } from "../../src/lib/files/imageOptimizationConfig";
import { processImageVariants } from "../../src/lib/files/processImageVariants";

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

function hasFfmpeg(): boolean {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  const p = spawnSync("ffprobe", ["-version"], { encoding: "utf8" });
  return r.status === 0 && p.status === 0;
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

function createTestMp4(filePath: string, width: number, height: number): boolean {
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=blue:s=${width}x${height}:d=2`,
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      filePath,
    ],
    { encoding: "utf8" },
  );
  return r.status === 0 && fs.existsSync(filePath);
}

async function main() {
  console.log("mediaOptimizationConfig");
  assert(isSafeMediaVariantKey("360"), "360 is safe key");
  assert(isSafeMediaVariantKey("poster"), "poster is safe key");
  assert(!isSafeMediaVariantKey("../x"), "path traversal key rejected");
  const outputs = parseVideoOutputsJson(DEFAULT_MEDIA_SETTING_PROPS.videoOutputsJson);
  assert(outputs.length === 3, "default video outputs");
  assert(
    validateMediaSettingProps({
      videoOutputsJson: '[{"name":"poster","width":640,"bitrate":"800k"}]',
    })?.videoOutputsJson != null,
    "poster reserved as output name",
  );
  const cfg = parseMediaOptimizationConfig({
    imageOptimizationEnabled: true,
    videoOptimizationEnabled: true,
    videoOutputsJson: JSON.stringify([
      { name: "480", width: 854, bitrate: "1200k" },
    ]),
  });
  assert(cfg.video.outputs[0].name === "480", "custom video output parsed");
  assert(
    detectMediaType({ mimeType: "video/mp4" }) === "video",
    "detect video mime",
  );
  assert(
    detectMediaType({ mimeType: "image/jpeg" }) === "image",
    "detect image mime",
  );

  console.log("public payloads");
  const processingVideo = buildPublicVideoPayload({
    fileName: "clip.mp4",
    status: "processing",
  });
  assert(processingVideo?.placeholder === true, "video processing placeholder");
  assert(processingVideo?.sources.length === 0, "no sources while processing");

  const readyVideo = buildPublicVideoPayload({
    fileName: "clip.mp4",
    status: "ready",
    width: 1920,
    height: 1080,
    duration: 12.5,
    variantsJson: JSON.stringify({
      "360": "/tmp/clip_360.mp4",
      "720": "/tmp/clip_720.mp4",
      poster: "/tmp/clip_poster.webp",
    }),
  });
  assert(readyVideo?.ready === true, "ready video payload");
  assert(!!readyVideo?.posterUrl.includes("variant=poster"), "poster url");
  assert(readyVideo?.sources.length === 2, "two mp4 sources");

  const readyImage = buildPublicImagePayload({
    fileName: "a.jpg",
    status: "ready",
    variantsJson: JSON.stringify({
      thumb: "/tmp/a_thumb.webp",
      small: "/tmp/a_small.webp",
    }),
  });
  assert(!!readyImage?.srcset.includes("200w"), "image srcset still works");

  console.log("variant paths");
  const vp = mediaVariantPath("/uploads/a.mp4", "720", "mp4");
  assert(vp.endsWith("a_720.mp4"), "video variant naming");
  assert(
    resolveMediaVariantDiskPath(
      {
        filePath: "/uploads/a.mp4",
        variantsJson: JSON.stringify({ "720": "/uploads/a_720.mp4" }),
      },
      "720",
    ) === "/uploads/a_720.mp4",
    "resolve video variant",
  );
  assert(
    resolveMediaVariantDiskPath(
      {
        filePath: "/uploads/a.mp4",
        variantsJson: JSON.stringify({ "720": "/etc/passwd" }),
      },
      "720",
    ) === null,
    "reject path outside original dir",
  );

  console.log("processImageVariants (regression)");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "media-opt-"));
  try {
    const largePath = path.join(tmp, "large.jpg");
    await createTestJpeg(largePath, 2000, 1500);
    const largeResult = await processImageVariants(largePath, {
      ...DEFAULT_IMAGE_OPTIMIZATION_CONFIG,
    });
    assert(Object.keys(largeResult.variants).length === 4, "image 4 variants");

    if (hasFfmpeg()) {
      console.log("processVideoVariants");
      const { processVideoVariants } = await import(
        "../src/lib/files/processVideoVariants"
      );
      const { DEFAULT_VIDEO_OPTIMIZATION_CONFIG } = await import(
        "../src/lib/files/videoOptimizationConfig"
      );
      const videoPath = path.join(tmp, "clip.mp4");
      assert(createTestMp4(videoPath, 1280, 720), "created test mp4");
      const videoResult = await processVideoVariants(videoPath, {
        ...DEFAULT_VIDEO_OPTIMIZATION_CONFIG,
      });
      assert(videoResult.width === 1280, "video width");
      // 720 source → only 360 rung (source must be larger than output width)
      assert(!!videoResult.variants["360"], "360p generated");
      assert(!videoResult.variants["720"], "720 skipped (not larger)");
      assert(!videoResult.variants["1080"], "1080 skipped");
      assert(!!videoResult.variants.poster, "poster generated");
      assert(fs.existsSync(videoResult.variants.poster!), "poster on disk");
      assert(fs.existsSync(videoPath), "original kept");
    } else {
      console.log("  ⚠ ffmpeg/ffprobe not installed — skipping video encode tests");
    }
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
