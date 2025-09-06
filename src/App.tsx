import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EutrophicationReports from "./pages/EutrophicationReports";
import ShadowFleetTracker from "./pages/ShadowFleetTracker";
import IntegratedIntelligence from "./pages/IntegratedIntelligence";
import IntelligenceDashboard from "./pages/IntelligenceDashboard";
import PortAgent from "./pages/PortAgent";
import EcologicalReporting from "./pages/EcologicalReporting";
import PilotEastSweden from "./pages/PilotEastSweden";
import BalticInvestorIntelligence from "./pages/BalticInvestorIntelligence";
import AIOrchestrator from "./pages/AIOrchestrator";
import FinancialReports from "./pages/FinancialReports";
import AIReportGenerator from "./pages/AIReportGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/eutrophication" element={<EutrophicationReports />} />
              <Route path="/shadow-fleet" element={<ShadowFleetTracker />} />
              <Route path="/intelligence" element={<IntelligenceDashboard />} />
              <Route path="/intelligence/integrated" element={<IntegratedIntelligence />} />
              <Route path="/port-agent" element={<PortAgent />} />
              <Route path="/ecology" element={<EcologicalReporting />} />
              <Route path="/pilot-east-sweden" element={<PilotEastSweden />} />
              <Route path="/investor" element={<BalticInvestorIntelligence />} />
              <Route path="/ai-orchestrator" element={<AIOrchestrator />} />
              <Route path="/financial-reports" element={<FinancialReports />} />
              <Route path="/ai-reports" element={<AIReportGenerator />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
