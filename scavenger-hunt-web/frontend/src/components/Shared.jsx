import React from "react";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { DRAGON_LABELS } from "../data/stations.js";

export function Card({ children, className = "" }) {
  return (
    <div className={"bg-[#FBF6E8] border border-[#cfc09a] rounded-xl p-5 shadow-sm " + className}>
      {children}
    </div>
  );
}

export function StationBadgeDot({ act }) {
  return (
    <span
      className={
        "inline-block w-2 h-2 rounded-full mr-2 " + (act === 1 ? "bg-amber-600" : "bg-rose-700")
      }
    />
  );
}

export function MiniDragonCard({ stationId, cardStatus }) {
  const label = DRAGON_LABELS[stationId];
  const revealed = !!cardStatus;
  return (
    <div
      className={
        "w-16 h-20 rounded-lg border flex flex-col items-center justify-center text-[10px] text-center px-1 relative " +
        (revealed ? "bg-[#FBF6E8] border-[#cfc09a]" : "bg-[#e3d8bc] border-[#cfc09a] text-[#a8987a]")
      }
    >
      {revealed ? (
        <>
          <span className="font-semibold leading-tight">{label}</span>
          {cardStatus === "x" && <XCircle className="w-6 h-6 text-rose-700 absolute" />}
          {cardStatus === "real" && <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-1" />}
        </>
      ) : (
        "?"
      )}
    </div>
  );
}

export function DragonCardView({ creature, status }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-24 rounded-lg border border-[#cfc09a] bg-[#FBF6E8] flex flex-col items-center justify-center relative">
        <span className="text-xs font-semibold text-center px-1">{creature}</span>
        {status === "x" && <XCircle className="w-10 h-10 text-rose-700 absolute" />}
      </div>
      <p className="text-sm text-[#4a4233]">
        Dragon Collection card revealed — stamped with an <b>X</b>: a lost chance, wrong creature.
      </p>
    </div>
  );
}

export function BadgeChip({ label }) {
  return (
    <span className="text-xs bg-[#2b2620] text-amber-300 rounded-full px-3 py-1 flex items-center gap-1">
      <Trophy className="w-3 h-3" /> {label}
    </span>
  );
}
