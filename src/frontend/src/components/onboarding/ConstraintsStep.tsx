import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, Dumbbell, Utensils, Moon, Brain, 
  Calendar, Home, Building2 
} from 'lucide-react';
import type { Constraints } from '@/types/user';

interface Props {
  data: Partial<Constraints>;
  onUpdate: (data: Partial<Constraints>) => void;
  onNext: () => void;
  onBack: () => void;
}

const equipmentOptions = [
  { value: 'full_gym', label: 'Full Gym Access', icon: Building2 },
  { value: 'home_basics', label: 'Basic Home Equipment', icon: Home },
  { value: 'dumbbells', label: 'Dumbbells', icon: Dumbbell },
  { value: 'resistance_bands', label: 'Resistance Bands', icon: null },
  { value: 'bodyweight', label: 'Bodyweight Only', icon: null },
];

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Keto/Low-carb',
  'Halal',
  'Kosher',
  'No restrictions',
];

export default function ConstraintsStep({ data, onUpdate, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof Constraints, value: unknown) => {
    onUpdate({ ...data, [field]: value });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleEquipment = (equipment: string) => {
    const current = data.equipmentAvailable || [];
    const updated = current.includes(equipment)
      ? current.filter(e => e !== equipment)
      : [...current, equipment];
    handleChange('equipmentAvailable', updated);
  };

  const toggleDietary = (restriction: string) => {
    if (restriction === 'No restrictions') {
      handleChange('dietaryRestrictions', ['No restrictions']);
      return;
    }
    
    const current = (data.dietaryRestrictions || []).filter(r => r !== 'No restrictions');
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    handleChange('dietaryRestrictions', updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.availableDaysPerWeek) {
      newErrors.availableDaysPerWeek = 'Please select how many days you can train';
    }
    if (!data.minutesPerSession) {
      newErrors.minutesPerSession = 'Please select session duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const getStressColor = () => {
    switch (data.stressLevel) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
          <Clock className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your Lifestyle</h2>
        <p className="text-muted-foreground mt-2">
          Let's work with your schedule and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Available Days */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <Label className="text-base font-medium">Training Days</Label>
              </div>
              <span className="text-2xl font-bold text-primary">
                {data.availableDaysPerWeek || 3} days/week
              </span>
            </div>
            <CardDescription>
              How many days per week can you commit to training?
            </CardDescription>
            
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleChange('availableDaysPerWeek', day)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all ${
                    data.availableDaysPerWeek === day
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.availableDaysPerWeek && (
              <p className="text-sm text-destructive text-center">{errors.availableDaysPerWeek}</p>
            )}
          </CardContent>
        </Card>

        {/* Session Duration */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <Label className="text-base font-medium">Session Length</Label>
              </div>
              <span className="text-2xl font-bold text-primary">
                {data.minutesPerSession || 45} min
              </span>
            </div>
            
            <Slider
              value={[data.minutesPerSession || 45]}
              min={15}
              max={120}
              step={15}
              onValueChange={(value) => handleChange('minutesPerSession', value[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 min</span>
              <span>30 min</span>
              <span>45 min</span>
              <span>60 min</span>
              <span>90 min</span>
              <span>2 hrs</span>
            </div>
            {errors.minutesPerSession && (
              <p className="text-sm text-destructive">{errors.minutesPerSession}</p>
            )}
          </CardContent>
        </Card>

        {/* Equipment Access */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Equipment Access</Label>
            </div>
            <CardDescription>
              What equipment do you have access to?
            </CardDescription>
            
            <div className="space-y-3">
              {equipmentOptions.map((option) => {
                const isSelected = (data.equipmentAvailable || []).includes(option.value);
                
                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={option.value}
                      checked={isSelected}
                      onCheckedChange={() => toggleEquipment(option.value)}
                    />
                    <Label 
                      htmlFor={option.value}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dietary */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Dietary Preferences</Label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => {
                const isSelected = (data.dietaryRestrictions || []).includes(option);
                
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDietary(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'gradient-lime text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Meals Per Day */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Meals Per Day</Label>
              <span className="text-2xl font-bold text-primary">
                {data.mealsPerDay || 3}
              </span>
            </div>
            
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleChange('mealsPerDay', num)}
                  className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                    data.mealsPerDay === num
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                <Label className="text-base font-medium">Sleep Per Night</Label>
              </div>
              <span className="text-2xl font-bold text-primary">
                {data.sleepHoursPerNight || 7} hrs
              </span>
            </div>
            
            <Slider
              value={[data.sleepHoursPerNight || 7]}
              min={4}
              max={10}
              step={0.5}
              onValueChange={(value) => handleChange('sleepHoursPerNight', value[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4 hrs</span>
              <span>6 hrs</span>
              <span>8 hrs</span>
              <span>10 hrs</span>
            </div>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Stress Level</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'moderate', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleChange('stressLevel', level)}
                  className={`h-12 rounded-xl font-medium capitalize transition-all ${
                    data.stressLevel === level
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {data.stressLevel && (
              <p className={`text-sm text-center ${getStressColor()}`}>
                {data.stressLevel === 'high' && "We'll include stress-relief activities in your plan"}
                {data.stressLevel === 'moderate' && "Balance is key - we'll keep that in mind"}
                {data.stressLevel === 'low' && "Great! Low stress supports better recovery"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-2">
            <Label className="text-base font-medium">
              Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Any other constraints or preferences..."
              value={data.additionalNotes || ''}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              className="h-12"
            />
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
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
