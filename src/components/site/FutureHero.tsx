import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import base from "@/assets/celia-future-base.asset.json";
import reveal from "@/assets/celia-future-reveal.asset.json";

export function FutureHero() {
  const section = useRef<HTMLElement>(null);
  const layer = useRef<HTMLImageElement>(null);
  const grid = useRef<SVGPatternElement>(null);

  useEffect(() => {
    const el = section.current;
    const image = layer.current;
    const pattern = grid.current;
    if (!el || !image || !pattern) return;
    const media = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (pointer: fine)");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let active = false;
    let width = 0;
    let height = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let offsetX = 0;
    let offsetY = 0;
    const resize = () => {
      width = el.clientWidth;
      height = el.clientHeight;
      canvas.width = Math.round(width / 2);
      canvas.height = Math.round(height / 2);
      const cell = Math.round(Math.min(64, Math.max(36, width * 0.028)));
      pattern.setAttribute("width", String(cell));
      pattern.setAttribute("height", String(cell));
      pattern.firstElementChild?.setAttribute("d", `M ${cell} 0 L 0 0 0 ${cell}`);
    };
    const draw = () => {
      if (!active || !media.matches) return;
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;
      const radius = Math.round(Math.min(420, Math.max(160, width * 0.16))) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, radius);
      for (const [stop, opacity] of [[0, 1], [0.4, 1], [0.6, 0.75], [0.75, 0.4], [0.88, 0.12], [1, 0]]) {
        if (stop !== undefined && opacity !== undefined) gradient.addColorStop(stop, `rgba(255,255,255,${opacity})`);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const mask = `url(${canvas.toDataURL()})`;
      image.style.maskImage = mask;
      image.style.webkitMaskImage = mask;
      offsetX += ((x / width - 0.5) * 16 - offsetX) * 0.06;
      offsetY += ((y / height - 0.5) * 16 - offsetY) * 0.06;
      pattern.setAttribute("x", String(offsetX));
      pattern.setAttribute("y", String(offsetY));
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1) frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (!media.matches) return;
      const rect = el.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!active) { x = targetX; y = targetY; active = true; }
      image.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = () => { active = false; cancelAnimationFrame(frame); frame = 0; image.style.opacity = "0"; };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    media.addEventListener("change", leave);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); media.removeEventListener("change", leave); };
  }, []);

  return (
    <section ref={section} aria-label="Bộ sưu tập mới CELIA" className="future-hero relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <img src={base.url} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <img ref={layer} src={reveal.url} alt="" className="future-reveal absolute inset-0 h-full w-full object-cover" />
        <svg className="future-grid absolute inset-0 h-full w-full" width="100%" height="100%">
          <defs><pattern ref={grid} id="celia-future-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.6" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#celia-future-grid)" />
        </svg>
      </div>
      <div className="future-composition relative z-10 flex flex-col justify-between gap-8 lg:flex-row">
        <div className="future-left self-start lg:self-center">
          <div className="future-headline-frame relative">
            <span className="future-corner future-corner-tl" aria-hidden="true" />
            <p className="mb-6 text-[11px] font-medium uppercase">CELIA — New Collection</p>
            <h1 className="future-headline uppercase">Future<br />Forward<br /><span className="inline-flex items-center gap-4">Fashion<span className="future-checker" aria-hidden="true" /></span></h1>
            <span className="future-corner future-corner-bl" aria-hidden="true" />
          </div>
          <Button asChild variant="outline" className="mt-8 h-12 rounded-none border-input bg-transparent px-6 text-[12px] font-medium uppercase shadow-none hover:bg-foreground hover:text-primary-foreground">
            <Link to="/categories/tat-ca-san-pham">Khám phá bộ sưu tập<ArrowUpRight strokeWidth={1.5} /></Link>
          </Button>
        </div>
        <div className="future-feature relative flex items-center gap-4 self-end p-5 lg:mb-3">
          <span className="future-corner future-corner-tl" aria-hidden="true" /><span className="future-corner future-corner-tr" aria-hidden="true" />
          <span className="future-corner future-corner-bl" aria-hidden="true" /><span className="future-corner future-corner-br" aria-hidden="true" />
          <Globe2 className="h-11 w-11 shrink-0" strokeWidth={1} />
          <p className="text-[12px] font-medium uppercase leading-6">Beyond trends.<br />Built for tomorrow.</p>
        </div>
      </div>
      <div className="relative mx-5 mb-6 aspect-[4/5] overflow-hidden border sm:aspect-video lg:hidden">
        <img src={base.url} alt="Người mẫu trong thiết kế trắng phong cách tương lai" width={1536} height={768} fetchPriority="high" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}