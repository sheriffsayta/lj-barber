"use client";

import { useEffect, useMemo, useState } from "react";
import { recupererPrestationsMois, type Prestation } from "@/lib/clients";

function formaterEuro(montant: number)
{
  return montant.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
}

function valeurMois(date: Date)
{
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function RevenueCalendar()
{
  const maintenant = new Date();
  const [moisAffiche, setMoisAffiche] = useState(
    () => new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
  );
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() =>
  {
    let actif = true;

    async function charger()
    {
      setChargement(true);
      setErreur("");

      try
      {
        const donnees = await recupererPrestationsMois(
          moisAffiche.getFullYear(),
          moisAffiche.getMonth()
        );

        if (actif)
        {
          setPrestations(donnees);
        }
      }
      catch (cause)
      {
        console.error(cause);

        if (actif)
        {
          setErreur("Impossible de charger les prestations de ce mois.");
        }
      }
      finally
      {
        if (actif)
        {
          setChargement(false);
        }
      }
    }

    void charger();

    return () =>
    {
      actif = false;
    };
  }, [moisAffiche]);

  const jours = useMemo(() =>
  {
    const nombreJours = new Date(
      moisAffiche.getFullYear(),
      moisAffiche.getMonth() + 1,
      0
    ).getDate();

    const parDate = new Map<string, { nombre: number; montant: number }>();

    for (const prestation of prestations)
    {
      const actuel = parDate.get(prestation.date_prestation) ?? { nombre: 0, montant: 0 };
      actuel.nombre += 1;
      actuel.montant += Number(prestation.prix ?? 0);
      parDate.set(prestation.date_prestation, actuel);
    }

    return Array.from({ length: nombreJours }, (_, index) =>
    {
      const jour = index + 1;
      const date = new Date(moisAffiche.getFullYear(), moisAffiche.getMonth(), jour);
      const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
      const statistiques = parDate.get(cle) ?? { nombre: 0, montant: 0 };

      return { date, jour, ...statistiques };
    });
  }, [moisAffiche, prestations]);

  const chiffreAffaires = prestations.reduce(
    (total, prestation) => total + Number(prestation.prix ?? 0),
    0
  );

  function changerMois(decalage: number)
  {
    setMoisAffiche((date) => new Date(date.getFullYear(), date.getMonth() + decalage, 1));
  }

  function selectionnerMois(valeur: string)
  {
    const [annee, mois] = valeur.split("-").map(Number);

    if (annee && mois)
    {
      setMoisAffiche(new Date(annee, mois - 1, 1));
    }
  }

  const titreMois = moisAffiche.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric"
  });

  return (
    <section className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:mt-8 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-gray-400">Activité du salon</p>
          <h2 className="mt-1 text-2xl font-bold capitalize">{titreMois}</h2>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={() => changerMois(-1)}
            aria-label="Mois précédent"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-700 px-3 text-xl hover:bg-gray-800"
          >
            ←
          </button>

          <label className="min-w-44 flex-1 text-xs text-gray-400 sm:flex-none">
            Choisir le mois et l’année
            <input
              type="month"
              value={valeurMois(moisAffiche)}
              onChange={(event) => selectionnerMois(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <button
            type="button"
            onClick={() => changerMois(1)}
            aria-label="Mois suivant"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-700 px-3 text-xl hover:bg-gray-800"
          >
            →
          </button>
        </div>
      </div>

      {erreur && (
        <p role="alert" className="mt-5 rounded-xl bg-red-950 p-4 text-sm text-red-300">
          {erreur}
        </p>
      )}

      <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-3">
        <div className="flex min-w-max snap-x snap-mandatory gap-3">
          {jours.map(({ date, jour, nombre, montant }) =>
          {
            const aujourdhui =
              date.getFullYear() === maintenant.getFullYear() &&
              date.getMonth() === maintenant.getMonth() &&
              jour === maintenant.getDate();

            return (
              <article
                key={jour}
                className={`w-28 shrink-0 snap-start rounded-xl border p-3 text-center ${
                  aujourdhui ? "border-white bg-gray-800" : "border-gray-800 bg-gray-950"
                }`}
              >
                <p className="text-xs uppercase text-gray-500">
                  {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p className="mt-1 text-2xl font-bold">{jour}</p>
                <p className="mt-3 text-xs text-gray-400">
                  {chargement ? "…" : `${nombre} prestation${nombre !== 1 ? "s" : ""}`}
                </p>
                <p className="mt-2 text-sm font-semibold text-green-400">
                  {chargement ? "—" : formaterEuro(montant)}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-green-900 bg-green-950/40 p-5 sm:flex sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-green-300">Chiffre d’affaires du mois</p>
          <p className="mt-1 text-xs text-gray-400">
            Somme des prix renseignés sur {prestations.length} prestation{prestations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <p className="mt-4 text-3xl font-bold text-green-400 sm:mt-0">
          {chargement ? "Chargement…" : formaterEuro(chiffreAffaires)}
        </p>
      </div>
    </section>
  );
}
