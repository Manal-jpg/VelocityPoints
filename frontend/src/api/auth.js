import { api } from "./client";

// Login: POST /auth/tokens
export async function loginUser({ utorid, password }) {
  const res = await api.post("/auth/tokens", { utorid, password });
  // { token, expiresAt }
  return res.data;
}

// Current user: GET /users/me
export async function fetchCurrentUser() {
  const res = await api.get("/users/me");
  return res.data; // full user object
}

// Password change for logged in user: PATCH /users/me/password
export async function changeMyPassword({ old, new: newPassword }) {
  const res = await api.patch("/users/me/password", {
    old,
    new: newPassword,
  });
  return res.data;
}

// Forgot password: POST /auth/resets
export async function requestPasswordReset({ utorid }) {
  const res = await api.post("/auth/resets", { utorid });
  return res.data; // { expiresAt, resetToken }
}

// Reset password: POST /auth/resets/:resetToken
export async function completePasswordReset(resetToken, { utorid, password }) {
  const res = await api.post(`/auth/resets/${resetToken}`, {
    utorid,
    password,
  });
  return res.data;
}
