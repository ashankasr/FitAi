import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login(formData.email, formData.password);
        if (response.success) {
          // Store user info and navigate to onboarding
          localStorage.setItem('user', JSON.stringify(response.data));
          navigate('/onboarding');
        } else {
          setError(response.error || 'Login failed');
        }
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        const response = await authApi.register(
          formData.email,
          formData.password,
          formData.name
        );
        
        if (response.success) {
          localStorage.setItem('user', JSON.stringify(response.data));
          navigate('/onboarding');
        } else {
          setError(response.error || 'Registration failed');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full gradient-lime opacity-20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-lime pulse-glow mb-4">
          <Dumbbell className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-gradient">FitAI</h1>
        <p className="text-muted-foreground mt-2">Your AI-Powered Fitness Journey</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md glass card-hover slide-up border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Sign in to continue your fitness journey'
              : 'Start your personalized fitness experience'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 fade-in">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 fade-in">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="h-12"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gradient-lime hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', name: '', confirmPassword: '' });
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>
                  New to FitAI?{' '}
                  <span className="font-semibold text-primary">Create an account</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="font-semibold text-primary">Sign in</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
