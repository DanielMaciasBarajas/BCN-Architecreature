import React, { useEffect, useState, useCallback } from "react";
import { IceCream, ScrollText } from "lucide-react";
import { api } from "../api/client.js";
import { ARC_LETTERS } from "../data/stations.js";
import { Card, StationBadgeDot, MiniDragonCard, DragonCardView, BadgeChip } from "../components/Shared.jsx";
import SwordPuzzle from "../components/SwordPuzzle.jsx";

const POLL_MS = 4000;

export default function CamperView({ groupId }) {
  const [group, setGroup] = useState(null);
  const [station, setStation] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { group, station } = await api.getGroup(groupId);
      setGroup(group);
      setStation(station);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [groupId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  async function submitChallenge() {
    try {
      await api.submit(groupId);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitSwordOrder(letterOrder) {
    try {
      await api.submit(groupId, letterOrder);
      refresh();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  if (error) return <p className="text-sm text-rose-700">Error: {error}</p>;
  if (!group || !station) return <p className="text-sm text-[#8a7a5a]">Loading...</p>;

  const isPendingHere = group.pending && group.pending.id === station.id;
  const isFinale = station.judging === "finale";

  return (
    <div className="space-y-5 quest-body">
      <div className="flex items-center justify-between text-sm text-[#6b5f4a]">
        <span>Station {station.id} of 15</span>
        <span className="flex items-center gap-2">
          <StationBadgeDot act={station.act} />
          {station.act === 1 ? "Act One — The Quest" : "Act Two — The Hunt"}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#e3d8bc] rounded-full overflow-hidden">
        <div className="h-full bg-amber-600 transition-all" style={{ width: `${(station.id / 15) * 100}%` }} />
      </div>

      <Card>
        <h2 className="quest-display text-xl mb-1">{station.name}</h2>

        <div className="space-y-2 mb-4 text-sm text-[#4a4233]">
          {station.character && (
            <p>
              <span className="font-semibold text-[#6b5f4a]">Who you meet: </span>
              {station.character}
            </p>
          )}
          {station.clue && (
            <p className="italic border-l-2 border-amber-400 pl-3">{station.clue}</p>
          )}
          {station.hidden && (
            <p>
              <span className="font-semibold text-[#6b5f4a]">Look for: </span>
              {station.hidden}
            </p>
          )}
          {station.history && (
            <p className="text-xs text-[#8a7a5a]">
              <span className="font-semibold">Real history: </span>
              {station.history}
            </p>
          )}
        </div>

        <p className="text-[#4a4233] font-semibold mb-3">{station.challenge}</p>

        {isPendingHere ? (
          <div className="flex items-center gap-2 text-sm bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-amber-800">
            <ScrollText className="w-4 h-4" /> Waiting on staff approval...
          </div>
        ) : station.judging === "sword" ? (
          <SwordPuzzle lettersCollected={group.lettersCollected} sword={group.sword} onSubmitOrder={submitSwordOrder} />
        ) : station.judging === "dragon" ? (
          group.dragonCards[station.id] ? (
            <DragonCardView creature={station.creature} status={group.dragonCards[station.id]} />
          ) : (
            <button onClick={submitChallenge} className="bg-rose-700 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-rose-800">
              Identify the creature
            </button>
          )
        ) : isFinale ? (
          group.finaleDone ? (
            <p className="text-sm text-emerald-800">Finale complete — real dragon identified: Sant Jordi.</p>
          ) : (
            <button onClick={submitChallenge} className="bg-emerald-700 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-emerald-800">
              Submit finale collectables
            </button>
          )
        ) : (
          <button onClick={submitChallenge} className="bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-amber-700">
            Complete challenge
          </button>
        )}

        {group.lastSuccessMsg && group.lastSuccessMsg.stationId === station.id - 1 && (
          <p className="text-xs text-emerald-700 mt-3 italic">{group.lastSuccessMsg.text}</p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-3 uppercase tracking-wide">Your collection</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {ARC_LETTERS.map((l, i) => {
            const got = group.lettersCollected.includes(l);
            return (
              <span
                key={i}
                className={
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border " +
                  (got ? "bg-amber-500 text-white border-amber-600" : "bg-[#e3d8bc] text-[#a8987a] border-[#cfc09a]")
                }
              >
                {got ? l : "?"}
              </span>
            );
          })}
          {group.arcsPopped && (
            <span className="text-xs text-[#6b5f4a] self-center ml-1">(all 6 arch slots visible — Saló del Tinell)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {group.sword && <span className="text-xs bg-slate-700 text-white rounded-full px-3 py-1">⚔ Sword found</span>}
          {group.iceCream && (
            <span className="text-xs bg-pink-200 text-pink-800 rounded-full px-3 py-1 flex items-center gap-1">
              <IceCream className="w-3 h-3" /> Ice cream
            </span>
          )}
          {group.badges.map((b) => (
            <BadgeChip key={b} label={b} />
          ))}
        </div>
        <div className="flex gap-2">
          {[10, 12, 14, 15].map((id) => (
            <MiniDragonCard key={id} stationId={id} cardStatus={group.dragonCards[id]} />
          ))}
        </div>
      </Card>
    </div>
  );
}
