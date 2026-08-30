"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/ui/Sidebar";

type Profile = {
  nom: string;
  role: "ADMIN" | "COIFFEUR";
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nombreClients, setNombreClients] = useState(0);
  const [nombrePrestations, setNombrePrestations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerDashboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/";
          return;
        }

        const [profilResult, clientsResult, prestationsResult] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("nom, role")
              .eq("user_id", user.id)
              .single(),

            supabase
              .from("clients")
              .select("id", {
                count: "exact",
                head: true,
              }),

            supabase
              .from("prestations")
              .select("id", {
                count: "exact",
                head: true,
              }),
          ]);

        if (profilResult.error || !profilResult.data) {
          console.error("Erreur profil :", profilResult.error);

          await supabase.auth.signOut();
          window.location.href = "/";
          return;
        }

        setProfile(profilResult.data);
        setNombreClients(clientsResult.count ?? 0);
        setNombrePrestations(prestationsResult.count ?? 0);

        if (clientsResult.error) {
          console.error(
            "Erreur compteur clients :",
            clientsResult.error
          );
        }

        if (prestationsResult.error) {
          console.error(
            "Erreur compteur prestations :",
            prestationsResult.error
          );
        }
      } catch (error) {
        console.error("Erreur dashboard :", error);
      } finally {
        setLoading(false);
      }
    }

    chargerDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const statistiques = [
    {
      emoji: "👥",
      titre: "Clients",
      valeur: nombreClients,
    },
    {
      emoji: "✂️",
      titre: "Prestations",
      valeur: nombrePrestations,
    },
    {
      emoji: "💬",
      titre: "SMS",
      valeur: 0,
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:p-10">
          <header className="mb-7 sm:mb-9 md:mb-10">
            <p className="text-sm text-gray-400">
              Tableau de bord
            </p>

            <h1 className="mt-2 break-words text-2xl font-bold sm:text-3xl">
              Bonjour {profile.nom} 👋
            </h1>

            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              {profile.role === "ADMIN"
                ? "👑 Administrateur"
                : "✂️ Coiffeur"}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {statistiques.map((statistique) => (
              <div
                key={statistique.titre}
                className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6"
              >
                <div className="text-3xl">
                  {statistique.emoji}
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  {statistique.titre}
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {statistique.valeur}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:mt-8 sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              Bienvenue dans LJ BARBER
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Cet espace permet de gérer les clients,
              les prestations et les communications du salon.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}