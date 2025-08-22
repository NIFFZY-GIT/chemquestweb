import UnityPlayer from "@/app/components/UnityPlayer";

export default function SimulationsPage() {
  // IMPORTANT: Replace 'YourProjectName' with the actual name of your .data, .framework, etc. files.
  // Check the filenames in your public/unity/MySimulation/Build folder.
  const projectName = "YourProjectName"; 

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold my-8">Interactive Simulation</h1>
      <p className="mb-4">
        Loading the Unity WebGL project. Please wait...
      </p>
      <div className="w-full max-w-4xl border-4 border-gray-300 rounded-lg overflow-hidden">
        <UnityPlayer
          loaderUrl={`/unity/MySimulation/Build/${projectName}.loader.js`}
          dataUrl={`/unity/MySimulation/Build/${projectName}.data.gz`}
          frameworkUrl={`/unity/MySimulation/Build/${projectName}.framework.js.gz`}
          codeUrl={`/unity/MySimulation/Build/${projectName}.wasm.gz`}
          buildUrl={""} // The buildUrl prop isn't used in this setup, but can be kept for consistency
        />
      </div>
    </div>
  );
}