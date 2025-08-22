"use client";

import React, { useState, useEffect, useRef } from "react";

// --- START: TYPE DEFINITIONS ---

// Update the UnityInstance type to include the SetFullscreen method
interface UnityInstance {
  SendMessage: (gameObjectName: string, methodName: string, value?: string | number | boolean) => void;
  Quit: () => Promise<void>;
  SetFullscreen: (isFullscreen: 0 | 1) => void;
}

interface UnityConfig {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  companyName?: string;
  productName?: string;
  productVersion?: string;
}

declare global {
  interface Window {
    createUnityInstance: (
      canvas: HTMLElement,
      config: UnityConfig,
      onProgress?: (progress: number) => void
    ) => Promise<UnityInstance>;
  }
}

// --- END: TYPE DEFINITIONS ---

interface UnityPlayerProps {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
}

const UnityPlayer: React.FC<UnityPlayerProps> = ({ loaderUrl, dataUrl, frameworkUrl, codeUrl }) => {
  // State to manage the Unity instance and loading progress
  const [unityInstance, setUnityInstance] = useState<UnityInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Ref to hold the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep a ref for the Unity instance so cleanup doesn't force effect to re-run
  const unityRef = useRef<UnityInstance | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Preflight: confirm loader.js is reachable to provide clearer errors early
    const fullLoaderUrl = loaderUrl.startsWith("/") ? loaderUrl : loaderUrl;

    const load = async () => {
      try {
        // Check loader is reachable
        const head = await fetch(fullLoaderUrl, { method: "HEAD" });
        if (!head.ok) throw new Error(`Loader not reachable: ${fullLoaderUrl} (${head.status})`);

        // Don't inject the same script multiple times
        let script = Array.from(document.scripts).find((s) => s.src === fullLoaderUrl) as HTMLScriptElement | undefined;
        if (!script) {
          script = document.createElement("script");
          script.src = fullLoaderUrl;
          script.async = true;
        }

        script.onload = () => {
          if (!canvasRef.current) return;

          const config: UnityConfig = {
            dataUrl,
            frameworkUrl,
            codeUrl,
            // You can match these to your Unity project's settings
            companyName: "DefaultCompany",
            productName: "LabX",
            productVersion: "1.0",
          };

          // The third argument is the progress callback
          window
            .createUnityInstance(canvasRef.current, config, (progress) => {
              // Update the loading progress state
              setLoadingProgress(Math.round(progress * 100));
            })
            .then((instance) => {
              // Once loaded, hide the loading bar and set the instance
              setIsLoading(false);
              setUnityInstance(instance);
              unityRef.current = instance;
            })
            .catch((err) => {
              console.error("createUnityInstance error:", err);
            });
        };

        script.onerror = (e) => {
          console.error("Failed to load Unity loader script:", fullLoaderUrl, e);
          setIsLoading(false);
        };

        if (!Array.from(document.scripts).some((s) => s.src === fullLoaderUrl)) {
          document.body.appendChild(script);
        }
      } catch (err) {
        console.error("Unity loader preflight failed:", err);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      // Best-effort cleanup of any loader script(s) that reference the /unity/ folder
      const scripts = Array.from(document.querySelectorAll(`script[src*="/unity/"]`));
  scripts.forEach((s) => s.parentNode?.removeChild(s));
  // Optional: Properly quit the instance to free up memory
  unityRef.current?.Quit();
    };
    // Do not include `unityInstance` in dependencies — when we set the instance the
    // effect would re-run and create a new instance repeatedly. Include the URLs
    // so the player will reload only when those change.
  }, [loaderUrl, dataUrl, frameworkUrl, codeUrl]);

  const handleFullscreen = () => {
    if (unityInstance) {
      unityInstance.SetFullscreen(1);
    }
  };

   return (
    <div className="relative w-full h-full">
      {/* 👇 ADD tabIndex={-1} TO THIS LINE 👇 */}
   <canvas 
        ref={canvasRef} 
        id="unity-canvas" 
        tabIndex={-1} 
        className="w-full h-full"
      ></canvas>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
          <div className="w-64 text-center">
            <div className="text-white text-lg mb-2">Loading Simulation...</div>
            <div className="w-full bg-zinc-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-zinc-400 text-sm mt-2">{loadingProgress}%</div>
          </div>
        </div>
      )}

      {/* Controls Overlay (e.g., Fullscreen button) */}
      {!isLoading && unityInstance && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleFullscreen}
            className="p-2 bg-black/50 text-white rounded-md hover:bg-black/80 transition-colors"
            title="Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default UnityPlayer;