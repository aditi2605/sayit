import { useState, useEffect, createElement, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, LogOut, Send, MessageSquare, ChevronUp, ChevronDown,
  Lightbulb, Laugh, Bookmark, Reply, Hash, Sparkles, Search
} from "lucide-react";
import { useIsMobile } from "../../hooks/useUI";
import { useAuthStore } from "../../stores/authStore";
import { threadsApi, repliesApi, channelsApi } from "../../services/api";
import { getChannel, avatarColor, initials } from "../../config/channels";
import type { ThreadResponse, ReplyResponse, Channel } from "../../types";

const F1 = "var(--f1)";
const F2 = "var(--f2)";

function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }
function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }

function Avatar({ name, index, size = 40 }: { name: string; index: number; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: size > 30 ? "50%" : 6, background: `linear-gradient(135deg, ${avatarColor(index)}, ${avatarColor(index)}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", fontFamily: F1, flexShrink: 0 }}>{initials(name)}</div>;
}

function ChBadge({ slug }: { slug: string }) {
  const ch = getChannel(slug);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: ch.color, fontSize: 11, fontWeight: 600 }}>{createElement(ch.icon, { size: 11 })} {slug}</span>;
}

/* Vote */
function Vote({ count }: { count: number }) {
  const [v, setV] = useState<"up"|"down"|null>(null);
  const d = count + (v === "up" ? 1 : v === "down" ? -1 : 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", padding: "2px 4px" }}>
      <button onClick={() => setV(v === "up" ? null : "up")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", color: v === "up" ? "#ffe45e" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", transition: "color 0.15s" }}><ChevronUp size={16} strokeWidth={v === "up" ? 3 : 2} /></button>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: v === "up" ? "#ffe45e" : v === "down" ? "#ff5757" : "rgba(255,255,255,0.5)", minWidth: 24, textAlign: "center" }}>{fmt(d)}</span>
      <button onClick={() => setV(v === "down" ? null : "down")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", color: v === "down" ? "#ff5757" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", transition: "color 0.15s" }}><ChevronDown size={16} strokeWidth={v === "down" ? 3 : 2} /></button>
    </div>
  );
}

/* Reaction button  */
function RxBtn({ icon, label, count, color }: { icon: React.ReactNode; label: string; count?: number; color: string }) {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn(!on)} title={label} style={{ background: on ? `${color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${on ? color + "33" : "rgba(255,255,255,0.05)"}`, borderRadius: 7, padding: "4px 10px", cursor: "pointer", color: on ? color : "rgba(255,255,255,0.35)", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--mono)", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
      {icon}{(count && count > 0) || on ? <span>{fmt((count || 0) + (on ? 1 : 0))}</span> : null}
    </button>
  );
}

/* Reactions bar */
function Reactions({ rx, onReply }: { rx: Record<string, number>; onReply?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <Vote count={rx.upvote || 0} />
      <RxBtn icon={<Lightbulb size={13} />} label="Insightful" count={rx.insightful} color="#ffe45e" />
      <RxBtn icon={<Laugh size={13} />} label="Funny" count={rx.laugh} color="#ff9b3d" />
      <RxBtn icon={<Sparkles size={13} />} label="Mind blown" count={rx.debate} color="#7857ff" />
      {onReply && <button onClick={onReply} style={{ background: "none", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7, padding: "4px 10px", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--mono)", display: "flex", alignItems: "center", gap: 4 }} onMouseEnter={e => (e.currentTarget).style.color = "#5b9dff"} onMouseLeave={e => (e.currentTarget).style.color = "rgba(255,255,255,0.35)"}><Reply size={13} /> Reply</button>}
      <RxBtn icon={<Bookmark size={13} />} label="Save" color="#4ae3c0" />
    </div>
  );
}

/* Reply item (nested)*/
function ReplyItem({ reply, depth, user, onReplyTo }: { reply: ReplyResponse; depth: number; user: any; onReplyTo: (r: ReplyResponse) => void }) {
  const own = reply.authorName === user?.anonymousName;
  return (
    <div style={{ marginLeft: Math.min(depth, 3) * 24, marginBottom: 2 }}>
      <div style={{ background: own ? "rgba(0,92,75,0.12)" : "rgba(255,255,255,0.02)", borderLeft: `2px solid ${own ? "#4ae3c0" : depth === 0 ? "rgba(255,255,255,0.06)" : avatarColor(reply.authorAvatar) + "44"}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", transition: "background 0.15s" }}
        onMouseEnter={e => { if (!own) (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={e => { if (!own) (e.currentTarget).style.background = "rgba(255,255,255,0.02)"; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Avatar name={reply.authorName} index={reply.authorAvatar} size={22} />
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: F1, color: own ? "#4ae3c0" : avatarColor(reply.authorAvatar) }}>{reply.authorName}</span>
          {own && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(74,227,192,0.15)", color: "#4ae3c0", padding: "1px 6px", borderRadius: 4 }}>YOU</span>}
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>{timeAgo(reply.createdAt)}</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", fontFamily: F2, marginBottom: 8, paddingLeft: 30 }}>
          {reply.parentReplyId && <span style={{ color: "#5b9dff", fontSize: 11, fontWeight: 600, marginRight: 6 }}>↳</span>}
          {reply.body}
        </div>
        <div style={{ paddingLeft: 30 }}><Reactions rx={reply.reactions} onReply={() => onReplyTo(reply)} /></div>
      </div>
    </div>
  );
}

/* Dashboard */
export default function DashboardPage() {
  const navigate = useNavigate();
  const mob = useIsMobile();
  const { user, logout, isAuthenticated } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<ThreadResponse | null>(null);
  const [replies, setReplies] = useState<ReplyResponse[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyResponse | null>(null);
  const [ch, setCh] = useState("all");
  const [compose, setCompose] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [nCh, setNCh] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { if (!isAuthenticated) { navigate("/auth?mode=login"); return; } loadCh(); loadTh(); }, [isAuthenticated]);

  const loadCh = async () => { try { const { data } = await channelsApi.list(); setChannels(data); } catch {} };
  const loadTh = async (c?: string) => { try { const p = c && c !== "all" ? { channel: c } : {}; const { data } = await threadsApi.list(p); setThreads(data.threads); } catch {} };
  const openThread = async (t: ThreadResponse) => { setActive(t); setReplyTo(null); setText(""); try { const { data } = await repliesApi.list(t.id); setReplies(data); } catch {} };

  const sendReply = async () => {
    if (!text.trim() || !active) return;
    try { const { data } = await repliesApi.create(active.id, { body: text, parentReplyId: replyTo?.id }); setReplies(p => [...p, data]); setText(""); setReplyTo(null); } catch {}
  };

  const postThread = async () => {
    if (!nTitle.trim() || !nBody.trim() || !nCh) return;
    try { await threadsApi.create({ title: nTitle, body: nBody, channelId: nCh }); setCompose(false); setNTitle(""); setNBody(""); setNCh(""); loadTh(ch); } catch {}
  };

  const total = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);
  const topReplies = replies.filter(r => !r.parentReplyId);
  const children = (pid: string) => replies.filter(r => r.parentReplyId === pid);
  const filtered = threads.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ height: "100vh", background: "var(--dash-bg)", display: "flex", fontFamily: F2, color: "#E9EDEF" }}>
      {/* Sidebar */}
      <div style={{ width: mob ? "100%" : 420, background: "var(--dash-surface)", borderRight: "1px solid var(--dash-border)", display: "flex", flexDirection: "column", flexShrink: 0, ...(mob && active ? { display: "none" } : {}) }}>
        <div style={{ padding: "14px 18px", background: "var(--dash-card)", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--dash-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "10px 4px 12px 6px", background: "#ffe45e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transform: "rotate(-4deg)", boxShadow: "2px 2px 0 #ff5757", fontWeight: 800, color: "#0C0A12", fontFamily: F1 }}>S</div>
            <div><div style={{ fontWeight: 700, fontSize: 14, fontFamily: F1 }}>{user?.anonymousName}</div><div style={{ fontSize: 10, color: "#667781" }}>anonymous</div></div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setCompose(true)} style={{ background: "#ffe45e", border: "none", borderRadius: "8px 4px 10px 6px", width: 34, height: 34, color: "#0C0A12", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "2px 2px 0 #ff5757", transform: "rotate(2deg)" }}><Plus size={16} strokeWidth={3} /></button>
            <button onClick={() => { logout(); navigate("/"); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, width: 34, height: 34, color: "#8696A0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LogOut size={14} /></button>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <div style={{ position: "relative" }}><Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 14px 9px 34px", color: "#E9EDEF", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: F2 }} /></div>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "8px 14px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <button onClick={() => { setCh("all"); loadTh(); }} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11.5, whiteSpace: "nowrap", cursor: "pointer", border: ch === "all" ? "1px solid rgba(255,228,94,0.3)" : "1px solid transparent", background: ch === "all" ? "rgba(255,228,94,0.1)" : "transparent", color: ch === "all" ? "#ffe45e" : "#667781", fontWeight: 600, fontFamily: F1, display: "flex", alignItems: "center", gap: 4 }}><Hash size={11} /> All</button>
          {channels.map(c => { const cfg = getChannel(c.slug); const on = ch === c.slug; return (
            <button key={c.id} onClick={() => { setCh(c.slug); loadTh(c.slug); }} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11.5, whiteSpace: "nowrap", cursor: "pointer", border: on ? `1px solid ${cfg.color}44` : "1px solid transparent", background: on ? `${cfg.color}12` : "transparent", color: on ? cfg.color : "#667781", fontWeight: 600, fontFamily: F1, display: "flex", alignItems: "center", gap: 4 }}>{createElement(cfg.icon, { size: 11 })} {mob && c.name.length > 10 ? c.name.slice(0, 9) + ".." : c.name}</button>
          ); })}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#667781" }}><MessageSquare size={44} style={{ opacity: 0.2, marginBottom: 14 }} /><div style={{ fontSize: 15, fontWeight: 600, fontFamily: F1 }}>No threads</div></div>
          : filtered.map(t => (
            <div key={t.id} onClick={() => openThread(t)} style={{ padding: "14px 18px", cursor: "pointer", borderBottom: "1px solid rgba(34,45,53,0.25)", background: active?.id === t.id ? "rgba(255,228,94,0.04)" : "transparent", borderLeft: active?.id === t.id ? "3px solid #ffe45e" : "3px solid transparent", transition: "all 0.12s" }}
              onMouseEnter={e => { if (active?.id !== t.id) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }} onMouseLeave={e => { if (active?.id !== t.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar name={t.authorName} index={t.authorAvatar} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{t.authorName}</span><span style={{ fontSize: 10, color: "#667781", fontFamily: "var(--mono)" }}>{timeAgo(t.createdAt)}</span></div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F1 }}>{t.title}</div>
                  <div style={{ fontSize: 12.5, color: "#8696A0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 8 }}>{t.body}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ChBadge slug={t.channelSlug} />
                    <span style={{ color: "#667781", fontSize: 10.5, display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={10} /> {t.replyCount}</span>
                    {total(t.reactions) > 0 && <span style={{ color: "#667781", fontSize: 10.5, display: "flex", alignItems: "center", gap: 3 }}><ChevronUp size={10} /> {fmt(total(t.reactions))}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manin (Rightside Dashboard) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ...(mob && !active ? { display: "none" } : {}) }}>
        {active ? (<>
          <div style={{ padding: "12px 18px", background: "var(--dash-card)", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--dash-border)", flexShrink: 0 }}>
            {mob && <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: "#8696A0", cursor: "pointer", padding: 4 }}><ArrowLeft size={20} /></button>}
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, fontFamily: F1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.title}</div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}><span style={{ fontSize: 12, color: "#8696A0" }}>{active.authorName}</span><ChBadge slug={active.channelSlug} /><span style={{ fontSize: 10, color: "#667781" }}>{timeAgo(active.createdAt)}</span></div></div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", backgroundColor: "var(--dash-bg)" }}>
            {/* OP */}
            <div style={{ background: "var(--dash-card)", borderRadius: 12, padding: "16px 18px", marginBottom: 16, borderLeft: "3px solid #ffe45e" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar name={active.authorName} index={active.authorAvatar} size={32} />
                <div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: F1, color: avatarColor(active.authorAvatar) }}>{active.authorName}</div><div style={{ fontSize: 10, color: "#667781" }}>OP · {timeAgo(active.createdAt)}</div></div>
                <div style={{ marginLeft: "auto" }}><ChBadge slug={active.channelSlug} /></div>
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", fontFamily: F2, marginBottom: 12, paddingLeft: 42 }}>{active.body}</div>
              <div style={{ paddingLeft: 42 }}><Reactions rx={active.reactions} onReply={() => { setReplyTo(null); inputRef.current?.focus(); }} /></div>
            </div>
            {replies.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingLeft: 4 }}><MessageSquare size={14} style={{ color: "rgba(255,255,255,0.3)" }} /><span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", fontFamily: F1, letterSpacing: 1 }}>{replies.length} {replies.length === 1 ? "REPLY" : "REPLIES"}</span><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} /></div>}
            {topReplies.map(r => (<div key={r.id}><ReplyItem reply={r} depth={0} user={user} onReplyTo={rr => { setReplyTo(rr); inputRef.current?.focus(); }} />{children(r.id).map(c => (<div key={c.id}><ReplyItem reply={c} depth={1} user={user} onReplyTo={rr => { setReplyTo(rr); inputRef.current?.focus(); }} />{children(c.id).map(gc => <ReplyItem key={gc.id} reply={gc} depth={2} user={user} onReplyTo={rr => { setReplyTo(rr); inputRef.current?.focus(); }} />)}</div>))}</div>))}
          </div>
          <div style={{ background: "var(--dash-card)", borderTop: "1px solid var(--dash-border)", flexShrink: 0 }}>
            {replyTo && <div style={{ padding: "8px 14px 0", display: "flex", alignItems: "center", gap: 8 }}><Reply size={12} style={{ color: "#5b9dff" }} /><span style={{ fontSize: 11, color: "#5b9dff", fontWeight: 600 }}>Replying to {replyTo.authorName}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.body}</span><button onClick={() => setReplyTo(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: 2 }}>×</button></div>}
            <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar name={user?.anonymousName || "anon"} index={user?.avatarIndex || 0} size={32} />
              <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a reply..."} style={{ flex: 1, padding: "11px 16px", borderRadius: 10, background: "var(--dash-bg)", border: "1px solid #2A3942", color: "#E9EDEF", fontSize: 13.5, outline: "none", fontFamily: F2, boxSizing: "border-box" }} />
              <button onClick={sendReply} style={{ width: 38, height: 38, borderRadius: "10px 4px 12px 6px", background: text.trim() ? "#ffe45e" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: text.trim() ? "#0C0A12" : "rgba(255,255,255,0.2)", cursor: text.trim() ? "pointer" : "default", border: "none", flexShrink: 0, boxShadow: text.trim() ? "2px 2px 0 #ff5757" : "none", transition: "all 0.2s" }}><Send size={15} /></button>
            </div>
          </div>
        </>) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, backgroundColor: "var(--dash-bg)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "20px 8px 24px 10px", background: "rgba(255,228,94,0.06)", border: "1.5px solid rgba(255,228,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)" }}><MessageSquare size={32} style={{ color: "#ffe45e", opacity: 0.5 }} /></div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: F1, color: "#ffe45e", textShadow: "2px 2px 0 rgba(255,87,87,0.2)" }}>SayIt</div>
            <div style={{ color: "#667781", fontSize: 14, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>Select a thread or start a new discussion.</div>
          </div>
        )}
      </div>

      {/* Compose*/}
      {compose && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setCompose(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#13111A", borderRadius: "20px 8px 24px 10px", border: "1.5px solid rgba(255,255,255,0.07)", width: "100%", maxWidth: 540, overflow: "hidden", animation: "modalIn 0.35s cubic-bezier(.22,1,.36,1)" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, #ffe45e, #ff5757, #7857ff)" }} />
          <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 17, fontWeight: 700, fontFamily: F1 }}>New Thread</span><button onClick={() => setCompose(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, width: 30, height: 30, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>
          <div style={{ padding: "16px 24px" }}>
            <input value={nTitle} onChange={e => setNTitle(e.target.value)} placeholder="Thread title..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#fff", fontSize: 15, padding: "12px 16px", outline: "none", marginBottom: 12, boxSizing: "border-box", fontFamily: F1, fontWeight: 600 }} onFocus={e => e.target.style.borderColor = "rgba(255,228,94,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"} />
            <textarea value={nBody} onChange={e => setNBody(e.target.value)} placeholder="Share your thoughts..." maxLength={2000} style={{ width: "100%", minHeight: 120, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: F2, padding: "12px 16px", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "rgba(255,228,94,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"} />
            <div style={{ marginTop: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>CHANNEL</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{channels.map(c => { const cfg = getChannel(c.slug); const sel = nCh === c.id; return <button key={c.id} onClick={() => setNCh(c.id)} style={{ background: sel ? `${cfg.color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${sel ? cfg.color + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 7, padding: "5px 11px", color: sel ? cfg.color : "rgba(255,255,255,0.3)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: F1, display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}>{createElement(cfg.icon, { size: 11 })} {c.name}</button>; })}</div>
            </div>
          </div>
          <div style={{ padding: "12px 24px 20px", display: "flex", justifyContent: "flex-end" }}><button onClick={postThread} style={{ background: nTitle.trim() && nBody.trim() && nCh ? "#ffe45e" : "rgba(255,255,255,0.05)", border: "none", borderRadius: "10px 4px 12px 6px", padding: "12px 24px", color: nTitle.trim() && nBody.trim() && nCh ? "#0C0A12" : "rgba(255,255,255,0.15)", fontSize: 14, fontWeight: 700, fontFamily: F1, cursor: nTitle.trim() && nBody.trim() && nCh ? "pointer" : "not-allowed", boxShadow: nTitle.trim() && nBody.trim() && nCh ? "3px 3px 0 #ff5757" : "none" }}>Post Thread</button></div>
        </div>
      </div>}
    </div>
  );
}
