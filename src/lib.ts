import { useEffect, useState } from "react";

export type Manga = {
  id: string; title: string; description: string; status: string; year: number | null;
  cover: string | null; tags: string[]; authors: string[]; url: string;
};
export type Chapter = {
  id: string; chapter: string | null; title: string | null; volume: string | null;
  publishedAt: string; pages: number; externalUrl: string | null; readable: boolean;
  group: string | null; url: string;
};
export type PageRes = {
  chapterId: string; status: "ok" | "external" | "empty";
  pages: { index: number; url: string }[]; officialUrl?: string;
};
export type Lite = Pick<Manga, "id" | "title" | "cover">;
export type Hist = { manga: Lite; chapterId: string; label: string; page: number; ts: number };
export type Settings = {
  mode: "vertical" | "single"; rtl: boolean; fit: "width" | "height";
  quality: "data-saver" | "data"; lang: string;
};
export const DEFAULTS: Settings = { mode: "vertical", rtl: false, fit: "width", quality: "data-saver", lang: "en" };

const BASE = ((import.meta.env.VITE_API_BASE as string) || "").replace(/\/$/, "");

export async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") u.set(k, String(v));
  const r = await fetch(`${BASE}/api/${path}?${u}`);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any).error || `HTTP ${r.status}`);
  return j as T;
}

export const label = (c: Chapter) => (c.chapter ? `Ch. ${c.chapter}` : c.title || "Oneshot");

export async function allChapters(mangaId: string, lang: string): Promise<Chapter[]> {
  let out: Chapter[] = [];
  let offset = 0;
  let total = 1;
  while (offset < total && offset < 3000) {
    const r = await get<{ chapters: Chapter[]; total: number }>("chapters", { mangaId, languages: lang, limit: 500, offset });
    out = out.concat(r.chapters);
    total = r.total;
    offset += 500;
  }
  out.sort((a, b) => Number(b.readable) - Number(a.readable));
  const seen = new Set<string>();
  return out
    .filter((c) => {
      const k = c.chapter ?? c.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (parseFloat(a.chapter ?? "0") || 0) - (parseFloat(b.chapter ?? "0") || 0));
}

export function useAsync<T>(fn: () => Promise<T>, deps: any[]) {
  const [s, setS] = useState<{ d?: T; e?: string; l: boolean }>({ l: true });
  useEffect(() => {
    let ok = true;
    setS({ l: true });
    fn().then((d) => ok && setS({ d, l: false })).catch((e) => ok && setS({ e: e.message, l: false }));
    return () => { ok = false; };
  }, deps);
  return s;
}

// localStorage-backed state shared across components.
export function useStore<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const read = (): T => {
    try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : init; } catch { return init; }
  };
  const [v, setV] = useState<T>(read);
  useEffect(() => {
    const f = () => setV(read());
    window.addEventListener("km:" + key, f);
    return () => window.removeEventListener("km:" + key, f);
  }, [key]);
  const set = (n: T | ((p: T) => T)) => {
    const nv = typeof n === "function" ? (n as (p: T) => T)(read()) : n;
    try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* storage full/blocked */ }
    window.dispatchEvent(new Event("km:" + key));
  };
  return [v, set];
}
