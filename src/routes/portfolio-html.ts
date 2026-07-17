// Redesigned: rope_port cinematic dark aesthetic — original logic preserved.
export const portfolioHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Hamza K. — Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<style>
:root {
  --bg:         oklch(0.09 0.015 155);
  --fg:         oklch(0.94 0.02 130);
  --muted:      oklch(0.60 0.04 140);
  --card:       oklch(0.13 0.02 155 / 0.5);
  --border:     oklch(0.78 0.19 145 / 0.15);
  --emerald:    oklch(0.78 0.19 145);
  --emerald-hi: oklch(0.88 0.22 140);
  --mono: "Geist Mono", ui-monospace, monospace;
  --sans: "Geist", ui-sans-serif, system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { background: var(--bg); scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--sans);
  overflow-x: hidden;
  cursor: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

::selection { background: oklch(0.78 0.19 145 / 0.35); color: var(--fg); }

/* ---------- MONO UTILITY ---------- */
.mono { font-family: var(--mono); }
.em-glow {
  color: var(--emerald-hi);
  text-shadow: 0 0 30px oklch(0.78 0.19 145 / 0.6);
}

/* ---------- AMBIENT CANVAS ---------- */
#bg-canvas {
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}

/* ---------- VIGNETTE ---------- */
#vignette {
  position: fixed; inset: 0; z-index: 1;
  pointer-events: none;
  background: radial-gradient(120% 80% at 50% 50%, transparent 40%, oklch(0.05 0.01 155 / 0.75) 100%);
}

/* ---------- CUSTOM CURSOR ---------- */
#cursor-dot, #cursor-ring {
  position: fixed; top: 0; left: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%,-50%);
}
#cursor-dot { width: 5px; height: 5px; background: var(--emerald-hi); }
#cursor-ring {
  width: 32px; height: 32px;
  border: 1px solid var(--emerald);
  transition: width .25s, height .25s, border-color .25s, background .25s, opacity .2s;
}
body.hover-link #cursor-ring {
  width: 50px; height: 50px;
  background: oklch(0.78 0.19 145 / 0.08);
  border-color: var(--emerald-hi);
}

/* ---------- SCROLL PROGRESS RAIL ---------- */
#scroll-rail {
  position: fixed; left: 24px; top: 50%; z-index: 40;
  transform: translateY(-50%);
  height: 52vh; width: 1px;
  background: oklch(0.78 0.19 145 / 0.15);
  display: none;
}
#scroll-fill {
  position: absolute; top: 0; left: 0; width: 1px;
  background: linear-gradient(to bottom, var(--emerald-hi), transparent);
  box-shadow: 0 0 12px oklch(0.88 0.22 140 / 0.9);
  transition: height .1s linear;
}
#scroll-dot {
  position: absolute; left: -3px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--emerald-hi);
  box-shadow: 0 0 14px var(--emerald-hi);
  transition: top .1s linear;
}
#scroll-label {
  position: absolute; bottom: -32px; left: -2px;
  font-family: var(--mono); font-size: 9px;
  text-transform: uppercase; letter-spacing: .4em;
  color: var(--muted);
  transform: rotate(-90deg) translateX(-50%);
  white-space: nowrap;
  transform-origin: 0 50%;
}
@media(min-width:768px){ #scroll-rail { display: block; } }

/* ---------- BOTTOM CORNERS ---------- */
#corner-left {
  position: fixed; bottom: 24px; left: 24px; z-index: 40;
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em; color: var(--muted);
  display: none;
}
#corner-right {
  position: fixed; bottom: 24px; right: 24px; z-index: 40;
  font-family: var(--mono); font-size: 9px;
  text-transform: uppercase; letter-spacing: .4em; color: var(--muted);
  transform: rotate(-90deg); transform-origin: bottom right;
  display: none;
}
@media(min-width:768px){ #corner-left, #corner-right { display: block; } }

/* ---------- GLASS PANEL ---------- */
.glass {
  background: color-mix(in oklab, var(--bg) 55%, transparent);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid var(--border);
  box-shadow:
    inset 0 1px 0 oklch(0.78 0.19 145 / 0.08),
    0 20px 60px -30px oklch(0.78 0.19 145 / 0.25);
  border-radius: 4px;
  position: relative;
}
.glass::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(110deg, transparent 20%, oklch(0.88 0.22 140 / 0.35) 50%, transparent 80%);
  background-size: 200% 100%;
  animation: shimmer 6s linear infinite;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* ---------- NAV ---------- */
nav {
  position: fixed; inset-x: 0; top: 0; z-index: 500;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 40px;
  transition: background .3s;
}
nav.scrolled {
  background: oklch(0.09 0.015 155 / 0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.logo {
  font-family: var(--mono); font-size: 13px;
  text-transform: uppercase; letter-spacing: .35em;
}
.logo span { color: var(--emerald); }

.nav-links {
  display: flex; gap: 28px; list-style: none;
}
.nav-links a {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: .28em;
  color: var(--muted);
  transition: color .3s;
  position: relative;
}
.nav-links a.active, .nav-links a:hover { color: var(--fg); }
.nav-links a.active::after {
  content: '';
  position: absolute; bottom: -4px; left: 0;
  width: 100%; height: 1px;
  background: var(--emerald-hi);
}

.talk-btn {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  border: 1px solid oklch(0.78 0.19 145 / 0.35);
  border-radius: 4px;
  padding: 8px 18px;
  background: transparent;
  color: var(--fg);
  cursor: pointer;
  transition: border-color .3s;
  display: flex; align-items: center; gap: 6px;
}
.talk-btn:hover { border-color: var(--emerald); }

.available-dot {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--muted);
}
.available-dot span {
  position: relative; display: flex; width: 8px; height: 8px;
}
.available-dot span::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 50%;
  background: var(--emerald);
  animation: ping 1.5s ease-in-out infinite;
  opacity: .6;
}
.available-dot span::after {
  content: '';
  position: absolute; inset: 1px;
  border-radius: 50%; background: var(--emerald-hi);
}
@keyframes ping {
  0%,100%{ transform: scale(1); opacity: .6; }
  50%    { transform: scale(1.9); opacity: 0; }
}

.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 6px; z-index: 600;
}
.hamburger span {
  display: block; width: 22px; height: 1px;
  background: var(--fg); transition: transform .3s, opacity .3s;
}
.hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

