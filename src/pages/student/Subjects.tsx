import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Loader2, BookOpen, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function Subjects() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: subjectsData } = await supabase.from('subjects').select('*');
    if (subjectsData) setSubjects(subjectsData);

    const { data: selections } = await supabase
      .from('subject_selections')
      .select('subject_id')
      .eq('student_id', profile?.id);
    
    if (selections) {
      setSelectedSubjects(selections.map(s => s.subject_id));
    }
    setLoading(false);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const saveSelections = async () => {
    setSaving(true);
    try {
      await supabase
        .from('subject_selections')
        .delete()
        .eq('student_id', profile?.id);

      if (selectedSubjects.length > 0) {
        const { error } = await supabase
          .from('subject_selections')
          .insert(
            selectedSubjects.map(subjectId => ({
              student_id: profile?.id,
              subject_id: subjectId
            }))
          );

        if (error) throw error;
      }

      toast.success('Subjects saved successfully!');
      navigate('/student/teachers');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground font-medium">Loading subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />
      <main className="px-4 py-6 md:px-8 md:py-10">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Step 1 of 3</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              Select Your <span className="text-gradient">Subjects</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Choose the subjects you want to learn. You can always change this later.
            </p>
          </div>

          {/* Selected count badge */}
          {selectedSubjects.length > 0 && (
            <div className="mb-6 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success font-medium">
                <Sparkles className="h-4 w-4" />
                {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {/* Subjects Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
            {subjects.map((subject, index) => {
              const isSelected = selectedSubjects.includes(subject.id);
              return (
                <Card
                  key={subject.id}
                  className={`card-interactive cursor-pointer opacity-0 animate-slide-up group ${
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/5'
                      : ''
                  }`}
                  style={{ animationFillMode: 'forwards', animationDelay: `${0.1 + index * 0.05}s` }}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300 ${isSelected ? 'animate-bounce-soft' : ''}`}>
                        {subject.icon || '📚'}
                      </div>
                      <div className={`p-2 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-primary scale-100' 
                          : 'bg-muted scale-0 group-hover:scale-100'
                      }`}>
                        <Check className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">{subject.name}</CardTitle>
                    <CardDescription className="text-sm">{subject.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {subjects.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No subjects available</h3>
              <p className="text-muted-foreground">Check back later for new subjects!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => navigate('/student/dashboard')}
              className="w-full sm:w-auto rounded-xl px-6 py-6 font-semibold hover:bg-muted transition-smooth"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={saveSelections}
              disabled={saving || selectedSubjects.length === 0}
              className="w-full sm:w-auto gradient-primary rounded-xl px-8 py-6 font-bold text-white shadow-glow hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Teachers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
