import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, IndianRupee, Plus, Trash2, Loader2, Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Trip {
  id: string;
  title: string | null;
  origin: string;
  destination: string;
  travel_dates: string | null;
  duration_days: number | null;
  budget_per_day: number | null;
  travel_companions: string | null;
  interests: string[] | null;
  itinerary: any;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (!error) setTrips(data || []);
    setLoading(false);
  };

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (!error) { setTrips(t => t.filter(trip => trip.id !== id)); toast.success("Trip deleted"); }
  };

  const loadTrip = (trip: Trip) => {
    sessionStorage.setItem("tripForm", JSON.stringify({
      origin: trip.origin,
      destination: trip.destination,
      travelDates: trip.travel_dates || "",
      duration: trip.duration_days || 5,
      budget: trip.budget_per_day || 2000,
      companions: trip.travel_companions || "solo",
      interests: trip.interests || [],
    }));
    sessionStorage.setItem("savedItinerary", JSON.stringify(trip.itinerary));
    navigate("/itinerary");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mint" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-navy">My Trips</h1>
              <p className="text-muted-foreground mt-1">{trips.length} saved {trips.length === 1 ? "itinerary" : "itineraries"}</p>
            </div>
            <button onClick={() => navigate("/planner")} className="btn-atlas-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Plan New Trip
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-border shadow-card">
              <div className="w-16 h-16 rounded-3xl gradient-mint flex items-center justify-center mx-auto mb-4 shadow-mint">
                <Compass className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-display text-xl font-bold text-navy mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">Start planning your first adventure with Atlas</p>
              <button onClick={() => navigate("/planner")} className="btn-atlas-primary">Plan My First Trip</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-3xl border border-border shadow-card card-hover overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-display font-bold text-navy text-base leading-tight">
                          {trip.title || `${trip.origin} → ${trip.destination}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-mint-dark" />{trip.origin} → {trip.destination}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-mint-light text-mint-dark font-medium capitalize">
                        {trip.travel_companions || "solo"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                      {trip.duration_days && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-mint-dark" />{trip.duration_days} days</span>
                      )}
                      {trip.budget_per_day && (
                        <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-mint-dark" />₹{trip.budget_per_day.toLocaleString()}/day</span>
                      )}
                      {trip.travel_dates && (
                        <span>{trip.travel_dates}</span>
                      )}
                    </div>

                    {trip.interests && trip.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {trip.interests.slice(0, 4).map((interest, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{interest}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => loadTrip(trip)} className="btn-atlas-primary flex-1 h-9 text-sm">
                        View Itinerary
                      </button>
                      <button onClick={() => deleteTrip(trip.id)} className="btn-atlas-outline h-9 w-9 px-0 flex items-center justify-center text-destructive border-destructive/20 hover:bg-destructive/5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
