import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { GraduationCap, Loader2, Sparkles, ArrowLeft, User, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') || 'student') as 'student' | 'teacher';
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    grade: '',
    learningStyle: 'mixed' as const,
    bio: '',
    teachingStyle: '',
    specialization: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please confirm your email before signing in');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success('Welcome back!');
        navigate(role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
      } else {
        if (!formData.fullName || !formData.email || !formData.password) {
          toast.error('Please fill in all required fields');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const additionalData = role === 'student' 
          ? { grade: formData.grade, learning_style: formData.learningStyle }
          : { bio: formData.bio, teaching_style: formData.teachingStyle, specialization: formData.specialization };

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          role,
          additionalData
        );

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        toast.success('Account created successfully!');
        navigate(role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-smooth z-10"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <Card className="glass shadow-glow border-white/20 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl gradient-primary shadow-glow animate-bounce-soft">
                {role === 'student' ? (
                  <User className="h-8 w-8 text-white" />
                ) : (
                  <BookOpen className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-2 mx-auto">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-primary capitalize">{role} Portal</span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-display">
              {isLogin ? 'Welcome Back!' : 'Join Edvora'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl p-1 bg-muted/50">
                <TabsTrigger value="login" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-soft">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-soft">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-semibold">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-semibold">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary rounded-xl h-12 font-bold text-base shadow-glow hover:opacity-90 transition-smooth mt-2" 
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...</> : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-semibold">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-semibold">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-semibold">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                    />
                  </div>
                  
                  {role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="grade" className="font-semibold">Grade/Class <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input
                          id="grade"
                          type="text"
                          placeholder="e.g., 10th Grade"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="learning-style" className="font-semibold">Learning Style</Label>
                        <Select
                          value={formData.learningStyle}
                          onValueChange={(value: any) => setFormData({ ...formData, learningStyle: value })}
                        >
                          <SelectTrigger id="learning-style" className="rounded-xl h-12 border-2 focus:border-primary transition-smooth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="visual">Visual Learner</SelectItem>
                            <SelectItem value="reading">Reading/Writing</SelectItem>
                            <SelectItem value="practice">Practice-Based</SelectItem>
                            <SelectItem value="mixed">Mixed Style</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {role === 'teacher' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="font-semibold">Bio <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input
                          id="bio"
                          type="text"
                          placeholder="Tell students about yourself"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teaching-style" className="font-semibold">Teaching Style <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input
                          id="teaching-style"
                          type="text"
                          placeholder="e.g., Visual, Practice-oriented"
                          value={formData.teachingStyle}
                          onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
                          className="rounded-xl h-12 border-2 focus:border-primary transition-smooth"
                        />
                      </div>
                    </>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary rounded-xl h-12 font-bold text-base shadow-glow hover:opacity-90 transition-smooth mt-2" 
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating account...</> : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Logo footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/60">
          <div className="p-1.5 rounded-lg bg-white/10">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-display font-semibold">Edvora</span>
        </div>
      </div>
    </div>
  );
}
