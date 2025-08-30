import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EutrophicationReports from "./pages/EutrophicationReports";
import ShadowFleetTracker from "./pages/ShadowFleetTracker";
import IntegratedIntelligence from "./pages/IntegratedIntelligence";
import IntelligenceDashboard from "./pages/IntelligenceDashboard";
import PortAgent from "./pages/PortAgent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
