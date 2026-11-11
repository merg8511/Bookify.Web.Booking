import { readFile } from "node:fs/promises";

// MÓDULO 25.3:
// Validamos la copia local del contrato OpenAPI.
// No dependemos de una API funcionando durante
// el build de Next.js.

const contractUrl = new URL(
  "../contracts/booking-v1.openapi.json",
  import.meta.url,
);

const httpMethods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
]);

function assertContract(condition, message) {
  if (!condition) {
    throw new Error(`Invalid Bookify OpenAPI: ${message}`);
  }
}

async function validateOpenApi() {
  const raw = await readFile(contractUrl, "utf8");
  const document = JSON.parse(raw);

  // CAMBIO 25.3:
  // El backend de M24 publica OpenAPI 3.1.
  assertContract(
    typeof document.openapi === "string" && document.openapi.startsWith("3.1."),
    "expected OpenAPI version 3.1.x",
  );

  assertContract(
    document.paths && typeof document.paths === "object",
    "paths object is missing",
  );

  const operations = [];

  for (const [path, pathItem] of Object.entries(document.paths)) {
    // Excluimos /health y operaciones de diagnóstico.
    // Las operaciones de negocio usan /api/v1.
    if (!path.startsWith("/api/v1/")) {
      continue;
    }

    assertContract(
      pathItem && typeof pathItem === "object",
      `invalid path item: ${path}`,
    );

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method)) {
        continue;
      }

      assertContract(
        operation &&
          typeof operation === "object" &&
          typeof operation.operationId === "string" &&
          operation.operationId.length > 0,
        `missing operationId: ${method} ${path}`,
      );

      operations.push({
        path,
        method,
        operationId: operation.operationId,
      });
    }
  }

  // Contrato consolidado del Módulo 24.
  assertContract(
    operations.length === 33,
    `expected 33 operations, found ${operations.length}`,
  );

  const operationIds = operations.map((operation) => operation.operationId);

  assertContract(
    new Set(operationIds).size === operationIds.length,
    "duplicate operationIds were detected",
  );

  // Comprobaciones puntuales de contratos reales.
  const requiredOperations = [
    {
      method: "get",
      path: "/api/v1/properties",
      operationId: "Properties.List",
    },
    {
      method: "post",
      path: "/api/v1/bookings",
      operationId: "Bookings.Create",
    },
    {
      method: "post",
      path: "/api/v1/payments",
      operationId: "Payments.Initiate",
    },
  ];

  for (const required of requiredOperations) {
    assertContract(
      operations.some(
        (operation) =>
          operation.method === required.method &&
          operation.path === required.path &&
          operation.operationId === required.operationId,
      ),
      `missing operation ${required.operationId}`,
    );
  }

  console.log(
    `Bookify OpenAPI validated: ` +
      `${document.openapi}, ` +
      `${operations.length} API operations.`,
  );
}

validateOpenApi().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "OpenAPI validation failed",
  );

  process.exitCode = 1;
});
