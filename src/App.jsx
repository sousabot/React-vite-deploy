import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "./components/Layout.jsx";
import LoadingGate from "./components/LoadingGate.jsx";

// Lazy-loaded pages — each becomes its own chunk, only downloaded when visited
const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const Creators = lazy(() => import("./pages/Creators.jsx"));
const Staff = lazy(() => import("./pages/Staff.jsx"));
const Players = lazy(() => import("./pages/Players.jsx"));
const Partners = lazy(() => import("./pages/Partners.jsx"));
const News = lazy(() => import("./pages/News.jsx"));
const WorkWithUs = lazy(() => import("./pages/WorkWithUs.jsx"));
const Clips = lazy(() => import("./pages/Clips.jsx"));

const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));

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

// Simple fallback shown while a page chunk downloads.
// Swap this for a branded spinner/skeleton if you have one.
function PageFallback() {
  return <div style={{ minHeight: "40vh" }} />;
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
              <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<PageFallback />}><About /></Suspense>} />
              <Route path="/shop" element={<Suspense fallback={<PageFallback />}><Shop /></Suspense>} />
              <Route path="/creators" element={<Suspense fallback={<PageFallback />}><Creators /></Suspense>} />
              <Route path="/staff" element={<Suspense fallback={<PageFallback />}><Staff /></Suspense>} />
              <Route path="/players" element={<Suspense fallback={<PageFallback />}><Players /></Suspense>} />
              <Route path="/clips" element={<Suspense fallback={<PageFallback />}><Clips /></Suspense>} />
              <Route path="/partners" element={<Suspense fallback={<PageFallback />}><Partners /></Suspense>} />
              <Route path="/news" element={<Suspense fallback={<PageFallback />}><News /></Suspense>} />
              <Route path="/work-with-us" element={<Suspense fallback={<PageFallback />}><WorkWithUs /></Suspense>} />

              {/* LEGAL */}
              <Route path="/privacy-policy" element={<Suspense fallback={<PageFallback />}><Privacy /></Suspense>} />
              <Route path="/terms-of-service" element={<Suspense fallback={<PageFallback />}><Terms /></Suspense>} />

              {/* AUTH */}
              <Route path="/login" element={<Suspense fallback={<PageFallback />}><Login /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageFallback />}><Register /></Suspense>} />

              {/* USER */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageFallback />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* ADMIN */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Suspense fallback={<PageFallback />}>
                      <Admin />
                    </Suspense>
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