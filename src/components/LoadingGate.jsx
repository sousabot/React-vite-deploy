import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen.jsx";

export default function LoadingGate({ children }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Minimum time the loader stays visible (prevents flicker)
    const MIN_MS = 900;

    const t = setTimeout(() => {
      setShowLoader(false);
    }, MIN_MS);

    return () => clearTimeout(t);
  }, []);

  // lock scroll while loader is showing
  useEffect(() => {
    if (showLoader) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showLoader]);

  return (
    <>
      {/* App is rendered underneath, so reveal feels instant */}
      {children}
      <LoadingScreen show={showLoader} label="Loading GD Esports" />
    </>
  );
}
