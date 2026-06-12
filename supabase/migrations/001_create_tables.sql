-- ================================================
-- 001_create_tables.sql
-- ================================================

-- Enums
CREATE TYPE plan_type AS ENUM ('free', 'paid');
CREATE TYPE priority_type AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE status_type AS ENUM ('a_fazer', 'fazendo', 'feito');

-- Extensão da tabela auth.users do Supabase
CREATE TABLE public.users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  plan       plan_type NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) <= 200),
  description text CHECK (char_length(description) <= 1000),
  priority    priority_type NOT NULL DEFAULT 'media',
  status      status_type NOT NULL DEFAULT 'a_fazer',
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- Histórico de conversas com IA
CREATE TABLE public.ai_conversations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  raw_input    text NOT NULL,
  parsed_tasks jsonb NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Check-ins diários
CREATE TABLE public.daily_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date            date NOT NULL,
  tasks_completed uuid[] NOT NULL DEFAULT '{}',
  ai_summary      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Controle de uso de IA (rate limiting)
CREATE TABLE public.ai_usage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  calls_count integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Subscrições de web push
CREATE TABLE public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_user_status   ON public.tasks(user_id, status)   WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_user_position ON public.tasks(user_id, position)  WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_usage_user_date  ON public.ai_usage(user_id, date);
CREATE INDEX idx_checkins_user_date  ON public.daily_checkins(user_id, date);
