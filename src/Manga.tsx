import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { get, allChapters, label, useAsync, useStore, DEFAULTS, type Hist, type Lite, type Manga, type Settings } from "./lib";
import { Cover, Err } from "./ui";

const LANGS: [string, string][] = [["en", "English"], ["es", "Español"], ["es-la", "Español (LA)"], ["fr", "Français"], ["pt-br", "Português (BR)"], ["id", "Indonesia"], ["ru", "Русский"], ["ar", "العربية"]];

export default function MangaPage() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [st, setSt] = useStore<Settings>("km_settings", DEFAULTS);
  const m = useAsync(() => get<Manga>("manga", { id }), [id]);
  const c = useAsync(() => allChapters(id, st.lang), [id, st.lang]);
  const [bm, setBm] = useStore<Lite[]>("km_bookmarks", []);
  const [hist] = useStore<Hist[]>("km_history", []);
  const [more, setMore] = useState(false);
  const [newest, setNewest] = useState(true);

  if (m.e) return <Err m={m.e} />;
  const d = m.d;
  const on = bm.some((b) => b.id === id);
  const last = hist.find((h) => h.manga.id === id);
  const list = c.d || [];
  const target = last?.chapterId || list.find((x) => x.readable)?.id;
  const rows = newest ? [...list].reverse() : list;
  const toggle = () => d && setBm((p) => (on ? p.filter((b) => b.id !== id) : [{ id, title: d.title, cover: d.cover }, ...p]));

  return (
    <div>
      <div className="relative overflow-hidden px-4 pb-5 pt-6" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
        {d?.cover && <img src={d.cover} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />}
        <button onClick={() => nav(-1)} aria-label="Go back" className="mb-3 rounded-full bg-white/10 px-3 py-1.5">←</button>
        <div className="flex gap-4">
          <div className="w-32 shrink-0 md:w-44">{m.l ? <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" /> : <Cover src={d!.cover} />}</div>
          <div className="min-w-0 flex-1">
            {m.l ? <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" /> : (
              <>
                <h1 className="text-2xl font-bold leading-tight">{d!.title}</h1>
                <p className="mt-1 text-sm text-slate-300">{d!.authors.join(", ") || "Unknown author"}</p>
                <p className="mt-1 text-sm capitalize text-accent">{d!.status}{d!.year ? ` · ${d!.year}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {target ? (
                    <Link to={`/read/${id}/${target}`} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold">{last ? "Continue" : "Start reading"}</Link>
                  ) : <span className="rounded-xl bg-white/10 px-5 py-2.5 text-sm text-slate-400">{c.l ? "Loading…" : "No readable chapters"}</span>}
                  <button onClick={toggle} aria-pressed={on} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold">{on ? "★ Bookmarked" : "☆ Bookmark"}</button>
                  <a href={d!.url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm">MangaDex ↗</a>
                </div>
              </>
            )}
          </div>
        </div>
        {d && (
          <>
            <p className={`mt-4 whitespace-pre-line text-sm text-slate-300 ${more ? "" : "line-clamp-4"}`}>{d.description || "No description available."}</p>
            {d.description.length > 220 && <button onClick={() => setMore(!more)} className="mt-1 text-sm text-accent">{more ? "Less" : "More"}</button>}
            <div className="mt-3 flex flex-wrap gap-2">{d.tags.map((t) => <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs">{t}</span>)}</div>
          </>
        )}
      </div>
      <section className="px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Chapters {c.d ? `(${list.length})` : ""}</h2>
          <div className="flex gap-2">
            <select aria-label="Language" value={st.lang} onChange={(e) => setSt((s) => ({ ...s, lang: e.target.value }))} className="rounded-lg bg-card px-2 py-1.5 text-sm">
              {LANGS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
            <button onClick={() => setNewest(!newest)} className="rounded-lg bg-card px-3 py-1.5 text-sm">{newest ? "Newest ↓" : "Oldest ↑"}</button>
          </div>
        </div>
        {c.e && <Err m={c.e} />}
        {c.l && <div className="mt-3 space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}</div>}
        {c.d && list.length === 0 && <p className="mt-6 text-center text-slate-400">No chapters in this language.</p>}
        <div className="mt-3 space-y-2">
          {rows.map((ch) => {
            const cur = last?.chapterId === ch.id;
            const cls = `flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm ${cur ? "ring-1 ring-accent" : ""}`;
            const info = (
              <span className="min-w-0">
                {label(ch)}{ch.title && ch.chapter ? ` — ${ch.title}` : ""}
                <span className="block truncate text-xs text-slate-500">{new Date(ch.publishedAt).toLocaleDateString()}{ch.group ? ` · ${ch.group}` : ""}</span>
              </span>
            );
            if (ch.readable) return <Link key={ch.id} to={`/read/${id}/${ch.id}`} className={cls}>{info}{cur && <span className="text-xs text-accent">p.{(last?.page ?? 0) + 1}</span>}</Link>;
            return (
              <a key={ch.id} href={ch.externalUrl || ch.url} target="_blank" rel="noopener noreferrer" className={cls}>
                {info}<span className="shrink-0 text-xs text-slate-400">{ch.externalUrl ? "Official ↗" : "No pages ↗"}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
