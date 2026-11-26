// Minimal static server for the built SPA (dist/), Node built-ins only: no dependency to audit.
// Mirrors deploy/render/render.yaml: SPA fallback to index.html, immutable cache for /assets,
// no cache for the HTML, and basic security headers.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";

const ROOT = new URL("../dist/", import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 5173);
const HOST = process.env.HOST ?? "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

async function resolveFile(urlPath) {
  // Decode and normalise, then refuse anything that escapes ROOT (path traversal).
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  const candidate = normalize(join(ROOT, decoded));
  if (!candidate.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return null;
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    // not found: falls back to index.html below
  }
  return join(ROOT, "index.html");
}

createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD", ...SECURITY_HEADERS }).end();
    return;
  }
  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain", ...SECURITY_HEADERS }).end("ok");
    return;
  }
  const file = await resolveFile(req.url ?? "/");
  if (!file) {
    res.writeHead(400, SECURITY_HEADERS).end();
    return;
  }
  const isAsset = file.startsWith(join(ROOT, "assets") + sep);
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
    "Cache-Control": isAsset ? "public, max-age=31536000, immutable" : "no-cache",
    ...SECURITY_HEADERS,
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`foundit-web-app serving ${ROOT} on ${HOST}:${PORT}`);
});
