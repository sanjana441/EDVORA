import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { format } from 'date-fns';

export default function Performance() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: 0,
    highestScore: 0,
    videosCompleted: 0,
    improvement: 0
  });
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    // Load quiz results
    const { data: results } = await supabase
      .from('quiz_results')
      .select('*, quizzes(title, subject_id, subjects(name, icon))')
      .eq('student_id', profile?.id)
      .order('completed_at', { ascending: false });

    if (results && results.length > 0) {
      const scores = results.map(r => (r.score / r.total_questions) * 100);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const highestScore = Math.round(Math.max(...scores));
      
      // Calculate improvement (compare last 3 vs previous 3)
      let improvement = 0;
      if (results.length >= 6) {
        const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const previous = scores.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
        improvement = Math.round(recent - previous);
      }

      setStats(prev => ({
        ...prev,
        totalTests: results.length,
        avgScore,
        highestScore,
        improvement
      }));

      setRecentTests(results.slice(0, 5));

      // Calculate subject-wise performance
      const subjectMap: any = {};
      results.forEach(result => {
        const subjectId = result.quizzes?.subject_id;
        const subject = result.quizzes?.subjects;
        if (subject && subjectId) {
          if (!subjectMap[subjectId]) {
            subjectMap[subjectId] = {
              name: subject.name,
              icon: subject.icon,
              scores: []
            };
          }
          subjectMap[subjectId].scores.push((result.score / result.total_questions) * 100);
        }
      });

      const subjectPerf = Object.values(subjectMap).map((subj: any) => ({
        ...subj,
        avgScore: Math.round(subj.scores.reduce((a: number, b: number) => a + b, 0) / subj.scores.length),
        testCount: subj.scores.length
      }));

      setSubjectPerformance(subjectPerf);
    }

    // Load video progress
    const { data: progress } = await supabase
      .from('video_progress')
      .select('*')
      .eq('student_id', profile?.id)
      .eq('completed', true);

    if (progress) {
      setStats(prev => ({ ...prev, videosCompleted: progress.length }));
    }

    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-secondary';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-secondary text-secondary-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Your Performance</h1>
            <p className="text-muted-foreground text-lg">
              Track your learning journey and celebrate your progress
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tests Taken
                  </CardTitle>
                  <Award className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalTests}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </CardTitle>
                  <Target className="h-5 w-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
                  {stats.avgScore}%
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Highest Score
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{stats.highestScore}%</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Videos Completed
                  </CardTitle>
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.videosCompleted}</div>
              </CardContent>
            </Card>
          </div>

          {stats.improvement !== 0 && (
            <Card className="mb-8 bg-gradient-primary text-white shadow-glow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <CardTitle>Your Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {stats.improvement > 0
                    ? `Amazing! You've improved by ${stats.improvement}% in your recent tests. Keep up the great work! 🎉`
                    : `Your recent scores are ${Math.abs(stats.improvement)}% lower. Don't worry, everyone has ups and downs. Review the topics and try again! 💪`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Subject Performance */}
          {subjectPerformance.length > 0 && (
            <Card className="mb-8 shadow-soft">
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>See how you're doing in each subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="text-3xl">{subject.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{subject.name}</span>
                          <span className={`font-bold ${getScoreColor(subject.avgScore)}`}>
                            {subject.avgScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                subject.avgScore >= 80
                                  ? 'bg-success'
                                  : subject.avgScore >= 60
                                  ? 'bg-secondary'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${subject.avgScore}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {subject.testCount} tests
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Tests */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tests taken yet. Start with some videos and take your first quiz!
                </p>
              ) : (
                <div className="space-y-4">
                  {recentTests.map((test) => {
                    const score = Math.round((test.score / test.total_questions) * 100);
                    return (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{test.quizzes?.subjects?.icon}</div>
                          <div>
                            <h4 className="font-semibold">{test.quizzes?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(test.completed_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getScoreBadge(score)}>
                            {test.score}/{test.total_questions}
                          </Badge>
                          <p className={`text-sm font-semibold mt-1 ${getScoreColor(score)}`}>
                            {score}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}