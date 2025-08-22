import Link from 'next/link';
import Image from 'next/image'; // We'll use this for a hero image

export default function HomePage() {
  return (
    <>
      {/* Hero Section: The main welcome area */}
      <section className="text-center py-20 md:py-28">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Welcome to ChemQuest Interactive
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Explore the fascinating world of chemistry through hands-on, interactive WebGL simulations. Visualize molecules, conduct experiments, and learn in a safe, virtual environment.
          </p>
          <Link
            href="/simulations"
            className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300"
          >
            Launch Simulations
          </Link>
        </div>
      </section>

      {/* Features Section: Highlight what your site offers */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What You Can Do</h2>
            <p className="text-gray-500 mt-2">Our platform offers a range of powerful features.</p>
          </div>

          {/* Grid for features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="text-5xl text-blue-500 mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">Interactive Experiments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Safely mix chemicals and observe reactions without stepping into a real lab.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="text-5xl text-green-500 mb-4">🧬</div>
              <h3 className="text-xl font-semibold mb-2">3D Molecule Viewer</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rotate and inspect complex molecular structures in three dimensions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="text-5xl text-purple-500 mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Engaging Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A gamified approach to learning that makes complex topics fun and memorable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}