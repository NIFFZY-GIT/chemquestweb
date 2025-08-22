"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo1.png" // NOTE: Use a logo variant suitable for dark backgrounds
            alt="ChemQuest Logo"
            width={160}
            height={40}
            priority
          />
        </Link>

        {/* Navigation Links with "Pill" Active State */}
        <div className="hidden md:flex items-center space-x-2 rounded-full bg-zinc-800 p-1">
          <Link
            href="/"
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              pathname === "/"
                ? "bg-zinc-100 text-zinc-900" // Active style
                : "text-zinc-400 hover:text-white" // Inactive style
            }`}
          >
            Home
          </Link>
          <Link
            href="/simulations"
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              pathname === "/simulations"
                ? "bg-zinc-100 text-zinc-900" // Active style
                : "text-zinc-400 hover:text-white" // Inactive style
            }`}
          >
            Simulations
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;