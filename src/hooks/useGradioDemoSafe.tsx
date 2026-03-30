import { useContext } from "react";
import { GradioDemoProvider, useGradioDemo } from "@/contexts/GradioDemoContext";

// Safe hook that returns null when not inside GradioDemoProvider
// Used by sidebar to conditionally access gradio context
export function useGradioDemoSafe() {
  try {
    return useGradioDemo();
  } catch {
    return null;
  }
}
