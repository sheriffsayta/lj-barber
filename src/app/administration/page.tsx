"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/ui/Sidebar";

type Role = "ADMIN" | "COIFFEUR";

type Profile =
{
  user_id: string;
  nom: string;
  role: Role;
};

export default function Administration()
{
  const [profilActuel, setProfilActuel] =
    useState<Profile | null>(null);

  const [utilisateurs, setUtilisateurs] =
    useState<Profile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [erreur, setErreur] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [modification, setModification] =
    useState<string | null>(null);


  // ============================================================
  // CHARGER LES UTILISATEURS
  // ============================================================

  async function chargerUtilisateurs()
  {
    setErreur("");

    const
    {
      data:
      {
        user
      }
    } = await supabase.auth.getUser();

    if (!user)
    {
      window.location.href = "/";
      return;
    }

    const
    {
      data,
      error
    } = await supabase
      .from("profiles")
      .select("user_id, nom, role");

    if (error)
    {
      console.error(error);

      setErreur(
        "Impossible de récupérer les utilisateurs."
      );

      return;
    }

    const profils = (data ?? []) as Profile[];

    const profil = profils.find(
      (item) =>
        item.user_id === user.id
    );

    if (!profil || profil.role !== "ADMIN")
    {
      window.location.href = "/dashboard";
      return;
    }

    setProfilActuel(profil);
    setUtilisateurs(profils);
  }


  // ============================================================
  // CHARGEMENT
  // ============================================================

  useEffect(() =>
  {
    async function charger()
    {
      setLoading(true);

      await chargerUtilisateurs();

      setLoading(false);
    }

    charger();
  }, []);


  // ============================================================
  // MODIFIER LE ROLE
  // ============================================================

  async function modifierRole(
    utilisateur: Profile
  )
  {
    if (!profilActuel)
    {
      return;
    }

    // Impossible de modifier son propre rôle
    if (
      utilisateur.user_id ===
      profilActuel.user_id
    )
    {
      setErreur(
        "Vous ne pouvez pas modifier votre propre rôle."
      );

      return;
    }

    const nouveauRole: Role =
      utilisateur.role === "ADMIN"
        ? "COIFFEUR"
        : "ADMIN";

    const confirmation = window.confirm(
      `Changer le rôle de ${utilisateur.nom} en ${nouveauRole} ?`
    );

    if (!confirmation)
    {
      return;
    }

    try
    {
      setModification(
        utilisateur.user_id
      );

      setErreur("");
      setMessage("");

      const
      {
        error
      } = await supabase
        .from("profiles")
        .update(
          {
            role: nouveauRole
          }
        )
        .eq(
          "user_id",
          utilisateur.user_id
        );

      if (error)
      {
        console.error(error);

        setErreur(
          "Impossible de modifier le rôle. Vérifiez vos permissions."
        );

        return;
      }

      setMessage(
        `Le rôle de ${utilisateur.nom} a été modifié.`
      );

      await chargerUtilisateurs();
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Une erreur est survenue."
      );
    }
    finally
    {
      setModification(null);
    }
  }


  // ============================================================
  // AFFICHAGE CHARGEMENT
  // ============================================================

  if (loading)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">

        <p>
          Chargement de l'administration...
        </p>

      </main>
    );
  }


  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <div className="flex min-h-screen">

        <Sidebar />

        <section className="flex-1 p-6 md:p-10">

          {/* ======================================================
              EN-TÊTE
          ====================================================== */}

          <header className="mb-8">

            <p className="text-sm text-gray-400">
              Gestion du système
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              🔐 Administration
            </h1>

            <p className="mt-2 text-gray-400">
              Gestion des utilisateurs et des droits d'accès.
            </p>

          </header>


          {/* ======================================================
              MESSAGES
          ====================================================== */}

          {erreur && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950 p-4 text-red-300">
              {erreur}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-lg border border-green-900 bg-green-950 p-4 text-green-300">
              {message}
            </div>
          )}


          {/* ======================================================
              UTILISATEURS
          ====================================================== */}

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

            <div className="border-b border-gray-800 p-6">

              <h2 className="text-xl font-semibold">
                Utilisateurs
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Gérez les rôles des utilisateurs de LJ BARBER.
              </p>

            </div>


            <div className="divide-y divide-gray-800">

              {utilisateurs.map(
                (utilisateur) =>
                (
                  <div
                    key={utilisateur.user_id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >

                    <div>

                      <p className="font-medium">
                        {utilisateur.nom}

                        {utilisateur.user_id ===
                          profilActuel?.user_id && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Vous)
                          </span>
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {utilisateur.role === "ADMIN"
                          ? "Administrateur"
                          : "Coiffeur"}
                      </p>

                    </div>


                    <div className="flex items-center gap-3">

                      <span
                        className={
                          utilisateur.role === "ADMIN"
                            ? "rounded-full bg-purple-950 px-3 py-1 text-sm text-purple-300"
                            : "rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                        }
                      >
                        {utilisateur.role === "ADMIN"
                          ? "👑 ADMIN"
                          : "✂️ COIFFEUR"}
                      </span>


                      {utilisateur.user_id !==
                        profilActuel?.user_id && (
                        <button
                          onClick={() =>
                          {
                            modifierRole(
                              utilisateur
                            );
                          }}
                          disabled={
                            modification ===
                            utilisateur.user_id
                          }
                          className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                        >
                          {modification ===
                            utilisateur.user_id
                            ? "Modification..."
                            : utilisateur.role === "ADMIN"
                              ? "Passer COIFFEUR"
                              : "Passer ADMIN"}
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>


          {/* ======================================================
              DROITS
          ====================================================== */}

          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <h2 className="text-xl font-semibold">
              Droits du coiffeur
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Les droits détaillés seront configurables ici.
              Pour le moment, le rôle COIFFEUR ne peut pas
              modifier les comptes ou les rôles.
            </p>


            <div className="mt-6 space-y-3">

              <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4">

                <div>
                  <p className="font-medium">
                    Gestion des clients
                  </p>

                  <p className="text-sm text-gray-500">
                    Voir, ajouter et modifier les clients.
                  </p>
                </div>

                <span className="rounded-full bg-green-950 px-3 py-1 text-sm text-green-400">
                  🟢 Actif
                </span>

              </div>


              <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4">

                <div>
                  <p className="font-medium">
                    Gestion des prestations
                  </p>

                  <p className="text-sm text-gray-500">
                    Voir, ajouter et modifier les prestations.
                  </p>

                </div>

                <span className="rounded-full bg-green-950 px-3 py-1 text-sm text-green-400">
                  🟢 Actif
                </span>

              </div>


              <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4">

                <div>
                  <p className="font-medium">
                    Gestion des utilisateurs
                  </p>

                  <p className="text-sm text-gray-500">
                    Modifier les rôles et les droits.
                  </p>

                </div>

                <span className="rounded-full bg-red-950 px-3 py-1 text-sm text-red-400">
                  🔴 Désactivé
                </span>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}