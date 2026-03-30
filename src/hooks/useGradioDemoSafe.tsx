import { useGradioDemo } from "@/contexts/GradioDemoContext";

// Safe hook that returns null when not inside GradioDemoProvider
export function useGradioDemoSafe() {
  try {
    return useGradioDemo();
  } catch {
    return null;
  }
}
