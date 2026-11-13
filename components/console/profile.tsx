"use client";

// The signed-in staff member's own account: photo, name, password, and a way to the security
// settings. Changing the password ends every session, so it signs you out here too.
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  KeyRound,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/console/api";
import type { StaffRole, User } from "@/lib/console/types";
import { roleLabels } from "@/lib/console/roles";
import { useConsoleStore } from "@/stores/console-store";
import { useConsole } from "./provider";
import { dateLabel, PageHeading } from "./shared";
import { wipeLocalData } from "./offline";

export const nameOf = (user: User) =>
  user.display_name?.trim() ||
  [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
  user.email;

/** The uploaded photo (through the gateway), else initials. */
export function Avatar({ user, size }: { user: User; size: number }) {
  const { preview } = useConsole();
  if (user.photo_path && !preview)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- authenticated same-origin image; next/image would proxy it
      <img
        className="avatar"
        src={`/api/console${user.photo_path}`}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  const name = nameOf(user);
  const letters =
    name === user.email
      ? user.email.slice(0, 2)
      : name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0] ?? "")
          .join("");
  return (
    <span
      className="avatar initials"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {letters.toUpperCase()}
    </span>
  );
}

/** Crops to a centred square of at most 512 px and re-encodes as JPEG, well under 2 MB. */
async function squarePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That file isn’t an image we can read. Try a JPEG or PNG.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(512, side);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas
    .getContext("2d")
    ?.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("That image couldn’t be prepared.")),
      "image/jpeg",
      0.9,
    ),
  );
}

