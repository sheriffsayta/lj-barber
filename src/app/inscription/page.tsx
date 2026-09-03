"use client";

import { useState } from "react";
import Image from "next/image";
import ClientForm, { type ClientFormLanguage } from "@/ui/clients/ClientForm";
import RoleGuard from "@/ui/auth/RoleGuard";
import Sidebar from "@/ui/Sidebar";
import { formaterNumeroClient } from "@/lib/client-display";

export default function Inscription()
{
  const [etape, setEtape] = useState<"accueil" | "formulaire" | "merci">("accueil");
  const [langue, setLangue] = useState<ClientFormLanguage>("fr");
  const [numeroClient, setNumeroClient] = useState<number | null>(null);
  const [cleFormulaire, setCleFormulaire] = useState(0);
  const anglais = langue === "en";

  function revenirAccueil()
  {
    setEtape("accueil");
    setNumeroClient(null);
    setCleFormulaire((cle) => cle + 1);
  }

  return (
    <RoleGuard
      roles={["CLIENT"]}
      loadingMessage={anglais ? "Loading…" : "Chargement…"}
    >
      <main
        lang={langue}
        className="min-h-screen bg-gray-950 px-4 pb-8 pt-24 text-white sm:px-6"
      >
        <Sidebar client language={langue} />

        <div className="fixed right-4 top-2 z-[60] flex rounded-xl border border-gray-700 bg-gray-950 p-1 shadow-lg sm:right-6">
          <button
            type="button"
            onClick={() => setLangue("fr")}
            aria-label="Afficher en français"
            aria-pressed={langue === "fr"}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              langue === "fr" ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span aria-hidden="true">🇫🇷</span>
            <span className="hidden sm:inline">FR</span>
          </button>

          <button
            type="button"
            onClick={() => setLangue("en")}
            aria-label="Display in English"
            aria-pressed={langue === "en"}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              langue === "en" ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span aria-hidden="true">🇬🇧</span>
            <span className="hidden sm:inline">EN</span>
          </button>
        </div>

        <section className={`mx-auto w-full rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8 ${
          etape === "formulaire" ? "max-w-2xl" : "max-w-xl"
        }`}>
          {etape === "accueil" && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center py-8 text-center">
              <Image
                src="/logo/logo-512.png.jpg"
                alt="Logo LJ BARBER"
                width={240}
                height={240}
                priority
                className="h-44 w-44 rounded-full object-cover shadow-2xl sm:h-56 sm:w-56"
              />

              <h1 className="mt-8 text-3xl font-bold sm:text-4xl">
                {anglais ? "Welcome to LJ BARBER" : "Bienvenue chez LJ BARBER"}
              </h1>

              <p className="mt-4 max-w-md text-gray-400">
                {anglais
                  ? "Create your client profile in just a few clicks."
                  : "Créez votre fiche client en quelques clics."}
              </p>

              <button
                type="button"
                onClick={() => setEtape("formulaire")}
                className="mt-8 min-h-12 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
              >
                {anglais ? "Register as a client" : "S’enregistrer comme client"}
              </button>
            </div>
          )}

          {etape === "merci" && numeroClient !== null && (
            <div className="py-10 text-center">
              <h1 className="text-2xl font-bold">
                {anglais ? "Thank you for registering!" : "Merci pour votre inscription !"}
              </h1>
              <p className="mt-3 text-gray-400">
                {anglais ? "Your client number is" : "Votre numéro client est le"}{" "}
                {formaterNumeroClient(numeroClient)}.
              </p>
              <button
                type="button"
                onClick={revenirAccueil}
                className="mt-8 rounded-lg bg-white px-5 py-3 font-medium text-black"
              >
                {anglais ? "Back to the welcome page" : "Revenir à la page d’accueil"}
              </button>
            </div>
          )}

          {etape === "formulaire" && (
            <>
              <button
                type="button"
                onClick={revenirAccueil}
                className="mb-6 inline-flex min-h-11 items-center rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                ← {anglais ? "Cancel and return to the welcome page" : "Annuler et revenir à l’accueil"}
              </button>

              <h1 className="text-2xl font-bold sm:text-3xl">
                {anglais ? "Client registration" : "Inscription client"}
              </h1>
              <p className="mt-2 text-gray-400">
                {anglais
                  ? "Enter your information to create your client profile."
                  : "Renseignez vos informations pour créer votre fiche."}
              </p>
              <div className="mt-8">
                <ClientForm
                  key={cleFormulaire}
                  mode="inscription"
                  language={langue}
                  onClientInscrit={(numero) => {
                    setNumeroClient(numero);
                    setEtape("merci");
                  }}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </RoleGuard>
  );
}
