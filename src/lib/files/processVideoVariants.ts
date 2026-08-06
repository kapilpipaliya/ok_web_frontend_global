import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import type { VideoOptimizationConfig } from "~/lib/files/videoOptimizationConfig";
import {
  mediaVariantPath,
  serializeMediaVariantsJson,
  type MediaVariantPathMap,
} from "~/lib/files/videoVariantPaths";

export type VideoProbeResult = {
  width: number;
  height: number;
  duration: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
};

export type ProcessVideoVariantsResult = {
  width: number;
  height: number;
  aspectRatio: number;
  duration: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
  variants: MediaVariantPathMap;
  variantsJson: string;
};

function runCommand(
  command: string,
  args: string[],
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      reject(
        new Error(
          `${command} failed to start: ${err.message}. Is ffmpeg/ffprobe installed?`,
        ),
      );
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} exited with code ${code}: ${stderr.slice(-2000)}`,
          ),
        );
      }
    });
  });
}

function parseFps(raw: unknown): number {
  if (raw == null) return 0;
  const s = String(raw);
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    if (b) return a / b;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Probe video metadata with ffprobe.
 */
export async function probeVideo(
  inputPath: string,
): Promise<VideoProbeResult | null> {
  try {
    const { stdout } = await runCommand("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      inputPath,
    ]);
    const data = JSON.parse(stdout) as {
      format?: { duration?: string; bit_rate?: string };
      streams?: Array<Record<string, unknown>>;
    };
    const videoStream = (data.streams || []).find(
      (s) => s.codec_type === "video",
    );
    const audioStream = (data.streams || []).find(
      (s) => s.codec_type === "audio",
    );
    if (!videoStream) return null;

    const width = Number(videoStream.width) || 0;
    const height = Number(videoStream.height) || 0;
    if (!width || !height) return null;

    return {
      width,
      height,
      duration: Number(data.format?.duration) || 0,
      fps: parseFps(videoStream.avg_frame_rate || videoStream.r_frame_rate),
      bitrate: Number(data.format?.bit_rate) || 0,
      codec: videoStream.codec_name != null ? String(videoStream.codec_name) : "",
      audioCodec:
        audioStream?.codec_name != null ? String(audioStream.codec_name) : "",
    };
  } catch {
    return null;
  }
}

function ensureSiblingPath(originalPath: string, outputPath: string): void {
  const originalDir = path.resolve(path.dirname(originalPath));
  const outputDir = path.resolve(path.dirname(outputPath));
  if (outputDir !== originalDir) {
    throw new Error("Variant path must stay in the original directory");
  }
  if (path.resolve(outputPath) === path.resolve(originalPath)) {
    throw new Error("Variant path must not overwrite the original");
  }
}

/**
 * Transcode progressive MP4 ladder + optional poster.webp via ffmpeg.
 */
export async function processVideoVariants(
  originalPath: string,
  config: VideoOptimizationConfig,
): Promise<ProcessVideoVariantsResult> {
  if (!fs.existsSync(originalPath)) {
    throw new Error(`Original file not found: ${originalPath}`);
  }

  const probe = await probeVideo(originalPath);
  if (!probe) {
    throw new Error("Unable to probe video (is ffprobe installed?)");
  }

  const aspectRatio = Number((probe.width / probe.height).toFixed(6));
  const variants: MediaVariantPathMap = {};

  const outputs = config.outputs
    .filter((o) => probe.width > o.width)
    .sort((a, b) => a.width - b.width);

  for (const def of outputs) {
    const outputPath = mediaVariantPath(originalPath, def.name, "mp4");
    ensureSiblingPath(originalPath, outputPath);
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    await runCommand("ffmpeg", [
      "-y",
      "-i",
      originalPath,
      "-vf",
      `scale=${def.width}:-2`,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-b:v",
      def.bitrate,
      "-maxrate",
      def.bitrate,
      "-bufsize",
      def.bitrate,
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      outputPath,
    ]);

    variants[def.name] = outputPath;
  }

  if (config.poster) {
    const posterPath = mediaVariantPath(originalPath, "poster", "webp");
    ensureSiblingPath(originalPath, posterPath);
    if (fs.existsSync(posterPath)) {
      fs.unlinkSync(posterPath);
    }
    const seek = Math.min(
      config.posterSeekSeconds,
      Math.max(0, probe.duration > 0 ? probe.duration * 0.1 : 0),
    );
    // Prefer seek within duration; fall back to first frame
    try {
      await runCommand("ffmpeg", [
        "-y",
        "-ss",
        String(seek || 0),
        "-i",
        originalPath,
        "-vframes",
        "1",
        "-q:v",
        "2",
        posterPath,
      ]);
      variants.poster = posterPath;
    } catch {
      // Retry without seek
      await runCommand("ffmpeg", [
        "-y",
        "-i",
        originalPath,
        "-vframes",
        "1",
        "-q:v",
        "2",
        posterPath,
      ]);
      variants.poster = posterPath;
    }
  }

  return {
    width: probe.width,
    height: probe.height,
    aspectRatio,
    duration: probe.duration,
    fps: probe.fps,
    bitrate: probe.bitrate,
    codec: probe.codec,
    audioCodec: probe.audioCodec,
    variants,
    variantsJson: serializeMediaVariantsJson(variants),
  };
}
