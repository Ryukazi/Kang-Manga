import { handler, md, qs, num, isId, HttpError } from "./_md";

export default handler(async (req) => {
  const mangaId = qs(req, "mangaId");
  if (!isId(mangaId)) throw new HttpError(400, "Invalid mangaId");
  const langs = qs(req, "languages", "en").split(",").filter((l) => /^[a-z-]{2,7}$/i.test(l)).slice(0, 5);
  if (!langs.length) throw new HttpError(400, "Invalid languages");
  const limit = num(qs(req, "limit"), 100, 1, 500);
  const offset = num(qs(req, "offset"), 0, 0, 100000);
  const r = await md(`/manga/${mangaId}/feed`, {
    limit,
    offset,
    "translatedLanguage[]": langs,
    "order[volume]": "asc",
    "order[chapter]": "asc",
    "includes[]": ["scanlation_group"],
    "contentRating[]": ["safe", "suggestive", "erotica"],
  });
  const chapters = r.data.map((c: any) => {
    const a = c.attributes;
    const g = (c.relationships || []).find((x: any) => x.type === "scanlation_group");
    return {
      id: c.id,
      chapter: a.chapter ?? null,
      title: a.title || null,
      volume: a.volume ?? null,
      publishedAt: a.publishAt,
      pages: a.pages || 0,
      externalUrl: a.externalUrl || null,
      readable: !a.externalUrl && (a.pages || 0) > 0,
      group: g?.attributes?.name || null,
      url: `https://mangadex.org/chapter/${c.id}`,
    };
  });
  return { chapters, total: r.total, limit, offset };
}, 120);
