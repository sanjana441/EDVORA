import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User } from 'lucide-react';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    grade: profile?.student_profiles?.grade || '',
    learning_style: profile?.student_profiles?.learning_style || 'mixed',
    daily_goal_minutes: profile?.student_profiles?.daily_goal_minutes || 30
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      // Update student profile
      const { error: studentError } = await supabase
        .from('student_profiles')
        .update({
          grade: formData.grade,
          learning_style: formData.learning_style,
          daily_goal_minutes: formData.daily_goal_minutes
        })
        .eq('id', profile?.id);

      if (studentError) throw studentError;

      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-gradient-primary">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle>{profile?.full_name}</CardTitle>
                  <CardDescription className="capitalize">{profile?.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Class</Label>
                  <Input
                    id="grade"
                    placeholder="e.g., 10th Grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning_style">Learning Style</Label>
                  <Select
                    value={formData.learning_style}
                    onValueChange={(value: any) => setFormData({ ...formData, learning_style: value })}
                  >
                    <SelectTrigger id="learning_style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Learner</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="practice">Practice-Based</SelectItem>
                      <SelectItem value="mixed">Mixed Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_goal">Daily Goal (minutes)</Label>
                  <Input
                    id="daily_goal"
                    type="number"
                    min="10"
                    max="240"
                    value={formData.daily_goal_minutes}
                    onChange={(e) => setFormData({ ...formData, daily_goal_minutes: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Set your daily learning goal between 10-240 minutes
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}