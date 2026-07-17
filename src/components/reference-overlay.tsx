import { useEffect, useState } from "react";

/**
 * Reference-image overlay for visually matching the 3D scene to a still.
 *
 * - Drop your reference at `public/reference.jpg` (or pass a `src` prop).
 * - Toggle with the `R` key, or click the small control panel bottom-left.
 * - Slide opacity to compare fibers, thickness, twist against the reference.
 */
export function ReferenceOverlay({ src = "/reference.jpg" }: { src?: string }) {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0.45);
  const [blend, setBlend] = useState<"normal" | "screen" | "difference">("normal");
  const [loaded, setLoaded] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
    img.src = src;
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {visible && loaded && (
        <img
          src={src}
          alt=""
          className="pointer-events-none fixed inset-0 z-40 h-screen w-screen object-cover"
          style={{ opacity, mixBlendMode: blend }}
        />
      )}
      <div className="mono fixed bottom-4 left-4 z-50 flex flex-col gap-2 rounded-md border border-white/10 bg-black/70 p-3 text-[10px] uppercase tracking-[0.25em] text-white/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded border border-white/15 px-2 py-1 hover:bg-white/10"
          >
            Ref {visible ? "on" : "off"} (R)
          </button>
          <span className="text-white/40">
            {loaded === false
              ? "no /reference.jpg"
              : loaded === null
                ? "…"
                : `${Math.round(opacity * 100)}%`}
          </span>
        </div>
        {visible && loaded && (
          <>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-40 accent-[oklch(0.78_0.19_145)]"
            />
            <div className="flex gap-1">
              {(["normal", "screen", "difference"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setBlend(m)}
                  className={`rounded border px-1.5 py-0.5 ${
                    blend === m ? "border-white/50 text-white" : "border-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
