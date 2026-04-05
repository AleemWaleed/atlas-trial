import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import atlasLogo from "@/assets/atlas-logo.png";

const AuthPage = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);

    try {
      let error;
      if (tab === "login") {
        ({ error } = await signIn(email, password));
      } else {
        ({ error } = await signUp(email, password));
      }
      if (error) throw error;
      toast.success(tab === "login" ? "Welcome back!" : "Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-light/30 to-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <img src={atlasLogo} alt="Atlas Trails" className="w-12 h-12 object-contain" />
          <span className="font-display font-bold text-3xl text-navy">Atlas <span className="text-gradient-mint">Trails</span></span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-border">
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                tab === "login" ? "bg-mint-dark text-white shadow-lg" : "text-navy hover:bg-mint-light/50"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                tab === "register" ? "bg-mint-dark text-white shadow-lg" : "text-navy hover:bg-mint-light/50"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold text-navy mb-4 text-center">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {tab === "login"
              ? "Sign in to continue planning your adventures"
              : "Sign up to start your journey with Atlas Trails"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Email</label>
              <input
                type="email"
                className="input-atlas w-full"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input-atlas w-full pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-atlas-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>{tab === "login" ? "Sign In" : "Sign Up"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              className="text-mint-dark font-semibold cursor-pointer hover:underline"
              onClick={() => setTab(tab === "login" ? "register" : "login")}
            >
              {tab === "login" ? "Create Account" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;