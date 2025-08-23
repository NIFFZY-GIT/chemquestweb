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
  __chemquestUnityBusy?: boolean;
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
  // Token to identify the current initialization session so stale onload handlers
  // don't start new instances after this component has unmounted or reloaded.
  const initTokenRef = useRef<number>(0);

  // Small helper to detect whether the Unity runtime's Module and GLctx
  // appear to be present. If they're missing, calling Quit() can trigger
  // runtime errors inside the wasm that attempt to delete an already-missing
  // GL context.
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
    // Preflight: confirm loader.js is reachable to provide clearer errors early
    const fullLoaderUrl = loaderUrl.startsWith("/") ? loaderUrl : loaderUrl;

  // Capture the token at effect start to use in cleanup (avoids ref-change warnings).
  const tokenOnMount = initTokenRef.current;
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

  // Capture a token for this load cycle. If cleanup runs it will bump the
  // token and any pending onload handlers will no-op.
  const myToken = tokenOnMount + 1;
  initTokenRef.current = myToken;

        script.onload = () => {
          // If this load is stale (component unmounted or reloaded), don't init.
          if (myToken !== initTokenRef.current) return;
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
          // Ensure the canvas has explicit pixel dimensions matching the
          // Unity project's target resolution. This reduces the chance the
          // runtime will encounter odd state during init/teardown.
          const canvasEl = canvasRef.current as HTMLCanvasElement;
          try {
            // Set the logical drawing buffer size to 1920x1080 (native Unity)
            canvasEl.width = 1920;
            canvasEl.height = 1080;
          } catch {
            // ignore if assignment fails
          }

          // Prevent overlapping initializations across hot reloads or multiple
          // mounts. If another instance is active, skip creating a new one.
          if (window.__chemquestUnityBusy) {
            console.warn('Unity instance already running; skip duplicate init.');
            setIsLoading(false);
            return;
          }

          try {
            window.__chemquestUnityBusy = true;
            window
              .createUnityInstance(canvasRef.current as HTMLElement, config, (progress) => {
                // Update the loading progress state
                setLoadingProgress(Math.round(progress * 100));
              })
              .then((instance) => {
                // If a newer init token exists, immediately quit this stale instance
                if (myToken !== initTokenRef.current) {
                  // This instance is stale. Only attempt to Quit() if the runtime
                  // appears intact; otherwise just clear busy and forget the instance.
                  if (canQuitSafely()) {
                    instance
                      .Quit()
                      .catch(() => {
                        /* ignore */
                      })
                      .finally(() => {
                        window.__chemquestUnityBusy = false;
                      });
                  } else {
                    console.warn('Stale Unity instance: runtime already torn down, skipping Quit()');
                    window.__chemquestUnityBusy = false;
                  }
                  return;
                }

                // Once loaded, hide the loading bar and set the instance
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
      // Attempt to gracefully quit the Unity instance to free resources.
      // Don't eagerly remove loader scripts here — removing the loader while
      // the wasm/module is still winding down can cause "GLctx is undefined"
      // errors inside the Unity runtime. Instead, ask the instance to Quit()
      // and clear our reference. We purposely do not remove script tags here.
  // Mark pending loads as stale by advancing the token from the value
  // captured when the effect started. This uses the captured `tokenOnMount`
  // to avoid reading a ref that may have changed between render and cleanup.
  initTokenRef.current = tokenOnMount + 1;

      try {
        const inst = unityRef.current;
        if (inst) {
          if (canQuitSafely()) {
            inst
              .Quit()
              .catch((e) => console.warn('Unity Quit() failed:', e))
              .finally(() => {
                unityRef.current = null;
                window.__chemquestUnityBusy = false;
              });
          } else {
            console.warn('Skipping Quit() during cleanup: Module/GLctx missing');
            unityRef.current = null;
            window.__chemquestUnityBusy = false;
          }
        } else {
          // If no instance, ensure the busy flag is cleared so a future mount can start.
          window.__chemquestUnityBusy = false;
        }
      } catch (cleanupErr) {
        console.warn('Unity cleanup error:', cleanupErr);
        unityRef.current = null;
        window.__chemquestUnityBusy = false;
      }
    };
    // Do not include `unityInstance` in dependencies — when we set the instance the
    // effect would re-run and create a new instance repeatedly. Include the URLs
    // so the player will reload only when those change.
  }, [loaderUrl, dataUrl, frameworkUrl, codeUrl]);

   return (
    <div className="relative w-full h-full">
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
    </div>
  );
};

export default UnityPlayer;