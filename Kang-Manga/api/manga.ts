import { handler, md, qs, normalize, isId, HttpError } from "./_md";

export default handler(async (req) => {
  const id = qs(req, "id");
  if (!isId(id)) throw new HttpError(400, "Invalid manga id");
  const r = await md(`/manga/${id}`, { "includes[]": ["cover_art", "author", "artist"] });
  return normalize(r.data);
}, 300);
