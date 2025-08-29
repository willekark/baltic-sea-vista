import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import MarineDataDashboard from "@/components/MarineDataDashboard";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <MarineDataDashboard />
      <Dashboard />
      <Features />
    </div>
  );
};

export default Index;
