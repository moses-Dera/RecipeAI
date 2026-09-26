"use client";

import { useState } from "react";
import AiFeatureHighlight from "@/components/landing/AiFeatureHighlight";
import ChefAdaDrawer from "@/components/chat/ChefAdaDrawer";

export default function LandingAiSection() {
  const [isAdaDrawerOpen, setIsAdaDrawerOpen] = useState(false);

  return (
    <>
      <AiFeatureHighlight onOpenChat={() => setIsAdaDrawerOpen(true)} />
      <ChefAdaDrawer 
        isOpen={isAdaDrawerOpen} 
        onClose={() => setIsAdaDrawerOpen(false)} 
      />
    </>
  );
}
