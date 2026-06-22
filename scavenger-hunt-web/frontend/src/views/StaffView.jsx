import React, { useEffect, useState, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "../api/client.js";
import { Card } from "../components/Shared.jsx";

const POLL_MS = 3000;

export default function StaffView({ groupId }) {
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

  async function approve() {
    await api.approve(groupId);
    refresh();
  }

  async function reject() {
    await api.reject(groupId);
    refresh();
  }

  if (error) return <p className="text-sm text-rose-700">Error: {error}</p>;
  if (!group || !station) return <p className="text-sm text-[#8a7a5a]">Loading...</p>;

  return (
    <div className="space-y-5 quest-body">
      <Card>
        <h2 className="quest-display text-lg mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Approval queue — {group.name}
        </h2>
        {group.pending ? (
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-[#4a4233] mb-1 font-semibold">
              Station {group.pending.id} — {group.pending.name}
            </p>
            <p className="text-sm text-[#6b5f4a] mb-3">{group.pending.challenge}</p>
            <div className="flex gap-2">
              <button onClick={approve} className="bg-emerald-700 text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-emerald-800">
                Approve
              </button>
              <button onClick={reject} className="border border-rose-400 text-rose-700 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-rose-50">
                Send back
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#8a7a5a]">
            Nothing waiting right now. The group is currently at Station {station.id} ({station.name}).
          </p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-2 uppercase tracking-wide">Activity log</h3>
        <ul className="text-sm text-[#4a4233] space-y-1">
          {group.log.length === 0 && <li className="text-[#a8987a]">No activity yet.</li>}
          {group.log.map((l, i) => (
            <li key={i}>• {l}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
