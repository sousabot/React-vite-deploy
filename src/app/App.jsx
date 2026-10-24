import React, { Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import SiteLayout from "../components/layout/SiteLayout.jsx";
import SplashScreen from "../components/layout/SplashScreen.jsx";
import MaintenancePage from "../features/maintenance/MaintenancePage.jsx";
import { AuthProvider } from "../features/auth/AuthProvider.jsx";
import { AdminRoute, ProtectedRoute } from "./guards.jsx";
import { ROUTES, preloadRoutes } from "./routes.js";
import { MAINTENANCE_MODE } from "../config/site.js";

const GUARDS = { user: ProtectedRoute, admin: AdminRoute };

function withGuard(guard, node) {
  const Guard = GUARDS[guard];
  return Guard ? <Guard>{node}</Guard> : node;
}

export default function App() {
  useEffect(() => {
    if (!(MAINTENANCE_MODE && import.meta.env.PROD)) preloadRoutes();
  }, []);

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
      <MotionConfig reducedMotion="user">
        <Routes>
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
        <SplashScreen />
      </MotionConfig>
    </AuthProvider>
  );
}
