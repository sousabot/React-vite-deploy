import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Creators from "./pages/Creators.jsx";
import LoadingGate from "./components/LoadingGate.jsx";
import Layout from "./components/Layout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import { AuthProvider, useAuth } from "./state/auth.jsx";

import About from "./pages/About.jsx";
import Shop from "./pages/Shop.jsx";
import Partners from "./pages/Partners.jsx";
import News from "./pages/News.jsx";
import WorkWithUs from "./pages/WorkWithUs.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <LoadingGate>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/news" element={<News />} />
              <Route path="/work-with-us" element={<WorkWithUs />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </LoadingGate>
    </AuthProvider>
  );
}
