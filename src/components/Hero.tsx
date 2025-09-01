import { Button } from "@/components/ui/button";
import { ArrowRight, Database, BarChart, Map, Skull, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/baltic-sea-hero.jpg";
import { HERO_CTAS } from "@/config/nav";
import { scrollToHash } from "@/utils/navigation";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Baltic Sea aerial view with data monitoring points"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-tech opacity-90"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Database className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold text-primary">Baltic Intelligence Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Maritime Intelligence
          <br />
          <span className="bg-gradient-investment bg-clip-text text-transparent">
            & Analytics Hub
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-foreground">
          Advanced Baltic Sea intelligence platform integrating real-time monitoring, 
          shadow fleet detection, environmental analytics, automated ecological scorecards,
          and AI-powered insights for strategic decision making.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            variant="secondary" 
            size="lg" 
            className="group transition-all duration-300 hover:shadow-investment hover:scale-105"
            onClick={() => scrollToHash('dashboard', 80)}
          >
            <BarChart className="w-5 h-5 mr-2" />
            Intelligence Dashboard
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {HERO_CTAS.map((cta) => {
            const IconComponent = cta.label === "Get Started" ? Anchor : 
                                 cta.label === "Port Services" ? Anchor : Skull;
            return (
              <Button 
                key={cta.testId}
                variant="hero" 
                size="lg"
                className="group transition-all duration-300 hover:shadow-investment hover:scale-105"
                onClick={() => navigate(cta.href)}
                data-testid={cta.testId}
                aria-label={cta.description}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {cta.label}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            );
          })}
        </div>
        
        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-card/20 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:shadow-tech transition-all duration-300 hover:scale-105">
            <BarChart className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2 text-primary">Real-Time Analytics</h3>
            <p className="text-foreground/80">Advanced visualization of maritime parameters and environmental indicators</p>
          </div>
          <div className="bg-card/20 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:shadow-tech transition-all duration-300 hover:scale-105">
            <Database className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2 text-primary">Integrated Intelligence</h3>
            <p className="text-foreground/80">Unified platform for AIS tracking, environmental data, and security analysis</p>
          </div>
          <div className="bg-card/20 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:shadow-tech transition-all duration-300 hover:scale-105">
            <Map className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2 text-primary">AI-Powered Insights</h3>
            <p className="text-foreground/80">Predictive analytics, threat detection, and strategic decision support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;