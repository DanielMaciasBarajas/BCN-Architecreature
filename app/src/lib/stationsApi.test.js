import { describe, it, expect, vi, beforeEach } from "vitest";

const state = {
  configured: true,
  selectResult: { data: [], error: null },
  updateResult: { error: null },
};

vi.mock("./supabaseClient", () => ({
  get supabaseConfigured() {
    return state.configured;
  },
  supabase: {
    from: (table) => ({
      select: () => ({
        order: () => Promise.resolve(state.selectResult),
      }),
      update: (patch) => ({
        eq: (col, val) => {
          state.lastUpdate = { table, patch, col, val };
          return Promise.resolve(state.updateResult);
        },
      }),
    }),
  },
}));

const { fetchStations, mergeRemoteStations, updateStationRemote } = await import("./stationsApi.js");

beforeEach(() => {
  state.configured = true;
  state.selectResult = { data: [], error: null };
  state.updateResult = { error: null };
  state.lastUpdate = null;
});

describe("fetchStations", () => {
  it("returns null without querying when Supabase isn't configured", async () => {
    state.configured = false;
    const result = await fetchStations();
    expect(result).toBeNull();
  });

  it("maps snake_case DB columns to the local camelCase station shape", async () => {
    state.selectResult = {
      data: [
        {
          id: 1,
          name: "Plaça Nova — BARCINO",
          act: 1,
          judging: "staff",
          letter: "G",
          badge: null,
          character: "Emperor Augustus",
          meet_line: "speaking from atop the old Roman gate",
          greeting: "Stand still, traveler.",
          history: "Founded as BARCINO.",
          challenge_text: "Spell it out.",
          fact_log: "BARCINO fact.",
          moral: "Solid Foundations",
          farewell: "Take this letter.",
          next_area: "the Roman Necropolis",
          next_clue_hint: "Look for a courtyard.",
          creature: null,
          is_real_creature: null,
          bridge_quote_1: null,
          bridge_quote_2: null,
          sort_order: 1,
        },
      ],
      error: null,
    };
    const result = await fetchStations();
    expect(result).toEqual([
      {
        id: 1,
        name: "Plaça Nova — BARCINO",
        act: 1,
        judging: "staff",
        letter: "G",
        badge: null,
        character: "Emperor Augustus",
        meetLine: "speaking from atop the old Roman gate",
        greeting: "Stand still, traveler.",
        history: "Founded as BARCINO.",
        challengeText: "Spell it out.",
        factLog: "BARCINO fact.",
        moral: "Solid Foundations",
        farewell: "Take this letter.",
        nextArea: "the Roman Necropolis",
        nextClueHint: "Look for a courtyard.",
        creature: null,
        real: null,
        bridgeQuote1: null,
        bridgeQuote2: null,
      },
    ]);
  });

  it("returns null and logs on query error", async () => {
    state.selectResult = { data: null, error: { message: "boom" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await fetchStations();
    expect(result).toBeNull();
    spy.mockRestore();
  });
});

describe("mergeRemoteStations", () => {
  it("overwrites content fields but preserves local-only logic flags", () => {
    const local = [
      { id: 3, name: "Plaça del Rei (stale)", popsArches: true, character: "Isabel" },
      { id: 99, name: "Untouched local station", someLocalFlag: true },
    ];
    const remote = [{ id: 3, name: "Plaça del Rei", character: "Isabel la Católica" }];
    const merged = mergeRemoteStations(local, remote);
    expect(merged[0]).toEqual({ id: 3, name: "Plaça del Rei", popsArches: true, character: "Isabel la Católica" });
    expect(merged[1]).toEqual(local[1]); // no matching remote row -> untouched
  });

  it("passes local stations through unchanged when remoteRows is null", () => {
    const local = [{ id: 1, name: "A" }];
    expect(mergeRemoteStations(local, null)).toBe(local);
  });
});

describe("updateStationRemote", () => {
  it("sends only the editable fields, mapped to their DB columns", async () => {
    const draft = {
      name: "New name",
      character: "New character",
      challengeText: "New challenge",
      nextClueHint: "New hint",
      judging: "staff", // not editable — must NOT be sent
      letter: "Z", // not editable — must NOT be sent
    };
    const ok = await updateStationRemote(5, draft);
    expect(ok).toBe(true);
    expect(state.lastUpdate.table).toBe("stations");
    expect(state.lastUpdate.col).toBe("id");
    expect(state.lastUpdate.val).toBe(5);
    expect(state.lastUpdate.patch).toEqual({
      name: "New name",
      character: "New character",
      challenge_text: "New challenge",
      next_clue_hint: "New hint",
    });
  });

  it("returns false without writing when Supabase isn't configured", async () => {
    state.configured = false;
    const ok = await updateStationRemote(5, { name: "x" });
    expect(ok).toBe(false);
    expect(state.lastUpdate).toBeNull();
  });

  it("returns false and logs on write error", async () => {
    state.updateResult = { error: { message: "nope" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = await updateStationRemote(5, { name: "x" });
    expect(ok).toBe(false);
    spy.mockRestore();
  });
});
