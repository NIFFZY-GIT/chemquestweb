"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import the auth context
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "@/lib/firebase";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Get the user's state from our global context
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        setIsMenuOpen(false);
        router.push('/'); // Redirect to homepage after logout
    };

    // Define links based on auth state
    const navLinks = user 
        ? [ // Links for LOGGED IN users
            { href: "/", label: "Home" },
            { href: "/simulations", label: "Simulations" },
            { href: "/classroom/dashboard", label: "Dashboard" },
          ]
        : [ // Links for LOGGED OUT users
            { href: "/", label: "Home" },
            { href: "/simulations", label: "Simulations" },
            { href: "/classroom", label: "Classroom" },
          ];

    return (
        <nav className="relative bg-zinc-900 border-b border-zinc-800 shadow-md z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Image src="/images/logo1.png" alt="ChemQuest Logo" width={160} height={40} priority />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-2">
                    <div className="rounded-full bg-zinc-800 p-1 flex space-x-2">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${ pathname === link.href ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-white" }`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    {/* Show logout button on desktop if user is logged in */}
                    {user && (
                        <button onClick={handleLogout} className="ml-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-full">
                            Logout
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button (remains the same) */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{/* ... hamburger/close icon ... */}</button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-zinc-800 transition-all duration-300 ease-in-out overflow-hidden ${ isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0" }`}>
                <div className="flex flex-col space-y-1 px-4 pt-2 pb-4">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${ pathname === link.href ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800 hover:text-white" }`}>
                            {link.label}
                        </Link>
                    ))}
                    {/* Show logout button in mobile menu if user is logged in */}
                    {user && (
                        <button onClick={handleLogout} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;