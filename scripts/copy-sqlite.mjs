// Copies the SQLite WebAssembly build into public/ so the database worker can load it
// as a same-origin static module (no bundler handling of the .wasm file needed).
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = join(
  dirname(require.resolve("@sqlite.org/sqlite-wasm/package.json")),
  "dist",
);
const target = join(import.meta.dirname, "..", "public", "sqlite");
mkdirSync(target, { recursive: true });
for (const file of ["index.mjs", "sqlite3.wasm"]) {
  copyFileSync(join(source, file), join(target, file));
}
