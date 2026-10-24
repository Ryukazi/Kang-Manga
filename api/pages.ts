import { handler, md, qs, isId, HttpError } from "./_md";

export default handler(async (req) => {
  const chapterId = qs(req, "chapterId");
  const quality = qs(req, "quality", "data-saver");
  if (!isId(chapterId)) throw new HttpError(400, "Invalid chapterId");
  if (!["data", "data-saver"].includes(quality)) throw new HttpError(400, "Invalid quality");
  const official = `https://mangadex.org/chapter/${chapterId}`;
  const c = await md(`/chapter/${chapterId}`);
  const a = c.data.attributes;
  if (a.externalUrl)
    return { chapterId, status: "external", pages: [], officialUrl: a.externalUrl };
  if (!a.pages) return { chapterId, status: "empty", pages: [], officialUrl: official };
  const r = await md(`/at-home/server/${chapterId}`);
  const files: string[] = quality === "data" ? r.chapter.data : r.chapter.dataSaver;
  return {
    chapterId,
    quality,
    status: files.length ? "ok" : "empty",
    officialUrl: official,
    pages: files.map((f, i) => ({ index: i + 1, url: `${r.baseUrl}/${quality}/${r.chapter.hash}/${f}` })),
  };
}, 60);
