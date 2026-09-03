# Migrations Supabase sans Docker

Les migrations sont appliquées avec PostgreSQL (`psql`) et conservées dans
`public.lj_barber_migrations`.

1. Ajoutez `SUPABASE_DB_URL` dans `.env.local` avec la chaîne de connexion
   **Session pooler** fournie par Supabase.
2. Créez chaque migration avec un nom unique au format
   `YYYYMMDDHHMMSS_description.sql`.
3. Lancez :

   ```powershell
   .\scripts\apply-supabase-migration.ps1 .\supabase\migrations\YYYYMMDDHHMMSS_description.sql
   ```

Le script exécute chaque migration dans une transaction et ne l'applique pas
deux fois.
