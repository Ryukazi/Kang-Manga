import { handler, md } from "./_md";

export default handler(async () => {
  const r = await md("/manga/tag");
  const genres = r.data
    .filter((t: any) => t.attributes.group === "genre")
    .map((t: any) => ({ id: t.id, name: t.attributes.name.en }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  return { genres };
}, 86400);
