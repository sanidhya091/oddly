// ─────────────────────────────────────────────────────────────────────────────
// api.js — Oddly frontend API layer
// All functions talk to the Spring Boot backend at BASE_URL.
// Swap BASE_URL for your deployed Railway/Render URL in production.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "/api";


// ── Helpers ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = localStorage.getItem("oddly_token");

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

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// For rec endpoints that return raw JSON strings, not application/json
async function requestText(path, options = {}) {
  const token = localStorage.getItem("oddly_token");

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

const get     = (path)        => request(path);
const post    = (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) });
const put     = (path, body)  => request(path, { method: "PUT",    body: JSON.stringify(body) });
const del     = (path)        => request(path, { method: "DELETE" });
const getText = (path)        => requestText(path);
const postText = (path, body) => requestText(path, { method: "POST", body: JSON.stringify(body) });

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export const register = (data) => post("/auth/register", data);

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export const login = (data) => post("/auth/login", data);

/** Remove token from storage (client-side logout). */
export const logout = () => localStorage.removeItem("oddly_token");

/** Store JWT after login/register. */
export const saveToken = (token) => localStorage.setItem("oddly_token", token);

/** Check if user is currently logged in. */
export const isLoggedIn = () => !!localStorage.getItem("oddly_token");

// ─────────────────────────────────────────────────────────────────────────────
// USER / PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current user's profile.
 * @returns {{ id, name, handle, joinedDate, stats }}
 */
export const getProfile = () => get("/users/me");

/**
 * Update the current user's profile.
 * @param {{ name?: string, handle?: string }} data
 */
export const updateProfile = (data) => put("/users/me", data);

// ─────────────────────────────────────────────────────────────────────────────
// SAVED ITEMS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all saved items for the current user.
 * @returns {Array<{ id, type, title, subtitle, tags, saved }>}
 */
export const getSavedItems = () => get("/users/me/saved");

/**
 * Save an item.
 * @param {{ type: string, title: string, subtitle: string, tags: string[], url?: string, description?: string }} item
 */
export const saveItem = (item) => post("/users/me/saved", item);

/**
 * Remove a saved item by ID.
 * @param {string} itemId
 */
export const unsaveItem = (itemId) => del(`/users/me/saved/${itemId}`);

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all collections for the current user.
 * @returns {Array<{ id, name, emoji, color, count }>}
 */
export const getCollections = () => get("/users/me/collections");

/**
 * Create a new collection.
 * @param {{ name: string, emoji?: string, color?: string }} data
 */
export const createCollection = (data) => post("/users/me/collections", data);

/**
 * Delete a collection.
 * @param {string} collectionId
 */
export const deleteCollection = (collectionId) => del(`/users/me/collections/${collectionId}`);

/**
 * Add a saved item to a collection.
 * @param {string} collectionId
 * @param {string} itemId
 */
export const addToCollection = (collectionId, itemId) =>
  post(`/users/me/collections/${collectionId}/items`, { itemId });

/**
 * Remove an item from a collection.
 * @param {string} collectionId
 * @param {string} itemId
 */
export const removeFromCollection = (collectionId, itemId) =>
  del(`/users/me/collections/${collectionId}/items/${itemId}`);

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// These endpoints return raw JSON strings from the backend (Groq output),
// so we use requestText instead of request to avoid double-parsing.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vibe Quiz — send quiz answers, get recs.
 * @param {{ answers: string[] }} data  e.g. { answers: ["chill", "night", "alone"] }
 * @returns {string} raw JSON string — parse in the component
 */
export const getQuizRecs = (data) => postText("/recs/quiz", data);

/**
 * Taste Match — send what the user loves, get weird cousins.
 * @param {{ input: string }} data  e.g. { input: "Dark Side of the Moon" }
 * @returns {string} raw JSON string — parse in the component
 */
export const getTasteMatchRecs = (data) => postText("/recs/taste-match", data);

/**
 * Serendipity — get one random niche rec.
 * @returns {string} raw JSON string — parse in the component
 */
export const getSerendipityRec = () => getText("/recs/serendipity");

/**
 * Chat Mode — send conversation history, get AI reply + recs.
 * @param {{ messages: Array<{ role: string, content: string }> }} data
 * @returns {string} raw JSON string — parse in the component
 */
export const getChatResponse = (data) => postText("/recs/chat", data);

// ─────────────────────────────────────────────────────────────────────────────
// ITEM DETAIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get full details for a single recommendation by ID.
 * @param {string} itemId
 * @returns {rec}
 */
export const getItemDetail = (itemId) => get(`/items/${itemId}`);

// ─────────────────────────────────────────────────────────────────────────────
// STATS (for Profile page)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user stats (saved count, collections, discoveries, streak).
 * @returns {{ saved: number, collections: number, discoveries: number, streak: number }}
 */
export const getUserStats = () => get("/users/me/stats");