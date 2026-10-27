"use client";
import { useCallback, useState } from "react";
import { useConsole, useResource } from "./console-context";
import { ClaimHandoff } from "./claim-handoff";
import {
  SectionPage,
  ButtonLink,
  Notice,
  Field,
  ErrorState,
  LoadingState,
} from "@/components/console-ui";
import { registrationErrors } from "@/lib/api/validation";
import type { ProvisionedDevice, RegisterDevice } from "@/lib/api/types";
export function DeviceRegistration() {
  const api = useConsole();
  const admin = api.session.role === "admin";
  const load = useCallback(
    () =>
      admin
        ? api.listUsers({ limit: 50 })
        : Promise.resolve({ items: [api.session], limit: 50, offset: 0 }),
    [api, admin],
  );
  const { data, error, loading, retry } = useResource(load);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProvisionedDevice | null>(null);
  return (
    <SectionPage
      title={result ? "Registration complete" : "Register device"}
      description={
        result
          ? "Keep the one-time code secure before leaving this page."
          : "Add a registry record and receive its one-time claim code."
      }
    >
      {loading ? (
        <LoadingState label="Loading manufacturer context" />
      ) : result ? (
        <ClaimHandoff result={result} onAnother={() => setResult(null)} />
      ) : (
        <div className="split">
          <section className="panel panel-body">
            {error ? (
              <ErrorState error={error} retry={retry} />
            ) : (
              <form
                className="form-grid"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const values = new FormData(e.currentTarget);
                  const input: RegisterDevice = {
                    serial_number: String(values.get("serial_number") || ""),
                    model: String(values.get("model") || ""),
                    firmware_version: String(
                      values.get("firmware_version") || "",
                    ),
                  };
                  if (admin)
                    input.manufacturer_id = String(
                      values.get("manufacturer_id") || "",
                    );
                  const next = registrationErrors(input);
                  if (admin && !input.manufacturer_id)
                    next.manufacturer_id = "Select a manufacturer account.";
                  setErrors(next);
                  setFailure(null);
                  if (Object.keys(next).length) return;
                  setBusy(true);
                  try {
                    setResult(await api.registerDevice(input));
                  } catch (error) {
                    setFailure(error);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h2>Device registration</h2>
                <p className="small muted">All fields are required.</p>
                {failure != null && <ErrorState error={failure} />}
                <Field
                  label="Serial number"
                  name="serial_number"
                  error={errors.serial_number}
                  hint="Use a unique serial. Saved uppercase; 6–64 ASCII letters, digits, hyphens or underscores."
                >
                  <input
                    id="serial_number"
                    name="serial_number"
                    className="mono"
                    aria-invalid={Boolean(errors.serial_number)}
                    aria-describedby={
                      errors.serial_number
                        ? "serial_number-error"
                        : "serial_number-hint"
                    }
                    disabled={busy}
                  />
                </Field>
                <div className="two-cols">
                  <Field label="Model" name="model" error={errors.model}>
                    <input
                      id="model"
                      name="model"
                      aria-invalid={Boolean(errors.model)}
                      aria-describedby={
                        errors.model ? "model-error" : undefined
                      }
                      disabled={busy}
                    />
                  </Field>
                  <Field
                    label="Declared firmware version"
                    name="firmware_version"
                    error={errors.firmware_version}
                    hint="Registry metadata, not a live device reading."
                  >
                    <input
                      id="firmware_version"
                      name="firmware_version"
                      aria-invalid={Boolean(errors.firmware_version)}
                      aria-describedby={
                        errors.firmware_version
                          ? "firmware_version-error"
                          : "firmware_version-hint"
                      }
                      disabled={busy}
                    />
                  </Field>
                </div>
                {admin ? (
                  <Field
                    label="Manufacturer account"
                    name="manufacturer_id"
                    error={errors.manufacturer_id}
                    hint="Choose a manufacturer from the first 50 loaded accounts."
                  >
                    <select
                      id="manufacturer_id"
                      name="manufacturer_id"
                      disabled={busy}
                      aria-invalid={Boolean(errors.manufacturer_id)}
                      aria-describedby={
                        errors.manufacturer_id
                          ? "manufacturer_id-error"
                          : "manufacturer_id-hint"
                      }
                    >
                      <option value="">Select a manufacturer</option>
                      {data?.items
                        .filter((user) => user.role === "manufacturer")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.email}
                          </option>
                        ))}
                    </select>
                  </Field>
                ) : (
                  <Notice title="Registration manufacturer is assigned automatically">
                    <p>{api.session.email}</p>
                    <p className="mono">Your account UUID · {api.session.id}</p>
                    You cannot register for another manufacturer.
                  </Notice>
                )}
                <Notice title="Prepare a secure handoff" tone="warning">
                  The code is shown only in the creation result. Save and share
                  it privately. An eligible unclaimed device can receive a
                  replacement.
                </Notice>
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={busy}>
                    {busy ? "Registering…" : "Register device"}
                  </button>
                  <ButtonLink href="/devices" secondary>
                    Cancel
                  </ButtonLink>
                </div>
              </form>
            )}
          </section>
          <aside className="panel panel-body stack">
            <h2>How claiming works</h2>
            <ol className="steps">
              <li>Register the serial here and copy the one-time code.</li>
              <li>Share the serial and code securely with the buyer.</li>
              <li>
                The buyer claims in the Amortrav mobile app. Ownership is
                assigned and the code stops working.
              </li>
            </ol>
            <p className="small muted">
              Ownership proof, not hardware authentication. This workspace is a
              local demonstration.
            </p>
          </aside>
        </div>
      )}
    </SectionPage>
  );
}
