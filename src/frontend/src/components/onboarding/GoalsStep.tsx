import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Target, Flame, TrendingDown, Battery, Zap } from 'lucide-react';
import type { FitnessGoals } from '@/types/user';

interface Props {
  data: Partial<FitnessGoals>;
  onUpdate: (data: Partial<FitnessGoals>) => void;
  onNext: () => void;
  onBack: () => void;
}

const primaryGoalOptions = [
  { value: 'weight_loss', label: 'Lose Weight', icon: TrendingDown, description: 'Shed excess body fat' },
  { value: 'muscle_gain', label: 'Build Muscle', icon: Flame, description: 'Increase strength & size' },
  { value: 'fitness', label: 'Get Fitter', icon: Zap, description: 'Improve endurance & energy' },
  { value: 'health', label: 'Better Health', icon: Battery, description: 'Overall wellness' },
];

const secondaryGoalOptions = [
  'Improve energy levels',
  'Reduce back pain',
  'Better sleep quality',
  'Stress relief',
  'Increase flexibility',
  'Build core strength',
  'Run a 5K',
  'Feel more confident',
];

export default function GoalsStep({ data, onUpdate, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FitnessGoals, value: unknown) => {
    onUpdate({ ...data, [field]: value });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleSecondaryGoal = (goal: string) => {
    const currentGoals = data.secondaryGoals || [];
    const updated = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    handleChange('secondaryGoals', updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.primaryGoal) {
      newErrors.primaryGoal = 'Please select your primary goal';
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-lime mb-4">
          <Target className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your Fitness Goals</h2>
        <p className="text-muted-foreground mt-2">
          What do you want to achieve? Let's make it happen!
        </p>
      </div>

      <div className="grid gap-6">
        {/* Primary Goal */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-base font-medium">What's your main goal?</Label>
            
            <div className="grid grid-cols-2 gap-3">
              {primaryGoalOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = data.primaryGoal === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('primaryGoal', option.value)}
                    className={`p-4 rounded-xl text-left transition-all card-hover ${
                      isSelected
                        ? 'gradient-lime text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? '' : 'text-primary'}`} />
                    <div className="font-semibold">{option.label}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.primaryGoal && (
              <p className="text-sm text-destructive">{errors.primaryGoal}</p>
            )}
          </CardContent>
        </Card>

        {/* Weight Loss Target (Conditional) */}
        {data.primaryGoal === 'weight_loss' && (
          <Card className="glass border-border/50 fade-in">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Target Weight Loss</Label>
                <span className="text-2xl font-bold text-primary">
                  {data.targetWeightLoss || 5} kg
                </span>
              </div>
              <CardDescription>
                How much weight would you like to lose?
              </CardDescription>
              
              <Slider
                value={[data.targetWeightLoss || 5]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => handleChange('targetWeightLoss', value[0])}
                className="py-4"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 kg</span>
                <span>10 kg</span>
                <span>20 kg</span>
                <span>30 kg</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeframe */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Target Timeframe</Label>
              <span className="text-2xl font-bold text-primary">
                {data.targetTimeframe || 3} months
              </span>
            </div>
            <CardDescription>
              When would you like to achieve your goal?
            </CardDescription>
            
            <Slider
              value={[data.targetTimeframe || 3]}
              min={1}
              max={12}
              step={1}
              onValueChange={(value) => handleChange('targetTimeframe', value[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 month</span>
              <span>3 months</span>
              <span>6 months</span>
              <span>12 months</span>
            </div>
            
            {data.primaryGoal === 'weight_loss' && data.targetWeightLoss && data.targetTimeframe && (
              <div className="p-3 rounded-lg bg-primary/10 mt-4 fade-in">
                <p className="text-sm">
                  <span className="font-semibold">Healthy target:</span>{' '}
                  {((data.targetWeightLoss / data.targetTimeframe) * 4).toFixed(1)} kg per month
                  {(data.targetWeightLoss / data.targetTimeframe) > 1 && (
                    <span className="text-orange-500 ml-2">
                      ⚠️ Consider extending your timeframe for sustainable results
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary Goals */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-base font-medium">Additional Goals (optional)</Label>
            <CardDescription>
              Select any other benefits you'd like to achieve
            </CardDescription>
            
            <div className="flex flex-wrap gap-2">
              {secondaryGoalOptions.map((goal) => {
                const isSelected = (data.secondaryGoals || []).includes(goal);
                
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleSecondaryGoal(goal)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'gradient-lime text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Goal */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-2">
            <Label className="text-base font-medium">
              Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Tell us about any specific goals..."
              value={data.secondaryGoals?.find(g => !secondaryGoalOptions.includes(g)) || ''}
              onChange={(e) => {
                const customGoals = (data.secondaryGoals || [])
                  .filter(g => secondaryGoalOptions.includes(g));
                if (e.target.value) {
                  handleChange('secondaryGoals', [...customGoals, e.target.value]);
                } else {
                  handleChange('secondaryGoals', customGoals);
                }
              }}
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
          Continue
        </Button>
      </div>
    </div>
  );
}
