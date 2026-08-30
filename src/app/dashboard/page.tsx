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


      // ============================================================
      // PROFIL
      // ============================================================

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


      // ============================================================
      // NOMBRE DE CLIENTS
      // ============================================================

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


      // ============================================================
      // NOMBRE DE PRESTATIONS
      // ============================================================

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
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">

        <p>
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
    <main className="min-h-screen bg-gray-950 text-white">

      <div className="flex min-h-screen">

        <Sidebar />

        <section className="flex-1 p-6 md:p-10">


          {/* ========================================================
              EN-TÊTE
          ======================================================== */}

          <header className="mb-10">

            <p className="text-sm text-gray-400">
              Tableau de bord
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Bonjour {profile.nom} 👋
            </h1>

            <p className="mt-2 text-gray-400">
              {profile.role === "ADMIN"
                ? "👑 Administrateur"
                : "✂️ Coiffeur"}
            </p>

          </header>


          {/* ========================================================
              COMPTEURS
          ======================================================== */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">


            {/* CLIENTS */}

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

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


            {/* PRESTATIONS */}

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

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


            {/* SMS */}

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

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


          {/* ========================================================
              MESSAGE
          ======================================================== */}

          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8">

            <h2 className="text-xl font-semibold">
              Bienvenue dans LJ BARBER
            </h2>

            <p className="mt-3 max-w-2xl text-gray-400">
              Cet espace permet de gérer les clients,
              les prestations et les communications du salon.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}