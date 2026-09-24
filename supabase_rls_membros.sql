-- ============================================================
-- RLS para área de membros (members, videos, progress, plugins)
-- Rode no Supabase → SQL Editor. Idempotente (pode rodar de novo).
-- ============================================================

-- 1) MEMBERS: cada usuário só pode ler/atualizar a própria linha.
--    Sem isso, ou a query trava/retorna vazio pra todo mundo (RLS on,
--    sem policy), ou qualquer autenticado lê a tabela inteira (RLS off).
alter table members enable row level security;

drop policy if exists "member reads own row" on members;
create policy "member reads own row"
  on members for select
  using (auth.uid() = auth_id);

drop policy if exists "member updates own row" on members;
create policy "member updates own row"
  on members for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- Inserção/exclusão de members deve ser só via service_role
-- (webhook de pagamento no backend), nunca pelo client.
drop policy if exists "service role manages members" on members;
create policy "service role manages members"
  on members for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 2) VIDEOS: catálogo de aulas. Todo autenticado pode ler
--    (o filtro de plano já é feito no client, mas trave a escrita).
alter table videos enable row level security;

drop policy if exists "authenticated reads videos" on videos;
create policy "authenticated reads videos"
  on videos for select
  using (auth.role() = 'authenticated');

drop policy if exists "service role manages videos" on videos;
create policy "service role manages videos"
  on videos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 3) PROGRESS: cada membro só vê/edita o próprio progresso.
alter table progress enable row level security;

drop policy if exists "member reads own progress" on progress;
create policy "member reads own progress"
  on progress for select
  using (
    member_id in (select id from members where auth_id = auth.uid())
  );

drop policy if exists "member writes own progress" on progress;
create policy "member writes own progress"
  on progress for insert
  with check (
    member_id in (select id from members where auth_id = auth.uid())
  );

drop policy if exists "member updates own progress" on progress;
create policy "member updates own progress"
  on progress for update
  using (
    member_id in (select id from members where auth_id = auth.uid())
  )
  with check (
    member_id in (select id from members where auth_id = auth.uid())
  );


-- 4) PLUGINS (downloads): todo autenticado pode ler
--    (o filtro de plano é feito no client, ex: page.tsx de downloads).
alter table plugins enable row level security;

drop policy if exists "authenticated reads plugins" on plugins;
create policy "authenticated reads plugins"
  on plugins for select
  using (auth.role() = 'authenticated');

drop policy if exists "service role manages plugins" on plugins;
create policy "service role manages plugins"
  on plugins for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ============================================================
-- Checagem rápida: rode isso depois pra confirmar o que ficou ativo.
-- ============================================================
select schemaname, tablename, policyname, cmd
from pg_policies
where tablename in ('members', 'videos', 'progress', 'plugins')
order by tablename, cmd;
