import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const LS_USER = "gd_user";
const LS_USERS = "gd_users"; // simple local "db"

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
    localStorage.setItem(LS_USER, JSON.stringify({ email: found.email, gamerTag: found.gamerTag }));
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

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
