// ─────────────────────────────────────────────────────────────────────────────
// api.js — Oddly frontend API layer
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

const TOKEN_KEY = "token"; // single consistent key across the app

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;

  return res.json();
}

async function requestText(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.text();
}

const get      = (path)        => request(path);
const post     = (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) });
const put      = (path, body)  => request(path, { method: "PUT",    body: JSON.stringify(body) });
const del      = (path)        => request(path, { method: "DELETE" });
const getText  = (path)        => requestText(path);
const postText = (path, body)  => requestText(path, { method: "POST", body: JSON.stringify(body) });

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const register    = (data)  => post("/auth/register", data);
export const login       = (data)  => post("/auth/login", data);
export const logout      = ()      => localStorage.removeItem(TOKEN_KEY);
export const saveToken   = (token) => localStorage.setItem(TOKEN_KEY, token);
export const isLoggedIn  = ()      => !!localStorage.getItem(TOKEN_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// USER / PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export const getProfile    = ()     => get("/users/me");
export const updateProfile = (data) => put("/users/me", data);

// ─────────────────────────────────────────────────────────────────────────────
// SAVED ITEMS
// ─────────────────────────────────────────────────────────────────────────────

export const getSavedItems = ()       => get("/users/me/saved");
export const saveItem      = (item)   => post("/users/me/saved", item);
export const unsaveItem    = (itemId) => del(`/users/me/saved/${itemId}`);

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getCollections      = ()               => get("/users/me/collections");
export const createCollection    = (data)           => post("/users/me/collections", data);
export const deleteCollection    = (id)             => del(`/users/me/collections/${id}`);
export const addToCollection     = (colId, itemId)  => post(`/users/me/collections/${colId}/items`, { itemId });
export const removeFromCollection = (colId, itemId) => del(`/users/me/collections/${colId}/items/${itemId}`);

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getQuizRecs      = (data) => postText("/recs/quiz", data);
export const getTasteMatchRecs = (data) => postText("/recs/taste-match", data);
export const getSerendipityRec = ()    => getText("/recs/serendipity");
export const getChatResponse   = (data) => postText("/recs/chat", data);

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

export const getUserStats = () => get("/users/me/stats");