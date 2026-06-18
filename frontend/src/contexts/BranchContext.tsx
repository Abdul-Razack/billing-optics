"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiLocation } from "@/types/location";

interface BranchContextType {
  activeBranch: ApiLocation | null;
  setActiveBranch: (branch: ApiLocation | null) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [activeBranch, setActiveBranchState] = useState<ApiLocation | null>(null);

  useEffect(() => {
    // Try to load the active branch from localStorage on mount
    const savedBranch = localStorage.getItem("activeBranch");
    if (savedBranch) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveBranchState(JSON.parse(savedBranch));
      } catch (e) {
        console.error("Failed to parse saved branch from localStorage");
      }
    }
  }, []);

  const setActiveBranch = (branch: ApiLocation | null) => {
    setActiveBranchState(branch);
    if (branch) {
      localStorage.setItem("activeBranch", JSON.stringify(branch));
    } else {
      localStorage.removeItem("activeBranch");
    }
  };

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
