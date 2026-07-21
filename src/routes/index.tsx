import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { motion, useInView } from "framer-motion";
import { CinematicCursor } from "@/components/cursor";
import { useScrollSound } from "@/hooks/use-scroll-sound";

const BranchScene = lazy(() =>
  import("@/components/branch-scene").then((m) => ({ default: m.BranchScene })),
);

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [{ title: "Hamza K. — Full-Stack Developer" }],
  }),
});

/* ─── Supabase config ─────────────────────────────────── */
const SB_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "Hamza@dev.com";
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE ?? "+91 00000 00000";

type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string;
  live_url: string;
  num: string;
  image_url: string;
};
type SiteSettings = {
  hero_image_url?: string;
  about_image_url?: string;
  resume_url?: string;
};

async function sbFetch<T>(path: string): Promise<T> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  return r.json();
}

/* ─── helpers ─────────────────────────────────────────── */
function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mono flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[oklch(0.78_0.19_145)]">
      <span className="inline-block h-px w-8 bg-[oklch(0.78_0.19_145/0.6)]" />
      <span>{n}</span>
      <span className="text-muted-foreground">/ {title}</span>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedDot({ delay = 0, size = "sm" }: { delay?: number; size?: "sm" | "lg" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  if (size === "lg") {
    return (
      <div ref={ref} className="absolute left-0 top-2 h-6 w-6 -translate-x-1/2 md:left-1/2">
        <motion.div
          className="absolute inset-0 rounded-full border border-[oklch(0.78_0.19_145/0.5)]"
          initial={{ opacity: 0.3 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.4, delay }}
        />
        <motion.div
          className="absolute inset-2 rounded-full"
          initial={{ backgroundColor: "oklch(0.3 0.04 155)", boxShadow: "none" }}
          animate={inView ? { backgroundColor: "oklch(0.88 0.22 140)", boxShadow: "0 0 25px oklch(0.88 0.22 140 / 0.9)" } : {}}
          transition={{ duration: 0.5, delay }}
        />
        <div className="absolute inset-1.5 rounded-full bg-[oklch(0.08_0.02_155)]" />
        <motion.div
          className="absolute inset-2.5 rounded-full"
          initial={{ backgroundColor: "oklch(0.3 0.04 155)" }}
          animate={inView ? { backgroundColor: "oklch(0.88 0.22 140)" } : {}}
          transition={{ duration: 0.5, delay: delay + 0.15 }}
        />
      </div>
    );
  }
  return (
    <div ref={ref}>
      <motion.div
        className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full"
        initial={{ backgroundColor: "oklch(0.25 0.03 155)", boxShadow: "none" }}
        animate={inView ? { backgroundColor: "oklch(0.88 0.22 140)", boxShadow: "0 0 14px oklch(0.88 0.22 140 / 0.9)" } : {}}
        transition={{ duration: 0.5, delay }}
      />
    </div>
  );
}

function AnimatedProcessDot({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  return (
    <div ref={ref} className="relative mx-auto mb-6 h-12 w-12 md:mx-0">
      <motion.div
        className="absolute inset-0 rounded-full border"
        initial={{ borderColor: "oklch(0.78 0.19 145 / 0.2)" }}
        animate={inView ? { borderColor: "oklch(0.78 0.19 145 / 0.8)" } : {}}
        transition={{ duration: 0.4, delay }}
      />
      <motion.div
        className="absolute inset-2 rounded-full"
        initial={{ backgroundColor: "oklch(0.25 0.03 155)", boxShadow: "none" }}
        animate={inView ? { backgroundColor: "oklch(0.88 0.22 140)", boxShadow: "0 0 30px oklch(0.88 0.22 140 / 0.7)" } : {}}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
      />
    </div>
  );
}

function AnimatedBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  return (
    <div ref={ref} className="mt-3 h-1 w-full rounded-full bg-[oklch(0.15_0.02_155)]">
      <motion.div
        className="h-full rounded-full bg-[oklch(0.78_0.19_145)] shadow-[0_0_8px_oklch(0.78_0.19_145/0.6)]"
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </div>
  );
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass shimmer-border relative rounded-sm p-8 ${className}`}>
      {children}
    </div>
  );
}

function PillButton({
  children,
  variant = "primary",
  href = "#",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      data-cursor="hover"
      className={`mono group relative inline-flex items-center gap-3 overflow-hidden rounded-sm px-6 py-3.5 text-[11px] uppercase tracking-[0.28em] transition-all duration-500 breathe ${
        variant === "primary"
          ? "bg-[oklch(0.78_0.19_145)] text-[oklch(0.08_0.02_155)] hover:bg-[oklch(0.85_0.2_140)] shadow-[0_0_40px_-8px_oklch(0.78_0.19_145/0.7)]"
          : "border border-[oklch(0.78_0.19_145/0.35)] text-foreground hover:border-[oklch(0.78_0.19_145/0.8)] hover:bg-[oklch(0.78_0.19_145/0.06)]"
      }`}
    >
      <span>{children}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    </a>
  );
}

/* ─── Skeleton card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="glass shimmer-border rounded-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-[oklch(0.15_0.02_155)]" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-1/4 rounded bg-[oklch(0.2_0.02_155)]" />
        <div className="h-5 w-2/3 rounded bg-[oklch(0.2_0.02_155)]" />
        <div className="h-3 w-full rounded bg-[oklch(0.18_0.02_155)]" />
        <div className="h-3 w-4/5 rounded bg-[oklch(0.18_0.02_155)]" />
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */
function Index() {
  const scrollRef = useRef(0);
  const velocityRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [resumeLoading, setResumeLoading] = useState(false);
  useScrollSound(true, velocityRef);

  /* load Supabase data */
  useEffect(() => {
    if (!SB_URL || SB_URL.startsWith("%%")) return;
    Promise.all([
      sbFetch<Project[]>("projects?select=*&order=num"),
      sbFetch<SiteSettings[]>("site_settings?id=eq.main&select=*"),
    ])
      .then(([projs, settings]) => {
        setProjects(projs ?? []);
        setSiteSettings(settings?.[0] ?? {});
      })
      .catch(() => setProjects([]));
  }, []);

  /* smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, smoothWheel: true });
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      scrollRef.current = p;
      setProgress(p);
      const sections = document.querySelectorAll<HTMLElement>("[data-section]");
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      sections.forEach((s, i) => { if (s.offsetTop <= mid) idx = i; });
      setActiveSection(idx);
    };
    lenis.on("scroll", onScroll);
    onScroll();
    return () => { lenis.destroy(); };
  }, []);

  const nav = [
    { n: "01", label: "Home", id: "hero" },
    { n: "02", label: "About", id: "about" },
    { n: "03", label: "Skills", id: "skills" },
    { n: "04", label: "Experience", id: "experience" },
    { n: "05", label: "Projects", id: "projects" },
    { n: "06", label: "Process", id: "process" },
    { n: "07", label: "Voices", id: "testimonials" },
    { n: "08", label: "Contact", id: "contact" },
  ];

  const heroImg = siteSettings.hero_image_url || "/portfolio/Hamza.jpg";
  const aboutImg = siteSettings.about_image_url || "/portfolio/Hamza.jpg";

  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('input[name="name"]') as HTMLInputElement)?.value ?? "";
    const email = (form.querySelector('input[name="email"]') as HTMLInputElement)?.value ?? "";
    const message = (form.querySelector('textarea[name="message"]') as HTMLTextAreaElement)?.value ?? "";
    const subject = encodeURIComponent(`Project Inquiry from ${name}`);
    const body = encodeURIComponent(`Hi Hamza,\n\nName: ${name}\nEmail: ${email}\n\n${message}`);
    const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;

    // Open mailto: immediately within the user-gesture handler.
    // Using window.open avoids mobile browsers blocking navigations
    // that happen inside a setTimeout (which loses the gesture context).
    setContactStatus("sending");
    window.open(mailtoUrl, "_self");
    form.reset();
    setContactStatus("sent");
    setTimeout(() => setContactStatus("idle"), 3000);
  }

  async function handleResume(e: React.MouseEvent) {
    e.preventDefault();
    const url = siteSettings.resume_url;
    if (!url) return;
    setResumeLoading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      let filename = url.split("/").pop()?.split("?")[0] || "resume.pdf";
      try { filename = decodeURIComponent(filename); } catch {}
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    } catch {
      window.open(url, "_blank");
    }
    setResumeLoading(false);
  }

  const testimonials = [
    { q: "Hamza is a fantastic developer who delivered beyond expectations and communicated perfectly throughout the project.", a: "Sarah J.", r: "Product Manager, Nimbus Labs" },
    { q: "Incredibly detail oriented and fast. Our web app went from concept to production in record time, flawlessly.", a: "Marco T.", r: "Startup Founder" },
    { q: "Clear communicator, fast shipper, and genuinely fun to build with. I'd hire him again in a heartbeat.", a: "Elena R.", r: "Design Lead, Studio Pixel" },
  ];
  const [testiIdx, setTestiIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTestiIdx((i) => (i + 1) % testimonials.length), 5200);
    return () => clearInterval(t);
  }, []);

  const skills = [
    { k: "JavaScript / TypeScript", v: 92 },
    { k: "React / Next.js", v: 95 },
    { k: "Node.js / Express", v: 88 },
    { k: "Databases / DevOps", v: 80 },
    { k: "Tailwind / CSS", v: 90 },
    { k: "Git / GitHub", v: 85 },
    { k: "REST / GraphQL", v: 82 },
    { k: "Supabase / Firebase", v: 78 },
  ];

  return (
    <div className="relative bg-background text-foreground">
      <CinematicCursor />

      {/* Fixed 3D scene */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-background" />}>
          <BranchScene scrollRef={scrollRef} velocityRef={velocityRef} />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_40%,oklch(0.05_0.01_155/0.75)_100%)]" />
      </div>

      {/* Top nav */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 md:py-7">
        <a href="#hero" className="mono text-xs tracking-[0.35em]" data-cursor="hover">
          HAMZA<span className="text-[oklch(0.78_0.19_145)]">.DEV</span>
        </a>
        <nav className="mono hidden items-center gap-7 text-[11px] uppercase tracking-[0.28em] md:flex">
          {nav.slice(0, 6).map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              data-cursor="hover"
              className={`relative transition-colors ${
                activeSection === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[oklch(0.78_0.19_145)]">{n.n}_</span>
              {n.label}
              {activeSection === i && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1.5 left-0 h-px w-full bg-[oklch(0.88_0.22_140)]"
                />
              )}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="mono hidden items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.78_0.19_145)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.88_0.22_140)]" />
            </span>
            Available for work
          </div>
          <a
            href="#contact"
            data-cursor="hover"
            className="mono inline-flex items-center gap-2 rounded-sm border border-[oklch(0.78_0.19_145/0.35)] px-4 py-2 text-[10px] uppercase tracking-[0.3em] hover:border-[oklch(0.78_0.19_145)]"
          >
            Let's connect
            <span aria-hidden>↗</span>
          </a>
        </div>
      </header>

      {/* Left rail */}
      <div className="mono pointer-events-none fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="relative h-[52vh] w-px bg-[oklch(0.78_0.19_145/0.15)]">
          <div
            className="absolute left-0 top-0 w-px bg-gradient-to-b from-[oklch(0.88_0.22_140)] to-transparent shadow-[0_0_12px_oklch(0.88_0.22_140/0.9)]"
            style={{ height: `${progress * 100}%` }}
          />
          <div
            className="absolute -left-[3px] h-2 w-2 rounded-full bg-[oklch(0.88_0.22_140)] shadow-[0_0_14px_oklch(0.88_0.22_140)]"
            style={{ top: `calc(${progress * 100}% - 4px)` }}
          />
        </div>
        <div className="mt-4 -rotate-90 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
          Scroll · Journey
        </div>
      </div>

      <div className="mono pointer-events-none fixed bottom-6 left-6 z-40 hidden text-[10px] uppercase tracking-[0.3em] md:block">
        <div className="text-[oklch(0.78_0.19_145)]">▚▚ Now growing</div>
        <div className="mt-1 text-muted-foreground">branch_{String(Math.floor(progress * 8) + 1).padStart(2, "0")}.exr</div>
      </div>
      <div className="mono pointer-events-none fixed bottom-6 right-6 z-40 hidden -rotate-90 origin-bottom-right text-[9px] uppercase tracking-[0.4em] text-muted-foreground md:block">
        <span>Est · MMXXV · Portfolio</span>
      </div>

      {/* Content */}
      <main className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section id="hero" data-section className="relative flex min-h-screen items-center px-6 md:px-16">
          {/* Hero layout: text left, card right on desktop; stacked on mobile */}
          <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 pt-24 pb-20 lg:pt-0 lg:pb-0">

            {/* Left: Text content */}
            <div className="flex-1 max-w-2xl">
              <Reveal>
                <SectionLabel n="01_" title="The trunk" />
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mono mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "oklch(0.78 0.19 145)", transform: "rotate(-2deg)", display: "inline-block" }}>
                    Hey there! 👋
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <h1 className="mt-6 text-[clamp(2.6rem,6vw,7rem)] font-light leading-[0.95] tracking-[-0.02em]">
                  I'm <span style={{ fontFamily: "'Caveat', cursive", color: "oklch(0.78 0.19 145)" }}>Hamza</span><br />
                  I build<br />
                  <span className="text-emerald-glow italic font-normal">digital experiences_</span>
                </h1>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="mono mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Full-stack developer crafting modern, fast and accessible web experiences — one sketch, one commit at a time.
                </p>
              </Reveal>
              <Reveal delay={0.5}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <PillButton href="#projects">Explore my work</PillButton>
                  {siteSettings.resume_url ? (
                    <PillButton href={siteSettings.resume_url} variant="ghost" onClick={handleResume}>
                      {resumeLoading ? "Downloading…" : "Download Resume"}
                    </PillButton>
                  ) : (
                    <PillButton href="#about" variant="ghost">About me</PillButton>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right: ID card with left sidebar panel */}
            <div className="flex-shrink-0 flex items-stretch gap-3 self-center lg:self-auto">

              {/* Left decorative panel — mirrors the footer bar below the photo */}
              <Reveal delay={0.65}>
                <div
                  className="hidden sm:flex flex-col justify-between py-4 px-3 rounded-[10px]"
                  style={{
                    width: "52px",
                    background: "oklch(0.07 0.015 155 / 0.95)",
                    border: "1.5px solid oklch(0.78 0.19 145 / 0.35)",
                    boxShadow: "0 0 30px oklch(0.78 0.19 145 / 0.1)",
                  }}
                >
                  {/* Top: pulsing status dot */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: "oklch(0.78 0.19 145)" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "oklch(0.88 0.22 140)", boxShadow: "0 0 8px oklch(0.88 0.22 140)" }} />
                    </span>
                    <div style={{ height: "1px", width: "24px", background: "oklch(0.78 0.19 145 / 0.2)" }} />
                  </div>

                  {/* Middle: vertical label */}
                  <div
                    className="mono text-[8px] uppercase tracking-[0.35em] flex-1 flex items-center justify-center"
                    style={{
                      color: "oklch(0.78 0.19 145 / 0.55)",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      letterSpacing: "0.35em",
                    }}
                  >
                    PORTFOLIO · 2025
                  </div>

                  {/* Bottom: stacked dot strip */}
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ height: "1px", width: "24px", background: "oklch(0.78 0.19 145 / 0.2)" }} />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: "4px",
                          height: "4px",
                          background: i < 2 ? "oklch(0.88 0.22 140)" : "oklch(0.78 0.19 145 / 0.22)",
                          boxShadow: i < 2 ? "0 0 5px oklch(0.88 0.22 140 / 0.6)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* ID Card */}
              <Reveal delay={0.7}>
                <div
                  className="float-slow relative overflow-hidden w-[min(360px,82vw)] sm:w-[380px] lg:w-[420px]"
                  style={{
                    background: "oklch(0.07 0.015 155 / 0.95)",
                    border: "1.5px solid oklch(0.78 0.19 145 / 0.65)",
                    borderRadius: "14px",
                    boxShadow: "0 0 50px oklch(0.78 0.19 145 / 0.22), 0 0 100px oklch(0.78 0.19 145 / 0.08), inset 0 0 30px oklch(0.78 0.19 145 / 0.03)",
                    transform: "rotate(3deg)",
                  }}
                >
                  {/* Header bar */}
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid oklch(0.78 0.19 145 / 0.2)", background: "oklch(0.09 0.02 155 / 0.8)" }}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: "oklch(0.88 0.22 140)", boxShadow: "0 0 8px oklch(0.88 0.22 140)" }} />
                      <span className="mono text-[9px] uppercase tracking-[0.4em]" style={{ color: "oklch(0.78 0.19 145)" }}>ID · HAMZA.DEV</span>
                    </div>
                    <span className="mono text-[9px] tracking-widest text-muted-foreground">#HK-2025</span>
                  </div>

                  {/* Body — photo left, info right */}
                  <div className="flex gap-0">

                    {/* Left: photo — tall */}
                    <div className="relative flex-shrink-0" style={{ width: "140px" }}>
                      <div className="relative overflow-hidden" style={{ height: "220px" }}>
                        <img
                          src={heroImg}
                          alt="Hamza"
                          className="w-full h-full object-cover object-top"
                          style={{ filter: "contrast(1.08) brightness(0.92)" }}
                        />
                        {/* right fade into card */}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 65%, oklch(0.07 0.015 155 / 0.55))", pointerEvents: "none" }} />
                        {/* subtle green edge glow */}
                        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 22px oklch(0.78 0.19 145 / 0.1)", pointerEvents: "none" }} />
                      </div>
                      {/* vertical divider line */}
                      <div className="absolute right-0 top-0 h-full w-px" style={{ background: "linear-gradient(to bottom, transparent, oklch(0.78 0.19 145 / 0.45), transparent)" }} />
                    </div>

                    {/* Right: info */}
                    <div className="flex flex-col justify-between flex-1 p-4">
                      {/* Name + role */}
                      <div>
                        <div className="mono text-[9px] uppercase tracking-[0.4em] mb-1" style={{ color: "oklch(0.78 0.19 145 / 0.7)" }}>Full-Stack Developer</div>
                        <div className="text-[1.1rem] font-light leading-tight tracking-tight text-white">Hamza Khan</div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "oklch(0.78 0.19 145)" }} />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.88 0.22 140)" }} />
                          </span>
                          <span className="mono text-[9px] uppercase tracking-[0.3em]" style={{ color: "oklch(0.78 0.19 145)" }}>Available for work</span>
                        </div>
                      </div>

                      <div className="my-3" style={{ height: "1px", background: "oklch(0.78 0.19 145 / 0.18)" }} />

                      {/* Info fields */}
                      <div className="space-y-2.5">
                        {[
                          { label: "Expertise", value: "React · Node · TS" },
                          { label: "Location", value: "India 🇮🇳" },
                          { label: "Experience", value: "4+ years" },
                          { label: "Projects", value: "50+ shipped" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-baseline justify-between gap-2">
                            <span className="mono text-[9px] uppercase tracking-[0.25em]" style={{ color: "oklch(0.78 0.19 145 / 0.6)" }}>{label}</span>
                            <span className="mono text-[10px] text-right" style={{ color: "oklch(0.9 0.04 155)" }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="my-3" style={{ height: "1px", background: "oklch(0.78 0.19 145 / 0.18)" }} />

                      {/* Barcode */}
                      <div className="flex items-center gap-2">
                        <div className="flex gap-px">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} style={{ width: i % 3 === 0 ? "2px" : "1px", height: "16px", background: `oklch(0.78 0.19 145 / ${0.2 + (i % 4) * 0.15})` }} />
                          ))}
                        </div>
                        <span className="mono text-[8px] tracking-widest" style={{ color: "oklch(0.78 0.19 145 / 0.4)" }}>HAMZA·2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer bar */}
                  <div
                    className="flex items-center justify-between px-4 py-2"
                    style={{
                      borderTop: "1px solid oklch(0.78 0.19 145 / 0.18)",
                      background: "oklch(0.06 0.015 155 / 0.9)",
                    }}
                  >
                    {/* Left: dots strip */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: "4px", height: "4px",
                            background: i < 3 ? "oklch(0.88 0.22 140)" : "oklch(0.78 0.19 145 / 0.25)",
                            boxShadow: i < 3 ? "0 0 5px oklch(0.88 0.22 140 / 0.7)" : "none",
                          }}
                        />
                      ))}
                    </div>
                    {/* Center: scan line */}
                    <div className="flex-1 mx-3 flex gap-px items-center">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} style={{
                          flex: 1,
                          height: i % 5 === 0 ? "8px" : i % 2 === 0 ? "5px" : "3px",
                          background: `oklch(0.78 0.19 145 / ${0.1 + (i % 3) * 0.08})`,
                          borderRadius: "1px",
                        }} />
                      ))}
                    </div>
                    {/* Right: label */}
                    <span className="mono text-[8px] uppercase tracking-[0.3em]" style={{ color: "oklch(0.78 0.19 145 / 0.45)" }}>VALID · 2025</span>
                  </div>

                  {/* Corner brackets */}
                  <svg className="absolute top-0 left-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M1 12 L1 1 L12 1" stroke="oklch(0.88 0.22 140)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <svg className="absolute bottom-0 right-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M19 8 L19 19 L8 19" stroke="oklch(0.88 0.22 140)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <svg className="absolute top-0 right-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8 1 L19 1 L19 12" stroke="oklch(0.78 0.19 145 / 0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <svg className="absolute bottom-0 left-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 19 L1 19 L1 8" stroke="oklch(0.78 0.19 145 / 0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="mono absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
            <span className="animate-pulse">scroll to travel ↓</span>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────────────── */}
        <section id="about" data-section className="relative min-h-screen px-6 py-32 md:px-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal><SectionLabel n="02_" title="A smaller branch" /></Reveal>
              <Reveal delay={0.15}>
                <h2 className="mt-6 text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1] tracking-[-0.02em]">
                  Built from<br /><span className="text-emerald-glow italic">curiosity</span> and<br />
                  late-night commits.
                </h2>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-8 relative" style={{ maxWidth: 260 }}>
                  <div className="rounded-sm overflow-hidden" style={{ transform: "rotate(-2deg)", boxShadow: "4px 6px 18px rgba(0,0,0,0.4)" }}>
                    <img src={aboutImg} alt="Hamza" className="w-full aspect-square object-cover grayscale-[0.4]" />
                  </div>
                  <div className="mono absolute bottom-3 left-3 text-xs" style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#aaa" }}>
                    it's me!
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-7 md:pt-24">
              <Reveal delay={0.25}>
                <GlassPanel>
                  <p className="mono text-sm leading-relaxed text-muted-foreground">
                    I'm a passionate full-stack developer based in India. I love turning ideas into reality using code, and creating impactful digital solutions. Always curious, always learning — I sketch out problems before I solve them in code.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[oklch(0.78_0.19_145/0.15)] pt-6">
                    {[
                      { k: "4+", v: "years coding" },
                      { k: "50+", v: "projects completed" },
                      { k: "20+", v: "happy clients" },
                    ].map((s) => (
                      <div key={s.v}>
                        <div className="text-emerald-glow text-3xl font-light">{s.k}</div>
                        <div className="mono mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.v}</div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="mt-6">
                  <GlassPanel className="!p-6">
                    <div className="mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Timeline</div>
                    {[
                      { y: "2026", t: "Freelance & Open Source", d: "Crafting products, mentoring, shipping ideas." },
                      { y: "2023", t: "Full Stack Developer", d: "Building end-to-end products with React & Node." },
                      { y: "2022", t: "Frontend Intern", d: "PixelWorks — learned production-grade React." },
                      { y: "2021", t: "Started Coding", d: "Learned HTML, CSS & JS fundamentals." },
                    ].map((e, ei) => (
                      <div key={e.y} className="relative pl-6 pb-5 border-l border-[oklch(0.78_0.19_145/0.25)] last:pb-0">
                        <AnimatedDot delay={ei * 0.12} />
                        <div className="mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.78_0.19_145)]">{e.y}</div>
                        <div className="text-sm font-light">{e.t}</div>
                        <div className="mono text-xs text-muted-foreground">{e.d}</div>
                      </div>
                    ))}
                  </GlassPanel>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── SKILLS ───────────────────────────────────────── */}
        <section id="skills" data-section className="relative min-h-[70vh] px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionLabel n="03_" title="Glowing fruit" /></Reveal>
            <Reveal delay={0.15}>
              <h2 className="mt-6 max-w-3xl text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1] tracking-[-0.02em]">
                Skills I use<br /><span className="italic text-emerald-glow">every day_</span>.
              </h2>
            </Reveal>
            <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
              {skills.map((s, i) => (
                <Reveal key={s.k} delay={i * 0.04}>
                  <div
                    data-cursor="hover"
                    className="group relative overflow-hidden rounded-sm border border-[oklch(0.78_0.19_145/0.15)] bg-[oklch(0.1_0.02_155/0.5)] p-5 transition-all duration-500 hover:border-[oklch(0.78_0.19_145/0.7)] hover:bg-[oklch(0.14_0.03_155/0.7)]"
                  >
                    <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-[oklch(0.78_0.19_145)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />
                    <div className="mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{s.v}%</div>
                    <div className="mt-2 text-base font-light leading-tight">{s.k}</div>
                    <AnimatedBar value={s.v} />
                    <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[oklch(0.88_0.22_140)] shadow-[0_0_10px_oklch(0.88_0.22_140)] transition-all duration-500 group-hover:scale-[2]" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────── */}
        <section id="experience" data-section className="relative min-h-screen px-6 py-32 md:px-16">
          <div className="mx-auto max-w-5xl">
            <Reveal><SectionLabel n="04_" title="Rings of the branch" /></Reveal>
            <Reveal delay={0.15}>
              <h2 className="mt-6 text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1] tracking-[-0.02em]">
                A timeline<br />etched into <span className="italic text-emerald-glow">bark</span>.
              </h2>
            </Reveal>
            <div className="mt-20 relative">
              <div className="absolute left-3 top-0 h-full w-px bg-gradient-to-b from-[oklch(0.78_0.19_145/0.6)] via-[oklch(0.78_0.19_145/0.25)] to-transparent md:left-1/2" />
              {[
                { y: "2025–Now", t: "Full Stack Developer", c: "Freelance", d: "Building end-to-end web products for clients — from sketch to deployment." },
                { y: "2023–2025", t: "Software Engineer", c: "TechNova Labs", d: "Built and scaled internal tools and customer-facing dashboards for a fast-growing SaaS product." },
                { y: "2022–2023", t: "Frontend Intern", c: "PixelWorks", d: "Learned the ropes of production-grade React applications and design systems." },
              ].map((e, i) => (
                <Reveal key={e.y} delay={i * 0.08}>
                  <div className={`relative mb-16 grid grid-cols-1 items-center gap-6 md:grid-cols-2 ${i % 2 ? "md:flex-row-reverse" : ""}`}>
                    <div className={`hidden md:block ${i % 2 === 0 ? "md:order-1" : "md:order-2"}`}>
                      <GlassPanel className="!p-6">
                        <div className="mono text-[10px] uppercase tracking-[0.3em] text-[oklch(0.88_0.22_140)]">{e.c}</div>
                        <div className="mt-2 text-xl font-light">{e.t}</div>
                        <p className="mono mt-3 text-xs leading-relaxed text-muted-foreground">{e.d}</p>
                      </GlassPanel>
                    </div>
                    <div className={`relative pl-12 md:pl-0 ${i % 2 === 0 ? "md:order-2 md:pl-12" : "md:order-1 md:pr-12 md:text-right"}`}>
                      <AnimatedDot size="lg" delay={i * 0.15} />
                      <div className="mono text-3xl font-light text-emerald-glow">{e.y}</div>
                      <div className="mono mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:hidden">{e.c} — {e.t}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROJECTS ─────────────────────────────────────── */}
        <section id="projects" data-section className="relative min-h-screen px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionLabel n="05_" title="Crystalline flowers" /></Reveal>
            <Reveal delay={0.15}>
              <h2 className="mt-6 text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1] tracking-[-0.02em]">
                Featured <span className="italic text-emerald-glow">projects_</span>
              </h2>
            </Reveal>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects === null ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : projects.length === 0 ? (
                <div className="col-span-3 py-20 text-center mono text-muted-foreground text-sm">
                  No projects yet — add them in the admin panel.
                </div>
              ) : (
                projects.map((p, i) => (
                  <Reveal key={p.id ?? p.title} delay={i * 0.07}>
                    <div
                      data-cursor="hover"
                      className="glass shimmer-border group rounded-sm overflow-hidden transition-all duration-500 hover:border-[oklch(0.78_0.19_145/0.5)]"
                    >
                      <div className="relative h-48 overflow-hidden bg-[oklch(0.1_0.02_155)]">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.09_0.015_155/0.8)] to-transparent" />
                        <div className="mono absolute top-3 left-3 text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.19_145)]">
                          {p.num}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-light">{p.title}</h3>
                        <p className="mono mt-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.tags.split(",").map((t) => (
                            <span
                              key={t}
                              className="mono rounded-sm border border-[oklch(0.78_0.19_145/0.25)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                        {p.live_url && (
                          <a
                            href={p.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[oklch(0.78_0.19_145)] hover:text-[oklch(0.88_0.22_140)] transition-colors"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── PROCESS ──────────────────────────────────────── */}
        <section id="process" data-section className="relative min-h-[70vh] px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionLabel n="06_" title="Living roots" /></Reveal>
            <Reveal delay={0.15}>
              <h2 className="mt-6 max-w-3xl text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1] tracking-[-0.02em]">
                How the <span className="italic text-emerald-glow">energy</span> travels.
              </h2>
            </Reveal>
            <div className="mt-20 relative">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.19_145/0.5)] to-transparent md:block" />
              <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
                {[
                  { k: "01. Idea", d: "Understanding the problem & brainstorming solutions." },
                  { k: "02. Plan", d: "Planning the structure, tech stack and workflow." },
                  { k: "03. Build", d: "Writing clean code & bringing ideas to life." },
                  { k: "04. Test", d: "Testing for quality, performance and accessibility." },
                  { k: "05. Launch", d: "Deploying and making a lasting impact." },
                ].map((s, i) => (
                  <Reveal key={s.k} delay={i * 0.1}>
                    <div className="text-center md:text-left" data-cursor="hover">
                      <AnimatedProcessDot delay={i * 0.12} />
                      <div className="mt-8 text-lg font-light">{s.k}</div>
                      <div className="mono mt-2 text-xs leading-relaxed text-muted-foreground">{s.d}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────── */}
        <section id="testimonials" data-section className="relative min-h-[60vh] px-6 py-32 md:px-16">
          <div className="mx-auto max-w-5xl">
            <Reveal><SectionLabel n="07_" title="Kind words" /></Reveal>
            <Reveal delay={0.15}>
              <h2 className="mt-6 text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1] tracking-[-0.02em]">
                What people <span className="italic text-emerald-glow">say</span>.
              </h2>
            </Reveal>
            <div className="mt-16 max-w-2xl mx-auto text-center">
              <Reveal delay={0.2}>
                <GlassPanel>
                  <motion.div
                    key={testiIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mono text-4xl text-[oklch(0.78_0.19_145)] mb-2">"</div>
                    <p className="text-lg font-light leading-relaxed">{testimonials[testiIdx].q}</p>
                    <div className="mt-6 flex items-center justify-center gap-3 border-t border-[oklch(0.78_0.19_145/0.15)] pt-4">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[oklch(0.78_0.19_145)] to-[oklch(0.4_0.1_155)]" />
                      <div className="text-left">
                        <div className="mono text-xs">{testimonials[testiIdx].a}</div>
                        <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{testimonials[testiIdx].r}</div>
                      </div>
                    </div>
                  </motion.div>
                </GlassPanel>
              </Reveal>
              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestiIdx(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === testiIdx ? "bg-[oklch(0.78_0.19_145)]" : "bg-[oklch(0.3_0.02_155)]"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────── */}
        <section id="contact" data-section className="relative min-h-screen px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 gap-16 md:grid-cols-2 items-start">
            <div>
              <Reveal><SectionLabel n="08_" title="End of the branch" /></Reveal>
              <Reveal delay={0.15}>
                <h2 className="mt-6 text-[clamp(2.4rem,5vw,5rem)] font-light leading-[0.95] tracking-[-0.02em]">
                  Let's create<br />something <span className="italic text-emerald-glow">amazing</span><br />together.
                </h2>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="mono mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Have an idea worth building? Drop a line — every great project starts with a conversation.
                </p>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="mt-10 space-y-4">
                  <a
                    href={`mailto:${ADMIN_EMAIL}`}
                    className="mono flex items-center gap-4 text-sm text-foreground hover:text-[oklch(0.78_0.19_145)] transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.78_0.19_145/0.35)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 6-10 7L2 6" />
                      </svg>
                    </span>
                    {ADMIN_EMAIL}
                  </a>
                  <a
                    href={`tel:${ADMIN_PHONE}`}
                    className="mono flex items-center gap-4 text-sm text-foreground hover:text-[oklch(0.78_0.19_145)] transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.78_0.19_145/0.35)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.42 2 2 0 0 1 3.62 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.08-1.08a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                    </span>
                    {ADMIN_PHONE}
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.5}>
                <div className="mono mt-10 flex gap-4">
                  {[
                    { label: "GitHub", href: "https://www.github.com/hamza-khan-16", icon: <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /> },
                    { label: "LinkedIn", href: "https://www.linkedin.com/in/hamza-khan-918b12360", icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="11" x2="8" y2="16" /><line x1="8" y1="8" x2="8" y2="8.01" /><line x1="12" y1="16" x2="12" y2="11" /><path d="M12 13c0-1.5 3-2.5 4-1 .6.8.6 2 .6 2v2" /></> },
                    { label: "Instagram", href: "https://www.instagram.com/hamzaaaaa_29", icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></> },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      data-cursor="hover"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[oklch(0.78_0.19_145/0.35)] text-muted-foreground transition-all hover:border-[oklch(0.78_0.19_145)] hover:text-foreground hover:bg-[oklch(0.78_0.19_145/0.1)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {s.icon}
                      </svg>
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.3}>
              <form onSubmit={handleContact} className="mt-8 md:mt-0">
                <GlassPanel>
                  <div className="mono flex items-center gap-2 border-b border-[oklch(0.78_0.19_145/0.15)] pb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.88_0.22_140)] animate-pulse" />
                    terminal · /send-message
                  </div>
                  <div className="mt-4 space-y-4">
                    <label className="mono block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Your name
                      <input
                        name="name"
                        type="text"
                        required
                        className="mono mt-2 w-full rounded-none border-0 border-b border-[oklch(0.78_0.19_145/0.3)] bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-[oklch(0.88_0.22_140)] placeholder:text-muted-foreground/50"
                        placeholder="Rahul Sharma"
                      />
                    </label>
                    <label className="mono block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Your email
                      <input
                        name="email"
                        type="email"
                        required
                        className="mono mt-2 w-full rounded-none border-0 border-b border-[oklch(0.78_0.19_145/0.3)] bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-[oklch(0.88_0.22_140)] placeholder:text-muted-foreground/50"
                        placeholder="rahul@example.com"
                      />
                    </label>
                    <label className="mono block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Message
                      <textarea
                        name="message"
                        rows={4}
                        required
                        className="mono mt-2 w-full resize-none rounded-none border-0 border-b border-[oklch(0.78_0.19_145/0.3)] bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-[oklch(0.88_0.22_140)] placeholder:text-muted-foreground/50"
                        placeholder="Tell me about your project..."
                      />
                    </label>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {contactStatus === "sent" ? "✓ Message sent!" : "Send via email"}
                    </div>
                    <button
                      type="submit"
                      data-cursor="hover"
                      className="mono group relative inline-flex items-center gap-3 overflow-hidden rounded-sm px-6 py-3.5 text-[11px] uppercase tracking-[0.28em] transition-all duration-500 breathe bg-[oklch(0.78_0.19_145)] text-[oklch(0.08_0.02_155)] hover:bg-[oklch(0.85_0.2_140)] shadow-[0_0_40px_-8px_oklch(0.78_0.19_145/0.7)]"
                    >
                      <span>{contactStatus === "sending" ? "Sending…" : contactStatus === "sent" ? "Sent ✓" : "Send Message"}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      </svg>
                    </button>
                  </div>
                </GlassPanel>
              </form>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="relative border-t border-[oklch(0.78_0.19_145/0.12)] px-6 py-14 md:px-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">A new branch has begun</div>
              <div className="mt-3 text-3xl font-light">
                Hamza<span className="text-[oklch(0.78_0.19_145)]">.dev</span>
              </div>
              <div className="mono mt-2 text-xs text-muted-foreground">
                © 2026 Hamza. All rights reserved. Made with ♥ and lots of ☕
              </div>
            </div>
            <div className="mono flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em]">
              <a href="https://www.github.com/hamza-khan-16" target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-muted-foreground transition-colors hover:text-foreground">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/hamza-khan-918b12360" target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-muted-foreground transition-colors hover:text-foreground">LinkedIn ↗</a>
              <a href="https://www.instagram.com/hamzaaaaa_29" target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-muted-foreground transition-colors hover:text-foreground">Instagram ↗</a>
              <a href="/admin" data-cursor="hover" className="text-muted-foreground transition-colors hover:text-foreground">Admin ↗</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}