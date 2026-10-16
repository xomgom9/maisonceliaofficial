import { useEffect, useRef, useState } from "react";

/** Desktop-only: base image + second image revealed inside a soft cursor spotlight, with a subtle parallax grid. */
export function HeroReveal({ base, reveal }: { base: string; reveal: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const revealEl = useRef<HTMLDivElement>(null);
  const pattern = useRef<SVGPatternElement>(null);
  const [cell, setCell] = useState(48);

  useEffect(() => {
    const el = wrap.current;
    const rv = revealEl.current;
    if (!el || !rv || !window.matchMedia("(min-width: 1024px)").matches) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const mouse = { x: -9999, y: -9999 };
    const smooth = { x: -9999, y: -9999 };
    const off = { x: 0, y: 0 };
    let raf = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width / 4));
      canvas.height = Math.max(1, Math.round(r.height / 4));
      setCell(Math.round(Math.min(64, Math.max(36, window.innerWidth * 0.028))));
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (smooth.x < -9000) { smooth.x = mouse.x; smooth.y = mouse.y; }
    };
    const tick = () => {
      smooth.x += (mouse.x - smooth.x) * 0.1;
      smooth.y += (mouse.y - smooth.y) * 0.1;
      const r = el.getBoundingClientRect();
      const s = canvas.width / r.width;
      const radius = Math.round(Math.min(420, Math.max(160, window.innerWidth * 0.16))) * s;
      const cx = smooth.x * s, cy = smooth.y * s;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.4, "rgba(255,255,255,1)");
      g.addColorStop(0.6, "rgba(255,255,255,0.75)");
      g.addColorStop(0.75, "rgba(255,255,255,0.4)");
      g.addColorStop(0.88, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const url = `url(${canvas.toDataURL()})`;
      rv.style.maskImage = url;
      rv.style.webkitMaskImage = url;
      const nx = smooth.x / r.width - 0.5, ny = smooth.y / r.height - 0.5;
      if (smooth.x > -9000) {
        off.x += (nx * 16 - off.x) * 0.06;
        off.y += (ny * 16 - off.y) * 0.06;
        pattern.current?.setAttribute("x", off.x.toFixed(2));
        pattern.current?.setAttribute("y", off.y.toFixed(2));
      }
      raf = requestAnimationFrame(tick);
    };
    size();
    window.addEventListener("resize", size);
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const layer = "absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1400ms] ease-celia group-hover/hero:scale-[1.04]";
  return (
    <div ref={wrap} aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      <div className={layer} style={{ backgroundImage: `url(${base})` }} />
      <div
        ref={revealEl}
        className={layer}
        style={{ backgroundImage: `url(${reveal})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskImage: "linear-gradient(transparent,transparent)", WebkitMaskImage: "linear-gradient(transparent,transparent)" }}
      />
      <svg className="absolute inset-0 h-full w-full text-muted-foreground" style={{ opacity: 0.1 }}>
        <defs>
          <pattern ref={pattern} id="celia-grid" width={cell} height={cell} patternUnits="userSpaceOnUse">
            <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke="currentColor" strokeWidth={0.6} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#celia-grid)" />
      </svg>
    </div>
  );
}
