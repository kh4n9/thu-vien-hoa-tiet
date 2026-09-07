// Tải Node.js LTS v22 (win-arm64) về thư mục dự án — dùng làm runtime chạy dev/build/scripts
// vì Node 26 (OpenSSL 3.5.7 trên win-arm64) bị từ chối khi bắt tay TLS với MongoDB Atlas
// (alert 80) trong khi Python 3.13 + TLS vẫn OK. Node v22 dùng OpenSSL 3.0.x nên kết nối được.
import { writeFile } from "node:fs/promises";

const INDEX = "https://nodejs.org/dist/index.json";

const index = await (await fetch(INDEX)).json();
const v22 = index.find(
  (e) => e.version.startsWith("v22.") && e.lts !== false && /^v\d+\.\d+\.\d+$/.test(e.version),
);
if (!v22) throw new Error("Không tìm thấy bản v22 LTS nào.");
const version = v22.version;
const archive = `node-${version}-win-arm64.zip`;
const url = `https://nodejs.org/dist/${version}/${archive}`;
const out = `node-lts-${archive}`;

console.log("Tải:", url);
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const total = Number(res.headers.get("content-length")) || 0;
const chunks = [];
let received = 0;
for await (const chunk of res.body) {
  chunks.push(chunk);
  received += chunk.length;
  process.stdout.write(`\r${(received / 1048576).toFixed(1)}MB / ${(total / 1048576).toFixed(1)}MB`);
}
process.stdout.write("\n");
await writeFile(out, Buffer.concat(chunks));
console.log("Đã lưu:", out, `(${(total / 1048576).toFixed(1)}MB)`);