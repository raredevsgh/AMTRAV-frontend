// Production-build mock acceptance. Set AMTRAV_PLAYWRIGHT_MODULE to an installed Playwright module.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const { chromium, webkit } = await import(
  process.env.AMTRAV_PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.AMTRAV_CONSOLE_URL || "http://localhost:3151";
const closed = process.env.AMTRAV_CONSOLE_CLOSED_URL || "http://localhost:3152";
const output =
  process.env.AMTRAV_CONSOLE_OUTPUT ||
  "/private/tmp/amtrav-console-evidence/browser";
const engines = (process.env.AMTRAV_CONSOLE_ENGINES || "chromium,webkit").split(
  ",",
);
const id = "10000000-0000-4000-8000-000000000003";
const manufacturer = "00000000-0000-4000-8000-000000000002";
const results = [],
  axeResults = [],
  measurements = [];
mkdirSync(output, { recursive: true });
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: String(error.stack || error) });
    console.log("FAIL", name, String(error.message || error));
  }
}
const check = (name, condition, detail) => {
  results.push({ name, passed: Boolean(condition), detail });
  if (!condition)
    console.log(
      "FAIL",
      name,
      typeof detail === "string" ? detail : JSON.stringify(detail ?? ""),
    );
};
async function ready(p, route) {
  await p.goto(base + route);
  await p.locator("h1").first().waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.locator(".loading-state").waitFor({ state: "detached" });
  await p.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function shot(p, name) {
  await p.screenshot({ path: join(output, name + ".png"), fullPage: true });
}
async function audit(p, name) {
  if (!process.env.AMTRAV_AXE_PATH) return;
  await p.addScriptTag({ path: process.env.AMTRAV_AXE_PATH });
  const data = await p.evaluate(() =>
    axe
      .run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      })
      .then((r) => ({
        violations: r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            reason: n.failureSummary,
          })),
        })),
        incomplete: r.incomplete.map((v) => v.id),
      })),
  );
  axeResults.push({ name, ...data });
  check(name + ": axe", data.violations.length === 0, data.violations);
}
async function contextFor(browser, role = "admin", width = 1440) {
  const c = await browser.newContext({
    viewport: { width, height: 900 },
    acceptDownloads: true,
  });
  await c.addCookies([
    {
      name: "amtrav_console_demo",
      value: role,
      url: base,
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
  return c;
}
async function withDemo(browser, role, fn, width = 1440) {
  const c = await contextFor(browser, role, width);
  try {
    await fn(await c.newPage(), c);
  } finally {
    await c.close();
  }
}
for (const engine of engines) {
  const browser =
    engine === "chromium"
      ? await chromium.launch({ channel: "chrome", headless: true })
      : await webkit.launch({ headless: true });
  try {
    if (!process.argv.includes("--flows-only"))
      for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920])
        for (const role of ["admin", "manufacturer"]) {
          const c = await contextFor(browser, role, width);
          const p = await c.newPage();
          const errors = [];
          p.on("pageerror", (e) => errors.push(String(e)));
          p.on("console", (m) => {
            if (m.type() === "error") errors.push(m.text());
          });
          p.on("response", (r) => {
            if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
          });
          await p.addInitScript(() => {
            window.qaMetrics = { lcp: 0, cls: 0 };
            new PerformanceObserver((l) => {
              for (const e of l.getEntries())
                window.qaMetrics.lcp = e.startTime;
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((l) => {
              for (const e of l.getEntries())
                if (!e.hadRecentInput) window.qaMetrics.cls += e.value;
            }).observe({ type: "layout-shift", buffered: true });
          });
          for (const route of [
            "/login",
            "/devices",
            "/devices/new",
            `/devices/${id}`,
            "/users",
            "/files",
          ]) {
            errors.length = 0;
            await ready(p, route);
            const name = `${engine} ${role} ${width} ${route}`;
            const state = await p.evaluate(() => ({
              width: innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
              main: document.querySelectorAll("main").length,
              h1: document.querySelectorAll("h1").length,
              font: getComputedStyle(document.body).fontFamily,
              ...window.qaMetrics,
              js: performance
                .getEntriesByType("resource")
                .filter((e) => e.name.includes(".js"))
                .reduce((s, e) => s + e.decodedBodySize, 0),
            }));
            check(
              name + ": no document overflow",
              state.width === state.scrollWidth,
              state,
            );
            check(
              name + ": one main/h1",
              state.main === 1 && state.h1 === 1,
              state,
            );
            check(
              name + ": Manrope",
              state.font.includes("Manrope"),
              state.font,
            );
            if (route !== "/login") {
              check(
                name + ": demo labeled",
                (await p.locator(".demo-banner").count()) === 1,
              );
              const accounts = await p
                .locator('.sidebar a[href="/users"]')
                .count();
              check(
                name + ": scoped navigation",
                role === "admin" ? accounts === 1 : accounts === 0,
              );
              if (route === "/users" && role === "manufacturer")
                check(
                  name + ": no account data",
                  (await p
                    .getByRole("heading", { name: "You don’t have access" })
                    .count()) === 1 && (await p.locator("table").count()) === 0,
                );
              else {
                const active = await p
                  .locator('.sidebar nav [aria-current="page"]')
                  .getAttribute("href");
                check(
                  name + ": active route",
                  active ===
                    (route.startsWith("/devices/") && route !== "/devices/new"
                      ? "/devices"
                      : route),
                  active,
                );
              }
            }
            check(name + ": no browser/network errors", errors.length === 0, [
              ...errors,
            ]);
            measurements.push({ name, ...state });
            await shot(
              p,
              `${engine}-${role}-${width}-${route.slice(1).replaceAll("/", "-")}`,
            );
            await p.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
            if (route !== "/login")
              check(
                name + ": reachable sticky header",
                await p
                  .locator(".page-header")
                  .evaluate((e) => e.getBoundingClientRect().top >= -1),
              );
            if (
              (width === 390 || width === 1440) &&
              role === "admin" &&
              [
                "/login",
                "/devices",
                "/files",
                "/users",
                "/devices/new",
              ].includes(route)
            )
              await audit(p, name);
          }
          await c.close();
        }
    await test(
      engine + ": sign-in validation, errors, pending and safe demo success",
      async () => {
        const c = await browser.newContext({
          viewport: { width: 1440, height: 900 },
        });
        try {
          const p = await c.newPage();
          const sent = [];
          p.on("request", (r) => {
            if (r.method() === "POST") sent.push(r.postData() || "");
          });
          await ready(p, "/login");
          await p.getByRole("button", { name: "Enter demo workspace" }).click();
          assert.equal(await p.locator("[aria-invalid=true]").count(), 2);
          await p.locator("#email").fill("invalid");
          await p.locator("#password").fill("fictional-browser-password");
          await p.getByRole("button", { name: "Enter demo workspace" }).click();
          assert.equal(
            await p.locator("#email").getAttribute("aria-invalid"),
            "true",
          );
          await p.locator("#email").fill("ops@amortrav.example.invalid");
          await p
            .getByText("Demo access & preview states", { exact: true })
            .click();
          for (const [value, text] of [
            ["invalid", "Email or password is incorrect"],
            ["rate", "Too many sign-in attempts"],
            ["unavailable", "We can’t connect right now"],
          ]) {
            await p.getByLabel("Sign-in state").selectOption(value);
            await p
              .getByRole("button", { name: "Enter demo workspace" })
              .click();
            await p.getByRole("alert").filter({ hasText: text }).waitFor();
          }
          await shot(p, engine + "-login-unavailable");
          await p.getByLabel("Sign-in state").selectOption("normal");
          await p.route("**/login", async (r) => {
            if (r.request().method() === "POST")
              await new Promise((resolve) => setTimeout(resolve, 250));
            await r.continue();
          });
          const signing = p
            .getByRole("button", { name: "Enter demo workspace" })
            .click();
          await p.getByRole("button", { name: "Signing in…" }).waitFor();
          await signing;
          await p.waitForURL("**/devices");
          await p.getByRole("table").waitFor();
          assert.ok(
            sent.every((body) => !body.includes("fictional-browser-password")),
          );
          const cookies = await c.cookies();
          const demo = cookies.find((c) => c.name === "amtrav_console_demo");
          assert.ok(demo?.httpOnly && demo.sameSite === "Strict");
          assert.ok(
            !cookies.some((c) => /access_token|refresh_token/.test(c.name)),
          );
        } finally {
          await c.close();
        }
      },
    );
    await test(
      engine + ": default-disabled access and forged demo cookie fail closed",
      async () => {
        const c = await browser.newContext();
        try {
          await c.addCookies([
            {
              name: "amtrav_console_demo",
              value: "admin",
              url: closed,
              httpOnly: true,
            },
          ]);
          const p = await c.newPage();
          await p.goto(closed + "/devices");
          await p.waitForURL("**/login?reason=session");
          assert.equal(await p.locator(".demo-banner").count(), 0);
          assert.equal(
            await p
              .getByRole("button", { name: "Enter demo workspace" })
              .count(),
            0,
          );
          await p.locator("#email").fill("staff@example.invalid");
          await p.locator("#password").fill("fictional-browser-password");
          await p.getByRole("button", { name: "Sign in", exact: true }).click();
          await p
            .getByRole("alert")
            .filter({ hasText: "not connected" })
            .waitFor();
          assert.ok(p.url().includes("/login"));
          assert.equal(await p.locator("tbody").count(), 0);
          await shot(p, engine + "-default-closed");
        } finally {
          await c.close();
        }
      },
    );
    await test(
      engine +
        ": inventory filtering, page boundaries and edit/revoke lifecycle",
      () =>
        withDemo(browser, "admin", async (p) => {
          await ready(p, "/devices");
          assert.equal(await p.locator(".metric-card").count(), 4);
          await p.getByLabel("Trend range").selectOption("4");
          assert.match(
            (await p.locator(".registry-chart").getAttribute("aria-label")) || "",
            /4-week registry trend/,
          );
          assert.equal(
            await p.getByLabel("Claim dates in October 2026").count(),
            1,
          );
          assert.equal(await p.locator("tbody tr").count(), 8);
          await p.getByLabel("Search current page").fill("amt-c055-00f3a1");
          assert.equal(await p.locator("tbody tr").count(), 1);
          await p.getByLabel("Search current page").fill("carry-on");
          assert.equal(await p.locator("tbody tr").count(), 3);
          await p.getByLabel("Search current page").fill("no-match");
          await p
            .getByRole("heading", { name: "No matching devices" })
            .waitFor();
          await p.getByRole("button", { name: "Clear search" }).click();
          await p.getByLabel("Device status").selectOption("claimed");
          assert.equal(await p.locator("tbody tr").count(), 4);
          await p.getByLabel("Device status").selectOption("all");
          await p.getByLabel("Page size").selectOption("5");
          await p
            .getByText("5 records on this page · Offset 0", { exact: true })
            .waitFor();
          await p.getByRole("button", { name: "Next", exact: true }).click();
          await p
            .getByText("3 records on this page · Offset 5", { exact: true })
            .waitFor();
          assert.equal(
            await p
              .getByRole("button", { name: "Next", exact: true })
              .isDisabled(),
            true,
          );
          await p
            .getByRole("button", { name: "Previous", exact: true })
            .click();
          await p.getByLabel("Page size").selectOption("50");
          await p
            .getByRole("link", { name: "View AMT-C055-00F3A1", exact: true })
            .click();
          await p
            .getByRole("heading", { name: "Identity & ownership" })
            .waitFor();
          assert.ok(
            await p
              .getByRole("button", { name: "Replace claim code" })
              .isDisabled(),
          );
          await p.getByRole("button", { name: "Edit metadata" }).click();
          await p.locator("#model").fill("Cancelled edit");
          await p.getByRole("button", { name: "Cancel editing" }).click();
          assert.equal(
            await p.getByText("Cancelled edit", { exact: true }).count(),
            0,
          );
          await p.getByRole("button", { name: "Edit metadata" }).click();
          await p.locator("#model").fill("Carry-On 55 QA");
          await p.getByRole("button", { name: "Save metadata" }).click();
          await p.getByText("Carry-On 55 QA", { exact: true }).waitFor();
          await p.getByText("metadata_updated", { exact: true }).waitFor();
          await shot(p, engine + "-device-edited");
          await p
            .getByRole("button", { name: "Revoke device", exact: true })
            .click();
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
          assert.ok(
            !(await p
              .getByRole("button", { name: "Revoke device", exact: true })
              .isDisabled()),
          );
          await p
            .getByRole("button", { name: "Revoke device", exact: true })
            .click();
          await audit(p, engine + " revoke confirmation");
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Revoke device", exact: true })
            .click();
          await p.locator(".status-revoked").waitFor();
          assert.equal(
            await p.getByRole("button", { name: "Edit metadata" }).count(),
            0,
          );
          assert.ok(
            await p
              .getByRole("button", { name: "Replace claim code" })
              .isDisabled(),
          );
          await ready(p, "/devices/10000000-0000-4000-8000-999999999999");
          await p
            .getByRole("alert")
            .filter({ hasText: "could not be found" })
            .waitFor();
        }),
    );
    await test(
      engine +
        ": registration validation, duplicate, one-time handoff and rotation",
      () =>
        withDemo(browser, "admin", async (p) => {
          await ready(p, "/devices/new");
          await p
            .getByRole("button", { name: "Register device", exact: true })
            .click();
          assert.equal(await p.locator("[aria-invalid=true]").count(), 4);
          await audit(p, engine + " registration validation");
          await p.locator("#serial_number").fill("AMT-C055-00F3A1");
          await p.locator("#model").fill("Carry-On 55");
          await p.locator("#firmware_version").fill("1.4.2");
          await p.locator("#manufacturer_id").selectOption(manufacturer);
          await p
            .getByRole("button", { name: "Register device", exact: true })
            .click();
          await p
            .getByRole("alert")
            .filter({ hasText: "already exists" })
            .waitFor();
          await p.locator("#serial_number").fill("amt-qa-" + engine);
          await p
            .getByRole("button", { name: "Register device", exact: true })
            .click();
          await p
            .getByRole("heading", { name: "Registration complete" })
            .waitFor();
          const code = await p.getByTestId("claim-code").textContent();
          assert.equal(code.length, 64);
          assert.ok(
            await p
              .getByRole("button", { name: "View device", exact: true })
              .isDisabled(),
          );
          await p.getByRole("button", { name: "Copy serial + code" }).click();
          await p
            .getByRole("status")
            .filter({ hasText: /copied|Copy is unavailable/ })
            .waitFor();
          await shot(p, engine + "-registration-success");
          await p.getByRole("link", { name: "Devices", exact: true }).click();
          await p
            .getByRole("dialog")
            .getByRole("heading", { name: "Leave the one-time code?" })
            .waitFor();
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
          assert.equal(await p.getByTestId("claim-code").count(), 1);
          await p
            .getByRole("checkbox", {
              name: "I have saved this example code securely",
            })
            .check();
          await p
            .getByRole("button", { name: "View device", exact: true })
            .click();
          await p
            .getByRole("heading", { name: "Identity & ownership" })
            .waitFor();
          await p.getByRole("button", { name: "Replace claim code" }).click();
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Replace code", exact: true })
            .click();
          await p.getByTestId("claim-code").waitFor();
          assert.notEqual(
            await p.getByTestId("claim-code").textContent(),
            code,
          );
          await p
            .getByRole("checkbox", {
              name: "I have saved this example code securely",
            })
            .check();
          await p
            .getByRole("button", { name: "Back to details", exact: true })
            .click();
          await p.getByText("claim_code_rotated", { exact: true }).waitFor();
          await p.goBack();
          await p.locator("#serial_number").waitFor();
          assert.equal(await p.getByTestId("claim-code").count(), 0);
        }),
    );
    await test(
      engine +
        ": Accounts confirmation, self/mobile boundaries and asynchronous jobs",
      () =>
        withDemo(browser, "admin", async (p) => {
          await ready(p, "/users");
          assert.equal(await p.locator("tbody tr").count(), 5);
          await p.getByRole("button", { name: "Staff", exact: true }).click();
          assert.equal(await p.locator("tbody tr").count(), 2);
          await p
            .getByRole("button", { name: "Manufacturers", exact: true })
            .click();
          assert.equal(await p.locator("tbody tr").count(), 2);
          await p
            .getByRole("button", { name: "All accounts", exact: true })
            .click();
          assert.equal(
            await p.getByLabel("Role for ops@amortrav.example.invalid").count(),
            0,
          );
          assert.equal(
            await p
              .getByLabel("Role for traveler@amtrav.example.invalid")
              .count(),
            0,
          );
          const role = p.getByLabel(
            "Role for factory@northline.example.invalid",
          );
          await role.selectOption("admin");
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
          assert.equal(await role.inputValue(), "manufacturer");
          await role.selectOption("admin");
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Change role", exact: true })
            .click();
          await p.waitForFunction(
            () =>
              document.querySelector(
                'select[aria-label="Role for factory@northline.example.invalid"]',
              )?.value === "admin",
          );
          await p.locator("#manufacturer-email").fill("new@qa.example.invalid");
          await p.locator("#temporary-password").fill("short");
          await p
            .getByRole("button", { name: "Create manufacturer", exact: true })
            .click();
          await p
            .getByText("Use 12–128 UTF-8 bytes, not character count.", {
              exact: true,
            })
            .waitFor();
          await p
            .locator("#temporary-password")
            .fill("fictional-browser-password");
          await p
            .getByRole("button", { name: "Create manufacturer", exact: true })
            .click();
          await p
            .getByRole("status")
            .filter({ hasText: "Creation queued" })
            .waitFor();
          assert.equal(
            await p
              .getByText("new@qa.example.invalid", { exact: true })
              .count(),
            0,
          );
          assert.equal(await p.locator("#temporary-password").inputValue(), "");
          await p
            .getByText("new@qa.example.invalid", { exact: true })
            .waitFor();
          await shot(p, engine + "-manufacturer-created");
          await p.locator("#manufacturer-email").fill("new@qa.example.invalid");
          await p
            .locator("#temporary-password")
            .fill("fictional-browser-password");
          await p
            .getByRole("button", { name: "Create manufacturer", exact: true })
            .click();
          await p
            .getByRole("alert")
            .filter({ hasText: "Account already exists" })
            .waitFor();
          assert.equal(
            await p
              .getByText("new@qa.example.invalid", { exact: true })
              .count(),
            1,
          );
        }),
    );
    await test(
      engine +
        ": private-file validation, upload, harmless download and failure recovery",
      () =>
        withDemo(browser, "admin", async (p) => {
          await ready(p, "/files");
          const file = p.locator("#private-file");
          await file.setInputFiles({
            name: "empty.txt",
            mimeType: "text/plain",
            buffer: Buffer.alloc(0),
          });
          await p.getByRole("alert").filter({ hasText: "empty" }).waitFor();
          await file.setInputFiles({
            name: "unsafe.html",
            mimeType: "text/html",
            buffer: Buffer.from("<script>not rendered</script>"),
          });
          await p
            .getByRole("alert")
            .filter({ hasText: "Unsupported file type" })
            .waitFor();
          await file.setInputFiles({
            name: "big.bin",
            mimeType: "application/octet-stream",
            buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
          });
          await p
            .getByRole("alert")
            .filter({ hasText: "exceeds 10 MiB" })
            .waitFor();
          await file.setInputFiles({
            name: "qa-example.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("EXAMPLE ONLY\nHarmless browser fixture.\n"),
          });
          await p.getByRole("button", { name: "Upload selected file" }).click();
          await p.getByText("qa-example.txt", { exact: true }).waitFor();
          const downloading = p.waitForEvent("download");
          await p
            .getByRole("button", {
              name: "Download qa-example.txt",
              exact: true,
            })
            .click();
          const download = await downloading;
          assert.equal(download.suggestedFilename(), "qa-example.txt");
          assert.match(
            readFileSync(await download.path(), "utf8"),
            /Harmless browser fixture/,
          );
          await shot(p, engine + "-file-uploaded");
        }),
    );
    await test(
      engine + ": manufacturer scoped screens and direct Accounts denial",
      () =>
        withDemo(browser, "manufacturer", async (p) => {
          await ready(p, "/devices");
          assert.equal(await p.locator("tbody tr").count(), 6);
          assert.equal(
            await p.getByText("AMT-WK40-1A09C3", { exact: true }).count(),
            0,
          );
          await ready(p, "/users");
          await p
            .getByRole("heading", { name: "You don’t have access" })
            .waitFor();
          assert.equal(await p.locator("table").count(), 0);
          await shot(p, engine + "-manufacturer-forbidden");
          await ready(p, "/devices/10000000-0000-4000-8000-000000000005");
          await p
            .getByRole("alert")
            .filter({ hasText: "could not be found" })
            .waitFor();
          await ready(p, "/devices/new");
          assert.equal(await p.locator("#manufacturer_id").count(), 0);
          await p
            .getByText("Registration manufacturer is assigned automatically", {
              exact: true,
            })
            .waitFor();
          await ready(p, "/files");
          assert.equal(await p.locator("tbody tr").count(), 3);
          assert.equal(
            await p
              .getByText("diagnostic-example.txt", { exact: true })
              .count(),
            0,
          );
        }),
    );
    await test(
      engine + ": shared loading/empty/service/rate-limit states",
      () =>
        withDemo(browser, "admin", async (p) => {
          await ready(p, "/devices");
          await p.locator(".demo-banner summary").click();
          await p.getByLabel("Preview data state").selectOption("empty");
          await p.getByRole("heading", { name: "No devices yet" }).waitFor();
          await shot(p, engine + "-empty-devices");
          await audit(p, engine + " empty devices");
          await p.getByLabel("Preview data state").selectOption("unavailable");
          await p
            .getByRole("alert")
            .filter({ hasText: "Service temporarily unavailable" })
            .waitFor();
          await p.getByLabel("Preview data state").selectOption("rate_limit");
          await p.getByRole("button", { name: "Retry when allowed" }).waitFor();
          assert.ok(
            await p
              .getByRole("button", { name: "Retry when allowed" })
              .isDisabled(),
          );
          await p
            .getByRole("button", { name: "Try again", exact: true })
            .waitFor();
          await p.getByLabel("Preview data state").selectOption("normal");
          await p.getByRole("table").waitFor();
          assert.equal(await p.locator("tbody tr").count(), 8);
        }),
    );
    await test(
      engine +
        ": mobile native drawer focus, Escape, backdrop, resize and history",
      () =>
        withDemo(
          browser,
          "admin",
          async (p) => {
            await ready(p, "/devices");
            const trigger = p.getByRole("button", {
              name: "Open navigation menu",
            });
            await p.evaluate(() => (document.body.style.overflow = "clip"));
            await trigger.click();
            assert.equal(await p.locator("dialog:modal").count(), 1);
            assert.equal(
              await p.evaluate(
                () => getComputedStyle(document.documentElement).overflow,
              ),
              "hidden",
            );
            assert.equal(
              await p.evaluate(() =>
                document.activeElement.getAttribute("aria-label"),
              ),
              "Close dialog",
            );
            await p
              .getByRole("dialog")
              .getByRole("button", { name: "Sign out of demo" })
              .focus();
            await p.keyboard.press("Tab");
            assert.equal(
              await p.evaluate(() =>
                document.activeElement.getAttribute("aria-label"),
              ),
              "Close dialog",
            );
            await p.keyboard.press("Shift+Tab");
            assert.equal(
              await p.evaluate(() => document.activeElement.textContent),
              "Sign out of demo",
            );
            await shot(p, engine + "-mobile-drawer");
            await audit(p, engine + " mobile drawer");
            await p.keyboard.press("Escape");
            assert.equal(
              await p.evaluate(() =>
                document.activeElement.getAttribute("aria-label"),
              ),
              "Open navigation menu",
            );
            assert.equal(
              await p.evaluate(() => document.body.style.overflow),
              "clip",
            );
            await p.evaluate(() => (document.body.style.overflow = ""));
            await trigger.click();
            await p.mouse.click(380, 500);
            assert.equal(await p.locator("dialog").count(), 0);
            await trigger.click();
            await p
              .getByRole("dialog")
              .getByRole("link", { name: "Files", exact: true })
              .click();
            await p.waitForURL("**/files");
            assert.equal(await p.locator("dialog").count(), 0);
            await p
              .getByRole("button", { name: "Open navigation menu" })
              .click();
            await p.goBack();
            await p.waitForURL("**/devices");
            assert.equal(await p.locator("dialog").count(), 0);
            await p
              .getByRole("button", { name: "Open navigation menu" })
              .click();
            await p.setViewportSize({ width: 1024, height: 900 });
            await p.locator("dialog").waitFor({ state: "detached" });
            assert.equal(
              await p.evaluate(() => document.body.style.overflow),
              "",
            );
          },
          390,
        ),
    );
    await test(engine + ": mobile one-time handoff drawer guard", () =>
      withDemo(
        browser,
        "admin",
        async (p) => {
          await ready(p, "/devices/new");
          await p.locator("#serial_number").fill("AMT-MOBILE-" + engine);
          await p.locator("#model").fill("Carry-On 55");
          await p.locator("#firmware_version").fill("1.4.2");
          await p.locator("#manufacturer_id").selectOption(manufacturer);
          await p
            .getByRole("button", { name: "Register device", exact: true })
            .click();
          await p.getByTestId("claim-code").waitFor();
          await p.getByRole("button", { name: "Open navigation menu" }).click();
          await p
            .getByRole("dialog")
            .getByRole("link", { name: "Devices", exact: true })
            .click();
          await p
            .getByRole("heading", { name: "Leave the one-time code?" })
            .waitFor();
          assert.equal(await p.locator("dialog:modal").count(), 1);
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
          assert.equal(await p.getByTestId("claim-code").count(), 1);
          assert.equal(
            await p.evaluate(() => document.body.style.overflow),
            "",
          );
          await p.getByRole("button", { name: "Open navigation menu" }).click();
          await p
            .getByRole("dialog")
            .getByRole("link", { name: "Devices", exact: true })
            .click();
          await p
            .getByRole("dialog")
            .getByRole("button", { name: "Leave and clear", exact: true })
            .click();
          await p.waitForURL("**/devices");
          assert.equal(await p.getByTestId("claim-code").count(), 0);
          assert.equal(await p.locator("dialog").count(), 0);
          assert.equal(
            await p.evaluate(() => document.body.style.overflow),
            "",
          );
        },
        390,
      ),
    );
    await test(engine + ": reduced motion and system dark preference", () =>
      withDemo(browser, "admin", async (p) => {
        await p.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
        await ready(p, "/devices");
        const state = await p.evaluate(() => ({
          background: getComputedStyle(document.body).backgroundColor,
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
        }));
        assert.ok(state.reduced);
        assert.equal(state.background, "rgb(245, 246, 248)");
        await shot(p, engine + "-reduced-motion-dark-preference");
      }),
    );
    await test(
      engine + ": brand assets, favicon and one complete plane loop",
      async () => {
        const c = await browser.newContext({
          viewport: { width: 1440, height: 900 },
        });
        try {
          const p = await c.newPage();
          await ready(p, "/login");
          await p
            .getByRole("button", { name: "Pause plane animation" })
            .waitFor();
          assert.ok(
            await p
              .locator(".console-brand-mark")
              .evaluate((e) => e.complete && e.naturalWidth > 0),
          );
          assert.equal(
            await p.locator(".console-brand-mark").getAttribute("src"),
            "/brand/mark-white.svg",
          );
          const icon = await p
            .locator('link[rel="icon"][href^="/icon.svg"]')
            .getAttribute("href");
          assert.equal((await p.request.get(base + icon)).status(), 200);
          const ico = await p.request.get(base + "/favicon.ico");
          assert.deepEqual(
            [...(await ico.body()).subarray(0, 6)],
            [0, 0, 1, 0, 3, 0],
          );
          assert.ok(await p.locator(".demo-access").evaluate((e) => !e.open));
          const sample = () =>
            p.evaluate(() => {
              const svg = document.querySelector(".login-route"),
                plane = svg.querySelector("[data-flight-plane]"),
                route = svg.querySelector("[data-flight-route]");
              const center = new DOMPoint(0, 0).matrixTransform(plane.getCTM());
              let distance = Infinity;
              const length = route.getTotalLength();
              for (let i = 0; i <= 1000; i++) {
                const point = route
                  .getPointAtLength((length * i) / 1000)
                  .matrixTransform(route.getCTM());
                distance = Math.min(
                  distance,
                  Math.hypot(point.x - center.x, point.y - center.y),
                );
              }
              return {
                x: center.x,
                y: center.y,
                distance,
                time: svg.getCurrentTime(),
              };
            });
          await p
            .getByRole("button", { name: "Pause plane animation" })
            .click();
          const paused = await sample();
          await p.waitForTimeout(400);
          assert.ok(Math.abs((await sample()).time - paused.time) < 0.02);
          await p.getByRole("button", { name: "Play plane animation" }).click();
          const samples = [await sample()];
          for (let i = 0; i < 6; i++) {
            await p.waitForTimeout(2100);
            samples.push(await sample());
            if (i === 2) await shot(p, engine + "-login-plane-midflight");
          }
          assert.ok(
            samples.every((s) => s.distance < 2),
            JSON.stringify(samples),
          );
          assert.ok(samples.at(-1).time - samples[0].time > 12);
          assert.ok(
            Math.max(...samples.map((s) => s.x)) -
              Math.min(...samples.map((s) => s.x)) >
              300,
          );
          await p.emulateMedia({ reducedMotion: "reduce" });
          await p
            .getByRole("button", { name: "Pause plane animation" })
            .waitFor({ state: "detached" });
          const reduced = await sample();
          await p.waitForTimeout(400);
          assert.ok(Math.abs((await sample()).time - reduced.time) < 0.02);
          await shot(p, engine + "-login-reduced-motion");
          measurements.push({ name: engine + " plane loop", samples });
          await c.addCookies([
            {
              name: "amtrav_console_demo",
              value: "admin",
              url: base,
              httpOnly: true,
            },
          ]);
          await ready(p, "/devices");
          assert.equal(
            await p.locator(".sidebar .console-brand-mark").getAttribute("src"),
            "/brand/mark-navy.svg",
          );
          assert.ok(
            await p
              .locator(".sidebar .console-brand-mark")
              .evaluate((e) => e.complete && e.naturalWidth > 0),
          );
        } finally {
          await c.close();
        }
      },
    );
    await test(engine + ": sign out clears preview session", () =>
      withDemo(browser, "admin", async (p, c) => {
        await ready(p, "/devices");
        await p
          .locator(".sidebar")
          .getByRole("button", { name: "Sign out of demo" })
          .click();
        await p.waitForURL("**/login");
        assert.ok(
          !(await c.cookies()).some((c) => c.name === "amtrav_console_demo"),
        );
        await p.goto(base + "/devices");
        await p.waitForURL("**/login?reason=session");
      }),
    );
  } finally {
    await browser.close();
    writeFileSync(
      join(output, "results.json"),
      JSON.stringify({ results, axeResults, measurements }, null, 2),
    );
  }
}
const failures = results.filter((r) => !r.passed);
console.log(
  JSON.stringify(
    {
      checks: results.length,
      failed: failures.length,
      failures,
      axeStates: axeResults.length,
      output,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
