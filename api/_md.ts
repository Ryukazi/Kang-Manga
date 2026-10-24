import type { VercelRequest, VercelResponse } from "@vercel/node";

const API = "https://api.mangadex.org";
export const UPLOADS = "https://uploads.mangadex.org";

export class HttpError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

export async function md(path: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, String(x)));
    else if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const r = await fetch(url, {
    headers: {
      "User-Agent": `KangManga/1.0 (${process.env.CONTACT || "github.com/Ryukazi"})`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (r.status === 404) throw new HttpError(404, "Not found");
  if (!r.ok) throw new HttpError(502, `MangaDex HTTP ${r.status}`);
  return r.json();
}

export const isId = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export function qs(req: VercelRequest, k: string, d = ""): string {
  const v: any = req.query[k];
  return String((Array.isArray(v) ? v[0] : v) ?? d).trim();
}

export const num = (s: string, d: number, min: number, max: number) =>
  Math.min(Math.max(Number.parseInt(s, 10) || d, min), max);

export function normalize(item: any) {
  const a = item.attributes || {};
  const rel = (t: string): any[] => (item.relationships || []).filter((r: any) => r.type === t);
  const file = rel("cover_art")[0]?.attributes?.fileName;
  const pick = (o: any) => o?.en || (Object.values(o || {})[0] as string) || "";
  const people = rel("author").concat(rel("artist")).map((r) => r.attributes?.name).filter(Boolean);
  return {
    id: item.id as string,
    title: pick(a.title) || "Untitled",
    description: pick(a.description),
    status: (a.status || "") as string,
    year: (a.year ?? null) as number | null,
    cover: file ? `${UPLOADS}/covers/${item.id}/${file}.512.jpg` : null,
    tags: (a.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean) as string[],
    authors: Array.from(new Set(people)) as string[],
    url: `https://mangadex.org/title/${item.id}`,
  };
}

// Wraps a handler: CORS, GET-only, source check, cache headers, JSON errors.
export const handler =
  (fn: (req: VercelRequest) => Promise<unknown>, maxAge = 120) =>
  async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    try {
      if (qs(req, "source", "mangadex") !== "mangadex") throw new HttpError(404, "Unknown source");
      const data = await fn(req);
      res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=600`);
      return res.status(200).json(data);
    } catch (e: any) {
      const s = e instanceof HttpError ? e.status : 502;
      return res
        .status(s)
        .json({ error: s === 502 ? "The source request failed. Try again later." : e.message });
    }
  };
