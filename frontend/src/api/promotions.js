// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// function getAuthHeaders() {
//   const token = localStorage.getItem("authToken");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// async function handleResponse(res) {
//   let body = null;
//   try {
//     body = await res.json();
//   } catch {
//     body = null;
//   }

//   if (!res.ok) {
//     const msg =
//       body?.error ||
//       body?.message ||
//       `Request failed with status ${res.status}`;
//     const err = new Error(msg);
//     err.status = res.status;
//     err.body = body;
//     throw err;
//   }
//   return body;
// }

// export async function listPromotions(params = {}) {
//   const sp = new URLSearchParams();
//   const { page, limit, name, type, published, started, ended } = params;

//   if (page != null) sp.set("page", String(page));
//   if (limit != null) sp.set("limit", String(limit));
//   if (name) sp.set("name", name);
//   if (type) sp.set("type", type);

//   // publishedFilter: pass true/false, or "all" to skip
//   if (published !== undefined && published !== "all") {
//     sp.set("published", published ? "true" : "false");
//   }

//   if (started !== undefined) {
//     sp.set("started", started ? "true" : "false");
//   }
//   if (ended !== undefined) {
//     sp.set("ended", ended ? "true" : "false");
//   }

//   const res = await fetch(`${API_BASE}/promotions?${sp.toString()}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
//   });

//   return handleResponse(res); // { count, results }
// }

// export async function getPromotion(id) {
//   const res = await fetch(`${API_BASE}/promotions/${id}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
//   });

//   return handleResponse(res); // promotion object
// }

// export async function createPromotion(payload) {
//   const res = await fetch(`${API_BASE}/promotions`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify(payload),
//   });

//   return handleResponse(res); // created promotion
// }

// export async function updatePromotion(id, payload) {
//   const res = await fetch(`${API_BASE}/promotions/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify(payload),
//   });

//   return handleResponse(res); // updated promotion
// }

// export async function deletePromotion(id) {
//   const res = await fetch(`${API_BASE}/promotions/${id}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
    
//   });

//   if (res.status === 204) return;
//   return handleResponse(res);
// }

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      body?.error ||
      body?.message ||
      `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// ======================================================
// LIST PROMOTIONS
// ======================================================
export async function listPromotions(params = {}) {
  const sp = new URLSearchParams();
  const { page, limit, name, type, started, ended } = params;

  if (page != null) sp.set("page", String(page));
  if (limit != null) sp.set("limit", String(limit));
  if (name) sp.set("name", name);
  if (type) sp.set("type", type);

  // started and ended filters (for user-active logic)
  if (started !== undefined) {
    sp.set("started", started ? "true" : "false");
  }
  if (ended !== undefined) {
    sp.set("ended", ended ? "true" : "false");
  }

  const res = await fetch(`${API_BASE}/promotions?${sp.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  return handleResponse(res);
}

export async function getPromotion(id) {
  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  return handleResponse(res);
}

export async function createPromotion(payload) {
  const res = await fetch(`${API_BASE}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function updatePromotion(id, payload) {
  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function deletePromotion(id) {
  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (res.status === 204) return;
  return handleResponse(res);
}
