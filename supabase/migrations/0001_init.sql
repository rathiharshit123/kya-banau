-- households (one row per device-id)
create table if not exists households (
  id uuid primary key,
  name text,
  dietary_type text default 'vegetarian',
  regional_cuisine text default 'north_indian',
  spice_level int default 3,
  family_size int default 2,
  loved_dishes text[] default '{}',
  disliked_dishes text[] default '{}',
  disliked_ingredients text[] default '{}',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- meal history
create table if not exists meal_history (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  meal_name text not null,
  meal_type text not null,
  source text default 'manual',
  rating int,
  eaten_at timestamptz default now()
);
create index if not exists meal_history_household_eaten on meal_history (household_id, eaten_at desc);

-- AI suggestion log
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  meal_type text not null,
  moods text[] default '{}',
  payload jsonb not null,
  chosen_meal text,
  created_at timestamptz default now()
);

-- auto-update updated_at on households
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger households_updated_at
  before update on households
  for each row execute function update_updated_at();
