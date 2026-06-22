import { describe, it, expect, vi, beforeEach } from "vitest";

const state = {
  configured: true,
  selectResult: { data: null, error: null },
  lastEqArgs: null,
};

vi.mock("./supabaseClient", () => ({
  get supabaseConfigured() {
    return state.configured;
  },
  supabase: {
    from: (table) => ({
      select: () => ({
        eq: (col, val) => {
          state.lastEqArgs = { table, col, val };
          return { maybeSingle: () => Promise.resolve(state.selectResult) };
        },
        order: () => Promise.resolve(state.selectResult),
      }),
    }),
  },
}));

const { joinGroupByCode, fetchGroups } = await import("./groupsApi.js");

beforeEach(() => {
  state.configured = true;
  state.selectResult = { data: null, error: null };
  state.lastEqArgs = null;
});

describe("joinGroupByCode", () => {
  it("returns 'unconfigured' without querying when Supabase isn't set up", async () => {
    state.configured = false;
    const result = await joinGroupByCode("FALCON7");
    expect(result).toEqual({ group: null, error: "unconfigured" });
  });

  it("returns 'not_found' for an empty code without querying", async () => {
    const result = await joinGroupByCode("   ");
    expect(result).toEqual({ group: null, error: "not_found" });
    expect(state.lastEqArgs).toBeNull();
  });

  it("normalizes the code to uppercase/trimmed before querying", async () => {
    state.selectResult = { data: { id: "g1", name: "Falcons", join_code: "FALCON7" }, error: null };
    await joinGroupByCode("  falcon7  ");
    expect(state.lastEqArgs).toEqual({ table: "groups", col: "join_code", val: "FALCON7" });
  });

  it("returns the group row on a match", async () => {
    const row = { id: "g1", name: "Falcons", join_code: "FALCON7" };
    state.selectResult = { data: row, error: null };
    const result = await joinGroupByCode("FALCON7");
    expect(result).toEqual({ group: row, error: null });
  });

  it("returns 'not_found' when no row matches", async () => {
    state.selectResult = { data: null, error: null };
    const result = await joinGroupByCode("NOPE99");
    expect(result).toEqual({ group: null, error: "not_found" });
  });

  it("returns 'unknown' and logs on a query error", async () => {
    state.selectResult = { data: null, error: { message: "boom" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await joinGroupByCode("FALCON7");
    expect(result).toEqual({ group: null, error: "unknown" });
    spy.mockRestore();
  });
});

describe("fetchGroups", () => {
  it("returns null without querying when Supabase isn't configured", async () => {
    state.configured = false;
    expect(await fetchGroups()).toBeNull();
  });

  it("returns the rows on success", async () => {
    const rows = [{ id: "g1", name: "Falcons" }];
    state.selectResult = { data: rows, error: null };
    expect(await fetchGroups()).toEqual(rows);
  });

  it("returns null and logs on error", async () => {
    state.selectResult = { data: null, error: { message: "boom" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await fetchGroups()).toBeNull();
    spy.mockRestore();
  });
});
