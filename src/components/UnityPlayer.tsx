"use client";

import React, { useState, useEffect, useRef } from "react";

// --- START: TYPE DEFINITIONS ---

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
    __chemquestUnityBusy?: boolean;
  }
}

// --- END: TYPE DEFINITIONS ---

// --- START: MODIFICATION ---
// Add onExit to the props interface
interface UnityPlayerProps {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  onExit: () => void; // Callback function to notify the parent to exit
}
// --- END: MODIFICATION ---

const UnityPlayer: React.FC<UnityPlayerProps> = ({ loaderUrl, dataUrl, frameworkUrl, codeUrl, onExit }) => {
  const [unityInstance, setUnityInstance] = useState<UnityInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityRef = useRef<UnityInstance | null>(null);
  const initTokenRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const canQuitSafely = () => {
    try {
      const w = window as unknown as { Module?: { GLctx?: unknown } };
      return !!(w.Module && w.Module.GLctx);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fullLoaderUrl = loaderUrl.startsWith("/") ? loaderUrl : loaderUrl;
    const tokenOnMount = initTokenRef.current;

    const load = async () => {
      try {
        const head = await fetch(fullLoaderUrl, { method: "HEAD" });
        if (!head.ok) throw new Error(`Loader not reachable: ${fullLoaderUrl} (${head.status})`);

        let script = Array.from(document.scripts).find((s) => s.src === fullLoaderUrl) as HTMLScriptElement | undefined;
        if (!script) {
          script = document.createElement("script");
          script.src = fullLoaderUrl;
          script.async = true;
        }

        const myToken = tokenOnMount + 1;
        initTokenRef.current = myToken;

        script.onload = () => {
          if (myToken !== initTokenRef.current) return;
          if (!canvasRef.current) return;

          const config: UnityConfig = { dataUrl, frameworkUrl, codeUrl, companyName: "DefaultCompany", productName: "LabX", productVersion: "1.0" };
          const canvasEl = canvasRef.current as HTMLCanvasElement;
          try {
            canvasEl.width = 1920;
            canvasEl.height = 1080;
          } catch { /* ignore */ }

          if (window.__chemquestUnityBusy) {
            console.warn('Unity instance already running; skip duplicate init.');
            setIsLoading(false);
            return;
          }

          try {
            window.__chemquestUnityBusy = true;
            window
              .createUnityInstance(canvasRef.current as HTMLElement, config, (progress) => {
                setLoadingProgress(Math.round(progress * 100));
              })
              .then((instance) => {
                if (myToken !== initTokenRef.current) {
                  if (canQuitSafely()) {
                    instance.Quit().catch(() => {}).finally(() => { window.__chemquestUnityBusy = false; });
                  } else {
                    console.warn('Stale Unity instance: runtime already torn down, skipping Quit()');
                    window.__chemquestUnityBusy = false;
                  }
                  return;
                }
                setIsLoading(false);
                setUnityInstance(instance);
                unityRef.current = instance;
              })
              .catch((err) => {
                console.error("createUnityInstance error:", err);
                window.__chemquestUnityBusy = false;
                setIsLoading(false);
              });
          } catch (err) {
            console.error('Failed to create Unity instance:', err);
            window.__chemquestUnityBusy = false;
            setIsLoading(false);
          }
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
      initTokenRef.current = tokenOnMount + 1;
      try {
        const inst = unityRef.current;
        if (inst) {
          if (canQuitSafely()) {
            inst.Quit().catch((e) => console.warn('Unity Quit() failed:', e)).finally(() => {
              unityRef.current = null;
              window.__chemquestUnityBusy = false;
            });
          } else {
            console.warn('Skipping Quit() during cleanup: Module/GLctx missing');
            unityRef.current = null;
            window.__chemquestUnityBusy = false;
          }
        } else {
          window.__chemquestUnityBusy = false;
        }
      } catch (cleanupErr) {
        console.warn('Unity cleanup error:', cleanupErr);
        unityRef.current = null;
        window.__chemquestUnityBusy = false;
      }
    };
  }, [loaderUrl, dataUrl, frameworkUrl, codeUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (unityInstance && container) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          unityInstance.SetFullscreen(1);
        });
      } else {
        console.warn("Browser Fullscreen API not available, falling back to Unity's SetFullscreen.");
        unityInstance.SetFullscreen(1);
      }
    }
  }, [unityInstance]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        id="unity-canvas"
        tabIndex={-1}
        className="w-full h-full"
      ></canvas>

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

      {/* --- START: MODIFICATION --- */}
      {/* Controls Overlay (e.g., Exit button) */}
      {!isLoading && unityInstance && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onExit} // Call the parent's exit function
            className="p-2 bg-black/50 text-white rounded-md hover:bg-black/80 transition-colors flex items-center gap-2"
            title="Exit Simulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>Exit</span>
          </button>
        </div>
      )}
      {/* --- END: MODIFICATION --- */}
    </div>
  );
};

export default UnityPlayer;