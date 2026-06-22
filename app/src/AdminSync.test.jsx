import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./lib/supabaseClient", () => ({ supabaseConfigured: true }));

vi.mock("./lib/stationsApi", async () => {
  const actual = await vi.importActual("./lib/stationsApi.js");
  return {
    ...actual,
    fetchStations: vi.fn().mockResolvedValue([]), // simulate empty/unseeded table (reachable, no rows)
    updateStationRemote: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("./lib/groupsApi", () => ({
  fetchGroups: vi.fn().mockResolvedValue([]),
  joinGroupByCode: vi.fn().mockResolvedValue({
    group: { id: "g1", name: "Test Group", join_code: "TEST1" },
    error: null,
  }),
}));

const { default: App } = await import("./ScavengerHuntPrototype.jsx");
const { updateStationRemote } = await import("./lib/stationsApi");

describe("Admin content editor — Supabase write path", () => {
  it("writes the edited fields to Supabase, then reflects them in the camper view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Admin" }));
    expect(await screen.findByText(/synced with supabase/i)).toBeInTheDocument();

    // Station 1 is first in the editor list — click its Edit button
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    const nameInput = screen.getAllByRole("textbox")[0]; // first editable field is "Station name"
    await user.clear(nameInput);
    await user.type(nameInput, "Plaça Nova — Renamed");

    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect((await screen.findAllByRole("button", { name: /edit/i })).length).toBeGreaterThan(0); // back to view mode
    expect(updateStationRemote).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: "Plaça Nova — Renamed" })
    );
    expect(screen.getAllByText(/Plaça Nova — Renamed/i).length).toBeGreaterThan(0);

    // Switch to Camper: with Supabase "configured," this device should land
    // on the Join screen first (no group stored yet in this test's jsdom).
    await user.click(screen.getByRole("button", { name: "Camper" }));
    await user.type(screen.getByLabelText(/join code/i), "TEST1");
    await user.click(screen.getByRole("button", { name: /join the hunt/i }));

    await user.click(await screen.findByRole("button", { name: /begin/i }));
    await user.click(screen.getByRole("button", { name: /start the quest/i }));
    expect(screen.getByText("Plaça Nova — Renamed")).toBeInTheDocument();
  });
});
