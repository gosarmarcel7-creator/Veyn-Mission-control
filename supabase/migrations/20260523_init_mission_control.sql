create table if not exists public.provider_connections (
  id text primary key,
  workspace_id text not null,
  provider text not null,
  auth_type text not null,
  display_name text not null,
  status text not null,
  last_synced_at timestamptz,
  encrypted_secret_ref text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id text primary key,
  workspace_id text not null,
  provider_connection_id text references public.provider_connections(id) on delete set null,
  name text not null,
  role text not null,
  model text not null,
  provider text not null,
  status text not null,
  current_task text,
  current_tool text,
  zone text not null,
  progress numeric not null default 0,
  tokens_used bigint not null default 0,
  cost_usd numeric not null default 0,
  last_event_at timestamptz not null default now(),
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  position_z numeric not null default 0
);

create table if not exists public.tasks (
  id text primary key,
  workspace_id text not null,
  title text not null,
  description text,
  status text not null,
  assigned_agent_ids text[] not null default '{}',
  priority text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.runs (
  id text primary key,
  workspace_id text not null,
  title text not null,
  status text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  total_cost_usd numeric not null default 0,
  total_tokens bigint not null default 0,
  provider text not null
);

create table if not exists public.events (
  id text primary key,
  workspace_id text not null,
  run_id text not null,
  agent_id text not null references public.agents(id) on delete cascade,
  provider text not null,
  event_type text not null,
  title text not null,
  message text,
  task text,
  tool text,
  input_summary text,
  output_summary text,
  metadata jsonb,
  timestamp timestamptz not null default now()
);

create table if not exists public.webhook_endpoints (
  workspace_id text not null,
  webhook_id text not null,
  signing_secret text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, webhook_id)
);

create index if not exists idx_agents_workspace on public.agents(workspace_id);
create index if not exists idx_tasks_workspace on public.tasks(workspace_id);
create index if not exists idx_runs_workspace on public.runs(workspace_id);
create index if not exists idx_events_workspace_time on public.events(workspace_id, timestamp desc);
create index if not exists idx_events_run on public.events(run_id);
create index if not exists idx_events_agent on public.events(agent_id);
create index if not exists idx_connections_workspace on public.provider_connections(workspace_id);

alter table public.provider_connections enable row level security;
alter table public.agents enable row level security;
alter table public.tasks enable row level security;
alter table public.runs enable row level security;
alter table public.events enable row level security;
alter table public.webhook_endpoints enable row level security;

drop policy if exists "service role full access provider_connections" on public.provider_connections;
drop policy if exists "service role full access agents" on public.agents;
drop policy if exists "service role full access tasks" on public.tasks;
drop policy if exists "service role full access runs" on public.runs;
drop policy if exists "service role full access events" on public.events;
drop policy if exists "service role full access webhook_endpoints" on public.webhook_endpoints;

create policy "service role full access provider_connections"
on public.provider_connections
for all
to service_role
using (true)
with check (true);

create policy "service role full access agents"
on public.agents
for all
to service_role
using (true)
with check (true);

create policy "service role full access tasks"
on public.tasks
for all
to service_role
using (true)
with check (true);

create policy "service role full access runs"
on public.runs
for all
to service_role
using (true)
with check (true);

create policy "service role full access events"
on public.events
for all
to service_role
using (true)
with check (true);

create policy "service role full access webhook_endpoints"
on public.webhook_endpoints
for all
to service_role
using (true)
with check (true);
