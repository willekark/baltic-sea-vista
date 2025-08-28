import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileText, 
  Search, 
  Brain, 
  ArrowRight,
  CheckCircle,
  Users,
  Building,
  Landmark
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Interactive Dashboard",
      description: "Real-time visualization of key marine indicators including oxygen levels, temperature, algal blooms, fish stocks, and shipping intensity.",
      highlights: ["Live monitoring", "Multi-layer visualization", "Custom alerts"],
      gradient: "bg-gradient-ocean"
    },
    {
      icon: FileText,
      title: "Report Generator",
      description: "Automated generation of policy briefs, ESG reports, research overviews, and stakeholder communications with customizable templates.",
      highlights: ["Policy briefs", "ESG reporting", "Custom formats"],
      gradient: "bg-gradient-surface"
    },
    {
      icon: Search,
      title: "Data Explorer",
      description: "Advanced analytics interface for researchers and analysts to dive deep into historical data, trends, and correlations.",
      highlights: ["Historical analysis", "Data correlation", "Export capabilities"],
      gradient: "bg-gradient-depth"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Machine learning models provide forecasts, scenario planning, risk assessments, and predictive insights for informed decision-making.",
      highlights: ["Predictive modeling", "Risk assessment", "Scenario planning"],
      gradient: "bg-gradient-subtle"
    }
  ];

  const stakeholders = [
    {
      icon: Landmark,
      title: "Policymakers",
      description: "Evidence-based policy development and marine regulations"
    },
    {
      icon: Users,
      title: "Researchers",
      description: "Comprehensive data access for scientific studies and analysis"
    },
    {
      icon: Building,
      title: "Financial Sector",
      description: "ESG reporting and environmental risk assessment"
    }
  ];

  return (
    <section className="py-24 bg-gradient-tech">
      <div className="max-w-7xl mx-auto px-6">
        {/* Core Features */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-gradient-investment text-black font-medium border-primary/20">Platform Intelligence</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-investment bg-clip-text text-transparent">
            Advanced Maritime Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From real-time threat detection to AI-powered environmental analysis, 
            our platform transforms complex marine data into strategic intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-investment transition-all duration-500 border-primary/20 bg-gradient-dark-panel shadow-panel overflow-hidden hover:scale-105">
                <div className={`h-2 ${feature.gradient === 'bg-gradient-ocean' ? 'bg-gradient-investment' :
                                       feature.gradient === 'bg-gradient-surface' ? 'bg-gradient-chart' :
                                       feature.gradient === 'bg-gradient-depth' ? 'bg-gradient-success' :
                                       'bg-gradient-tech'}`}></div>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${feature.gradient === 'bg-gradient-ocean' ? 'bg-gradient-investment' :
                                                     feature.gradient === 'bg-gradient-surface' ? 'bg-gradient-chart' :
                                                     feature.gradient === 'bg-gradient-depth' ? 'bg-gradient-success' :
                                                     'bg-gradient-tech'} text-black shadow-tech`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="group-hover:text-accent transition-colors hover:bg-primary/10">
                    Explore Feature <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stakeholders */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-gradient-investment text-black font-medium border-primary/20">Strategic Users</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-investment bg-clip-text text-transparent">
            Trusted Intelligence Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stakeholders.map((stakeholder, index) => {
            const Icon = stakeholder.icon;
            return (
              <Card key={index} className="text-center hover:shadow-tech transition-all duration-300 border-primary/20 bg-gradient-dark-panel shadow-panel hover:scale-105">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-investment rounded-xl flex items-center justify-center mb-4 shadow-glow">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{stakeholder.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{stakeholder.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;