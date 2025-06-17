// Re-export GSAP and commonly used plugins for animation support
export { gsap } from "gsap";

// Re-export commonly used GSAP plugins
// Note: These plugins need to be imported separately when needed
// Example: import { ScrollTrigger } from "gsap/ScrollTrigger";
export { ScrollTrigger } from "gsap/ScrollTrigger";
export { TextPlugin } from "gsap/TextPlugin";
export { ScrollToPlugin } from "gsap/ScrollToPlugin";
export { CSSPlugin } from "gsap/CSSPlugin";
export { Draggable } from "gsap/Draggable";
export { MotionPathPlugin } from "gsap/MotionPathPlugin";
export { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
export { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
export { SplitText } from "gsap/SplitText";
export { InertiaPlugin } from "gsap/InertiaPlugin";
export { ScrollSmoother } from "gsap/ScrollSmoother";
export { Observer } from "gsap/Observer";
export { Flip } from "gsap/Flip";

// Helper function to register plugins
export function registerGSAPPlugins(...plugins: any[]) {
  if (typeof window !== "undefined" && plugins.length > 0) {
    const gsapInstance = (window as any).gsap || gsap;
    gsapInstance.registerPlugin(...plugins);
  }
}

// Common easing functions reference
export const easings = {
  // Power easings
  power1: "power1",
  power2: "power2",
  power3: "power3",
  power4: "power4",

  // Direction variations
  easeIn: ".in",
  easeOut: ".out",
  easeInOut: ".inOut",

  // Special easings
  back: "back",
  elastic: "elastic",
  bounce: "bounce",
  rough: "rough",
  slow: "slow",
  steps: "steps",
  circ: "circ",
  expo: "expo",
  sine: "sine",

  // Common presets
  none: "none",
  linear: "none",
} as const;

// Timeline creation helper
export function createTimeline(options?: gsap.TimelineVars) {
  return gsap.timeline(options);
}

// Tween creation helpers
export function createTween(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
  return gsap.to(targets, vars);
}

export function createFromTween(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars,
) {
  return gsap.from(targets, vars);
}

export function createFromToTween(
  targets: gsap.TweenTarget,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
) {
  return gsap.fromTo(targets, fromVars, toVars);
}

// Utility functions
export function killTweensOf(targets: gsap.TweenTarget) {
  gsap.killTweensOf(targets);
}

export function getTweensOf(targets: gsap.TweenTarget) {
  return gsap.getTweensOf(targets);
}

export function isTweening(targets: gsap.TweenTarget) {
  return gsap.isTweening(targets);
}

// Set default configurations
export function setGSAPDefaults(vars: gsap.TweenVars) {
  gsap.defaults(vars);
}

// Export types for TypeScript support
export type GSAPTimeline = gsap.core.Timeline;
export type GSAPTween = gsap.core.Tween;
export type GSAPTweenVars = gsap.TweenVars;
export type GSAPTimelineVars = gsap.TimelineVars;
