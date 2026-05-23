-- Track user engagement with suggested meals (for future analytics dashboard)
create table if not exists meal_interactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  suggestion_id uuid references suggestions(id) on delete set null,
  meal_name text not null,
  meal_type text,
  day text,
  interaction_type text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists meal_interactions_household_created
  on meal_interactions (household_id, created_at desc);

create index if not exists meal_interactions_type_created
  on meal_interactions (interaction_type, created_at desc);

create index if not exists meal_interactions_meal_name
  on meal_interactions (meal_name);

create index if not exists meal_interactions_suggestion
  on meal_interactions (suggestion_id);
