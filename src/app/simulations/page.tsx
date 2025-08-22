// d:/Company/Projects/chemquestweb/chemquestweb/src/app/simulations/page.tsx
import UnityPlayer from "@/components/UnityPlayer";

export default function SimulationsPage() {
  // 1. Updated the project name to 'chemquest'
  const projectName = "chemi"; 

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen py-8 bg-black">
      <div className="w-full max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 sm:text-5xl">
          Interactive Simulation
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          The simulation is loading below. Please allow a moment for the assets to download.
        </p>
      </div>

      <div className="w-full max-w-6xl mt-8 aspect-video rounded-xl border border-zinc-800 overflow-hidden">
        {/* 2. Updated the URLs to use the correct .unityweb extension */}
        <UnityPlayer
          loaderUrl={`/unity/MySimulation/Build/${projectName}.loader.js`}
          dataUrl={`/unity/MySimulation/Build/${projectName}.data.unityweb`}
          frameworkUrl={`/unity/MySimulation/Build/${projectName}.framework.js.unityweb`}
          codeUrl={`/unity/MySimulation/Build/${projectName}.wasm.unityweb`}
        />
      </div>
    </div>
  );
}