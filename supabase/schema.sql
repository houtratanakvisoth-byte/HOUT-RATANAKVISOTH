-- ==============================================================================
-- Project: Mr.Soth Blog
-- Step 1: SQL Schema for Supabase
-- Includes: Tables, Constraints, Indexes, Functions, Triggers, RLS Policies & Seed Data
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase Auth auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 3. TAGS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null
);

-- ------------------------------------------------------------------------------
-- 4. POSTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  content_format text default 'markdown' check (content_format in ('markdown', 'html')),
  cover_url text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean default false,
  views integer default 0,
  reading_time integer default 1,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 5. POST_TAGS TABLE (Many-to-Many)
-- ------------------------------------------------------------------------------
create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ------------------------------------------------------------------------------
-- 6. COMMENTS TABLE (Supports nested replies)
-- ------------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  content text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 7. ADS TABLE (Image & Script Ads for 6 defined slots)
-- ------------------------------------------------------------------------------
create table if not exists public.ads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slot text not null check (slot in ('header', 'sidebar_top', 'sidebar_bottom', 'in_article', 'below_post', 'footer')),
  ad_type text not null check (ad_type in ('image', 'script')),
  image_url text,
  link_url text,
  script_code text,
  width integer,
  height integer,
  position integer default 0,
  is_active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  impressions integer default 0,
  clicks integer default 0
);

-- ------------------------------------------------------------------------------
-- 8. MEDIA TABLE (Cloudflare R2 tracking)
-- ------------------------------------------------------------------------------
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  uploaded_by uuid references public.profiles(id) on delete set null,
  object_key text not null,
  public_url text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  alt_text text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 9. CV_SECTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.cv_sections (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  title text not null,
  icon text,
  position integer default 0,
  is_visible boolean default true
);

-- ------------------------------------------------------------------------------
-- 10. CV_ITEMS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.cv_items (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references public.cv_sections(id) on delete cascade not null,
  label text not null,
  value text,
  subtitle text,
  url text,
  position integer default 0
);

