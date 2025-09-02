import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Leaderboards from "./pages/Leaderboards";
import Testimonials from "./pages/Testimonials";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen relative">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="relative h-full w-full [&>div]:absolute [&>div]:bottom-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-[var(--gradient-hero)]">
            <div></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/testimonials" element={<Testimonials />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
        <Sonner />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;