"use client";
// Files: a file browser rather than two cards. Upload from the heading or drop files anywhere on
// the list; search by name and filter by kind; each row opens a preview (file-preview.tsx) or
// downloads. Several files dropped at once upload one after another.
import { useRef, useState, type DragEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Eye,
  FolderOpen,
  LoaderCircle,
  Search,
  Upload,
  UploadCloud,
} from "lucide-react";
import { api, apiResponse, listAll } from "@/lib/console/api";
import type { StoredFile } from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState, PageHeading } from "./shared";
import {
  FileIcon,
  FilePreview,
  fileKind,
  sizeLabel,
  type FileKind,
} from "./file-preview";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = [
  "",
  "application/pdf",
  "application/json",
  "text/plain",
  "image/png",
  "image/jpeg",
  "application/octet-stream",
];
const HINT = "PDF, PNG, JPEG, JSON, plain text or binary, up to 10 MB.";

const filters: {
  value: "all" | "images" | "documents" | "data";
  label: string;
  kinds: FileKind[];
}[] = [
  { value: "all", label: "All", kinds: ["image", "pdf", "json", "text", "binary"] },
  { value: "images", label: "Images", kinds: ["image"] },
  { value: "documents", label: "Documents", kinds: ["pdf", "text"] },
  { value: "data", label: "Data", kinds: ["json", "binary"] },
];

/** PNG, PDF, JSON…: the file's own extension when it's one we know, else its kind. */
function typeLabel(file: StoredFile) {
  const extension = file.filename.split(".").pop()?.toUpperCase() ?? "";
  if (
    ["PNG", "JPG", "JPEG", "PDF", "JSON", "TXT", "LOG", "CSV", "BIN"].includes(extension)
  )
    return extension;
  return fileKind(file) === "binary" ? "Binary" : extension || "File";
}

/** Why a file can't be uploaded, or "" if it can. */
function problem(file: File) {
  if (file.size > MAX_BYTES) return `${file.name} is larger than 10 MB.`;
  if (!/^[a-zA-Z0-9 ._-]{1,120}$/.test(file.name))
    return `Rename ${file.name}: use up to 120 letters, numbers, spaces, dots, hyphens or underscores.`;
  if (!ACCEPTED.includes(file.type))
    return `${file.name} isn't a PDF, PNG, JPEG, JSON, text or binary file.`;
  return "";
}

