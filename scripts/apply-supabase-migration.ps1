param(
  [Parameter(Mandatory = $true)]
  [string]$Migration
)

$projet = Split-Path -Parent $PSScriptRoot
$migrations = Join-Path $projet "supabase\migrations"
$fichierEnv = Join-Path $projet ".env.local"
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (!(Test-Path -LiteralPath $psql)) {
  throw "psql est introuvable. Installez PostgreSQL 17."
}

$cheminMigration = (Resolve-Path -LiteralPath $Migration).Path
if (!$cheminMigration.StartsWith($migrations, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "La migration doit être située dans supabase/migrations."
}

if (!(Test-Path -LiteralPath $fichierEnv)) {
  throw ".env.local est introuvable."
}

$ligneConnexion = Get-Content -LiteralPath $fichierEnv |
  Where-Object { $_ -match '^\s*SUPABASE_DB_URL\s*=' } |
  Select-Object -First 1

if (!$ligneConnexion) {
  throw "Ajoutez SUPABASE_DB_URL à .env.local avant d'appliquer une migration."
}

$connexion = ($ligneConnexion -replace '^\s*SUPABASE_DB_URL\s*=\s*', '').Trim('"', "'")
$identifiant = [System.IO.Path]::GetFileNameWithoutExtension($cheminMigration)

& $psql $connexion --set=ON_ERROR_STOP=1 --quiet -c @"
create table if not exists public.lj_barber_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);
"@

if ($LASTEXITCODE -ne 0) {
  throw "Impossible de préparer l'historique des migrations."
}

$dejaAppliquee = & $psql $connexion --tuples-only --no-align --quiet -c "select exists (select 1 from public.lj_barber_migrations where id = '$identifiant');"
if ($LASTEXITCODE -ne 0) {
  throw "Impossible de vérifier l'historique des migrations."
}

if ($dejaAppliquee.Trim() -eq "t") {
  Write-Host "Migration déjà appliquée : $identifiant"
  exit 0
}

& $psql $connexion --set=ON_ERROR_STOP=1 --single-transaction `
  -f $cheminMigration `
  -c "insert into public.lj_barber_migrations (id) values ('$identifiant');"

if ($LASTEXITCODE -ne 0) {
  throw "La migration a échoué : aucune modification de cette migration n'a été validée."
}

Write-Host "Migration appliquée : $identifiant"
