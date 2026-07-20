'use client';

import { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import SplitVideo from '../components/SplitVideo';
import FestivalCard from '../components/FestivalCard';
import Modal from '../components/Modal';

/* ──────────────────────────────────────────────────────────────────────
   Bags Bro! — modernized homepage
   Content, colors and fonts preserved. New behaviours added:
   - custom neon cursor + magnetic buttons
   - scroll progress bar
   - intersection-observer reveals (no libs)
   - parallax pixel-dust canvas (replaces 100 hand-placed divs)
   - 3D tilt-on-hover for Vision telescope + Festival cards
   - rotating glitch word in the marquee
   - count-up stats strip
   - animated CSS portal vortex behind portal image
   - audio-style waveform decoration
   - copy-to-clipboard email button
   - Konami code → CRT party mode
   ────────────────────────────────────────────────────────────────────── */

// ─── helpers ────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, seen };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .9s ease ${delay}ms, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── custom cursor + scroll progress + parallax dust ─────────────────────
function NeonChrome() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (matchMedia('(hover:none)').matches) return;
    document.documentElement.style.cursor = 'none';

    let mx = innerWidth / 2, my = innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;
    let parX = 0, parY = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      parX = e.clientX / innerWidth - 0.5;
      parY = e.clientY / innerHeight - 0.5;
    };
    addEventListener('pointermove', onMove);

    // hot-state on interactive elements
    const targets = document.querySelectorAll('a,button,[data-tilt]');
    const onEnter = () => ringRef.current?.classList.add('is-hot');
    const onLeave = () => ringRef.current?.classList.remove('is-hot');
    targets.forEach(t => { t.addEventListener('mouseenter', onEnter); t.addEventListener('mouseleave', onLeave); });

    // scroll bar
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (barRef.current) barRef.current.style.width = (p * 100) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });

    // pixel dust
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    let w = 0, h = 0;
    const resize = () => {
      w = c.width = innerWidth * devicePixelRatio;
      h = c.height = innerHeight * devicePixelRatio;
      c.style.width = innerWidth + 'px';
      c.style.height = innerHeight + 'px';
    };
    resize(); addEventListener('resize', resize);
    const palette = ['#FF3366', '#00F5FF', '#FFD700'];
    const parts = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      z: 0.2 + Math.random(), s: 1 + Math.random() * 2,
      c: palette[i % 3], vy: 0.1 + Math.random() * 0.3,
    }));

    let raf = 0;
    const loop = () => {
      dx += (mx - dx) * 0.6; dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) rotate(${(performance.now() / 40) % 360}deg)`;

      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy * devicePixelRatio * p.z;
        if (p.y > h + 10) p.y = -10;
        const ox = parX * 30 * p.z * devicePixelRatio, oy = parY * 30 * p.z * devicePixelRatio;
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.5 + p.z * 0.5;
        ctx.shadowColor = p.c; ctx.shadowBlur = 10 * p.z;
        const sz = p.s * devicePixelRatio * p.z;
        ctx.fillRect(p.x + ox, p.y + oy, sz, sz);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    // Konami
    const k = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let ki = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === k[ki].toLowerCase()) {
        ki++;
        if (ki === k.length) { document.body.classList.add('bb-party'); ki = 0; setTimeout(() => document.body.classList.remove('bb-party'), 5000); }
      } else ki = 0;
    };
    addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', resize);
      removeEventListener('keydown', onKey);
      targets.forEach(t => { t.removeEventListener('mouseenter', onEnter); t.removeEventListener('mouseleave', onLeave); });
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="bb-cursor-dot" />
      <div ref={ringRef} className="bb-cursor-ring" />
      <div ref={barRef} className="bb-scrollbar" />
      <canvas ref={canvasRef} className="bb-dust" />
      <div className="bb-scanlines" />
      <div className="bb-vignette" />
    </>
  );
}

// ─── magnetic button wrapper ────────────────────────────────────────────
function useMagnetic<T extends HTMLElement>(strength = 0.2) {
  const ref = useRef<T | null>(null);
  const onMove = useCallback((e: MouseEvent<T>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength * 1.4}px)`;
  }, [strength]);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

