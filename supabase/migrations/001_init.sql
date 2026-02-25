CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE workspaces (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  domain text NOT NULL,
  country text DEFAULT 'US',
  language text DEFAULT 'en',
  competitors jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE prompt_groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE prompts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  group_id uuid REFERENCES prompt_groups(id) ON DELETE SET NULL,
  prompt_text text NOT NULL,
  tags jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE prompt_suggestions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  tags jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE llm_providers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text UNIQUE NOT NULL
);
INSERT INTO llm_providers (name) VALUES ('openai'), ('anthropic');

CREATE TABLE llm_models (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES llm_providers(id),
  model_key text NOT NULL,
  display_name text NOT NULL,
  pricing_meta jsonb DEFAULT '{}'
);
INSERT INTO llm_models (provider_id, model_key, display_name, pricing_meta)
  SELECT id, 'gpt-4o', 'GPT-4o', '{"input_per_1k":0.005,"output_per_1k":0.015}'::jsonb FROM llm_providers WHERE name='openai';
INSERT INTO llm_models (provider_id, model_key, display_name, pricing_meta)
  SELECT id, 'claude-3-5-haiku-20251001', 'Claude 3.5 Haiku', '{"input_per_1k":0.001,"output_per_1k":0.005}'::jsonb FROM llm_providers WHERE name='anthropic';

CREATE TABLE run_batches (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  triggered_by text DEFAULT 'manual' CHECK (triggered_by IN ('manual','cron')),
  schedule_type text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE runs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id uuid REFERENCES run_batches(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES llm_providers(id),
  model_id uuid REFERENCES llm_models(id),
  locale jsonb DEFAULT '{"country":"US","language":"en"}',
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','done','error')),
  started_at timestamptz,
  finished_at timestamptz,
  latency_ms integer,
  cost_estimate_usd numeric(10,6),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE run_outputs_raw (
  run_id uuid PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  raw_text text,
  raw_json jsonb
);

CREATE TABLE run_outputs_parsed (
  run_id uuid PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  citations jsonb DEFAULT '[]',
  brand_mentions jsonb DEFAULT '{}',
  entities jsonb DEFAULT '[]',
  summary text
);

CREATE TABLE run_scores (
  run_id uuid PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  mention_score float DEFAULT 0,
  citation_score float DEFAULT 0,
  share_of_voice float DEFAULT 0,
  sentiment_label text DEFAULT 'neutral',
  sentiment_score float DEFAULT 0,
  risk_flags jsonb DEFAULT '[]',
  scoring_version text DEFAULT '1.0'
);

CREATE TABLE alert_rules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  threshold jsonb DEFAULT '{}',
  channel text DEFAULT 'email',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE alert_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_id uuid REFERENCES alert_rules(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_outputs_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_outputs_parsed ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "workspace_owner" ON workspaces FOR ALL TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "workspace_member_select" ON workspace_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "project_member_all" ON projects FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "prompt_member_all" ON prompts FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())));
CREATE POLICY "runs_member_all" ON runs FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())));
