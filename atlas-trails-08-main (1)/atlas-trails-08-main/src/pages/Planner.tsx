import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Calendar, IndianRupee, Users, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import DatePickerModal from "@/components/DatePickerModal";

// Major Indian cities
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
  "Vadodara", "Goa", "Agra", "Kochi", "Chandigarh", "Coimbatore",
  "Mysore", "Varanasi", "Amritsar", "Jodhpur", "Udaipur", "Shimla",
  "Manali", "Leh", "Darjeeling", "Gangtok", "Pondicherry", "Ooty",
  "Munnar", "Hampi", "Rishikesh", "Haridwar",
];

const INTERESTS = [
  { id: "adventure", label: "Adventure", emoji: "🧗" },
  { id: "landmarks", label: "Landmarks", emoji: "🏛️" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "history", label: "History", emoji: "📜" },
];

const COMPANIONS = [
  { id: "solo", label: "Solo", emoji: "🧑‍💼" },
  { id: "couple", label: "Couple", emoji: "💑" },
  { id: "friends", label: "Friends", emoji: "👫" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
];

// City dropdown
const CityDropdown = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-navy">{label}</label>
      <div
        className="input-atlas w-full flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl shadow-elevated border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <input
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search city..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-2">
            {filtered.map(c => (
              <div
                key={c}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-mint-light hover:text-navy transition-colors"
                onClick={() => { onChange(c); setOpen(false); setQuery(""); }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Planner = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    travelDates: "",
    duration: 5,
    budget: 2000,
    companions: "",
    interests: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleInterest = (id: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter(i => i !== id) : [...f.interests, id],
    }));
  };

  const handleDateApply = (result: { label: string; duration: number }) => {
    setForm(f => ({ ...f, travelDates: result.label, duration: result.duration }));
    setShowDatePicker(false);
  };

  const handleGenerate = async () => {
    if (!form.origin || !form.destination) {
      return alert("Please select both origin and destination.");
    }
    if (!form.companions) return alert("Please select who you're travelling with.");
    if (form.interests.length === 0) return alert("Please select at least one interest.");

    setLoading(true);
    sessionStorage.setItem("tripForm", JSON.stringify(form));
    navigate("/itinerary");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {showDatePicker && (
        <DatePickerModal
          onApply={handleDateApply}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint-light border border-mint/30 text-sm font-medium text-mint-dark mb-4">
              <Sparkles className="w-4 h-4" />
              AI Trip Planner
            </div>
            <h1 className="font-display text-4xl font-bold text-navy">Plan Your Perfect Trip</h1>
            <p className="text-muted-foreground mt-3">Fill in your details and Atlas will craft a personalized itinerary just for you.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-card border border-border space-y-8 animate-scale-in">
            {/* From / To */}
            <div className="grid grid-cols-2 gap-4">
              <CityDropdown label="From (Origin)" value={form.origin} onChange={v => setForm(f => ({ ...f, origin: v }))} placeholder="Select city" />
              <CityDropdown label="To (Destination)" value={form.destination} onChange={v => setForm(f => ({ ...f, destination: v }))} placeholder="Select city" />
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-mint-dark" />
                When are you planning to travel?
              </label>
              <button
                type="button"
                className="input-atlas w-full flex items-center justify-between text-left cursor-pointer"
                onClick={() => setShowDatePicker(true)}
              >
                <span className={form.travelDates ? "text-foreground" : "text-muted-foreground"}>
                  {form.travelDates || "Select dates"}
                </span>
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
              {form.duration > 0 && form.travelDates && (
                <p className="text-xs text-mint-dark font-medium">{form.duration} day{form.duration !== 1 ? "s" : ""} selected</p>
              )}
            </div>

            {/* Budget slider */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-navy flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-mint-dark" />
                Budget per day
                <span className="ml-auto font-bold text-mint-dark">₹{form.budget.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(149, 83%, 71%) 0%, hsl(149, 83%, 71%) ${((form.budget - 500) / 19500) * 100}%, hsl(220, 15%, 88%) ${((form.budget - 500) / 19500) * 100}%, hsl(220, 15%, 88%) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹500</span><span>₹20,000</span>
              </div>
            </div>

            {/* Companions */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-navy flex items-center gap-1.5"><Users className="w-4 h-4 text-mint-dark" />Who are you travelling with?</label>
              <div className="grid grid-cols-4 gap-3">
                {COMPANIONS.map(c => (
                  <div
                    key={c.id}
                    className={`companion-card ${form.companions === c.id ? "selected" : ""}`}
                    onClick={() => setForm(f => ({ ...f, companions: c.id }))}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-xs font-medium text-navy">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-navy flex items-center gap-1.5"><MapPin className="w-4 h-4 text-mint-dark" />What interests you most? <span className="text-muted-foreground font-normal">(select multiple)</span></label>
              <div className="grid grid-cols-4 gap-3">
                {INTERESTS.map(i => (
                  <div
                    key={i.id}
                    className={`interest-card ${form.interests.includes(i.id) ? "selected" : ""}`}
                    onClick={() => toggleInterest(i.id)}
                  >
                    <div className="text-2xl mb-1">{i.emoji}</div>
                    <p className="text-xs font-medium text-navy">{i.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-atlas-primary w-full text-base h-14 flex items-center justify-center gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Itinerary</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