-- ------------------------------------------------------------------------------
-- 11. SITE_SETTINGS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 12. SUBSCRIBERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 13. CONTACT_MESSAGES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_status_published_at on public.posts(status, published_at desc);
create index if not exists idx_posts_category on public.posts(category_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_comments_approved on public.comments(is_approved);
create index if not exists idx_ads_slot_active on public.ads(slot, is_active);
create index if not exists idx_cv_items_section on public.cv_items(section_id, position);
create index if not exists idx_cv_sections_position on public.cv_sections(position);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. public.is_admin() Security Definer Function
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 2. Auto-create Profile row when user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, bio, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    '',
    false
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Trigger to auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at_column();

-- 4. Public View and Ad Counter RPC functions (Safe security definer counters)
create or replace function public.increment_post_views(p_post_id uuid)
returns void
language sql
security definer
as $$
  update public.posts
  set views = views + 1
  where id = p_post_id;
$$;

create or replace function public.increment_ad_impressions(p_ad_id uuid)
returns void
language sql
security definer
as $$
  update public.ads
  set impressions = impressions + 1
  where id = p_ad_id;
$$;

create or replace function public.increment_ad_clicks(p_ad_id uuid)
returns void
language sql
security definer
as $$
  update public.ads
  set clicks = clicks + 1
  where id = p_ad_id;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;
alter table public.ads enable row level security;
alter table public.media enable row level security;
alter table public.cv_sections enable row level security;
alter table public.cv_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- --- Profiles Policies ---
-- Public can read author profiles (for post author card & about page)
create policy "Public can read profiles"
  on public.profiles for select
  using (true);

-- Users can update their own profile; Admin can update any profile
create policy "Users and admin can update profiles"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "Admin can insert profiles"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

create policy "Admin can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- --- Categories Policies ---
create policy "Public can read categories"
  on public.categories for select
  using (true);

create policy "Admin can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Tags Policies ---
create policy "Public can read tags"
  on public.tags for select
  using (true);

create policy "Admin can manage tags"
  on public.tags for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Posts Policies ---
-- Public can select only published posts; Admin can select all
create policy "Public can read published posts; admin can read all"
  on public.posts for select
  using (status = 'published' or public.is_admin());

create policy "Admin can insert posts"
  on public.posts for insert
  with check (public.is_admin());

create policy "Admin can update posts"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete posts"
  on public.posts for delete
  using (public.is_admin());

-- --- Post Tags Policies ---
create policy "Public can read post_tags"
  on public.post_tags for select
  using (true);

create policy "Admin can manage post_tags"
  on public.post_tags for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Comments Policies ---
-- Public can only see approved comments; Admin sees all
create policy "Public can view approved comments; admin sees all"
  on public.comments for select
  using (is_approved = true or public.is_admin());

-- Public can insert comment, but is_approved MUST be false
create policy "Public can submit pending comments"
  on public.comments for insert
  with check (is_approved = false or public.is_admin());

create policy "Admin can update comments"
  on public.comments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete comments"
  on public.comments for delete
  using (public.is_admin());

-- --- Ads Policies ---
-- Public can select active ads within date range; Admin sees all
create policy "Public can read active ads; admin can read all"
  on public.ads for select
  using (
    (
      is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    )
    or public.is_admin()
  );

create policy "Admin can manage ads"
  on public.ads for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Media Policies ---
-- Public can read media records; Admin can manage all
create policy "Public can read media"
  on public.media for select
  using (true);

create policy "Admin can manage media"
  on public.media for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- CV Sections Policies ---
-- Public can read visible sections; Admin can read all
create policy "Public can read visible cv sections"
  on public.cv_sections for select
  using (is_visible = true or public.is_admin());

create policy "Admin can manage cv sections"
  on public.cv_sections for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- CV Items Policies ---
create policy "Public can read cv items"
  on public.cv_items for select
  using (true);

create policy "Admin can manage cv items"
  on public.cv_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Site Settings Policies ---
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admin can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- --- Subscribers Policies ---
-- Admin can view subscribers list
create policy "Admin can view subscribers"
  on public.subscribers for select
  using (public.is_admin());

-- Public can subscribe
create policy "Public can insert subscriber"
  on public.subscribers for insert
  with check (true);

create policy "Admin can manage subscribers"
  on public.subscribers for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete subscribers"
  on public.subscribers for delete
  using (public.is_admin());

-- --- Contact Messages Policies ---
-- Admin can view messages
create policy "Admin can view contact messages"
  on public.contact_messages for select
  using (public.is_admin());

-- Public can submit messages (is_read defaults to false)
create policy "Public can insert contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admin can update contact messages"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Categories Seed
insert into public.categories (id, name, slug, description)
values
  ('11111111-1111-1111-1111-111111111101', 'Web Development', 'web-development', 'Modern web architecture, full-stack design patterns, and engineering practices.'),
  ('11111111-1111-1111-1111-111111111102', 'JavaScript & TypeScript', 'javascript-typescript', 'Deep dives into ESNext, TypeScript type systems, and runtime performance.'),
  ('11111111-1111-1111-1111-111111111103', 'React & Frontend', 'react-frontend', 'Component architecture, state management, hooks, and responsive design systems.'),
  ('11111111-1111-1111-1111-111111111104', 'Backend & Databases', 'backend-database', 'PostgreSQL, Supabase, APIs, edge caching, and scalable data models.'),
  ('11111111-1111-1111-1111-111111111105', 'Cloudflare & DevOps', 'cloudflare-devops', 'Workers, R2 object storage, edge compute, CI/CD, and deployment workflows.'),
  ('11111111-1111-1111-1111-111111111106', 'Work Notes & Real Problems', 'work-notes', 'Practical troubleshooting, production bug postmortems, and engineering war stories.')
on conflict (slug) do nothing;

-- Tags Seed
insert into public.tags (id, name, slug)
values
  ('22222222-2222-2222-2222-222222222201', 'React', 'react'),
  ('22222222-2222-2222-2222-222222222202', 'TailwindCSS', 'tailwindcss'),
  ('22222222-2222-2222-2222-222222222203', 'Supabase', 'supabase'),
  ('22222222-2222-2222-2222-222222222204', 'Cloudflare', 'cloudflare'),
  ('22222222-2222-2222-2222-222222222205', 'PostgreSQL', 'postgresql'),
  ('22222222-2222-2222-2222-222222222206', 'JavaScript', 'javascript')
on conflict (slug) do nothing;

-- Default Site Settings Seed
insert into public.site_settings (key, value)
values
  ('general', '{
    "site_title": "Mr.Soth Blog",
    "tagline": "Personal technology blog on web development, coding & real-world problems",
    "author_name": "Mr. Soth",
    "author_title": "Senior Software Engineer",
    "author_bio": "Full-stack developer building robust web applications. Writing about JavaScript, React, PostgreSQL, Cloudflare, and practical lessons from production systems.",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "cv_pdf_url": "",
    "github_url": "https://github.com",
    "linkedin_url": "https://linkedin.com",
    "twitter_url": "https://twitter.com",
    "contact_email": "contact@mrsoth.dev"
  }'::jsonb)
on conflict (key) do nothing;

-- Default CV Sections Seed
insert into public.cv_sections (id, key, title, icon, position, is_visible)
values
  ('33333333-3333-3333-3333-333333333301', 'summary', 'Professional Summary', 'User', 1, true),
  ('33333333-3333-3333-3333-333333333302', 'experience', 'Work Experience', 'Briefcase', 2, true),
  ('33333333-3333-3333-3333-333333333303', 'skills', 'Technical Skills', 'Code', 3, true),
  ('33333333-3333-3333-3333-333333333304', 'education', 'Education & Certifications', 'GraduationCap', 4, true)
on conflict (key) do nothing;

-- Default CV Items Seed
insert into public.cv_items (id, section_id, label, value, subtitle, url, position)
values
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Bio', 'Experienced Software Engineer specializing in modern frontend and backend web architecture, scalable database systems, and edge infrastructure.', null, null, 1),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', 'Senior Software Engineer', '2023 - Present', 'Tech Solutions Inc. — Built high-scale web platforms using React, Node.js, and Supabase.', null, 1),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', 'Full Stack Developer', '2021 - 2023', 'Digital Agency Labs — Engineered client portals, API integrations, and Cloudflare deployments.', null, 2),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333303', 'Frontend & Styling', 'React, JavaScript, TypeScript, Tailwind CSS, Vite, HTML5/CSS3', null, null, 1),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333303', 'Backend & Cloud', 'PostgreSQL, Supabase, Cloudflare Workers, Cloudflare R2, REST APIs', null, null, 2),
  ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333304', 'B.S. in Computer Science', '2017 - 2021', 'Faculty of Engineering & Computer Science', null, 1)
on conflict (id) do nothing;
