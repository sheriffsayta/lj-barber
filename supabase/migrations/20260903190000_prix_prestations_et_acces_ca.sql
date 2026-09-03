-- Prix des prestations et permission financière configurable par compte.
alter table public.prestations
  add column if not exists prix numeric(10, 2);

alter table public.prestations
  drop constraint if exists prestations_prix_check;

alter table public.prestations
  add constraint prestations_prix_check
  check (prix is null or prix >= 0);

alter table public.profiles
  add column if not exists acces_chiffre_affaires boolean not null default false;

update public.profiles
set acces_chiffre_affaires = true
where role in ('ADMIN', 'COIFFEUR');

create or replace function public.peut_gerer_prestations()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and acces_chiffre_affaires = true
      and role <> 'CLIENT'
  );
$$;

drop policy if exists "Utilisateurs authentifies peuvent voir les prestations"
on public.prestations;
drop policy if exists "Utilisateurs authentifies peuvent creer des prestations"
on public.prestations;
drop policy if exists "Utilisateurs authentifies peuvent modifier les prestations"
on public.prestations;
drop policy if exists "Utilisateurs authentifies peuvent supprimer les prestations"
on public.prestations;
drop policy if exists "ADMIN peut supprimer les prestations"
on public.prestations;

create policy "Comptes autorises peuvent voir les prestations"
on public.prestations for select to authenticated
using (public.peut_gerer_prestations());

create policy "Comptes autorises peuvent creer des prestations"
on public.prestations for insert to authenticated
with check (public.peut_gerer_prestations());

create policy "Comptes autorises peuvent modifier les prestations"
on public.prestations for update to authenticated
using (public.peut_gerer_prestations())
with check (public.peut_gerer_prestations());

create policy "Comptes autorises peuvent supprimer les prestations"
on public.prestations for delete to authenticated
using (public.peut_gerer_prestations());