.mobile-nav {
  display: none; position: fixed; inset: 0;
  background: var(--bg); z-index: 490;
  flex-direction: column; align-items: center; justify-content: center;
  gap: 36px; opacity: 0; pointer-events: none;
  transition: opacity .35s;
}
.mobile-nav.open { opacity: 1; pointer-events: all; }
.mobile-nav a {
  font-family: var(--mono); font-size: 1.6rem;
  text-transform: uppercase; letter-spacing: .2em;
}

@media(max-width: 900px){
  .nav-links, .available-dot { display: none !important; }
  .hamburger { display: flex; }
  .mobile-nav { display: flex; }
  nav { padding: 18px 24px; }
}

/* ---------- SECTION LABEL ---------- */
.section-label {
  display: flex; align-items: center; gap: 12px;
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--emerald);
}
.section-label::before {
  content: ''; display: inline-block;
  width: 32px; height: 1px;
  background: oklch(0.78 0.19 145 / 0.6);
}
.section-label .sub { color: var(--muted); }

/* ---------- SECTION ---------- */
section { position: relative; z-index: 10; padding: 140px 8vw 60px; }
.container { max-width: 1280px; margin: 0 auto; position: relative; }

/* ---------- REVEAL ---------- */
.reveal { opacity: 0; transform: translateY(24px); filter: blur(10px); }

/* ---------- HERO ---------- */
#hero {
  min-height: 100vh;
  display: flex; align-items: center;
  padding-top: 100px;
}
.hero-grid {
  display: grid; grid-template-columns: 1.1fr 0.9fr;
  gap: 48px; align-items: center; width: 100%;
}
.hero-title {
  font-size: clamp(2.8rem,6.5vw,7rem);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-top: 32px;
}
.hero-title .italic { font-style: italic; font-weight: 300; }
.hero-sub {
  font-family: var(--mono); font-size: 13px;
  color: var(--muted); line-height: 1.7;
  margin-top: 28px; max-width: 420px;
}
.hero-ctas { display: flex; gap: 14px; margin-top: 36px; flex-wrap: wrap; align-items: center; }

.pill-btn {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: .28em;
  border-radius: 4px; padding: 14px 22px;
  cursor: pointer; border: none;
  transition: all .4s;
  text-decoration: none;
}
.pill-btn-primary {
  background: var(--emerald); color: oklch(0.08 0.02 155);
  box-shadow: 0 0 40px -8px oklch(0.78 0.19 145 / 0.7);
}
.pill-btn-primary:hover { background: oklch(0.85 0.2 140); }
.pill-btn-ghost {
  background: transparent; color: var(--fg);
  border: 1px solid oklch(0.78 0.19 145 / 0.35);
}
.pill-btn-ghost:hover {
  border-color: oklch(0.78 0.19 145 / 0.8);
  background: oklch(0.78 0.19 145 / 0.06);
}
.pill-btn svg { transition: transform .4s; }
.pill-btn:hover svg { transform: translate(2px,-2px); }

/* hero floating panel */
.hero-panel {
  display: none;
}
@media(min-width:900px){
  .hero-panel {
    display: block;
    animation: float-slow 8s ease-in-out infinite;
  }
}
@keyframes float-slow {
  0%,100%{ transform: translateY(0); }
  50%    { transform: translateY(-8px); }
}

.scroll-hint {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .5em;
  color: var(--muted); animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }

@media(max-width:900px){
  .hero-grid { grid-template-columns: 1fr; }
  #hero { padding-top: 100px; }
}

/* ---------- ABOUT ---------- */
.about-grid {
  display: grid; grid-template-columns: 5fr 7fr;
  gap: 48px; margin-top: 48px;
}
@media(max-width:768px){ .about-grid { grid-template-columns: 1fr; } }

.about-stats {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 16px; border-top: 1px solid var(--border); padding-top: 24px; margin-top: 28px;
}
.about-stat-num {
  font-size: 2rem; font-weight: 300;
  color: var(--emerald-hi);
  text-shadow: 0 0 30px oklch(0.78 0.19 145 / 0.6);
}
.about-stat-lbl {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .25em;
  color: var(--muted); margin-top: 4px;
}

.timeline { margin-top: 28px; padding-left: 20px; list-style: none; }
.timeline li {
  position: relative; padding-bottom: 22px;
  padding-left: 20px;
  border-left: 1px solid oklch(0.78 0.19 145 / 0.25);
  margin-left: 4px;
}
.timeline li::before {
  content: '';
  position: absolute; left: -5px; top: 4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 10px var(--emerald);
}
.timeline b {
  display: block; font-size: 13px;
  font-family: var(--mono); font-weight: 400;
}
.timeline span { color: var(--muted); font-size: 11px; font-family: var(--mono); }

/* ---------- EXPERIENCE ---------- */
.exp-vein {
  position: absolute; left: 3px; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, oklch(0.78 0.19 145 / 0.6), oklch(0.78 0.19 145 / 0.1), transparent);
}
@media(min-width:768px){
  .exp-vein { left: 50%; }
}
.exp-item {
  position: relative; margin-bottom: 64px;
  display: grid; grid-template-columns: 1fr;
  gap: 24px; align-items: center; padding-left: 40px;
}
@media(min-width:768px){
  .exp-item { grid-template-columns: 1fr 1fr; padding-left: 0; }
  .exp-item:nth-child(even) > .exp-card-wrap { order: -1; }
  .exp-item:nth-child(odd) > .exp-year-wrap { text-align: right; padding-right: 48px; }
  .exp-item:nth-child(even) > .exp-year-wrap { padding-left: 48px; }
  .exp-item:nth-child(odd) > .exp-card-wrap { padding-left: 48px; }
}
.exp-node {
  position: absolute; top: 4px;
  left: 0; transform: translateX(-50%);
}
@media(min-width:768px){
  .exp-node { left: 50%; }
}
.exp-node-inner {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--emerald-hi);
  box-shadow: 0 0 25px oklch(0.88 0.22 140 / 0.9);
  position: relative;
}
.exp-node-inner::before {
  content: '';
  position: absolute; inset: 4px;
  border-radius: 50%; background: var(--bg);
}
.exp-node-inner::after {
  content: '';
  position: absolute; inset: 8px;
  border-radius: 50%; background: var(--emerald-hi);
  animation: pulse 2s ease-in-out infinite;
}
.exp-year {
  font-size: 3rem; font-weight: 300;
  color: var(--emerald-hi);
  text-shadow: 0 0 30px oklch(0.78 0.19 145 / 0.6);
  font-family: var(--sans);
}
.exp-card-wrap .glass { padding: 24px; }
.exp-role {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--emerald-hi);
}
.exp-title { margin-top: 8px; font-size: 1.2rem; font-weight: 300; }
.exp-desc {
  font-family: var(--mono); font-size: 11px;
  line-height: 1.6; color: var(--muted); margin-top: 10px;
}

