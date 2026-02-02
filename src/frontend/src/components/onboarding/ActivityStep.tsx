import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Activity, Footprints, Clock, Calendar } from 'lucide-react';
import type { ActivityLevel } from '@/types/user';

interface Props {
  data: Partial<ActivityLevel>;
  onUpdate: (data: Partial<ActivityLevel>) => void;
  onNext: () => void;
  onBack: () => void;
}

const exerciseOptions = [
  { value: 0, label: 'None', description: 'No structured exercise' },
  { value: 1, label: '1 day', description: 'Light activity' },
  { value: 2, label: '2 days', description: 'Getting started' },
  { value: 3, label: '3 days', description: 'Moderate' },
  { value: 4, label: '4 days', description: 'Active' },
  { value: 5, label: '5 days', description: 'Very active' },
  { value: 6, label: '6 days', description: 'Athletic' },
  { value: 7, label: '7 days', description: 'Elite' },
];

const lastExerciseOptions = [
  { value: 'Never', label: 'Never exercised regularly' },
  { value: '>2 years ago', label: 'Over 2 years ago' },
  { value: '1-2 years ago', label: '1-2 years ago' },
  { value: '6 months - 1 year', label: '6 months to 1 year ago' },
  { value: '1-6 months ago', label: '1-6 months ago' },
  { value: 'Currently active', label: 'Currently exercising' },
];

export default function ActivityStep({ data, onUpdate, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ActivityLevel, value: string | number) => {
    onUpdate({ ...data, [field]: value });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getActivityLevel = () => {
    const steps = data.dailySteps || 0;
    if (steps < 3000) return { level: 'Sedentary', color: 'text-red-500', emoji: '🛋️' };
    if (steps < 5000) return { level: 'Low Active', color: 'text-orange-500', emoji: '🚶' };
    if (steps < 7500) return { level: 'Somewhat Active', color: 'text-yellow-500', emoji: '🚶‍♂️' };
    if (steps < 10000) return { level: 'Active', color: 'text-green-500', emoji: '🏃' };
    return { level: 'Highly Active', color: 'text-primary', emoji: '🏃‍♂️' };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (data.structuredExerciseDays === undefined) {
      newErrors.structuredExerciseDays = 'Please select your exercise frequency';
    }
    if (!data.dailySteps) {
      newErrors.dailySteps = 'Please enter your daily steps';
    }
    if (!data.lastRegularExercise) {
      newErrors.lastRegularExercise = 'Please select when you last exercised regularly';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
          <Activity className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your Activity Level</h2>
        <p className="text-muted-foreground mt-2">
          Help us understand your current fitness habits
        </p>
      </div>

      <div className="grid gap-6">
        {/* Structured Exercise Days */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Weekly Exercise</Label>
            </div>
            <CardDescription>
              How many days per week do you do structured exercise?
            </CardDescription>
            
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {exerciseOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('structuredExerciseDays', option.value)}
                  className={`h-14 rounded-xl font-medium transition-all flex flex-col items-center justify-center ${
                    data.structuredExerciseDays === option.value
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-lg font-bold">{option.value}</span>
                  <span className="text-[10px] opacity-80">days</span>
                </button>
              ))}
            </div>
            {errors.structuredExerciseDays && (
              <p className="text-sm text-destructive">{errors.structuredExerciseDays}</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Steps */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-primary" />
                <Label className="text-base font-medium">Daily Steps</Label>
              </div>
              {data.dailySteps && (
                <span className={`text-sm font-semibold ${getActivityLevel().color}`}>
                  {getActivityLevel().emoji} {getActivityLevel().level}
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="e.g., 3500"
                value={data.dailySteps || ''}
                onChange={(e) => handleChange('dailySteps', parseInt(e.target.value) || 0)}
                className="h-12 text-lg"
              />
              
              <Slider
                value={[data.dailySteps || 0]}
                min={0}
                max={20000}
                step={500}
                onValueChange={(value) => handleChange('dailySteps', value[0])}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>5k</span>
                <span>10k</span>
                <span>15k</span>
                <span>20k</span>
              </div>
            </div>
            {errors.dailySteps && (
              <p className="text-sm text-destructive">{errors.dailySteps}</p>
            )}
          </CardContent>
        </Card>

        {/* Sedentary Time */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Sedentary Time</Label>
            </div>
            <CardDescription>
              Hours spent sitting (desk work, commute, etc.) per day
            </CardDescription>
            
            <div className="flex items-center gap-4">
              <Slider
                value={[data.sedentaryHours || 8]}
                min={2}
                max={16}
                step={1}
                onValueChange={(value) => handleChange('sedentaryHours', value[0])}
                className="flex-1"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-bold">{data.sedentaryHours || 8}</span>
                <span className="text-sm text-muted-foreground ml-1">hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Regular Exercise */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-base font-medium">When did you last exercise regularly?</Label>
            
            <div className="grid gap-2">
              {lastExerciseOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('lastRegularExercise', option.value)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    data.lastRegularExercise === option.value
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            {errors.lastRegularExercise && (
              <p className="text-sm text-destructive">{errors.lastRegularExercise}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 text-lg font-semibold"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 h-14 text-lg font-semibold gradient-lime hover:opacity-90 transition-opacity"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
