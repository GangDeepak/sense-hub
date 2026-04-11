import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { GradioDemoProvider } from "@/contexts/GradioDemoContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import ChatAnalytics from "./pages/ChatAnalytics";
import GroundingModule from "./pages/GroundingModule";
import GradioDemo from "./pages/GradioDemo";
import Prompts from "./pages/Prompts";
import ApiDataPage from "./pages/ApiDataPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <GradioDemoProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/chat-analytics" element={<ProtectedRoute><ChatAnalytics /></ProtectedRoute>} />
                <Route path="/grounding-module" element={<ProtectedRoute><GroundingModule /></ProtectedRoute>} />
                <Route path="/gradio-demo" element={<ProtectedRoute><GradioDemo /></ProtectedRoute>} />
                <Route path="/prompts" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
                <Route path="/api-data" element={<ProtectedRoute><ApiDataPage /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GradioDemoProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
