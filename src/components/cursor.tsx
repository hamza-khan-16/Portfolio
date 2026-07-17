import { useEffect, useRef, useState } from "react";

export function CinematicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mx = 0, my = 0, rx = 0, ry = 0;

    const move = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("a,button,[data-cursor='hover']"))) setHover(true);
      else setHover(false);
    };
    const raf = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(raf);
    };
    window.addEventListener("pointermove", move);
    const id = requestAnimationFrame(raf);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(id); };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.88_0.22_140)] shadow-[0_0_20px_rgba(123,255,176,0.9)] mix-blend-screen"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[99] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.78_0.19_145/0.6)] transition-[width,height,opacity] duration-300 mix-blend-screen ${
          hover ? "h-14 w-14 opacity-100" : "h-8 w-8 opacity-70"
        }`}
      />
    </>
  );
}
