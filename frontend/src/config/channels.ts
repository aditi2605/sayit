import { Cpu, Globe, Atom, TrendingUp, GraduationCap, Film, Laugh, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ChannelConfig {
  icon: LucideIcon;
  color: string;
}

// Reddit/Discord style topic channels
export const CHANNEL_MAP: Record<string, ChannelConfig> = {
  "tech-ai":          { icon: Cpu,           color: "#5b9dff" },
  "world-politics":   { icon: Globe,         color: "#ff5757" },
  "science-nature":   { icon: Atom,          color: "#4ae3c0" },
  "business-finance": { icon: TrendingUp,    color: "#ffe45e" },
  "career-education": { icon: GraduationCap, color: "#7857ff" },
  "entertainment":    { icon: Film,          color: "#ff6eb4" },
  "memes-chill":      { icon: Laugh,         color: "#ff9b3d" },
};

export function getChannel(slug: string): ChannelConfig {
  return CHANNEL_MAP[slug] || { icon: MessageCircle, color: "#8696A0" };
}

// Avatar system 
export const AVATAR_COLORS = [
  "#5b9dff", "#ff5757", "#4ae3c0", "#ffe45e", "#7857ff",
  "#ff6eb4", "#ff9b3d", "#06B6D4", "#8B5CF6", "#14B8A6",
  "#E11D48", "#7C3AED",
];

export function avatarColor(i: number) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }
export function initials(name: string) { return (name.replace("anon_", "").split("_")[0]?.[0] || "A").toUpperCase(); }
