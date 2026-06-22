import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./ScavengerHuntPrototype.jsx";

const ARCHES_WAITING_TEXT = /something is waiting to be uncovered/i;

async function goToHunt(user) {
  render(<App />);
  await user.click(screen.getByRole("button", { name: /begin/i }));
  await user.click(screen.getByRole("button", { name: /start the quest/i }));
}

async function switchRole(user, label) {
  await user.click(screen.getByRole("button", { name: label }));
}

/** Drives one station from "meet" through staff-approved "resolved",
 * for judging === "staff" stations only. */
async function clearStaffStation(user) {
  await user.click(screen.getByRole("button", { name: /^continue$/i }));
  await user.click(screen.getByRole("button", { name: /see the challenge/i }));
  await user.click(screen.getByRole("button", { name: /complete challenge/i }));
  await switchRole(user, "Staff");
  await user.click(screen.getByRole("button", { name: /approve/i }));
  await switchRole(user, "Camper");
}

/** Drives one station from "meet" through auto-awarded "resolved". */
async function clearAutoStation(user) {
  await user.click(screen.getByRole("button", { name: /^continue$/i }));
  await user.click(screen.getByRole("button", { name: /see the challenge/i }));
  await user.click(screen.getByRole("button", { name: /complete challenge/i }));
}

/** From "resolved", travels to the next station and arrives. */
async function travelToNext(user) {
  await user.click(screen.getByRole("button", { name: /head to/i }));
  const checkbox = screen.queryByRole("checkbox", { name: /we found it/i });
  if (checkbox) await user.click(checkbox);
  await user.click(screen.getByRole("button", { name: /arrived/i }));
}

describe("Architecreature Hunt — Act 1 flow", () => {
  it("reaches Station 3 and reveals the Collection's arches per the narrative beat", async () => {
    const user = userEvent.setup();
    await goToHunt(user);

    // Station 1 — Plaça Nova (staff-judged)
    expect(screen.getByText(/Station 1 of 14/i)).toBeInTheDocument();
    expect(screen.getByText(ARCHES_WAITING_TEXT)).toBeInTheDocument();
    await clearStaffStation(user);
    await travelToNext(user);

    // Station 2 — Roman Necropolis (auto-judged)
    expect(screen.getByText(/Station 2 of 14/i)).toBeInTheDocument();
    expect(screen.getByText(ARCHES_WAITING_TEXT)).toBeInTheDocument();
    await clearAutoStation(user);
    await travelToNext(user);

    // Station 3 — Plaça del Rei (staff-judged). Its own farewell line says
    // "look around you — six arches, right here in this square" — this is
    // the moment the Collection's arch graphic should appear.
    expect(screen.getByText(/Station 3 of 14/i)).toBeInTheDocument();
    await clearStaffStation(user);

    expect(screen.queryByText(ARCHES_WAITING_TEXT)).not.toBeInTheDocument();
  });
});
