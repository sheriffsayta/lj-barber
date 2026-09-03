"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/ui/Sidebar";
import ClientForm from "@/ui/clients/ClientForm";
import RoleGuard from "@/ui/auth/RoleGuard";
import { formaterNumeroClient } from "@/lib/client-display";

import {
  recupererClient,
  recupererPrestations,
  ajouterPrestation,
  modifierPrestation,
  supprimerPrestation,
  mettreClientCorbeille,
  type Client,
  type Prestation,
} from "@/lib/clients";

function FicheClientContent() {
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [prestations, setPrestations] = useState<Prestation[]>([]);

  const [modifier, setModifier] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [ajoutPrestation, setAjoutPrestation] = useState(false);
  const [datePrestation, setDatePrestation] = useState("");
  const [prixPrestation, setPrixPrestation] = useState("");
  const [prestationEnEdition, setPrestationEnEdition] = useState<string | null>(null);
  const [dateEdition, setDateEdition] = useState("");
  const [prixEdition, setPrixEdition] = useState("");
  const [prestationEnCours, setPrestationEnCours] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [suppression, setSuppression] = useState(false);
  const [erreur, setErreur] = useState("");

  async function chargerClient() {
    try {
      const id = params.id as string;

      const data = await recupererClient(id);
      const prestationsData = await recupererPrestations(id);

      setClient(data);
      setPrestations(prestationsData);
    } catch (error) {
      console.error(error);

      setErreur("Impossible de récupérer le client.");
    } finally {
      setLoading(false);
    }
  }

  function dateAujourdhui() {
    const maintenant = new Date();
    return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}-${String(maintenant.getDate()).padStart(2, "0")}`;
  }

  function ouvrirAjoutPrestation() {
    setDatePrestation(dateAujourdhui());
    setPrixPrestation("");
    setAjoutPrestation(true);
    setErreur("");
  }

  async function validerPrestation() {
    const prix = Number(prixPrestation.replace(",", "."));

    if (!client || !datePrestation || prixPrestation.trim() === "" || !Number.isFinite(prix) || prix < 0) {
      setErreur("Renseignez une date et un prix valide.");
      return;
    }

    try {
      setErreur("");

      await ajouterPrestation(client.id, datePrestation, prix);

      const data = await recupererPrestations(client.id);

      setPrestations(data);
      setAjoutPrestation(false);
      setPrixPrestation("");
    } catch (error) {
      console.error(error);

      setErreur("Impossible d'ajouter la prestation.");
    }
  }

  function ouvrirModificationPrestation(prestation: Prestation) {
    setPrestationEnEdition(prestation.id);
    setDateEdition(prestation.date_prestation);
    setPrixEdition(prestation.prix?.toString() ?? "");
    setErreur("");
  }

  async function validerModificationPrestation(prestation: Prestation) {
    const prix = Number(prixEdition.replace(",", "."));

    if (!dateEdition || prixEdition.trim() === "" || !Number.isFinite(prix) || prix < 0) {
      setErreur("Renseignez une date et un prix valide.");
      return;
    }

    try {
      setPrestationEnCours(prestation.id);
      setErreur("");

      await modifierPrestation(
        prestation.id,
        dateEdition,
        prix
      );

      const data = await recupererPrestations(
        prestation.client_id
      );

      setPrestations(data);
      setPrestationEnEdition(null);
    } catch (error) {
      console.error(error);

      setErreur("Impossible de modifier la prestation.");
    } finally {
      setPrestationEnCours(null);
    }
  }

  async function supprimerUnePrestation(
    prestation: Prestation
  ) {
    const confirmation = window.confirm(
      "Supprimer cette prestation ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setPrestationEnCours(prestation.id);
      setErreur("");

      await supprimerPrestation(prestation.id);

      setPrestations(
        prestations.filter(
          (item) => item.id !== prestation.id
        )
      );
    } catch (error) {
      console.error(error);

      setErreur("Impossible de supprimer la prestation.");
    } finally {
      setPrestationEnCours(null);
    }
  }

  async function envoyerCorbeille() {
    if (!client) {
      return;
    }

    setSuppression(true);
    setErreur("");

    try {
      await mettreClientCorbeille(client.id);

      router.push("/clients");
    } catch (error) {
      console.error(error);

      setErreur(
        "Impossible de mettre le client à la corbeille."
      );

      setSuppression(false);
    }
  }

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const id = params.id as string;
        const [data, prestationsData] = await Promise.all([
          recupererClient(id),
          recupererPrestations(id)
        ]);

        if (!actif) {
          return;
        }

        setClient(data);
        setPrestations(prestationsData);
      } catch (error) {
        console.error(error);

        if (actif) {
          setErreur("Impossible de récupérer le client.");
        }
      } finally {
        if (actif) {
          setLoading(false);
        }
      }
    }

    void charger();

    return () => {
      actif = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p className="text-center">
          Chargement du client...
        </p>
      </main>
    );
  }

  if (erreur && !client) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">
        <div className="text-center">
          <p className="mb-4 text-red-400">
            {erreur}
          </p>

          <button
            onClick={() => router.push("/clients")}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black"
          >
            Retour aux clients
          </button>
        </div>
      </main>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">
      <div className="min-h-screen md:flex">

        <Sidebar />

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:p-10">

          <button
            onClick={() => router.push("/clients")}
            className="mb-6 text-sm text-gray-400 hover:text-white sm:mb-8"
          >
            ← Retour aux clients
          </button>

          <div className="mb-6 sm:mb-8">
            <p className="text-sm text-gray-500">
              Client {formaterNumeroClient(client.numero_client)}
            </p>

            <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
              {client.prenom} {client.nom}
            </h1>

            {client.pseudo && (
              <p className="mt-1 text-gray-400">@{client.pseudo}</p>
            )}
          </div>

          {erreur && (
            <div className="mb-6 rounded-lg bg-red-950 p-4 text-sm text-red-300">
              {erreur}
            </div>
          )}

          {modifier ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

              <h2 className="mb-6 text-xl font-semibold">
                Modifier le client
              </h2>

              <ClientForm
                client={client}
                onClientModifie={async () => {
                  setModifier(false);
                  setLoading(true);

                  await chargerClient();
                }}
                onFermer={() => {
                  setModifier(false);
                }}
              />

            </div>
          ) : (
            <div className="grid min-w-0 gap-5 md:grid-cols-2 md:gap-6">

              <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

                <h2 className="mb-5 text-xl font-semibold">
                  Informations
                </h2>

                <div className="space-y-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Téléphone
                    </p>

                    <p className="mt-1 break-words">
                      {client.telephone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-words">
                      {client.email || "Non renseigné"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Métier
                    </p>

                    <p className="mt-1 break-words">
                      {client.metier || "Non renseigné"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Consentements de communication
                    </p>

                    <p className="mt-1">
                      SMS : {client.sms_consentement ? "autorisé" : "non autorisé"}
                    </p>

                    <p className="mt-1">
                      E-mail : {client.email_consentement ? "autorisé" : "non autorisé"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Réseaux sociaux
                    </p>

                    <p className="mt-1 break-words">
                      {client.reseaux_sociaux || "Non renseignés"}
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

                    <p className="mt-1 break-words">
                      {client.categorie}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Notes
                    </p>

                    <p className="mt-1 break-words">
                      {client.notes || "Aucune note"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Résidences
                    </p>

                    {client.localisations?.length ? (
                      <ul className="mt-1 space-y-1">
                        {client.localisations.map((localisation) => (
                          <li key={localisation.id} className="break-words">
                            {localisation.pays}
                            {localisation.ville && ` — ${localisation.ville}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1">Non renseignées</p>
                    )}
                  </div>

                </div>

              </div>

              <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

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
                    className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-90 sm:w-auto"
                  >
                    + Ajouter
                  </button>

                </div>

                {ajoutPrestation && (
                  <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-4">

                    <label className="text-sm text-gray-400">
                      Date de la prestation
                    </label>

                    <input
                      type="date"
                      value={datePrestation}
                      onChange={(event) => {
                        setDatePrestation(
                          event.target.value
                        );
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                    />

                    <label className="mt-4 block text-sm text-gray-400">
                      Prix de la prestation (€)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={prixPrestation}
                      onChange={(event) => setPrixPrestation(event.target.value)}
                      placeholder="0,00"
                      className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                      <button
                        onClick={() => {
                          setAjoutPrestation(false);
                        }}
                        className="rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300"
                      >
                        Annuler
                      </button>

                      <button
                        onClick={validerPrestation}
                        className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-black"
                      >
                        Valider
                      </button>

                    </div>

                  </div>
                )}

                <div className="mt-6">

                  {prestations.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Aucune prestation enregistrée.
                    </p>
                  ) : (
                    <div className="space-y-3">

                      {prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-3"
                        >

                          {prestationEnEdition === prestation.id ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="text-sm text-gray-400">
                                Date
                                <input
                                  type="date"
                                  value={dateEdition}
                                  onChange={(event) => setDateEdition(event.target.value)}
                                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
                                />
                              </label>

                              <label className="text-sm text-gray-400">
                                Prix (€)
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  inputMode="decimal"
                                  value={prixEdition}
                                  onChange={(event) => setPrixEdition(event.target.value)}
                                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
                                />
                              </label>

                              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  onClick={() => setPrestationEnEdition(null)}
                                  className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                                >
                                  Annuler
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void validerModificationPrestation(prestation)}
                                  disabled={prestationEnCours === prestation.id}
                                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p>
                                {new Date(
                                  prestation.date_prestation
                                ).toLocaleDateString("fr-FR")}
                              </p>
                              <p className="mt-1 font-semibold text-green-400">
                                {prestation.prix === null
                                  ? "Prix non renseigné"
                                  : Number(prestation.prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">

                            <button
                              onClick={() => {
                                ouvrirModificationPrestation(
                                  prestation
                                );
                              }}
                              disabled={
                                prestationEnCours ===
                                prestation.id
                              }
                              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                            >
                              Modifier
                            </button>

                            <button
                              onClick={() => {
                                supprimerUnePrestation(
                                  prestation
                                );
                              }}
                              disabled={
                                prestationEnCours ===
                                prestation.id
                              }
                              className="rounded-lg border border-red-800 px-3 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
                            >
                              Supprimer
                            </button>

                          </div>
                          </div>
                          )}

                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </div>

              <div className="min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6 md:col-span-2">

                <h2 className="mb-5 text-xl font-semibold">
                  Actions
                </h2>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() => {
                      setModifier(true);
                    }}
                    className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:opacity-90"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => {
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

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6">

          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl sm:p-6">

            <h2 className="text-xl font-semibold">
              Mettre le client à la corbeille ?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {client.prenom} {client.nom} sera déplacé dans
              la corbeille. Il pourra être restauré avant sa
              suppression définitive.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                onClick={() => {
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

export default function FicheClient()
{
  return <RoleGuard roles={["ADMIN", "COIFFEUR"]}><FicheClientContent /></RoleGuard>;
}
