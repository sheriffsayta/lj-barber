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
  const [menuOuvert, setMenuOuvert] = useState(false);

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

  function fermerMenu()
  {
    setMenuOuvert(false);
  }

  function lienEstActif(href: string)
  {
    if (href === "/dashboard")
    {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ============================================================
          MOBILE
      ============================================================ */}

      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900 md:hidden">

        <div className="flex min-h-16 items-center justify-between gap-3 px-4">

          <Link
            href="/dashboard"
            onClick={fermerMenu}
            className="shrink-0 text-xl font-bold text-white"
          >
            ✂️ LJ BARBER
          </Link>

          <button
            type="button"
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-700 text-xl text-white"
            aria-label={
              menuOuvert
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
          >
            {menuOuvert ? "✕" : "☰"}
          </button>

        </div>


        {menuOuvert && (
          <div className="border-t border-gray-800 px-4 pb-4 pt-3">

            <nav className="space-y-2">

              {liens.map((lien) =>
              {
                const actif =
                  lienEstActif(lien.href);

                return (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    onClick={fermerMenu}
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


              {role === "ADMIN" && (
                <Link
                  href="/administration"
                  onClick={fermerMenu}
                  className={
                    lienEstActif("/administration")
                      ? "block rounded-lg bg-gray-800 px-4 py-3 text-white"
                      : "block rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800"
                  }
                >
                  🔐 Administration
                </Link>
              )}


              <button
                type="button"
                onClick={seDeconnecter}
                className="mt-3 w-full rounded-lg border border-gray-700 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
              >
                🚪 Déconnexion
              </button>

            </nav>

          </div>
        )}

      </header>


      {/* ============================================================
          ORDINATEUR / GRAND ÉCRAN
      ============================================================ */}

      <aside className="hidden w-64 shrink-0 border-r border-gray-800 bg-gray-900 p-5 md:block">

        <div className="mb-8">

          <Link
            href="/dashboard"
            className="text-2xl font-bold text-white"
          >
            ✂️ LJ BARBER
          </Link>

          <p className="mt-1 text-sm text-gray-400">
            Espace professionnel
          </p>

        </div>


        <nav className="space-y-2">

          {liens.map((lien) =>
          {
            const actif =
              lienEstActif(lien.href);

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


          {role === "ADMIN" && (
            <Link
              href="/administration"
              className={
                lienEstActif("/administration")
                  ? "block rounded-lg bg-gray-800 px-4 py-3 text-white"
                  : "block rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800"
              }
            >
              🔐 Administration
            </Link>
          )}

        </nav>


        <button
          type="button"
          onClick={seDeconnecter}
          className="mt-10 w-full rounded-lg border border-gray-700 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
        >
          🚪 Déconnexion
        </button>

      </aside>
    </>
  );
}