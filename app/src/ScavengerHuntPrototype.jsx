import React, { useState, useEffect } from "react";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Trophy,
  Users,
  LayoutDashboard,
  IceCream,
  Sparkles,
  ShieldCheck,
  ScrollText,
  ImagePlus,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Swords,
  KeyRound,
  Flame,
  BookOpen,
  Compass,
  CloudCheck,
  CloudOff,
} from "lucide-react";
import { supabaseConfigured } from "./lib/supabaseClient";
import { fetchStations, mergeRemoteStations, updateStationRemote } from "./lib/stationsApi";
import { joinGroupByCode, fetchGroups } from "./lib/groupsApi";
import { titleImageUrl, characterImageUrl, nextClueImageUrl } from "./lib/media";

/* ---------------------------------------------------------------------- */
/* STATION DATA                                                           */
/* ---------------------------------------------------------------------- */

const STATIONS = [
  {
    id: 1,
    name: "Plaça Nova — BARCINO",
    act: 1,
    judging: "staff",
    letter: "G",
    badge: null,
    character: "Emperor Augustus",
    meetLine: "speaking from atop the old Roman gate",
    greeting:
      "Stand still, traveler. Two thousand years and you still don't recognize an Emperor when you see one. I built this city's bones — BARCINO, gate, walls, and all. Show me you understand what stone like this is worth.",
    history:
      "These four columns and this gate are real Roman remains. The settlement was founded in the 1st century BC as a Roman colony named BARCINO — small, fortified, and deliberately placed for trade and defense. The seed everything else in this city grew from.",
    challengeText:
      "Spell out B-A-R-C-I-N-O using only your group's bodies, lying flat on the ground. Get the angle right and have someone photograph the whole thing from directly above.",
    factLog: "BARCINO was founded by the Romans in the 1st century BC as a fortified trading colony — the seed of modern Barcelona.",
    moral: "Solid Foundations",
    farewell:
      "Good. Now you understand: nothing in this city stands without a foundation laid first. Take this — your first letter, G. Hold onto it, and every letter like it you earn from here on. Somewhere in this old quarter stand six arches, easy to walk past without ever noticing. Six arches, six letters, one word waiting to be spelled — but you won't know which order until you've earned the right to ask. Walk on — the dead have something to tell you, not far from here.",
    nextArea: "the Roman Necropolis",
    nextClueHint: "Look for a sunken stone courtyard, fenced off below street level, visible through glass panels in the pavement.",
  },
  {
    id: 2,
    name: "Roman Necropolis",
    act: 1,
    judging: "auto",
    letter: "R",
    badge: "Quiet Mind",
    character: "A dead Roman poet",
    meetLine: "speaks from the sunken tombs",
    greeting:
      "Down here it's quiet. Has been for about two thousand years. I used to write — verses nobody important enough to remember. Funny thing about dying: you start wishing someone had asked your name.",
    history:
      "This sunken courtyard is a real Roman necropolis — burials were kept just outside the city walls, as Roman law required. Most of the names on these stones were never grand: soldiers, merchants, freed slaves. The unremarkable many, who built the city just as much as any Emperor.",
    challengeText:
      "Choose one of the unnamed graves. Invent a name and a one-line story for whoever lies there — who they were, what they wanted, what they left behind.",
    factLog: "This sunken courtyard is a real Roman necropolis, where ordinary citizens — not emperors — were buried just outside the city walls.",
    moral: "Respect",
    farewell:
      "Good story. Whoever they were, you gave them a name today — that's more than most people get. That's your second letter, R, to add to the first. Climb back up into the light. The Queen is waiting, and she doesn't like to be kept.",
    nextArea: "Plaça del Rei",
    nextClueHint: "Look for a wide open square framed by an old palace facade and a long, fan-shaped stone staircase.",
  },
  {
    id: 3,
    name: "Plaça del Rei",
    act: 1,
    judging: "staff",
    letter: "A",
    badge: null,
    character: "Isabel la Católica",
    popsArches: true,
    meetLine: "standing at the top of the great stone staircase",
    greeting:
      "Do you know whose feet have climbed these steps? Mine, for one — Columbus knelt right where you're standing, back from a voyage that changed how every map in this city was drawn. Show me your group can command a room the way I once did.",
    history:
      "Plaça del Rei was the ceremonial heart of the Kingdom of Aragon. Tradition holds that Christopher Columbus was received here by Ferdinand and Isabella after his first voyage in 1493, on this very staircase.",
    challengeText:
      "One member of your group becomes the monarch on the top step. The rest of the group must deliver a one-minute royal proclamation to them, in character, without laughing.",
    factLog: "Plaça del Rei's grand staircase is where tradition says Columbus was received by the Catholic Monarchs after his first voyage in 1493.",
    moral: "Presence",
    farewell:
      "Decreed and accepted. That's your third letter, A. Now look around you — six arches, right here in this square, though you've only carried letters for three of them so far. Their count isn't an accident. Go now, and find the turtle who's seen every visitor to this square and judged most of them unworthy.",
    nextArea: "Casa de l'Ardiaca",
    nextClueHint: "Look for a small carved stone turtle set into the wall beside an old wooden mailbox slot.",
  },
  {
    id: 4,
    name: "Casa de l'Ardiaca",
    act: 1,
    judging: "staff",
    letter: "N",
    badge: null,
    character: "The Turtle",
    meetLine: "carved into the wall, holding up a mailbox that hasn't moved in a century",
    greeting:
      "Slow down. Everyone rushes past me like I'm furniture. I've held this mailbox since before your grandparents were born, and I am in absolutely no hurry to talk to you.",
    history:
      "Casa de l'Ardiaca's courtyard mailbox is topped by a small bronze turtle and swallows, added during a 1902 renovation — a quiet bit of whimsy on a building that's been rebuilt many times since the 12th century.",
    challengeText:
      "Move as a group at turtle speed — single file, hands on the shoulders of the person ahead — from one side of the courtyard to the other, without anyone breaking contact or stepping out of rhythm.",
    factLog: "The bronze turtle and swallows on Casa de l'Ardiaca's mailbox were added in a 1902 renovation of a building with roots in the 12th century.",
    moral: "Patience",
    farewell:
      "Slowly, but you got there. That's your letter, N. Go on now — there's a buried street under El Born nobody's drawn a map of in a long time.",
    nextArea: "El Born",
    nextClueHint: "Look for a long market hall with a glass roof held up by iron columns and arches.",
  },
  {
    id: 5,
    name: "El Born",
    act: 1,
    judging: "staff",
    letter: "D",
    badge: null,
    character: "An unknown architect",
    meetLine: "pointing down at the excavated street beneath the market floor",
    greeting:
      "Nobody remembers my name, and that's the joke of this whole profession — you build the thing, and the city remembers the building, never you. Look down. That street was somebody's whole life's work too.",
    history:
      "El Born's market hall was built in 1876; archaeological excavations beneath it later uncovered an entire intact street from the 1700s, destroyed in the Bourbon siege of 1714 — now preserved under glass.",
    challengeText:
      "Look down through the glass at the excavated street below. Sketch, from memory, what you think that street looked like full of people, on the back of any paper you have, or describe it aloud to the group.",
    factLog: "Beneath El Born's 1876 market hall lies an excavated 18th-century street, destroyed in the 1714 siege and preserved under glass.",
    moral: "Forgotten Builders",
    farewell:
      "Not bad, for someone who never met me. That's your letter, O. I may be forgotten, but I came first — every arch and facade you'll meet from here owes something to streets like mine. Go carry some weight for once — there are dock-porters nearby who'd like a word.",
    nextArea: "Santa Maria del Mar",
    nextClueHint: "Look for a church with tall, plain stone walls and twin octagonal bell towers rising above the rooftops.",
  },
  {
    id: 6,
    name: "Santa Maria del Mar — The Bastaixos",
    act: 1,
    judging: "staff",
    letter: "O",
    badge: "Strong Backs",
    character: "A Bastaix (dock-porter)",
    meetLine: "standing beside the carved wooden door, mid-stride, forever carrying a stone",
    greeting:
      "You see this church? My back built it. Every stone came from the beach at La Ribera, half a mile away, carried here on the shoulders of men like me — for free, because we believed in it. Show me you understand what that kind of weight feels like.",
    history:
      "The Bastaixos were dock-porters who, between 1329 and 1383, carried every stone for Santa Maria del Mar from the beach to this site on their backs, unpaid, as an act of devotion. They're honored in the carving on the very door beside you.",
    challengeText:
      "Piggyback relay: one person carries another on their back across the square and back. Switch carriers, and complete the relay as a full group before time runs out.",
    factLog: "The Bastaixos, medieval dock-porters, carried every stone for Santa Maria del Mar from the beach on their own backs between 1329 and 1383.",
    moral: "Sacrifice",
    farewell:
      "Now you've felt a fraction of that weight. That's your letter, D. Six letters, all collected — out of order, the way history usually arrives. There's a bridge ahead, and somebody on it who's been waiting a long time to ask you a question. Go carefully.",
    nextArea: "Pont del Bisbe",
    nextClueHint: "Look for a covered stone bridge — and a skull and dagger carved into the stonework beneath it.",
  },
  {
    id: 7,
    name: "Pont del Bisbe",
    act: 1,
    judging: "bridge",
    letter: null,
    badge: "Dead-Eye",
    character: "The Watcher",
    meetLine: "leaning against the bridge, eyes on the skull carved into the stone",
    greeting:
      "Six letters, no word. That's the state I find most people in — plenty of pieces, no idea what they spell. See that skull and dagger under the bridge? Local legend says touch the skull or step on it and you're cursed. I wouldn't risk it. First — show me you can hit a target blind.",
    history:
      "The Gothic bridge connecting the Palau de la Generalitat to the Casa de l'Ardiaca was added in 1928, designed to look medieval. The skull-and-dagger carving beneath it is real, and the legend about touching it is older than the bridge itself.",
    challengeText:
      "Blindfolded, one at a time, each member of your group tries to pin a tail (or sticker) onto a target taped to a wall. The group gets three attempts total to land at least one hit.",
    factLog: "Pont del Bisbe was built in 1928 to look medieval. The skull-and-dagger carving beneath it is genuinely old, and so is the curse legend attached to it.",
    moral: "Trusting Your Aim",
    bridgeQuote1:
      "Not bad, blind. Now — six letters. G, R, A, N, D, O. One word. Arrange them in the right order, and I'll tell you what's actually happening in this city.",
    bridgeQuote2:
      "...DRAGON. Good. You got there. Something's been loose in this city for longer than anyone wants to admit — wearing different faces in different corners of it. Find it, and you'll understand what these stones have been trying to tell you all along. Go carefully — not everything that looks like the answer is the answer.",
    clueLabel: "The Word",
    moralAct2Intro: true,
    farewell:
      "Go on. Rest first if you need to — what's coming will ask more of you than letters and arches did.",
    nextArea: "a quiet pause before the real hunt begins",
    nextClueHint: null,
  },
  {
    id: 8,
    name: "Sant Felip Neri",
    act: 2,
    judging: "staff",
    character: "The Watcher",
    meetLine: "standing very still in the small square, listening",
    greeting:
      "Quiet, for a second. Did you hear that, a minute ago? Sounded almost like a roar. I think it came from over toward the Palau. Before you go — look at these walls. They're not decoration.",
    history:
      "The pockmarks across this church's facade are real shrapnel scars from a bombing on January 30, 1938, during the Spanish Civil War, which killed dozens of people, many of them children sheltering in the square.",
    challengeText:
      "In silence, run your hand once over the scarred wall. Then, as a group, sit for thirty full seconds without speaking, before moving on.",
    factLog: "The pockmarked walls of Sant Felip Neri are shrapnel scars from a 1938 bombing during the Spanish Civil War.",
    moral: "Memory",
    farewell:
      "That roar I heard — I'd put money on it being something dragon-shaped, over by the Palau. Go look. Carefully.",
    nextArea: "Palau Güell",
    nextClueHint: "Look for a wrought-iron gate beneath a tall stone facade, with something perched above it.",
  },
  {
    id: 9,
    name: "Palau Güell",
    act: 2,
    judging: "dragon",
    creature: "The Bird of Palau Güell",
    real: false,
    character: "The Bird of Palau Güell",
    meetLine: "perched above the gate, unimpressed by the attention",
    greeting:
      "I've been mistaken for a dragon more times than I can count, and every single time it's been embarrassing for whoever made the mistake. I'm a bird. Look at me. I have a beak.",
    history:
      "Palau Güell was designed by a young Antoni Gaudí between 1886 and 1890 as a private mansion for his patron Eusebi Güell. Its rooftop is covered in surreal mosaic-tiled chimneys, and ironwork creatures perch above its entrance — easy to mistake for something fiercer than they are, from a distance.",
    challengeText:
      "Take your group photo with the bird above the gate, then find and photograph at least two of the chimney shapes on the rooftop terrace photo provided — match each to what it resembles.",
    factLog: "Palau Güell (1886–1890) was Antoni Gaudí's first major Barcelona commission, built for his patron Eusebi Güell — its ironwork and chimneys are easy to mistake for something else at a glance.",
    moral: "Not Everything That Looks Fierce Is",
    farewell:
      "Try the Rambla. There's a dragon down there that's been fooling tourists for over a century — much better at it than I ever was.",
    nextArea: "La Rambla — the Mosaic and the Dragon",
    nextClueHint: "Look for a colorful circular mosaic set into the pavement, and a dragon holding an umbrella on a nearby building corner.",
  },
  {
    id: 10,
    name: "La Rambla — the Mosaic and the Dragon",
    act: 2,
    judging: "dragon",
    creature: "The Umbrella Dragon",
    real: false,
    character: "The Umbrella Dragon",
    meetLine: "perched on the corner of an old shop, holding an umbrella, as it has for over a century",
    greeting:
      "Yes, I'm a dragon. Yes, I'm holding an umbrella. No, I am not the one you're hunting — I've just been advertising parasols since 1885 and I'm very good at my job. Step on the mosaic behind you while you're here; everyone does.",
    history:
      "This dragon-and-umbrella sculpture has marked an old umbrella and parasol shop on La Rambla since 1885. A few steps away, Joan Miró set a large circular mosaic into the pavement itself in 1976, marking the heart of the street he grew up walking.",
    challengeText:
      "Stand in the center of Miró's mosaic. As a group, name three colors you see in it, then take a photo standing on it with the dragon visible in the background.",
    factLog: "The umbrella-shop dragon on La Rambla dates to 1885; Joan Miró's pavement mosaic nearby was installed in 1976.",
    moral: "Spectacle Isn't Substance",
    farewell:
      "If you're hunting something real, try the market with the wild roof. Things hide in plain colorful sight there too.",
    nextArea: "Mercat Santa Caterina",
    nextClueHint: "Look for a wavy, multicolored mosaic roof rising above a row of market stalls.",
  },
  {
    id: 11,
    name: "Mercat Santa Caterina",
    act: 2,
    judging: "staff",
    character: "Mariona, the Fruit Seller",
    meetLine: "behind a stall stacked with produce in every color of that roof above her",
    greeting:
      "Third generation, this stall. My grandmother sold here before this roof existed — back when the market was plainer, and so, frankly, was the gossip. You want a dragon? I sell better colors than any dragon ever wore. Prove you've actually looked at them.",
    history:
      "Mercat Santa Caterina has stood on this site since 1848, built over the ruins of a medieval convent destroyed in 1835. Its wave-shaped, multicolored mosaic roof was added in a 2005 renovation by architects Enric Miralles and Benedetta Tagliabue, echoing the produce sold beneath it.",
    challengeText:
      "Photograph produce in five different colors around the market, then use those exact colors to paint your group as a mosaic portrait, pixel by pixel.",
    factLog: "Mercat Santa Caterina's wave-shaped 2005 roof, by Enric Miralles and Benedetta Tagliabue, was designed to echo the colors of the produce sold inside.",
    moral: "Color Tells a True Story Too",
    farewell:
      "No dragons here, just good fruit. But I'll tell you — if I were hiding something, I'd hide it somewhere loud and beautiful, like that concert hall uptown. Go ask the man with the temper about music.",
    nextArea: "Palau de la Música Catalana",
    nextClueHint: "Look for an ornate stained-glass and mosaic facade on a narrow street, unmistakably more decorated than its neighbors.",
  },
  {
    id: 12,
    name: "Palau de la Música Catalana",
    act: 2,
    judging: "staff",
    character: "Beethoven",
    meetLine: "carved in stone above the facade, glowering down at passersby",
    greeting:
      "I never set foot in this city, and they put my face on this building anyway. I suppose that's what happens when an orchestra venerates you. Don't waste my afterlife — prove you can make a sound worth hearing.",
    history:
      "Palau de la Música Catalana, built between 1905 and 1908 by Lluís Domènech i Montaner, is covered in mosaics, stained glass, and sculpture — including a bust of Beethoven, honoring the European composers the Orfeó Català choir championed.",
    challengeText:
      "As a full group, sing one verse of any song together, loudly enough that strangers nearby can hear it. No instruments allowed.",
    factLog: "Palau de la Música Catalana (1905–1908), designed by Lluís Domènech i Montaner, honors composers like Beethoven in its sculpture despite his having no direct tie to Barcelona.",
    moral: "Full Chorus",
    farewell:
      "...Acceptable. Now go. There's an arch up near the old Exposition grounds covered in carved figures — one more architect this city owes credit to, and one more creature worth a closer look before you finish this.",
    nextArea: "the Arc de Triomf",
    nextClueHint: "Look for a tall freestanding brick arch spanning a wide avenue, covered in carved figures and shields.",
  },
  {
    id: 13,
    name: "Arc de Triomf",
    act: 2,
    judging: "staff",
    character: "The Winged Figure of the Arch",
    meetLine: "carved into the brickwork above you, wings spread, easy to miss if you don't look up",
    greeting:
      "Everyone walks under me and looks at the arch. Nobody looks at me. I've been holding this corner up, decoratively speaking, since this whole avenue was built for a party that lasted six months and never came back.",
    history:
      "The Arc de Triomf was designed by Josep Vilaseca i Casanovas as the grand entrance to the 1888 Barcelona Universal Exposition. Its brick and sculptural reliefs — by several different sculptors — depict Barcelona welcoming visiting nations, along with shields, allegorical figures, and winged creatures worked into the ornamentation.",
    challengeText:
      "Find one carved winged or animal figure on the arch besides the main reliefs. Photograph it, and as a group, guess out loud what it's doing there before reading the plaque (if there is one).",
    factLog: "The Arc de Triomf (1888) was designed by Josep Vilaseca i Casanovas as the entrance to that year's Barcelona Universal Exposition.",
    moral: "Look Up Once in a While",
    farewell:
      "Go on, then. Last stop. Whatever you've been hunting, it isn't hiding in brickwork anymore — it's standing in the open, back where this whole thing started.",
    nextArea: "Plaça Sant Jaume — the Finale",
    nextClueHint: "Look for the carved skull beneath the bridge you crossed earlier — you're going back the way you came.",
  },
  {
    id: 14,
    name: "Plaça Sant Jaume — The Finale",
    act: 2,
    judging: "finale",
    creature: "Sant Jordi's Dragon",
    real: true,
    character: "The Watcher",
    meetLine: "waiting exactly where the bridge first sent you off",
    greeting:
      "You're back. Good — that means you found nothing, four times over, and didn't settle for any of it. A bird. An umbrella. A roof full of fruit. A wing in the brickwork. None of them were it, and you knew that, and kept going anyway. Look up.",
    history:
      "Sant Jordi (Saint George) is Catalonia's patron saint, honored every April 23rd — Barcelona's biggest celebration of books and roses — for slaying a dragon to save a princess. Versions of that dragon are carved, painted, or tiled onto buildings all across this city, including several within sight of where you're standing right now.",
    challengeText:
      "Find a real carved or sculpted Sant Jordi dragon within sight of this square. Photograph your whole group with it, and explain in one sentence why this one — and not the bird, the umbrella, the roof, or the wing — is the one you were sent to find.",
    factLog: "Sant Jordi, Catalonia's patron saint, is honored every April 23rd for slaying a dragon — versions of which are carved across many buildings in this part of the city.",
    moral: "Discernment",
    farewell:
      "There it is. Not loud, not hiding, not pretending to be anything else — just old stone, doing what it's always done, waiting for someone to actually look. That's the whole hunt, in the end. Well done.",
    nextArea: null,
    nextClueHint: null,
  },
];

