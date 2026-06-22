import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./lib/supabaseClient", () => ({ supabaseConfigured: true }));

vi.mock("./lib/stationsApi", async () => {
  const actual = await vi.importActual("./lib/stationsApi.js");
  return { ...actual, fetchStations: vi.fn().mockResolvedValue([]) };
});

vi.mock("./lib/groupsApi", () => ({
  fetchGroups: vi.fn().mockResolvedValue([]),
  joinGroupByCode: vi.fn(async (code) => {
    if (code.trim().toUpperCase() === "FALCON7") {
      return { group: { id: "g1", name: "The Falcons", join_code: "FALCON7" }, error: null };
    }
    return { group: null, error: "not_found" };
  }),
}));

const { default: App } = await import("./ScavengerHuntPrototype.jsx");

describe("Join screen", () => {
  it("rejects a bad code, then accepts the right one and greets the group", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Lands on Join, not Intro, since Supabase is "configured" and no
    // group is stored yet in this jsdom session.
    expect(screen.getByRole("heading", { name: /join the hunt/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^begin$/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/join code/i), "WRONGCODE");
    await user.click(screen.getByRole("button", { name: /join the hunt/i }));
    expect(await screen.findByText(/didn't match any group/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/join code/i));
    await user.type(screen.getByLabelText(/join code/i), "falcon7");
    await user.click(screen.getByRole("button", { name: /join the hunt/i }));

    expect(await screen.findByRole("button", { name: /^begin$/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome, the falcons/i)).toBeInTheDocument();
  });
});
