import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

type Params = { key: string[] };

// Chỉ phục vụ ảnh xem trước. File gốc (DXF/DWG/AI/PDF...) tuyệt đối
// không được lọt ra ngoài qua URL công khai — kể cả khi biết key trên R2.
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "gif", "avif", "svg"]);

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { key } = await params;
  const Key = key.join("/");

  if (!Key.startsWith("products/")) {
    return new Response("Không tìm thấy", { status: 404 });
  }
  const ext = Key.split(".").pop()?.toLowerCase() ?? "";
  if (!IMAGE_EXT.has(ext)) {
    return new Response("Không tìm thấy", { status: 404 });
  }

  try {
    const result = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key }));
    const body = result.Body as ReadableStream | undefined;
    if (!body) {
      return new Response("Không tìm thấy", { status: 404 });
    }

    const contentType = result.ContentType ?? "";
    if (!contentType.startsWith("image/")) {
      return new Response("Không tìm thấy", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=86400, immutable");
    headers.set("Content-Type", contentType);

    return new Response(body as unknown as BodyInit, { headers });
  } catch {
    return new Response("Không tìm thấy", { status: 404 });
  }
}