const PIT_STOP = {
  name: "Rest Stop",
  body: "Six letters found, a word decoded, and a Watcher's warning behind you. Before the real hunt starts, take a breather — water, shade, whatever your group needs. Act Two doesn't wait for anyone, but it can wait a few minutes for you.",
  nextArea: "Sant Felip Neri",
};

const ARC_LETTERS = ["G", "R", "A", "N", "D", "O"];
const TARGET_WORD = "DRAGON";

const BADGE_INFO = {
  "Quiet Mind": "Solved a station calmly and correctly, with no staff help needed.",
  "Speed Demon": "Won the quarry-math relay race at Santa Maria del Mar.",
  "Dead-Eye": "Pinned the skull blindfolded beneath Pont del Bisbe.",
  "Full Chorus": "Got the whole group singing Ode to Joy at Palau de la Música.",
};

// Approximate coordinates, lifted from Barcelona_Scavenger_Hunt_Map.html,
// used to draw the mini route map shown in the "travel" phase.
const STATION_COORDS = {
  1: { lat: 41.3840623, lng: 2.1755418 }, // Roman Wall
  2: { lat: 41.384328, lng: 2.1721085 }, // Dead Poets / Necropolis
  3: { lat: 41.384293, lng: 2.1772144 }, // Plaça del Rei
  4: { lat: 41.3841139, lng: 2.1758197 }, // Turtle / Casa de l'Ardiaca
  5: { lat: 41.3856755, lng: 2.1836464 }, // El Born
  6: { lat: 41.3837677, lng: 2.1823321 }, // Bastaixos / Santa Maria del Mar
  7: { lat: 41.3833417, lng: 2.1764212 }, // Pont del Bisbe
  8: { lat: 41.3833791, lng: 2.1750909 }, // Sant Felip Neri
  9: { lat: 41.3790491, lng: 2.1741761 }, // Palau Güell
  10: { lat: 41.3812597, lng: 2.173335 }, // Rambla — Miró mosaic / Dragon
  11: { lat: 41.3862725, lng: 2.1783697 }, // Mercat Santa Caterina
  12: { lat: 41.3875443, lng: 2.1754943 }, // Palau de la Música
  13: { lat: 41.3909, lng: 2.1817 }, // Arc de Triomf
  14: { lat: 41.3826576, lng: 2.1769645 }, // Plaça Sant Jaume — Finale
};
const PIT_STOP_COORD = { lat: 41.3845825, lng: 2.1755307 };

