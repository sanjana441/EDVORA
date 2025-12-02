import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Video, TrendingUp, Sparkles, Flame, Target, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ videos: 0, avgScore: 0, streak: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadSubjects();
    loadStats();
  }, []);

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*');
    if (data) setSubjects(data);
  };

  const loadStats = async () => {
    const { data: results } = await supabase
      .from('quiz_results')
      .select('score, total_questions')
      .eq('student_id', profile?.id);
    
    if (results && results.length > 0) {
      const avgScore = Math.round(
        results.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) / results.length
      );
      setStats({ videos: 0, avgScore, streak: 0 });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Videos Watched', value: stats.videos, icon: Video, color: 'from-primary to-primary-glow', bgColor: 'bg-primary/10' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: Target, color: 'from-secondary to-warning', bgColor: 'bg-secondary/10' },
    { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'from-secondary to-destructive', bgColor: 'bg-secondary/10' },
    { label: 'Level', value: 'Rising Star', icon: Award, color: 'from-tertiary to-primary', bgColor: 'bg-tertiary/10' },
  ];

  const actionCards = [
    {
      title: 'Select Subjects',
      description: 'Choose the subjects you want to master',
      icon: BookOpen,
      gradient: 'gradient-primary',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
      path: '/student/subjects',
      buttonText: 'Browse Subjects',
    },
    {
      title: 'Choose Teachers',
      description: 'Find the perfect teachers for your style',
      icon: Users,
      gradient: 'gradient-secondary',
      iconBg: 'bg-secondary/20',
      iconColor: 'text-secondary',
      path: '/student/teachers',
      buttonText: 'View Teachers',
    },
    {
      title: 'Watch Videos',
      description: 'Learn with personalized video content',
      icon: Video,
      gradient: 'gradient-tertiary',
      iconBg: 'bg-tertiary/20',
      iconColor: 'text-tertiary',
      path: '/student/videos',
      buttonText: 'Start Learning',
    },
    {
      title: 'Your Progress',
      description: 'Track your improvement over time',
      icon: TrendingUp,
      gradient: 'gradient-hero',
      iconBg: 'bg-success/20',
      iconColor: 'text-success',
      path: '/student/performance',
      buttonText: 'View Progress',
    },
  ];

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />
      <main className="px-4 py-6 md:px-8 md:py-10">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="mb-10 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary animate-bounce-soft" />
              <span className="text-sm font-medium text-primary">Welcome back!</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              {getGreeting()}, <span className="text-gradient">{profile?.full_name}</span>! 
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Ready to continue your learning journey? Let's make today count! 🚀
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {statCards.map((stat, index) => (
              <Card 
                key={stat.label} 
                className={`card-interactive opacity-0 animate-slide-up stagger-${index + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-3`}>
                    <stat.icon className={`h-5 w-5 md:h-6 md:w-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {actionCards.map((card, index) => (
              <Card 
                key={card.title}
                className={`card-interactive group cursor-pointer opacity-0 animate-slide-up stagger-${index + 1}`}
                style={{ animationFillMode: 'forwards', animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => navigate(card.path)}
              >
                <CardHeader className="pb-2">
                  <div className={`inline-flex p-4 rounded-2xl ${card.iconBg} mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-display">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-6">{card.description}</p>
                  <Button 
                    className={`w-full ${card.gradient} text-white font-semibold py-6 rounded-xl hover:opacity-90 transition-all duration-300 group-hover:shadow-glow`}
                  >
                    {card.buttonText}
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Motivational Banner */}
          <div 
            className="mt-10 p-6 md:p-8 rounded-3xl gradient-hero text-white relative overflow-hidden opacity-0 animate-slide-up"
            style={{ animationFillMode: 'forwards', animationDelay: '0.7s' }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-display font-bold mb-2">
                🎯 Today's Goal
              </h3>
              <p className="text-white/90 max-w-2xl">
                Complete one video lesson and take a quiz to keep your streak going. 
                You're doing amazing - keep up the great work!
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
