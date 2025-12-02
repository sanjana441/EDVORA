-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');

-- Create enum for learning styles
CREATE TYPE public.learning_style AS ENUM ('visual', 'reading', 'practice', 'mixed');

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student_profiles table
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade TEXT,
  learning_style public.learning_style DEFAULT 'mixed',
  daily_goal_minutes INTEGER DEFAULT 30,
  current_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teacher_profiles table
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  teaching_style TEXT,
  specialization TEXT[],
  years_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  difficulty public.difficulty_level DEFAULT 'medium',
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic TEXT,
  difficulty public.difficulty_level DEFAULT 'medium',
  time_limit_minutes INTEGER,
  created_by UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  question_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_minutes INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subject_selections table (many-to-many)
CREATE TABLE public.subject_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- Create teacher_selections table
CREATE TABLE public.teacher_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, teacher_id, subject_id)
);

-- Create video_progress table
CREATE TABLE public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  difficulty_feedback public.difficulty_level,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, video_id)
);

-- Create chatbot_messages table
CREATE TABLE public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for student_profiles
CREATE POLICY "Anyone can view student profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Students can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for teacher_profiles
CREATE POLICY "Anyone can view teacher profiles" ON public.teacher_profiles FOR SELECT USING (true);
CREATE POLICY "Teachers can update own profile" ON public.teacher_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can insert own profile" ON public.teacher_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subjects (public read, teacher write)
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Teachers can manage subjects" ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teacher_profiles WHERE id = auth.uid())
);

-- RLS Policies for videos
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their videos" ON public.videos FOR ALL USING (
  teacher_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.teacher_profiles WHERE id = auth.uid())
);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage quizzes" ON public.quizzes FOR ALL USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.teacher_profiles WHERE id = auth.uid())
);

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can manage quiz questions" ON public.quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q 
    WHERE q.id = quiz_id AND (q.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.teacher_profiles WHERE id = auth.uid()))
  )
);

-- RLS Policies for quiz_results
CREATE POLICY "Students can view own results" ON public.quiz_results FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can insert own results" ON public.quiz_results FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can view all results" ON public.quiz_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teacher_profiles WHERE id = auth.uid())
);

-- RLS Policies for subject_selections
CREATE POLICY "Students can view own selections" ON public.subject_selections FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can manage own selections" ON public.subject_selections FOR ALL USING (student_id = auth.uid());

-- RLS Policies for teacher_selections
CREATE POLICY "Students can view own teacher selections" ON public.teacher_selections FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can manage own teacher selections" ON public.teacher_selections FOR ALL USING (student_id = auth.uid());

-- RLS Policies for video_progress
CREATE POLICY "Students can view own progress" ON public.video_progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can manage own progress" ON public.video_progress FOR ALL USING (student_id = auth.uid());

-- RLS Policies for chatbot_messages
CREATE POLICY "Students can view own messages" ON public.chatbot_messages FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can insert own messages" ON public.chatbot_messages FOR INSERT WITH CHECK (student_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample subjects
INSERT INTO public.subjects (name, description, icon) VALUES
  ('Mathematics', 'Algebra, Geometry, Calculus, Statistics', '🔢'),
  ('Science', 'Physics, Chemistry, Biology', '🔬'),
  ('English', 'Literature, Grammar, Writing', '📚'),
  ('History', 'World History, Ancient Civilizations', '🏛️'),
  ('Computer Science', 'Programming, Algorithms, Data Structures', '💻'),
  ('Art', 'Drawing, Painting, Design', '🎨');