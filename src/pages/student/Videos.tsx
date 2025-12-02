import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Play, Check, Loader2, Clock, Video, Sparkles, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Videos() {
  const { profile } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const { data: subjectSelections } = await supabase
      .from('subject_selections')
      .select('subject_id')
      .eq('student_id', profile?.id);

    const { data: teacherSelections } = await supabase
      .from('teacher_selections')
      .select('teacher_id')
      .eq('student_id', profile?.id);

    const subjectIds = subjectSelections?.map(s => s.subject_id) || [];
    const teacherIds = teacherSelections?.map(t => t.teacher_id) || [];

    let query = supabase
      .from('videos')
      .select('*, subjects(name, icon), teacher_profiles(*, profiles(full_name))');

    if (subjectIds.length > 0) {
      query = query.in('subject_id', subjectIds);
    }

    const { data: videosData } = await query;

    const sortedVideos = videosData?.sort((a, b) => {
      const aSelected = teacherIds.includes(a.teacher_id);
      const bSelected = teacherIds.includes(b.teacher_id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    if (sortedVideos) setVideos(sortedVideos);

    const { data: progress } = await supabase
      .from('video_progress')
      .select('video_id')
      .eq('student_id', profile?.id)
      .eq('completed', true);

    if (progress) {
      setCompletedVideos(progress.map(p => p.video_id));
    }

    setLoading(false);
  };

  const markAsCompleted = async (videoId: string, difficulty?: 'easy' | 'medium' | 'hard') => {
    try {
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          student_id: profile?.id,
          video_id: videoId,
          completed: true,
          difficulty_feedback: difficulty
        }, {
          onConflict: 'student_id,video_id'
        });

      if (error) throw error;

      setCompletedVideos(prev => [...prev, videoId]);
      toast.success('Great job! Video marked as completed 🎉');
      setSelectedVideo(null);
      loadVideos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-2xl bg-tertiary/10 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-tertiary" />
            </div>
            <p className="text-muted-foreground font-medium">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />
      <main className="px-4 py-6 md:px-8 md:py-10">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-tertiary" />
              <span className="text-sm font-medium text-tertiary">Video Library</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              Recommended <span className="text-gradient">Videos</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Personalized content based on your subjects and preferred teachers
            </p>
          </div>

          {/* Progress Badge */}
          {completedVideos.length > 0 && (
            <div className="mb-6 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success font-medium">
                <Sparkles className="h-4 w-4" />
                {completedVideos.length} video{completedVideos.length > 1 ? 's' : ''} completed
              </div>
            </div>
          )}

          {videos.length === 0 ? (
            <Card className="card-interactive text-center p-10 max-w-lg mx-auto">
              <div className="inline-flex p-4 rounded-2xl bg-tertiary/10 mb-4">
                <Video className="h-12 w-12 text-tertiary" />
              </div>
              <CardTitle className="text-2xl font-display mb-2">No Videos Available</CardTitle>
              <CardDescription className="text-base mb-6">
                Select your subjects and teachers first to get personalized recommendations
              </CardDescription>
              <Button 
                onClick={() => navigate('/student/subjects')} 
                className="gradient-tertiary rounded-xl px-6 py-6 font-bold"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map((video, index) => {
                const isCompleted = completedVideos.includes(video.id);
                return (
                  <Card
                    key={video.id}
                    className="card-interactive overflow-hidden opacity-0 animate-slide-up group"
                    style={{ animationFillMode: 'forwards', animationDelay: `${0.1 + index * 0.05}s` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video gradient-tertiary flex items-center justify-center overflow-hidden">
                      {isCompleted && (
                        <div className="absolute top-3 right-3 p-2 rounded-full bg-success shadow-lg z-10">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      <div className="relative p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{video.subjects?.icon || '📚'}</span>
                        <Badge className={`${getDifficultyColor(video.difficulty)} rounded-lg border`}>
                          {video.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-display line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {video.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{video.duration_minutes || '10'} min</span>
                        </div>
                        <span className="truncate max-w-[120px]">
                          {video.teacher_profiles?.profiles?.full_name}
                        </span>
                      </div>
                      <Button
                        onClick={() => setSelectedVideo(video)}
                        className={`w-full rounded-xl py-5 font-bold transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-success/10 text-success hover:bg-success/20' 
                            : 'gradient-tertiary text-white hover:opacity-90'
                        }`}
                        disabled={isCompleted}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Watch Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl">
          <div className="relative aspect-video gradient-tertiary flex items-center justify-center">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <div className="text-center text-white">
              <div className="p-5 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4">
                <Play className="h-14 w-14" />
              </div>
              <p className="text-lg font-display font-bold">Video Player</p>
              <p className="text-sm opacity-80">Embed your video player here</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <DialogTitle className="text-2xl font-display mb-2">{selectedVideo?.title}</DialogTitle>
              <p className="text-muted-foreground">{selectedVideo?.description}</p>
            </div>

            <Button
              onClick={() => markAsCompleted(selectedVideo?.id)}
              className="w-full gradient-tertiary rounded-xl py-6 font-bold text-white"
            >
              <Check className="mr-2 h-5 w-5" />
              Mark as Completed
            </Button>

            <div className="bg-muted/30 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-3">How was this video for you?</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => markAsCompleted(selectedVideo?.id, 'easy')}
                  className="flex-1 rounded-xl py-5 hover:bg-success/10 hover:border-success hover:text-success transition-smooth"
                >
                  <span className="text-lg mr-2">😊</span> Easy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => markAsCompleted(selectedVideo?.id, 'medium')}
                  className="flex-1 rounded-xl py-5 hover:bg-warning/10 hover:border-warning hover:text-warning transition-smooth"
                >
                  <span className="text-lg mr-2">🤔</span> Just Right
                </Button>
                <Button
                  variant="outline"
                  onClick={() => markAsCompleted(selectedVideo?.id, 'hard')}
                  className="flex-1 rounded-xl py-5 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-smooth"
                >
                  <span className="text-lg mr-2">😰</span> Hard
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Chatbot />
    </div>
  );
}
