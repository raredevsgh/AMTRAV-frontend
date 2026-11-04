"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, FileText, Download, FolderOpen } from "lucide-react";
import { api, apiResponse, listAll } from "@/lib/console/api";
import type { StoredFile } from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState, PageHeading } from "./shared";

export function FilesPage() {
  const { preview, user } = useConsole();
  const input = useRef<HTMLInputElement>(null);
  const [validation, setValidation] = useState("");
  const client = useQueryClient();
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
    onSuccess: () => client.invalidateQueries({ queryKey: ["files"] }),
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
  function select(file?: File) {
    setValidation("");
    if (!file || preview || upload.isPending) return;
    if (file.size > 10 * 1024 * 1024) {
      setValidation("Choose a file smaller than 10 MB.");
      return;
    }
    if (!/^[a-zA-Z0-9 ._-]{1,120}$/.test(file.name)) {
      setValidation(
        "Use a file name of up to 120 letters, numbers, spaces, dots, hyphens or underscores.",
      );
      return;
    }
    if (
      ![
        "",
        "application/pdf",
        "application/json",
        "text/plain",
        "image/png",
        "image/jpeg",
        "application/octet-stream",
      ].includes(file.type)
    ) {
      setValidation("Choose a PDF, PNG, JPEG, JSON, text or binary file.");
      return;
    }
    upload.mutate(file);
  }
  return (
    <>
      <PageHeading
        title="Files"
        description={
          user.role === "admin"
            ? "Private storage for diagnostics, spec sheets and certificates, across all accounts."
            : "Your private spec sheets, diagnostics and certificates."
        }
      />
      {download.isError && (
        <p className="console-alert error" role="alert">
          {download.error.message}
        </p>
      )}
      <div className="files-layout">
        <section
          className="console-card upload-card"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            select(event.dataTransfer.files[0]);
          }}
        >
          <UploadCloud size={32} />
          <h2>Upload a file</h2>
          <p>Drop it here or browse.</p>
          <small>PDF, PNG, JPEG, JSON, plain text or binary, up to 10 MB.</small>
          <input
            ref={input}
            className="sr-only"
            type="file"
            aria-label="Choose file to upload"
            accept=".pdf,.png,.jpg,.jpeg,.json,.txt,.bin"
            disabled={preview || upload.isPending}
            onChange={(event) => {
              select(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            className="console-button"
            disabled={preview || upload.isPending}
            onClick={() => input.current?.click()}
          >
            {upload.isPending ? "Uploading…" : "Browse files"}
          </Button>
          {(validation || upload.isError) && (
            <p className="field-error" role="alert">
              {validation || upload.error?.message}
            </p>
          )}
          {upload.isSuccess && <p role="status">{upload.data.filename} uploaded.</p>}
        </section>
        <section className="console-card">
          <div className="card-heading">
            <h2>{user.role === "admin" ? "All files" : "Your files"}</h2>
            <span className="count-badge">{files.data?.length || 0}</span>
          </div>
          {files.isPending ? (
            <LoadingState />
          ) : files.isError ? (
            <ErrorState message={files.error.message} retry={() => files.refetch()} />
          ) : !files.data.length ? (
            <div className="console-empty">
              <FolderOpen size={32} />
              <h3>A place for every detail.</h3>
              <p>Your uploaded files will appear here.</p>
            </div>
          ) : (
            <ul className="file-list">
              {files.data.map((file) => (
                <li key={file.id}>
                  <span className="file-icon">
                    <FileText size={22} />
                  </span>
                  <div>
                    <strong>{file.filename}</strong>
                    <p>
                      {(file.size_bytes / 1024).toFixed(0)} KB ·{" "}
                      {dateLabel(file.created_at)}
                    </p>
                  </div>
                  <button
                    className="row-open"
                    onClick={() => download.mutate(file)}
                    disabled={download.isPending}
                    aria-label={`Download ${file.filename}`}
                  >
                    <Download size={19} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
