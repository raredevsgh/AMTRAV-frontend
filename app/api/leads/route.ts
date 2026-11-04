// The landing page's forms post here; only the expected fields go on to the API's public
// leads endpoint, which validates, deduplicates and rate-limits them.
import { preflight, protect } from "@/lib/api-guard";
import { isSameOrigin } from "@/lib/console/policy";

const FIELDS = [
  "kind",
  "name",
  "email",
  "company",
  "country",
  "product",
  "message",
  "website",
] as const;
const LIMIT = 8 * 1024;

const json = (body: object, status: number) => Response.json(body, { status });

async function handle(request: Request) {
  if (!isSameOrigin(request))
    return json({ error: "Please send the form from this site." }, 403);
  const text = await request.text();
  if (text.length > LIMIT) return json({ error: "That message is too long." }, 413);
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(text);
  } catch {
    return json({ error: "Please fill in the form again." }, 400);
  }
  const body: Record<string, string> = {};
  for (const field of FIELDS) {
    const value = input[field];
    if (typeof value === "string" && value.trim()) body[field] = value;
  }
  const origin = process.env.BACKEND_API_URL || "http://127.0.0.1:8090/api/v1";
  let upstream: Response;
  try {
    upstream = await fetch(`${origin.replace(/\/$/, "")}/public/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return json(
      { error: "We couldn’t reach our servers. Please try again in a moment." },
      503,
    );
  }
  if (upstream.status === 204) return new Response(null, { status: 204 });
  if (upstream.status === 429)
    return json({ error: "Thanks, we already have this. Please try again later." }, 429);
  if (upstream.status === 422)
    return json({ error: "Please check the form and try again." }, 400);
  const error = await upstream
    .json()
    .then((value: { error?: string }) => value.error)
    .catch(() => undefined);
  return json(
    { error: error || "Something went wrong. Please try again." },
    upstream.status >= 500 ? 503 : 400,
  );
}

// A handful of forms per visitor every ten minutes; same-origin only.
export const POST = protect(handle, () => ({ bucket: "leads", cors: "same-origin" }));
export const OPTIONS = (request: Request) => preflight(request, "same-origin", ["POST"]);
