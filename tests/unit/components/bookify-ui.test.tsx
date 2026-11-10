/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { Button, ButtonLink } from "@/components/ui/button";

import { StatusBadge } from "@/components/ui/status-badge";

import { TextField } from "@/components/ui/text-field";

import { ApiErrorNotice } from "@/components/ui/api-error-notice";

import type { BookifyApiError } from "@/lib/api/errors/bookify-api-error";

const rateLimitError: BookifyApiError = {
  kind: "problem",
  status: 429,
  type: "urn:bookify:problem-type:rate-limit",
  title: "Too many requests",
  detail: "Try again later.",
  instance: null,
  code: "RateLimit.Exceeded",
  traceId: "synthetic-trace",
  correlationId: null,
  retryAfterSeconds: 45,
};

describe("Bookify UI components — M25.2/25.4", () => {
  it("utiliza button como tipo predeterminado", () => {
    render(<Button>Continuar</Button>);

    expect(
      screen.getByRole("button", {
        name: "Continuar",
      }),
    ).toHaveAttribute("type", "button");
  });

  it("impide interacción cuando el botón está cargando", () => {
    render(<Button loading>Guardar</Button>);

    const button = screen.getByRole("button", {
      name: "Guardar",
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("ejecuta la acción del botón al hacer clic", async () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Continuar</Button>);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Continuar",
      }),
    );

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("protege los enlaces externos", () => {
    render(
      <ButtonLink href="https://example.com" external>
        Documentación
      </ButtonLink>,
    );

    const link = screen.getByRole("link", {
      name: "Documentación",
    });

    expect(link).toHaveAttribute("target", "_blank");

    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("vincula el label con su campo", () => {
    render(<TextField id="guest-email" label="Correo electrónico" required />);

    const input = screen.getByRole("textbox", {
      name: /Correo electrónico/,
    });

    expect(input).toHaveAttribute("id", "guest-email");

    expect(input).toBeRequired();
  });

  it("asocia el mensaje de validación al campo", () => {
    render(
      <TextField
        id="guest-email"
        label="Correo electrónico"
        error="Introduce un correo válido."
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Correo electrónico",
    });

    const alert = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");

    expect(input).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("guest-email-error"),
    );

    expect(alert).toHaveTextContent("Introduce un correo válido.");
  });

  it("presenta badges mediante texto", () => {
    render(<StatusBadge tone="warning">Pendiente</StatusBadge>);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("presenta Retry-After y referencia técnica", () => {
    render(<ApiErrorNotice error={rateLimitError} />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent("Too many requests");

    expect(alert).toHaveTextContent("45 segundos");

    expect(alert).toHaveTextContent("RateLimit.Exceeded");
  });

  it("muestra texto no confiable sin ejecutarlo", () => {
    const maliciousError: BookifyApiError = {
      ...rateLimitError,
      detail: '<script>alert("xss")</script>',
    };

    render(<ApiErrorNotice error={maliciousError} />);

    expect(
      screen.getByText('<script>alert("xss")</script>'),
    ).toBeInTheDocument();

    expect(document.querySelector("script")).toBeNull();
  });
});
