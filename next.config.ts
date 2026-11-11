import type { NextConfig } from "next";

function validateBackendBaseUrl(rawValue: string | undefined): void {
  const variableName = "BOOKIFY_API_BASE_URL";

  if (!rawValue || rawValue.trim() !== rawValue) {
    throw new Error(
      `${variableName} is required and must not contain surrounding whitespace.`,
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawValue);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    !parsed.hostname ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    parsed.origin != rawValue
  ) {
    throw new Error(
      `${variableName} must be an HTTP/HTTPS origin without a path, query, fragment or credentials.`,
    );
  }
}

validateBackendBaseUrl(process.env.BOOKIFY_API_BASE_URL);

const nextConfig: NextConfig = {};

export default nextConfig;
