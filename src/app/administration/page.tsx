"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  creerUtilisateurAdministration,
  modifierMotDePasseUtilisateur,
  modifierUtilisateurAdministration,
  recupererUtilisateursAdministration,
  type UtilisateurAdministration
} from "@/lib/admin-users";
import { ROLE_DETAILS, ROLES, type Role } from "@/lib/roles";
import Sidebar from "@/ui/Sidebar";
import RoleGuard from "@/ui/auth/RoleGuard";

type Edition = Pick<UtilisateurAdministration, "nom" | "role">;

const formulaireInitial = {
  nom: "",
  email: "",
  motDePasse: "",
  role: "COIFFEUR" as Role
};

function classRole(role: Role) {
  return role === "ADMIN"
    ? "bg-purple-950 text-purple-300"
    : role === "CLIENT"
      ? "bg-blue-950 text-blue-300"
      : "bg-gray-800 text-gray-300";
}

function AdministrationContent() {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAdministration[]>([]);
  const [utilisateurActuelId, setUtilisateurActuelId] = useState("");
  const [editions, setEditions] = useState<Record<string, Edition>>({});
  const [formulaire, setFormulaire] = useState(formulaireInitial);
  const [motsDePasse, setMotsDePasse] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  function preparerEditions(profils: UtilisateurAdministration[]) {
    setEditions(Object.fromEntries(profils.map((profil) => [profil.userId, {
      nom: profil.nom,
      role: profil.role
    }])));
  }

  const chargerUtilisateurs = useCallback(async () => {
    const donnees = await recupererUtilisateursAdministration();
    setUtilisateurs(donnees.utilisateurs);
    setUtilisateurActuelId(donnees.utilisateurActuelId);
    preparerEditions(donnees.utilisateurs);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await chargerUtilisateurs();
      } catch (cause) {
        setErreur(cause instanceof Error ? cause.message : "Impossible de charger les comptes.");
      } finally {
        setChargement(false);
      }
    })();
  }, [chargerUtilisateurs]);

  function afficherMessage(nouveauMessage: string) {
    setErreur("");
    setMessage(nouveauMessage);
  }

  async function creerCompte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionEnCours("creation");
    setErreur("");
    setMessage("");

    try {
      await creerUtilisateurAdministration(formulaire);
      setFormulaire(formulaireInitial);
      await chargerUtilisateurs();
      afficherMessage("Le compte a été créé.");
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible de créer le compte.");
    } finally {
      setActionEnCours(null);
    }
  }

  async function enregistrerUtilisateur(utilisateur: UtilisateurAdministration) {
    const edition = editions[utilisateur.userId];

    if (!edition) {
      return;
    }

    setActionEnCours(`profil-${utilisateur.userId}`);
    setErreur("");
    setMessage("");

    try {
      await modifierUtilisateurAdministration({ userId: utilisateur.userId, ...edition });
      await chargerUtilisateurs();
      afficherMessage(`Le compte ${edition.nom} a été mis à jour.`);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible de modifier ce compte.");
    } finally {
      setActionEnCours(null);
    }
  }

  async function changerMotDePasse(utilisateur: UtilisateurAdministration) {
    const motDePasse = motsDePasse[utilisateur.userId] ?? "";

    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setActionEnCours(`mot-de-passe-${utilisateur.userId}`);
    setErreur("");
    setMessage("");

    try {
      await modifierMotDePasseUtilisateur({ userId: utilisateur.userId, motDePasse });
      setMotsDePasse((valeurs) => ({ ...valeurs, [utilisateur.userId]: "" }));
      afficherMessage(`Le mot de passe de ${utilisateur.nom} a été modifié.`);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Impossible de modifier le mot de passe.");
    } finally {
      setActionEnCours(null);
    }
  }

  if (chargement) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">Chargement de l&apos;administration...</main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">
      <div className="min-h-screen md:flex">
        <Sidebar />

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:p-10">
          <header className="mb-8">
            <p className="text-sm text-gray-400">Gestion du système</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl md:text-4xl">Administration</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Créez et gérez les accès au salon depuis un seul endroit.
            </p>
          </header>

          {erreur && <p role="alert" className="mb-6 rounded-xl border border-red-900 bg-red-950 p-4 text-sm text-red-300">{erreur}</p>}
          {message && <p className="mb-6 rounded-xl border border-green-900 bg-green-950 p-4 text-sm text-green-300">{message}</p>}

          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">Ajouter un compte</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">Le mot de passe doit contenir au moins 8 caractères.</p>

            <form onSubmit={creerCompte} className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm">Nom du compte
                <input required minLength={2} value={formulaire.nom} onChange={(event) => setFormulaire({ ...formulaire, nom: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <label className="text-sm">E-mail de connexion
                <input required type="email" autoComplete="email" value={formulaire.email} onChange={(event) => setFormulaire({ ...formulaire, email: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <label className="text-sm">Mot de passe temporaire
                <input required minLength={8} type="password" autoComplete="new-password" value={formulaire.motDePasse} onChange={(event) => setFormulaire({ ...formulaire, motDePasse: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <label className="text-sm">Rôle et droits
                <select value={formulaire.role} onChange={(event) => setFormulaire({ ...formulaire, role: event.target.value as Role })} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2">
                  {ROLES.map((role) => <option key={role} value={role}>{ROLE_DETAILS[role].libelle}</option>)}
                </select>
              </label>
              <p className="text-sm text-gray-400 md:col-span-2">{ROLE_DETAILS[formulaire.role].description}</p>
              <button disabled={actionEnCours === "creation"} className="min-h-11 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-50 md:w-fit">
                {actionEnCours === "creation" ? "Création..." : "Créer le compte"}
              </button>
            </form>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 p-5 sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">Comptes et droits</h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">Un rôle définit les droits d&apos;accès : ADMIN, COIFFEUR ou inscription client.</p>
            </div>

            <div className="divide-y divide-gray-800">
              {utilisateurs.map((utilisateur) => {
                const edition = editions[utilisateur.userId];
                const estCompteActuel = utilisateur.userId === utilisateurActuelId;

                return (
                  <article key={utilisateur.userId} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{utilisateur.email || "E-mail non disponible"}</p>
                      <p className="mt-1 text-sm text-gray-500">{estCompteActuel ? "Votre compte" : "Compte utilisateur"}</p>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-2 text-sm ${classRole(utilisateur.role)}`}>{ROLE_DETAILS[utilisateur.role].libelle}</span>
                      <p className="mt-2 text-sm leading-5 text-gray-400">{ROLE_DETAILS[edition?.role ?? utilisateur.role].description}</p>
                    </div>

                    <div className="grid gap-3">
                      <label className="text-sm">Nom affiché
                        <input value={edition?.nom ?? ""} onChange={(event) => setEditions((valeurs) => ({ ...valeurs, [utilisateur.userId]: { nom: event.target.value, role: edition?.role ?? utilisateur.role } }))} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2" />
                      </label>
                      <label className="text-sm">Rôle et droits
                        <select disabled={estCompteActuel} value={edition?.role ?? utilisateur.role} onChange={(event) => setEditions((valeurs) => ({ ...valeurs, [utilisateur.userId]: { nom: edition?.nom ?? utilisateur.nom, role: event.target.value as Role } }))} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2 disabled:opacity-50">
                          {ROLES.map((role) => <option key={role} value={role}>{ROLE_DETAILS[role].libelle}</option>)}
                        </select>
                      </label>
                      {estCompteActuel && <p className="text-xs text-gray-500">Pour votre sécurité, vous ne pouvez pas retirer votre propre rôle administrateur.</p>}
                      <button type="button" disabled={actionEnCours === `profil-${utilisateur.userId}`} onClick={() => void enregistrerUtilisateur(utilisateur)} className="min-h-11 rounded-xl border border-gray-700 px-4 py-3 text-sm hover:bg-gray-800 disabled:opacity-50">
                        {actionEnCours === `profil-${utilisateur.userId}` ? "Enregistrement..." : "Enregistrer le compte"}
                      </button>
                      <label className="text-sm">Nouveau mot de passe
                        <input minLength={8} type="password" autoComplete="new-password" value={motsDePasse[utilisateur.userId] ?? ""} onChange={(event) => setMotsDePasse((valeurs) => ({ ...valeurs, [utilisateur.userId]: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:ring-2" />
                      </label>
                      <button type="button" disabled={actionEnCours === `mot-de-passe-${utilisateur.userId}`} onClick={() => void changerMotDePasse(utilisateur)} className="min-h-11 rounded-xl border border-gray-700 px-4 py-3 text-sm hover:bg-gray-800 disabled:opacity-50">
                        {actionEnCours === `mot-de-passe-${utilisateur.userId}` ? "Modification..." : "Modifier le mot de passe"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export default function Administration() {
  return <RoleGuard roles={["ADMIN"]}><AdministrationContent /></RoleGuard>;
}
