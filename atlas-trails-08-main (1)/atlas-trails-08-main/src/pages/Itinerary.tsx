import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronUp, Clock, MapPin, IndianRupee, Sparkles,
  Send, RefreshCw, Hotel, Bus, Shield, DollarSign, Loader2, Download, Save
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import atlasAvatar from "@/assets/atlas-avatar.png";

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "bg-blue-50 text-blue-700",
  food: "bg-orange-50 text-orange-700",
  adventure: "bg-red-50 text-red-700",
  culture: "bg-purple-50 text-purple-700",
  transport: "bg-gray-50 text-gray-700",
  accommodation: "bg-mint-light text-mint-dark",
  nightlife: "bg-indigo-50 text-indigo-700",
};

interface Activity {
  time: string;
  name: string;
  description: string;
  estimatedCost: number;
  category: string;
  duration?: string;
  tips?: string;
}

interface Day {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  destination: string;
  totalEstimatedCost: number;
  highlights: string[];
  days: Day[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

const SUGGESTED_PROMPTS = [
  "Make it more budget friendly",
  "Add nightlife on Day 2",
  "Replace Day 1 with cultural activities",
  "Add more food experiences",
  "Make it more adventurous",
];

const EXTERNAL_LINKS = [
  { label: "Hotels", icon: Hotel, url: (dest: string) => `https://www.booking.com/search.html?ss=${encodeURIComponent(dest)}`, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Transport", icon: Bus, url: () => "https://www.redbus.in/", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Insurance", icon: Shield, url: () => "https://www.policybazaar.com/travel-insurance/", color: "bg-green-50 text-green-700 border-green-200" },
  { label: "Currency", icon: DollarSign, url: () => "https://www.xe.com/currencyconverter/", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(activity.name)}`;
  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all group cursor-pointer"
    >
      <div className="flex-shrink-0 text-center w-16">
        <p className="text-xs font-semibold text-primary">{activity.time}</p>
        {activity.duration && <p className="text-xs text-muted-foreground mt-0.5">{activity.duration}</p>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-1 ${CATEGORY_COLORS[activity.category] || "bg-gray-50 text-gray-700"}`}>
              {activity.category}
            </span>
            <h4 className="font-semibold text-sm text-navy group-hover:text-primary transition-colors flex items-center gap-1">
              {activity.name}
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{activity.description}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-semibold text-navy flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />{activity.estimatedCost?.toLocaleString()}
            </p>
          </div>
        </div>
        {activity.tips && (
          <p className="text-xs text-primary mt-2 bg-primary/10 px-3 py-1.5 rounded-xl">
            💡 {activity.tips}
          </p>
        )}
      </div>
    </a>
  );
};

const DayCard = ({ day }: { day: Day }) => {
  const [expanded, setExpanded] = useState(true);
  const total = day.activities.reduce((s, a) => s + (a.estimatedCost || 0), 0);

  return (
    <div className="day-card">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl gradient-mint flex items-center justify-center shadow-mint text-navy font-bold text-sm">
            {day.day}
          </div>
          <div className="text-left">
            <p className="font-semibold text-navy text-sm">{day.date || `Day ${day.day}`}</p>
            <p className="text-xs text-muted-foreground">{day.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-mint-dark flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5" />~{total.toLocaleString()}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
          {day.activities.map((a, i) => <ActivityCard key={i} activity={a} />)}
        </div>
      )}
    </div>
  );
};

