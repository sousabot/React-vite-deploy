import React, { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import { track } from "../../lib/track.js";
import { ADMIN_EMAILS } from "../../config/admins.js";
import { AuthContext } from "./useAuth.js";

function shapeUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    gamerTag: firebaseUser.displayName || "",
    firebaseUser,
  };
}

function isAdminUser(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(shapeUser(u));
      setReady(true);
    });
  }, []);

  const value = useMemo(() => {
    async function login(email, password) {
      if (!email || !password) throw new Error("Please enter email and password.");
      await signInWithEmailAndPassword(auth, email, password);
      track("login");
    }

    async function register({ email, password, gamerTag }) {
      if (!email || !password) throw new Error("Please enter email and password.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (gamerTag) await updateProfile(cred.user, { displayName: gamerTag });
      track("register");
      setUser(shapeUser(cred.user));
    }

    async function logout() {
      await signOut(auth);
      setUser(null);
    }

    async function resetPassword(email) {
      if (!email) throw new Error("Please enter your email.");
      await sendPasswordResetEmail(auth, email);
      track("password_reset");
    }

    return {
      user,
      ready,
      isAdmin: isAdminUser(user),
      login,
      register,
      logout,
      resetPassword,
    };
  }, [user, ready]);

  if (!ready) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
