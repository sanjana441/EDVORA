import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain, TrendingUp, MessageCircle, BarChart3, Video, Award, Users, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-5 rounded-2xl bg-white/20 backdrop-blur-lg shadow-glow mb-6 animate-bounce-soft">
            <GraduationCap className="h-14 w-14 text-white" />
          </div>
          <p className="text-xl text-white font-display font-semibold">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Brain, title: 'Adaptive Learning', desc: 'Content difficulty adjusts based on your performance', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visualize your growth without competitive pressure', color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Video, title: 'Personalized Videos', desc: 'Content tailored to your learning style', color: 'text-success', bg: 'bg-success/10' },
    { icon: Award, title: 'Smart Quizzes', desc: 'Identify strengths and areas for improvement', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { icon: MessageCircle, title: 'AI Assistant', desc: 'Get instant help from our learning chatbot', color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: BarChart3, title: 'Analytics', desc: 'Detailed insights about your learning journey', color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const steps = [
    { step: '1', title: 'Choose Subjects', desc: 'Pick what you want to learn', gradient: 'gradient-primary' },
    { step: '2', title: 'Pick Teachers', desc: 'Select your favorites', gradient: 'gradient-secondary' },
    { step: '3', title: 'Watch Videos', desc: 'Learn at your pace', gradient: 'gradient-tertiary' },
    { step: '4', title: 'Take Tests', desc: 'Test your knowledge', gradient: 'gradient-primary' },
    { step: '5', title: 'Grow', desc: 'Track progress', gradient: 'gradient-hero' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-white py-16 md:py-28 px-4">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Learn at your own pace</span>
            </div>
            
            <div className="inline-block p-5 rounded-3xl bg-white/10 backdrop-blur-lg shadow-glow mb-8 animate-bounce-soft">
              <GraduationCap className="h-16 md:h-20 w-16 md:w-20" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
              Edvora
            </h1>
            <h2 className="text-2xl md:text-4xl font-display mb-6 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
              Personalized Learning System
            </h2>
            <p className="text-lg md:text-xl mb-3 text-white/90 max-w-2xl mx-auto opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
              Every child learns at a different pace
            </p>
            <p className="text-base md:text-lg mb-10 text-white/75 max-w-xl mx-auto opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: 'forwards' }}>
              Stress-free, personalized, self-paced learning with adaptive recommendations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-slide-up stagger-4" style={{ animationFillMode: 'forwards' }}>
              <Button
                size="lg"
                onClick={() => navigate('/auth?role=student')}
                className="bg-white text-primary hover:bg-white/90 shadow-hover hover:-translate-y-1 transition-bounce px-8 py-7 text-lg font-bold rounded-2xl group"
              >
                <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                I'm a Student
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/auth?role=teacher')}
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white hover:text-primary px-8 py-7 text-lg font-bold rounded-2xl backdrop-blur-sm transition-bounce hover:-translate-y-1 group"
              >
                <GraduationCap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                I'm a Teacher
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 gradient-mesh">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Why Choose Edvora?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Personalized learning that adapts to your unique style
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-interactive opacity-0 animate-slide-up"
                style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="p-6">
                  <div className={`inline-flex p-4 rounded-2xl ${feature.bg} mb-4 hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-display">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-4">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized learning journey in simple steps
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {steps.map((item, index) => (
              <div 
                key={index} 
                className="text-center opacity-0 animate-slide-up"
                style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 ${item.gradient} rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold mx-auto mb-4 shadow-glow hover:scale-110 transition-bounce`}>
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-base md:text-lg mb-1">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="gradient-hero rounded-3xl p-8 md:p-14 shadow-glow text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl mx-auto">
                Join thousands of students learning at their own pace, stress-free
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?role=student')}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg px-8 py-7 text-lg font-bold rounded-2xl hover:-translate-y-1 transition-bounce"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?role=teacher')}
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white hover:text-primary px-8 py-7 text-lg font-bold rounded-2xl backdrop-blur-sm transition-bounce hover:-translate-y-1"
                >
                  Join as Teacher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-gradient">Edvora</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Edvora. Learn at your own pace.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
