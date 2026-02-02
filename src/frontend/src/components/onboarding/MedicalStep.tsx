// // import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, AlertCircle, Pill, Users } from 'lucide-react';
import type { MedicalHistory } from '@/types/user';

interface Props {
  data: Partial<MedicalHistory>;
  onUpdate: (data: Partial<MedicalHistory>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MedicalStep({ data, onUpdate, onNext, onBack }: Props) {
  // // const [_errors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MedicalHistory, value: boolean | string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral/20 mb-4">
          <Heart className="w-8 h-8 text-coral" />
        </div>
        <h2 className="text-2xl font-bold">Health & Safety</h2>
        <p className="text-muted-foreground mt-2">
          This helps us ensure your fitness plan is safe and appropriate
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="border-coral/50 bg-coral/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-coral">Important Health Disclosure</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please answer honestly. This information is confidential and used only 
                to create a safe exercise program. Consult a physician before starting 
                any new exercise program.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Cardiovascular Disease */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="cardiovascular"
                checked={data.hasCardiovascularDisease || false}
                onCheckedChange={(checked) => 
                  handleChange('hasCardiovascularDisease', checked as boolean)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="cardiovascular" className="text-base font-medium cursor-pointer">
                  Cardiovascular Disease
                </Label>
                <CardDescription>
                  Do you have any diagnosed heart conditions, high blood pressure, 
                  or have you experienced chest pain during physical activity?
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chronic Conditions */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="chronic"
                checked={data.hasDiagnosedChronicConditions || false}
                onCheckedChange={(checked) => 
                  handleChange('hasDiagnosedChronicConditions', checked as boolean)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="chronic" className="text-base font-medium cursor-pointer">
                  Chronic Conditions
                </Label>
                <CardDescription>
                  Diabetes, asthma, arthritis, or any other chronic health conditions?
                </CardDescription>
              </div>
            </div>
            
            {data.hasDiagnosedChronicConditions && (
              <div className="ml-8 fade-in">
                <Input
                  placeholder="Please describe your conditions..."
                  value={data.chronicConditionsDetails || ''}
                  onChange={(e) => handleChange('chronicConditionsDetails', e.target.value)}
                  className="h-12"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Pain */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="backpain"
                checked={data.hasBackPain || false}
                onCheckedChange={(checked) => 
                  handleChange('hasBackPain', checked as boolean)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="backpain" className="text-base font-medium cursor-pointer">
                  Back Pain or Joint Issues
                </Label>
                <CardDescription>
                  Any recurring back pain, joint problems, or previous injuries 
                  that might affect exercise?
                </CardDescription>
              </div>
            </div>
            
            {data.hasBackPain && (
              <div className="ml-8 fade-in">
                <Input
                  placeholder="Describe the type and location of pain..."
                  value={data.backPainDetails || ''}
                  onChange={(e) => handleChange('backPainDetails', e.target.value)}
                  className="h-12"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-4">
              <Pill className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-base font-medium">Medications</Label>
                  <CardDescription>
                    Are you currently taking any medications?
                  </CardDescription>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('takingMedications', true)}
                    className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                      data.takingMedications === true
                        ? 'gradient-lime text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('takingMedications', false)}
                    className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                      data.takingMedications === false
                        ? 'gradient-lime text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    No
                  </button>
                </div>
                
                {data.takingMedications && (
                  <div className="fade-in">
                    <Input
                      placeholder="List your medications..."
                      value={data.medicationsDetails || ''}
                      onChange={(e) => handleChange('medicationsDetails', e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family History */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <Label className="text-base font-medium">Family Health History</Label>
                <CardDescription className="mb-4">
                  Any family history of heart disease, diabetes, or other conditions?
                </CardDescription>
                <Input
                  placeholder="e.g., Mother has type 2 diabetes"
                  value={data.familyHistory || ''}
                  onChange={(e) => handleChange('familyHistory', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
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
          onClick={onNext}
          className="flex-1 h-14 text-lg font-semibold gradient-lime hover:opacity-90 transition-opacity"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
