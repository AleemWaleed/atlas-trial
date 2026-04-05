import { Link } from "react-router-dom";
import atlasLogo from "@/assets/atlas-logo.png";

const Footer = () => (
  <footer className="border-t border-border bg-white py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <Link to="/" className="flex items-center gap-2.5">
        <img src={atlasLogo} alt="Atlas Trails" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold text-base">Atlas Trails</span>
      </Link>
      <p className="text-sm text-muted-foreground text-center">
        Your Intelligent Travel Companion — Powered by AI
      </p>
      <p className="text-xs text-muted-foreground">© 2025 Atlas Trails. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
