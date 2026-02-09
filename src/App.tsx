import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { SplashScreen } from "./components/SplashScreen";
import Index from "./pages/Index";
import SchedulePage from "./pages/SchedulePage";
import StationDeparturesPage from "./pages/StationDeparturesPage";
import CommunityPage from "./pages/CommunityPage";
import MorePage from "./pages/MorePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <BrowserRouter>
          <div className="min-h-screen bg-background pb-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/schedule/:stationName" element={<StationDeparturesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;