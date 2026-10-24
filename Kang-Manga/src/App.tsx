import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { get, useAsync, useStore, DEFAULTS, type Hist, type Lite, type Manga, type Settings } from "./lib";
import { Card, Cover, Err, Skel } from "./ui";
import MangaPage from "./Manga";
import Reader from "./Reader";

const tabs: [string, string, string][] = [
  ["/", "Home", "M3 11l9-8 9 8v10h-6v-6H9v6H3z"],
  ["/explore", "Explore", "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5"],
  ["/library", "Library", "M5 3h14v18l-7-4-7 4z"],
];

function Nav() {
  return (
    <nav aria-label="Main"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/10 bg-[#120b20]/95 pt-2 backdrop-blur md:inset-y-0 md:right-auto md:w-20 md:flex-col md:items-center md:justify-start md:gap-6 md:border-r md:border-t-0 md:pt-6">
      <img src="/logo.png" alt="Kang+Manga" className="hidden h-11 w-11 rounded-xl md:block" />
      {tabs.map(([to, name, d]) => (
        <NavLink key={to} to={to} end={to === "/"}
          className={({ isActive }) => `flex flex-col items-center gap-1 px-4 text-[11px] ${isActive ? "text-accent" : "text-slate-400"}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d={d} /></svg>
          {name}
        </NavLink>
      ))}
    </nav>
  );
}

function Row({ title, order }: { title: string; order: string }) {
  const s = useAsync(() => get<{ results: Manga[] }>("search", { order, limit: 15 }), [order]);
  return (
    <section className="mt-7">
      <h2 className="px-4 text-lg font-semibold">{title}</h2>
      {s.e ? <Err m={s.e} /> : (
        <div className="no-sb mt-3 flex gap-3 overflow-x-auto px-4">
          {s.l ? <Skel n={5} cls="w-32 shrink-0" /> : s.d!.results.map((m) => (
            <div key={m.id} className="w-32 shrink-0"><Card m={m} /></div>
          ))}
        </div>
      )}
    </section>
  );
}

function Home() {
  const [hist] = useStore<Hist[]>("km_history", []);
  return (
    <div>
      <header className="flex items-center gap-3 px-4" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
        <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl" />
        <div>
          <h1 className="text-xl font-bold">Kang<span className="text-accent">+</span>Manga</h1>
          <p className="text-xs text-slate-400">Discover. Read. Repeat.</p>
        </div>
        <Link to="/explore" aria-label="Search" className="ml-auto rounded-full bg-white/10 p-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5" /></svg>
        </Link>
      </header>
      {hist.length > 0 && (
        <section className="mt-7">
          <h2 className="px-4 text-lg font-semibold">Continue reading</h2>
          <div className="no-sb mt-3 flex gap-3 overflow-x-auto px-4">
            {hist.slice(0, 10).map((h) => (
              <Link key={h.manga.id} to={`/read/${h.manga.id}/${h.chapterId}`} className="w-32 shrink-0">
                <Cover src={h.manga.cover} />
                <p className="mt-2 line-clamp-1 text-sm font-medium">{h.manga.title}</p>
                <p className="text-xs text-accent">{h.label} · p.{h.page + 1}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Row title="Popular titles" order="followedCount" />
      <Row title="Latest updates" order="latestUploadedChapter" />
    </div>
  );
}

function Explore() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const tag = sp.get("tag") || "";
  const [text, setText] = useState(q);
  const g = useAsync(() => get<{ genres: { id: string; name: string }[] }>("genres"), []);
  const s = useAsync(() => get<{ results: Manga[] }>("search", { q, tag, limit: 30 }), [q, tag]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (t.length === 1) return;
    setSp({ ...(t ? { q: t } : {}), ...(tag ? { tag } : {}) });
  };
  return (
    <div className="p-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
      <form role="search" onSubmit={submit} className="flex gap-2">
        <input aria-label="Search manga" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search manga, manhwa…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-card px-4 py-3 text-sm" />
        <button className="rounded-xl bg-accent px-5 text-sm font-semibold">Search</button>
      </form>
      <div className="no-sb mt-4 flex gap-2 overflow-x-auto" aria-label="Genres">
        {g.d?.genres.map((x) => (
          <button key={x.id} aria-pressed={tag === x.id}
            onClick={() => setSp({ ...(q ? { q } : {}), ...(tag === x.id ? {} : { tag: x.id }) })}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${tag === x.id ? "bg-accent" : "bg-white/10 text-slate-300"}`}>{x.name}</button>
        ))}
      </div>
      <h2 className="mt-5 text-lg font-semibold">{q ? `Results for “${q}”` : "Popular"}</h2>
      {s.e ? <Err m={s.e} /> : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {s.l ? <Skel n={9} /> : s.d!.results.map((m) => <Card key={m.id} m={m} />)}
        </div>
      )}
      {!s.l && !s.e && s.d!.results.length === 0 && <p className="mt-8 text-center text-slate-400">No titles found.</p>}
    </div>
  );
}