function StationBadgeDot({ act }) {
  return (
    <span
      className={
        "inline-block w-2 h-2 rounded-full mr-2 " +
        (act === 1 ? "bg-amber-600" : "bg-rose-700")
      }
    />
  );
}

/* ---------------------------------------------------------------------- */
/* DRAWING PAD — Station 6, El Born (sketch the lost street)              */
/* ---------------------------------------------------------------------- */
function DrawingPad() {
  const canvasRef = React.useRef(null);
  const drawingRef = React.useRef(false);
  const [color, setColor] = React.useState("#2b2620");

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function startDraw(e) {
    drawingRef.current = true;
    draw(e);
  }
  function stopDraw() {
    drawingRef.current = false;
  }
  function draw(e) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  function clearPad() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const colors = ["#2b2620", "#92400e", "#1e3a8a", "#166534", "#b91c1c"];

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">Sketch the lost street</p>
      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full rounded-xl border-2 border-dashed border-[#cfc09a] bg-[#FBF6E8] touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={"w-6 h-6 rounded-full border-2 " + (color === c ? "border-[#2b2620]" : "border-transparent")}
            style={{ backgroundColor: c }}
          />
        ))}
        <button onClick={clearPad} className="ml-auto text-xs border border-[#cfc09a] rounded-full px-3 py-1 hover:bg-[#e3d8bc]">
          Clear
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* PIXEL MATCH TOOL — Station 9, Mercat Santa Caterina (color-match game)  */
/* ---------------------------------------------------------------------- */
const PIXEL_PALETTE = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed", "#db2777"];

