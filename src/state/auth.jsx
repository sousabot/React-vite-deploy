import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const LS_USER = "gd_user";
const LS_USERS = "gd_users"; // simple local "db"
const LS_RESET = "gd_reset_codes"; // { [email]: { code, expiresAt } }

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS)) || [];
  } catch {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function getResetMap() {
  try {
    return JSON.parse(localStorage.getItem(LS_RESET)) || {};
  } catch {
    return {};
  }
}

function setResetMap(map) {
  localStorage.setItem(LS_RESET, JSON.stringify(map));
}

function generateCode() {
  // 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_USER));
      if (saved) setUser(saved);
    } catch {}
  }, []);

  function login(email, password) {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password.");
    localStorage.setItem(
      LS_USER,
      JSON.stringify({ email: found.email, gamerTag: found.gamerTag })
    );
    setUser({ email: found.email, gamerTag: found.gamerTag });
  }

  function register({ email, password, gamerTag }) {
    const users = getUsers();
    if (users.some((u) => u.email === email)) throw new Error("Email is already registered.");

    const newUser = { email, password, gamerTag };
    setUsers([...users, newUser]);

    // auto-login
    localStorage.setItem(LS_USER, JSON.stringify({ email, gamerTag }));
    setUser({ email, gamerTag });
  }

  function logout() {
    localStorage.removeItem(LS_USER);
    setUser(null);
  }

  /**
   * LocalStorage-only reset:
   * - Generates a code and stores it for 15 minutes
   * - Returns the code so UI can show it (since there's no email service here)
   */
  function resetPassword(email) {
    const users = getUsers();
    const exists = users.some((u) => u.email === email);

    // Security best-practice: don't reveal whether the email exists
    // We'll still generate a code only if it exists, but always return a generic response.
    if (!exists) {
      return { ok: true, code: null };
    }

    const map = getResetMap();
    const code = generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min

    map[email] = { code, expiresAt };
    setResetMap(map);

    return { ok: true, code };
  }

  /**
   * Confirm reset and set new password
   */
  function confirmPasswordReset(email, code, newPassword) {
    if (!email || !code || !newPassword) throw new Error("Missing fields.");

    const map = getResetMap();
    const entry = map[email];

    if (!entry) throw new Error("Invalid or expired reset code.");
    if (Date.now() > entry.expiresAt) {
      delete map[email];
      setResetMap(map);
      throw new Error("Reset code expired. Request a new one.");
    }

    if (String(entry.code) !== String(code)) throw new Error("Invalid reset code.");

    const users = getUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1) throw new Error("Account not found.");

    users[idx] = { ...users[idx], password: newPassword };
    setUsers(users);

    delete map[email];
    setResetMap(map);

    return { ok: true };
  }

  const value = useMemo(
    () => ({ user, login, register, logout, resetPassword, confirmPasswordReset }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
