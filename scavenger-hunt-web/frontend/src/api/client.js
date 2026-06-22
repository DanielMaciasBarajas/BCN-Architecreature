const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getStations: () => request("/api/stations"),
  getGroups: () => request("/api/groups"),
  createGroup: (id, name) =>
    request("/api/groups", { method: "POST", body: JSON.stringify({ id, name }) }),
  getGroup: (id) => request(`/api/groups/${id}`),
  submit: (id, letterOrder) =>
    request(`/api/groups/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ letterOrder }),
    }),
  approve: (id) => request(`/api/groups/${id}/approve`, { method: "POST" }),
  reject: (id) => request(`/api/groups/${id}/reject`, { method: "POST" }),
};
