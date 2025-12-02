import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Loader2, User, Users, ArrowRight, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Teachers() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selections, setSelections] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: subjectSelections } = await supabase
      .from('subject_selections')
      .select('subject_id, subjects(*)')
      .eq('student_id', profile?.id);

    if (subjectSelections && subjectSelections.length > 0) {
      const subjectsData = subjectSelections.map(s => s.subjects);
      setSubjects(subjectsData);
      setSelectedSubject(subjectsData[0].id);
    }

    const { data: teachersData } = await supabase
      .from('teacher_profiles')
      .select('*, profiles(full_name, avatar_url)');
    
    if (teachersData) setTeachers(teachersData);

    const { data: existingSelections } = await supabase
      .from('teacher_selections')
      .select('*')
      .eq('student_id', profile?.id);

    if (existingSelections) {
      const selectionsMap: any = {};
      existingSelections.forEach(sel => {
        selectionsMap[sel.subject_id] = sel.teacher_id;
      });
      setSelections(selectionsMap);
    }

    setLoading(false);
  };

  const selectTeacher = (teacherId: string) => {
    setSelections((prev: any) => ({
      ...prev,
      [selectedSubject]: teacherId
    }));
  };

  const saveSelections = async () => {
    setSaving(true);
    try {
      await supabase
        .from('teacher_selections')
        .delete()
        .eq('student_id', profile?.id);

      const selectionsArray = Object.entries(selections).map(([subjectId, teacherId]) => ({
        student_id: profile?.id,
        subject_id: subjectId,
        teacher_id: teacherId as string
      }));

      if (selectionsArray.length > 0) {
        const { error } = await supabase
          .from('teacher_selections')
          .insert(selectionsArray);

        if (error) throw error;
      }

      toast.success('Teacher preferences saved!');
      navigate('/student/videos');
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
            <div className="inline-flex p-4 rounded-2xl bg-secondary/10 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
            <p className="text-muted-foreground font-medium">Loading teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Card className="max-w-md text-center card-interactive p-8">
            <div className="inline-flex p-4 rounded-2xl bg-secondary/10 mb-4">
              <Users className="h-12 w-12 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-display mb-2">No Subjects Selected</CardTitle>
            <CardDescription className="text-base mb-6">
              Please select subjects first before choosing teachers
            </CardDescription>
            <Button 
              onClick={() => navigate('/student/subjects')} 
              className="gradient-primary rounded-xl px-6 py-6 font-bold"
            >
              Select Subjects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const selectedCount = Object.keys(selections).length;

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />
      <main className="px-4 py-6 md:px-8 md:py-10">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">Step 2 of 3</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              Choose Your <span className="text-gradient">Teachers</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Select your preferred teacher for each subject
            </p>
          </div>

          {/* Subject Selector */}
          <div className="mb-8 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <label className="text-sm font-semibold mb-3 block text-muted-foreground">Select Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full max-w-sm rounded-xl h-12 border-2 focus:border-secondary transition-smooth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id} className="rounded-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{subject.icon}</span>
                      <span className="font-medium">{subject.name}</span>
                      {selections[subject.id] && (
                        <Check className="h-4 w-4 text-success ml-2" />
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected count badge */}
          {selectedCount > 0 && (
            <div className="mb-6 opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success font-medium">
                <Sparkles className="h-4 w-4" />
                {selectedCount} teacher{selectedCount > 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {/* Teachers Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
            {teachers.map((teacher, index) => {
              const isSelected = selections[selectedSubject] === teacher.id;
              return (
                <Card
                  key={teacher.id}
                  className={`card-interactive cursor-pointer opacity-0 animate-slide-up group ${
                    isSelected ? 'ring-2 ring-secondary bg-secondary/5' : ''
                  }`}
                  style={{ animationFillMode: 'forwards', animationDelay: `${0.2 + index * 0.05}s` }}
                  onClick={() => selectTeacher(teacher.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
                        isSelected ? 'gradient-secondary' : 'bg-secondary/10'
                      }`}>
                        <GraduationCap className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-secondary'}`} />
                      </div>
                      <div className={`p-2 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-secondary scale-100' 
                          : 'bg-muted scale-0 group-hover:scale-100'
                      }`}>
                        <Check className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display">{teacher.profiles?.full_name}</CardTitle>
                    {teacher.bio && (
                      <CardDescription className="line-clamp-2">{teacher.bio}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {teacher.teaching_style && (
                        <Badge variant="secondary" className="rounded-lg bg-secondary/10 text-secondary border-0">
                          {teacher.teaching_style}
                        </Badge>
                      )}
                      {teacher.years_experience && (
                        <Badge variant="outline" className="rounded-lg">
                          {teacher.years_experience} yrs exp
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {teachers.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No teachers available yet</h3>
              <p className="text-muted-foreground">Check back soon for new teachers!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => navigate('/student/subjects')}
              className="w-full sm:w-auto rounded-xl px-6 py-6 font-semibold hover:bg-muted transition-smooth"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subjects
            </Button>
            <Button
              onClick={saveSelections}
              disabled={saving || selectedCount === 0}
              className="w-full sm:w-auto gradient-secondary rounded-xl px-8 py-6 font-bold text-white shadow-glow hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Videos
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
