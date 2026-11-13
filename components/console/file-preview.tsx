"use client";
// Previews a stored file in the console without downloading it: images on a checkerboard,
// PDFs in the browser's viewer, JSON pretty-printed, text as it is, and anything else as a
// hex dump of its first kilobyte (diagnostics are often binary). ← and → step through the
// list. The file is fetched once with the console's session and kept as a blob in memory.
//
// Only types that can't run script are ever rendered: a blob is given the type its kind
// implies (never the stored Content-Type), and text is shown as text, so a disguised HTML or
// SVG file can't execute in the console's origin.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileDigit,
  FileImage,
  FileJson,
  FileText,
  LoaderCircle,
} from "lucide-react";
import { apiResponse } from "@/lib/console/api";
import type { StoredFile } from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dateLabel } from "./shared";
import "@/app/console-files.css";

export type FileKind = "image" | "pdf" | "json" | "text" | "binary";

/** What a file is, from its stored type, or its extension when the type is generic. */
export function fileKind(file: StoredFile): FileKind {
  const type = file.content_type.toLowerCase();
  const extension = file.filename.split(".").pop()?.toLowerCase() ?? "";
  if (
    type === "image/png" ||
    type === "image/jpeg" ||
    ["png", "jpg", "jpeg"].includes(extension)
  )
    return "image";
  if (type === "application/pdf" || extension === "pdf") return "pdf";
  if (type === "application/json" || extension === "json") return "json";
  if (type === "text/plain" || ["txt", "log", "csv"].includes(extension)) return "text";
  return "binary";
}

const icons = {
  image: FileImage,
  pdf: FileText,
  json: FileJson,
  text: FileText,
  binary: FileDigit,
} as const;

export function FileIcon({ file, size = 22 }: { file: StoredFile; size?: number }) {
  const Icon = icons[fileKind(file)];
  return <Icon size={size} />;
}

const labels: Record<FileKind, string> = {
  image: "Image",
  pdf: "PDF",
  json: "JSON",
  text: "Text",
  binary: "Binary",
};

export function sizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Text past this is cut, with a note: a 10 MB log would freeze the dialog. */
const TEXT_LIMIT = 200 * 1024;
const HEX_BYTES = 1024;

function hexDump(bytes: Uint8Array) {
  const lines: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const row = bytes.subarray(offset, offset + 16);
    const hex = Array.from(row, (byte) => byte.toString(16).padStart(2, "0"));
    const left = hex.slice(0, 8).join(" ");
    const right = hex.slice(8).join(" ");
    const ascii = Array.from(row, (byte) =>
      byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : ".",
    ).join("");
    lines.push(
      `${offset.toString(16).padStart(8, "0")}  ${left.padEnd(23)}  ${right.padEnd(23)}  ${ascii}`,
    );
  }
  return lines.join("\n");
}

type Loaded =
  | { kind: "image" | "pdf"; blob: Blob }
  | { kind: "json" | "text"; blob: Blob; text: string; cut: boolean }
  | { kind: "binary"; blob: Blob; text: string };

async function load(path: string, file: StoredFile, signal: AbortSignal): Promise<Loaded> {
  const response = await apiResponse(path, { signal });
  const data = await response.arrayBuffer();
  const kind = fileKind(file);
  if (kind === "image") {
    const type =
      file.content_type === "image/jpeg" || /\.jpe?g$/i.test(file.filename)
        ? "image/jpeg"
        : "image/png";
    return { kind, blob: new Blob([data], { type }) };
  }
  if (kind === "pdf")
    return { kind, blob: new Blob([data], { type: "application/pdf" }) };
  const blob = new Blob([data], { type: "application/octet-stream" });
  if (kind === "binary")
    return {
      kind,
      blob,
      text: hexDump(new Uint8Array(data, 0, Math.min(HEX_BYTES, data.byteLength))),
    };
  const cut = data.byteLength > TEXT_LIMIT;
  let text = new TextDecoder("utf-8").decode(cut ? data.slice(0, TEXT_LIMIT) : data);
  if (kind === "json" && !cut) {
    try {
      text = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // Not valid JSON: show it as it is.
    }
  }
  return { kind, blob, text, cut };
}

