"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/ui/Sidebar";
import ClientForm from "@/ui/clients/ClientForm";
import RoleGuard from "@/ui/auth/RoleGuard";

import {
  rechercherClients,
  recupererCorbeille,
  restaurerClient,
  supprimerClientDefinitivement,
  supprimerClientsDePlusDe30Jours,
  type Client
} from "@/lib/clients";

function ClientsContent()
{
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [corbeille, setCorbeille] = useState<Client[]>([]);

  const [recherche, setRecherche] = useState("");
  const [vue, setVue] = useState<"clients" | "corbeille">("clients");

  const [categoriesSelectionnees, setCategoriesSelectionnees] =
    useState<string[]>([]);

  const [filtreSms, setFiltreSms] =
    useState<"tous" | "autorise" | "non_autorise">("tous");

  const [clientsSelectionnes, setClientsSelectionnes] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [suppression, setSuppression] = useState(false);

  async function chargerClients()
  {
    try
    {
      setClients(await rechercherClients());
    }
    catch (error)
    {
      console.error(error);
      setErreur("Impossible de récupérer les clients.");
    }
  }

  async function chargerCorbeille()
  {
    try
    {
      setCorbeille(await recupererCorbeille());
    }
    catch (error)
    {
      console.error(error);
      setErreur("Impossible de récupérer la corbeille.");
    }
  }

  useEffect(() =>
  {
    let actif = true;

    async function charger()
    {
      try
      {
        const [clientsData, corbeilleData] = await Promise.all([
          rechercherClients(),
          recupererCorbeille()
        ]);

        if (!actif)
        {
          return;
        }

        setClients(clientsData);
        setCorbeille(corbeilleData);
      }
      catch (error)
      {
        console.error(error);

        if (actif)
        {
          setErreur("Impossible de récupérer les clients.");
        }
      }
      finally
      {
        if (actif)
        {
          setLoading(false);
        }
      }
    }

    void charger();

    return () =>
    {
      actif = false;
    };
  }, []);

  async function restaurer(id: string)
  {
    try
    {
      setErreur("");

      await restaurerClient(id);
      await Promise.all([
        chargerClients(),
        chargerCorbeille()
      ]);
    }
    catch (error)
    {
      console.error(error);
      setErreur("Impossible de restaurer le client.");
    }
  }

  async function supprimerDefinitivement(client: Client)
  {
    if (
      !window.confirm(
        `Supprimer définitivement ${client.prenom} ${client.nom} ?\n\nCette action est irréversible.`
      )
    )
    {
      return;
    }

    try
    {
      setErreur("");

      await supprimerClientDefinitivement(client.id);
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
    if (
      !window.confirm(
        "Supprimer définitivement tous les clients présents dans la corbeille depuis plus de 30 jours ?\n\nCette action est irréversible."
      )
    )
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
      setErreur("Impossible de supprimer les anciens clients.");
    }
    finally
    {
      setSuppression(false);
    }
  }

  const categories = Array.from(
    new Set(clients.map((client) => client.categorie))
  ).sort();

  const texteRecherche = recherche.toLowerCase().trim();

  const clientsFiltres = clients.filter((client) =>
  {
    const correspondRecherche =
      client.nom.toLowerCase().includes(texteRecherche) ||
      client.prenom.toLowerCase().includes(texteRecherche) ||
      (client.pseudo ?? "").toLowerCase().includes(texteRecherche) ||
      (client.reseaux_sociaux ?? "").toLowerCase().includes(texteRecherche) ||
      client.telephone.includes(texteRecherche) ||
      client.numero_client.toString().includes(texteRecherche);

    const correspondCategorie =
      categoriesSelectionnees.length === 0 ||
      categoriesSelectionnees.includes(client.categorie);

    const correspondSms =
      filtreSms === "tous" ||
      (filtreSms === "autorise" && client.sms_consentement) ||
      (filtreSms === "non_autorise" && !client.sms_consentement);

    return (
      correspondRecherche &&
      correspondCategorie &&
      correspondSms
    );
  });

  function basculerSelectionClient(id: string)
  {
    setClientsSelectionnes((selection) =>
      selection.includes(id)
        ? selection.filter((clientId) => clientId !== id)
        : [...selection, id]
    );
  }

  function basculerSelectionTous()
  {
    const ids = clientsFiltres.map((client) => client.id);

    const tousSelectionnes =
      ids.length > 0 &&
      ids.every((id) => clientsSelectionnes.includes(id));

    setClientsSelectionnes((selection) =>
    {
      if (tousSelectionnes)
      {
        return selection.filter((id) => !ids.includes(id));
      }

      return Array.from(new Set([...selection, ...ids]));
    });
  }

  function basculerCategorie(categorie: string)
  {
    setCategoriesSelectionnees((selection) =>
      selection.includes(categorie)
        ? selection.filter((item) => item !== categorie)
        : [...selection, categorie]
    );
  }

  const tousLesClientsVisiblesSelectionnes =
    clientsFiltres.length > 0 &&
    clientsFiltres.every((client) =>
      clientsSelectionnes.includes(client.id)
    );

  function changerVue(nouvelleVue: "clients" | "corbeille")
  {
    setVue(nouvelleVue);
    setRecherche("");
    setErreur("");
    setClientsSelectionnes([]);

    if (nouvelleVue === "corbeille")
    {
      setFormulaireOuvert(false);
    }
  }

  if (loading)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">

      <div className="min-h-screen">

        <Sidebar />

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:ml-64 md:p-10 ">

          {/* ========================================================
              EN-TÊTE
          ======================================================== */}

          <header className="mb-6 sm:mb-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <p className="text-sm text-gray-400">
                  Gestion du salon
                </p>

                <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
                  {vue === "clients"
                    ? "👥 Clients"
                    : "🗑️ Corbeille"}
                </h1>

                {vue === "clients" && (
                  <p className="mt-2 text-sm text-gray-400">
                    {clients.length} client
                    {clients.length !== 1 ? "s" : ""}
                  </p>
                )}

              </div>

              {vue === "clients" && (
                <button
                  onClick={() =>
                    setFormulaireOuvert(!formulaireOuvert)
                  }
                  className="w-full rounded-lg bg-white px-5 py-3 font-medium text-black hover:opacity-90 sm:w-auto"
                >
                  {formulaireOuvert
                    ? "Fermer"
                    : "+ Ajouter un client"}
                </button>
              )}

            </div>

            {/* NAVIGATION CLIENTS / CORBEILLE */}

            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">

              <button
                onClick={() => changerVue("clients")}
                className={`rounded-lg px-4 py-3 text-sm ${
                  vue === "clients"
                    ? "bg-white text-black"
                    : "border border-gray-700 text-gray-300"
                }`}
              >
                👥 Clients
              </button>

              <button
                onClick={() => changerVue("corbeille")}
                className={`rounded-lg px-4 py-3 text-sm ${
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


          {/* ========================================================
              ERREUR
          ======================================================== */}

          {erreur && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">
              {erreur}
            </div>
          )}


          {/* ========================================================
              CLIENTS
          ======================================================== */}

          {vue === "clients" && (
            <>

              {formulaireOuvert && (
                <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-6">

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


              {/* ====================================================
                  RECHERCHE / FILTRES
              ==================================================== */}

              <div className="mb-5 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5">

                <input
                  type="text"
                  value={recherche}
                  onChange={(event) =>
                    setRecherche(event.target.value)
                  }
                  placeholder="Rechercher un client..."
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-base text-white outline-none placeholder:text-gray-500 focus:ring-2"
                />

                <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">

                  <details className="relative">

                    <summary className="cursor-pointer list-none rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300">
                      Catégories
                      {categoriesSelectionnees.length > 0 && (
                        <span className="ml-2">
                          ({categoriesSelectionnees.length})
                        </span>
                      )}
                    </summary>

                    <div className="absolute left-0 z-30 mt-2 w-full min-w-64 max-w-xs rounded-xl border border-gray-700 bg-gray-900 p-3 shadow-xl">

                      {categories.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucune catégorie
                        </p>
                      ) : (
                        categories.map((categorie) => (
                          <label
                            key={categorie}
                            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800"
                          >

                            <input
                              type="checkbox"
                              checked={categoriesSelectionnees.includes(
                                categorie
                              )}
                              onChange={() =>
                                basculerCategorie(categorie)
                              }
                              className="h-5 w-5"
                            />

                            <span className="text-sm">
                              {categorie}
                            </span>

                          </label>
                        ))
                      )}

                    </div>

                  </details>

                  <select
                    value={filtreSms}
                    onChange={(event) =>
                      setFiltreSms(
                        event.target.value as
                          | "tous"
                          | "autorise"
                          | "non_autorise"
                      )
                    }
                    className="min-h-11 rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-300 outline-none"
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
                      className="min-h-11 rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Réinitialiser
                    </button>
                  )}

                </div>

              </div>


              {/* ====================================================
                  COMPTEUR
              ==================================================== */}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                <p className="text-sm text-gray-400">
                  {clientsFiltres.length} client
                  {clientsFiltres.length !== 1 ? "s" : ""}
                  {" "}affiché
                  {clientsFiltres.length !== 1 ? "s" : ""}
                </p>

                {clientsSelectionnes.length > 0 && (
                  <p className="text-sm text-gray-300">
                    {clientsSelectionnes.length} sélectionné
                    {clientsSelectionnes.length !== 1 ? "s" : ""}
                  </p>
                )}

              </div>


              {/* ====================================================
                  LISTE MOBILE
              ==================================================== */}

              <div className="space-y-3 md:hidden">

                {clientsFiltres.length === 0 ? (
                  <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">

                    <div className="text-5xl">
                      👥
                    </div>

                    <h2 className="mt-4 text-lg font-semibold">
                      Aucun client trouvé
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      Essayez de modifier votre recherche ou vos filtres.
                    </p>

                  </div>
                ) : (
                  clientsFiltres.map((client) =>
                  {
                    const selectionne =
                      clientsSelectionnes.includes(client.id);

                    return (
                      <div
                        key={client.id}
                        className={`rounded-2xl border bg-gray-900 p-4 ${
                          selectionne
                            ? "border-gray-500"
                            : "border-gray-800"
                        }`}
                      >

                        <div className="flex items-start gap-3">

                          <input
                            type="checkbox"
                            checked={selectionne}
                            onChange={() =>
                              basculerSelectionClient(client.id)
                            }
                            className="mt-1 h-5 w-5 shrink-0"
                          />

                          <button
                            onClick={() =>
                              router.push(`/clients/${client.id}`)
                            }
                            className="min-w-0 flex-1 text-left"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <p className="break-words font-semibold">
                                  {client.prenom}{" "}
                                  {client.nom}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  Client #{client.numero_client}
                                </p>

                              </div>

                              <span className="shrink-0 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
                                {client.categorie}
                              </span>

                            </div>

                            <p className="mt-3 break-all text-sm text-gray-300">
                              {client.telephone}
                            </p>

                            {client.email && (
                              <p className="mt-1 break-all text-sm text-gray-500">
                                {client.email}
                              </p>
                            )}

                            {client.sms_consentement ? (
                              <span className="mt-3 inline-flex rounded-full bg-green-950 px-2.5 py-1 text-xs text-green-400">
                                ✓ SMS autorisé
                              </span>
                            ) : (
                              <span className="mt-3 inline-flex rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-500">
                                ✕ SMS non autorisé
                              </span>
                            )}

                          </button>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>


              {/* ====================================================
                  TABLEAU TABLETTE / PC
              ==================================================== */}

              <div className="hidden overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 md:block">

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

                    <table className="w-full min-w-[720px] text-left">

                      <thead className="border-b border-gray-800 bg-gray-950">

                        <tr>

                          <th className="w-14 px-5 py-4">

                            <input
                              type="checkbox"
                              checked={
                                tousLesClientsVisiblesSelectionnes
                              }
                              onChange={basculerSelectionTous}
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

                        {clientsFiltres.map((client) =>
                        (
                          <tr
                            key={client.id}
                            className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 ${
                              clientsSelectionnes.includes(client.id)
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
                                  basculerSelectionClient(client.id)
                                }
                                className="h-4 w-4"
                              />

                            </td>

                            <td className="px-5 py-4 font-mono text-gray-400">
                              #{client.numero_client}
                            </td>

                            <td className="px-5 py-4">

                              <button
                                onClick={() =>
                                  router.push(`/clients/${client.id}`)
                                }
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
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}


          {/* ========================================================
              CORBEILLE
          ======================================================== */}

          {vue === "corbeille" && (
            <>

              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">

                <div className="min-w-0">

                  <h2 className="font-semibold">
                    Gestion de la corbeille
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    Les clients restent récupérables jusqu&apos;à leur suppression définitive.
                  </p>

                </div>

                <button
                  onClick={supprimerAnciensClients}
                  disabled={suppression}
                  className="w-full rounded-lg border border-red-800 px-4 py-3 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50 md:w-auto"
                >
                  {suppression
                    ? "Suppression..."
                    : "Supprimer les +30 jours"}
                </button>

              </div>


              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

                {corbeille.length === 0 ? (
                  <div className="p-8 text-center sm:p-10">

                    <div className="text-5xl">
                      🗑️
                    </div>

                    <h2 className="mt-4 text-lg font-semibold sm:text-xl">
                      Corbeille vide
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      Aucun client dans la corbeille.
                    </p>

                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">

                    {corbeille.map((client) =>
                    (
                      <div
                        key={client.id}
                        className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
                      >

                        <div className="min-w-0">

                          <p className="break-words font-medium">
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
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          )}

                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:flex">

                          <button
                            onClick={() =>
                              restaurer(client.id)
                            }
                            className="min-h-11 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-90"
                          >
                            Restaurer
                          </button>

                          <button
                            onClick={() =>
                              supprimerDefinitivement(client)
                            }
                            className="min-h-11 rounded-lg border border-red-800 px-4 py-3 text-sm text-red-400 hover:bg-red-950"
                          >
                            Supprimer définitivement
                          </button>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </>
          )}

        </section>

      </div>


      {/* ============================================================
          BULLE SMS
      ============================================================ */}

      {vue === "clients" &&
        clientsSelectionnes.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-auto sm:right-6">

            <button
              onClick={() =>
              {
                console.log(
                  "Clients sélectionnés :",
                  clientsSelectionnes
                );
              }}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 font-semibold text-black shadow-2xl sm:w-auto sm:px-6 sm:py-4"
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

export default function Clients()
{
  return <RoleGuard roles={["ADMIN", "COIFFEUR"]}><ClientsContent /></RoleGuard>;
}
