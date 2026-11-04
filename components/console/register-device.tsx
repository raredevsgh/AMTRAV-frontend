"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, KeyRound, LoaderCircle, Plus } from "lucide-react";
import { api } from "@/lib/console/api";
import type { ProvisionedDevice } from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsole, useUsers } from "./provider";
import { PageHeading } from "./shared";

const svgSource = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function ClaimCode({ result }: { result: ProvisionedDevice }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.claim_code);
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section className="claim-result" role="status">
      <span className="auth-lock">
        <KeyRound size={22} />
      </span>
      <h2>Save this claim code.</h2>
      <p>
        It is shown only now. Print the QR code on the packaging, or store the code
        securely with the device. Travellers scan it in the Amortrav app to add the bag.
      </p>
      <div className="claim-label">
        {result.qr_svg && (
          // Highest error correction, so the centred mark still scans.
          <span className="label-qr">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG; an <img> cannot run scripts */}
            <img
              src={svgSource(result.qr_svg)}
              alt={`Claim QR code for ${result.device.serial_number}`}
              width={168}
              height={168}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- small static mark */}
            <img className="label-qr-mark" src="/images/console-mark.png" alt="" width={40} height={40} />
          </span>
        )}
        <dl>
          <div>
            <dt>Serial number</dt>
            <dd className="mono">{result.device.serial_number}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{result.device.model}</dd>
          </div>
        </dl>
      </div>
      <code aria-label="Claim code">{result.claim_code}</code>
      <Button className="console-button" onClick={copy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy claim code"}
      </Button>
      {copyError && <p>Select the code above and copy it manually.</p>}
    </section>
  );
}

type Fields = {
  serial_number: string;
  model: string;
  firmware_version: string;
  manufacturer_id?: string;
};

export function RegisterDevicePage() {
  const { base, user, preview } = useConsole();
  const users = useUsers();
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>();
  const mutation = useMutation({
    mutationFn: (values: Fields) => {
      const body = {
        ...values,
        serial_number: values.serial_number.trim().toUpperCase(),
      };
      if (user.role !== "admin") delete body.manufacturer_id;
      return api<ProvisionedDevice>("devices", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["devices"] }),
  });
  return (
    <>
      <Link className="console-back" href={base}>
        <ArrowLeft size={16} /> Back to devices
      </Link>
      <PageHeading
        title="Register a device"
        description="Add a bag to the registry and get its one-time claim code for the buyer."
      />
      {mutation.data ? (
        <>
          <ClaimCode result={mutation.data} />
          <Link
            className="console-button self-start"
            href={`${base}/devices/${mutation.data.device.id}`}
          >
            Open device
          </Link>
          <Button
            className="console-secondary self-start"
            onClick={() => mutation.reset()}
          >
            Register another
          </Button>
        </>
      ) : (
        <div className="console-form-layout">
          <form
            className="console-card console-form"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="field">
              <Label htmlFor="serial">Serial number</Label>
              <Input
                id="serial"
                placeholder="AMT-CO55-00F3B4"
                {...register("serial_number", {
                  required: "Enter a serial number.",
                  pattern: {
                    value: /^[A-Za-z0-9_-]{6,64}$/,
                    message: "Use 6–64 letters, numbers, hyphens or underscores.",
                  },
                })}
                aria-invalid={!!errors.serial_number}
              />
              <p>6 to 64 letters, digits, hyphens or underscores. Saved uppercase.</p>
              {errors.serial_number && (
                <span className="field-error">{errors.serial_number.message}</span>
              )}
            </div>
            <div className="field">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Carry-On 55"
                maxLength={128}
                {...register("model", {
                  required: true,
                  validate: (value) => value.trim().length > 0,
                })}
                aria-invalid={!!errors.model}
              />
            </div>
            <div className="field">
              <Label htmlFor="firmware">Firmware version</Label>
              <Input
                id="firmware"
                placeholder="1.4.2"
                maxLength={64}
                {...register("firmware_version", {
                  required: true,
                  validate: (value) => value.trim().length > 0,
                })}
                aria-invalid={!!errors.firmware_version}
              />
            </div>
            {user.role === "admin" && (
              <div className="field">
                <Label htmlFor="maker">Manufacturer</Label>
                <select
                  id="maker"
                  {...register("manufacturer_id", { required: true })}
                  aria-invalid={!!errors.manufacturer_id}
                >
                  <option value="">Choose a manufacturer</option>
                  {users.data
                    ?.filter((u) => u.role === "manufacturer")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                </select>
                <p>Registering on behalf of this manufacturer.</p>
                {users.isError && (
                  <p className="field-error">
                    Could not load manufacturers.{" "}
                    <button type="button" onClick={() => users.refetch()}>
                      Try again
                    </button>
                  </p>
                )}
              </div>
            )}
            {mutation.isError && (
              <p className="console-alert error" role="alert">
                {mutation.error.message}
              </p>
            )}
            {preview && <p className="field-hint">Sign in to register real devices.</p>}
            <Button
              className="console-button self-start"
              type="submit"
              disabled={preview || mutation.isPending}
            >
              {mutation.isPending ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Plus size={17} />
              )}
              {mutation.isPending ? "Registering…" : "Register device"}
            </Button>
          </form>
          <aside className="console-card registration-help">
            <KeyRound size={26} />
            <h2>How claiming works</h2>
            <ol>
              <li>
                <b>Register the serial</b>
                <p>Save the one-time code with the bag’s claim card.</p>
              </li>
              <li>
                <b>The buyer opens the app</b>
                <p>They enter the serial and code to claim their bag.</p>
              </li>
              <li>
                <b>One bag, one owner</b>
                <p>The code stops working as soon as ownership is claimed.</p>
              </li>
            </ol>
            <p className="small-note">
              Claim codes prove ownership. Share them only with the buyer.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
