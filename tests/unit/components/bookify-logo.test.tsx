/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { BookifyLogo } from "@/components/brand/bookify-logo";

describe("Bookify Horizon — LOGO-006", () => {
  it("utiliza el maestro público claro", () => {
    render(<BookifyLogo context="public" href="/" />);

    const link = screen.getByRole("link", {
      name: "Bookify",
    });

    expect(link).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-public.svg");
  });

  it("utiliza la variante pública invertida", () => {
    render(<BookifyLogo context="public" inverted />);

    expect(
      screen.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-public-inverse.svg");
  });

  it("utiliza el maestro administrativo", () => {
    render(<BookifyLogo context="admin" />);

    expect(
      screen.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-admin.svg");
  });

  it("utiliza la variante administrativa invertida", () => {
    render(<BookifyLogo context="admin" inverted />);

    expect(
      screen.getByRole("img", {
        name: "Bookify",
      }),
    ).toHaveAttribute("src", "/brand/horizon-admin-inverse.svg");
  });
});
