// Serves dist/ for local testing. Usage: bun web/serve.ts [port]

import { join, normalize } from "node:path";

const dist = join(import.meta.dir, "..", "dist");
const port = Number(process.argv[2] ?? process.env.PORT ?? 8000);

Bun.serve({
  port,
  async fetch(req) {
    let path = normalize(decodeURIComponent(new URL(req.url).pathname));
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(join(dist, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});
console.log(`serving dist/ on http://localhost:${port}`);
