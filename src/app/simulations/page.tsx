"use client";

import { useState } from "react";
import UnityPlayer from "@/components/UnityPlayer";

export default function SimulationsPage() {
  const projectName = "chemquestweb6renderapi";
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const handleStartSimulation = () => {
    setIsSimulationRunning(true);
  };

  // --- START: MODIFICATION ---
  // This function will be passed to the UnityPlayer to handle the exit action.
  const handleExitSimulation = () => {
    setIsSimulationRunning(false);
  };
  // --- END: MODIFICATION ---

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen py-8 bg-black">
      <div className="w-full max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 sm:text-5xl">
          Interactive Simulation
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          {isSimulationRunning
            ? "The simulation is loading. Please allow a moment for the assets to download."
            : "Click the button below to launch the simulation in fullscreen mode."}
        </p>
      </div>

      <div className="w-full max-w-6xl mt-8 aspect-video">
        {isSimulationRunning ? (
          <div className="fixed inset-0 z-50 bg-black">
            <UnityPlayer
              loaderUrl={`/unity/MySimulation/Build/${projectName}.loader.js`}
              dataUrl={`/unity/MySimulation/Build/${projectName}.data.unityweb`}
              frameworkUrl={`/unity/MySimulation/Build/${projectName}.framework.js.unityweb`}
              codeUrl={`/unity/MySimulation/Build/${projectName}.wasm.unityweb`}
              onExit={handleExitSimulation} // Pass the handler down as a prop
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/80 flex items-center justify-center">
            <button
              onClick={handleStartSimulation}
              className="px-6 py-3 text-lg font-semibold text-white transition-all duration-150 bg-blue-600 rounded-md shadow-lg hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Launch Fullscreen Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}