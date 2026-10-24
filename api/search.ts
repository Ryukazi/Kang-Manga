import { handler, md, qs, num, normalize, isId, HttpError } from "./_md";

export default handler(async (req) => {
  const q = qs(req, "q");
  const tag = qs(req, "tag");
  const order = qs(req, "order", q ? "relevance" : "followedCount");
  if (q && (q.length < 2 || q.length > 150)) throw new HttpError(400, "q must be 2-150 characters");
  if (tag && !isId(tag)) throw new HttpError(400, "Invalid tag");
  if (!["relevance", "followedCount", "latestUploadedChapter", "createdAt"].includes(order))
    throw new HttpError(400, "Invalid order");
  const r = await md("/manga", {
    title: q,
    limit: num(qs(req, "limit"), 24, 1, 50),
    offset: num(qs(req, "offset"), 0, 0, 10000),
    "includes[]": ["cover_art", "author", "artist"],
    [`order[${order}]`]: "desc",
    "contentRating[]": ["safe", "suggestive"],
    "availableTranslatedLanguage[]": ["en"],
    hasAvailableChapters: "true",
    "includedTags[]": tag ? [tag] : undefined,
  });
  return { results: r.data.map(normalize), total: r.total };
}, 120);
