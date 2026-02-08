import React, { useState } from "react";
import { OnboardingScreen1 } from "../screens/OnboardingScreen1";
import { OnboardingScreen2 } from "../screens/OnboardingScreen2";
import { OnboardingScreen3 } from "../screens/OnboardingScreen3";

type Step = 1 | 2 | 3;

type OnboardingFlowProps = {
  onCompleted: () => void;
};

export function OnboardingFlow({ onCompleted }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>(1);

  if (step === 1) {
    return (
      <OnboardingScreen1
        onNext={() => setStep(2)}
        onSkip={() => setStep(3)}
      />
    );
  }

  if (step === 2) {
    return (
      <OnboardingScreen2
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
      />
    );
  }

  return (
    <OnboardingScreen3
      onBack={() => setStep(2)}
      onStart={onCompleted}
    />
  );
}
