"use client";

import React, { createContext, useContext, useState } from "react";


interface OnboardContextType {
  onboardStage: number;
  setOnboardStage: (stage: number) => void;
}

type OnboardProviderProps = {
  children: React.ReactNode;
};

const OnboardContext = createContext<
  OnboardContextType | undefined
>(undefined);

export const OnboardProvider = ({ children }: OnboardProviderProps) => {

  const [onboardStage, setOnboardStage] = useState(1);


  return (
    <OnboardContext.Provider
      value={{
        onboardStage,
        setOnboardStage,
      }}
    >
      {children}
    </OnboardContext.Provider>
  );
};

export const useOnboardContext = () =>
  useContext(OnboardContext) as OnboardContextType;