function Library() {
  const [tab, setTab] = useState<"bm" | "hist" | "data">("bm");
  const [bm, setBm] = useStore<Lite[]>("km_bookmarks", []);
  const [hist, setHist] = useStore<Hist[]>("km_history", []);
  const [st, setSt] = useStore<Settings>("km_settings", DEFAULTS);
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState("");
  const backup = JSON.stringify({ bookmarks: bm, history: hist, settings: st });
  const imp = () => {
    try {
      const j = JSON.parse(txt);
      if (!Array.isArray(j.bookmarks) || !Array.isArray(j.history)) throw new Error("bad");
      setBm(j.bookmarks); setHist(j.history);
      if (j.settings) setSt({ ...DEFAULTS, ...j.settings });
      setMsg("Imported ✓");
    } catch { setMsg("That backup text is not valid."); }
  };
  const copy = () => navigator.clipboard?.writeText(backup).then(() => setMsg("Copied ✓"), () => setMsg("Copy failed — select the text manually."));
  return (
    <div className="p-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
      <h1 className="text-xl font-bold">My Library</h1>
      <div role="tablist" className="mt-4 flex gap-2">
        {([["bm", `Bookmarks (${bm.length})`], ["hist", `History (${hist.length})`], ["data", "Backup"]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === k ? "bg-accent" : "bg-white/10 text-slate-300"}`}>{t}</button>
        ))}
      </div>
      {tab === "bm" && (bm.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">{bm.map((m) => <Card key={m.id} m={m} />)}</div>
      ) : <p className="mt-10 text-center text-slate-400">No bookmarks yet. Open a title and tap Bookmark.</p>)}
      {tab === "hist" && (hist.length ? (
        <div className="mt-4 space-y-2">
          {hist.map((h) => (
            <Link key={h.manga.id} to={`/read/${h.manga.id}/${h.chapterId}`} className="flex items-center gap-3 rounded-xl bg-card p-2">
              <div className="w-12 shrink-0"><Cover src={h.manga.cover} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{h.manga.title}</p>
                <p className="text-xs text-accent">{h.label} · page {h.page + 1}</p>
                <p className="text-xs text-slate-500">{new Date(h.ts).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          <button onClick={() => setHist([])} className="mt-2 text-sm text-red-400 underline">Clear history</button>
        </div>
      ) : <p className="mt-10 text-center text-slate-400">Nothing read yet.</p>)}
      {tab === "data" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-400">Your library is stored on this device. Copy this text to back it up, or paste a backup below to restore.</p>
          <textarea readOnly aria-label="Backup text" value={backup} className="h-24 w-full rounded-xl bg-card p-3 text-xs" />
          <button onClick={copy} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold">Copy backup</button>
          <textarea aria-label="Paste backup" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Paste backup here" className="h-24 w-full rounded-xl bg-card p-3 text-xs" />
          <button onClick={imp} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">Import</button>
          {msg && <p role="status" className="text-sm text-slate-300">{msg}</p>}
          <p className="pt-4 text-xs text-slate-500">Kang+Manga reads titles and chapters from MangaDex. All content belongs to its creators and scanlation groups; no DRM or paywall is bypassed.</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  const reader = pathname.startsWith("/read/");
  return (
    <>
      {!reader && <Nav />}
      <main className={reader ? "" : "pb-24 md:pl-20 md:pb-8"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/library" element={<Library />} />
          <Route path="/manga/:id" element={<MangaPage />} />
          <Route path="/read/:mid/:cid" element={<Reader />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
