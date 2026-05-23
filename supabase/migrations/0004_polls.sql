-- Shareable meal polls for family voting
create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  suggestion_id uuid references suggestions(id) on delete set null,
  title text not null,
  tip text,
  meals jsonb not null,
  status text not null default 'open',
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists polls_household_created
  on polls (household_id, created_at desc);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  meal_index int not null,
  voter_token text not null,
  voter_name text,
  created_at timestamptz default now(),
  unique (poll_id, voter_token)
);

create index if not exists poll_votes_poll_id
  on poll_votes (poll_id);
