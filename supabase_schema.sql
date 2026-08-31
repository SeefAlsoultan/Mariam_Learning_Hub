-- =========================================================
-- MARIAM KHALED - ENGLISH LEARNING PLATFORM
-- SUPABASE DATABASE SCHEMA
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Levels Table
CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_locked BOOLEAN DEFAULT true,
  order_num INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Levels are viewable by all authenticated users"
  ON public.levels FOR SELECT USING (true);

CREATE POLICY "Admins/Service can modify levels"
  ON public.levels FOR ALL USING (true);

-- Insert initial levels
INSERT INTO public.levels (id, name, description, icon, color, is_locked, order_num)
VALUES
  ('beginner1', 'Beginner 1', 'Basics of English – alphabet, greetings, simple present', '🌱', '#27ae60', true, 1),
  ('beginner2', 'Beginner 2', 'Grammar & Vocabulary – Units 7-9: demonstratives, clothes, past simple', '📘', '#2e75b6', false, 2),
  ('elementary1', 'Elementary 1', 'Expanding grammar – comparatives, modals, present continuous', '📗', '#8e44ad', true, 3),
  ('elementary2', 'Elementary 2', 'Intermediate grammar – future tenses, conditionals', '📙', '#e67e22', true, 4),
  ('preintermediate', 'Pre-Intermediate', 'Complex structures – passive voice, reported speech', '📕', '#e74c3c', true, 5),
  ('intermediate', 'Intermediate', 'Advanced topics – idioms, phrasal verbs, essay writing', '🎓', '#2c3e50', true, 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  is_locked = EXCLUDED.is_locked,
  order_num = EXCLUDED.order_num;

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  level_id TEXT REFERENCES public.levels(id) ON DELETE CASCADE,
  unit TEXT NOT NULL,
  type TEXT NOT NULL, -- 'mcq' or 'article'
  topic TEXT,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are readable by all authenticated and anon users"
  ON public.questions FOR SELECT USING (true);

CREATE POLICY "Service role can modify questions"
  ON public.questions FOR ALL USING (true);

-- 4. Quiz Results Table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id TEXT REFERENCES public.levels(id) ON DELETE SET NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score_percentage INT NOT NULL,
  passed BOOLEAN NOT NULL,
  question_type TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own quiz results"
  ON public.quiz_results FOR INSERT WITH CHECK (true);

-- 5. User Answers Detail Table
CREATE TABLE IF NOT EXISTS public.user_answers (
  id SERIAL PRIMARY KEY,
  result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE,
  question_id INT REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their answer details"
  ON public.user_answers FOR SELECT USING (true);

CREATE POLICY "Users can insert answer details"
  ON public.user_answers FOR INSERT WITH CHECK (true);