/* ---------- SKILLS ---------- */
.skills-grid {
  display: grid; grid-template-columns: repeat(2,1fr);
  gap: 14px; margin-top: 56px;
}
@media(min-width:600px){ .skills-grid { grid-template-columns: repeat(4,1fr); } }
.skill-tile {
  position: relative; aspect-ratio: 1;
  border: 1px solid oklch(0.78 0.19 145 / 0.15);
  background: oklch(0.10 0.02 155 / 0.5);
  border-radius: 4px; padding: 16px;
  transition: border-color .5s, background .5s;
  overflow: hidden;
  cursor: default;
}
.skill-tile:hover {
  border-color: oklch(0.78 0.19 145 / 0.7);
  background: oklch(0.14 0.03 155 / 0.7);
}
.skill-tile::before {
  content: '';
  position: absolute; right: -24px; top: -24px;
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--emerald);
  opacity: 0;
  filter: blur(24px);
  transition: opacity .5s;
}
.skill-tile:hover::before { opacity: .7; }
.skill-type {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--muted);
}
.skill-name {
  position: absolute; bottom: 16px; left: 16px; right: 16px;
  font-size: 1rem; font-weight: 300; line-height: 1.2;
}
.skill-dot {
  position: absolute; bottom: 16px; right: 16px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--emerald-hi);
  box-shadow: 0 0 10px var(--emerald-hi);
  transition: transform .5s;
}
.skill-tile:hover .skill-dot { transform: scale(3); }

/* skill progress bars (orbit replaced by grid + bars) */
.skills-bars { margin-top: 32px; display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
@media(min-width:600px){ .skills-bars { grid-template-columns: repeat(4,1fr); } }
.skill-bar-item { }
.skill-bar-label {
  display: flex; justify-content: space-between;
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .2em;
  color: var(--muted); margin-bottom: 8px;
}
.skill-bar-pct { color: var(--emerald-hi); }
.skill-bar-track {
  height: 2px; background: oklch(0.78 0.19 145 / 0.15);
  border-radius: 2px; overflow: hidden;
}
.skill-bar-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--emerald), var(--emerald-hi));
  box-shadow: 0 0 8px var(--emerald);
  border-radius: 2px;
}

/* ---------- PROCESS ---------- */
.process-line {
  position: absolute; left: 0; right: 0; top: 24px;
  height: 1px;
  background: linear-gradient(to right, transparent, oklch(0.78 0.19 145 / 0.5), transparent);
  display: none;
}
@media(min-width:768px){ .process-line { display: block; } }
.process-steps { display: grid; grid-template-columns: repeat(2,1fr); gap: 32px; margin-top: 56px; }
@media(min-width:768px){ .process-steps { grid-template-columns: repeat(5,1fr); } }
.process-step { text-align: center; }
.process-step-node {
  position: relative; width: 48px; height: 48px;
  margin: 0 auto 24px;
}
.process-step-node::before {
  content: '';
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid oklch(0.78 0.19 145 / 0.5);
}
.process-step-node::after {
  content: '';
  position: absolute; inset: 8px; border-radius: 50%;
  background: var(--emerald-hi);
  box-shadow: 0 0 30px oklch(0.88 0.22 140 / 0.7);
}
.process-num {
  position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  font-family: var(--mono); font-size: 10px;
  letter-spacing: .3em; color: var(--muted);
}
.process-title { font-size: 1.1rem; font-weight: 300; margin-top: 8px; }
.process-desc {
  font-family: var(--mono); font-size: 11px;
  color: var(--muted); line-height: 1.55; margin-top: 6px;
}

/* ---------- TESTIMONIALS ---------- */
.testi-grid {
  display: grid; grid-template-columns: 1fr;
  gap: 20px; margin-top: 48px;
}
@media(min-width:768px){ .testi-grid { grid-template-columns: 1fr 1fr; } }
.testi-card .glass { padding: 28px; height: 100%; }
.testi-quote {
  font-family: var(--mono); font-size: 2rem;
  color: var(--emerald); line-height: 1;
}
.testi-text { font-size: 1rem; font-weight: 300; line-height: 1.65; margin-top: 8px; }
.testi-author {
  display: flex; align-items: center; gap: 12px;
  border-top: 1px solid var(--border); padding-top: 14px; margin-top: 20px;
}
.testi-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, var(--emerald), oklch(0.4 0.1 155));
  flex-shrink: 0;
}
.testi-name { font-family: var(--mono); font-size: 11px; }
.testi-role {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .25em;
  color: var(--muted); margin-top: 2px;
}

/* ---------- FACTS ---------- */
.facts-grid {
  display: grid; grid-template-columns: repeat(2,1fr);
  gap: 24px; margin-top: 48px;
}
@media(min-width:768px){ .facts-grid { grid-template-columns: repeat(4,1fr); } }
.fact-tile .glass { padding: 28px; text-align: center; }
.fact-num {
  font-size: 2.5rem; font-weight: 300;
  color: var(--emerald-hi);
  text-shadow: 0 0 30px oklch(0.78 0.19 145 / 0.6);
  font-family: var(--sans);
}
.fact-lbl {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .25em;
  color: var(--muted); margin-top: 8px;
}

/* ---------- CONTACT ---------- */
.contact-wrap {
  max-width: 640px; margin: 0 auto; text-align: center;
}
.contact-form-glass .glass { padding: 36px; text-align: left; }
.term-bar {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--muted);
  border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;
}
.term-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--emerald-hi); animation: pulse 2s infinite;
}
.form-field { margin-top: 20px; }
.form-field label {
  display: block; font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--muted); margin-bottom: 8px;
}
.form-field input, .form-field textarea {
  width: 100%; background: transparent; border: none;
  border-bottom: 1px solid oklch(0.78 0.19 145 / 0.3);
  padding: 8px 0; font-family: var(--mono); font-size: 13px;
  color: var(--fg); outline: none;
  transition: border-color .3s;
  resize: none;
}
.form-field input:focus, .form-field textarea:focus {
  border-bottom-color: var(--emerald-hi);
}
.form-field input::placeholder, .form-field textarea::placeholder { color: var(--muted); }
.form-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 28px;
}
.form-note {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em; color: var(--muted);
}

