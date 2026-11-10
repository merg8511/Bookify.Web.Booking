import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/*
 * MÓDULO 25.7 — VITEST
 *
 * Vitest trabaja con código React/TypeScript
 * sin reemplazar Next.js como runtime.
 *
 * No ejecutamos el servidor Next.js para
 * los tests unitarios.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

      /*
       * CAMBIO 25.7:
       * Solo en Vitest sustituimos el paquete
       * server-only por un módulo vacío.
       *
       * Esto permite probar funciones puras
       * de infraestructura en Node.
       *
       * El build real de Next.js mantiene
       * la protección server-only.
       */
      "server-only": fileURLToPath(
        new URL("./tests/setup/server-only.ts", import.meta.url),
      ),
    },
  },

  test: {
    environment: "node",

    include: ["tests/unit/**/*.test.{ts,tsx}"],

    setupFiles: ["./tests/setup/vitest.setup.ts"],

    clearMocks: true,
    restoreMocks: true,

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],

      include: [
        "src/lib/api/errors/**/*.ts",
        "src/lib/auth/roles.ts",
        "src/lib/auth/session.ts",
        "src/lib/auth/guest-credential-crypto.ts",
        "src/lib/auth/guest-credential-store.ts",
        "src/lib/auth/guest-api-access.ts",
        "src/components/ui/**/*.tsx",
        "src/lib/auth/verify-api-token.ts",
      ],

      exclude: ["**/*.d.ts", "**/generated/**", "**/*.module.css"],
    },
  },
});