/** An object URL for the blob, revoked when it changes or the preview closes. */
function useObjectUrl(blob: Blob | undefined) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

export function FilePreview({
  files,
  file,
  onSelect,
  source = (item) => `files/${item.id}/download`,
}: {
  files: StoredFile[];
  file: StoredFile | null;
  onSelect: (file: StoredFile | null) => void;
  /** Where to fetch a file from; support attachments come through their request. */
  source?: (file: StoredFile) => string;
}) {
  const index = file ? files.findIndex((item) => item.id === file.id) : -1;
  const previous = index > 0 ? files[index - 1] : null;
  const next = index >= 0 && index < files.length - 1 ? files[index + 1] : null;
  const preview = useQuery({
    queryKey: ["file-preview", file ? source(file) : null],
    queryFn: ({ signal }) => load(source(file!), file!, signal),
    enabled: !!file,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });
  const loaded = preview.data;
  const url = useObjectUrl(
    loaded && (loaded.kind === "image" || loaded.kind === "pdf")
      ? loaded.blob
      : undefined,
  );
  const [saving, setSaving] = useState(false);

  function download() {
    if (!file || !loaded) return;
    setSaving(true);
    const link = document.createElement("a");
    const href = URL.createObjectURL(loaded.blob);
    link.href = href;
    link.download = file.filename;
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(href);
      setSaving(false);
    }, 1000);
  }

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onSelect(null)}>
      <DialogContent
        className="console-dialog file-preview"
        onKeyDown={(event) => {
          // Not while typing or using the PDF viewer, which takes its own keys.
          if (
            event.target instanceof HTMLElement &&
            event.target.closest("input, textarea, iframe")
          )
            return;
          if (event.key === "ArrowLeft" && previous) onSelect(previous);
          if (event.key === "ArrowRight" && next) onSelect(next);
        }}
      >
        {file ? (
          <>
            <DialogHeader className="file-preview-head">
              <span className="file-icon">
                <FileIcon file={file} />
              </span>
              <div>
                <DialogTitle>{file.filename}</DialogTitle>
                <DialogDescription>
                  {labels[fileKind(file)]} · {sizeLabel(file.size_bytes)} ·{" "}
                  {dateLabel(file.created_at)}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className={`file-preview-body ${fileKind(file)}`}>
              {preview.isPending ? (
                <p className="file-preview-state" role="status">
                  <LoaderCircle className="animate-spin" size={18} /> Loading preview…
                </p>
              ) : preview.isError ? (
                <p className="file-preview-state" role="alert">
                  {preview.error.message}
                </p>
              ) : loaded?.kind === "image" && url ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local blob, not an optimisable asset.
                <img src={url} alt={file.filename} />
              ) : loaded?.kind === "pdf" && url ? (
                <iframe src={url} title={file.filename} />
              ) : loaded && "text" in loaded ? (
                <>
                  {loaded.kind === "binary" ? (
                    <p className="file-preview-note">
                      No preview for this kind of file. Its first{" "}
                      {sizeLabel(Math.min(HEX_BYTES, file.size_bytes))} in hex:
                    </p>
                  ) : loaded.cut ? (
                    <p className="file-preview-note">
                      Showing the first {sizeLabel(TEXT_LIMIT)} of{" "}
                      {sizeLabel(file.size_bytes)}. Download it for the rest.
                    </p>
                  ) : null}
                  <pre tabIndex={0}>
                    <code>{loaded.text || " "}</code>
                  </pre>
                </>
              ) : null}
            </div>

            <div className="console-actions file-preview-actions">
              <div className="file-preview-step">
                <Button
                  className="console-secondary"
                  onClick={() => previous && onSelect(previous)}
                  disabled={!previous}
                  aria-label="Previous file"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span>
                  {index + 1} of {files.length}
                </span>
                <Button
                  className="console-secondary"
                  onClick={() => next && onSelect(next)}
                  disabled={!next}
                  aria-label="Next file"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
              <Button
                className="console-button"
                onClick={download}
                disabled={!loaded || saving}
              >
                <Download size={16} /> Download
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
