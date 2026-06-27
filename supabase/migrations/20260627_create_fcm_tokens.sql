-- Create fcm_tokens table
create table if not exists public.fcm_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null unique,
  device_type text default 'web',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.fcm_tokens enable row level security;

-- Policies for fcm_tokens
create policy "Users can insert their own fcm tokens"
  on public.fcm_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can select their own fcm tokens"
  on public.fcm_tokens for select
  using (auth.uid() = user_id);

create policy "Users can update their own fcm tokens"
  on public.fcm_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own fcm tokens"
  on public.fcm_tokens for delete
  using (auth.uid() = user_id);

-- Enable pg_net extension if not already enabled
create extension if not exists pg_net with schema extensions;

-- Function to call the send-fcm Edge Function when a new notification is inserted
create or replace function public.handle_new_notification_push()
returns trigger as $$
declare
  v_supabase_url text;
  v_service_role_key text;
  v_url text;
  v_payload jsonb;
begin
  -- Retrieve Supabase URL and Service Role Key from custom settings or vault.
  -- Default to local kong gateway for local development.
  v_supabase_url := coalesce(
    nullif(current_setting('app.settings.supabase_url', true), ''),
    'http://kong:8000'
  );
  
  v_service_role_key := coalesce(
    nullif(current_setting('app.settings.service_role_key', true), ''),
    ''
  );

  v_url := v_supabase_url || '/functions/v1/send-fcm';

  v_payload := jsonb_build_object(
    'record', row_to_json(new)
  );

  -- Perform asynchronous HTTP POST to the Edge Function using pg_net
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := v_payload,
    timeout_milliseconds := 5000
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on INSERT in notifications table
create trigger on_new_notification_push
  after insert on public.notifications
  for each row
  execute function public.handle_new_notification_push();
