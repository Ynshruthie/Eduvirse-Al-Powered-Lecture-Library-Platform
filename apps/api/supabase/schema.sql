create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'teacher', 'admin')),
  password_hash text not null,
  password_salt text not null,
  avatar text,
  headline text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

create table if not exists public.students (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  avatar text,
  headline text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_email_idx on public.students (email);

create table if not exists public.teachers (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  avatar text,
  headline text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teachers_email_idx on public.teachers (email);
