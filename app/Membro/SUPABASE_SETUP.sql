-- ============================================================
-- DJ Simon — Tabelas para a área de membros
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de progresso das aulas
create table if not exists public.progress (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  video_id    uuid not null references public.videos(id) on delete cascade,
  concluido   boolean default false,
  assistido_em timestamptz default now(),
  unique(member_id, video_id)
);

-- 2. Adicionar campo modulo e ordem à tabela videos (se não existir)
alter table public.videos
  add column if not exists modulo text default 'Módulo 1',
  add column if not exists ordem  int  default 0;

-- 3. Adicionar campo versao à tabela plugins (se não existir)
alter table public.plugins
  add column if not exists versao text;

-- 4. Adicionar campo member_id à plugin_downloads (se não existir)
alter table public.plugin_downloads
  add column if not exists member_id uuid references public.members(id) on delete set null,
  add column if not exists plugin_id uuid references public.plugins(id) on delete set null;

-- 5. RLS — Membros só veem/editam o próprio progresso
alter table public.progress enable row level security;

create policy "Membro lê próprio progresso"
  on public.progress for select
  using (
    member_id = (
      select id from public.members
      where auth_id = auth.uid()
      limit 1
    )
  );

create policy "Membro insere próprio progresso"
  on public.progress for insert
  with check (
    member_id = (
      select id from public.members
      where auth_id = auth.uid()
      limit 1
    )
  );

create policy "Membro atualiza próprio progresso"
  on public.progress for update
  using (
    member_id = (
      select id from public.members
      where auth_id = auth.uid()
      limit 1
    )
  );

-- 6. RLS — Membros autenticados leem videos e plugins
alter table public.videos enable row level security;
create policy "Membros autenticados leem videos"
  on public.videos for select
  using (auth.uid() is not null);

alter table public.plugins enable row level security;
create policy "Membros autenticados leem plugins"
  on public.plugins for select
  using (auth.uid() is not null);

-- 7. RLS — Membros leem próprios dados
alter table public.members enable row level security;
create policy "Membro lê próprios dados"
  on public.members for select
  using (auth_id = auth.uid());

-- 8. RLS — plugin_downloads: membro insere
alter table public.plugin_downloads enable row level security;
create policy "Membro registra download"
  on public.plugin_downloads for insert
  with check (
    member_id = (
      select id from public.members
      where auth_id = auth.uid()
      limit 1
    )
  );
