import { Link } from "react-router-dom";
import { Sparkles, MapPin, Zap, Route, ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-travel.jpg";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Our intelligent Atlas engine crafts personalized day-by-day itineraries based on your unique preferences and budget.",
  },
  {
    icon: MapPin,
    title: "Smart Recommendations",
    description: "From hidden gems to iconic landmarks, Atlas suggests the best destinations, hotels, and experiences for you.",
  },
  {
    icon: Zap,
    title: "Instant Customization",
    description: "Chat with Atlas to modify any part of your trip in real-time. Swap activities, adjust budget, add nights out—instantly.",
  },
];

const destinations = [
  {
    name: "Rajasthan",
    tag: "Heritage",
    photo: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80",
  },
  {
    name: "Kerala",
    tag: "Nature",
    photo: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  },
  {
    name: "Goa",
    tag: "Beach",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
  },
  {
    name: "Ladakh",
    tag: "Adventure",
    photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  },
  {
    name: "Varanasi",
    tag: "Culture",
    photo: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=80",
  },
  {
    name: "Coorg",
    tag: "Hills",
    photo: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=80",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[560px]">
            {/* Left */}
            <div className="space-y-8 animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint-light border border-mint/30 text-sm font-medium text-mint-dark">
                <Sparkles className="w-4 h-4" />
                AI-Driven Travel Planning
              </div>

              <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-navy">
                Your Personal<br />
                <span className="text-gradient-mint">Travel Agent</span><br />
                is Here
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Tell Atlas where you want to go and what you love. Get a fully personalized, day-by-day itinerary in seconds — hotels, activities, routes, and budget included.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/planner">
                  <button className="btn-atlas-primary flex items-center gap-2 text-base px-8 h-14">
                    Plan My Trip
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {["🧑‍💼", "👩‍🦱", "🧔", "👩"].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-mint-light border-2 border-white flex items-center justify-center text-xs">
                      {e}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-mint text-mint" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">Loved by 10,000+ travelers</span>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                <img src={heroImage} alt="Travel destinations across India" className="w-full h-[420px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-mint flex items-center justify-center">
                    <Route className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Itinerary created</p>
                    <p className="text-sm font-semibold text-navy">Goa · 5 Days · ₹12,000</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2 shadow-card">
                <p className="text-sm font-semibold text-navy flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mint" /> AI Generated in 3s
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <h2 className="font-display text-4xl font-bold text-navy">Why Atlas Trails?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to plan the perfect trip, powered by artificial intelligence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-card card-hover border border-border">
                <div className="w-12 h-12 rounded-2xl gradient-mint flex items-center justify-center mb-6 shadow-mint">
                  <f.icon className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl font-bold text-navy">Popular Destinations</h2>
              <p className="text-muted-foreground mt-2">Explore India's most beloved travel spots</p>
            </div>
            <Link to="/planner">
              <button className="btn-atlas-outline hidden md:flex items-center gap-2">
                Plan a Trip <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((d, i) => (
              <Link key={i} to="/planner" className="group">
                <div className="rounded-2xl overflow-hidden border border-border shadow-card card-hover group-hover:border-mint/50 bg-white">
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm text-navy">{d.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.tag}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-navy mx-6 mb-20 rounded-3xl max-w-7xl lg:mx-auto">
        <div className="text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl gradient-mint flex items-center justify-center mx-auto shadow-mint">
            <Sparkles className="w-7 h-7 text-navy" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white">Ready to explore?</h2>
          <p className="text-white/70 text-lg max-w-md mx-auto">Start planning your dream trip with Atlas. It's free to get started.</p>
          <Link to="/planner">
            <button className="btn-atlas-primary text-base h-14 px-10 mt-4">
              Generate My Itinerary
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
