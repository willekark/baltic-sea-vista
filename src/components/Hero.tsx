import { Button } from "@/components/ui/button";
import { ArrowRight, Database, BarChart, Map } from "lucide-react";
import heroImage from "@/assets/baltic-sea-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Baltic Sea aerial view with data monitoring points"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-depth opacity-75"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Database className="w-8 h-8 text-accent" />
          <span className="text-xl font-semibold text-accent">Baltic Data Hub</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Marine Data
          <br />
          <span className="bg-gradient-surface bg-clip-text text-transparent">
            Made Accessible
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-200">
          Comprehensive Baltic Sea data platform integrating environmental monitoring, 
          shipping routes, fisheries, and AI-powered analysis for policymakers, 
          researchers, and businesses.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            variant="secondary" 
            size="lg" 
            className="group transition-all duration-300 hover:shadow-surface"
            onClick={() => {
              const dashboardSection = document.getElementById('dashboard-section');
              if (dashboardSection) {
                dashboardSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
          >
            Explore Dashboard
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary"
            onClick={() => window.location.href = '/eutrophication'}
          >
            <Map className="w-5 h-5 mr-2" />
            Eutrophication Reports
          </Button>
        </div>
        
        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <BarChart className="w-12 h-12 text-accent mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Interactive Analytics</h3>
            <p className="text-gray-300">Real-time visualization of oxygen levels, temperature, and marine indicators</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Database className="w-12 h-12 text-accent mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Integrated Data</h3>
            <p className="text-gray-300">AIS shipping routes, fisheries, environmental monitoring in one platform</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Map className="w-12 h-12 text-accent mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-300">Forecasts, risk assessments, and scenario analysis for informed decisions</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;