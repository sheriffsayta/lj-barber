-- Reprise des clients existants ayant déjà renseigné une adresse e-mail.
update public.clients
set
  email_consentement = true,
  email_consentement_date = coalesce(email_consentement_date, now())
where nullif(trim(email), '') is not null
  and email_consentement is not true;
