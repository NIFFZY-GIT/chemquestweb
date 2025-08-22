"use client"; // This is a client component

import React, { useEffect } from "react";

// Define the props for our component
interface UnityPlayerProps {
  buildUrl: string;
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
}

const UnityPlayer: React.FC<UnityPlayerProps> = ({
  loaderUrl,
  dataUrl,
  frameworkUrl,
  codeUrl,
}) => {
  useEffect(() => {
    // The Unity loader script is designed to be run in a global scope.
    // We need to make sure it's loaded before we can use it.
    const script = document.createElement("script");
    script.src = loaderUrl;
    script.async = true;

    script.onload = () => {
      // The script is loaded, now we can create the instance.
      // The `createUnityInstance` function is now available on the window object.
      (window as Window & {
        createUnityInstance?: (
          canvas: HTMLCanvasElement | null,
          config: {
            dataUrl: string;
            frameworkUrl: string;
            codeUrl: string;
          }
        ) => Promise<unknown>;
      }).createUnityInstance?.(
        document.querySelector("#unity-canvas") as HTMLCanvasElement,
        {
          dataUrl: dataUrl,
          frameworkUrl: frameworkUrl,
          codeUrl: codeUrl,
          // You can add other configuration options here
        }
      )
        .then((unityInstance: unknown) => {
          console.log("Unity instance created!", unityInstance);
          // You can interact with your unityInstance here
        })
        .catch((message: string) => {
          console.error(message);
        });
    };

    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [loaderUrl, dataUrl, frameworkUrl, codeUrl]);

  return (
    <div className="w-full h-[600px] flex justify-center items-center">
      {/* The canvas element is where the Unity project will be rendered */}
      <canvas id="unity-canvas" className="w-full h-full"></canvas>
    </div>
  );
};

export default UnityPlayer;