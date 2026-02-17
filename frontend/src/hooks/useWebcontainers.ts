import { WebContainer } from "@webcontainer/api";
import { useState, useEffect, useRef } from "react";

// Singleton instance
let webContainerInstance: WebContainer | null = null;

export default function useWebcontainers() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip if already mounted
    if (isMounted.current) return;

    const bootWebContainer = async () => {
      console.log("Container Booting");
      try {
        // If we already have an instance, use it
        if (webContainerInstance) {
          setWebcontainer(webContainerInstance);
          return;
        }

        const webCInstance = await WebContainer.boot();
        webContainerInstance = webCInstance;
        setWebcontainer(webCInstance);
        isMounted.current = true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to boot WebContainer")
        );
        console.error("WebContainer boot error:", err);
      }
    };
    bootWebContainer();
  }, []);

  return { webcontainer, error };
}
