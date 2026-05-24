/**
 * Short completion beep in the browser (Web Audio API).
 * No-op during SSR or if audio is unavailable.
 */
export function playCompletionBeep() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioCtx =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioCtx) {
    return;
  }

  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // User gesture / autoplay policies may block audio
  }
}
