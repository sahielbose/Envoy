import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GetDiscovered } from "./get-discovered";

describe("GetDiscovered", () => {
  it("is off by default and hides the share link", () => {
    render(<GetDiscovered handle="alex" />);
    expect(screen.getByRole("switch", { name: "Get discovered" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.queryByText(/app\.envoy\.so\/p\//)).toBeNull();
  });

  it("reveals the share link only when explicitly enabled", async () => {
    render(<GetDiscovered handle="alex" />);
    await userEvent.click(screen.getByRole("switch", { name: "Get discovered" }));
    expect(screen.getByText(/app\.envoy\.so\/p\/alex/)).toBeInTheDocument();
  });
});
