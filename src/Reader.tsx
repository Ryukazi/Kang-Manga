import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { get, allChapters, label, useAsync, useStore, DEFAULTS, type Hist, type Manga, type PageRes, type Settings } from "./lib";
import { Err, Seg } from "./ui";

function Pic({ src, cls, eager }: { src: string; cls: string; eager?: boolean }) {
  const [k, setK] = useState(0);
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <button onClick={() => { setBad(false); setK(k + 1); }} className="mx-auto my-6 block rounded-xl bg-white/10 px-5 py-4 text-sm">
        Page failed to load — tap to retry
      </button>
    );
  return <img key={k} src={k ? `${src}?r=${k}` : src} alt="" loading={eager ? "eager" : "lazy"} onError={() => setBad(true)} className={cls} />;
}

export default function Reader() {
  const { mid = "", cid = "" } = useParams();
  const nav = useNavigate();
  const [st, setSt] = useStore<Settings>("km_settings", DEFAULTS);
  const [hist, setHist] = useStore<Hist[]>("km_history", []);
  const pg = useAsync(() => get<PageRes>("pages", { chapterId: cid, quality: st.quality }), [cid, st.quality]);
  const man = useAsync(() => get<Manga>("manga", { id: mid }), [mid]);
  const chs = useAsync(() => allChapters(mid, st.lang), [mid, st.lang]);
  const [p, setP] = useState(0);
  const [cfg, setCfg] = useState(false);
  const start = useRef(0);

  const list = (chs.d || []).filter((c) => c.readable);
  const i = list.findIndex((c) => c.id === cid);
  const prev = i > 0 ? list[i - 1] : undefined;
  const next = i >= 0 ? list[i + 1] : undefined;
  const n = pg.d?.pages.length || 0;
  const cls = st.fit === "width" ? "mx-auto block w-full max-w-3xl" : "mx-auto block max-h-screen w-auto max-w-full";
  const to = (id: string) => nav(`/read/${mid}/${id}`);

  // restore saved page for this chapter
  useEffect(() => {
    start.current = hist.find((h) => h.chapterId === cid)?.page ?? 0;
    setP(start.current);
  }, [cid]);
  useEffect(() => {
    if (st.mode === "vertical" && n && start.current > 0) document.getElementById("pg" + start.current)?.scrollIntoView();
  }, [n, st.mode]);

  // save progress
  useEffect(() => {
    if (!man.d || !n) return;
    const ch = chs.d?.find((c) => c.id === cid);
    setHist((h) => [
      { manga: { id: mid, title: man.d!.title, cover: man.d!.cover }, chapterId: cid, label: ch ? label(ch) : "Chapter", page: p, ts: Date.now() },
      ...h.filter((x) => x.manga.id !== mid),
    ].slice(0, 100));
  }, [p, n, man.d, chs.d, cid]);

  // vertical mode: track current page
  useEffect(() => {
    if (st.mode !== "vertical" || !n) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setP(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-50% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [n, st.mode]);

  const go = (d: number) => {
    const t = p + d;
    if (t < 0) prev && to(prev.id);
    else if (t >= n) next && to(next.id);
    else setP(t);
  };
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (st.mode !== "single") return;
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) go(st.rtl ? -d : d);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });
  useEffect(() => {
    const nx = pg.d?.pages[p + 1];
    if (st.mode === "single" && nx) new Image().src = nx.url;
  }, [p, pg.d, st.mode]);

  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());
  const foot = (
    <div className="mx-auto flex max-w-3xl gap-3 p-6">
      <button disabled={!prev} onClick={() => prev && to(prev.id)} className="flex-1 rounded-xl bg-white/10 py-3 text-sm disabled:opacity-30">← Previous</button>
      <button disabled={!next} onClick={() => next && to(next.id)} className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold disabled:opacity-30">{next ? "Next chapter →" : "Last chapter"}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-black/85 px-3 pb-2 backdrop-blur" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
        <Link to={`/manga/${mid}`} aria-label="Back to details" className="rounded-full bg-white/10 px-3 py-1.5">←</Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{man.d?.title || "Loading…"}</p>
          <select aria-label="Chapter" value={cid} onChange={(e) => to(e.target.value)} className="mt-0.5 max-w-full rounded bg-card px-1 py-0.5 text-xs">
            {i < 0 && <option value={cid}>Chapter</option>}
            {list.map((c) => <option key={c.id} value={c.id}>{label(c)}</option>)}
          </select>
        </div>
        <span className="text-xs text-slate-400">{n ? `${p + 1}/${n}` : ""}</span>
        <button aria-label="Reader settings" aria-expanded={cfg} onClick={() => setCfg(!cfg)} className="rounded-full bg-white/10 px-3 py-1.5">⚙</button>
        <button aria-label="Toggle fullscreen" onClick={fs} className="rounded-full bg-white/10 px-3 py-1.5">⛶</button>
      </div>
      {cfg && (
        <div className="mx-auto max-w-md bg-card px-4 py-2">
          <Seg label="Mode" v={st.mode} opts={[["vertical", "Scroll"], ["single", "Single"]]} on={(mode) => setSt((s) => ({ ...s, mode }))} />
          <Seg label="Direction" v={st.rtl ? "rtl" : "ltr"} opts={[["ltr", "L→R"], ["rtl", "R→L"]]} on={(v) => setSt((s) => ({ ...s, rtl: v === "rtl" }))} />
          <Seg label="Fit" v={st.fit} opts={[["width", "Width"], ["height", "Height"]]} on={(fit) => setSt((s) => ({ ...s, fit }))} />
          <Seg label="Quality" v={st.quality} opts={[["data-saver", "Saver"], ["data", "Original"]]} on={(quality) => setSt((s) => ({ ...s, quality }))} />
        </div>
      )}
      {pg.l && <div className="mx-auto mt-4 max-w-3xl space-y-3 px-3">{[0, 1].map((k) => <div key={k} className="h-[70vh] animate-pulse rounded-xl bg-white/5" />)}</div>}
      {pg.e && <Err m={pg.e} />}
      {pg.d && pg.d.status !== "ok" && (
        <div className="mx-auto mt-16 max-w-sm px-6 text-center">
          <p className="text-slate-300">{pg.d.status === "external" ? "This chapter is hosted on the publisher's official site." : "No pages are available for this chapter here."}</p>
          {pg.d.officialUrl && <a href={pg.d.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-semibold">Open Official Reader ↗</a>}
          {foot}
        </div>
      )}
      {pg.d && pg.d.status === "ok" && st.mode === "vertical" && (
        <>
          {pg.d.pages.map((x, k) => (
            <div key={x.url} id={"pg" + k} data-i={k} className="min-h-[40vh]"><Pic src={x.url} cls={cls} eager={k < 2} /></div>
          ))}
          {foot}
        </>
      )}
      {pg.d && pg.d.status === "ok" && st.mode === "single" && pg.d.pages[p] && (
        <>
          <div className="relative flex min-h-[80vh] items-center justify-center">
            <Pic key={pg.d.pages[p].url} src={pg.d.pages[p].url} cls={cls} eager />
            <button aria-label="Left side: tap to turn page" onClick={() => go(st.rtl ? 1 : -1)} className="absolute inset-y-0 left-0 w-1/2" />
            <button aria-label="Right side: tap to turn page" onClick={() => go(st.rtl ? -1 : 1)} className="absolute inset-y-0 right-0 w-1/2" />
          </div>
          {p === n - 1 && foot}
        </>
      )}
    </div>
  );
}