const Itinerary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Atlas 🧭 Your personal travel companion. Ask me to modify your itinerary, suggest alternatives, or get tips about your destination!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [tripForm, setTripForm] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tripForm");
    if (!stored) { navigate("/planner"); return; }
    const form = JSON.parse(stored);
    setTripForm(form);
    // Check if we have a saved itinerary (from dashboard)
    const savedItinerary = sessionStorage.getItem("savedItinerary");
    if (savedItinerary) {
      sessionStorage.removeItem("savedItinerary");
      setItinerary(JSON.parse(savedItinerary));
      setLoading(false);
    } else {
      generateItinerary(form);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only showing the modified part inside Itinerary.tsx
// Everything else in your file remains unchanged

const generateItinerary = async (form: any) => {
  setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke("generate-itinerary", {
      body: {
        mode: "generate",
        tripType: form.tripType,               // Added: 'domestic' or 'international'
        country: form.country,                 // Added: selected country code (IN, JP, TR, etc.)
        cities: form.cities,                   // Added: selected cities ONLY
        origin: form.origin,
        destination: form.destination,
        travelDates: form.travelDates,
        durationDays: form.duration,
        budgetPerDay: form.budget,
        companions: form.companions,
        interests: form.interests,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    setItinerary(data.itinerary);
  } catch (e: any) {
    toast.error(e.message || "Failed to generate itinerary");
  } finally {
    setLoading(false);
  }
};

  const handleChatSend = async (prompt?: string) => {
    const text = prompt || chatInput.trim();
    if (!text || !itinerary) return;
    setChatInput("");
    const userMsg: Message = { role: "user", content: text };
    const loadingMsg: Message = { role: "assistant", content: "", loading: true };
    setMessages(m => [...m, userMsg, loadingMsg]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-itinerary", {
        body: { mode: "modify", previousItinerary: itinerary, userRequest: text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setItinerary(data.itinerary);
      setMessages(m => [
        ...m.slice(0, -1),
        { role: "assistant", content: `✅ Done! I've updated your itinerary: ${text}. The changes are reflected on the left. Let me know if you'd like further adjustments!` }
      ]);
    } catch (e: any) {
      setMessages(m => [...m.slice(0, -1), { role: "assistant", content: `Sorry, I couldn't process that. ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!user) { navigate("/login"); return; }
    if (!itinerary || !tripForm) return;
    try {
      const { error } = await supabase.from("trips").insert({
        user_id: user.id,
        title: itinerary.title,
        origin: tripForm.origin,
        destination: tripForm.destination,
        travel_dates: tripForm.travelDates,
        duration_days: tripForm.duration,
        budget_per_day: tripForm.budget,
        travel_companions: tripForm.companions,
        interests: tripForm.interests,
        itinerary: itinerary as any,
      });
      if (error) throw error;
      toast.success("Trip saved to your dashboard!");
    } catch (e: any) {
      toast.error("Failed to save trip");
    }
  };

  const handleDownload = () => {
    if (!itinerary) return;
    const text = itinerary.days.map(d =>
      `\n=== Day ${d.day}: ${d.theme} ===\n` +
      d.activities.map(a => `${a.time} — ${a.name}\n  ${a.description}\n  Cost: ₹${a.estimatedCost}`).join("\n")
    ).join("\n");
    const blob = new Blob([`${itinerary.title}\n\n${text}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${itinerary.destination}-itinerary.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[80vh] gap-6">
          <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-mint animate-pulse-mint">
            <img src={atlasAvatar} alt="Atlas AI" className="w-full h-full object-cover" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-navy">Atlas is planning your trip...</h2>
            <p className="text-muted-foreground">Crafting a personalized {tripForm?.duration}-day itinerary for {tripForm?.destination}</p>
          </div>
          <div className="flex gap-2 mt-2">
            {["Researching destinations", "Planning activities", "Optimizing budget"].map((s, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-mint-light text-mint-dark font-medium animate-fade-in" style={{ animationDelay: `${i * 0.3}s` }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  const totalCost = itinerary.days.reduce((s, d) => s + d.activities.reduce((ss, a) => ss + (a.estimatedCost || 0), 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Header strip */}
        <div className="bg-white border-b border-border px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-navy">{itinerary.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-mint-dark" />{tripForm?.origin} → {itinerary.destination}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-mint-dark" />{tripForm?.duration} days</span>
                <span className="text-sm font-semibold text-mint-dark flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />~{totalCost.toLocaleString()} total</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => generateItinerary(tripForm)} className="btn-atlas-outline h-9 px-4 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button onClick={handleSaveTrip} className="btn-atlas-outline h-9 px-4 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={handleDownload} className="btn-atlas-primary h-9 px-4 text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6">
          {/* Highlights */}
          {itinerary.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {itinerary.highlights.map((h, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-mint-light text-mint-dark font-medium border border-mint/20">
                  ✨ {h}
                </span>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Itinerary (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-display text-lg font-bold text-navy">Your Itinerary</h2>
              {itinerary.days.map((day, i) => <DayCard key={i} day={day} />)}

              {/* External booking buttons */}
              <div className="bg-white rounded-3xl p-6 border border-border shadow-card mt-6">
                <h3 className="font-semibold text-navy mb-4">Book & Plan</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EXTERNAL_LINKS.map((link, i) => (
                    <a
                      key={i}
                      href={link.url(itinerary.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all hover:shadow-card card-hover ${link.color}`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Chat (40%) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-border shadow-card sticky top-24 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 140px)", maxHeight: "720px" }}>
                {/* Chat header */}
                <div className="p-5 border-b border-border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-mint/40 shadow-mint flex-shrink-0">
                    <img src={atlasAvatar} alt="Atlas AI Assistant" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">Atlas</p>
                    <p className="text-xs text-mint-dark flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-mint-dark inline-block" />AI Travel Companion</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.loading ? (
                        <div className="chat-bubble-ai flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-mint-dark" />
                          <span className="text-muted-foreground">Updating itinerary...</span>
                        </div>
                      ) : (
                        <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested prompts */}
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleChatSend(p)}
                      disabled={chatLoading}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary border border-border hover:border-mint/50 hover:bg-mint-light transition-all text-navy font-medium"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 input-atlas text-xs h-10"
                      placeholder="Ask Atlas to modify your trip..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleChatSend()}
                      disabled={chatLoading}
                    />
                    <button
                      onClick={() => handleChatSend()}
                      disabled={chatLoading || !chatInput.trim()}
                      className="btn-atlas-primary h-10 w-10 px-0 flex items-center justify-center flex-shrink-0"
                    >
                      {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
