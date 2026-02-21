import { Link } from "react-router-dom";
import { Sprout, Leaf, CloudSun, TrendingUp, Droplets, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  {
    icon: Leaf,
    title: "Disease Detection",
    desc: "Upload a leaf photo and get instant AI-powered diagnosis with treatment advice.",
  },
  {
    icon: CloudSun,
    title: "Weather Forecast",
    desc: "7-day forecasts with smart farming alerts — know the best days to sow, spray, and harvest.",
  },
  {
    icon: Droplets,
    title: "Smart Irrigation",
    desc: "Automated watering schedules based on soil moisture, crop type, and weather predictions.",
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    desc: "Live mandi prices with AI trend predictions — sell your crops at the best time.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sprout size={28} className="text-primary" />
            <span className="font-display text-xl font-bold text-primary">AgriSmart</span>
          </div>
          <Link to="/auth">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-75" />
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-2xl animate-slide-up">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
              Grow Smarter,{" "}
              <span className="text-accent">Harvest Better</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg">
              AI-powered insights for small-scale farmers — detect diseases, predict weather,
              optimize irrigation, and get the best market prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8">
                  Get Started <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">
            Everything You Need to Farm Smart
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Simple, powerful tools designed for farmers — no technical expertise required.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all group"
              >
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 AgriSmart — Empowering Farmers with Technology
        </div>
      </footer>
    </div>
  );
};

export default Landing;
