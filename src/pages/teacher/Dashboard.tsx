import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Users, Video, BookOpen, Award } from 'lucide-react';

export default function TeacherDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Welcome, {profile?.full_name}! 📚
            </h1>
            <p className="text-muted-foreground text-lg">Teacher Dashboard</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Videos Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Student Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">--%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft hover:shadow-glow transition-smooth">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>My Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View students who selected you as their teacher</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth">
              <CardHeader>
                <Video className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Manage Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Create and manage video lessons</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}