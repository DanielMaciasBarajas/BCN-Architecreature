import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function SwordPuzzle({ lettersCollected, sword, onSubmitOrder }) {
  const [orderGuess, setOrderGuess] = useState([]);
  const usedIdx = new Set(orderGuess.map((o) => o.idx));

  if (lettersCollected.length < 6) {
    return (
      <p className="text-sm text-[#8a7a5a]">
        You need all six letters from Stations 1–6 before you can arrange them here.
      </p>
    );
  }

  if (sword) {
    return (
      <div className="flex items-center gap-2 text-emerald-800 text-sm">
        <CheckCircle2 className="w-4 h-4" /> Sword found — letters rearranged into DRAGON.
      </div>
    );
  }

  function toggleLetter(letter, idx) {
    setOrderGuess((p) => [...p, { letter, idx }]);
  }

  function reset() {
    setOrderGuess([]);
  }

  async function submit() {
    const ok = await onSubmitOrder(orderGuess.map((o) => o.letter));
    if (!ok) setOrderGuess([]);
  }

  return (
    <div>
      <p className="text-sm text-[#4a4233] mb-2">Tap your six letters, in order, to spell the word:</p>
      <div className="flex gap-2 mb-3">
        {lettersCollected.map((l, idx) => (
          <button
            key={idx}
            disabled={usedIdx.has(idx)}
            onClick={() => toggleLetter(l, idx)}
            className={
              "w-9 h-9 rounded-lg border font-bold text-sm " +
              (usedIdx.has(idx)
                ? "bg-[#e3d8bc] text-[#a8987a] border-[#cfc09a] cursor-not-allowed"
                : "bg-amber-500 text-white border-amber-600 hover:bg-amber-600")
            }
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-1 mb-3 min-h-[2.5rem]">
        {orderGuess.map((o, i) => (
          <span
            key={i}
            className="w-9 h-9 rounded-lg border border-slate-400 bg-white flex items-center justify-center font-bold text-sm"
          >
            {o.letter}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={reset} className="text-sm border border-[#cfc09a] rounded-full px-3 py-1.5 hover:bg-[#e3d8bc]">
          Reset
        </button>
        <button
          onClick={submit}
          disabled={orderGuess.length !== 6}
          className="text-sm bg-rose-700 text-white rounded-full px-4 py-1.5 disabled:opacity-40 hover:bg-rose-800"
        >
          Submit order
        </button>
      </div>
    </div>
  );
}