export function FilesPage() {
  const { preview, user } = useConsole();
  const input = useRef<HTMLInputElement>(null);
  const client = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<StoredFile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave fire for every child; count them so the overlay doesn't flicker.
  const depth = useRef(0);

  const files = useQuery({
    queryKey: ["files", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve([] as StoredFile[])
        : listAll<StoredFile>("files", signal),
  });
  const upload = useMutation({
    mutationFn: (file: File) =>
      api<StoredFile>("files", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-File-Name": file.name,
        },
      }),
  });
  const download = useMutation({
    mutationFn: async (file: StoredFile) => {
      const response = await apiResponse(`files/${file.id}/download`);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    },
  });

  const busy = preview || uploading !== null;

  async function uploadAll(list: File[]) {
    if (busy || !list.length) return;
    setErrors([]);
    setDone("");
    const failed: string[] = [];
    const sent: string[] = [];
    for (const file of list) {
      const reason = problem(file);
      if (reason) {
        failed.push(reason);
        continue;
      }
      setUploading(file.name);
      try {
        await upload.mutateAsync(file);
        sent.push(file.name);
      } catch (error) {
        failed.push(
          `${file.name}: ${error instanceof Error ? error.message : "upload failed"}`,
        );
      }
    }
    setUploading(null);
    setErrors(failed);
    if (sent.length) {
      setDone(
        sent.length === 1 ? `${sent[0]} uploaded.` : `${sent.length} files uploaded.`,
      );
      client.invalidateQueries({ queryKey: ["files"] });
    }
  }

  const dragHandlers = {
    onDragEnter(event: DragEvent) {
      if (!event.dataTransfer.types.includes("Files")) return;
      depth.current += 1;
      setDragging(true);
    },
    onDragOver(event: DragEvent) {
      if (event.dataTransfer.types.includes("Files")) event.preventDefault();
    },
    onDragLeave() {
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setDragging(false);
    },
    onDrop(event: DragEvent) {
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      uploadAll(Array.from(event.dataTransfer.files));
    },
  };

  const all = files.data ?? [];
  const kinds = filters.find((item) => item.value === filter)!.kinds;
  const needle = query.trim().toLowerCase();
  const visible = all.filter(
    (file) =>
      kinds.includes(fileKind(file)) &&
      (!needle || file.filename.toLowerCase().includes(needle)),
  );
  const totalBytes = all.reduce((sum, file) => sum + file.size_bytes, 0);

  return (
    <>
      <PageHeading
        title="Files"
        description={
          user.role === "admin"
            ? "Private storage for diagnostics, spec sheets and certificates, across all accounts."
            : "Your private spec sheets, diagnostics and certificates."
        }
      >
        <Button
          className="console-button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {uploading ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? "Uploading…" : "Upload files"}
        </Button>
      </PageHeading>
      <input
        ref={input}
        className="sr-only"
        type="file"
        multiple
        aria-label="Choose files to upload"
        accept=".pdf,.png,.jpg,.jpeg,.json,.txt,.bin"
        disabled={busy}
        onChange={(event) => {
          uploadAll(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {errors.length ? (
        <div className="console-alert error" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      {download.isError && (
        <p className="console-alert error" role="alert">
          {download.error.message}
        </p>
      )}
      {done ? (
        <p className="console-alert" role="status">
          {done}
        </p>
      ) : null}

      <section
        className={`files-browser${dragging ? " dragging" : ""}`}
        aria-label="Files"
        {...dragHandlers}
      >
        {all.length ? (
          <div className="files-toolbar">
            <label className="console-search">
              <Search size={18} />
              <span className="sr-only">Search files</span>
              <input
                type="search"
                placeholder="Search by name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="segmented-control" role="group" aria-label="Filter by kind">
              {filters.map((item) => (
                <button
                  key={item.value}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="files-total">
              {all.length} {all.length === 1 ? "file" : "files"} · {sizeLabel(totalBytes)}
            </span>
          </div>
        ) : null}

        {files.isPending ? (
          <LoadingState />
        ) : files.isError ? (
          <ErrorState message={files.error.message} retry={() => files.refetch()} />
        ) : !all.length && !uploading ? (
          <div className="files-empty">
            <span>
              <UploadCloud size={26} />
            </span>
            <h3>No files yet</h3>
            <p>Drop files here, or upload them from your computer. {HINT}</p>
            <Button
              className="console-secondary"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Upload size={16} /> Choose files
            </Button>
          </div>
        ) : (
          <>
            <table className="files-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Size</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploading ? (
                  <tr className="files-uploading">
                    <td colSpan={5}>
                      <span className="file-icon">
                        <LoaderCircle className="animate-spin" size={20} />
                      </span>
                      Uploading {uploading}…
                    </td>
                  </tr>
                ) : null}
                {visible.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <button
                        type="button"
                        className="file-open"
                        onClick={() => setPreviewing(file)}
                        aria-label={`Preview ${file.filename}`}
                      >
                        <span className={`file-icon ${fileKind(file)}`}>
                          <FileIcon file={file} size={20} />
                        </span>
                        <span className="file-name">
                          <strong>{file.filename}</strong>
                          <small>
                            {typeLabel(file)} · {sizeLabel(file.size_bytes)} ·{" "}
                            {dateLabel(file.created_at)}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="files-type">{typeLabel(file)}</td>
                    <td className="files-size">{sizeLabel(file.size_bytes)}</td>
                    <td className="files-date">{dateLabel(file.created_at)}</td>
                    <td className="files-actions">
                      <button
                        type="button"
                        className="row-open"
                        onClick={() => setPreviewing(file)}
                        aria-label={`Preview ${file.filename}`}
                        tabIndex={-1}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        className="row-open"
                        onClick={() => download.mutate(file)}
                        disabled={download.isPending}
                        aria-label={`Download ${file.filename}`}
                      >
                        <Download size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && !uploading ? (
              <div className="files-none">
                <FolderOpen size={22} />
                <p>
                  {needle
                    ? `No files match “${query.trim()}”.`
                    : "No files of this kind."}
                </p>
              </div>
            ) : null}
            <p className="files-hint">
              <UploadCloud size={15} /> Drop files anywhere here to upload. {HINT}
            </p>
          </>
        )}

        {dragging ? (
          <div className="files-drop" aria-hidden="true">
            <UploadCloud size={28} />
            <strong>Drop to upload</strong>
            <span>{HINT}</span>
          </div>
        ) : null}
      </section>

      <FilePreview files={visible} file={previewing} onSelect={setPreviewing} />
    </>
  );
}
