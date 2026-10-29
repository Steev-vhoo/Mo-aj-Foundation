-- MO-AJ Foundation website: initial schema.
-- Run once in the Supabase SQL editor (or with `supabase db push`).
--
-- Access model: Row Level Security is ON with no policies, so the public (anon) key can neither
-- read nor write. Only the website's server, using the secret key, can insert rows, and staff read
-- the data in the Supabase dashboard.

create extension if not exists pgcrypto;

-- Status values staff can set while following up.
do $$ begin
  create type submission_status as enum ('new', 'in_progress', 'done', 'archived');
exception when duplicate_object then null; end $$;

-- Volunteer registrations from /get-involved
create table if not exists public.volunteers (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  full_name     text not null check (char_length(full_name) between 1 and 120),
  email         text not null check (char_length(email) between 3 and 254),
  phone         text not null check (char_length(phone) between 5 and 40),
  location      text check (char_length(location) <= 120),
  interests     text[] not null default '{}',
  availability  text check (char_length(availability) <= 60),
  message       text check (char_length(message) <= 4000),
  consent_at    timestamptz not null,
  status        submission_status not null default 'new',
  staff_notes   text
);

-- Contact-form messages and "share your story" submissions
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  kind          text not null check (kind in ('contact', 'story')),
  name          text not null check (char_length(name) between 1 and 120),
  email         text not null check (char_length(email) between 3 and 254),
  phone         text check (char_length(phone) <= 40),
  topic         text check (char_length(topic) <= 60),
  body          text not null check (char_length(body) between 1 and 8000),
  consent_at    timestamptz not null,
  status        submission_status not null default 'new',
  staff_notes   text
);

-- Successful Paystack payments, written by the Paystack webhook
create table if not exists public.donations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  reference       text not null unique,
  amount_minor    bigint not null check (amount_minor > 0), -- pesewas for GHS
  currency        text not null,
  channel         text,                                    -- e.g. mobile_money, card
  donor_email     text,
  donor_name      text,
  paid_at         timestamptz,
  paystack_id     bigint,
  raw             jsonb not null
);

create index if not exists volunteers_created_at_idx on public.volunteers (created_at desc);
create index if not exists volunteers_email_created_idx on public.volunteers (lower(email), created_at desc);
create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_email_created_idx on public.messages (lower(email), created_at desc);
create index if not exists donations_paid_at_idx on public.donations (paid_at desc);

alter table public.volunteers enable row level security;
alter table public.messages   enable row level security;
alter table public.donations  enable row level security;

-- Belt and braces: make sure the public API roles hold no table privileges.
revoke all on public.volunteers, public.messages, public.donations from anon, authenticated;