function PixelMatchTool() {
  const targetColors = React.useMemo(
    () => Array.from({ length: 5 }).map(() => PIXEL_PALETTE[Math.floor(Math.random() * PIXEL_PALETTE.length)]),
    []
  );
  const grid = React.useMemo(
    () => Array.from({ length: 36 }).map(() => PIXEL_PALETTE[Math.floor(Math.random() * PIXEL_PALETTE.length)]),
    []
  );
  const [found, setFound] = React.useState([]);

  function tapCell(i, c) {
    if (found.includes(i)) return;
    if (targetColors.includes(c) && found.length < targetColors.length) {
      setFound((p) => [...p, i]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">
        Find the matching colors under the scaled roof
      </p>
      <div className="flex gap-1.5">
        {targetColors.map((c, i) => (
          <span key={i} className="w-6 h-6 rounded-md border border-[#8a7a5a]" style={{ backgroundColor: c }} />
        ))}
        <span className="ml-auto text-xs text-[#a8987a] self-center">{found.length}/{targetColors.length} found</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {grid.map((c, i) => (
          <button
            key={i}
            onClick={() => tapCell(i, c)}
            className={"aspect-square rounded-md border transition-opacity " + (found.includes(i) ? "ring-2 ring-emerald-600 opacity-60" : "border-[#cfc09a]")}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MOSAIC BUILDER — Station 9, Mercat Santa Caterina                       */
/* Camper photographs produce of different colors, then uses those colors  */
/* to paint a low-res mosaic portrait of the group, pixel-art style.       */
/* ---------------------------------------------------------------------- */
const MOSAIC_ROWS = 12;
const MOSAIC_COLS = 10;
// A simple blank-silhouette guide (1 = part of the figure outline, just a
// faint hint so campers have something to paint over, not a strict template).
const MOSAIC_GUIDE = [
  "0001111000","0011111100","0011111100","0001111000",
  "0000110000","0001111000","0011111100","0111111110",
  "0111111110","0111111110","0110000110","0110000110",
];

function MosaicBuilder() {
  const [foundColors, setFoundColors] = React.useState([]);
  const [palette] = React.useState(() =>
    Array.from({ length: 5 }).map(() => PIXEL_PALETTE[Math.floor(Math.random() * PIXEL_PALETTE.length)])
  );
  const [activeColor, setActiveColor] = React.useState(null);
  const [cells, setCells] = React.useState(Array(MOSAIC_ROWS * MOSAIC_COLS).fill(null));
  const paintingRef = React.useRef(false);

  function photographProduce(c) {
    setFoundColors((p) => (p.includes(c) ? p : [...p, c]));
    setActiveColor(c);
  }

  function paintCell(i) {
    if (!activeColor) return;
    setCells((p) => {
      const next = [...p];
      next[i] = activeColor;
      return next;
    });
  }

  if (foundColors.length < palette.length) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">
          Step 1 — Photograph produce in these colors
        </p>
        <p className="text-xs text-[#a8987a]">Tap each color once you've found and photographed matching produce in the stalls.</p>
        <div className="flex gap-2">
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => photographProduce(c)}
              className={"w-10 h-10 rounded-lg border-2 " + (foundColors.includes(c) ? "border-emerald-600" : "border-[#cfc09a]")}
              style={{ backgroundColor: c }}
            >
              {foundColors.includes(c) && <CheckCircle2 className="w-4 h-4 text-white mx-auto drop-shadow" />}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#a8987a]">{foundColors.length}/{palette.length} colors photographed</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">
        Step 2 — Paint your group as a mosaic, using only the colors you found
      </p>
      <div className="flex gap-2 mb-1">
        {palette.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveColor(c)}
            className={"w-7 h-7 rounded-md border-2 " + (activeColor === c ? "border-[#2b2620]" : "border-transparent")}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div
        className="grid gap-[2px] bg-[#e9e1cb] p-1.5 rounded-lg border border-[#cfc09a] select-none"
        style={{ gridTemplateColumns: `repeat(${MOSAIC_COLS}, 1fr)`, touchAction: "none" }}
        onMouseDown={() => (paintingRef.current = true)}
        onMouseUp={() => (paintingRef.current = false)}
        onMouseLeave={() => (paintingRef.current = false)}
      >
        {cells.map((c, i) => {
          const r = Math.floor(i / MOSAIC_COLS);
          const colInRow = i % MOSAIC_COLS;
          const guideOn = MOSAIC_GUIDE[r] && MOSAIC_GUIDE[r][colInRow] === "1";
          return (
            <button
              key={i}
              onMouseDown={() => paintCell(i)}
              onMouseEnter={() => paintingRef.current && paintCell(i)}
              className="aspect-square rounded-[2px]"
              style={{ backgroundColor: c || (guideOn ? "#dfd3ad" : "#f1e9d8") }}
            />
          );
        })}
      </div>
      <p className="text-[11px] text-[#a8987a] italic">Click and drag to paint. The faint shape is just a guide — make it your own.</p>
    </div>
  );
}

function ChallengeProofUpload() {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">Challenge proof</p>
      <PicturePlaceholder label="Upload your photo" sublabel="proof your group completed this challenge — goes into the City Chronicle album" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* PICTURE PLACEHOLDER                                                    */
/* ---------------------------------------------------------------------- */
function PicturePlaceholder({ label, sublabel, tall = false, compact = false, src = null }) {
  const candidates = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : [];
  const [attempt, setAttempt] = React.useState(0);

  // Reset the attempt counter whenever the candidate list itself changes
  // (e.g. navigating to a different station), so a previous 404 doesn't
  // carry over and skip a valid first candidate for the new image.
  const candidatesKey = candidates.join("|");
  React.useEffect(() => {
    setAttempt(0);
  }, [candidatesKey]);

  const currentSrc = candidates[attempt];

  if (currentSrc) {
    return (
      <div
        className={
          "relative w-full rounded-xl overflow-hidden bg-[#e9e1cb] " +
          (compact ? "aspect-square" : tall ? "aspect-[3/4]" : "aspect-[16/10]")
        }
      >
        <img
          src={currentSrc}
          alt={label || sublabel || "station photo"}
          onError={() => setAttempt((a) => a + 1)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={
        "relative w-full rounded-xl border-2 border-dashed border-[#cfc09a] bg-[#e9e1cb] flex flex-col items-center justify-center gap-1.5 overflow-hidden text-center px-3 " +
        (compact ? "aspect-square" : tall ? "aspect-[3/4]" : "aspect-[16/10]")
      }
    >
      <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(45deg,#2b2620_0,#2b2620_1px,transparent_1px,transparent_10px)]" />
      <ImagePlus className={compact ? "w-4 h-4 text-[#a8987a]" : "w-6 h-6 text-[#a8987a]"} />
      {!compact && (
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8a7a5a]">
          {label}
        </span>
      )}
      {sublabel && !compact && (
        <span className="text-[10px] text-[#a8987a] leading-snug">{sublabel}</span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ARCH SHAPE — drawn arches for the Saló del Tinell reward                */
/* ---------------------------------------------------------------------- */
function ArchShape({ letter, filled, locked }) {
  return (
    <svg viewBox="0 0 40 56" className="w-9 h-12 sm:w-10 sm:h-14">
      <path
        d="M3 54 V20 A17 17 0 0 1 37 20 V54 Z"
        fill={filled ? "#d97706" : locked ? "#d8cba3" : "#e3d8bc"}
        stroke={filled ? "#92400e" : "#cfc09a"}
        strokeWidth="2"
      />
      {filled && (
        <text
          x="20"
          y="40"
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill="white"
          fontFamily="'Cinzel', serif"
        >
          {letter}
        </text>
      )}
    </svg>
  );
}

function loadStoredGroup() {
  try {
    const raw = window.localStorage.getItem("architecreature_group_v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ScavengerHuntPrototype() {
  const [role, setRole] = useState("camper");
  // No-Supabase / local-demo mode skips straight to "intro" (keeps the
  // prototype click-through-able without live credentials). When Supabase
  // is configured, campers land on "join" unless this device already has a
  // group stored from earlier in the event.
  const [group, setGroup] = useState(() => (supabaseConfigured ? loadStoredGroup() : null));
  const [screen, setScreen] = useState(() => {
    if (!supabaseConfigured) return "intro";
    return loadStoredGroup() ? "intro" : "join";
  }); // join -> intro -> instructions -> hunt -> closing

  const [stationIdx, setStationIdx] = useState(0);
  const [phase, setPhase] = useState("arrive"); // arrive -> meet -> history -> challenge -> [bridge -> swordpuzzle ->] resolved -> travel
  const [lettersCollected, setLettersCollected] = useState([]);
  const [arcsPopped, setArcsPopped] = useState(false);
  const [sword, setSword] = useState(false);
  const [dragonCards, setDragonCards] = useState({}); // {stationId: 'x' | 'real'}
  const [badges, setBadges] = useState([]);
  const [iceCream, setIceCream] = useState(false);
  const [pending, setPending] = useState(null);
  const [orderGuess, setOrderGuess] = useState([]);
  const [finaleDone, setFinaleDone] = useState(false);
  const [log, setLog] = useState([]);
  const [chronicle, setChronicle] = useState([]); // [{id,name,fact,moral}]
  const [stationsData, setStationsData] = useState(STATIONS);
  const [stationsSyncStatus, setStationsSyncStatus] = useState(
    supabaseConfigured ? "loading" : "local-only"
  ); // 'local-only' | 'loading' | 'synced' | 'error'
  const [groupsList, setGroupsList] = useState([]);
  const [groupsSyncStatus, setGroupsSyncStatus] = useState(
    supabaseConfigured ? "loading" : "local-only"
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchStations();
      if (cancelled) return;
      if (remote) {
        setStationsData((prev) => mergeRemoteStations(prev, remote));
        setStationsSyncStatus("synced");
      } else {
        setStationsSyncStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchGroups();
      if (cancelled) return;
      if (remote) {
        setGroupsList(remote);
        setGroupsSyncStatus("synced");
      } else {
        setGroupsSyncStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleJoin(code) {
    const { group: joined, error } = await joinGroupByCode(code);
    if (joined) {
      setGroup(joined);
      try {
        window.localStorage.setItem("architecreature_group_v1", JSON.stringify(joined));
      } catch {
        // Storage can fail in private-browsing modes — joining still works
        // for this session, it just won't survive a refresh.
      }
      setScreen("intro");
    }
    return error;
  }

  const station = stationsData[stationIdx];

  function updateStation(id, updatedFields) {
    setStationsData((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)));
  }

  async function saveStationEdit(id, draft) {
    if (supabaseConfigured) {
      const ok = await updateStationRemote(id, draft);
      if (!ok) return false;
    }
    updateStation(id, draft);
    return true;
  }

  function pushLog(msg) {
    setLog((l) => [msg, ...l].slice(0, 12));
  }

  function recordChronicle(st) {
    setChronicle((c) => [...c, { id: st.id, name: st.name, fact: st.factLog, moral: st.moral }]);
  }

  function awardStation(st) {
    if (st.letter) setLettersCollected((p) => [...p, st.letter]);
    if (st.popsArches) setArcsPopped(true);
    if (st.badge) setBadges((p) => Array.from(new Set([...p, st.badge])));
    if (st.reward) setIceCream(true);
    pushLog(`Station ${st.id} (${st.name}) completed.`);
    recordChronicle(st);
    setPhase("resolved");
  }

  function advanceToNextStation() {
    setStationIdx((i) => Math.min(i + 1, stationsData.length - 1));
    setOrderGuess([]);
    setPhase("meet");
  }

  function goToMap() {
    setPhase(station.id === 7 ? "pitstop" : "travel");
  }

  function submitChallenge() {
    if (station.judging === "staff") {
      setPending(station);
      pushLog(`Submitted to staff for approval: Station ${station.id}.`);
    } else if (station.judging === "palace") {
      setPending(station);
      pushLog(`Submitted to staff for approval: Station ${station.id} (Palau Güell).`);
    } else if (station.judging === "auto") {
      awardStation(station);
    } else if (station.judging === "dragon") {
      setDragonCards((p) => ({ ...p, [station.id]: "x" }));
      pushLog(`Dragon Collection card revealed: ${station.creature} — stamped with an X.`);
      recordChronicle(station);
      setPhase("resolved");
    } else if (station.judging === "finale") {
      setDragonCards((p) => ({ ...p, [station.id]: "real" }));
      setFinaleDone(true);
      pushLog("Finale submitted — real dragon identified: Sant Jordi.");
      recordChronicle(station);
      setPhase("resolved");
    } else if (station.judging === "bridge") {
      // blindfold challenge complete -> badge now, then bridge intermission
      if (station.badge) setBadges((p) => Array.from(new Set([...p, station.badge])));
      pushLog("Pin the Skull complete — the Watcher has something to say.");
      setPhase("bridge");
    }
  }

  function submitCrossingChallenge() {
    setDragonCards((p) => ({ ...p, [station.id]: "x" }));
    pushLog(`Dragon Collection card revealed: ${station.creature} — stamped with an X.`);
    setChronicle((c) => [...c, { id: station.id, name: "Hotel across the street", fact: station.crossFactLog, moral: station.crossMoral }]);
    setPhase("resolved");
  }

  function approvePending() {
    if (!pending) return;
    if (pending.judging === "palace") {
      pushLog(`Station ${pending.id} (${pending.name}) — palace challenge approved.`);
      setChronicle((c) => [...c, { id: pending.id, name: pending.name, fact: pending.factLog, moral: pending.moral }]);
      setPhase("tip");
      setPending(null);
      return;
    }
    awardStation(pending);
    setPending(null);
  }

  function rejectPending() {
    if (!pending) return;
    pushLog(`Staff sent Station ${pending.id} back for another attempt.`);
    setPending(null);
  }

  function toggleLetter(letter, idx) {
    setOrderGuess((p) => [...p, { letter, idx }]);
  }

  function resetOrder() {
    setOrderGuess([]);
  }

  function submitSwordOrder() {
    const guess = orderGuess.map((o) => o.letter).join("");
    if (guess === TARGET_WORD) {
      setSword(true);
      pushLog("Letters correctly rearranged into DRAGON. The word is unlocked.");
      recordChronicle(station);
      setPhase("resolved");
    } else {
      pushLog(`Order "${guess}" is not correct — try again.`);
      setOrderGuess([]);
    }
  }

  const usedIdx = new Set(orderGuess.map((o) => o.idx));

  function resetAll() {
    setStationIdx(0);
    setPhase("arrive");
    setLettersCollected([]);
    setArcsPopped(false);
    setSword(false);
    setDragonCards({});
    setBadges([]);
    setIceCream(false);
    setPending(null);
    setOrderGuess([]);
    setFinaleDone(false);
    setLog([]);
    setChronicle([]);
    setScreen("intro");
  }

  return (
    <div className="min-h-screen w-full bg-[#F1E9D8] text-[#2b2620] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
        .quest-display { font-family: 'Cinzel', serif; }
        .quest-body { font-family: 'Source Sans 3', sans-serif; }
        @keyframes pulseDot { 0%,100% { r: 7; opacity: 1; } 50% { r: 10; opacity: 0.6; } }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
      `}</style>

      <div className="quest-body sticky top-0 z-10 bg-[#2b2620] text-[#F1E9D8] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="quest-display text-lg tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Architecreature Hunt — Prototype
        </div>
        <div className="flex gap-1 bg-[#3a332a] rounded-full p-1">
          {[
            { id: "camper", label: "Camper", icon: MapPin },
            { id: "staff", label: "Staff", icon: ShieldCheck },
            { id: "admin", label: "Admin", icon: LayoutDashboard },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors " +
                (role === r.id
                  ? "bg-amber-500 text-[#2b2620] font-semibold"
                  : "text-[#cfc6b3] hover:text-white")
              }
            >
              <r.icon className="w-3.5 h-3.5" />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {role === "camper" && screen === "join" && (
          <JoinScreen onJoin={handleJoin} />
        )}

        {role === "camper" && screen === "intro" && (
          <IntroScreen onBegin={() => setScreen("instructions")} groupName={group?.name} />
        )}

        {role === "camper" && screen === "instructions" && (
          <InstructionsScreen onStart={() => setScreen("hunt")} onBack={() => setScreen("intro")} />
        )}

        {role === "camper" && screen === "hunt" && (
          <CamperView
            station={station}
            stationsData={stationsData}
            stationIdx={stationIdx}
            total={stationsData.length}
            phase={phase}
            setPhase={setPhase}
            lettersCollected={lettersCollected}
            arcsPopped={arcsPopped}
            sword={sword}
            dragonCards={dragonCards}
            badges={badges}
            iceCream={iceCream}
            pending={pending}
            orderGuess={orderGuess}
            usedIdx={usedIdx}
            toggleLetter={toggleLetter}
            resetOrder={resetOrder}
            submitSwordOrder={submitSwordOrder}
            submitChallenge={submitChallenge}
            submitCrossingChallenge={submitCrossingChallenge}
            advanceToNextStation={advanceToNextStation}
            goToMap={goToMap}
            finaleDone={finaleDone}
            chronicle={chronicle}
            onFinishHunt={() => setScreen("closing")}
          />
        )}

        {role === "camper" && screen === "closing" && (
          <ClosingScreen
            chronicle={chronicle}
            lettersCollected={lettersCollected}
            badges={badges}
            sword={sword}
            iceCream={iceCream}
            dragonCards={dragonCards}
            onRestart={resetAll}
          />
        )}

        {role === "staff" && (
          <StaffView pending={pending} approvePending={approvePending} rejectPending={rejectPending} station={station} log={log} />
        )}

        {role === "admin" && (
          <AdminView
            stationsData={stationsData}
            saveStationEdit={saveStationEdit}
            stationsSyncStatus={stationsSyncStatus}
            groupsList={groupsList}
            groupsSyncStatus={groupsSyncStatus}
            group={group}
            stationIdx={stationIdx}
            lettersCollected={lettersCollected}
            badges={badges}
            dragonCards={dragonCards}
            sword={sword}
            iceCream={iceCream}
            finaleDone={finaleDone}
          />
        )}
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={"bg-[#FBF6E8] border border-[#cfc09a] rounded-xl p-5 shadow-sm " + className}>{children}</div>;
}

/* ---------------------------------------------------------------------- */
/* JOIN SCREEN                                                            */
/* ---------------------------------------------------------------------- */
const JOIN_ERROR_COPY = {
  not_found: "That code didn't match any group. Double-check it with a staff member and try again.",
  unknown: "Couldn't reach the server. Check your connection and try again.",
  unconfigured: "This device isn't connected to the event server yet — ask staff for help.",
};

function JoinScreen({ onJoin }) {
  const [nickname, setNickname] = React.useState("");
  const [code, setCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await onJoin(code);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <div className="space-y-5 quest-body">
      <Card className="text-center py-10">
        <KeyRound className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h1 className="quest-display text-2xl sm:text-3xl mb-2">Join the Hunt</h1>
        <p className="text-sm text-[#8a7a5a] max-w-sm mx-auto mb-8">
          Enter your group's nickname and the join code staff gave you. No account, no password — just the code.
        </p>
        <form onSubmit={handleSubmit} className="max-w-xs mx-auto space-y-3 text-left">
          <div>
            <label htmlFor="join-nickname" className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold block mb-1">
              Group nickname
            </label>
            <input
              id="join-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. The Falcons"
              className="w-full text-sm border border-[#cfc09a] rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label htmlFor="join-code" className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold block mb-1">
              Join code
            </label>
            <input
              id="join-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FALCON7"
              className="w-full text-sm border border-[#cfc09a] rounded-md px-3 py-2 bg-white uppercase"
              autoCapitalize="characters"
            />
          </div>
          {error && <p className="text-xs text-rose-700">{JOIN_ERROR_COPY[error] || JOIN_ERROR_COPY.unknown}</p>}
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-[#2b2620] text-amber-300 rounded-full px-7 py-3 text-sm font-semibold hover:bg-[#3a332a] transition-colors disabled:opacity-50"
          >
            {submitting ? "Checking…" : "Join the Hunt"}
          </button>
        </form>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* INTRO SCREEN                                                           */
/* ---------------------------------------------------------------------- */
function IntroScreen({ onBegin, groupName }) {
  return (
    <div className="space-y-5 quest-body">
      <Card className="text-center py-10">
        <Flame className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h1 className="quest-display text-2xl sm:text-3xl mb-2">Architecreature Hunt</h1>
        <p className="text-sm text-[#a8987a] uppercase tracking-wide font-semibold mb-6">
          A photo hunt for the hidden creatures of Barcelona's architecture
        </p>
        {groupName && (
          <p className="text-xs text-emerald-700 font-semibold mb-2">Welcome, {groupName}!</p>
        )}
        <p className="text-[#4a4233] leading-relaxed max-w-md mx-auto mb-2">
          Something is hiding in this city — something that has worn many faces, in many places, for a very long time.
        </p>
        <p className="text-[#4a4233] leading-relaxed max-w-md mx-auto mb-8">
          Before your group can hunt it, you'll need to understand what you're looking for. Six arches. Six letters.
          One quest, then the HUNT begins.
        </p>
        <PicturePlaceholder src={titleImageUrl()} label="Title illustration" sublabel="a wall carved with heraldic signs, somewhere in the old quarter" tall={false} />
        <button
          onClick={onBegin}
          className="mt-8 inline-flex items-center justify-center gap-1.5 bg-[#2b2620] text-amber-300 rounded-full px-7 py-3 text-sm font-semibold hover:bg-[#3a332a] transition-colors"
        >
          Begin <ChevronRight className="w-4 h-4" />
        </button>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* INSTRUCTIONS SCREEN                                                    */
/* ---------------------------------------------------------------------- */
function InstructionsScreen({ onStart, onBack }) {
  const steps = [
    {
      title: "Meet each character",
      body: "At every stop, a character from the city's history (or its legends) greets your group, then tells you what really happened there.",
    },
    {
      title: "Clear the challenge",
      body: "Every station has a physical, creative, or thinking challenge. Some are judged automatically, some by staff, some by simply completing them together.",
    },
    {
      title: "Collect your letters",
      body: "Stations 1–6 each award a letter. Keep them — at the bridge (Pont del Bisbe), you'll need to arrange all six into a single word before you can continue.",
    },
    {
      title: "Find the next clue",
      body: "Before you leave a station, you'll be shown something to look for at the next one. Spot it when you arrive — that's how you know you're in the right place.",
    },
    {
      title: "Hunt the creature",
      body: "From the bridge onward, you're not just learning the city anymore — you're hunting something hiding inside it. Not everything that looks real is the one you want.",
    },
    {
      title: "Keep your Chronicle",
      body: "Every station adds a real historical fact and a moral to your group's City Chronicle. By the end, you'll have the whole story in your own hands.",
    },
  ];
  return (
    <div className="space-y-5 quest-body">
      <Card>
        <h2 className="quest-display text-xl mb-1 flex items-center gap-2">
          <ScrollText className="w-5 h-5" /> How this works
        </h2>
        <p className="text-xs text-[#a8987a] uppercase tracking-wide font-semibold mb-4">
          An Experiential Learning Experience in 2 Acts
        </p>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-[#2b2620] text-sm">{s.title}</p>
                <p className="text-sm text-[#6b5f4a] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-[#e9e1cb] border border-[#cfc09a] px-3 py-2.5 mt-5 text-sm text-[#4a4233]">
          14 stations, two Acts, one city. Stay together, look closely, and don't trust everything you meet.
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onBack} className="flex items-center gap-1 text-sm border border-[#cfc09a] rounded-full px-4 py-2 hover:bg-[#e3d8bc]">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Start the QUEST <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* CLOSING SCREEN — congratulations + compiled moral of the story         */
/* ---------------------------------------------------------------------- */
function ClosingScreen({ chronicle, lettersCollected, badges, sword, iceCream, dragonCards, onRestart }) {
  const realFound = Object.values(dragonCards).includes("real");
  return (
    <div className="space-y-5 quest-body">
      <Card className="text-center py-8">
        <Trophy className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h1 className="quest-display text-2xl mb-1">The Hunt is Complete</h1>
        <p className="text-sm text-[#a8987a] uppercase tracking-wide font-semibold mb-5">
          {realFound ? "Sant Jordi's Dragon — found at last" : "Hunt ended early"}
        </p>
        <PicturePlaceholder label="Final group photo" sublabel="add your group's last photo together, here at the Generalitat" />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide mb-3">What you walked away with</h3>
        <div className="grid grid-cols-2 gap-3 text-sm text-[#4a4233] mb-4">
          <div><span className="font-semibold">Letters:</span> {lettersCollected.join("") || "—"}</div>
          <div><span className="font-semibold">The Word:</span> {sword ? "DRAGON" : "Not yet solved"}</div>
          <div><span className="font-semibold">Badges:</span> {badges.length}</div>
          <div><span className="font-semibold">Ice cream:</span> {iceCream ? "Yes" : "No"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="text-xs bg-[#2b2620] text-amber-300 rounded-full px-3 py-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {b}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="quest-display text-base mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> The Moral of the Story
        </h3>
        <p className="text-[#4a4233] leading-relaxed mb-4">
          You started today by learning that nothing stands without a foundation — and you ended it staring down
          something that had been hiding, in plain sight, all along. In between, the city asked you for patience,
          sacrifice, imagination, and honesty about what's real and what only looks real up close. Three times today
          you found something convincing and walked away from it anyway — and that, it turns out, wasn't failure.
          That was the whole skill. The thing worth protecting was never going to be the loudest, scariest, most
          obvious thing in the room. It was the one still standing quietly in front of you, waiting to be recognized
          for what it actually was.
        </p>
        {chronicle.length > 0 && (
          <details className="text-sm text-[#6b5f4a]">
            <summary className="cursor-pointer font-semibold text-[#4a4233]">See every moral, station by station</summary>
            <ul className="mt-2 space-y-1.5">
              {chronicle.map((c, i) => (
                <li key={i}><span className="font-semibold">{c.name}:</span> {c.moral}</li>
              ))}
            </ul>
          </details>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide mb-2">Aqua Blava, Grana Caelum, Terra Bona, Bona Gent</h3>
        <p className="text-sm text-[#4a4233] leading-relaxed">
          Good water, a good sky, good earth, good people. The city you walked through today didn't last two
          thousand years on stone and good luck — it lasted because of that. You're standing in the proof that it did.
        </p>
      </Card>

      <div className="text-center pt-2">
        <button onClick={onRestart} className="text-sm border border-[#cfc09a] rounded-full px-5 py-2 hover:bg-[#e3d8bc]">
          Start a new hunt
        </button>
      </div>
    </div>
  );
}

const PHASE_ORDER_DEFAULT = ["meet", "history", "challenge", "resolved", "travel"];
const PHASE_ORDER_BRIDGE = ["meet", "history", "challenge", "bridge", "swordpuzzle", "resolved", "pitstop", "travel"];
const PHASE_ORDER_PALACE = ["meet", "history", "challenge", "tip", "crossing", "resolved", "travel"];

function getPhaseOrder(station) {
  if (station.judging === "bridge") return PHASE_ORDER_BRIDGE;
  if (station.judging === "palace") return PHASE_ORDER_PALACE;
  return PHASE_ORDER_DEFAULT;
}

function StepDots({ station, phase }) {
  const steps = getPhaseOrder(station);
  const idx = steps.indexOf(phase);
  return (
    <div className="flex items-center gap-1.5 mb-4">
      {steps.map((s, i) => (
        <span key={s} className={"h-1.5 rounded-full transition-all " + (i <= idx ? "bg-amber-600 w-6" : "bg-[#e3d8bc] w-3.5")} />
      ))}
    </div>
  );
}

function BackButton({ station, phase, setPhase }) {
  const order = getPhaseOrder(station);
  const idx = order.indexOf(phase);
  if (idx <= 0) return null; // idx === -1 (unknown phase) or 0 (first step): nothing to go back to
  return (
    <button
      onClick={() => setPhase(order[idx - 1])}
      className="flex items-center gap-1 text-xs text-[#8a7a5a] hover:text-[#4a4233] mb-3 -mt-1"
    >
      <ChevronLeft className="w-3.5 h-3.5" /> Back
    </button>
  );
}

/* Persistent character strip — shown across every narrative phase so the
   camper always knows who is "talking" to them. */
function CharacterStrip({ station, big = false }) {
  if (big) {
    return (
      <div className="space-y-3">
        <div className="w-40 sm:w-48 mx-auto">
          <PicturePlaceholder src={characterImageUrl(station.id)} label={`Photo of ${station.character}`} sublabel={station.meetLine} compact />
        </div>
        <div className="text-center">
          <h2 className="quest-display text-xl">{station.character}</h2>
          <p className="text-xs italic text-[#a8987a]">{station.meetLine}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 shrink-0">
        <PicturePlaceholder src={characterImageUrl(station.id)} compact />
      </div>
      <div>
        <p className="quest-display text-sm leading-tight">{station.character}</p>
        <p className="text-[11px] italic text-[#a8987a] leading-tight">{station.meetLine}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MINI MAP — used in the "travel" phase between stations                 */
/* ---------------------------------------------------------------------- */
function MiniMap({ fromStation, toStation }) {
  const ids = Object.keys(STATION_COORDS).map(Number);
  const lats = ids.map((id) => STATION_COORDS[id].lat);
  const lngs = ids.map((id) => STATION_COORDS[id].lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const scale = 300 / Math.max(maxLat - minLat, maxLng - minLng);

  function project(id) {
    const c = STATION_COORDS[id];
    return {
      x: (c.lng - minLng) * scale,
      y: (maxLat - c.lat) * scale,
    };
  }

  const points = ids.map((id) => ({ id, ...project(id) }));
  const toPt = project(toStation.id);
  const fromPt = fromStation ? project(fromStation.id) : toPt;
  const pathD = points
    .sort((a, b) => a.id - b.id)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const zoom = 190;
  const viewBox = `${toPt.x - zoom / 2} ${toPt.y - zoom / 2} ${zoom} ${zoom}`;

  return (
    <svg viewBox={viewBox} className="w-full aspect-square rounded-xl border border-[#cfc09a] bg-[#EFE6CC]">
      <path d={pathD} fill="none" stroke="#a8987a" strokeWidth="1.2" strokeDasharray="2 2" />
      {points.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r={3} fill="#cfc09a" stroke="#8a7a5a" strokeWidth="0.6" />
      ))}
      {fromStation && (
        <circle cx={fromPt.x} cy={fromPt.y} r={5} fill="#d97706" stroke="#92400e" strokeWidth="1" />
      )}
      <circle cx={toPt.x} cy={toPt.y} r={7} fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" className="pulse-dot" />
      <text x={toPt.x} y={toPt.y - 12} textAnchor="middle" fontSize="6" fontWeight="700" fill="#2b2620">
        {toStation.id}. {toStation.name}
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/* CAMPER VIEW                                                            */
/* ---------------------------------------------------------------------- */
function CamperView({
  station,
  stationsData,
  stationIdx,
  total,
  phase,
  setPhase,
  lettersCollected,
  arcsPopped,
  sword,
  dragonCards,
  badges,
  iceCream,
  pending,
  orderGuess,
  usedIdx,
  toggleLetter,
  resetOrder,
  submitSwordOrder,
  submitChallenge,
  submitCrossingChallenge,
  advanceToNextStation,
  goToMap,
  finaleDone,
  chronicle,
  onFinishHunt,
}) {
  const isPendingHere = pending && pending.id === station.id;
  const isFinale = station.judging === "finale";
  const isLastStation = stationIdx === total - 1;
  const nextStation = stationsData[stationIdx + 1];
  const [spottedClue, setSpottedClue] = React.useState(false);
  React.useEffect(() => {
    if (phase === "travel" || phase === "arrive") setSpottedClue(false);
  }, [phase, stationIdx]);

  return (
    <div className="space-y-5 quest-body">
      <div className="flex items-center justify-between text-sm text-[#6b5f4a]">
        <span>Station {station.id} of {total}</span>
        <span className="flex items-center gap-2">
          <StationBadgeDot act={station.act} />
          {station.act === 1 ? "Act One — The Quest" : "Act Two — The Hunt"}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#e3d8bc] rounded-full overflow-hidden">
        <div className="h-full bg-amber-600 transition-all" style={{ width: `${((stationIdx + 1) / total) * 100}%` }} />
      </div>

      <Card>
        <p className="text-xs uppercase tracking-wide text-[#a8987a] font-semibold mb-1">{station.name}</p>
        {phase !== "arrive" && <StepDots station={station} phase={phase} />}
        {phase !== "arrive" && <BackButton station={station} phase={phase} setPhase={setPhase} />}

        {phase === "arrive" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Heading to {station.name}
            </h3>
            <MiniMap fromStation={null} toStation={station} />
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">Keep an eye out for</p>
              <PicturePlaceholder src={nextClueImageUrl(station.id)} label={`Something at ${station.name}`} sublabel="Find this before your group can begin." />
            </div>
            <p className="text-xs text-[#a8987a]">Once your group has arrived AND spotted it, you're ready to begin.</p>
            <label className="flex items-center gap-2 text-sm text-[#4a4233] cursor-pointer">
              <input type="checkbox" checked={spottedClue} onChange={(e) => setSpottedClue(e.target.checked)} className="w-4 h-4" />
              We found it!
            </label>
            <button
              onClick={() => setPhase("meet")}
              disabled={!spottedClue}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Arrived — meet {station.character} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === "meet" && (
          <div className="space-y-4">
            <CharacterStrip station={station} big />
            <p className="text-[#4a4233] leading-relaxed">{station.greeting}</p>
            <button
              onClick={() => setPhase("history")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#2b2620] text-amber-300 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#3a332a] transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === "history" && (
          <div className="space-y-4">
            <CharacterStrip station={station} />
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" /> What really happened here
            </h3>
            <p className="text-[#4a4233] leading-relaxed italic">"{station.history}"</p>
            <p className="text-xs text-[#a8987a] italic">
              If you want a hint to continue your quest, you'll have to work as a team and clear the challenge ahead.
            </p>
            <button
              onClick={() => setPhase("challenge")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              See the challenge <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === "challenge" && (
          <div className="space-y-4">
            <CharacterStrip station={station} />
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide">The Challenge</h3>
            <p className="text-[#4a4233] leading-relaxed">{station.challengeText}</p>
            {station.id === 5 && <DrawingPad />}
            {station.id === 11 && <MosaicBuilder />}
            {station.judging !== "dragon" && station.judging !== "finale" && <ChallengeProofUpload />}

            {isPendingHere ? (
              <div className="flex items-center gap-2 text-sm bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-amber-800">
                <ScrollText className="w-4 h-4" /> Waiting on staff approval...
              </div>
            ) : station.judging === "dragon" ? (
              <button onClick={submitChallenge} className="bg-rose-700 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-rose-800 transition-colors">
                Identify the creature
              </button>
            ) : isFinale ? (
              <button onClick={submitChallenge} className="bg-emerald-700 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-emerald-800 transition-colors">
                Submit finale collectables
              </button>
            ) : (
              <button onClick={submitChallenge} className="bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-amber-700 transition-colors">
                {station.judging === "bridge" ? "Complete blindfold challenge" : "Complete challenge"}
              </button>
            )}
          </div>
        )}

        {/* Bridge intermission — Watcher's first line, no map move yet */}
        {phase === "bridge" && (
          <div className="space-y-4">
            <CharacterStrip station={station} />
            <p className="text-[#4a4233] leading-relaxed italic">"{station.bridgeQuote1}"</p>
            <p className="text-[#4a4233] leading-relaxed italic">"{station.bridgeInstruction}"</p>
            <p className="text-xs text-[#a8987a]">Take your break — cross back, sit down, eat something. Whenever you're ready:</p>
            <button
              onClick={() => setPhase("swordpuzzle")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-rose-700 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-rose-800 transition-colors"
            >
              Resume Adventure <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sword puzzle — Act Two officially unlocks here */}
        {phase === "swordpuzzle" && (
          <div className="space-y-4">
            <CharacterStrip station={station} />
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide">Act Two — Unlocked</h3>
            <p className="text-[#4a4233] leading-relaxed">{station.swordChallengeText}</p>
            <SwordPuzzle
              lettersCollected={lettersCollected}
              sword={sword}
              orderGuess={orderGuess}
              usedIdx={usedIdx}
              toggleLetter={toggleLetter}
              resetOrder={resetOrder}
              submitSwordOrder={submitSwordOrder}
            />
          </div>
        )}

        {/* Palace tip — Steward points across the street, no map move yet */}
        {phase === "tip" && (
          <div className="space-y-4">
            <CharacterStrip station={station} />
            <p className="text-[#4a4233] leading-relaxed italic">"{station.tipQuote}"</p>
            <p className="text-xs text-[#a8987a]">Look across the street, then whenever you're ready:</p>
            <button
              onClick={() => setPhase("crossing")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-rose-700 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-rose-800 transition-colors"
            >
              Cross the street <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Crossing — the Salamander replica in the hotel lobby opposite */}
        {phase === "crossing" && (
          <div className="space-y-4">
            <PicturePlaceholder label={`Photo of ${station.crossCharacter}`} sublabel={station.crossMeetLine} />
            <h2 className="quest-display text-xl">{station.crossCharacter}</h2>
            <p className="text-xs italic text-[#a8987a]">{station.crossMeetLine}</p>
            <p className="text-[#4a4233] leading-relaxed">{station.crossGreeting}</p>
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" /> What really happened here
            </h3>
            <p className="text-[#4a4233] leading-relaxed italic">"{station.crossHistory}"</p>
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide">The Challenge</h3>
            <p className="text-[#4a4233] leading-relaxed">{station.crossChallengeText}</p>
            <ChallengeProofUpload />
            <button onClick={submitCrossingChallenge} className="bg-rose-700 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-rose-800 transition-colors">
              Identify the creature
            </button>
          </div>
        )}

        {phase === "resolved" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> Station complete
            </div>

            {station.letter && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                <span className="w-8 h-8 rounded-full bg-amber-600 border border-amber-700 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                  {station.letter}
                </span>
                <span className="text-sm font-semibold text-amber-900">Letter earned: {station.letter}</span>
              </div>
            )}
            {station.judging === "bridge" && sword && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-400 rounded-lg px-3 py-2">
                <span className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Swords className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-slate-800">DRAGON — the word is unlocked!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PicturePlaceholder src={characterImageUrl(station.id)} label={station.character} sublabel="character" />
              </div>
              <div>
                <PicturePlaceholder label="Your group" sublabel="add your completed-challenge photo" />
              </div>
            </div>

            {(station.judging === "dragon" || station.judging === "palace") && <DragonCardView creature={station.creature} status={dragonCards[station.id]} />}
            {isFinale && finaleDone && <FinaleSummary dragonCards={dragonCards} badges={badges} />}

            <div className="rounded-lg bg-[#e9e1cb] border border-[#cfc09a] px-3 py-2 flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-[#8a7a5a]">Moral</span>
              <span className="text-sm text-[#4a4233]">{station.moral}</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide">{station.character} says farewell</h3>
              <p className="text-[#4a4233] leading-relaxed italic">
                "{station.judging === "bridge" ? station.bridgeQuote2 : station.farewell}"
              </p>
            </div>

            {station.nextClueHint && nextStation && (
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">Spot this at {station.nextArea}</p>
                <PicturePlaceholder src={nextClueImageUrl(nextStation.id)} label={`Something at ${station.nextArea}`} sublabel={station.nextClueHint} />
              </div>
            )}

            {!isLastStation ? (
              <button
                onClick={goToMap}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#2b2620] text-amber-300 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#3a332a] transition-colors"
              >
                Head to {station.nextArea} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onFinishHunt}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-700 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                Finish the Hunt <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {phase === "pitstop" && nextStation && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Rest Stop
            </h3>
            <p className="text-[#4a4233] leading-relaxed">{PIT_STOP.body}</p>
            <div className="rounded-lg bg-[#e9e1cb] border border-[#cfc09a] px-3 py-2.5 text-sm text-[#4a4233]">
              Act Two — The Hunt begins the moment you continue. No fixed path back to letters from here.
            </div>
            <button
              onClick={advanceToNextStation}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              Continue to {nextStation.name} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === "travel" && nextStation && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#6b5f4a] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Walking to {nextStation.name}
            </h3>
            <MiniMap fromStation={station} toStation={nextStation} />
            {station.nextClueHint && (
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold">Keep an eye out for</p>
                <PicturePlaceholder src={nextClueImageUrl(nextStation.id)} label={`Something at ${nextStation.name}`} sublabel={station.nextClueHint} />
              </div>
            )}
            <p className="text-xs text-[#a8987a]">Once your group has arrived AND spotted it, you're ready to begin.</p>
            <label className="flex items-center gap-2 text-sm text-[#4a4233] cursor-pointer">
              <input type="checkbox" checked={spottedClue} onChange={(e) => setSpottedClue(e.target.checked)} className="w-4 h-4" />
              We found it!
            </label>
            <button
              onClick={advanceToNextStation}
              disabled={!!station.nextClueHint && !spottedClue}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Arrived — meet {nextStation.character} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>

      <CollectionArea
        act={station.act}
        lettersCollected={lettersCollected}
        arcsPopped={arcsPopped}
        sword={sword}
        iceCream={iceCream}
        badges={badges}
        dragonCards={dragonCards}
        chronicle={chronicle}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* COLLECTION AREA                                                        */
/* ---------------------------------------------------------------------- */
function CollectionArea({ act, lettersCollected, arcsPopped, sword, iceCream, badges, dragonCards, chronicle }) {
  const showHunt = act === 2 || Object.keys(dragonCards).length > 0;
  const foundCount = Object.keys(dragonCards).length;

  return (
    <div className="rounded-2xl border border-[#cfc09a] bg-gradient-to-b from-[#FBF6E8] to-[#F1E9D8] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="quest-display text-base tracking-wide text-[#2b2620]">
          {showHunt ? "Your Collection" : "Your Rewards"}
        </h3>
        <span className="text-[11px] uppercase tracking-wide text-[#a8987a]">{lettersCollected.length}/6 letters</span>
      </div>

      {/* Arches */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold mb-2">The Arches</p>
        {!arcsPopped ? (
          <div>
            {lettersCollected.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {lettersCollected.map((l, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-amber-600 border border-amber-700 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    {l}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-[#a8987a] italic">
              Something is waiting to be uncovered — keep going until you reach Plaça del Rei.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            {ARC_LETTERS.map((l, i) => (
              <ArchShape key={i} letter={l} filled={lettersCollected.includes(l)} locked={!lettersCollected.includes(l)} />
            ))}
            {sword && (
              <span className="ml-1 w-10 h-12 rounded-lg flex items-center justify-center bg-slate-700 text-white border border-slate-800 shadow-sm">
                <Swords className="w-5 h-5" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hunt the Dragon — Act 2 only */}
      {showHunt && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Hunt the Dragon
            </p>
            <span className="text-[11px] text-[#a8987a]">{foundCount}/4 found</span>
          </div>
          {foundCount === 0 ? (
            <p className="text-xs text-[#a8987a] italic">No creatures found yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(dragonCards).map(([id, status]) => (
                <span
                  key={id}
                  className="text-xs bg-[#FBF6E8] border border-[#cfc09a] rounded-full pl-3 pr-2 py-1.5 flex items-center gap-1.5 shadow-sm"
                >
                  {STATIONS_DRAGON_LABEL[id]}
                  {status === "x" && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                  {status === "real" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badges + treasures */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold mb-2">Badges &amp; Treasures</p>
        <div className="flex flex-wrap gap-2">
          {iceCream && (
            <span className="text-xs bg-pink-100 text-pink-800 border border-pink-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
              <IceCream className="w-3.5 h-3.5" /> Ice cream
            </span>
          )}
          {badges.map((b) => (
            <span key={b} className="relative group text-xs bg-[#2b2620] text-amber-300 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm cursor-default">
              <Trophy className="w-3.5 h-3.5" /> {b}
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 bg-[#2b2620] text-[#F1E9D8] text-[11px] leading-snug rounded-lg px-2.5 py-2 shadow-lg z-20">
                {BADGE_INFO[b] || "A reward earned along the way."}
              </span>
            </span>
          ))}
          {!iceCream && badges.length === 0 && <span className="text-xs text-[#a8987a] italic">Nothing collected yet — keep exploring.</span>}
        </div>
      </div>

      {/* City Chronicle — fact + moral together, one entry per station */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> City Chronicle
        </p>
        {chronicle.length === 0 ? (
          <p className="text-xs text-[#a8987a] italic">No history recorded yet.</p>
        ) : (
          <ul className="text-xs text-[#4a4233] space-y-2">
            {chronicle.map((c, i) => (
              <li key={i}>
                <span className="font-semibold">{c.id}. {c.name}</span> — {c.fact}
                <br />
                <span className="text-[#8a7a5a] italic">Moral: {c.moral}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const STATIONS_DRAGON_LABEL = {
  9: "The Bird",
  10: "Umbrella Dragon",
  13: "Sant Jordi",
};

function DragonCardView({ creature, status }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg border border-[#cfc09a] bg-[#FBF6E8] px-3 py-2 flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold">{creature}</span>
        {status === "x" && <XCircle className="w-5 h-5 text-rose-700" />}
        {status === "real" && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
      </div>
      <p className="text-sm text-[#4a4233]">
        Dragon Collection card revealed{status === "x" ? " — a lost chance, wrong creature." : "."}
      </p>
    </div>
  );
}

function SwordPuzzle({ lettersCollected, sword, orderGuess, usedIdx, toggleLetter, resetOrder, submitSwordOrder }) {
  if (lettersCollected.length < 6) {
    return <p className="text-sm text-[#8a7a5a]">You need all six letters from Stations 1–6 before you can arrange them here.</p>;
  }
  if (sword) {
    return (
      <div className="flex items-center gap-2 text-emerald-800 text-sm">
        <CheckCircle2 className="w-4 h-4" /> DRAGON — letters rearranged correctly.
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm text-[#4a4233] mb-2 flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5" /> Tap your six letters, in order, to spell the word:
      </p>
      <div className="flex gap-2 mb-3">
        {lettersCollected.map((l, idx) => (
          <button
            key={idx}
            disabled={usedIdx.has(idx)}
            onClick={() => toggleLetter(l, idx)}
            className={
              "w-9 h-9 rounded-lg border font-bold text-sm " +
              (usedIdx.has(idx) ? "bg-[#e3d8bc] text-[#a8987a] border-[#cfc09a] cursor-not-allowed" : "bg-amber-500 text-white border-amber-600 hover:bg-amber-600")
            }
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-1 mb-3 min-h-[2.5rem]">
        {orderGuess.map((o, i) => (
          <span key={i} className="w-9 h-9 rounded-lg border border-slate-400 bg-white flex items-center justify-center font-bold text-sm">
            {o.letter}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={resetOrder} className="text-sm border border-[#cfc09a] rounded-full px-3 py-1.5 hover:bg-[#e3d8bc]">
          Reset
        </button>
        <button onClick={submitSwordOrder} disabled={orderGuess.length !== 6} className="text-sm bg-rose-700 text-white rounded-full px-4 py-1.5 disabled:opacity-40 hover:bg-rose-800">
          Submit order
        </button>
      </div>
    </div>
  );
}

function FinaleSummary({ dragonCards, badges }) {
  const architects = [
    "Lluís Domènech i Montaner — Palau de la Música Catalana",
    "Antoni Gaudí — Palau Güell, his first major Barcelona commission",
    "Joan Rubió i Bellver — Pont del Bisbe",
    "Ramon Despuig — Santa Maria del Mar (completion)",
    "Enric Miralles & Benedetta Tagliabue — Mercat Santa Caterina (2005 renovation)",
    "Joan Miró — La Rambla pavement mosaic, 1976",
    "Josep Vilaseca i Casanovas — Arc de Triomf, 1888",
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-emerald-800 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Finale complete — real dragon identified: Sant Jordi.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(dragonCards).map(([id, status]) => (
          <span key={id} className="text-xs bg-[#FBF6E8] border border-[#cfc09a] rounded-full pl-3 pr-2 py-1.5 flex items-center gap-1.5">
            {STATIONS_DRAGON_LABEL[id]}
            {status === "x" && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
            {status === "real" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <span key={b} className="text-xs bg-[#2b2620] text-amber-300 rounded-full px-3 py-1 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {b}
          </span>
        ))}
      </div>
      <div className="rounded-lg bg-[#e9e1cb] border border-[#cfc09a] px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-wide font-semibold text-[#8a7a5a] mb-1.5">
          The City's Many Architects
        </p>
        <ul className="text-xs text-[#4a4233] space-y-1">
          {architects.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
        <p className="text-[11px] text-[#a8987a] italic mt-1.5">
          One city, many builders — none of them strangers to each other's work.
        </p>
      </div>
    </div>
  );
}

function StaffView({ pending, approvePending, rejectPending, station, log }) {
  return (
    <div className="space-y-5 quest-body">
      <Card>
        <h2 className="quest-display text-lg mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Approval queue
        </h2>
        {pending ? (
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-[#4a4233] mb-1 font-semibold">Station {pending.id} — {pending.name}</p>
            <p className="text-sm text-[#6b5f4a] mb-3">{pending.challengeText}</p>
            <div className="flex gap-2">
              <button onClick={approvePending} className="bg-emerald-700 text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-emerald-800">
                Approve
              </button>
              <button onClick={rejectPending} className="border border-rose-400 text-rose-700 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-rose-50">
                Send back
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#8a7a5a]">Nothing waiting right now. The group is currently at Station {station.id} ({station.name}).</p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-2 uppercase tracking-wide">Activity log</h3>
        <ul className="text-sm text-[#4a4233] space-y-1">
          {log.length === 0 && <li className="text-[#a8987a]">No activity yet.</li>}
          {log.map((l, i) => (
            <li key={i}>• {l}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function SyncStatusBadge({ status }) {
  const map = {
    "local-only": { icon: CloudOff, text: "Local only — Supabase not configured", cls: "text-[#8a7a5a] bg-[#e9e1cb] border-[#cfc09a]" },
    loading: { icon: CloudCheck, text: "Loading station content…", cls: "text-amber-800 bg-amber-50 border-amber-300" },
    synced: { icon: CloudCheck, text: "Synced with Supabase", cls: "text-emerald-800 bg-emerald-50 border-emerald-300" },
    error: { icon: CloudOff, text: "Couldn't reach Supabase — showing local content", cls: "text-rose-800 bg-rose-50 border-rose-300" },
  };
  const m = map[status] || map["local-only"];
  return (
    <span className={"text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 " + m.cls}>
      <m.icon className="w-3 h-3" /> {m.text}
    </span>
  );
}

function AdminView({ stationsData, saveStationEdit, stationsSyncStatus, groupsList, groupsSyncStatus, group, stationIdx, lettersCollected, badges, dragonCards, sword, iceCream, finaleDone }) {
  const liveStation = stationsData[stationIdx];
  const liveProgress = Math.round(((stationIdx + 1) / stationsData.length) * 100);
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(false);

  const EDITABLE_FIELDS = [
    { key: "name", label: "Station name", area: false },
    { key: "character", label: "Character", area: false },
    { key: "greeting", label: "Greeting", area: true },
    { key: "history", label: "History (\"what really happened here\")", area: true },
    { key: "challengeText", label: "Challenge text", area: true },
    { key: "moral", label: "Moral", area: false },
    { key: "farewell", label: "Farewell", area: true },
    { key: "nextClueHint", label: "Next-location clue hint", area: true },
  ];

  function startEdit(s) {
    setEditingId(s.id);
    setDraft({ ...s });
    setSaveError(false);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setSaveError(false);
  }
  async function saveEdit() {
    setSaving(true);
    setSaveError(false);
    const ok = await saveStationEdit(editingId, draft);
    setSaving(false);
    if (!ok) {
      setSaveError(true);
      return;
    }
    setEditingId(null);
    setDraft(null);
  }

  return (
    <div className="space-y-5 quest-body">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="quest-display text-lg flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" /> Group progress
          </h2>
          <SyncStatusBadge status={groupsSyncStatus} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#6b5f4a] border-b border-[#e3d8bc]">
              <th className="py-2">Group</th>
              <th className="py-2">Station</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Badges</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f1e9d8] bg-amber-50">
              <td className="py-2 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {group?.name || "This device (local demo)"}
              </td>
              <td className="py-2">{liveStation.id}. {liveStation.name}</td>
              <td className="py-2">{liveProgress}%</td>
              <td className="py-2">{badges.length}</td>
            </tr>
            {groupsList
              .filter((g) => g.id !== group?.id)
              .map((g) => (
                <tr key={g.id} className="border-b border-[#f1e9d8]">
                  <td className="py-2">{g.name}</td>
                  <td className="py-2">Station {g.current_station_id ?? 1}</td>
                  <td className="py-2">{Math.round(((g.current_station_id ?? 1) / stationsData.length) * 100)}%</td>
                  <td className="py-2">{(g.badges || []).length}</td>
                </tr>
              ))}
            {groupsSyncStatus === "synced" && groupsList.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-[#a8987a]">
                  No groups yet — create rows in the <code>groups</code> table to see them here.
                </td>
              </tr>
            )}
            {groupsSyncStatus === "local-only" && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-[#a8987a]">
                  Supabase isn't configured — only this device's live session is shown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-1 uppercase tracking-wide">Character &amp; clue media library</h3>
        <p className="text-xs text-[#8a7a5a] mb-3">
          Upload a portrait per character and a close-up per collectable. Stub UI only — wiring to Supabase Storage is the next build step.
        </p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {stationsData.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border border-[#e3d8bc] rounded-lg px-3 py-2">
              <span className="text-xs w-40 shrink-0 font-medium">{s.id}. {s.character}</span>
              <button className="flex items-center gap-1 text-[11px] border border-dashed border-[#cfc09a] rounded-md px-2 py-1 text-[#8a7a5a] hover:bg-[#e3d8bc]">
                <ImagePlus className="w-3 h-3" /> Character photo
              </button>
              <button className="flex items-center gap-1 text-[11px] border border-dashed border-[#cfc09a] rounded-md px-2 py-1 text-[#8a7a5a] hover:bg-[#e3d8bc]">
                <ImagePlus className="w-3 h-3" /> Clue close-up
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-1 uppercase tracking-wide">Group albums</h3>
        <p className="text-xs text-[#8a7a5a] mb-3">
          Every photo a group submits, organized by group — for review or printing afterward. Real photos populate
          here once Submissions + Realtime sync are wired (next build step); for now this shows real group names
          with a placeholder count based on this device's local progress.
        </p>
        <div className="space-y-3">
          {[{ name: group?.name || "This device (local demo)", count: stationIdx + 1 }, ...groupsList.filter((g) => g.id !== group?.id).map((g) => ({ name: g.name, count: g.current_station_id ?? 1 }))].map((g) => (
            <div key={g.name}>
              <p className="text-xs font-semibold text-[#4a4233] mb-1">{g.name} <span className="text-[#a8987a] font-normal">({g.count} photos)</span></p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {Array.from({ length: Math.min(g.count, 8) }).map((_, i) => (
                  <div key={i} className="w-12 h-12 shrink-0">
                    <PicturePlaceholder compact />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-1 uppercase tracking-wide">Content editor</h3>
        <p className="text-sm text-[#8a7a5a] mb-3">
          {supabaseConfigured
            ? "Edit station text — saves to Supabase, then applies immediately to the camper experience for this session."
            : "Edit station text live — changes apply immediately to the camper experience (Supabase isn't configured, so this is local-only for now)."}
        </p>
        <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
          {stationsData.map((s) => (
            <div key={s.id} className="border border-[#e3d8bc] rounded-lg px-3 py-2">
              {editingId === s.id ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#4a4233] flex items-center gap-2">
                    <StationBadgeDot act={s.act} /> Editing Station {s.id}
                  </p>
                  {EDITABLE_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="text-[11px] uppercase tracking-wide text-[#8a7a5a] font-semibold block mb-0.5">{f.label}</label>
                      {f.area ? (
                        <textarea
                          value={draft[f.key] || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                          className="w-full text-sm border border-[#cfc09a] rounded-md px-2 py-1.5 bg-white"
                          rows={3}
                        />
                      ) : (
                        <input
                          value={draft[f.key] || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                          className="w-full text-sm border border-[#cfc09a] rounded-md px-2 py-1.5 bg-white"
                        />
                      )}
                    </div>
                  ))}
                  {saveError && (
                    <p className="text-xs text-rose-700">Couldn't save to Supabase — check your connection and try again.</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} disabled={saving} className="bg-emerald-700 text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50">
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={cancelEdit} disabled={saving} className="border border-[#cfc09a] rounded-full px-4 py-1.5 text-sm hover:bg-[#e3d8bc] disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <StationBadgeDot act={s.act} />
                    {s.id}. {s.name}
                    <span className="text-xs text-[#a8987a] uppercase">({s.judging})</span>
                  </span>
                  <button onClick={() => startEdit(s)} className="text-xs border border-[#cfc09a] rounded-full px-3 py-1 hover:bg-[#e3d8bc]">
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#6b5f4a] mb-2 uppercase tracking-wide">Live group detail</h3>
        <p className="text-sm text-[#4a4233]">
          Letters: {lettersCollected.join(", ") || "none yet"} · Word solved: {sword ? "yes" : "not yet"} · Ice cream: {iceCream ? "yes" : "no"} · Finale: {finaleDone ? "complete" : "in progress"}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(dragonCards).map(([id, status]) => (
            <span key={id} className="text-xs bg-[#FBF6E8] border border-[#cfc09a] rounded-full pl-3 pr-2 py-1.5 flex items-center gap-1.5">
              {STATIONS_DRAGON_LABEL[id]}
              {status === "x" && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
              {status === "real" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
