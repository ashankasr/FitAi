import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, Activity, Target, Calendar, 
  TrendingUp, Flame, Moon, LogOut,
  ChevronRight, Play
} from 'lucide-react';

interface OnboardingData {
  demographics: {
    age: number;
    weight: number;
    height: number;
    bmi: number;
  };
  goals: {
    primaryGoal: string;
    targetWeightLoss?: number;
    targetTimeframe?: number;
  };
  constraints: {
    availableDaysPerWeek: number;
    minutesPerSession: number;
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const onboardingString = localStorage.getItem('onboardingData');
    
    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.data?.name || 'Champion');
    }
    
    if (onboardingString) {
      setOnboardingData(JSON.parse(onboardingString));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingData');
    navigate('/');
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Build Muscle',
      fitness: 'Get Fitter',
      health: 'Better Health',
    };
    return labels[goal] || goal;
  };

  const quickStats = [
    { 
      label: 'Weekly Goal', 
      value: `${onboardingData?.constraints.availableDaysPerWeek || 3} days`,
      icon: Calendar,
      color: 'text-primary'
    },
    { 
      label: 'Session', 
      value: `${onboardingData?.constraints.minutesPerSession || 45} min`,
      icon: Activity,
      color: 'text-accent'
    },
    { 
      label: 'Current BMI', 
      value: onboardingData?.demographics.bmi?.toFixed(1) || '--',
      icon: TrendingUp,
      color: 'text-orange-500'
    },
  ];

  return (
    <div className="min-h-screen pb-24 safe-area-inset">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full gradient-lime opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent opacity-5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-lime flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h1 className="font-bold text-lg">{userName}</h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Goal Card */}
        <Card className="glass border-border/50 overflow-hidden slide-up">
          <div className="absolute inset-0 gradient-lime opacity-10" />
          <CardContent className="pt-6 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Goal</p>
                <h2 className="text-2xl font-bold">
                  {getGoalLabel(onboardingData?.goals.primaryGoal || '')}
                </h2>
                {onboardingData?.goals.targetWeightLoss && (
                  <p className="text-muted-foreground mt-1">
                    {onboardingData.goals.targetWeightLoss} kg in {onboardingData.goals.targetTimeframe} months
                  </p>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl gradient-lime flex items-center justify-center">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">Week 1 of {(onboardingData?.goals.targetTimeframe || 3) * 4}</span>
              </div>
              <Progress value={5} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 slide-up">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="glass border-border/50 card-hover">
                <CardContent className="pt-4 pb-4 text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Workout */}
        <Card className="glass border-border/50 card-hover slide-up">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Workout</CardTitle>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                Day 1
              </span>
            </div>
            <CardDescription>Full Body Introduction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Beginner Full Body</p>
                  <p className="text-sm text-muted-foreground">
                    {onboardingData?.constraints.minutesPerSession || 45} min • 8 exercises
                  </p>
                </div>
              </div>
              <Button size="icon" className="w-12 h-12 rounded-full gradient-lime">
                <Play className="w-5 h-5 text-primary-foreground" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 slide-up">
          <Card className="glass border-border/50 card-hover cursor-pointer">
            <CardContent className="pt-6">
              <Activity className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold">Track Activity</h3>
              <p className="text-xs text-muted-foreground mt-1">Log your steps & exercise</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-border/50 card-hover cursor-pointer">
            <CardContent className="pt-6">
              <Moon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold">Log Sleep</h3>
              <p className="text-xs text-muted-foreground mt-1">Track your rest</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <Card className="glass border-border/50 slide-up">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">This Week</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Monday', 'Wednesday', 'Friday'].slice(0, onboardingData?.constraints.availableDaysPerWeek || 3).map((day, i) => (
              <div
                key={day}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  i === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    i === 0 ? 'gradient-lime' : 'bg-secondary'
                  }`}>
                    <Dumbbell className={`w-5 h-5 ${i === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? 'Full Body' : i === 1 ? 'Upper Body' : 'Lower Body'}
                    </p>
                  </div>
                </div>
                {i === 0 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 safe-area-inset">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-around">
            {[
              { icon: Activity, label: 'Home', active: true },
              { icon: Calendar, label: 'Plan', active: false },
              { icon: TrendingUp, label: 'Progress', active: false },
              { icon: Target, label: 'Goals', active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
