import { api } from "./client";

// Manager+ list users: GET /users
export async function listUsers(params = {}) {
  // params: { name, role, verified, activated, page, limit }
  const res = await api.get("/users", { params });
  // { count, results: [userObj, ...] }
  return res.data;
}

// Cashier+ or Manager+: GET /users/:userId
export async function getUserById(userId) {
  const res = await api.get(`/users/${userId}`);
  return res.data;
}

// Manager (status) / Superuser (role): PATCH /users/:userId
export async function updateUserById(userId, payload) {
  // payload may contain: email?, verified?, suspicious?, role?
  const res = await api.patch(`/users/${userId}`, payload);
  return res.data; // only updated fields
}

// Self profile: GET /users/me
export async function getMe() {
  const res = await api.get("/users/me");
  return res.data; // full user object
}

// Self update: PATCH /users/me
export async function updateMe(payload) {
  // name?, email?, birthday?, avatar? (later you may need FormData)
  const res = await api.patch("/users/me", payload);
  return res.data;
}

// Registration (Cashier+): POST /users
export async function createUser(payload) {
  // { utorid, name, email }
  const res = await api.post("/users", payload);
  return res.data;
}
