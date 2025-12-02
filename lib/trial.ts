// @cursor: Trial management utility
// Handles trial status, days remaining, and trial-related checks

const TRIAL_DAYS = 14;

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate: string | null;
  endDate: string | null;
}

export function getTrialStatus(): TrialStatus {
  if (typeof window === "undefined") {
    return {
      isActive: false,
      daysRemaining: 0,
      startDate: null,
      endDate: null,
    };
  }

  const trialStarted = localStorage.getItem("barberq_trial_started");
  
  if (!trialStarted) {
    return {
      isActive: false,
      daysRemaining: TRIAL_DAYS,
      startDate: null,
      endDate: null,
    };
  }

  const startDate = new Date(trialStarted);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DAYS);
  
  const now = new Date();
  const isActive = now < endDate;
  const daysRemaining = isActive
    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isActive,
    daysRemaining,
    startDate: trialStarted,
    endDate: endDate.toISOString(),
  };
}

export function startTrial(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("barberq_trial_started", new Date().toISOString());
  }
}

export function hasTrialStarted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("barberq_trial_started") !== null;
}

