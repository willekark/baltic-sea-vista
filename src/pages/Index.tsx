import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import MarineDataDashboard from "@/components/MarineDataDashboard";
import MaritimeIntelligencePlatform from "@/components/MaritimeIntelligencePlatform";
import InteractiveMaritimeMap from "@/components/InteractiveMaritimeMap";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Hero />
        <MarineDataDashboard />
        
        {/* Energy Intelligence Feature Card */}
        <section className="py-16 bg-gradient-to-br from-muted/30 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8 border border-border/50">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Energy Flows & Infrastructure
                    </h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      Track grid prices, renewable output, OPS adoption, and green fuel infrastructure to support port electrification and investment decisions.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Nord Pool Prices
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Offshore Wind
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        OPS Coverage
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Green Fuels
                      </div>
                    </div>
                    <a 
                      href="/energy"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
                    >
                      Explore Energy Intelligence
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
    </div>
  );
};

export default Index;
