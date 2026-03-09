import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { FaApple } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

const F1 = "var(--f1)";
const F2 = "var(--f2)";

function R({ children, d = 0, style = {} }: { children: React.ReactNode; d?: number; style?: React.CSSProperties }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), d * 1000); return () => clearTimeout(t); }, [d]);
  return <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0) rotate(0deg) scale(1)" : "translateY(30px) rotate(1deg) scale(0.97)", transition: "all 0.7s cubic-bezier(.22,1,.36,1)", ...style }}>{children}</div>;
}

function Sticker({ children, top, left, right, bottom, rotate = 0, size = 40, delay = 0 }: any) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay * 1000); return () => clearTimeout(t); }, [delay]);
  return <div style={{ position: "absolute", top, left, right, bottom, zIndex: 5, fontSize: size, lineHeight: 1, pointerEvents: "none", transform: show ? `rotate(${rotate}deg) scale(1)` : `rotate(${rotate + 40}deg) scale(0)`, opacity: show ? 1 : 0, transition: "all 0.7s cubic-bezier(.34,1.56,.64,1)" }}>{children}</div>;
}

function PwInput({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "14px 6px 16px 8px", padding: "14px 48px 14px 16px", color: "#fff", fontSize: 15, fontFamily: F2, outline: "none", boxSizing: "border-box", transition: "border 0.3s" }}
        onFocus={e => e.target.style.borderColor = "rgba(255,228,94,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
      <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.3)", padding: 0 }}>{show ? "🙈" : "👁"}</button>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, login, isLoading, error } = useAuthStore();
  const [mode, setMode] = useState(searchParams.get("mode") || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState("");
  const [mob, setMob] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => { const h = () => setMob(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);

  const isLogin = mode === "login";
  const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "14px 6px 16px 8px", padding: "14px 16px", color: "#fff", fontSize: 15, fontFamily: F2, outline: "none", boxSizing: "border-box", transition: "border 0.3s" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, fontFamily: F1, color: "rgba(255,255,255,0.35)", marginBottom: 6, transform: "rotate(-0.5deg)", letterSpacing: 1 };
  const displayError = localError || error;

  const handleSubmit = async () => {
    setLocalError("");
    if (!email || !password) { setLocalError("Fill in all fields"); return; }
    if (!isLogin && password !== confirm) { setLocalError("Passwords don't match"); return; }
    try {
      if (isLogin) await login(email, password); else await register(email, password);
      setShowSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: any) { setLocalError(err.message); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "#fff", fontFamily: F2, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: mob ? "20px 16px" : "40px 20px" }}>
      {/* Blobs */}
      <div style={{ position: "fixed", top: "-15%", left: "-12%", width: 500, height: 500, borderRadius: "42% 58% 63% 37%", background: "rgba(255,228,94,0.06)", filter: "blur(90px)", pointerEvents: "none", animation: "blobA 14s ease-in-out infinite alternate" }} />
      <div style={{ position: "fixed", bottom: "-12%", right: "-10%", width: 450, height: 450, borderRadius: "55% 45% 38% 62%", background: "rgba(255,87,87,0.05)", filter: "blur(100px)", pointerEvents: "none", animation: "blobB 16s ease-in-out infinite alternate" }} />
      <div style={{ position: "fixed", top: "40%", right: "15%", width: 350, height: 350, borderRadius: "38% 62% 55% 45%", background: "rgba(120,87,255,0.04)", filter: "blur(85px)", pointerEvents: "none" }} />

      {!mob && <><Sticker top="8%" left="5%" rotate={-18} size={52} delay={0.4}>🧠</Sticker><Sticker top="15%" right="7%" rotate={14} size={44} delay={0.6}>⚡</Sticker><Sticker bottom="18%" left="8%" rotate={22} size={40} delay={0.8}>🔥</Sticker><Sticker bottom="10%" right="5%" rotate={-10} size={48} delay={1.0}>💡</Sticker></>}

      {showSuccess && <div style={{ position: "fixed", top: 28, left: "50%", zIndex: 200, animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards" }}><div style={{ background: "#ffe45e", color: "#0C0A12", fontFamily: F1, fontWeight: 700, fontSize: 15, padding: "12px 28px", borderRadius: "16px 6px 18px 8px", boxShadow: "4px 4px 0 #ff5757", display: "flex", alignItems: "center", gap: 8 }}>🎉 {isLogin ? "Welcome back!" : "Account created!"} You're in.</div></div>}

      <div style={{ width: "100%", maxWidth: mob ? 420 : 880, position: "relative", zIndex: 10, display: "flex", flexDirection: mob ? "column" : "row" }}>
        {/* Left branding */}
        {!mob && <R d={0.1} style={{ flex: "1 1 380px" }}>
          <div style={{ background: "rgba(255,228,94,0.04)", border: "1.5px solid rgba(255,228,94,0.1)", borderRadius: "28px 10px 0 14px", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 560, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
              <div style={{ width: 44, height: 44, borderRadius: "14px 6px 16px 8px", background: "#ffe45e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transform: "rotate(-6deg)", boxShadow: "3px 3px 0 #ff5757" }}>💬</div>
              <span style={{ fontSize: 28, fontWeight: 700, fontFamily: F1 }}>SayIt</span>
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 700, fontFamily: F1, letterSpacing: -1.5, lineHeight: 1.1, margin: "0 0 18px" }}>
              <span style={{ display: "block", transform: "rotate(-1deg)" }}>your voice,</span>
              <span style={{ display: "inline-block", background: "#ffe45e", color: "#0C0A12", borderRadius: "10px 4px 12px 6px", padding: "2px 14px", transform: "rotate(1.5deg)", boxShadow: "3px 3px 0 #ff5757" }}>your rules.</span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, fontFamily: F2, maxWidth: 300, margin: "0 0 32px" }}>join 89k+ users in honest discussions about tech, science, politics, and life.</p>
            {[{ text: "AI is replacing junior devs faster than we think", emoji: "🔥", rot: -2 }, { text: "quit my FAANG job for a startup. best decision.", emoji: "⚡", rot: 1.5 }, { text: "the EU AI Act is actually well-designed", emoji: "🧠", rot: -1 }].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "10px 14px", marginBottom: 10, transform: `rotate(${p.rot}deg)`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: F2, fontStyle: "italic" }}>"{p.text}"</span>
              </div>
            ))}
            <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", gap: 16, color: "rgba(255,255,255,0.15)", fontSize: 11.5, fontFamily: F1 }}><span>Privacy</span><span>·</span><span>Terms</span><span>·</span><span>Safety</span></div>
          </div>
        </R>}

        {/* Right form */}
        <R d={mob ? 0.1 : 0.2} style={{ flex: "1 1 460px" }}>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: mob ? "24px 8px 28px 12px" : "0 10px 14px 0", padding: mob ? "32px 24px" : "44px 40px", position: "relative", overflow: "hidden", minHeight: mob ? "auto" : 560, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #ffe45e 0%, #ff5757 40%, #7857ff 100%)" }} />

            {mob && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}><div style={{ width: 36, height: 36, borderRadius: "12px 6px 14px 8px", background: "#ffe45e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transform: "rotate(-6deg)", boxShadow: "3px 3px 0 #ff5757" }}>💬</div><span style={{ fontSize: 24, fontWeight: 700, fontFamily: F1 }}>SayIt</span></div>}

            {/* Tabs */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: "16px 6px 18px 8px", padding: 4, border: "1.5px solid rgba(255,255,255,0.05)", marginBottom: 28, transform: "rotate(-0.5deg)" }}>
              {[{ id: "login", label: "Log in", icon: "👋" }, { id: "signup", label: "Sign up", icon: "🚀" }].map(tab => (
                <button key={tab.id} onClick={() => { setMode(tab.id); setLocalError(""); }} style={{ flex: 1, background: mode === tab.id ? "#ffe45e" : "transparent", border: "none", borderRadius: "14px 5px 16px 7px", padding: "11px 16px", cursor: "pointer", color: mode === tab.id ? "#0C0A12" : "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 700, fontFamily: F1, transition: "all 0.35s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: mode === tab.id ? "2px 2px 0 #ff5757" : "none" }}>{tab.icon} {tab.label}</button>
              ))}
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
              {[{ icon: <FaApple /> }, { icon: <FcGoogle /> }, { icon: <FaXTwitter />}].map((s, i) => (
                <button key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: "12px 5px 14px 7px", padding: "12px 10px", color: "#fff", fontSize: 13.5, fontFamily: F2, fontWeight: 500, cursor: "pointer", transform: "rotate(-0.5deg)" }}><span style={{ fontSize: 18 }}>{s.icon}</span>{!mob && s.label}</button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: F1, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", transform: "rotate(-1deg)" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {displayError && <div style={{ background: "rgba(255,87,87,0.1)", border: "1px solid rgba(255,87,87,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, color: "#ff5757", fontSize: 13, fontWeight: 500 }}>{displayError}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>EMAIL</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "rgba(255,228,94,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} /></div>
              <div><label style={labelStyle}>PASSWORD</label><PwInput value={password} onChange={e => setPassword(e.target.value)} placeholder={isLogin ? "your password" : "min 8 characters"} /></div>
              {!isLogin && <div><label style={labelStyle}>CONFIRM PASSWORD</label><PwInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="type it again" /></div>}
              {isLogin && <div style={{ display: "flex", justifyContent: "flex-end" }}><a href="#" style={{ color: "#ffe45e", fontSize: 13, fontFamily: F2, fontWeight: 500, textDecoration: "none", transform: "rotate(0.5deg)", display: "inline-block" }}>forgot password?</a></div>}
            </div>

            <button onClick={handleSubmit} disabled={isLoading} style={{ width: "100%", marginTop: 24, background: isLoading ? "rgba(255,228,94,0.3)" : "#ffe45e", border: "none", borderRadius: "18px 6px 22px 10px", padding: "16px 0", color: "#0C0A12", fontSize: 16, fontWeight: 700, fontFamily: F1, cursor: isLoading ? "wait" : "pointer", boxShadow: "4px 4px 0 #ff5757", transform: "rotate(-0.5deg)", transition: "all 0.35s" }}>{isLoading ? "..." : isLogin ? "let me in 🎭" : "create my identity 🚀"}</button>

            <p style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: "rgba(255,255,255,0.3)", fontFamily: F2 }}>
              {isLogin ? "no account yet? " : "already have one? "}
              <button onClick={() => { setMode(isLogin ? "signup" : "login"); setLocalError(""); }} style={{ background: "none", border: "none", color: "#ffe45e", fontSize: 13.5, fontWeight: 600, fontFamily: F1, cursor: "pointer", padding: 0 }}>{isLogin ? "join the chaos →" : "log in →"}</button>
            </p>
            <div style={{ textAlign: "center", marginTop: 12 }}><a href="#" onClick={e => { e.preventDefault(); navigate("/"); }} style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontFamily: F2, textDecoration: "none" }}>← back to homepage</a></div>
          </div>
        </R>
      </div>
    </div>
  );
}
