"use client";

import { useState } from "react";
import ClientForm from "@/ui/clients/ClientForm";
import RoleGuard from "@/ui/auth/RoleGuard";

export default function Inscription()
{
  const [numeroClient, setNumeroClient] = useState<number | null>(null);
  const [cleFormulaire, setCleFormulaire] = useState(0);

  return (
    <RoleGuard roles={["CLIENT"]}>
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-6">
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          {numeroClient ? (
            <div className="py-10 text-center">
              <h1 className="text-2xl font-bold">Merci pour votre inscription !</h1>
              <p className="mt-3 text-gray-400">
                Votre numéro client est le #{numeroClient}.
              </p>
              <button
                onClick={() => {
                  setNumeroClient(null);
                  setCleFormulaire((cle) => cle + 1);
                }}
                className="mt-8 rounded-lg bg-white px-5 py-3 font-medium text-black"
              >
                Inscrire un autre client
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold sm:text-3xl">Inscription client</h1>
              <p className="mt-2 text-gray-400">Renseignez vos informations pour créer votre fiche.</p>
              <div className="mt-8">
                <ClientForm
                  key={cleFormulaire}
                  mode="inscription"
                  onClientInscrit={setNumeroClient}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </RoleGuard>
  );
}
