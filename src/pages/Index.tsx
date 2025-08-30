import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import MarineDataDashboard from "@/components/MarineDataDashboard";
import MaritimeIntelligencePlatform from "@/components/MaritimeIntelligencePlatform";
import InteractiveMaritimeMap from "@/components/InteractiveMaritimeMap";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <MarineDataDashboard />
      <section id="intelligence-section" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-investment bg-clip-text text-transparent">
              Maritime Intelligence Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform data into revenue with AI-powered market intelligence, competitive analysis, and predictive insights
            </p>
          </div>
          <MaritimeIntelligencePlatform />
        </div>
      </section>
      
      {/* Interactive Maritime Map Section */}
      <section id="interactive-map-section" className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Real-Time Maritime Intelligence Map
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Interactive visualization of live maritime data with waves, currents, wind, vessel traffic, and infrastructure overlays
            </p>
          </div>
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden" style={{ height: '600px' }}>
            <InteractiveMaritimeMap />
          </div>
        </div>
      </section>
      
      <Dashboard />
      <Features />
    </div>
  );
};

export default Index;
