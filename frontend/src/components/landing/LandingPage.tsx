import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import {  useNavigate } from "react-router-dom";

const F1 = "var(--f1)";
const F2 = "var(--f2)";

/*  Hooks  */
function useInView(t = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t, rootMargin: "0px 0px -40px 0px" });
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return [ref, v] as const;
}

function useWin() {
  const [w, sW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

/* Animated counter  */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [ref, vis] = useInView();
  useEffect(() => {
    if (!vis) return;
    let s = 0; const step = end / 125;
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [vis, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* Sticker  */
function Sticker({ children, top, left, right, bottom, rotate = 0, size = 44, delay = 0 }: { children: ReactNode; top?: string; left?: string; right?: string; bottom?: string; rotate?: number; size?: number; delay?: number }) {
  const [ref, v] = useInView(0.01);
  return (
    <div ref={ref} style={{ position: "absolute", top, left, right, bottom, zIndex: 5, fontSize: size, lineHeight: 1, pointerEvents: "none", transform: v ? `rotate(${rotate}deg) scale(1)` : `rotate(${rotate + 40}deg) scale(0)`, opacity: v ? 1 : 0, transition: `all 0.7s cubic-bezier(.34,1.56,.64,1) ${delay}s` }}>{children}</div>
  );
}

/* Reveal */
function R({ children, d = 0, from = "up", style = {} }: { children: ReactNode; d?: number; from?: string; style?: CSSProperties }) {
  const [ref, v] = useInView(0.08);
  const t: Record<string, string> = { up: "translateY(60px) rotate(2deg)", down: "translateY(-50px)", left: "translateX(80px) rotate(3deg)", right: "translateX(-80px) rotate(-3deg)", pop: "scale(0.7) rotate(-5deg)" };
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0) rotate(0deg) scale(1)" : t[from], transition: `all 0.9s cubic-bezier(.22,1,.36,1) ${d}s`, ...style }}>{children}</div>;
}

/* Wiggly card*/
function WCard({ children, rotate = 0, radius = "24px 8px 28px 12px", pad, style = {} }: { children: ReactNode; rotate?: number; radius?: string; pad?: string; style?: CSSProperties }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: radius, padding: pad || "28px 26px",
      transform: hov ? `rotate(${rotate * 0.3}deg) scale(1.03)` : `rotate(${rotate}deg)`,
      transition: "all 0.4s cubic-bezier(.4,0,.2,1)", position: "relative", overflow: "hidden", ...style,
    }}>{children}</div>
  );
}

//Handlescroll function (direct to the dif section on lending page )
 const handleScroll = (selector: string) => {
      const el = document.querySelector(selector);
      el?.scrollIntoView({
        behavior: "smooth"
      });
    };


/* NAV */
function Nav({ scrolled, mob, onLogin, onSignup }: { scrolled: boolean; mob: boolean; onLogin: () => void; onSignup: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: mob ? "14px 20px" : "16px 48px", background: scrolled ? "rgba(12,10,18,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "all 0.5s ease", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: "12px 6px 14px 8px", background: "#ffe45e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transform: "rotate(-6deg)", boxShadow: "3px 3px 0 #ff5757" }}>💬</div>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: F1, letterSpacing: -0.5 }}>SayIt</span>
        </div>
        {mob ? (
          <button onClick={() => setOpen(!open)} style={{ background: "#ffe45e", border: "none", borderRadius: "8px 4px 10px 6px", width: 38, height: 38, cursor: "pointer", fontSize: 18, transform: "rotate(3deg)", boxShadow: "2px 2px 0 #ff5757", display: "flex", alignItems: "center", justifyContent: "center" }}>{open ? "✕" : "☰"}</button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <button onClick={() => handleScroll(".howitworks")} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14, fontFamily: F2, fontWeight: 500, transition: "all 0.25s", display: "inline-block" }}>
              How It Works
            </button>
            <button onClick={() => handleScroll(".topics")} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14, fontFamily: F2, fontWeight: 500, transition: "all 0.25s", display: "inline-block" }}>
              Topics
            </button>
            <button onClick={() => handleScroll(".community")} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14, fontFamily: F2, fontWeight: 500, transition: "all 0.25s", display: "inline-block" }}>
              Community
            </button>
            <button onClick={onLogin} style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "14px 6px 16px 8px", padding: "8px 20px", color: "#fff", fontSize: 13.5, fontFamily: F2, fontWeight: 600, cursor: "pointer", transform: "rotate(-1deg)" }}>Log in</button>
            <button onClick={onSignup} style={{ background: "#ffe45e", border: "none", borderRadius: "14px 6px 18px 8px", padding: "9px 24px", color: "#0C0A12", fontSize: 14, fontFamily: F1, fontWeight: 600, cursor: "pointer", transform: "rotate(1.5deg)", boxShadow: "3px 3px 0 #ff5757" }}>Join the chaos</button>
          </div>
        )}
      </nav>
      {mob && <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "#0C0A12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.4s" }}>
        {[{ label: "How it works", selector: ".howitworks" }, { label: "Topics", selector: ".topics"}, { label: "Community", selector: ".community"}].map((l, i) => <a key={l.label} href="#" onClick={() => { setOpen(false); handleScroll(l.selector);}} style={{ color: "#fff", textDecoration: "none", fontSize: 32, fontFamily: F1, fontWeight: 600, transform: `rotate(${(i - 1) * 3}deg)` }}>{l.label}</a>)}
        <button onClick={() => { setOpen(false); onSignup(); }} style={{ marginTop: 12, background: "#ffe45e", border: "none", borderRadius: "16px 8px 20px 10px", padding: "16px 40px", color: "#0C0A12", fontSize: 18, fontFamily: F1, fontWeight: 700, cursor: "pointer", transform: "rotate(-2deg)", boxShadow: "4px 4px 0 #ff5757" }}>Join the chaos</button>
      </div>}
    </>
  );
}

