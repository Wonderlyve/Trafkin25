import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import StreamPlayer from "./pages/StreamPlayer";
import Map from "./pages/Map";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Nearby from "./pages/Nearby";
import Actus from "./pages/Actus";
import Alertes from "./pages/Alertes";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PoliceHQ from "./pages/PoliceHQ";
import Footage from "./pages/Footage";
import Profile from "./pages/Profile";
import Ads from "./pages/Ads";
import PoliceAnnouncement from "./pages/PoliceAnnouncement";
import TrafficAlertsPanel from "./components/TrafficAlertsPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="map" element={<Map />} />
            <Route path="actus" element={<Actus />} />
            <Route path="alertes" element={<Alertes />} />
            <Route path="nearby" element={<Nearby />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/stream/:id" element={<StreamPlayer />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/qg" element={<PoliceHQ />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/footage" element={<Footage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/police-announcement/:id" element={<PoliceAnnouncement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
