import React, { useEffect, useState, useCallback } from "react";
import { LayoutDashboard, Users } from "lucide-react";
import { api } from "../api/client.js";
import { STATIONS } from "../data/stations.js";
import { Card, StationBadgeDot } from "../components/Shared.jsx";

const POLL_MS = 5000;

export default function AdminView() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { groups } = await api.getGroups();
      setGroups(groups);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  async function createGroup() {
    if (!newGroupName.trim()) return;
    const id = newGroupName.trim().toLowerCase().replace(/\s+/g, "-");
    await api.createGroup(id, newGroupName.trim());
    setNewGroupName("");
    refresh();
  }

  return (
    <div className="space-y-5 quest-body">
      <Card>
        <h2 className="quest-display text-lg mb-3 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" /> Group progress
        </h2>
        {error && <p className="text-sm text-rose-700 mb-2">Error: {error}</p>}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-[#6b5f4a] border-b border-[#e3d8bc]">
              <th className="py-2">Group</th>
              <th className="py-2">Station</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Badges</th>
              <th className="py-2">Pending?</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr>
                <td colSpan={5} className="py-3 text-[#a8987a]">
                  No groups yet — create one below.
                </td>
              </tr>
            )}
            {groups.map((g) => (
              <tr key={g.id} className="border-b border-[#f1e9d8]">
                <td className="py-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {g.name}
                </td>
                <td className="py-2">Station {g.stationIdx + 1}</td>
                <td className="py-2">{Math.round(((g.stationIdx + 1) / STATIONS.length) * 100)}%</td>
                <td className="py-2">{g.badgeCount}</td>
                <td className="py-2">{g.pending ? "⏳ yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name (e.g. Falcons)"
            className="flex-1 border border-[#cfc09a] rounded-lg px-3 py-1.5 text-sm bg-white"
          />
          <button onClick={createGroup} className="bg-amber-600 text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-amber-700">
            Create group
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-3 uppercase tracking-wide">Content reference (stub)</h3>
        <p className="text-sm text-[#8a7a5a] mb-3">
          Station text/judging lives in <code>stations.js</code> on both sides for now — a real content editor would
          read/write this from the backend instead.
        </p>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {STATIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm border border-[#e3d8bc] rounded-lg px-3 py-2">
              <span className="flex items-center gap-2">
                <StationBadgeDot act={s.act} />
                {s.id}. {s.name}
              </span>
              <span className="text-xs text-[#a8987a] uppercase">{s.judging}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
