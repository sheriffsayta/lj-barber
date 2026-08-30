"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = "ADMIN" | "COIFFEUR";

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

export default function Sidebar()
{
  const pathname = usePathname();

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
  // DECONNEXION
  // ============================================================

  async function seDeconnecter()
  {
    await supabase.auth.signOut();

    window.location.href = "/";
  }


  // ============================================================
  // FERMER LE MENU
  // ============================================================

  function fermerMenu()
  {
    setMenuOuvert(false);
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
  // STYLE DES LIENS
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
          IPHONE + IPAD
          MENU MOBILE / TABLETTE
      ======================================================== */}

      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur lg:hidden">

        {/* BARRE DU HAUT */}

        <div className="flex min-h-16 items-center justify-between px-4 sm:px-6">

          <Link
            href="/dashboard"
            onClick={fermerMenu}
            className="text-lg font-bold text-white sm:text-xl"
          >
            ✂️ LJ BARBER
          </Link>


          {/* BOUTON MENU */}

          <button
            type="button"
            onClick={() =>
            {
              setMenuOuvert(
                (ouvert) => !ouvert
              );
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-700 text-xl text-white active:bg-gray-800"
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

        </div>


        {/* ======================================================
            MENU OUVERT
            POSITIONNE PAR-DESSUS LA PAGE
        ====================================================== */}

        {menuOuvert && (
          <div className="absolute left-0 right-0 top-full border-t border-gray-800 bg-gray-900 px-4 pb-4 pt-3 shadow-xl sm:px-6">

            <nav className="space-y-2">

              {/* ACCUEIL / CLIENTS / SMS */}

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


              {/* DECONNEXION */}

              <button
                type="button"
                onClick={seDeconnecter}
                className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-xl border border-gray-700 px-4 py-3 text-left text-gray-300 active:bg-gray-800"
              >

                <span className="text-lg">
                  🚪
                </span>

                <span>
                  Déconnexion
                </span>

              </button>

            </nav>

          </div>
        )}

      </header>


      {/* ========================================================
          ORDINATEUR
          SIDEBAR FIXE
      ======================================================== */}

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gray-800 bg-gray-900 p-5 lg:flex lg:flex-col">

        {/* LOGO */}

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


        {/* NAVIGATION */}

        <nav className="space-y-2">

          {liens.map(
            (lien) =>
            (
              <Link
                key={lien.href}
                href={lien.href}
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


        {/* DECONNEXION */}

        <button
          type="button"
          onClick={seDeconnecter}
          className="mt-auto flex min-h-12 w-full items-center gap-3 rounded-xl border border-gray-700 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
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