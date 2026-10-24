import { Link } from "react-router-dom";
import type { Lite } from "./lib";

export const Skel = ({ n = 6, cls = "" }: { n?: number; cls?: string }) => (
  <>{Array.from({ length: n }, (_, i) => (
    <div key={i} className={`aspect-[2/3] animate-pulse rounded-xl bg-white/5 ${cls}`} />
  ))}</>
);

export const Err = ({ m }: { m: string }) => (
  <div role="alert" className="m-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
    {m}
    <button className="ml-3 font-semibold text-accent underline" onClick={() => location.reload()}>Retry</button>
  </div>
);

export const Cover = ({ src }: { src: string | null }) => (
  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-card">
    {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />}
  </div>
);

export const Card = ({ m }: { m: Lite }) => (
  <Link to={`/manga/${m.id}`} className="block">
    <Cover src={m.cover} />
    <p className="mt-2 line-clamp-2 text-sm font-medium">{m.title}</p>
  </Link>
);

export function Seg<T extends string>({ label, v, opts, on }: {
  label: string; v: T; opts: [T, string][]; on: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex rounded-lg bg-white/5 p-1">
        {opts.map(([o, t]) => (
          <button key={o} aria-pressed={v === o} onClick={() => on(o)}
            className={`rounded-md px-3 py-1 text-sm ${v === o ? "bg-accent text-white" : "text-slate-400"}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}