// ─── tilt-on-hover ──────────────────────────────────────────────────────
function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const onMove = useCallback((e: MouseEvent<T>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg)`;
    el.style.setProperty('--mx', (x * 100) + '%');
    el.style.setProperty('--my', (y * 100) + '%');
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

// ─── count-up stat ──────────────────────────────────────────────────────
function CountStat({ target, prefix = '', suffix = '', label, raw = false }: { target: number; prefix?: string; suffix?: string; label: string; raw?: boolean; }) {
  const { ref, seen } = useReveal<HTMLDivElement>(0.5);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now(), dur = 1400;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]);
  return (
    <div ref={ref} className="bb-stat" data-tilt>
      <div className="bb-stat-num">{prefix}{raw ? v : v.toLocaleString()}{suffix}</div>
      <div className="bb-stat-lbl">{label}</div>
    </div>
  );
}

// ─── rotating glitch word ───────────────────────────────────────────────
function GlitchRotator({ words, interval = 2800 }: { words: string[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState(words[0]);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  useEffect(() => {
    const next = words[idx];
    const glyphs = '█▓▒░<>$#@*';
    let i = 0;
    const tick = setInterval(() => {
      let s = '';
      for (let k = 0; k < next.length; k++) s += k < i ? next[k] : glyphs[Math.floor(Math.random() * glyphs.length)];
      setDisplay(s);
      i += 0.5;
      if (i >= next.length) { clearInterval(tick); setDisplay(next); }
    }, 40);
    return () => clearInterval(tick);
  }, [idx, words]);
  return <span className="bb-rotator">{display}</span>;
}

// ─── ticker ─────────────────────────────────────────────────────────────
function Ticker() {
  const items = ['$SECURETHEBAG','BUILD A GREAT STORY','MIND YA BAGNESS','BEWARE THE BAG BLOCKERS','BAGONOMICS > TOKENOMICS'];
  const all = [...items, ...items];
  return (
    <div className="bb-ticker" aria-hidden>
      <div className="bb-ticker-track">
        {all.map((t, i) => (<span key={i}>{t}<i className="bb-sep" /></span>))}
      </div>
    </div>
  );
}

// ─── portal vortex + tilt card ──────────────────────────────────────────
function PortalVortex() {
  return (
    <div className="bb-portal-vis" data-tilt>
      <div className="bb-portal-rings">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bb-portal-ring" style={{ ['--i' as any]: i }} />
        ))}
      </div>
      <div className="bb-portal-core" />
      <div className="bb-waveform">
        {Array.from({ length: 14 }).map((_, i) => (
          <i key={i} style={{ animationDelay: (i * 0.08) + 's' }} />
        ))}
      </div>
    </div>
  );
}

// ─── tilt wrappers for existing components ──────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
  const t = useTilt<HTMLDivElement>();
  return <div className="bb-tilt-wrap h-full" ref={t.ref} onMouseMove={t.onMouseMove} onMouseLeave={t.onMouseLeave} data-tilt>{children}</div>;
}

function MagBtn({ children, onClick, variant = 'ghost' }: { children: React.ReactNode; onClick?: () => void; variant?: 'ghost' | 'primary' }) {
  const m = useMagnetic<HTMLButtonElement>(0.2);
  return (
    <button
      ref={m.ref}
      onMouseMove={m.onMouseMove}
      onMouseLeave={m.onMouseLeave}
      onClick={onClick}
      className={`bb-btn bb-btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText('jeremiah@metafizik.io');
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen">
      <BagsBroStyles />
      <NeonChrome />

      <HeroSection onWatchTrailer={() => setIsModalOpen(true)} />

      {/* Rotating tagline + stats strip — sits right under the hero */}
      <section className="bb-strip">
        <div className="bb-strip-inner">
          <Reveal className="bb-strip-tag">
            <span className="font-pixel text-secondary text-sm tracking-widest">MIND YA</span>{' '}
            <GlitchRotator words={['BAGNESS', 'BUSINESS', 'BLESSINGS', 'BAGONOMICS', 'GREATNESS']} />
          </Reveal>
          <div className="bb-stats">
            <CountStat target={100} suffix="%" label="Community Owned" />
            <CountStat target={42} prefix="$" suffix="M+" label="Bag Capacity ∞" />
            <CountStat target={2026} raw label="Festival Year" />
            <CountStat target={9000} suffix="+" label="Bagnoscenti" />
          </div>
        </div>
      </section>

      <Ticker />

      <GallerySection />

      <SplitVideo />

      {/* The Vision Section */}
      <section className="relative pt-32 pb-20 px-8 bg-gradient-to-b from-dark-bg to-blue-dark overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-[1fr,1.5fr] gap-16 items-center">
            <Reveal>
              <div className="bb-telescope-wrap" data-tilt>
                <div className="bb-telescope-orbit" />
                <div className="bb-telescope-orbit bb-b" />
                <div className="bb-telescope">
                  <img src="/images/telescope.png" alt="Telescope" className="w-full h-full object-cover" />
                </div>
                <div className="bb-orbiter bb-o1" />
                <div className="bb-orbiter bb-o2" />
              </div>
            </Reveal>

            <Reveal delay={150}>
              <h2
                className="font-pixel text-2xl md:text-4xl font-bold mb-8 text-white relative inline-block glitch-text animate-glitch"
                data-text="THE VISION"
                style={{ textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.6)', fontWeight: 700 }}
              >
                THE VISION
              </h2>
              <div className="space-y-5 text-base md:text-lg leading-relaxed opacity-90 font-mono">
                <p>Welcome to <span className="text-primary font-bold glow-text-pink">Bags Bro!</span> - a community-driven brand where music, memes, and animation collide into an ever-expanding Bagaverse.</p>
                <p>Around here, <span className="text-secondary font-bold glow-text-cyan">B.A.G.S.</span> stands for more than just loot - it means <span className="text-primary font-bold glow-text-pink">Build A Great Story</span>. And that's exactly what we're doing, one bag at a time.</p>
                <p>At Bags Bro!, we apply cutting-edge <span className="text-secondary glow-text-cyan">bagonomics</span>, deep <span className="text-primary glow-text-pink">bagsbrophysics</span>, and a sprinkle of bag magic (shhh...) to create a space where art, music, and creativity aren't just appreciated, they're tokenized. That means real rewards, no middlemen, and every supporter shares in the success.</p>
                <p>But beware: not everyone wants to see you win. <span className="text-primary font-bold glow-text-pink">Bag blockers</span> are real. Stay alert, stay grounded, and most importantly - <span className="text-secondary font-bold italic glow-text-cyan">mind ya bagness!</span></p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Festival Journey Section */}
      <section id="festivals" className="relative py-20 px-8 bg-gradient-to-b from-blue-dark to-dark-bg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-dark to-transparent z-0" />

        <div className="relative z-10 text-center">
          <Reveal>
            <h2
              className="font-pixel text-2xl md:text-4xl tracking-wider font-bold mb-8 text-white relative inline-block glitch-text animate-glitch leading-tight"
              data-text="FESTIVAL JOURNEY"
              style={{ textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.6)', fontWeight: 700 }}
            >
              FESTIVAL JOURNEY
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-secondary to-primary mx-auto mb-16 shadow-[0_0_20px_rgba(255,51,102,0.8)]" />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            <Reveal delay={0} className="h-full"><TiltCard><FestivalCard icon="🎬" title="Official Selection" description="Officially submitted to elite pixel cults and post-ironic film temples around the globe. Still waiting to hear back from Cannes, but Baby Blickey swears his cousin runs the programming team." /></TiltCard></Reveal>
            <Reveal delay={120} className="h-full"><TiltCard><FestivalCard icon="🏆" title="Award Tracks" description="Competing for official awards, unofficial nods, and at least one programmer saying 'I didn't get it… but I liked it.'" /></TiltCard></Reveal>
            <Reveal delay={240} className="h-full"><TiltCard><FestivalCard icon="🎭" title="Screening Events" description="Will screen anywhere with a projector, a loose definition of taste, and at least one vegan charcuterie board. DM us for submissions or summon Baby Blickey directly by whispering '$SECURETHEBAG' into a QR code." /></TiltCard></Reveal>
          </div>
        </div>
      </section>

      {/* Beyond Normieville Section */}
      <section className="relative py-20 px-8 bg-gradient-to-b from-dark-bg to-[#0A0A0F] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-dark-bg to-transparent z-0" />

        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <h2 className="font-pixel text-2xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>
              Beyond Normieville
            </h2>
          </Reveal>

          <Reveal>
            <div className="glass p-8 md:p-12 rounded-xl border border-white/10 hover:border-accent-yellow/50 transition-all duration-400">
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="flex flex-col">
                  <div className="relative flex-1 bb-portal-frame">
                    <PortalVortex />
                    <img
                      src="/images/portal.png"
                      alt="Harold and Baby Blickey entering the Bagaverse"
                      className="w-full h-full object-cover rounded-lg shadow-[0_0_40px_rgba(255,215,0,0.3)] border-4 border-transparent"
                      style={{ borderImage: 'linear-gradient(to right, #FF3366, #FFD700, #00F5FF) 1', filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}
                    />
                  </div>
                  <MagBtn onClick={() => setIsStoryOpen(true)} variant="primary">Read More</MagBtn>
                </div>

                <div className="font-mono text-base md:text-lg leading-relaxed flex flex-col justify-center">
                  <p className="mb-4">Harold threw on his finest travelling overalls...the ones with the lucky patch, then hopped into his rusted farm truck with Baby Blickey riding shotgun like a duffel-shaped co-pilot of destiny.</p>
                  <p className="mb-4">They weren't entirely sure where the Bagaverse began, but Blickey insisted it was "just past the edge of normie thought." As they rolled toward the outskirts of Normieville, Baby Blickey suddenly jolted upright and shouted,</p>
                  <p className="bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent font-bold italic" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>
                    "There… beneath the branches. Do you feel it? The static in the leaves."
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Portal Story Modal */}
        {isStoryOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 bb-modal" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('bb-modal')) setIsStoryOpen(false); }}>
            <div className="bg-dark-bg border-2 border-secondary rounded-xl max-w-4xl max-h-[80vh] overflow-y-auto p-8 md:p-12 relative">
              <button onClick={() => setIsStoryOpen(false)} className="absolute top-4 right-4 text-secondary hover:text-primary text-3xl font-bold">×</button>
              <h3 className="font-pixel text-2xl md:text-3xl mb-6 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>The Portal</h3>
              <div className="font-mono text-base md:text-lg leading-relaxed space-y-4">
                <p>Harold threw on his finest travelling overalls...the ones with the lucky patch, then hopped into his rusted farm truck with Baby Blickey riding shotgun like a duffel-shaped co-pilot of destiny.</p>
                <p>They weren't entirely sure where the Bagaverse began, but Blickey insisted it was "just past the edge of normie thought." As they rolled toward the outskirts of Normieville, Baby Blickey suddenly jolted upright and shouted,</p>
                <p className="bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent font-bold italic" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>"There… beneath the branches. Do you feel it? The static in the leaves."</p>
                <p>Harold squinted. Tucked behind a cluster of trees and boomered-off GPS signals was a sketchy ravine with what looked like a tunnel entrance someone rage-quit halfway through landscaping. Overgrown with vines, moss, and suspicious glimmers, it looked less like a shortcut and more like a metaphor. Still, Harold pressed on.</p>
                <p>The moment they entered the tunnel, things got weird. Real weird. The rearview mirror melted into pixels. The AM radio began playing 8-bit country remixes. Harold looked down and realized his hands were turning square. Not metaphorically - literally.</p>
                <p>He turned to Baby Blickey, who by now was fully transformed into a hyper-saturated pixel bag with sparkles orbiting his handles.</p>
                <p>"Uh… Blickey?" Harold croaked.</p>
                <p>Baby Blickey turned calmly, sunglasses glinting with glitch-light.</p>
                <p className="bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent font-bold italic" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>"Don't trip, fam. The Bagaverse is within you."</p>
                <p>When they emerged from the other side, everything had changed. The sky shimmered like it had been rendered in MS Paint. The town looked almost like Normieville, but crisper. Loopier. Smellier, somehow.</p>
                <p>Instead of people, there were bouncing baby bags everywhere - giggling, dancing, arguing about floor price. One of them tried to sell Harold a meme NFT for three bottle caps and a rusty hardware wallet last synced in 2021.</p>
                <p>Blickey turned to Harold, visibly gassed.</p>
                <p className="bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent font-bold italic" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>"We made it, bro. The farm's comin' back. The bags? All but secured."</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer - Let's Connect */}
      <footer id="connect" className="relative py-24 px-8 bg-[#0A0A0F] border-t border-white/10 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <h2
              className="font-pixel text-4xl md:text-5xl font-bold mb-4 text-white relative inline-block glitch-text animate-glitch"
              data-text="LET'S CONNECT"
              style={{ textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.6)', fontWeight: 700 }}
            >
              LET'S CONNECT
            </h2>
            <p className="text-xl mb-8 opacity-80 font-mono">Interested in screening or collaborating? Get in touch.</p>

            <button onClick={copyEmail} className={`bb-email-btn ${copied ? 'is-copied' : ''}`} aria-label="Copy email">
              <span className="bb-email-label">jeremiah@metafizik.io</span>
              <span className="bb-email-copied">COPIED ✓</span>
            </button>
          </Reveal>
        </div>
      </footer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}

// ─── styles (kept inline so this single .tsx is drop-in) ─────────────────
function BagsBroStyles() {
  return (
    <style jsx global>{`
      /* Custom cursor */
      .bb-cursor-dot, .bb-cursor-ring { position: fixed; top:0; left:0; pointer-events:none; z-index:9999; mix-blend-mode:screen; will-change:transform; }
      .bb-cursor-dot { width:6px; height:6px; background:#00F5FF; border-radius:1px; box-shadow:0 0 12px #00F5FF, 0 0 24px #00F5FF; transform:translate(-50%,-50%); }
      .bb-cursor-ring { width:32px; height:32px; border:2px solid #FF3366; border-radius:2px; transform:translate(-50%,-50%); transition:width .18s, height .18s, border-color .18s, background .18s; }
      .bb-cursor-ring.is-hot { width:54px; height:54px; border-color:#FFD700; background:rgba(255,215,0,.08); box-shadow:0 0 24px rgba(255,215,0,.5); }
      @media (hover:none) { .bb-cursor-dot, .bb-cursor-ring { display:none; } }

      /* Overlays */
      .bb-scrollbar { position:fixed; top:0; left:0; height:3px; width:0%; background:linear-gradient(90deg,#FF3366,#FFD700,#00F5FF); z-index:998; box-shadow:0 0 14px rgba(255,51,102,.6); }
      .bb-dust { position:fixed; inset:0; pointer-events:none; z-index:1; opacity:.7; }
      .bb-scanlines { position:fixed; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg, rgba(255,255,255,.02) 0 1px, transparent 1px 3px); z-index:997; mix-blend-mode:overlay; opacity:.35; }
      .bb-vignette { position:fixed; inset:0; pointer-events:none; background:radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.55) 100%); z-index:996; }
      body.bb-party { animation: bb-hue 1.5s linear infinite; }
      @keyframes bb-hue { to { filter:hue-rotate(360deg); } }

      /* Nav */
      .bb-nav { position:fixed; top:14px; left:50%; transform:translateX(-50%); z-index:50; display:flex; gap:6px; padding:8px; background:rgba(10,10,15,.6); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.08); border-radius:999px; }
      .bb-nav a { padding:10px 14px; font-family:"Press Start 2P", monospace; font-size:10px; color:#cfd0ff; text-decoration:none; border-radius:999px; transition:color .2s, background .2s; }
      .bb-nav a:hover { color:#FFD700; background:rgba(255,215,0,.08); }
      .bb-nav-cta { color:#0a0a0f !important; background:linear-gradient(90deg,#FF3366,#FFD700,#00F5FF); }
      .bb-nav-cta:hover { filter:brightness(1.15); background:linear-gradient(90deg,#FF3366,#FFD700,#00F5FF) !important; }

      /* Strip + stats */
      .bb-strip { position:relative; padding:48px 24px 24px; background:linear-gradient(180deg, transparent, rgba(10,18,48,.5)); z-index:2; }
      .bb-strip-inner { max-width:1200px; margin:0 auto; }
      .bb-strip-tag { text-align:center; font-family:"Press Start 2P", monospace; font-size:clamp(18px,2.6vw,30px); color:#fff; margin-bottom:36px; }
      .bb-rotator { color:#FFD700; text-shadow:0 0 14px rgba(255,215,0,.6); margin-left:10px; display:inline-block; min-width:11ch; text-align:left; }
      .bb-stats { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; }
      @media (max-width:880px) { .bb-stats { grid-template-columns:repeat(2,1fr); } }
      .bb-stat { padding:22px; border:1px solid rgba(255,255,255,.1); border-radius:14px; background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0)); position:relative; overflow:hidden; transition:transform .2s, border-color .25s; }
      .bb-stat::after { content:""; position:absolute; inset:0; background:radial-gradient(280px circle at var(--mx,50%) var(--my,50%), rgba(255,215,0,.18), transparent 55%); opacity:0; transition:opacity .25s; pointer-events:none; }
      .bb-stat:hover { border-color:rgba(255,215,0,.4); }
      .bb-stat:hover::after { opacity:1; }
      .bb-stat-num { font-family:"Press Start 2P", monospace; font-size:30px; color:#FFD700; text-shadow:0 0 14px rgba(255,215,0,.5); }
      .bb-stat-lbl { font-size:11px; opacity:.7; margin-top:8px; letter-spacing:.12em; text-transform:uppercase; font-family:"JetBrains Mono", ui-monospace, monospace; }

      /* Ticker */
      .bb-ticker { display:flex; overflow:hidden; border-top:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08); background:rgba(10,10,15,.8); padding:16px 0; position:relative; z-index:2; }
      .bb-ticker-track { display:flex; gap:50px; white-space:nowrap; animation: bb-tick 32s linear infinite; font-family:"Press Start 2P", monospace; font-size:14px; }
      .bb-ticker-track > span { display:inline-flex; align-items:center; gap:30px; color:#fff; text-shadow:0 0 12px rgba(255,51,102,.5); }
      .bb-sep { width:10px; height:10px; background:#FFD700; transform:rotate(45deg); box-shadow:0 0 14px #FFD700; display:inline-block; }
      @keyframes bb-tick { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }

      /* Buttons */
      .bb-btn { position:relative; padding:14px 22px; margin-top:16px; font-family:"Press Start 2P", monospace; font-size:12px; color:#fff; background:transparent; border:2px solid #00F5FF; border-radius:4px; letter-spacing:.06em; overflow:hidden; transition:transform .15s, color .2s, border-color .2s; cursor:none; }
      .bb-btn-primary { border-color:transparent; background:linear-gradient(90deg,#FF3366,#FFD700,#00F5FF); background-size:200% 100%; color:#0a0a0f; animation: bb-grad 6s linear infinite; }
      @keyframes bb-grad { 0%{background-position:0% 0} 100%{background-position:200% 0} }
      .bb-btn-ghost:hover { color:#FFD700; border-color:#FFD700; box-shadow:0 0 0 4px rgba(255,215,0,.12), 0 0 30px rgba(255,215,0,.25) inset; }

      /* Telescope tilt */
      .bb-telescope-wrap { position:relative; width:100%; max-width:440px; aspect-ratio:1; margin:0 auto; transition:transform .2s; }
      .bb-telescope-orbit { position:absolute; inset:0; border-radius:50%; border:2px dashed rgba(0,245,255,.25); animation: bb-rot 30s linear infinite; }
      .bb-telescope-orbit.bb-b { inset:-22px; border-color:rgba(255,51,102,.18); animation-duration:48s; animation-direction:reverse; }
      @keyframes bb-rot { to { transform:rotate(360deg); } }
      .bb-telescope { position:absolute; inset:24px; border-radius:50%; border:4px solid #00F5FF; box-shadow:0 0 50px rgba(0,245,255,.5), inset 0 0 60px rgba(255,51,102,.25); overflow:hidden; background:radial-gradient(circle at 30% 30%, #4a1d6e, #0d0824 70%); }
      .bb-telescope img { width:100%; height:100%; object-fit:cover; }
      .bb-orbiter { position:absolute; width:16px; height:16px; top:50%; left:50%; border-radius:2px; box-shadow:0 0 14px currentColor; transform-origin:0 0; }
      .bb-orbiter.bb-o1 { background:#FFD700; color:#FFD700; animation: bb-orb1 8s linear infinite; }
      .bb-orbiter.bb-o2 { background:#FF3366; color:#FF3366; animation: bb-orb2 11s linear infinite; }
      @keyframes bb-orb1 { from{transform:rotate(0) translateX(180px)} to{transform:rotate(360deg) translateX(180px)} }
      @keyframes bb-orb2 { from{transform:rotate(90deg) translateX(200px)} to{transform:rotate(450deg) translateX(200px)} }

      /* Festival card tilt wrapper */
      .bb-tilt-wrap { transition:transform .2s ease-out; transform-style:preserve-3d; }

      /* Portal vortex */
      .bb-portal-frame { position:relative; min-height:340px; }
      .bb-portal-vis { position:absolute; inset:0; border-radius:.5rem; overflow:hidden; pointer-events:none; mix-blend-mode:screen; opacity:.85; transition:transform .25s; }
      .bb-portal-rings { position:absolute; inset:0; }
      .bb-portal-ring { position:absolute; left:50%; top:50%; width:calc(20% + var(--i) * 12%); aspect-ratio:1; transform:translate(-50%,-50%); border-radius:50%; border:1px solid; border-color:hsl(calc(50 - var(--i) * 30), 90%, 60%); opacity:.4; animation: bb-pulse 4s ease-in-out infinite; animation-delay:calc(var(--i) * -.4s); }
      @keyframes bb-pulse { 0%,100%{transform:translate(-50%,-50%) scale(.9); opacity:.2;} 50%{transform:translate(-50%,-50%) scale(1.1); opacity:.6;} }
      .bb-portal-core { position:absolute; left:50%; top:50%; width:30%; aspect-ratio:1; transform:translate(-50%,-50%); border-radius:50%; background:radial-gradient(circle, #fff, #FFD700 30%, #FF3366 60%, transparent 75%); filter:blur(3px); animation: bb-corepulse 3s ease-in-out infinite; mix-blend-mode:screen; }
      @keyframes bb-corepulse { 0%,100%{transform:translate(-50%,-50%) scale(.95);} 50%{transform:translate(-50%,-50%) scale(1.1);} }
      .bb-waveform { position:absolute; left:14px; bottom:12px; display:flex; align-items:flex-end; gap:3px; height:32px; }
      .bb-waveform i { display:block; width:3px; background:#00F5FF; border-radius:1px; box-shadow:0 0 6px #00F5FF; animation: bb-wv 1.2s ease-in-out infinite; }
      @keyframes bb-wv { 0%,100%{height:4px} 50%{height:100%} }

      /* Email button */
      .bb-email-btn { position:relative; display:inline-flex; align-items:center; gap:14px; padding:18px 28px; font-family:"Press Start 2P", monospace; font-size:18px; color:#00F5FF; background:transparent; border:2px solid #00F5FF; border-radius:6px; overflow:hidden; transition:color .2s, border-color .2s, transform .15s; cursor:none; }
      .bb-email-btn:hover { color:#FF3366; border-color:#FF3366; transform:translateY(-2px); }
      .bb-email-copied { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#FFD700; color:#0a0a0f; opacity:0; transition:opacity .25s; }
      .bb-email-btn.is-copied .bb-email-copied { opacity:1; }

      /* Modal */
      .bb-modal { backdrop-filter:blur(4px); }
    `}</style>
  );
}
