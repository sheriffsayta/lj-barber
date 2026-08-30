"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/ui/Sidebar";
import ClientForm from "@/ui/clients/ClientForm";

import {
  rechercherClients,
  recupererCorbeille,
  restaurerClient,
  supprimerClientDefinitivement,
  supprimerClientsDePlusDe30Jours,
  type Client
} from "@/lib/clients";

export default function Clients()
{
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [corbeille, setCorbeille] = useState<Client[]>([]);

  const [recherche, setRecherche] = useState("");

  const [vue, setVue] =
    useState<"clients" | "corbeille">("clients");

  const [categoriesSelectionnees, setCategoriesSelectionnees] =
    useState<string[]>([]);

  const [filtreSms, setFiltreSms] =
    useState<"tous" | "autorise" | "non_autorise">("tous");

  const [clientsSelectionnes, setClientsSelectionnes] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [formulaireOuvert, setFormulaireOuvert] =
    useState(false);

  const [suppression, setSuppression] =
    useState(false);

  async function chargerClients()
  {
    try
    {
      const data = await rechercherClients();

      setClients(data);
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de récupérer les clients."
      );
    }
  }

  async function chargerCorbeille()
  {
    try
    {
      const data = await recupererCorbeille();

      setCorbeille(data);
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de récupérer la corbeille."
      );
    }
  }

  async function chargerDonnees()
  {
    setLoading(true);
    setErreur("");

    await Promise.all(
      [
        chargerClients(),
        chargerCorbeille()
      ]
    );

    setLoading(false);
  }

  useEffect(() =>
  {
    chargerDonnees();
  }, []);

  async function restaurer(id: string)
  {
    try
    {
      setErreur("");

      await restaurerClient(id);

      await chargerCorbeille();
      await chargerClients();
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de restaurer le client."
      );
    }
  }

  async function supprimerDefinitivement(
    client: Client
  )
  {
    const confirmation = window.confirm(
      `Supprimer définitivement ${client.prenom} ${client.nom} ?\n\nCette action est irréversible.`
    );

    if (!confirmation)
    {
      return;
    }

    try
    {
      setErreur("");

      await supprimerClientDefinitivement(
        client.id
      );

      await chargerCorbeille();
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de supprimer définitivement le client."
      );
    }
  }

  async function supprimerAnciensClients()
  {
    const confirmation = window.confirm(
      "Supprimer définitivement tous les clients présents dans la corbeille depuis plus de 30 jours ?\n\nCette action est irréversible."
    );

    if (!confirmation)
    {
      return;
    }

    try
    {
      setSuppression(true);
      setErreur("");

      await supprimerClientsDePlusDe30Jours();

      await chargerCorbeille();
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        "Impossible de supprimer les anciens clients."
      );
    }
    finally
    {
      setSuppression(false);
    }
  }

  /*
   * Catégories disponibles
   */
  const categories = Array.from(
    new Set(
      clients.map(
        (client) => client.categorie
      )
    )
  ).sort();

  /*
   * Filtrage des clients
   */
  const clientsFiltres = clients.filter(
    (client) =>
    {
      const texte = recherche
        .toLowerCase()
        .trim();

      const correspondRecherche =
        client.nom.toLowerCase().includes(texte) ||
        client.prenom.toLowerCase().includes(texte) ||
        client.telephone.includes(texte) ||
        client.numero_client
          .toString()
          .includes(texte);

      const correspondCategorie =
        categoriesSelectionnees.length === 0 ||
        categoriesSelectionnees.includes(
          client.categorie
        );

      const correspondSms =
        filtreSms === "tous" ||
        (
          filtreSms === "autorise" &&
          client.sms_consentement === true
        ) ||
        (
          filtreSms === "non_autorise" &&
          client.sms_consentement === false
        );

      return (
        correspondRecherche &&
        correspondCategorie &&
        correspondSms
      );
    }
  );

  /*
   * Sélectionner / désélectionner un client
   */
  function basculerSelectionClient(id: string)
  {
    setClientsSelectionnes(
      (selectionActuelle) =>
      {
        if (selectionActuelle.includes(id))
        {
          return selectionActuelle.filter(
            (clientId) => clientId !== id
          );
        }

        return [
          ...selectionActuelle,
          id
        ];
      }
    );
  }

  /*
   * Sélectionner tous les clients actuellement affichés
   */
  function basculerSelectionTous()
  {
    const idsVisibles =
      clientsFiltres.map(
        (client) => client.id
      );

    const tousSelectionnes =
      idsVisibles.length > 0 &&
      idsVisibles.every(
        (id) =>
          clientsSelectionnes.includes(id)
      );

    if (tousSelectionnes)
    {
      setClientsSelectionnes(
        (selectionActuelle) =>
          selectionActuelle.filter(
            (id) =>
              !idsVisibles.includes(id)
          )
      );

      return;
    }

    setClientsSelectionnes(
      (selectionActuelle) =>
      {
        const nouvelleSelection =
          new Set(selectionActuelle);

        idsVisibles.forEach(
          (id) =>
          {
            nouvelleSelection.add(id);
          }
        );

        return Array.from(
          nouvelleSelection
        );
      }
    );
  }

  /*
   * Vérifie si tous les clients affichés
   * sont sélectionnés.
   */
  const tousLesClientsVisiblesSelectionnes =
    clientsFiltres.length > 0 &&
    clientsFiltres.every(
      (client) =>
        clientsSelectionnes.includes(
          client.id
        )
    );

  /*
   * Changer les catégories sélectionnées
   */
  function basculerCategorie(
    categorie: string
  )
  {
    setCategoriesSelectionnees(
      (categoriesActuelles) =>
      {
        if (
          categoriesActuelles.includes(
            categorie
          )
        )
        {
          return categoriesActuelles.filter(
            (categorieActuelle) =>
              categorieActuelle !== categorie
          );
        }

        return [
          ...categoriesActuelles,
          categorie
        ];
      }
    );
  }

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

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      <div className="flex min-h-screen">

        <Sidebar />

        <section className="flex-1 p-6 md:p-10">

          <header className="mb-8">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="text-sm text-gray-400">
                  Gestion du salon
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                  {vue === "clients"
                    ? "👥 Clients"
                    : "🗑️ Corbeille"}
                </h1>

                {vue === "clients" && (
                  <p className="mt-2 text-sm text-gray-400">
                    {clients.length} client
                    {clients.length !== 1
                      ? "s"
                      : ""}
                  </p>
                )}

              </div>

              {vue === "clients" && (
                <button
                  onClick={() =>
                  {
                    setFormulaireOuvert(
                      !formulaireOuvert
                    );
                  }}
                  className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:opacity-90"
                >
                  {formulaireOuvert
                    ? "Fermer"
                    : "+ Ajouter un client"}
                </button>
              )}

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                onClick={() =>
                {
                  setVue("clients");
                  setRecherche("");
                  setErreur("");
                }}
                className={`rounded-lg px-4 py-2 text-sm ${
                  vue === "clients"
                    ? "bg-white text-black"
                    : "border border-gray-700 text-gray-300"
                }`}
              >
                👥 Clients
              </button>

              <button
                onClick={() =>
                {
                  setVue("corbeille");
                  setFormulaireOuvert(false);
                  setRecherche("");
                  setErreur("");
                  setClientsSelectionnes([]);
                }}
                className={`rounded-lg px-4 py-2 text-sm ${
                  vue === "corbeille"
                    ? "bg-white text-black"
                    : "border border-gray-700 text-gray-300"
                }`}
              >
                🗑️ Corbeille

                {corbeille.length > 0 && (
                  <span className="ml-2">
                    {corbeille.length}
                  </span>
                )}

              </button>

            </div>

          </header>

          {erreur && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950 p-4 text-red-300">
              {erreur}
            </div>
          )}

          {vue === "clients" && (
            <>

              {formulaireOuvert && (
                <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">

                  <ClientForm
                    onClientAjoute={async () =>
                    {
                      setFormulaireOuvert(false);

                      await chargerClients();
                    }}
                    onFermer={() =>
                    {
                      setFormulaireOuvert(false);
                    }}
                  />

                </div>
              )}

              {/* RECHERCHE ET FILTRES */}

              <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-5">

                <input
                  type="text"
                  value={recherche}
                  onChange={(event) =>
                  {
                    setRecherche(
                      event.target.value
                    );
                  }}
                  placeholder="Rechercher un client..."
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
                />

                <div className="mt-4 flex flex-wrap gap-3">

                  <div className="relative">

                    <details>

                      <summary className="cursor-pointer list-none rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                        Catégories
                        {categoriesSelectionnees.length > 0 && (
                          <span className="ml-2">
                            ({categoriesSelectionnees.length})
                          </span>
                        )}
                      </summary>

                      <div className="absolute z-20 mt-2 w-64 rounded-xl border border-gray-700 bg-gray-900 p-3 shadow-xl">

                        {categories.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            Aucune catégorie
                          </p>
                        ) : (
                          categories.map(
                            (categorie) =>
                            (
                              <label
                                key={categorie}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800"
                              >

                                <input
                                  type="checkbox"
                                  checked={categoriesSelectionnees.includes(
                                    categorie
                                  )}
                                  onChange={() =>
                                  {
                                    basculerCategorie(
                                      categorie
                                    );
                                  }}
                                  className="h-4 w-4"
                                />

                                <span className="text-sm">
                                  {categorie}
                                </span>

                              </label>
                            )
                          )
                        )}

                      </div>

                    </details>

                  </div>

                  <select
                    value={filtreSms}
                    onChange={(event) =>
                    {
                      setFiltreSms(
                        event.target.value as
                        | "tous"
                        | "autorise"
                        | "non_autorise"
                      );
                    }}
                    className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm text-gray-300 outline-none"
                  >

                    <option value="tous">
                      Tous les SMS
                    </option>

                    <option value="autorise">
                      SMS autorisé
                    </option>

                    <option value="non_autorise">
                      SMS non autorisé
                    </option>

                  </select>

                  {(categoriesSelectionnees.length > 0 ||
                    filtreSms !== "tous" ||
                    recherche) && (
                    <button
                      onClick={() =>
                      {
                        setRecherche("");
                        setCategoriesSelectionnees([]);
                        setFiltreSms("tous");
                      }}
                      className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Réinitialiser
                    </button>
                  )}

                </div>

              </div>

              <div className="mb-4 flex items-center justify-between">

                <p className="text-sm text-gray-400">
                  {clientsFiltres.length} client
                  {clientsFiltres.length !== 1
                    ? "s"
                    : ""}
                  affiché
                  {clientsFiltres.length !== 1
                    ? "s"
                    : ""}
                </p>

                {clientsSelectionnes.length > 0 && (
                  <p className="text-sm text-gray-300">
                    {clientsSelectionnes.length} sélectionné
                    {clientsSelectionnes.length !== 1
                      ? "s"
                      : ""}
                  </p>
                )}

              </div>

              {/* LISTE DES CLIENTS */}

              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

                {clientsFiltres.length === 0 ? (
                  <div className="p-10 text-center">

                    <div className="text-5xl">
                      👥
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                      Aucun client trouvé
                    </h2>

                    <p className="mt-2 text-gray-400">
                      Essayez de modifier votre recherche ou vos filtres.
                    </p>

                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead className="border-b border-gray-800 bg-gray-950">

                        <tr>

                          <th className="w-14 px-5 py-4">

                            <input
                              type="checkbox"
                              checked={
                                tousLesClientsVisiblesSelectionnes
                              }
                              onChange={
                                basculerSelectionTous
                              }
                              className="h-4 w-4"
                              title="Sélectionner tous les clients affichés"
                            />

                          </th>

                          <th className="px-5 py-4 text-sm text-gray-400">
                            N°
                          </th>

                          <th className="px-5 py-4 text-sm text-gray-400">
                            Client
                          </th>

                          <th className="px-5 py-4 text-sm text-gray-400">
                            Téléphone / SMS
                          </th>

                          <th className="px-5 py-4 text-sm text-gray-400">
                            Catégorie
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {clientsFiltres.map(
                          (client) =>
                          (
                            <tr
                              key={client.id}
                              className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 ${
                                clientsSelectionnes.includes(
                                  client.id
                                )
                                  ? "bg-gray-800/70"
                                  : ""
                              }`}
                            >

                              <td className="px-5 py-4">

                                <input
                                  type="checkbox"
                                  checked={clientsSelectionnes.includes(
                                    client.id
                                  )}
                                  onChange={() =>
                                  {
                                    basculerSelectionClient(
                                      client.id
                                    );
                                  }}
                                  className="h-4 w-4"
                                />

                              </td>

                              <td className="px-5 py-4 font-mono text-gray-400">
                                #{client.numero_client}
                              </td>

                              <td className="px-5 py-4">

                                <button
                                  onClick={() =>
                                  {
                                    router.push(
                                      `/clients/${client.id}`
                                    );
                                  }}
                                  className="text-left font-medium hover:underline"
                                >
                                  {client.prenom}{" "}
                                  {client.nom}
                                </button>

                                {client.email && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {client.email}
                                  </p>
                                )}

                              </td>

                              <td className="px-5 py-4">

                                <p className="text-gray-300">
                                  {client.telephone}
                                </p>

                                {client.sms_consentement ? (
                                  <span className="mt-1 inline-flex rounded-full bg-green-950 px-2 py-1 text-xs text-green-400">
                                    ✓ SMS autorisé
                                  </span>
                                ) : (
                                  <span className="mt-1 inline-flex rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-500">
                                    ✕ SMS non autorisé
                                  </span>
                                )}

                              </td>

                              <td className="px-5 py-4">

                                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
                                  {client.categorie}
                                </span>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}

          {/* CORBEILLE */}

          {vue === "corbeille" && (
            <>

              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="font-semibold">
                    Gestion de la corbeille
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Les clients restent récupérables jusqu'à leur suppression définitive.
                  </p>

                </div>

                <button
                  onClick={
                    supprimerAnciensClients
                  }
                  disabled={suppression}
                  className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
                >
                  {suppression
                    ? "Suppression..."
                    : "Supprimer les +30 jours"}
                </button>

              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

                {corbeille.length === 0 ? (
                  <div className="p-10 text-center">

                    <div className="text-5xl">
                      🗑️
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                      Corbeille vide
                    </h2>

                    <p className="mt-2 text-gray-400">
                      Aucun client dans la corbeille.
                    </p>

                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">

                    {corbeille.map(
                      (client) =>
                      (
                        <div
                          key={client.id}
                          className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                        >

                          <div>

                            <p className="font-medium">
                              {client.prenom}{" "}
                              {client.nom}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Client #{client.numero_client}
                            </p>

                            {client.date_suppression && (
                              <p className="mt-1 text-sm text-gray-400">
                                Supprimé le{" "}
                                {new Date(
                                  client.date_suppression
                                ).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            )}

                          </div>

                          <div className="flex flex-wrap gap-3">

                            <button
                              onClick={() =>
                              {
                                restaurer(
                                  client.id
                                );
                              }}
                              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                            >
                              Restaurer
                            </button>

                            <button
                              onClick={() =>
                              {
                                supprimerDefinitivement(
                                  client
                                );
                              }}
                              className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                            >
                              Supprimer définitivement
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </>
          )}

        </section>

      </div>

      {/* BULLE SMS */}

      {vue === "clients" &&
        clientsSelectionnes.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">

            <button
              onClick={() =>
              {
                /*
                 * Pour le moment, on ne fait rien.
                 *
                 * Cette action sera reliée plus tard
                 * au système d'envoi de SMS.
                 */
                console.log(
                  "Clients sélectionnés :",
                  clientsSelectionnes
                );
              }}
              className="flex items-center gap-3 rounded-full bg-white px-6 py-4 font-semibold text-black shadow-2xl hover:scale-105"
            >

              <span className="text-xl">
                💬
              </span>

              <span>
                Envoyer un SMS
              </span>

              <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">
                {clientsSelectionnes.length}
              </span>

            </button>

          </div>
        )}

    </main>
  );
}
