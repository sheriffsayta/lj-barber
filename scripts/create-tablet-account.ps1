param(
  [string]$Email = "Client@ljbarber.fr"
)

$projet = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projet ".env.local"
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

function Get-EnvValue([string]$Name) {
  $line = Get-Content -LiteralPath $envFile |
    Where-Object { $_ -match "^\s*$Name\s*=" } |
    Select-Object -First 1
  if (!$line) { throw "Variable manquante : $Name" }
  return ($line -replace "^\s*$Name\s*=\s*", "").Trim('"', "'")
}

$url = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
$serviceKey = Get-EnvValue "SUPABASE_SERVICE_ROLE_KEY"
$dbUrl = Get-EnvValue "SUPABASE_DB_URL"
$password = Read-Host "Mot de passe du compte tablette" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

try {
  $body = @{ email = $Email; password = $plainPassword; email_confirm = $true } |
    ConvertTo-Json
  $headers = @{ Authorization = "Bearer $serviceKey"; apikey = $serviceKey }
  $user = Invoke-RestMethod -Method Post -Uri "$url/auth/v1/admin/users" `
    -Headers $headers -ContentType "application/json" -Body $body `
    -UserAgent "LJBarberAdminScript/1.0"

  $userId = $user.id
  & $psql $dbUrl --set=ON_ERROR_STOP=1 --quiet -c "insert into public.profiles (user_id, nom, role) values ('$userId', 'Inscription client', 'CLIENT') on conflict (user_id) do update set nom = excluded.nom, role = excluded.role;"
  if ($LASTEXITCODE -ne 0) { throw "Le profil CLIENT n'a pas pu être créé." }

  Write-Host "Compte tablette créé : $Email"
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  $plainPassword = $null
}
