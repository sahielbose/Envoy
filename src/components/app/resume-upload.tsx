"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface UploadResult {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
}

type Status = "idle" | "uploading" | "done" | "error";

export function ResumeUpload({ onUploaded }: { onUploaded?: (meta: UploadResult) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Upload failed.");
      }
      const meta = (await res.json()) as UploadResult;
      setResult(meta);
      setStatus("done");
      onUploaded?.(meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="uploaded">
        <Icon icon={CheckCircle2} size={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 13.5 }}>{result.filename}</b>
          <small style={{ display: "block" }}>{(result.size / 1024).toFixed(0)} KB · uploaded</small>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setStatus("idle");
            setResult(null);
          }}
        >
          Replace
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={cn("dropzone", dragging && "is-drag")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
      >
        <span className="dropzone__icon">
          <Icon icon={status === "uploading" ? Loader2 : status === "idle" ? UploadCloud : FileText} size={22} />
        </span>
        <b>{status === "uploading" ? "Uploading…" : "Upload your résumé"}</b>
        <small>PDF, DOCX, or text · up to 5 MB. Drag and drop or click to browse.</small>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,application/pdf,text/plain"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
