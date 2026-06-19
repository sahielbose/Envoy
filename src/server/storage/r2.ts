import { createHash, createHmac, randomUUID } from "node:crypto";
import { env, requireProvider } from "@/lib/env";
import type { StorageAdapter, StoredFile, StoredFileMeta } from "./types";

const REGION = "auto";
const SERVICE = "s3";

const sha256hex = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const hmac = (key: Buffer | string, data: string) =>
  createHmac("sha256", key).update(data, "utf8").digest();

function signingKey(secret: string, dateStamp: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

/** Real object storage — Cloudflare R2 (S3-compatible) with AWS SigV4. */
export class R2Storage implements StorageAdapter {
  private readonly host: string;

  constructor() {
    requireProvider("storage");
    this.host = `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }

  private async signedFetch(
    method: "PUT" | "GET",
    key: string,
    body?: Uint8Array,
    contentType?: string,
  ): Promise<Response> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const path = `/${env.R2_BUCKET}/${key}`;
    const payloadHash = body ? sha256hex(Buffer.from(body)) : sha256hex("");

    const headers: Record<string, string> = {
      host: this.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };
    if (contentType) headers["content-type"] = contentType;

    const names = Object.keys(headers).sort();
    const signedHeaders = names.join(";");
    const canonicalHeaders = names.map((n) => `${n}:${headers[n]}\n`).join("");
    const canonicalRequest = [method, path, "", canonicalHeaders, signedHeaders, payloadHash].join(
      "\n",
    );
    const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");
    const signature = createHmac("sha256", signingKey(env.R2_SECRET_ACCESS_KEY ?? "", dateStamp))
      .update(stringToSign)
      .digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return fetch(`https://${this.host}${path}`, {
      method,
      headers: { ...headers, Authorization: authorization },
      body: body ? Buffer.from(body) : undefined,
    });
  }

  async put({
    filename,
    contentType,
    bytes,
  }: {
    filename: string;
    contentType: string;
    bytes: Uint8Array;
  }): Promise<StoredFileMeta> {
    const fileId = randomUUID();
    const res = await this.signedFetch("PUT", fileId, bytes, contentType);
    if (!res.ok) throw new Error(`R2 put failed: ${res.status} ${res.statusText}`);
    const meta: StoredFileMeta = { fileId, filename, contentType, size: bytes.byteLength };
    await this.signedFetch(
      "PUT",
      `${fileId}.json`,
      new TextEncoder().encode(JSON.stringify(meta)),
      "application/json",
    );
    return meta;
  }

  async get(fileId: string): Promise<StoredFile | null> {
    const res = await this.signedFetch("GET", fileId);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const metaRes = await this.signedFetch("GET", `${fileId}.json`);
    const meta: StoredFileMeta = metaRes.ok
      ? ((await metaRes.json()) as StoredFileMeta)
      : { fileId, filename: fileId, contentType: "application/octet-stream", size: bytes.byteLength };
    return { bytes, meta };
  }
}
