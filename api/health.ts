import { handler } from "./_md";
export default handler(async () => ({ ok: true, sources: ["mangadex"], time: new Date().toISOString() }), 0);
