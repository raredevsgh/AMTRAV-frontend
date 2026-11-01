"use client";
import { useCallback, useRef, useState } from "react";
import { useConsole, useResource } from "./console-context";
import {
  SectionPage,
  Notice,
  ErrorState,
  LoadingState,
  EmptyState,
  Pagination,
  formatDate,
} from "@/components/console-ui";
import { fileError, FILE_TYPES } from "@/lib/api/validation";
import type { FileMetadata } from "@/lib/api/types";
export function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MiB`
    : bytes >= 1024
      ? `${(bytes / 1024).toFixed(1)} KiB`
      : `${bytes} B`;
}
export function Files() {
  const api = useConsole();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const load = useCallback(
    () => api.listFiles({ offset, limit }),
    [api, offset, limit],
  );
  const { data, error, loading, retry } = useResource(load);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState<unknown>(null);
  const [validation, setValidation] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const select = (files: FileList | null) => {
    setFailure(null);
    setMessage("");
    setFile(null);
    if (!files?.length) return;
    if (files.length !== 1) {
      setValidation("Choose one file at a time.");
      return;
    }
    const chosen = files[0];
    const problem = fileError(chosen.name, chosen.type, chosen.size);
    setValidation(problem ?? "");
    if (!problem) setFile(chosen);
  };
  const download = async (metadata: FileMetadata) => {
    setFailure(null);
    try {
      const bytes = await api.downloadFile(metadata.id);
      const url = URL.createObjectURL(
        new Blob([Uint8Array.from(bytes)], { type: metadata.content_type }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = metadata.filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Downloaded local demo content only.");
    } catch (e) {
      setFailure(e);
    }
  };
  return (
    <SectionPage
      title="Files"
      description={
        api.session.role === "admin"
          ? "Private files. As an admin you can access all owners’ files."
          : "Private files uploaded by your manufacturer account only."
      }
    >
      {loading ? (
        <LoadingState label="Loading files" />
      ) : (
        <>
          {message && <Notice title={message} tone="success" />}
          {failure != null && <ErrorState error={failure} />}
          <section
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            aria-label="Private file upload"
            aria-busy={busy}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy) select(e.dataTransfer.files);
            }}
          >
            <div className="grow">
              <h2>Drop a file here, or browse</h2>
              <p className="small muted">
                PDF, PNG, JPEG, JSON, plain text or binary · 1 byte–10 MiB
              </p>
              <p className="small muted">
                ASCII filename; no paths. Uploads are scoped to your own
                account, one file at a time.
              </p>
              {file && (
                <p className="small mt-3">
                  Selected: <strong>{file.name}</strong> ·{" "}
                  {formatSize(file.size)}
                </p>
              )}
              {validation && (
                <p role="alert" className="field-error mt-3">
                  {validation}
                </p>
              )}
            </div>
            <div className="row">
              <input
                ref={input}
                type="file"
                id="private-file"
                hidden
                aria-label="Choose private file"
                accept={FILE_TYPES.join(",")}
                disabled={busy}
                onChange={(e) => select(e.target.files)}
              />
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                Browse files
              </button>
              {file && (
                <button
                  className="btn"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setFailure(null);
                    try {
                      const bytes = new Uint8Array(await file.arrayBuffer());
                      await api.uploadFile(
                        file.name,
                        file.type || "application/octet-stream",
                        bytes,
                      );
                      setMessage(
                        "File saved only in this local demo session. It was not uploaded to a backend.",
                      );
                      setFile(null);
                      if (input.current) input.current.value = "";
                      setOffset(0);
                      retry();
                    } catch (e) {
                      setFailure(e);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Uploading…" : "Upload selected file"}
                </button>
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>All files</h2>
              <span className="small muted">
                {data?.items.length ?? 0} records on this page
              </span>
            </div>
            {error ? (
              <ErrorState error={error} retry={retry} />
            ) : !data?.items.length ? (
              <EmptyState title="No files yet">
                <p>
                  Choose a file to begin. Only your uploads and files you may
                  access are shown.
                </p>
              </EmptyState>
            ) : (
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Private files table"
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Filename / file UUID</th>
                      <th scope="col">Owner UUID</th>
                      <th scope="col">Content type</th>
                      <th scope="col">Size</th>
                      <th scope="col">Uploaded · UTC</th>
                      <th scope="col">
                        <span className="sr-only">Download</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.filename}</strong>
                          <p className="mono muted mt-1">
                            File UUID · {item.id.slice(0, 8)}…
                            {item.id.slice(-4)}
                          </p>
                        </td>
                        <td className="mono" title={item.owner_id}>
                          {item.owner_id.slice(0, 8)}…{item.owner_id.slice(-4)}
                        </td>
                        <td>{item.content_type}</td>
                        <td>{formatSize(item.size_bytes)}</td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            aria-label={`Download ${item.filename}`}
                            onClick={() => void download(item)}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data && (
              <Pagination
                offset={offset}
                limit={limit}
                count={data.items.length}
                onPage={setOffset}
                onLimit={(size) => {
                  setLimit(size);
                  setOffset(0);
                }}
              />
            )}
          </section>
          <Notice title="Owner or admin access only">
            Demo downloads contain harmless local fixtures or files you
            selected. Metadata does not define a file-to-device relationship.
            Live integration must send raw bytes with X-File-Name, not multipart
            data.
          </Notice>
        </>
      )}
    </SectionPage>
  );
}
