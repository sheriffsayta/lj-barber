import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/roles";

export type UtilisateurAdministration = {
  userId: string;
  nom: string;
  role: Role;
  email: string;
  createdAt: string;
};

type ReponseApi<T> = T & { erreur?: string };

async function appelerAdministration<T>(
  method: "GET" | "POST",
  corps?: Record<string, unknown>
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
  }

  const reponse = await fetch("/api/admin/utilisateurs", {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(corps ? { "Content-Type": "application/json" } : {})
    },
    ...(corps ? { body: JSON.stringify(corps) } : {})
  });

  const donnees = await reponse.json() as ReponseApi<T>;

  if (!reponse.ok) {
    throw new Error(donnees.erreur ?? "Une erreur est survenue.");
  }

  return donnees;
}

export async function recupererUtilisateursAdministration() {
  const reponse = await appelerAdministration<{
    utilisateurs: UtilisateurAdministration[];
    utilisateurActuelId: string;
  }>("GET");

  return reponse;
}

export async function creerUtilisateurAdministration(donnees: {
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
}) {
  return appelerAdministration<{ utilisateur: UtilisateurAdministration }>("POST", {
    action: "creer",
    ...donnees
  });
}

export async function modifierUtilisateurAdministration(donnees: {
  userId: string;
  nom: string;
  email: string;
  role: Role;
}) {
  return appelerAdministration<{ utilisateur: UtilisateurAdministration }>("POST", {
    action: "modifier",
    ...donnees
  });
}

export async function modifierMotDePasseUtilisateur(donnees: {
  userId: string;
  motDePasse: string;
}) {
  return appelerAdministration<{ ok: true }>("POST", {
    action: "mot_de_passe",
    ...donnees
  });
}
