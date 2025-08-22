import Link from "next/link";
import Image from "next/image";

// A placeholder for social icons.
// For a real project, you'd use an icon library like `lucide-react`
const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 transition-colors hover:text-white"
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Column 1: Logo and Mission Statement */}
          <div className="md:col-span-1">
            <Link href="/">
              <Image
                src="/images/logo1.png" // UPDATE with your logo path (use a white/light variant)
                alt="ChemQuest Logo"
                width={160}
                height={40}
              />
            </Link>
            <p className="mt-4 text-sm text-zinc-400 max-w-xs">
              Making complex chemistry accessible and interactive for everyone.
            </p>
          </div>

          {/* Column 2 & 3: Navigation Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="font-semibold text-zinc-100 mb-4">Pages</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/simulations" className="text-zinc-400 hover:text-white transition-colors">Simulations</Link></li>
                {/* Add more links like About, Contact etc. here */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Social Icons */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} ChemQuest. All Rights Reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <SocialIcon href="https://twitter.com">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </SocialIcon>
            <SocialIcon href="https://github.com">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;