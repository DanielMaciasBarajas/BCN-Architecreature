import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { STATIONS, ARC_LETTERS, TARGET_WORD } from "./stations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // generous limit for base64 photo payloads later

// ---------- tiny file-backed "database" ----------
// No DB setup required: state lives in db.json, written after every mutation.
// Swap this module out for real persistence (Postgres, SQLite, etc.) later
// without touching the route logic below.

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = { groups: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function newGroupState(name) {
  return {
    name,
    stationIdx: 0,
    lettersCollected: [],
    arcsPopped: false,
    sword: false,
    dragonCards: {}, // { stationId: 'x' | 'real' }
    badges: [],
    iceCream: false,
    pending: null, // station object awaiting staff approval
    lastSuccessMsg: null,
    finaleDone: false,
    log: [],
    updatedAt: new Date().toISOString(),
  };
}

function pushLog(group, msg) {
  group.log = [msg, ...group.log].slice(0, 30);
}

function awardStation(group, station) {
  if (station.letter) group.lettersCollected.push(station.letter);
  if (station.popsArches) group.arcsPopped = true;
  if (station.badge && !group.badges.includes(station.badge)) group.badges.push(station.badge);
  if (station.reward) group.iceCream = true;
  pushLog(group, `Station ${station.id} (${station.name}) completed.`);
  group.lastSuccessMsg = { stationId: station.id, text: station.successMsg || "" };
  group.stationIdx = Math.min(group.stationIdx + 1, STATIONS.length - 1);
}

// ---------- routes ----------

app.get("/api/stations", (req, res) => {
  res.json({ stations: STATIONS, arcLetters: ARC_LETTERS, targetWord: TARGET_WORD });
});

app.get("/api/groups", (req, res) => {
  const db = loadDb();
  const list = Object.entries(db.groups).map(([id, g]) => ({
    id,
    name: g.name,
    stationIdx: g.stationIdx,
    badgeCount: g.badges.length,
    pending: !!g.pending,
    updatedAt: g.updatedAt,
  }));
  res.json({ groups: list });
});

app.post("/api/groups", (req, res) => {
  const db = loadDb();
  const id = req.body.id || `group-${Date.now()}`;
  if (db.groups[id]) return res.status(409).json({ error: "Group already exists" });
  db.groups[id] = newGroupState(req.body.name || id);
  saveDb(db);
  res.json({ id, group: db.groups[id] });
});

app.get("/api/groups/:id", (req, res) => {
  const db = loadDb();
  let group = db.groups[req.params.id];
  if (!group) {
    // Convenience for local testing: visiting a new group id creates it.
    // In production, gate this behind the admin "Create group" flow instead.
    group = newGroupState(req.params.id);
    db.groups[req.params.id] = group;
    saveDb(db);
  }
  res.json({ group, station: STATIONS[group.stationIdx] });
});

// Camper submits the current station's challenge.
app.post("/api/groups/:id/submit", (req, res) => {
  const db = loadDb();
  const group = db.groups[req.params.id];
  if (!group) return res.status(404).json({ error: "Group not found" });

  const station = STATIONS[group.stationIdx];

  if (station.judging === "staff") {
    group.pending = station;
    pushLog(group, `Submitted to staff for approval: Station ${station.id}.`);
  } else if (station.judging === "auto") {
    awardStation(group, station);
  } else if (station.judging === "dragon") {
    group.dragonCards[station.id] = "x";
    pushLog(group, `Dragon Collection card revealed: ${station.creature} — stamped with an X.`);
    group.lastSuccessMsg = { stationId: station.id, text: station.successMsg || "" };
    group.stationIdx = Math.min(group.stationIdx + 1, STATIONS.length - 1);
  } else if (station.judging === "finale") {
    group.dragonCards[station.id] = "real";
    group.finaleDone = true;
    group.lastSuccessMsg = { stationId: station.id, text: station.successMsg || "" };
    pushLog(group, "Finale submitted — real dragon identified: Sant Jordi.");
  } else if (station.judging === "sword") {
    const guess = (req.body.letterOrder || []).join("");
    if (guess === TARGET_WORD) {
      group.sword = true;
      if (!group.badges.includes("Dead-Eye")) group.badges.push("Dead-Eye");
      pushLog(group, "Letters correctly rearranged into DRAGON. Sword found.");
      group.lastSuccessMsg = { stationId: station.id, text: station.successMsg || "" };
      group.stationIdx = Math.min(group.stationIdx + 1, STATIONS.length - 1);
    } else {
      pushLog(group, `Order "${guess}" is not correct — try again.`);
      return res.status(400).json({ error: "Incorrect order", group });
    }
  }

  group.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ group, station: STATIONS[group.stationIdx] });
});

// Staff approves the pending submission.
app.post("/api/groups/:id/approve", (req, res) => {
  const db = loadDb();
  const group = db.groups[req.params.id];
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (!group.pending) return res.status(400).json({ error: "Nothing pending" });

  awardStation(group, group.pending);
  group.pending = null;
  group.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ group, station: STATIONS[group.stationIdx] });
});

// Staff rejects the pending submission (group retries).
app.post("/api/groups/:id/reject", (req, res) => {
  const db = loadDb();
  const group = db.groups[req.params.id];
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (!group.pending) return res.status(400).json({ error: "Nothing pending" });

  pushLog(group, `Staff sent Station ${group.pending.id} back for another attempt.`);
  group.pending = null;
  group.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ group, station: STATIONS[group.stationIdx] });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Scavenger hunt backend running at http://localhost:${PORT}`);
});
