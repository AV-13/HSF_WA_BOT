-- Extensions utiles
create extension if not exists pgcrypto;

-- 1) Drop des anciennes tables si elles existent (aucune donnée à conserver)
drop table if exists messages cascade;
drop table if exists conversations cascade;

-- 2) Nouveau schéma

create table conversations (
    id uuid primary key default gen_random_uuid(),
    user_phone text not null,
    status text not null default 'open' check (status in ('open','closed')),
    started_at timestamptz not null default now(),
    last_message_at timestamptz not null default now()
);

create index idx_conv_user_last on conversations (user_phone, last_message_at desc);
create index idx_conv_status on conversations (status);

create table messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references conversations(id) on delete cascade,
    wa_message_id text,                                       -- WAMID WhatsApp (optionnel mais pourrait servir ?)
    direction text not null check (direction in ('in','out')),
    sender text not null check (sender in ('user','bot')),
    message_type text not null default 'text',                -- text, interactive, image, template...
    text_content text,
    created_at timestamptz not null default now(),
    delivered_at timestamptz,
    read_at timestamptz
);

create unique index uq_messages_wamid on messages(wa_message_id) where wa_message_id is not null;
create index idx_messages_conv_time on messages (conversation_id, created_at);

-- 3) Activer RLS (Row Level Security)
alter table conversations enable row level security;
alter table messages enable row level security;