.contact-side { margin-top: 48px; }
.socials { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 20px; justify-content: center; }
.social-link {
  width: 44px; height: 44px; border: 1px solid var(--border);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: border-color .3s, background .3s;
}
.social-link:hover { border-color: var(--emerald); background: oklch(0.78 0.19 145 / 0.08); }

.contact-details { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; align-items: center; }
.contact-detail {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--mono); font-size: 12px;
  color: var(--fg); text-decoration: none;
}
.contact-detail-icon {
  width: 32px; height: 32px; border: 1px solid var(--border);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ---------- FOOTER ---------- */
footer {
  border-top: 1px solid var(--border);
  padding: 56px 8vw;
  display: flex; flex-wrap: wrap;
  justify-content: space-between; align-items: flex-end;
  gap: 32px; position: relative; z-index: 10;
}
.footer-brand { }
.footer-caption {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .35em; color: var(--muted);
}
.footer-name { font-size: 2rem; font-weight: 300; margin-top: 10px; }
.footer-name span { color: var(--emerald); }
.footer-copy {
  font-family: var(--mono); font-size: 11px;
  color: var(--muted); margin-top: 8px;
}
.footer-links {
  display: flex; flex-wrap: wrap; gap: 24px;
}
.footer-links a {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .3em;
  color: var(--muted); transition: color .3s;
}
.footer-links a:hover { color: var(--fg); }

/* ---------- SKELETON ---------- */
@keyframes skShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.sk-line {
  height: 12px; border-radius: 3px; margin: 8px 0;
  background: linear-gradient(90deg, oklch(0.78 0.19 145 / 0.08) 25%, oklch(0.78 0.19 145 / 0.15) 50%, oklch(0.78 0.19 145 / 0.08) 75%);
  background-size: 800px 100%; animation: skShimmer 1.4s infinite;
}
.sk-w40{width:40%} .sk-w60{width:60%} .sk-w80{width:80%}
.sk-thumb {
  height: 180px; border-radius: 4px 4px 0 0;
  background: linear-gradient(90deg, oklch(0.78 0.19 145 / 0.08) 25%, oklch(0.78 0.19 145 / 0.15) 50%, oklch(0.78 0.19 145 / 0.08) 75%);
  background-size: 800px 100%; animation: skShimmer 1.4s infinite;
}

/* ---------- PROJECTS ---------- */
.projects-list { margin-top: 56px; }
.project-row {
  position: relative;
  display: grid; grid-template-columns: 2fr 5fr 4fr 1fr;
  align-items: center; gap: 24px;
  border-top: 1px solid oklch(0.78 0.19 145 / 0.15);
  padding: 28px 0;
  cursor: pointer; text-decoration: none; color: var(--fg);
  transition: border-color .4s;
}
.project-row:hover { border-color: oklch(0.78 0.19 145 / 0.6); }
.project-row::before {
  content: '';
  position: absolute; top: -1px; left: 0; right: 0; height: 1px;
  background: linear-gradient(to right, transparent, var(--emerald-hi), transparent);
  opacity: 0; transition: opacity .4s;
}
.project-row:hover::before { opacity: 1; }
.project-num {
  font-family: var(--mono); font-size: 11px;
  color: var(--muted);
}
.project-title {
  font-size: clamp(1.4rem,2.5vw,2.2rem);
  font-weight: 300; line-height: 1.1;
  letter-spacing: -0.02em;
  transition: transform .4s;
}
.project-row:hover .project-title { transform: translateX(8px); }
.project-sub {
  font-family: var(--mono); font-size: 11px;
  color: var(--muted); margin-top: 6px;
}
.project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.project-tag {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: .2em;
  color: var(--muted);
  border: 1px solid oklch(0.78 0.19 145 / 0.25);
  border-radius: 4px; padding: 4px 10px;
}
.project-arrow {
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid oklch(0.78 0.19 145 / 0.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; justify-self: end;
  transition: transform .4s, border-color .4s, background .4s;
}
.project-row:hover .project-arrow {
  transform: rotate(45deg);
  border-color: var(--emerald-hi);
  background: oklch(0.78 0.19 145 / 0.15);
}
@media(max-width:768px){
  .project-row { grid-template-columns: 1fr; }
  .project-tags { display: none; }
}
#projects-empty {
  text-align: center; padding: 60px 20px;
  font-family: var(--mono); color: var(--muted);
}

/* ---------- RESPONSIVE ---------- */
@media(max-width:768px){
  section { padding: 100px 5vw 40px; }
  .hero-title { font-size: clamp(2.4rem,9vw,3.6rem); }
  .exp-item { padding-left: 36px; }
  footer { flex-direction: column; align-items: flex-start; }
}
</style>
</head>
<body>

<!-- AMBIENT CANVAS -->
<canvas id="bg-canvas"></canvas>
<div id="vignette"></div>

<!-- CURSOR -->
<div id="cursor-dot"></div>
<div id="cursor-ring"></div>

<!-- SCROLL RAIL -->
<div id="scroll-rail">
  <div id="scroll-fill"></div>
  <div id="scroll-dot"></div>
  <div id="scroll-label">Scroll &middot; Journey</div>
</div>

<!-- CORNERS -->
<div id="corner-left">
  <div style="color:var(--emerald)">&#9616;&#9616; Now rendering</div>
  <div style="margin-top:4px">HamzaK.dev</div>
</div>
<div id="corner-right">Est &middot; MMXXVI &middot; Portfolio</div>

<!-- NAV -->
<nav id="main-nav">
  <a href="#hero" class="logo">HamzaK<span>.dev</span></a>
  <ul class="nav-links" id="nav-links">
    <li><a href="#hero" data-section="0">01_ Home</a></li>
    <li><a href="#about" data-section="1">02_ About</a></li>
    <li><a href="#experience" data-section="2">03_ Experience</a></li>
    <li><a href="#skills" data-section="3">04_ Skills</a></li>
    <li><a href="#projects" data-section="4">05_ Projects</a></li>
    <li><a href="#contact" data-section="5">06_ Contact</a></li>
  </ul>
  <div style="display:flex;align-items:center;gap:20px;">
    <div class="available-dot" id="avail-badge">
      <span></span>
      Available for work
    </div>
    <a href="#contact" class="talk-btn">
      Let's connect <span>&#x2197;</span>
    </a>
  </div>
  <button class="hamburger" id="hamburger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="mobile-nav" id="mobile-nav">
  <a href="#hero">Home</a>
  <a href="#about">About</a>
  <a href="#experience">Experience</a>
  <a href="#skills">Skills</a>
  <a href="#projects">Projects</a>
  <a href="#contact">Contact</a>
</div>

<main>

  <!-- HERO -->
  <section id="hero" data-section="0">
    <div class="container hero-grid">
      <div>
        <div class="section-label reveal">
          <span>01_</span>
          <span class="sub">/ The beginning</span>
        </div>
        <h1 class="hero-title reveal">
          I build<br>
          digital<br>
          <span class="em-glow italic">experiences_</span>
        </h1>
        <p class="hero-sub reveal mono">
          Full-stack developer crafting modern, fast and accessible web
          experiences &mdash; one commit at a time.
        </p>
        <div class="hero-ctas reveal">
          <a href="#projects" class="pill-btn pill-btn-primary" id="viewwork-btn">
            Explore my work
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
          </a>
          <a href="#" class="pill-btn pill-btn-ghost" id="resume-btn" download>
            Download Resume
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
          </a>
        </div>
      </div>
      <div>
        <div class="hero-panel glass p-6 reveal" style="padding:24px;">
          <div class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:var(--muted)">01 / 06</div>
          <div class="mono" style="font-size:1.1rem;letter-spacing:.15em;margin-top:14px;">ABOUT ME_</div>
          <p class="mono" style="margin-top:10px;font-size:11px;line-height:1.6;color:var(--muted)">
            Get to know the developer behind the code.
          </p>
          <a href="#about" class="mono" style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:var(--emerald-hi);">
            View section <span>&#x2197;</span>
          </a>
        </div>
      </div>
    </div>
    <div class="scroll-hint mono">scroll to travel &#x2193;</div>
  </section>

  <!-- ABOUT -->
  <section id="about" data-section="1">
    <div class="container">
      <div class="section-label reveal"><span>02_</span><span class="sub">/ A smaller branch</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        Built from<br><span class="em-glow italic">curiosity</span> and midnight coffee.
      </h2>
      <div class="about-grid">
        <div class="reveal">
          <ul class="timeline">
            <li><b>2021 &mdash; Started coding journey</b><span>Learned HTML, CSS &amp; JS fundamentals</span></li>
            <li><b>2022 &mdash; First internship</b><span>Frontend development at a startup</span></li>
            <li><b>2023 &mdash; Full stack role</b><span>Building end-to-end products with React &amp; Node</span></li>
            <li><b>2026 &mdash; Freelance &amp; open source</b><span>Crafting products, mentoring, shipping ideas</span></li>
          </ul>
        </div>
        <div class="reveal">
          <div class="glass" style="padding:32px;">
            <p class="mono" style="font-size:13px;line-height:1.75;color:var(--muted);">
              I'm a passionate full-stack developer based in India. I love turning ideas into reality using code, and
              creating impactful digital solutions. Always curious, always learning &mdash; I sketch out problems before I
              solve them in code. Obsessed with the seam between engineering and emotion.
            </p>
            <div class="about-stats">
              <div>
                <div class="about-stat-num">4+</div>
                <div class="about-stat-lbl">Years shipping</div>
              </div>
              <div>
                <div class="about-stat-num">50+</div>
                <div class="about-stat-lbl">Projects built</div>
              </div>
              <div>
                <div class="about-stat-num">20+</div>
                <div class="about-stat-lbl">Happy clients</div>
              </div>
            </div>
            <div style="margin-top:22px;display:flex;flex-direction:column;gap:8px;">
              <div class="mono" style="font-size:11px;color:var(--muted);">
                &#x25cf; <span style="color:oklch(0.65 0.19 145)">Available for work</span> &nbsp;&middot;&nbsp; Remote / Onsite
              </div>
              <div class="mono" style="font-size:11px;color:var(--muted);">
                &#x2709; <span id="about-email">%%ADMIN_EMAIL%%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- EXPERIENCE -->
  <section id="experience" data-section="2">
    <div class="container">
      <div class="section-label reveal"><span>03_</span><span class="sub">/ Rings of the branch</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        A timeline etched<br>into <span class="em-glow italic">bark</span>.
      </h2>
      <div style="margin-top:64px;position:relative;">
        <div class="exp-vein"></div>

        <div class="exp-item reveal">
          <div class="exp-node"><div class="exp-node-inner"></div></div>
          <div class="exp-year-wrap">
            <div class="exp-year">2025</div>
            <div class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:var(--muted);margin-top:4px;">Present</div>
          </div>
          <div class="exp-card-wrap">
            <div class="glass" style="padding:24px;">
              <div class="exp-role">Freelance</div>
              <div class="exp-title">Full Stack Developer</div>
              <p class="exp-desc">Building end-to-end web products for clients &mdash; from sketch to deployment.</p>
            </div>
          </div>
        </div>

        <div class="exp-item reveal">
          <div class="exp-node"><div class="exp-node-inner"></div></div>
          <div class="exp-year-wrap">
            <div class="exp-year">2023</div>
            <div class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:var(--muted);margin-top:4px;">2023 &mdash; 2025</div>
          </div>
          <div class="exp-card-wrap">
            <div class="glass" style="padding:24px;">
              <div class="exp-role">TechNova Labs</div>
              <div class="exp-title">Software Engineer</div>
              <p class="exp-desc">Built and scaled internal tools and customer-facing dashboards for a fast-growing SaaS product.</p>
            </div>
          </div>
        </div>

        <div class="exp-item reveal">
          <div class="exp-node"><div class="exp-node-inner"></div></div>
          <div class="exp-year-wrap">
            <div class="exp-year">2022</div>
            <div class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:var(--muted);margin-top:4px;">2022 &mdash; 2023</div>
          </div>
          <div class="exp-card-wrap">
            <div class="glass" style="padding:24px;">
              <div class="exp-role">PixelWorks</div>
              <div class="exp-title">Frontend Intern</div>
              <p class="exp-desc">Learned the ropes of production-grade React applications and design systems.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- SKILLS -->
  <section id="skills" data-section="3">
    <div class="container">
      <div class="section-label reveal"><span>04_</span><span class="sub">/ Glowing fruit</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        Skills that grew from<br><span class="em-glow italic">the branch</span>.
      </h2>

      <!-- skill tiles grid -->
      <div class="skills-grid" style="margin-top:48px;">
        <div class="skill-tile reveal"><div class="skill-type">core</div><div class="skill-name">JavaScript / TypeScript</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">UI</div><div class="skill-name">React / Next.js</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">runtime</div><div class="skill-name">Node.js / Express</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">data</div><div class="skill-name">Databases / DevOps</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">styling</div><div class="skill-name">Tailwind / CSS</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">backend</div><div class="skill-name">PostgreSQL / Supabase</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">motion</div><div class="skill-name">GSAP / Framer</div><div class="skill-dot"></div></div>
        <div class="skill-tile reveal"><div class="skill-type">deploy</div><div class="skill-name">Docker / CI/CD</div><div class="skill-dot"></div></div>
      </div>

      <!-- progress bars -->
      <div class="skills-bars" style="margin-top:48px;">
        <div class="skill-bar-item reveal">
          <div class="skill-bar-label">
            <span>JS / TS</span><span class="skill-bar-pct" data-w="92">0%</span>
          </div>
          <div class="skill-bar-track"><div class="skill-bar-fill" data-w="92"></div></div>
        </div>
        <div class="skill-bar-item reveal">
          <div class="skill-bar-label">
            <span>React / Next</span><span class="skill-bar-pct" data-w="95">0%</span>
          </div>
          <div class="skill-bar-track"><div class="skill-bar-fill" data-w="95"></div></div>
        </div>
        <div class="skill-bar-item reveal">
          <div class="skill-bar-label">
            <span>Node.js</span><span class="skill-bar-pct" data-w="88">0%</span>
          </div>
          <div class="skill-bar-track"><div class="skill-bar-fill" data-w="88"></div></div>
        </div>
        <div class="skill-bar-item reveal">
          <div class="skill-bar-label">
            <span>Databases</span><span class="skill-bar-pct" data-w="80">0%</span>
          </div>
          <div class="skill-bar-track"><div class="skill-bar-fill" data-w="80"></div></div>
        </div>
      </div>

    </div>
  </section>

  <!-- PROJECTS -->
  <section id="projects" data-section="4">
    <div class="container">
      <div class="section-label reveal"><span>05_</span><span class="sub">/ Crystalline flowers</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        Selected <span class="em-glow italic">works_</span>
      </h2>
      <div class="projects-list" id="projects-grid">
        <!-- skeleton -->
        <div style="border-top:1px solid var(--border);padding:28px 0;">
          <div class="sk-line sk-w40"></div><div class="sk-line sk-w60"></div>
        </div>
        <div style="border-top:1px solid var(--border);padding:28px 0;">
          <div class="sk-line sk-w60"></div><div class="sk-line sk-w40"></div>
        </div>
        <div style="border-top:1px solid var(--border);padding:28px 0;">
          <div class="sk-line sk-w80"></div><div class="sk-line sk-w40"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section id="process" data-section="5">
    <div class="container">
      <div class="section-label reveal"><span>06_</span><span class="sub">/ Living roots</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        How the <span class="em-glow italic">energy</span> travels.
      </h2>
      <div style="margin-top:56px;position:relative;">
        <div class="process-line"></div>
        <div class="process-steps">
          <div class="process-step reveal">
            <div class="process-step-node"><div class="process-num">01</div></div>
            <div class="process-title">Idea</div>
            <p class="process-desc">Understanding the problem &amp; brainstorming solutions.</p>
          </div>
          <div class="process-step reveal">
            <div class="process-step-node"><div class="process-num">02</div></div>
            <div class="process-title">Plan</div>
            <p class="process-desc">Planning structure, tech stack and workflow.</p>
          </div>
          <div class="process-step reveal">
            <div class="process-step-node"><div class="process-num">03</div></div>
            <div class="process-title">Build</div>
            <p class="process-desc">Writing clean code and bringing ideas to life.</p>
          </div>
          <div class="process-step reveal">
            <div class="process-step-node"><div class="process-num">04</div></div>
            <div class="process-title">Test</div>
            <p class="process-desc">Quality, performance and polish.</p>
          </div>
          <div class="process-step reveal">
            <div class="process-step-node"><div class="process-num">05</div></div>
            <div class="process-title">Launch</div>
            <p class="process-desc">Deploying and making an impact in the wild.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section id="testimonials">
    <div class="container">
      <div class="section-label reveal"><span>07_</span><span class="sub">/ Whispers on the wind</span></div>
      <h2 class="reveal" style="font-size:clamp(2rem,4.5vw,4rem);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-top:22px;">
        What people <span class="em-glow italic">say</span>.
      </h2>
      <div class="testi-grid">
        <div class="testi-card reveal">
          <div class="glass" style="padding:28px;">
            <div class="testi-quote">"</div>
            <p class="testi-text">Hamza is a fantastic developer who delivered beyond expectations and communicated perfectly throughout the project.</p>
            <div class="testi-author">
              <div class="testi-avatar"></div>
              <div><div class="testi-name">Sarah J.</div><div class="testi-role">Product Manager, Nimbus Labs</div></div>
            </div>
          </div>
        </div>
        <div class="testi-card reveal">
          <div class="glass" style="padding:28px;">
            <div class="testi-quote">"</div>
            <p class="testi-text">Incredibly detail oriented and fast. Our web app went from concept to production in record time, flawlessly.</p>
            <div class="testi-author">
              <div class="testi-avatar"></div>
              <div><div class="testi-name">Marco T.</div><div class="testi-role">Startup Founder</div></div>
            </div>
          </div>
        </div>
        <div class="testi-card reveal">
          <div class="glass" style="padding:28px;">
            <div class="testi-quote">"</div>
            <p class="testi-text">Clear communicator, fast shipper, and genuinely fun to build with. I'd hire him again in a heartbeat.</p>
            <div class="testi-author">
              <div class="testi-avatar"></div>
              <div><div class="testi-name">Elena R.</div><div class="testi-role">Design Lead, Studio Pixel</div></div>
            </div>
          </div>
        </div>
        <div class="testi-card reveal">
          <div class="glass" style="padding:28px;">
            <div class="testi-quote">"</div>
            <p class="testi-text">Every commit felt intentional. Every UI felt polished. Rare combination of speed and craft.</p>
            <div class="testi-author">
              <div class="testi-avatar"></div>
              <div><div class="testi-name">Alex D.</div><div class="testi-role">CTO, DevConnect</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FACTS -->
  <section id="facts">
    <div class="container">
      <div class="section-label reveal"><span>// </span><span class="sub">Fun facts</span></div>
      <div class="facts-grid" style="margin-top:40px;">
        <div class="fact-tile reveal">
          <div class="glass" style="padding:28px;text-align:center;">
            <div class="fact-num" data-target="50">1</div>
            <div class="fact-lbl">Projects Completed</div>
          </div>
        </div>
        <div class="fact-tile reveal">
          <div class="glass" style="padding:28px;text-align:center;">
            <div class="fact-num" data-target="4">1</div>
            <div class="fact-lbl">Years of Experience</div>
          </div>
        </div>
        <div class="fact-tile reveal">
          <div class="glass" style="padding:28px;text-align:center;">
            <div class="fact-num" data-target="20">1</div>
            <div class="fact-lbl">Happy Clients</div>
          </div>
        </div>
        <div class="fact-tile reveal">
          <div class="glass" style="padding:28px;text-align:center;">
            <div class="fact-num">&infin;</div>
            <div class="fact-lbl">Lines of Code</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact" data-section="6">
    <div class="container">
      <div class="reveal" style="display:flex;justify-content:center;">
        <div class="section-label"><span>08_</span><span class="sub">/ End of the branch</span></div>
      </div>
      <div class="contact-wrap">
        <h2 class="reveal" style="font-size:clamp(2.2rem,6vw,5.5rem);font-weight:300;line-height:0.95;letter-spacing:-0.02em;margin-top:22px;text-align:center;">
          Send a <span class="em-glow italic">seed</span><br>into the void.
        </h2>
        <p class="mono reveal" style="font-size:12px;line-height:1.7;color:var(--muted);margin-top:20px;text-align:center;">
          Have an idea worth growing? Drop a line &mdash; every reply starts a new branch.
        </p>

        <div class="contact-form-glass reveal" style="margin-top:48px;">
          <div class="glass" style="padding:36px;">
            <div class="term-bar">
              <div class="term-dot"></div>
              <span>terminal &middot; /send-seed</span>
            </div>
            <form id="contact-form">
              <div class="form-field">
                <label>Your name</label>
                <input type="text" placeholder="anonymous_traveler" required />
              </div>
              <div class="form-field">
                <label>Signal address</label>
                <input type="email" placeholder="you@somewhere.void" required />
              </div>
              <div class="form-field">
                <label>Message</label>
                <textarea rows="4" placeholder="Tell me about the world you want to build..." required></textarea>
              </div>
              <div class="form-actions">
                <div class="form-note">encrypted &middot; end-to-end</div>
                <button type="submit" id="send-btn" class="pill-btn pill-btn-primary">
                  Release seed
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="contact-side reveal">
          <div class="socials">
            <a href="https://www.github.com/hamza-khan-16" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Github">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/hamza-khan-918b12360?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="8" y1="11" x2="8" y2="16"/>
                <line x1="8" y1="8" x2="8" y2="8"/>
                <line x1="12" y1="16" x2="12" y2="11"/>
                <path d="M12 13c0-1.5 3-2.5 4-1 .6.8.6 2 .6 2v2"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/hamzaaaaa_29?igsh=MTMwMnpkdjRxMDN1NQ==" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1"/>
              </svg>
            </a>
          </div>
          <div class="contact-details">
            <a href="mailto:%%ADMIN_EMAIL%%" class="contact-detail">
              <div class="contact-detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
              </div>
              <span id="contact-email-display">%%ADMIN_EMAIL%%</span>
            </a>
            <a href="tel:%%ADMIN_PHONE%%" class="contact-detail">
              <div class="contact-detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.42 2 2 0 0 1 3.62 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.08-1.08a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
              </div>
              <span id="contact-phone-display">%%ADMIN_PHONE%%</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

</main>

<footer>
  <div class="footer-brand">
    <div class="footer-caption">A new branch has begun</div>
    <div class="footer-name">HamzaK<span>.dev</span></div>
    <div class="footer-copy">&copy; MMXXVI &middot; Crafted with code &amp; curiosity</div>
  </div>
  <div class="footer-links">
    <a href="https://www.github.com/hamza-khan-16" target="_blank">GitHub &#x2197;</a>
    <a href="https://www.linkedin.com/in/hamza-khan-918b12360?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank">LinkedIn &#x2197;</a>
    <a href="https://www.instagram.com/hamzaaaaa_29?igsh=MTMwMnpkdjRxMDN1NQ==" target="_blank">Instagram &#x2197;</a>
    <a href="mailto:%%ADMIN_EMAIL%%">Email &#x2197;</a>
  </div>
</footer>

<script>
/* ================= SUPABASE DYNAMIC CONTENT ================= */
(function() {
  var SB_URL = '%%SUPABASE_URL%%';
  var SB_KEY = '%%SUPABASE_ANON_KEY%%';
  if (!SB_URL || SB_URL.indexOf('%%') === 0) return;
  function sbFetch(path) {
    return fetch(SB_URL + '/rest/v1/' + path, {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    }).then(function(r){ return r.json(); });
  }
  function renderProjects(projects) {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;
    if (!projects || projects.length === 0) {
      grid.innerHTML = '<div id="projects-empty">No projects yet &mdash; add them in the admin panel.</div>';
      return;
    }
    grid.innerHTML = projects.map(function(p, idx) {
      var tagsHtml = (p.tags || '').split(',').map(function(t) {
        return '<span class="project-tag">' + t.trim() + '</span>';
      }).join('');
      var demoHref = p.live_url || '#';
      var num = p.num || String(idx+1).padStart(2,'0');
      return '<a href="' + demoHref + '" target="_blank" rel="noopener noreferrer" class="project-row reveal">'
        + '<div class="project-num mono">/ ' + num + '</div>'
        + '<div><div class="project-title">' + p.title + '</div>'
        + '<div class="project-sub mono">' + (p.description || '') + '</div></div>'
        + '<div class="project-tags">' + tagsHtml + '</div>'
        + '<div class="project-arrow">&#x2197;</div>'
        + '</a>';
    }).join('');
    grid.querySelectorAll('.reveal').forEach(function(el) {
      gsap.to(el, { opacity: 1, y: 0, filter:'blur(0px)', duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
  }
  function renderSiteImages(settings) {
    if (!settings) return;
    if (settings.hero_image_url) {
      var heroImg = document.getElementById('dev-photo');
      if (heroImg) heroImg.src = settings.hero_image_url;
    }
    if (settings.about_image_url) {
      document.querySelectorAll('.polaroid img').forEach(function(img) {
        img.src = settings.about_image_url;
      });
    }
  }
  function applyResume(settings) {
    if (!settings || !settings.resume_url) return;
    var resumeUrl = settings.resume_url;
    var btn = document.getElementById('resume-btn');
    if (!btn) return;
    btn.href = resumeUrl;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var originalHTML = btn.innerHTML;
      btn.textContent = 'Downloading\u2026';
      fetch(resumeUrl)
        .then(function(r) { return r.blob(); })
        .then(function(blob) {
          var filename = resumeUrl.split('/').pop().split('?')[0] || 'resume.pdf';
          try { filename = decodeURIComponent(filename); } catch(e) {}
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function() { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 1000);
          btn.innerHTML = originalHTML;
        })
        .catch(function() { window.open(resumeUrl, '_blank'); btn.innerHTML = originalHTML; });
    });
  }
  Promise.all([
    sbFetch('projects?select=*&order=num'),
    sbFetch('site_settings?id=eq.main&select=*')
  ]).then(function(results) {
    renderProjects(results[0]);
    renderSiteImages(results[1] && results[1][0]);
    applyResume(results[1] && results[1][0]);
  }).catch(function(err) {
    console.warn('Supabase fetch failed:', err);
    var grid = document.getElementById('projects-grid');
    if (grid) grid.innerHTML = '<div id="projects-empty">Could not load projects. Check your Supabase config.</div>';
  });
})();

window.addEventListener('DOMContentLoaded', function() {
try {
  gsap.registerPlugin(ScrollTrigger);

  /* ---- LENIS ---- */
  var lenis = new Lenis({ duration: 1.4, smoothWheel: true });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  window.lenis = lenis;

  /* anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });

  /* ---- AMBIENT CANVAS ---- */
  var canvas = document.getElementById('bg-canvas');
  var ctx = canvas.getContext('2d');
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  var particles = [];
  for (var i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 1.4,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      o: 0.1 + Math.random() * 0.45
    });
  }
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'oklch(0.88 0.22 140 / ' + p.o + ')';
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---- SCROLL PROGRESS ---- */
  var fillEl = document.getElementById('scroll-fill');
  var dotEl  = document.getElementById('scroll-dot');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (fillEl) fillEl.style.height = (p * 100) + '%';
    if (dotEl)  dotEl.style.top = 'calc(' + (p*100) + '% - 4px)';
    /* active nav */
    var sections = document.querySelectorAll('[data-section]');
    var mid = window.scrollY + window.innerHeight / 2;
    var active = 0;
    sections.forEach(function(s) { if (s.offsetTop <= mid) active = parseInt(s.dataset.section || 0); });
    document.querySelectorAll('.nav-links a').forEach(function(a) {
      a.classList.toggle('active', parseInt(a.dataset.section||0) === active);
    });
    /* nav bg */
    var nav = document.getElementById('main-nav');
    if (window.scrollY > 80) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  lenis.on('scroll', onScroll);
  onScroll();

  /* ---- CUSTOM CURSOR ---- */
  var cd = document.getElementById('cursor-dot');
  var cr = document.getElementById('cursor-ring');
  var mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    cd.style.left = mx + 'px'; cd.style.top = my + 'px';
  });
  function ringLoop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    cr.style.left = rx + 'px'; cr.style.top = ry + 'px';
    requestAnimationFrame(ringLoop);
  }
  ringLoop();
  document.querySelectorAll('a, button, .skill-tile, .project-row').forEach(function(el) {
    el.addEventListener('mouseenter', function() { document.body.classList.add('hover-link'); });
    el.addEventListener('mouseleave', function() { document.body.classList.remove('hover-link'); });
  });
  /* hide cursor on touch */
  if ('ontouchstart' in window) {
    cd.style.display = 'none'; cr.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ---- REVEALS ---- */
  gsap.utils.toArray('.reveal').forEach(function(el) {
    gsap.to(el, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---- SKILL BAR FILLS ---- */
  gsap.utils.toArray('.skill-bar-fill').forEach(function(bar) {
    gsap.to(bar, {
      width: bar.dataset.w + '%', duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: bar, start: 'top 90%', once: true }
    });
  });
  gsap.utils.toArray('.skill-bar-pct').forEach(function(pct) {
    var target = parseInt(pct.dataset.w);
    ScrollTrigger.create({
      trigger: pct, start: 'top 90%', once: true,
      onEnter: function() {
        gsap.to({ val: 0 }, { val: target, duration: 1.4, ease: 'power2.out',
          onUpdate: function() { pct.textContent = Math.floor(this.targets()[0].val) + '%'; }
        });
      }
    });
  });

  /* ---- FACT COUNTERS ---- */
  document.querySelectorAll('.fact-num[data-target]').forEach(function(el) {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function() {
        gsap.to({ val: 1 }, { val: parseInt(el.dataset.target), duration: 1.8, ease: 'power2.out',
          onUpdate: function() { el.textContent = Math.max(1, Math.floor(this.targets()[0].val)) + '+'; }
        });
      }
    });
  });

  /* ---- HAMBURGER ---- */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  hamburger.addEventListener('click', function() { toggleMenu(!hamburger.classList.contains('open')); });
  mobileNav.querySelectorAll('a').forEach(function(el) { el.addEventListener('click', function() { toggleMenu(false); }); });

  /* ---- CONTACT FORM ---- */
  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    var name    = (form.querySelector('input[type=text]') || {}).value || '';
    var email   = (form.querySelector('input[type=email]') || {}).value || '';
    var message = (form.querySelector('textarea') || {}).value || '';
    var adminEmail = '%%ADMIN_EMAIL%%';
    var subject = encodeURIComponent('Project Inquiry from ' + name);
    var body = encodeURIComponent('Hi Hamza,\\n\\n' + message + '\\n\\nFrom: ' + name + '\\nReply to: ' + email);
    var mailtoUrl = 'mailto:' + adminEmail + '?subject=' + subject + '&body=' + body;
    var btn = document.getElementById('send-btn');
    var origHTML = btn.innerHTML;
    btn.textContent = 'Launching\u2026';
    setTimeout(function() {
      window.location.href = mailtoUrl;
      form.reset();
      setTimeout(function() { btn.innerHTML = origHTML; }, 2000);
    }, 400);
  });

} catch(e) { console.error('portfolio script error', e); }
});
</script>
</body>
</html>
`;
