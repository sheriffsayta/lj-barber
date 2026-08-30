"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/ui/Sidebar";

type Profile =
{
  nom: string;
  role: "ADMIN" | "COIFFEUR";
};

export default function Dashboard()
{
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [nombreClients, setNombreClients] =
    useState(0);

  const [nombrePrestations, setNombrePrestations] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() =>
  {
    async function chargerDashboard()
    {
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
        data: profileData,
        error: profileError
      } = await supabase
        .from("profiles")
        .select("nom, role")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData)
      {
        console.error(
          "Erreur profil :",
          profileError
        );

        await supabase.auth.signOut();

        window.location.href = "/";
        return;
      }

      setProfile(profileData);

      const
      {
        count: clientsCount,
        error: clientsError
      } = await supabase
        .from("clients")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );

      if (clientsError)
      {
        console.error(
          "Erreur compteur clients :",
          clientsError
        );
      }
      else
      {
        setNombreClients(
          clientsCount ?? 0
        );
      }

      const
      {
        count: prestationsCount,
        error: prestationsError
      } = await supabase
        .from("prestations")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );

      if (prestationsError)
      {
        console.error(
          "Erreur compteur prestations :",
          prestationsError
        );
      }
      else
      {
        setNombrePrestations(
          prestationsCount ?? 0
        );
      }

      setLoading(false);
    }

    chargerDashboard();
  }, []);

  if (loading)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p className="text-center">
          Chargement...
        </p>
      </main>
    );
  }

  if (!profile)
  {
    return null;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">

      <Sidebar />

      <section className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:ml-64 md:p-10">

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

          <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

            <div className="text-3xl">
              👥
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Clients
            </p>

            <p className="mt-1 text-3xl font-bold">
              {nombreClients}
            </p>

          </div>


          <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

            <div className="text-3xl">
              ✂️
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Prestations
            </p>

            <p className="mt-1 text-3xl font-bold">
              {nombrePrestations}
            </p>

          </div>


          <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

            <div className="text-3xl">
              💬
            </div>

            <p className="mt-4 text-sm text-gray-400">
              SMS
            </p>

            <p className="mt-1 text-3xl font-bold">
              0
            </p>

          </div>

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

    </main>
  );
}