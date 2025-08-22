// d:/Company/Projects/chemquestweb/chemquestweb/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext"; // <-- IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChemQuest",
  description: "Interactive Chemistry Simulations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-black`}>
        <AuthProvider> {/* <-- WRAPPER START */}
          <Navbar />
          <main className="flex-grow container mx-auto p-4">{children}</main>
          <Footer />
        </AuthProvider> {/* <-- WRAPPER END */}
      </body>
    </html>
  );
}