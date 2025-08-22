const Footer = () => {
  return (
    // Use the same background color as the navbar for consistency
    <footer className="bg-[#242E42] text-slate-300 p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} ChemQuest. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;