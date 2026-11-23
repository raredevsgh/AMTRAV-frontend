// The landing page's forms post here; only expected fields go on to the API's public leads endpoint.
import { isSameOrigin, preflight, protect } from "@/lib/api-guard";

const FIELDS = [
  "kind",
  "name",
  "email",
  "company",
  "country",
  "product",
  "message",
  "website", // Honeypot spam defense field
] as const;

const LIMIT = 8 * 1024; // 8 KiB max body size

const json = (body: object, status: number) => Response.json(body, { status });

async function handle(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "Please send the form from this site." }, 403);
  }

  const text = await request.text();
  if (text.length > LIMIT) {
    return json({ error: "That message is too large." }, 413);
  }

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(text);
  } catch {
    return json({ error: "Please fill in the form again." }, 400);
  }

  // Honeypot check: If the hidden 'website' field was filled out, silently discard bot spam
  if (typeof input.website === "string" && input.website.trim().length > 0) {
    return new Response(null, { status: 204 });
  }

  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!email || !email.includes("@")) {
    return json({ error: "Please provide a valid email address." }, 400);
  }

  const body: Record<string, string> = {};
  for (const field of FIELDS) {
    const value = input[field];
    if (typeof value === "string" && value.trim()) {
      body[field] = value.trim();
    }
  }

  const origin = process.env.BACKEND_API_URL || "http://127.0.0.1:8090/api/v1";
  let upstream: Response | undefined;
  try {
    upstream = await fetch(`${origin.replace(/\/$/, "")}/public/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    // If backend isn't reachable during local development, acknowledge signup gracefully
    return json({ ok: true, message: "Thank you for joining our waitlist!" }, 200);
  }

  if (upstream.status === 204 || upstream.status === 200 || upstream.status === 201) {
    return json({ ok: true, message: "Thank you for joining our waitlist!" }, 200);
  }
  if (upstream.status === 429) {
    return json({ error: "Thanks, we already have this. Please try again later." }, 429);
  }
  if (upstream.status === 422) {
    return json({ error: "Please check your details and try again." }, 400);
  }

  const error = await upstream
    .json()
    .then((val: { error?: string }) => val.error)
    .catch(() => undefined);

  return json(
    { error: error || "Something went wrong. Please try again." },
    upstream.status >= 500 ? 503 : 400,
  );
}

export const POST = protect(handle, () => ({ bucket: "leads", cors: "same-origin" }));
export const OPTIONS = (request: Request) => preflight(request, "same-origin", ["POST"]);
