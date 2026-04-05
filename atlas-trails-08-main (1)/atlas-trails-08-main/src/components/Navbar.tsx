import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Map } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import atlasLogo from "@/assets/atlas-logo.png";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={atlasLogo}
            alt="Atlas Trails"
            className="w-9 h-9 object-contain group-hover:scale-110 transition-transform"
          />
          <span className="font-display font-bold text-lg tracking-tight">
            Atlas <span className="text-gradient-mint">Trails</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/planner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Plan Trip</Link>
          {user && <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-2xl gap-2 font-medium">
                  <div className="w-7 h-7 rounded-xl gradient-mint flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-navy" />
                  </div>
                  <span className="hidden md:block max-w-24 truncate text-sm">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border border-border shadow-card w-44">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-xl gap-2 cursor-pointer">
                  <Map className="w-4 h-4" /> My Trips
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl gap-2 cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-2xl text-sm font-medium">Sign In</Button>
              </Link>
              <Link to="/register">
                <button className="btn-atlas-primary text-sm">Create Account</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
