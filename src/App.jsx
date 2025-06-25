import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VerticalNavigation from "./components/VerticalNavigation";
import { useState, useEffect } from "react";
import LeadershipBehaviorAnalyst from "./pages/LeadershipBehaviorAnalyst";
import ProblemHypothesis from "./pages/ProblemHypothesis";
import FAQs from "./pages/FAQs";
import Settings from "./pages/Settings";
import { usePostHog } from 'posthog-js/react';

const queryClient = new QueryClient();

const App = () => {
  const [analysisResults, setAnalysisResults] = useState({});
  const posthog = usePostHog();
  
  useEffect(() => {
    // Capture page load event
    posthog?.capture('app_loaded', {
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
            <VerticalNavigation />
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/ai-agent-analysis" replace />} />
                <Route 
                  path="/ai-agent-analysis" 
                  element={
                    <LeadershipBehaviorAnalyst 
                      setAnalysisResults={setAnalysisResults}
                    />
                  } 
                />
                <Route path="/problem-hypothesis" element={<ProblemHypothesis />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;