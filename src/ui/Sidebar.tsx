"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/lib/roles";
import { supabase } from "@/lib/supabase";

const liens = [
  {
    nom: "Accueil",
    emoji: "🏠",
    href: "/dashboard",
  },
  {
    nom: "Clients",
    emoji: "👥",
    href: "/clients",
  },
  {
    nom: "SMS",
    emoji: "💬",
    href: "/sms",
  },
];

export default function Sidebar(
  {
    client = false
  }: {
    client?: boolean;
  }
)
{
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] =
    useState<Role | null>(null);

  const [menuOuvert, setMenuOuvert] =
    useState(false);


  // ============================================================
  // CHARGER LE ROLE
  // ============================================================

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
        console.error(
          "Erreur rôle :",
          error
        );

        return;
      }

      setRole(data.role);
    }

    chargerRole();
  }, []);


  // ============================================================
  // FERMER LE MENU
  // ============================================================

  function fermerMenu()
  {
    setMenuOuvert(false);
  }


  // ============================================================
  // DECONNEXION
  // ============================================================

  async function seDeconnecter()
  {
    await supabase.auth.signOut();

    router.replace("/");
  }


  // ============================================================
  // LIEN ACTIF
  // ============================================================

  function lienEstActif(
    href: string
  )
  {
    if (href === "/dashboard")
    {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }


  // ============================================================
  // STYLE LIEN
  // ============================================================

  function classeLien(
    href: string
  )
  {
    return lienEstActif(href)
      ? "flex min-h-12 items-center gap-3 rounded-xl bg-gray-800 px-4 py-3 font-medium text-white"
      : "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-gray-300 hover:bg-gray-800";
  }


  return (
    <>

      {/* ========================================================
          BARRE DU HAUT
          TOUS LES APPAREILS
      ======================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-gray-800 bg-gray-900/95 backdrop-blur">

        <div className="flex h-full items-center px-4 sm:px-6">

          {/* BOUTON MENU */}

          <button
            type="button"
            onClick={() =>
            {
              setMenuOuvert(
                (ouvert) => !ouvert
              );
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-700 text-xl text-white hover:bg-gray-800 active:bg-gray-700"
            aria-label={
              menuOuvert
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={menuOuvert}
          >
            {menuOuvert
              ? "✕"
              : "☰"}
          </button>


          {/* LOGO */}

          <Link
            href={client ? "/inscription" : "/dashboard"}
            onClick={fermerMenu}
            className="ml-3 text-lg font-bold text-white sm:text-xl"
          >
            ✂️ LJ BARBER
          </Link>

        </div>

      </header>


      {/* ========================================================
          FOND SOMBRE
          APPARAIT QUAND LE MENU EST OUVERT
      ======================================================== */}

      {menuOuvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={fermerMenu}
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}


      {/* ========================================================
          SIDEBAR
          TOUS LES APPAREILS
      ======================================================== */}

      <aside
        className={
          "fixed bottom-0 left-0 top-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-gray-800 bg-gray-900 p-5 shadow-2xl transition-transform duration-200 ease-out " +
          (
            menuOuvert
              ? "translate-x-0"
              : "-translate-x-full"
          )
        }
      >

        {/* ======================================================
            ENTETE SIDEBAR
        ====================================================== */}

        <div className="mb-8 flex items-center justify-between">

          <Link
            href={client ? "/inscription" : "/dashboard"}
            onClick={fermerMenu}
            className="text-xl font-bold text-white"
          >
            ✂️ LJ BARBER
          </Link>


          {/* FERMER */}

          <button
            type="button"
            onClick={fermerMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 text-lg text-white hover:bg-gray-800"
            aria-label="Fermer le menu"
          >
            ✕
          </button>

        </div>


        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        {!client && (
        <nav className="space-y-2">

          {liens.map(
            (lien) =>
            (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={fermerMenu}
                className={classeLien(
                  lien.href
                )}
              >

                <span className="text-lg">
                  {lien.emoji}
                </span>

                <span>
                  {lien.nom}
                </span>

              </Link>
            )
          )}


          {/* ADMINISTRATION */}

          {role === "ADMIN" && (
            <Link
              href="/administration"
              onClick={fermerMenu}
              className={classeLien(
                "/administration"
              )}
            >

              <span className="text-lg">
                🔐
              </span>

              <span>
                Administration
              </span>

            </Link>
          )}

        </nav>
        )}


        {/* ======================================================
            DECONNEXION
        ====================================================== */}

        <button
          type="button"
          onClick={seDeconnecter}
          className="mt-auto flex min-h-12 w-full items-center gap-3 rounded-xl border border-gray-700 px-4 py-3 text-left text-gray-300 hover:bg-gray-800 active:bg-gray-700"
        >

          <span className="text-lg">
            🚪
          </span>

          <span>
            Déconnexion
          </span>

        </button>

      </aside>

    </>
  );
}
