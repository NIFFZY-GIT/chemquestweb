// d:/Company/Projects/chemquestweb/chemquestweb/src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

// A simple SVG Icon component for the features section
const FeatureIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
    {children}
  </div>
);

export default function HomePage() {
  return (
    // Set a dark background for the entire page
    <div className="w-full bg-black text-zinc-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-24 md:py-32">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] [background-size:16px_16px]"></div>
        {/* Faded overlay */}
        <div className="absolute inset-0 z-10 bg-black/70"></div>

        <div className="container relative z-20 mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 sm:text-5xl md:text-7xl">
            Your Interactive Chemistry Lab
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-zinc-400">
            Dive into the molecular world with stunning, real-time WebGL simulations. No installations, no complex setups—just pure discovery.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/simulations"
              className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-100 px-8 text-sm font-semibold text-zinc-900 shadow transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Launch The Lab
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-8 text-sm font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800/50 hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Image / Simulation Preview */}
      <section className="relative z-20 -mt-16 px-4">
        <div className="container mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 backdrop-blur-sm">
             {/* ACTION: Replace with an actual screenshot of your amazing simulation! */}
   <div className="flex justify-center items-center h-screen">
  <Image
    src="/images/p1.png"
    alt="Simulation Preview"
    width={1200}
    height={675}
    className="rounded-lg"
  />
</div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Features Designed for Discovery</h2>
            <p className="mt-4 max-w-2xl mx-auto text-zinc-400">
              Our platform is more than just a viewer; it&apos;s a complete learning environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <FeatureIcon>
                <span className="text-3xl">🔬</span>
              </FeatureIcon>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Experiments</h3>
              <p className="text-zinc-400">
                Safely mix chemicals and observe complex reactions in a controlled, virtual environment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <FeatureIcon>
                <span className="text-3xl">🧬</span>
              </FeatureIcon>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time 3D Viewer</h3>
              <p className="text-zinc-400">
                Manipulate, rotate, and inspect intricate molecular structures with our high-performance WebGL engine.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <FeatureIcon>
                <span className="text-3xl">📚</span>
              </FeatureIcon>
              <h3 className="text-xl font-semibold text-white mb-2">Curriculum Integrated</h3>
              <p className="text-zinc-400">
                Designed to complement traditional learning, making abstract concepts tangible and memorable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}