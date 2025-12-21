import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen.jsx";

export default function LoadingGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200); // adjust duration
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <LoadingScreen />;
  return children;
}