/* HERO */
function Hero({ mob, onSignup }: { mob: boolean; onSignup: () => void }) {
  return (
    <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mob ? "110px 20px 60px" : "120px 48px 80px" }}>
      <div style={{ position: "absolute", top: "-12%", left: "-8%", width: 450, height: 450, borderRadius: "42% 58% 63% 37%", background: "rgba(255,228,94,0.07)", filter: "blur(80px)", pointerEvents: "none", animation: "blobA 14s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", bottom: "-8%", right: "-6%", width: 380, height: 380, borderRadius: "55% 45% 38% 62%", background: "rgba(255,87,87,0.05)", filter: "blur(90px)", pointerEvents: "none", animation: "blobB 16s ease-in-out infinite alternate" }} />
      {!mob && <><Sticker top="12%" left="6%" rotate={-15} size={52} delay={0.3}>🧠</Sticker><Sticker top="18%" right="8%" rotate={12} size={46} delay={0.5}>🔥</Sticker><Sticker bottom="22%" left="10%" rotate={20} size={40} delay={0.7}>💡</Sticker><Sticker bottom="15%" right="12%" rotate={-8} size={50} delay={0.9}>⚡</Sticker></>}

      <R d={0.1}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: mob ? 20 : 28, background: "rgba(255,228,94,0.1)", border: "1.5px solid rgba(255,228,94,0.25)", borderRadius: "20px 8px 22px 10px", padding: "7px 18px", transform: "rotate(-2deg)" }}>
          <span style={{ background: "#ff5757", borderRadius: "6px 3px 8px 4px", padding: "2px 9px", fontSize: 10, fontWeight: 800, color: "#fff", fontFamily: F1, textTransform: "uppercase", letterSpacing: 1 }}>Live</span>
          <span style={{ color: "#ffe45e", fontSize: mob ? 12 : 13, fontFamily: F2, fontWeight: 500 }}>real discussions happening right now</span>
        </div>
      </R>

      <R d={0.25}>
        <h1 style={{ fontSize: mob ? "clamp(42px, 13vw, 56px)" : "clamp(64px, 8vw, 110px)", fontWeight: 700, textAlign: "center", lineHeight: 0.95, fontFamily: F1, letterSpacing: mob ? -1 : -4, margin: "0 0 12px", maxWidth: 900 }}>
          <span style={{ color: "#fff", display: "block", transform: "rotate(-1.5deg)" }}>say what you</span>
          <span style={{ display: "inline-block", transform: "rotate(1.5deg)", background: "#ffe45e", color: "#0C0A12", borderRadius: "12px 4px 16px 6px", padding: mob ? "2px 14px" : "4px 24px", boxShadow: "4px 4px 0 #ff5757", marginTop: 4 }}>actually</span>
          <span style={{ color: "#fff", display: "block", transform: "rotate(-0.8deg)", marginTop: 4 }}>think.</span>
        </h1>
      </R>

      <R d={0.45}>
        <p style={{ fontSize: mob ? 15 : 19, color: "var(--text-muted)", textAlign: "center", maxWidth: mob ? 340 : 480, lineHeight: 1.65, fontFamily: F2, margin: "16px auto 36px", transform: "rotate(0.5deg)" }}>
          the anonymous forum where ideas matter more than identities. real discussions on <span style={{ color: "#ffe45e", fontWeight: 600 }}>tech, science, politics</span> and everything in between.
        </p>
      </R>

      <R d={0.6}>
        <div style={{ display: "flex", gap: 14, flexDirection: mob ? "column" : "row", alignItems: "center", width: mob ? "100%" : "auto" }}>
          <button onClick={onSignup} style={{ background: "#ffe45e", border: "none", borderRadius: "18px 6px 22px 10px", padding: mob ? "17px 15px" : "17px 38px", width: mob ? "100%" : "auto", color: "#0C0A12", fontSize: mob ? 16 : 17, fontWeight: 700, fontFamily: F1, cursor: "pointer", boxShadow: "4px 4px 0 #ff5757", transform: "rotate(-1deg)", transition: "all 0.35s" }}>join the discussion →</button>
          <button onClick={() => handleScroll(".howitworks")} style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "16px 8px 20px 10px", padding: mob ? "15px 0" : "15px 32px", width: mob ? "100%" : "auto", color: "rgba(255,255,255,0.6)", fontSize: mob ? 15 : 16, fontWeight: 600, fontFamily: F2, cursor: "pointer", transform: "rotate(1deg)" }}>see how it works ↓</button>
        </div>
      </R>

      <div style={{ position: "absolute", bottom: mob ? 12 : 28, animation: "bounce 2.5s ease infinite" }}><span style={{ color: "rgba(255,255,255,0.15)", fontSize: 18 }}>↓</span></div>
    </section>
  );
}

