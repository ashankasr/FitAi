// User onboarding types for FitAI

export interface Demographics {
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  bmi?: number;
  bodyFatPercentage?: number;
}

export interface ActivityLevel {
  structuredExerciseDays: number; // days per week
  dailySteps: number;
  sedentaryHours: number;
  lastRegularExercise: string; // e.g., ">2 years ago", "6 months ago"
}

export interface MedicalHistory {
  hasCardiovascularDisease: boolean;
  hasDiagnosedChronicConditions: boolean;
  chronicConditionsDetails?: string;
  hasBackPain: boolean;
  backPainDetails?: string;
  takingMedications: boolean;
  medicationsDetails?: string;
  familyHistory?: string;
}

export interface FitnessGoals {
  primaryGoal: string;
  secondaryGoals: string[];
  targetWeightLoss?: number; // in kg
  targetTimeframe?: number;  // in months
}

export interface Constraints {
  availableDaysPerWeek: number;
  minutesPerSession: number;
  hasGymAccess: boolean;
  equipmentAvailable: string[];
  dietaryRestrictions: string[];
  mealsPerDay: number;
  sleepHoursPerNight: number;
  stressLevel: 'low' | 'moderate' | 'high';
  additionalNotes?: string;
}

export interface UserProfile {
  id?: number;
  email: string;
  name: string;
  demographics: Demographics;
  activityLevel: ActivityLevel;
  medicalHistory: MedicalHistory;
  goals: FitnessGoals;
  constraints: Constraints;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  demographics: Partial<Demographics>;
  activityLevel: Partial<ActivityLevel>;
  medicalHistory: Partial<MedicalHistory>;
  goals: Partial<FitnessGoals>;
  constraints: Partial<Constraints>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}