export function ProfilePage() {
  const { user, preview, base } = useConsole();
  const client = useQueryClient();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const saved = (next: User) => client.setQueryData(["session"], next);

  const [first, setFirst] = useState(user.first_name ?? "");
  const [last, setLast] = useState(user.last_name ?? "");
  const rename = useMutation({
    mutationFn: () =>
      api<User>("auth/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ first_name: first.trim(), last_name: last.trim() }),
      }),
    onSuccess: saved,
  });
  const unchanged =
    first.trim() === (user.first_name ?? "") && last.trim() === (user.last_name ?? "");

  const upload = useMutation({
    mutationFn: async (picked: File) =>
      api<User>("auth/me/photo", {
        method: "POST",
        body: await squarePhoto(picked),
        headers: { "Content-Type": "image/jpeg" },
      }),
    onSuccess: saved,
  });
  const removePhoto = useMutation({
    mutationFn: () => api<User>("auth/me/photo/delete", { method: "POST" }),
    onSuccess: saved,
  });

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const changePassword = useMutation({
    mutationFn: () =>
      api("auth/password/change", {
        method: "POST",
        body: JSON.stringify({ current_password: current, new_password: next }),
      }),
    // Every session has ended, this one included: start again from sign-in.
    onSuccess: async () => {
      await wipeLocalData(client);
      useConsoleStore.getState().reset();
      router.replace("/sign-in");
    },
  });

  function submitPassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    if (new TextEncoder().encode(next).length < 12)
      return setPasswordError("Use at least 12 characters.");
    if (next !== confirm) return setPasswordError("The new passwords don’t match.");
    changePassword.mutate();
  }

  const photoError = upload.error ?? removePhoto.error;
  return (
    <>
      <PageHeading
        title="Profile"
        description="How you appear in the console, and the password you sign in with."
      />

      <section className="console-card profile-identity">
        <div className="profile-photo">
          <Avatar user={user} size={96} />
          <div className="profile-photo-actions">
            <button
              type="button"
              className="console-button"
              disabled={preview || upload.isPending}
              onClick={() => file.current?.click()}
            >
              <Camera size={16} />{" "}
              {upload.isPending
                ? "Uploading…"
                : user.photo_path
                  ? "Change photo"
                  : "Add photo"}
            </button>
            {user.photo_path ? (
              <button
                type="button"
                className="console-secondary console-button"
                disabled={preview || removePhoto.isPending}
                onClick={() => removePhoto.mutate()}
              >
                <Trash2 size={16} /> Remove
              </button>
            ) : null}
            <input
              ref={file}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(event) => {
                const picked = event.target.files?.[0];
                event.target.value = "";
                if (picked) upload.mutate(picked);
              }}
            />
          </div>
        </div>
        <div className="profile-who">
          <h2>{nameOf(user)}</h2>
          {nameOf(user) !== user.email ? <p>{user.email}</p> : null}
          <div className="profile-tags">
            <span className="profile-tag strong">
              {roleLabels[user.role as StaffRole] ?? user.role}
            </span>
            {user.email_verified ? (
              <span className="profile-tag">
                <BadgeCheck size={14} /> Email verified
              </span>
            ) : null}
            <span className="profile-tag">
              <ShieldCheck size={14} />{" "}
              {user.mfa_enabled ? "Two-step sign-in on" : "Two-step sign-in off"}
            </span>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Member since</dt>
              <dd>{dateLabel(user.created_at)}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd className="mono">{user.id.slice(0, 8)}</dd>
            </div>
          </dl>
        </div>
        {photoError ? (
          <p className="console-alert error profile-alert" role="alert">
            {photoError.message}
          </p>
        ) : null}
      </section>

      <div className="profile-grid">
        <section className="console-card profile-card">
          <div className="card-heading">
            <h2>Your name</h2>
          </div>
          <p className="field-hint">
            Shown to your team in the console instead of your email.
          </p>
          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              rename.mutate();
            }}
          >
            <div className="profile-pair">
              <div className="field">
                <label htmlFor="first-name">First name</label>
                <input
                  id="first-name"
                  value={first}
                  maxLength={50}
                  autoComplete="given-name"
                  required
                  onChange={(event) => setFirst(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="last-name">Last name</label>
                <input
                  id="last-name"
                  value={last}
                  maxLength={50}
                  autoComplete="family-name"
                  required
                  onChange={(event) => setLast(event.target.value)}
                />
              </div>
            </div>
            {rename.isError ? (
              <p className="field-error" role="alert">
                {rename.error.message}
              </p>
            ) : rename.isSuccess && unchanged ? (
              <p className="field-hint" role="status">
                Saved.
              </p>
            ) : null}
            <div className="profile-submit">
              <button
                className="console-button"
                disabled={
                  preview ||
                  rename.isPending ||
                  unchanged ||
                  !first.trim() ||
                  !last.trim()
                }
              >
                {rename.isPending ? "Saving…" : "Save name"}
              </button>
            </div>
          </form>
        </section>

        <section className="console-card profile-card">
          <div className="card-heading">
            <h2>Password</h2>
            <KeyRound size={20} />
          </div>
          {user.has_password === false ? (
            <p className="field-hint">
              You sign in with Google, so there’s no password to change here.
            </p>
          ) : (
            <form className="profile-form" onSubmit={submitPassword}>
              <p className="field-hint">
                Changing it signs you out on every device, this one included.
              </p>
              <div className="field">
                <label htmlFor="current-password">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  required
                  onChange={(event) => setCurrent(event.target.value)}
                />
              </div>
              <div className="profile-pair">
                <div className="field">
                  <label htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={next}
                    minLength={12}
                    maxLength={128}
                    required
                    onChange={(event) => setNext(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirm-password">Confirm new password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    required
                    onChange={(event) => setConfirm(event.target.value)}
                  />
                </div>
              </div>
              {(passwordError || changePassword.isError) && (
                <p className="field-error" role="alert">
                  {passwordError ?? changePassword.error?.message}
                </p>
              )}
              <div className="profile-submit">
                <button
                  className="console-button"
                  disabled={
                    preview || changePassword.isPending || !current || !next || !confirm
                  }
                >
                  {changePassword.isPending ? "Changing…" : "Change password"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <Link href={`${base}/security`} className="console-card profile-link">
        <ShieldCheck size={22} />
        <span>
          <strong>Sign-in and security</strong>
          <small>Two-step sign-in, passkeys and the devices you’re signed in on.</small>
        </span>
        <ArrowRight size={18} />
      </Link>
    </>
  );
}
