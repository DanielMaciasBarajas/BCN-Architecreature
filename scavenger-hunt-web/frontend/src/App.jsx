import React, { useState } from "react";
import { Sparkles, MapPin, ShieldCheck, LayoutDashboard } from "lucide-react";
import CamperView from "./views/CamperView.jsx";
import StaffView from "./views/StaffView.jsx";
import AdminView from "./views/AdminView.jsx";

// Which group a camper/staff phone is looking at comes from the URL,
// e.g. https://yourapp.com/?group=falcons — each printed QR code at
// check-in would encode a different group id. Defaults to "demo" so
// the app is usable immediately without setup.
function getGroupIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("group") || "demo";
}

export default function App() {
  const [role, setRole] = useState("camper");
  const groupId = getGroupIdFromUrl();

  return (
    <div className="min-h-screen w-full bg-[#F1E9D8] text-[#2b2620] font-sans">
      <div className="quest-body sticky top-0 z-10 bg-[#2b2620] text-[#F1E9D8] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="quest-display text-lg tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Barcelona Hunt
          {role !== "admin" && <span className="text-xs font-normal text-[#cfc6b3]">· group: {groupId}</span>}
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
                (role === r.id ? "bg-amber-500 text-[#2b2620] font-semibold" : "text-[#cfc6b3] hover:text-white")
              }
            >
              <r.icon className="w-3.5 h-3.5" />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {role === "camper" && <CamperView groupId={groupId} />}
        {role === "staff" && <StaffView groupId={groupId} />}
        {role === "admin" && <AdminView />}
      </div>
    </div>
  );
}
