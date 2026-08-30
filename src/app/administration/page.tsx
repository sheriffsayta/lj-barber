"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/ui/Sidebar";

type Role = "ADMIN" | "COIFFEUR";

type Profile = {
  user_id: string;
  nom: string;
  role: Role;
};

export default function Administration() {
  const [profilActuel, setProfilActuel] =
    useState<Profile | null>(null);

  const [utilisateurs, setUtilisateurs] =
    useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [modification, setModification] =
    useState<string | null>(null);

  async function chargerUtilisateurs() {
    setErreur("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, nom, role");

    if (error) {
      console.error(error);

      setErreur(
        "Impossible de récupérer les utilisateurs."
      );

      return;
    }

    const profils = (data ?? []) as Profile[];

    const profil = profils.find(
      (item) => item.user_id === user.id
    );

    if (!profil || profil.role !== "ADMIN") {
      window.location.href = "/dashboard";
      return;
    }

    setProfilActuel(profil);
    setUtilisateurs(profils);
  }

  useEffect(() => {
    async function charger() {
      setLoading(true);

      await chargerUtilisateurs();

      setLoading(false);
    }

    charger();
  }, []);

  async function modifierRole(
    utilisateur: Profile
  ) {
    if (!profilActuel) {
      return;
    }

    if (
      utilisateur.user_id ===
      profilActuel.user_id
    ) {
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

    if (!confirmation) {
      return;
    }

    try {
      setModification(utilisateur.user_id);
      setErreur("");
      setMessage("");

      const { error } = await supabase
        .from("profiles")
        .update({
          role: nouveauRole,
        })
        .eq(
          "user_id",
          utilisateur.user_id
        );

      if (error) {
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
    } catch (error) {
      console.error(error);

      setErreur(
        "Une erreur est survenue."
      );
    } finally {
      setModification(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p className="text-center">
          Chargement de l'administration...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">

      <div className="min-h-screen md:flex">

        <Sidebar />

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:p-10">

          {/* ======================================================
              EN-TÊTE
          ====================================================== */}

          <header className="mb-7 sm:mb-9 md:mb-10">

            <p className="text-sm text-gray-400">
              Gestion du système
            </p>

            <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl md:text-4xl">
              🔐 Administration
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Gestion des utilisateurs et des droits d'accès.
            </p>

          </header>


          {/* ======================================================
              MESSAGES
          ====================================================== */}

          {erreur && (
            <div className="mb-6 rounded-xl border border-red-900 bg-red-950 p-4 text-sm leading-6 text-red-300">
              {erreur}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-green-900 bg-green-950 p-4 text-sm leading-6 text-green-300">
              {message}
            </div>
          )}


          {/* ======================================================
              UTILISATEURS
          ====================================================== */}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

            <div className="border-b border-gray-800 p-5 sm:p-6">

              <h2 className="text-lg font-semibold sm:text-xl">
                Utilisateurs
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-400">
                Gérez les rôles des utilisateurs de LJ BARBER.
              </p>

            </div>


            <div className="divide-y divide-gray-800">

              {utilisateurs.map(
                (utilisateur) => (
                  <div
                    key={utilisateur.user_id}
                    className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between"
                  >

                    {/* INFORMATIONS UTILISATEUR */}

                    <div className="min-w-0">

                      <p className="break-words font-medium">
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


                    {/* ROLE + BOUTON */}

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">

                      <span
                        className={
                          utilisateur.role === "ADMIN"
                            ? "w-fit rounded-full bg-purple-950 px-3 py-2 text-sm text-purple-300"
                            : "w-fit rounded-full bg-gray-800 px-3 py-2 text-sm text-gray-300"
                        }
                      >
                        {utilisateur.role === "ADMIN"
                          ? "👑 ADMIN"
                          : "✂️ COIFFEUR"}
                      </span>


                      {utilisateur.user_id !==
                        profilActuel?.user_id && (
                        <button
                          onClick={() => {
                            modifierRole(
                              utilisateur
                            );
                          }}
                          disabled={
                            modification ===
                            utilisateur.user_id
                          }
                          className="min-h-11 w-full rounded-xl border border-gray-700 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50 sm:w-auto"
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
              DROITS DU COIFFEUR
          ====================================================== */}

          <div className="mt-6 min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6 md:p-7">

            <h2 className="text-lg font-semibold sm:text-xl">
              Droits du coiffeur
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
              Les droits détaillés seront configurables ici.
              Pour le moment, le rôle COIFFEUR ne peut pas
              modifier les comptes ou les rôles.
            </p>


            <div className="mt-6 space-y-3">


              {/* GESTION CLIENTS */}

              <div className="flex flex-col gap-3 rounded-xl border border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="font-medium">
                    Gestion des clients
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Voir, ajouter et modifier les clients.
                  </p>

                </div>

                <span className="w-fit shrink-0 rounded-full bg-green-950 px-3 py-2 text-sm text-green-400">
                  🟢 Actif
                </span>

              </div>


              {/* GESTION PRESTATIONS */}

              <div className="flex flex-col gap-3 rounded-xl border border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="font-medium">
                    Gestion des prestations
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Voir, ajouter et modifier les prestations.
                  </p>

                </div>

                <span className="w-fit shrink-0 rounded-full bg-green-950 px-3 py-2 text-sm text-green-400">
                  🟢 Actif
                </span>

              </div>


              {/* GESTION UTILISATEURS */}

              <div className="flex flex-col gap-3 rounded-xl border border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="font-medium">
                    Gestion des utilisateurs
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Modifier les rôles et les droits.
                  </p>

                </div>

                <span className="w-fit shrink-0 rounded-full bg-red-950 px-3 py-2 text-sm text-red-400">
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