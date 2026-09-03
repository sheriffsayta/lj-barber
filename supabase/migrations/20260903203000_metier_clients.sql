-- Métier du client, disponible dans les fiches et à l'inscription.
alter table public.clients
  add column if not exists metier text;

create index if not exists clients_metier_idx
  on public.clients(metier);

drop function if exists public.inscrire_client(
  text, text, text, text, text, date, text, text, text, boolean, boolean, jsonb
);

create or replace function public.inscrire_client(
  p_prenom text,
  p_nom text,
  p_pseudo text,
  p_metier text,
  p_telephone text,
  p_email text,
  p_date_naissance date,
  p_sexe text,
  p_reseaux_sociaux text,
  p_notes text,
  p_sms_consentement boolean,
  p_email_consentement boolean,
  p_localisations jsonb default '[]'::jsonb
)
returns table(numero_client bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  nouveau_client public.clients;
begin
  if not public.est_client() then
    raise exception 'Accès non autorisé';
  end if;

  insert into public.clients (
    prenom, nom, pseudo, metier, telephone, email, date_naissance, sexe,
    categorie, reseaux_sociaux, notes,
    sms_consentement, sms_consentement_date,
    email_consentement, email_consentement_date
  ) values (
    nullif(trim(p_prenom), ''),
    nullif(trim(p_nom), ''),
    nullif(trim(p_pseudo), ''),
    nullif(trim(p_metier), ''),
    nullif(trim(p_telephone), ''),
    nullif(trim(p_email), ''),
    p_date_naissance,
    nullif(trim(p_sexe), ''),
    'Client',
    nullif(trim(p_reseaux_sociaux), ''),
    nullif(trim(p_notes), ''),
    coalesce(p_sms_consentement, false),
    case when coalesce(p_sms_consentement, false) then now() else null end,
    coalesce(p_email_consentement, false),
    case when coalesce(p_email_consentement, false) then now() else null end
  )
  returning * into nouveau_client;

  insert into public.client_localisations (client_id, pays, ville)
  select
    nouveau_client.id,
    trim(localisation ->> 'pays'),
    nullif(trim(localisation ->> 'ville'), '')
  from jsonb_array_elements(coalesce(p_localisations, '[]'::jsonb)) localisation
  where length(trim(coalesce(localisation ->> 'pays', ''))) > 0;

  return query select nouveau_client.numero_client;
end;
$$;

revoke all on function public.inscrire_client(
  text, text, text, text, text, text, date, text, text, text, boolean, boolean, jsonb
) from public;

grant execute on function public.inscrire_client(
  text, text, text, text, text, text, date, text, text, text, boolean, boolean, jsonb
) to authenticated;
