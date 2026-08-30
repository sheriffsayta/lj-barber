"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = "ADMIN" | "COIFFEUR";

export default function Sidebar()
{
  const pathname = usePathname();

  const [role, setRole] = useState<Role | null>(null);

  useEffect(() =>
  {
    async function chargerRole()
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
        return;
      }

      const
      {
        data,
        error
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error)
      {
        console.error("Erreur rôle :", error);
        return;
      }

      setRole(data.role);
    }

    chargerRole();
  }, []);

  async function seDeconnecter()
  {
    await supabase.auth.signOut();

    window.location.href = "/";
  }

  const liens =
  [
    {
      nom: "Accueil",
      emoji: "🏠",
      href: "/dashboard"
    },
    {
      nom: "Clients",
      emoji: "👥",
      href: "/clients"
    },
    {
      nom: "SMS",
      emoji: "💬",
      href: "/sms"
    }
  ];

  return (
    <aside className="hidden w-64 border-r border-gray-800 bg-gray-900 p-5 md:block">

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-white">
          ✂️ LJ BARBER
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Espace professionnel
        </p>

      </div>

      <nav className="space-y-2">

        {liens.map((lien) =>
        {
          const actif = pathname === lien.href;

          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={
                actif
                  ? "block rounded-lg bg-gray-800 px-4 py-3 text-white"
                  : "block rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800"
              }
            >
              {lien.emoji} {lien.nom}
            </Link>
          );
        })}

        {role === "ADMIN" &&
        (
          <Link
            href="/administration"
            className={
              pathname === "/administration"
                ? "block rounded-lg bg-gray-800 px-4 py-3 text-white"
                : "block rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800"
            }
          >
            🔐 Administration
          </Link>
        )}

      </nav>

      <button
        onClick={seDeconnecter}
        className="mt-10 w-full rounded-lg border border-gray-700 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
      >
        🚪 Déconnexion
      </button>

    </aside>
  );
}