/*  How it works*/
function HowSection({ mob }: { mob: boolean }) {
  const steps = [
    { num: "01", icon: "🎭", title: "pick your identity", desc: "stay anonymous or show your face. switch anytime.", rot: -2.5, color: "#ffe45e", radius: "24px 8px 28px 12px" },
    { num: "02", icon: "💬", title: "join a channel", desc: "tech, science, politics, memes — find your crowd.", rot: 1.8, color: "#ff5757", radius: "8px 24px 12px 28px" },
    { num: "03", icon: "⚡", title: "start a thread", desc: "share insights, ask questions, drop hot takes.", rot: -1.5, color: "#7857ff", radius: "28px 12px 24px 8px" },
    { num: "04", icon: "🔥", title: "watch it grow", desc: "upvotes, replies, real discussions. no algorithm bs.", rot: 2.2, color: "#4ae3c0", radius: "12px 28px 8px 24px" },
  ];
  return (
    <section className="howitworks" style={{ padding: mob ? "60px 20px 80px" : "80px 48px 120px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <R><span style={{ display: "inline-block", background: "rgba(255,228,94,0.1)", border: "1.5px solid rgba(255,228,94,0.2)", borderRadius: "12px 4px 14px 6px", padding: "5px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#ffe45e", fontFamily: F1, transform: "rotate(-2deg)" }}>How it works</span></R>
        <R d={0.1}><h2 style={{ fontSize: mob ? "clamp(32px, 10vw, 42px)" : "clamp(44px, 5vw, 64px)", fontWeight: 700, fontFamily: F1, letterSpacing: -2, margin: "14px 0 40px", lineHeight: 1.05 }}><span style={{ display: "block", transform: "rotate(-1deg)" }}>four steps.</span><span style={{ display: "block", transform: "rotate(0.8deg)", color: "var(--text-dim)" }}>total freedom.</span></h2></R>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: mob ? 16 : 24 }}>
          {steps.map((s, i) => (
            <R key={i} d={i * 0.1} from="pop">
              <WCard rotate={mob ? s.rot * 0.4 : s.rot} radius={s.radius} pad={mob ? "22px 20px" : "30px 28px"}>
                <div style={{ display: "flex", alignItems: mob ? "center" : "flex-start", gap: mob ? 14 : 0, flexDirection: mob ? "row" : "column" }}>
                  {mob ? <div style={{ minWidth: 52, height: 52, borderRadius: "16px 6px 18px 8px", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1.5px solid ${s.color}30`, flexShrink: 0 }}>{s.icon}</div>
                    : <div style={{ fontSize: 38, marginBottom: 12 }}>{s.icon}</div>}
                  <div>
                    <span style={{ fontFamily: F1, fontSize: 11, color: s.color, fontWeight: 700, letterSpacing: 2 }}>{s.num}</span>
                    <h3 style={{ fontSize: mob ? 17 : 20, fontWeight: 600, margin: "4px 0 6px", fontFamily: F1 }}>{s.title}</h3>
                    <p style={{ fontSize: mob ? 13.5 : 14.5, color: "var(--text-muted)", lineHeight: 1.55, fontFamily: F2, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              </WCard>
            </R>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Topics  */
function Topics({ mob }: { mob: boolean }) {
  const topics = [
    { icon: "💻", name: "Tech & AI", count: "24.1k", color: "#5b9dff", rot: -2, radius: "22px 8px 26px 10px" },
    { icon: "🌍", name: "World & Politics", count: "18.3k", color: "#ff5757", rot: 1.5, radius: "8px 22px 10px 26px" },
    { icon: "🔬", name: "Science", count: "12.7k", color: "#4ae3c0", rot: -1, radius: "26px 10px 22px 8px" },
    { icon: "📈", name: "Business", count: "15.4k", color: "#ffe45e", rot: 2.5, radius: "10px 26px 8px 22px" },
    { icon: "🎓", name: "Career", count: "9.8k", color: "#7857ff", rot: -1.8, radius: "20px 6px 24px 10px" },
    { icon: "😂", name: "Memes & Chill", count: "31.2k", color: "#ff9b3d", rot: 1.2, radius: "6px 20px 10px 24px" },
  ];
  return (
    <section  className="topics" style={{ padding: mob ? "60px 20px 80px" : "80px 48px 120px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <R><span style={{ display: "inline-block", background: "rgba(255,87,87,0.1)", border: "1.5px solid rgba(255,87,87,0.2)", borderRadius: "12px 4px 14px 6px", padding: "5px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#ff5757", fontFamily: F1, transform: "rotate(-1.5deg)", marginBottom: 14 }}>Channels</span></R>
        <R d={0.1}><h2 style={{ fontSize: mob ? "clamp(32px, 10vw, 42px)" : "clamp(44px, 5vw, 60px)", fontWeight: 700, fontFamily: F1, letterSpacing: -2, margin: "0 0 40px", lineHeight: 1.05 }}><span style={{ color: "#fff", display: "block", transform: "rotate(0.8deg)" }}>find your</span><span style={{ display: "inline-block", background: "#ff5757", color: "#fff", borderRadius: "10px 4px 12px 6px", padding: "2px 16px", transform: "rotate(-2.5deg)", boxShadow: "3px 3px 0 #ffe45e" }}>people.</span></h2></R>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3, 1fr)", gap: mob ? 12 : 20 }}>
          {topics.map((t, i) => (
            <R key={i} d={i * 0.07} from="pop">
              <WCard rotate={mob ? t.rot * 0.5 : t.rot} radius={t.radius} pad={mob ? "18px 16px" : "26px 24px"} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: mob ? 8 : 12 }}>
                  <span style={{ fontSize: mob ? 28 : 36 }}>{t.icon}</span>
                  <span style={{ background: `${t.color}15`, color: t.color, fontSize: 10.5, fontFamily: F1, fontWeight: 700, padding: "3px 9px", borderRadius: "8px 3px 9px 4px", transform: "rotate(2deg)" }}>{t.count}</span>
                </div>
                <h3 style={{ fontSize: mob ? 15 : 18, fontWeight: 600, fontFamily: F1, margin: 0 }}>{t.name}</h3>
              </WCard>
            </R>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Social proof*/
function Proof({ mob }: { mob: boolean }) {
  const quotes = [
    { t: "finally a forum where the discussion quality isn't buried under memes", a: "🦊", h: "@anon_falcon" },
    { t: "the tech channel is better than half of hacker news. and it's anonymous.", a: "🌚", h: "@anon_wolf" },
    { t: "love switching between anon for hot takes and public for serious threads", a: "🎭", h: "@anon_hawk" },
  ];
  return (
    <section className="community" style={{ padding: mob ? "60px 20px 80px" : "80px 48px 120px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <R>
          <div style={{ display: "flex", justifyContent: mob ? "space-around" : "center", gap: mob ? 16 : 72, marginBottom: mob ? 48 : 72, flexWrap: "wrap", textAlign: "center" }}>
            {[{ v: 247, s: "k", l: "threads posted", rot: -2 }, { v: 89, s: "k", l: "active users", rot: 1.5 }, { v: 1.2, s: "M", l: "replies", rot: -1 }].map((st, i) => (
              <div key={i} style={{ transform: `rotate(${mob ? st.rot * 0.4 : st.rot}deg)` }}>
                <div style={{ fontSize: mob ? "clamp(36px, 11vw, 48px)" : "clamp(50px, 5vw, 72px)", fontWeight: 700, fontFamily: F1, letterSpacing: -2, color: "#ffe45e", textShadow: "3px 3px 0 rgba(255,87,87,0.25)" }}><Counter end={st.v} />{st.s}</div>
                <div style={{ fontSize: mob ? 11 : 14, color: "var(--text-dim)", fontFamily: F2, marginTop: 2 }}>{st.l}</div>
              </div>
            ))}
          </div>
        </R>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 14 : 20 }}>
          {quotes.map((q, i) => (
            <R key={i} d={i * 0.1} from="pop">
              <WCard rotate={[-2, 1.5, -1][i]} radius={["22px 8px 26px 10px", "8px 22px 10px 26px", "26px 10px 22px 8px"][i]} pad={mob ? "22px 20px" : "28px 26px"}>
                <p style={{ fontSize: mob ? 14 : 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontFamily: F2, margin: "0 0 18px", fontStyle: "italic" }}>"{q.t}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20, transform: "rotate(-8deg)" }}>{q.a}</span>
                  <span style={{ color: "var(--text-dim)", fontSize: 12.5, fontFamily: F1, fontWeight: 500 }}>{q.h}</span>
                </div>
              </WCard>
            </R>
          ))}
        </div>
      </div>
    </section>
  );
}

/*CTA*/
function CTA({ mob, onSignup }: { mob: boolean; onSignup: () => void }) {
  return (
    <section  style={{ padding: mob ? "80px 20px 70px" : "100px 48px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "42% 58% 63% 37%", background: "rgba(255,228,94,0.05)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <R><div style={{ fontSize: mob ? 48 : 60, marginBottom: 16, display: "inline-block", transform: "rotate(-8deg)" }}>💬</div></R>
        <R d={0.1}><h2 style={{ fontSize: mob ? "clamp(32px, 10vw, 42px)" : "clamp(42px, 5vw, 60px)", fontWeight: 700, fontFamily: F1, letterSpacing: -2, margin: "0 0 16px", lineHeight: 1.05 }}><span style={{ display: "block", color: "#fff", transform: "rotate(-1deg)" }}>ready to</span><span style={{ display: "inline-block", background: "#ffe45e", color: "#0C0A12", borderRadius: "12px 4px 16px 6px", padding: "2px 18px", transform: "rotate(2deg)", boxShadow: "4px 4px 0 #ff5757" }}>say it</span><span style={{ color: "#fff" }}>?</span></h2></R>
        <R d={0.2}><p style={{ fontSize: mob ? 14.5 : 17, color: "var(--text-muted)", lineHeight: 1.65, fontFamily: F2, margin: "0 0 32px" }}>join thousands in honest discussions. no sign-up essays. no real name required.</p></R>
        <R d={0.3}><button onClick={onSignup} style={{ background: "#ffe45e", border: "none", borderRadius: "18px 6px 22px 10px", padding: "17px 40px", color: "#0C0A12", fontSize: 17, fontWeight: 700, fontFamily: F1, cursor: "pointer", boxShadow: "4px 4px 0 #ff5757", transform: "rotate(-1deg)" }}>get started free →</button></R>
      </div>
    </section>
  );
}

/* Footer */
function Foot({ mob }: { mob: boolean }) {
  return (
    <footer style={{ padding: mob ? "24px 20px" : "32px 48px", borderTop: "1.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: mob ? "column" : "row", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: F1, color: "#ffe45e" }}>SayIt</span>
          <span style={{ color: "var(--text)", fontSize: 12, fontFamily: F1 }}>© 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: F1, color: "#ffe45e" }}>Made By</span>
          <span style={{ color: "var(--text)", fontSize: 12, fontFamily: F1 }}>💛</span>
          <span style={{ color: "var(--text)", fontSize: 15, fontFamily: F1 }}><a href="https://aditiparikh.uk/">Aditi Parikh</a></span>
        </div>
        <div style={{ display: "flex", gap: mob ? 16 : 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["Privacy", "Terms", "Safety", "Blog"].map(l => <a key={l} href="#" style={{ color: "var(--text)", textDecoration: "none", fontSize: 12.5, fontFamily: F2 }}>{l}</a>)}
        </div>
      </div>
    </footer>
  );
}

/* Main Lending */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const w = useWin();
  const mob = w < 768;
  // const mq = ["tech debates", "anonymous discussions", "hot takes", "science threads", "career advice", "memes", "honest opinions", "no filters"];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (mode: string) => navigate(`/auth?mode=${mode}`);

  return (
    <div style={{ position: "relative" }}>
      <Nav scrolled={scrolled} mob={mob} onLogin={() => go("login")} onSignup={() => go("signup")} />
      <Hero mob={mob} onSignup={() => go("signup")} />
      <div style={{ padding: "10px 0", opacity: 0.6, transform: "rotate(-1deg)" }}></div>
      <HowSection mob={mob} />
      <div style={{ padding: "10px 0", opacity: 0.6, transform: "rotate(0.8deg)" }}></div>
      <Topics mob={mob} />
      <div style={{ padding: "10px 0", opacity: 0.6, transform: "rotate(-0.5deg)" }}></div>
      <Proof mob={mob} />
      <CTA mob={mob} onSignup={() => go("signup")} />
      <Foot mob={mob} />
    </div>
  );
}
