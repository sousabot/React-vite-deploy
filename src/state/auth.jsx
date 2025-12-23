import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { track } from "./track.js"; // add at top
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";

const AuthContext = createContext(null);

function shapeUser(firebaseUser) {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    gamerTag: firebaseUser.displayName || "", // 👈 keeps your admin checks working
    firebaseUser,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(shapeUser(u));
      setReady(true);
    });
    return () => unsub();
  }, []);



async function login(email, password) {
  if (!email || !password) throw new Error("Please enter email and password.");

  await signInWithEmailAndPassword(auth, email, password);

  // 🔥 REAL metric
  track("login");
}


  // Supports both:
  // register(email, password, gamerTag)  ✅
  // register({ email, password, gamerTag }) ✅ (for your existing Register page style)
  async function register(a, b, c) {
    let email, password, gamerTag;

    if (typeof a === "object" && a) {
      email = a.email;
      password = a.password;
      gamerTag = a.gamerTag;
    } else {
      email = a;
      password = b;
      gamerTag = c;
    }

    if (!email || !password) throw new Error("Please enter email and password.");


const cred = await createUserWithEmailAndPassword(auth, email, password);

if (gamerTag) {
  await updateProfile(cred.user, { displayName: gamerTag });
}

track("register"); // 🔥 REAL metric

setUser(shapeUser(cred.user));

    // update local state immediately (auth listener will also update)
    setUser(shapeUser(cred.user));
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

async function resetPassword(email) {
  if (!email) throw new Error("Please enter your email.");
  await sendPasswordResetEmail(auth, email);

  track("password_reset"); // optional metric

  return true;
}


  const value = useMemo(() => ({ user, ready, login, register, logout, resetPassword }), [
    user,
    ready,
  ]);

  // Optional: prevent flashing before auth state loads
  if (!ready) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
