import { registerHooks } from "node:module";
// Run the source-derived TypeScript logic tests with pinned Node 24, without an app dependency.
registerHooks({
  resolve(specifier, context, next) {
    try {
      const result = next(specifier, context);
      return result.url.endsWith(".ts")
        ? { ...result, format: "module-typescript" }
        : result;
    } catch (error) {
      if (specifier.startsWith(".") && !specifier.endsWith(".ts")) {
        try {
          return {
            ...next(`${specifier}.ts`, context),
            format: "module-typescript",
          };
        } catch {
          return {
            ...next(`${specifier}/index.ts`, context),
            format: "module-typescript",
          };
        }
      }
      throw error;
    }
  },
});
