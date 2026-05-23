-- Drop history table (no longer used)
drop table if exists meal_history;

-- households: drop old columns
alter table households
  drop column if exists regional_cuisine,
  drop column if exists spice_level,
  drop column if exists family_size,
  drop column if exists loved_dishes,
  drop column if exists disliked_dishes;

-- households: add new columns
alter table households
  add column if not exists cuisines text[] default '{}',
  add column if not exists fusion_days text[] default '{}',
  add column if not exists include_fish boolean default false,
  add column if not exists has_kids boolean default false,
  add column if not exists height_cm numeric,
  add column if not exists weight_kg numeric,
  add column if not exists health_goal text default '';

-- Narrow dietary_type: drop jain (map to vegetarian)
update households set dietary_type = 'vegetarian' where dietary_type = 'jain';

-- suggestions: swap moods/chosen_meal for meal_time
alter table suggestions
  drop column if exists moods,
  drop column if exists chosen_meal,
  add column if not exists meal_time text;
