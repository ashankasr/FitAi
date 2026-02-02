import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Ruler, Scale } from 'lucide-react';
import type { Demographics } from '@/types/user';

interface Props {
  data: Partial<Demographics>;
  onUpdate: (data: Partial<Demographics>) => void;
  onNext: () => void;
}

export default function DemographicsStep({ data, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return undefined;
  };

  const handleChange = (field: keyof Demographics, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    const newData = { ...data, [field]: numValue };
    
    // Auto-calculate BMI
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? numValue : (data.weight || 0);
      const height = field === 'height' ? numValue : (data.height || 0);
      newData.bmi = calculateBMI(weight, height);
    }
    
    onUpdate(newData);
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-500' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.age || data.age < 13 || data.age > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }
    if (!data.sex) {
      newErrors.sex = 'Please select your sex';
    }
    if (!data.height || data.height < 100 || data.height > 250) {
      newErrors.height = 'Please enter a valid height (100-250 cm)';
    }
    if (!data.weight || data.weight < 30 || data.weight > 300) {
      newErrors.weight = 'Please enter a valid weight (30-300 kg)';
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
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
        <p className="text-muted-foreground mt-2">
          This helps us personalize your fitness plan
        </p>
      </div>

      <div className="grid gap-6">
        {/* Age */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-base font-medium">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={data.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                className="h-12 text-lg"
                min={13}
                max={120}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sex */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <Label className="text-base font-medium mb-4 block">Sex</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['male', 'female', 'other'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange('sex', option)}
                  className={`h-12 rounded-xl font-medium capitalize transition-all ${
                    data.sex === option
                      ? 'gradient-lime text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.sex && (
              <p className="text-sm text-destructive mt-2">{errors.sex}</p>
            )}
          </CardContent>
        </Card>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="165"
                  value={data.height || ''}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="h-12 text-lg"
                  min={100}
                  max={250}
                />
                {errors.height && (
                  <p className="text-sm text-destructive">{errors.height}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="72"
                  value={data.weight || ''}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="h-12 text-lg"
                  min={30}
                  max={300}
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BMI Display */}
        {data.bmi && (
          <Card className="glass border-border/50 fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your BMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">{data.bmi}</span>
                <span className={`text-lg font-semibold ${getBMICategory(data.bmi).color}`}>
                  {getBMICategory(data.bmi).label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your height and weight
              </p>
            </CardContent>
          </Card>
        )}

        {/* Body Fat (Optional) */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="text-base font-medium">
                Body Fat % <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <CardDescription>
                Enter if you know your body fat percentage from a recent measurement
              </CardDescription>
              <Input
                id="bodyFat"
                type="number"
                placeholder="e.g., 32"
                value={data.bodyFatPercentage || ''}
                onChange={(e) => handleChange('bodyFatPercentage', e.target.value)}
                className="h-12 text-lg"
                min={5}
                max={60}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleNext}
        className="w-full h-14 text-lg font-semibold gradient-lime hover:opacity-90 transition-opacity"
      >
        Continue
      </Button>
    </div>
  );
}
