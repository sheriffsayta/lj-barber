"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/ui/Sidebar";
import ClientForm from "@/ui/clients/ClientForm";

import {
  recupererClient,
  recupererPrestations,
  ajouterPrestation,
  modifierPrestation,
  supprimerPrestation,
  mettreClientCorbeille,
  type Client,
  type Prestation
} from "@/lib/clients";

export default function FicheClient()
{
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [prestations, setPrestations] = useState<Prestation[]>([]);

  const [modifier, setModifier] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [ajoutPrestation, setAjoutPrestation] = useState(false);
  const [datePrestation, setDatePrestation] = useState("");
  const [prestationEnCours, setPrestationEnCours] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [suppression, setSuppression] = useState(false);
  const [erreur, setErreur] = useState("");

  async function chargerClient()
  {
    try
    {
      const id = params.id as string;

      const data = await recupererClient(id);
      const prestationsData = await recupererPrestations(id);

      setClient(data);
      setPrestations(prestationsData);
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de récupérer le client."
      );
    }
    finally
    {
      setLoading(false);
    }
  }

  function dateAujourdhui()
  {
    return new Date()
      .toISOString()
      .split("T")[0];
  }

  function ouvrirAjoutPrestation()
  {
    setDatePrestation(dateAujourdhui());
    setAjoutPrestation(true);
    setErreur("");
  }

  async function validerPrestation()
  {
    if (!client || !datePrestation)
    {
      return;
    }

    try
    {
      setErreur("");

      await ajouterPrestation(
        client.id,
        datePrestation
      );

      const data = await recupererPrestations(
        client.id
      );

      setPrestations(data);
      setAjoutPrestation(false);
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible d'ajouter la prestation."
      );
    }
  }

  async function modifierDatePrestation(
    prestation: Prestation
  )
  {
    const nouvelleDate = window.prompt(
      "Nouvelle date de la prestation :",
      prestation.date_prestation
    );

    if (!nouvelleDate)
    {
      return;
    }

    try
    {
      setPrestationEnCours(prestation.id);
      setErreur("");

      await modifierPrestation(
        prestation.id,
        nouvelleDate
      );

      const data = await recupererPrestations(
        prestation.client_id
      );

      setPrestations(data);
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de modifier la prestation."
      );
    }
    finally
    {
      setPrestationEnCours(null);
    }
  }

  async function supprimerUnePrestation(
    prestation: Prestation
  )
  {
    const confirmation = window.confirm(
      "Supprimer cette prestation ?"
    );

    if (!confirmation)
    {
      return;
    }

    try
    {
      setPrestationEnCours(prestation.id);
      setErreur("");

      await supprimerPrestation(
        prestation.id
      );

      setPrestations(
        prestations.filter(
          (item) =>
            item.id !== prestation.id
        )
      );
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de supprimer la prestation."
      );
    }
    finally
    {
      setPrestationEnCours(null);
    }
  }

  async function envoyerCorbeille()
  {
    if (!client)
    {
      return;
    }

    setSuppression(true);
    setErreur("");

    try
    {
      await mettreClientCorbeille(
        client.id
      );

      router.push("/clients");
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de mettre le client à la corbeille."
      );

      setSuppression(false);
    }
  }

  useEffect(() =>
  {
    chargerClient();
  }, [params.id]);

  if (loading)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <p>
          Chargement du client...
        </p>
      </main>
    );
  }

  if (erreur && !client)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">

        <div className="text-center">

          <p className="mb-4 text-red-400">
            {erreur}
          </p>

          <button
            onClick={() =>
            {
              router.push("/clients");
            }}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black"
          >
            Retour aux clients
          </button>

        </div>

      </main>
    );
  }

  if (!client)
  {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <div className="flex min-h-screen">

        <Sidebar />

        <section className="flex-1 p-6 md:p-10">

          <button
            onClick={() =>
            {
              router.push("/clients");
            }}
            className="mb-8 text-sm text-gray-400 hover:text-white"
          >
            ← Retour aux clients
          </button>

          <div className="mb-8">

            <p className="text-sm text-gray-500">
              Client #{client.numero_client}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {client.prenom} {client.nom}
            </h1>

          </div>

          {erreur && (
            <div className="mb-6 rounded-lg bg-red-950 p-4 text-red-300">
              {erreur}
            </div>
          )}

          {modifier ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

              <h2 className="mb-6 text-xl font-semibold">
                Modifier le client
              </h2>

              <ClientForm
                client={client}
                onClientModifie={async () =>
                {
                  setModifier(false);
                  setLoading(true);

                  await chargerClient();
                }}
                onFermer={() =>
                {
                  setModifier(false);
                }}
              />

            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">

              {/* INFORMATIONS */}

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

                <h2 className="mb-5 text-xl font-semibold">
                  Informations
                </h2>

                <div className="space-y-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Téléphone
                    </p>

                    <p className="mt-1">
                      {client.telephone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="mt-1">
                      {client.email || "Non renseigné"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Date de naissance
                    </p>

                    <p className="mt-1">
                      {client.date_naissance || "Non renseignée"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Sexe
                    </p>

                    <p className="mt-1">
                      {client.sexe || "Non renseigné"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Catégorie
                    </p>

                    <p className="mt-1">
                      {client.categorie}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Notes
                    </p>

                    <p className="mt-1">
                      {client.notes || "Aucune note"}
                    </p>
                  </div>

                </div>

              </div>


              {/* PRESTATIONS */}

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Prestations
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {prestations.length} prestation
                      {prestations.length !== 1 ? "s" : ""}
                    </p>

                  </div>

                  <button
                    onClick={ouvrirAjoutPrestation}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                  >
                    + Ajouter
                  </button>

                </div>


                {/* FORMULAIRE AJOUT */}

                {ajoutPrestation && (
                  <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-4">

                    <label className="text-sm text-gray-400">
                      Date de la prestation
                    </label>

                    <input
                      type="date"
                      value={datePrestation}
                      onChange={(event) =>
                      {
                        setDatePrestation(
                          event.target.value
                        );
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                    />

                    <div className="mt-4 flex gap-3">

                      <button
                        onClick={() =>
                        {
                          setAjoutPrestation(false);
                        }}
                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300"
                      >
                        Annuler
                      </button>

                      <button
                        onClick={validerPrestation}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        Valider
                      </button>

                    </div>

                  </div>
                )}


                {/* LISTE DES PRESTATIONS */}

                <div className="mt-6">

                  {prestations.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Aucune prestation enregistrée.
                    </p>
                  ) : (
                    <div className="space-y-3">

                      {prestations.map(
                        (prestation) =>
                        (
                          <div
                            key={prestation.id}
                            className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-4 py-3"
                          >

                            <p>
                              {new Date(
                                prestation.date_prestation
                              ).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                {
                                  modifierDatePrestation(
                                    prestation
                                  );
                                }}
                                disabled={
                                  prestationEnCours ===
                                  prestation.id
                                }
                                className="rounded-lg border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                              >
                                Modifier
                              </button>

                              <button
                                onClick={() =>
                                {
                                  supprimerUnePrestation(
                                    prestation
                                  );
                                }}
                                disabled={
                                  prestationEnCours ===
                                  prestation.id
                                }
                                className="rounded-lg border border-red-800 px-3 py-1 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
                              >
                                Supprimer
                              </button>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>


              {/* ACTIONS */}

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:col-span-2">

                <h2 className="mb-5 text-xl font-semibold">
                  Actions
                </h2>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                    {
                      setModifier(true);
                    }}
                    className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:opacity-90"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() =>
                    {
                      setConfirmation(true);
                    }}
                    className="rounded-lg border border-red-800 px-5 py-3 text-red-400 hover:bg-red-950"
                  >
                    🗑️ Mettre à la corbeille
                  </button>

                </div>

              </div>

            </div>
          )}

        </section>

      </div>


      {/* CONFIRMATION CORBEILLE */}

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">

          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">

            <h2 className="text-xl font-semibold">
              Mettre le client à la corbeille ?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {client.prenom} {client.nom} sera déplacé dans
              la corbeille. Il pourra être restauré avant sa
              suppression définitive.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                {
                  setConfirmation(false);
                }}
                disabled={suppression}
                className="rounded-lg border border-gray-700 px-5 py-3 text-gray-300 hover:bg-gray-800"
              >
                Annuler
              </button>

              <button
                onClick={envoyerCorbeille}
                disabled={suppression}
                className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {suppression
                  ? "Déplacement..."
                  : "Mettre à la corbeille"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
