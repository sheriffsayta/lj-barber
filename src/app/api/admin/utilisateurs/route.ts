import { createClient } from "@supabase/supabase-js";

import { estRole, type Role } from "@/lib/roles";

type Profil = {
  user_id: string;
  nom: string;
  role: Role;
  created_at: string;
};

type SupabaseAdmin = ReturnType<typeof clientAdministrateur>;

type Autorisation =
  | { erreur: string; status: number }
  | { supabaseAdmin: SupabaseAdmin; utilisateurActuel: { id: string }; profil: Profil };

function reponseErreur(erreur: string, status = 400) {
  return Response.json({ erreur }, { status });
}

function texteValide(valeur: unknown, minimum: number): valeur is string {
  return typeof valeur === "string" && valeur.trim().length >= minimum;
}

function uuidValide(valeur: unknown): valeur is string {
  return typeof valeur === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valeur);
}

function clientAdministrateur() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cleSecrete = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !cleSecrete) {
    throw new Error("La clé serveur Supabase n'est pas configurée.");
  }

  return createClient(url, cleSecrete, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function verifierAdministrateur(request: Request): Promise<Autorisation> {
  const jeton = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!jeton) {
    return { erreur: "Session manquante.", status: 401 };
  }

  const supabaseAdmin = clientAdministrateur();
  const { data: { user }, error: erreurUtilisateur } = await supabaseAdmin.auth.getUser(jeton);

  if (erreurUtilisateur || !user) {
    return { erreur: "Session invalide.", status: 401 };
  }

  const { data: profil, error: erreurProfil } = await supabaseAdmin
    .from("profiles")
    .select("user_id, nom, role, created_at")
    .eq("user_id", user.id)
    .single();

  if (erreurProfil || profil?.role !== "ADMIN") {
    return { erreur: "Accès administrateur requis.", status: 403 };
  }

  return { supabaseAdmin, utilisateurActuel: user, profil: profil as Profil };
}

async function utilisateursAvecProfils(supabaseAdmin: ReturnType<typeof clientAdministrateur>) {
  const [{ data: profils, error: erreurProfils }, { data: authData, error: erreurAuth }] = await Promise.all([
    supabaseAdmin.from("profiles").select("user_id, nom, role, created_at").order("created_at"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  ]);

  if (erreurProfils || erreurAuth) {
    throw new Error("Impossible de récupérer les comptes.");
  }

  const emails = new Map(authData.users.map((user) => [user.id, user.email ?? ""]));

  return (profils as Profil[]).map((profil) => ({
    userId: profil.user_id,
    nom: profil.nom,
    role: profil.role,
    email: emails.get(profil.user_id) ?? "",
    createdAt: profil.created_at
  }));
}

export async function GET(request: Request) {
  try {
    const autorisation = await verifierAdministrateur(request);

    if ("erreur" in autorisation) {
      return reponseErreur(autorisation.erreur, autorisation.status);
    }

    return Response.json({
      utilisateurs: await utilisateursAvecProfils(autorisation.supabaseAdmin),
      utilisateurActuelId: autorisation.utilisateurActuel.id
    });
  } catch (error) {
    console.error("Administration utilisateurs GET :", error);
    return reponseErreur("Le service d'administration n'est pas disponible.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const autorisation = await verifierAdministrateur(request);

    if ("erreur" in autorisation) {
      return reponseErreur(autorisation.erreur, autorisation.status);
    }

    const donnees = await request.json() as Record<string, unknown>;
    const { supabaseAdmin, utilisateurActuel } = autorisation;

    if (donnees.action === "creer") {
      if (!texteValide(donnees.nom, 2) || !texteValide(donnees.email, 3) || !texteValide(donnees.motDePasse, 8) || !estRole(donnees.role)) {
        return reponseErreur("Renseignez un nom, un e-mail, un mot de passe de 8 caractères et un rôle valide.");
      }

      const { data: creation, error: erreurCreation } = await supabaseAdmin.auth.admin.createUser({
        email: donnees.email.trim().toLowerCase(),
        password: donnees.motDePasse,
        email_confirm: true
      });

      if (erreurCreation || !creation.user) {
        return reponseErreur(erreurCreation?.message ?? "Impossible de créer ce compte.");
      }

      const { error: erreurProfil } = await supabaseAdmin.from("profiles").insert({
        user_id: creation.user.id,
        nom: donnees.nom.trim(),
        role: donnees.role
      });

      if (erreurProfil) {
        await supabaseAdmin.auth.admin.deleteUser(creation.user.id);
        return reponseErreur("Le compte n'a pas pu être finalisé.");
      }

      return Response.json({
        utilisateur: {
          userId: creation.user.id,
          nom: donnees.nom.trim(),
          role: donnees.role,
          email: creation.user.email ?? "",
          createdAt: new Date().toISOString()
        }
      });
    }

    if (donnees.action === "modifier") {
      if (!uuidValide(donnees.userId) || !texteValide(donnees.nom, 2) || !estRole(donnees.role)) {
        return reponseErreur("Les informations du compte sont invalides.");
      }

      const { data: cible, error: erreurCible } = await supabaseAdmin
        .from("profiles")
        .select("user_id, role, created_at")
        .eq("user_id", donnees.userId)
        .single();

      if (erreurCible || !cible) {
        return reponseErreur("Compte introuvable.", 404);
      }

      if (donnees.userId === utilisateurActuel.id && donnees.role !== "ADMIN") {
        return reponseErreur("Vous ne pouvez pas retirer votre propre rôle administrateur.");
      }

      if (cible.role === "ADMIN" && donnees.role !== "ADMIN") {
        const { count, error: erreurComptage } = await supabaseAdmin
          .from("profiles")
          .select("user_id", { count: "exact", head: true })
          .eq("role", "ADMIN");

        if (erreurComptage || (count ?? 0) <= 1) {
          return reponseErreur("Conservez au moins un administrateur actif.");
        }
      }

      const { error: erreurModification } = await supabaseAdmin
        .from("profiles")
        .update({ nom: donnees.nom.trim(), role: donnees.role })
        .eq("user_id", donnees.userId);

      if (erreurModification) {
        return reponseErreur("Impossible d'enregistrer les modifications.");
      }

      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(donnees.userId);

      return Response.json({
        utilisateur: {
          userId: donnees.userId,
          nom: donnees.nom.trim(),
          role: donnees.role,
          email: authData.user?.email ?? "",
          createdAt: cible.created_at
        }
      });
    }

    if (donnees.action === "mot_de_passe") {
      if (!uuidValide(donnees.userId) || !texteValide(donnees.motDePasse, 8)) {
        return reponseErreur("Le mot de passe doit contenir au moins 8 caractères.");
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(donnees.userId, {
        password: donnees.motDePasse
      });

      if (error) {
        return reponseErreur(error.message);
      }

      return Response.json({ ok: true });
    }

    return reponseErreur("Action inconnue.");
  } catch (error) {
    console.error("Administration utilisateurs POST :", error);
    return reponseErreur("Une erreur est survenue lors de la gestion du compte.", 500);
  }
}
