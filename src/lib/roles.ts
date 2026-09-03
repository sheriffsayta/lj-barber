export const ROLES = ["ADMIN", "COIFFEUR", "CLIENT"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_DETAILS: Record<Role, { libelle: string; description: string }> = {
  ADMIN: {
    libelle: "Administrateur",
    description: "Accès complet, y compris à la gestion des comptes."
  },
  COIFFEUR: {
    libelle: "Coiffeur",
    description: "Accès aux clients et aux outils du salon, sans gestion des comptes."
  },
  CLIENT: {
    libelle: "Inscription client",
    description: "Accès uniquement au formulaire d'inscription client."
  }
};

export function estRole(valeur: unknown): valeur is Role {
  return typeof valeur === "string" && ROLES.includes(valeur as Role);
}
