import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Check, Loader2 } from 'lucide-react';
import DemographicsStep from '@/components/onboarding/DemographicsStep';
import ActivityStep from '@/components/onboarding/ActivityStep';
import MedicalStep from '@/components/onboarding/MedicalStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import ConstraintsStep from '@/components/onboarding/ConstraintsStep';
import { userApi } from '@/api/client';
import type { 
  Demographics, 
  ActivityLevel, 
  MedicalHistory, 
  FitnessGoals, 
  Constraints 
} from '@/types/user';

const steps = [
  { id: 1, title: 'About You', description: 'Basic information' },
  { id: 2, title: 'Activity', description: 'Current fitness level' },
  { id: 3, title: 'Health', description: 'Safety check' },
  { id: 4, title: 'Goals', description: 'What you want to achieve' },
  { id: 5, title: 'Lifestyle', description: 'Your schedule & preferences' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [demographics, setDemographics] = useState<Partial<Demographics>>({});
  const [activityLevel, setActivityLevel] = useState<Partial<ActivityLevel>>({
    sedentaryHours: 8,
  });
  const [medicalHistory, setMedicalHistory] = useState<Partial<MedicalHistory>>({
    hasCardiovascularDisease: false,
    hasDiagnosedChronicConditions: false,
    hasBackPain: false,
    takingMedications: false,
  });
  const [goals, setGoals] = useState<Partial<FitnessGoals>>({
    targetTimeframe: 3,
    secondaryGoals: [],
  });
  const [constraints, setConstraints] = useState<Partial<Constraints>>({
    availableDaysPerWeek: 3,
    minutesPerSession: 45,
    hasGymAccess: true,
    equipmentAvailable: [],
    dietaryRestrictions: [],
    mealsPerDay: 3,
    sleepHoursPerNight: 7,
    stressLevel: 'moderate',
  });

  const progressPercentage = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Get user from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      const onboardingData = {
        demographics,
        activityLevel,
        medicalHistory,
        goals,
        constraints,
      };
      
      if (user?.data?.id) {
        await userApi.saveOnboardingData(user.data.id, onboardingData);
      }
      
      // Store onboarding data locally as well
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      setIsComplete(true);
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      // Still proceed even if API fails
      localStorage.setItem('onboardingData', JSON.stringify({
        demographics,
        activityLevel,
        medicalHistory,
        goals,
        constraints,
      }));
      setIsComplete(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full gradient-lime opacity-20 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent opacity-10 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center slide-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-lime pulse-glow mb-6">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">You're All Set!</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your personalized fitness journey begins now
          </p>
          
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Preparing your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 safe-area-inset">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full gradient-lime opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent opacity-5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-lime flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-gradient">FitAI</span>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="font-medium">{steps[currentStep - 1].title}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step.id < currentStep
                      ? 'gradient-lime text-primary-foreground'
                      : step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-[10px] mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-6">
        {currentStep === 1 && (
          <DemographicsStep
            data={demographics}
            onUpdate={setDemographics}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && (
          <ActivityStep
            data={activityLevel}
            onUpdate={setActivityLevel}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <MedicalStep
            data={medicalHistory}
            onUpdate={setMedicalHistory}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 4 && (
          <GoalsStep
            data={goals}
            onUpdate={setGoals}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 5 && (
          <ConstraintsStep
            data={constraints}
            onUpdate={setConstraints}
            onNext={handleComplete}
            onBack={handleBack}
          />
        )}
        
        {isSubmitting && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <CardContent className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium">Saving your profile...</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
