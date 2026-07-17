import { useEffect, useRef, type MutableRefObject } from "react";

/* Leaves-only scroll audio.
   Pink noise → highpass + bandpass → gain, driven purely by scroll velocity.
   No oscillators, no hum, no chimes — just a clean leaf rustle that
   swells in when you scroll and fades out when you stop.                  */

export function useScrollSound(
  enabled = true,
  velocityRef?: MutableRefObject<number>,
) {
  const stateRef = useRef({
    ctx: null as AudioContext | null,
    started: false,
    envelope: 0,
    rawVel: 0,
    lastY: 0,
    lastT: 0,
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const start = () => {
      const s = stateRef.current;
      if (s.started) return;
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      s.ctx = ctx;
      s.started = true;

      /* ── Master ─────────────────────────────────────────────────── */
      const master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);

      /* ── Pink noise buffer ──────────────────────────────────────── */
      const bufSize = 2 * ctx.sampleRate;
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        nd[i] = (b0 + b1 + b2 + w * 0.5362) * 0.11;
      }
      const leafNoise = ctx.createBufferSource();
      leafNoise.buffer = noiseBuf;
      leafNoise.loop = true;

      /* ── Filters — shape noise into leaf rustle ─────────────────── */
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      hp.Q.value = 0.6;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3500;
      bp.Q.value = 1.2;

      /* ── Output gain (starts silent) ────────────────────────────── */
      const leafGain = ctx.createGain();
      leafGain.gain.value = 0;

      leafNoise.connect(hp);
      hp.connect(bp);
      bp.connect(leafGain);
      leafGain.connect(master);
      leafNoise.start();

      /* ── Per-frame envelope ─────────────────────────────────────── */
      let raf = 0;
      const tick = () => {
        const now = ctx.currentTime;
        s.envelope = s.envelope * 0.88 + s.rawVel * 0.12;
        s.rawVel *= 0.86;
        const e = Math.min(s.envelope, 1);
        if (velocityRef) velocityRef.current = e;

        leafGain.gain.setTargetAtTime(e * 0.7, now, 0.08);
        bp.frequency.setTargetAtTime(2800 + e * 2400, now, 0.14);

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      (ctx as unknown as { __cleanup?: () => void }).__cleanup = () => {
        cancelAnimationFrame(raf);
        try { leafNoise.stop(); } catch { /* noop */ }
        void ctx.close();
      };
    };

    const onScroll = () => {
      const s = stateRef.current;
      if (!s.started) start();
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(1, now - s.lastT);
      const dy = Math.abs(y - s.lastY);
      s.lastY = y;
      s.lastT = now;
      const impulse = Math.min((dy / dt) * 0.72, 1);
      s.rawVel = Math.max(s.rawVel, impulse);
    };

    const onFirstGesture = () => {
      start();
      const s = stateRef.current;
      if (s.ctx && s.ctx.state === "suspended") void s.ctx.resume();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      const ctx = stateRef.current.ctx as (AudioContext & { __cleanup?: () => void }) | null;
      ctx?.__cleanup?.();
      stateRef.current.ctx = null;
      stateRef.current.started = false;
    };
  }, [enabled, velocityRef]);
}