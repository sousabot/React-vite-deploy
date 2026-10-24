import React, { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import SiteLayout from "../components/layout/SiteLayout.jsx";
import SplashScreen from "../components/layout/SplashScreen.jsx";
import MaintenancePage from "../features/maintenance/MaintenancePage.jsx";
import { AuthProvider } from "../features/auth/AuthProvider.jsx";
import { AdminRoute, ProtectedRoute } from "./guards.jsx";
import { ROUTES } from "./routes.js";
import { MAINTENANCE_MODE } from "../config/site.js";

const GUARDS = { user: ProtectedRoute, admin: AdminRoute };

function withGuard(guard, node) {
  const Guard = GUARDS[guard];
  return Guard ? <Guard>{node}</Guard> : node;
}

export default function App() {
  const location = useLocation();

  if (MAINTENANCE_MODE && import.meta.env.PROD) {
    return (
      <>
        <MaintenancePage />
        <SplashScreen />
      </>
    );
  }

  return (
    <AuthProvider>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route element={<SiteLayout />}>
            {ROUTES.map(({ path, element: Element, guard }) => (
              <Route
                key={path}
                path={path}
                element={withGuard(
                  guard,
                  <Suspense fallback={<div className="page-fallback" />}>
                    <Element />
                  </Suspense>
                )}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <SplashScreen />
    </AuthProvider>
  );
}
