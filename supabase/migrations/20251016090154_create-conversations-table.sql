create table conversations (
   id uuid primary key default gen_random_uuid(),
   user_phone text not null,
   message text not null,
   sender text check (sender in ('user', 'bot')) not null,
   created_at timestamptz not null default now()
);
