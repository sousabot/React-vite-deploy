import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "./components/Layout.jsx";
import LoadingGate from "./components/LoadingGate.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Shop from "./pages/Shop.jsx";
import Creators from "./pages/Creators.jsx";
import Partners from "./pages/Partners.jsx";
import News from "./pages/News.jsx";
import WorkWithUs from "./pages/WorkWithUs.jsx";
import Giveaway from "./pages/Giveaway.jsx";
import Clips from "./pages/Clips.jsx"; // ✅ NEW

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";

import { AuthProvider, useAuth } from "./state/auth.jsx";
import { ADMIN_EMAILS } from "./state/admins.js";

/* ======================
   ROUTE GUARDS
   ====================== */

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const email = (user.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(email);

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <LoadingGate>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
              {/* PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/clips" element={<Clips />} /> {/* ✅ NEW */}
              <Route path="/partners" element={<Partners />} />
              <Route path="/news" element={<News />} />
              <Route path="/work-with-us" element={<WorkWithUs />} />
              <Route path="/giveaway" element={<Giveaway />} />

              {/* AUTH */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* USER */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </LoadingGate>
    </AuthProvider>
  );
}
