"use client";

import { FormEvent, useState } from "react";
import {
  ajouterClient,
  inscrireClient,
  modifierClient,
  type Client,
  type ClientInput,
  type LocalisationInput
} from "@/lib/clients";

const paysSuggestions = [
  "France", "Belgique", "Suisse", "Luxembourg", "Canada",
  "Maroc", "Algérie", "Tunisie", "Sénégal", "Côte d’Ivoire"
];

type ClientFormProps =
{
  client?: Client;
  onClientAjoute?: () => void;
  onClientModifie?: () => void;
  onClientInscrit?: (numeroClient: number) => void;
  onFermer?: () => void;
  mode?: "interne" | "inscription";
};

export default function ClientForm(
  {
    client,
    onClientAjoute,
    onClientModifie,
    onClientInscrit,
    onFermer,
    mode = "interne"
  }: ClientFormProps
)
{
  const [prenom, setPrenom] = useState(
    client?.prenom ?? ""
  );

  const [nom, setNom] = useState(
    client?.nom ?? ""
  );

  const [pseudo, setPseudo] = useState(
    client?.pseudo ?? ""
  );

  const [telephone, setTelephone] = useState(
    client?.telephone ?? ""
  );

  const [email, setEmail] = useState(
    client?.email ?? ""
  );

  const [dateNaissance, setDateNaissance] = useState(
    client?.date_naissance ?? ""
  );

  const [sexe, setSexe] = useState(
    client?.sexe ?? ""
  );

  const [categorie, setCategorie] = useState(
    client?.categorie ?? "Client"
  );

  const [notes, setNotes] = useState(
    client?.notes ?? ""
  );

  const [reseauxSociaux, setReseauxSociaux] = useState(
    client?.reseaux_sociaux ?? ""
  );

  const [localisations, setLocalisations] = useState<LocalisationInput[]>(
    client?.localisations?.map(({ id, pays, ville }) => ({
      id,
      pays,
      ville: ville ?? ""
    })) ?? []
  );

  const [smsConsentement, setSmsConsentement] = useState(
    client?.sms_consentement ?? false
  );

  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  const modification = Boolean(client);
  const inscription = mode === "inscription";

  const donneesClient: ClientInput = {
    prenom,
    nom,
    telephone,
    email,
    dateNaissance,
    sexe,
    categorie,
    notes,
    pseudo,
    reseauxSociaux,
    localisations,
    smsConsentement
  };

  function ajouterLocalisation()
  {
    setLocalisations((liste) => [
      ...liste,
      { pays: "", ville: "" }
    ]);
  }

  function modifierLocalisation(
    index: number,
    champ: "pays" | "ville",
    valeur: string
  )
  {
    setLocalisations((liste) => liste.map((localisation, position) =>
      position === index
        ? { ...localisation, [champ]: valeur }
        : localisation
    ));
  }

  function supprimerLocalisation(index: number)
  {
    setLocalisations((liste) =>
      liste.filter((_, position) => position !== index)
    );
  }

  async function enregistrer(
    event: FormEvent<HTMLFormElement>
  )
  {
    event.preventDefault();

    setEnregistrement(true);
    setErreur("");

    try
    {
      if (client)
      {
        await modifierClient(
          client.id,
          donneesClient,
          client.sms_consentement
        );

        onClientModifie?.();
      }
      else if (inscription)
      {
        const numeroClient = await inscrireClient(donneesClient);
        onClientInscrit?.(numeroClient);
      }
      else
      {
        await ajouterClient(donneesClient);

        onClientAjoute?.();
      }
    }
    catch (error)
    {
      console.error(error);

      setErreur(
        modification
          ? "Impossible de modifier le client."
          : "Impossible d'ajouter le client."
      );
    }
    finally
    {
      setEnregistrement(false);
    }
  }

  return (
    <form
      onSubmit={enregistrer}
      className="space-y-6"
    >

      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Prénom
          </label>

          <input
            type="text"
            value={prenom}
            onChange={(event) =>
            {
              setPrenom(event.target.value);
            }}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Nom
          </label>

          <input
            type="text"
            value={nom}
            onChange={(event) =>
            {
              setNom(event.target.value);
            }}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pseudo
          </label>

          <input
            type="text"
            value={pseudo}
            onChange={(event) =>
            {
              setPseudo(event.target.value);
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Téléphone
          </label>

          <input
            type="tel"
            value={telephone}
            onChange={(event) =>
            {
              setTelephone(event.target.value);
            }}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
            {
              setEmail(event.target.value);
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date de naissance
          </label>

          <input
            type="date"
            value={dateNaissance}
            onChange={(event) =>
            {
              setDateNaissance(event.target.value);
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Sexe
          </label>

          <select
            value={sexe}
            onChange={(event) =>
            {
              setSexe(event.target.value);
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          >
            <option value="">
              Non renseigné
            </option>

            <option value="Homme">
              Homme
            </option>

            <option value="Femme">
              Femme
            </option>
          </select>
        </div>

        {!inscription && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Catégorie
          </label>

          <select
            value={categorie}
            onChange={(event) =>
            {
              setCategorie(event.target.value);
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          >
            <option value="Client">
              Client
            </option>

            <option value="VIP">
              VIP
            </option>

            <option value="Ancien client">
              Ancien client
            </option>

            <option value="Proche">
              Proche
            </option>
          </select>
        </div>
        )}

      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Réseaux sociaux
        </label>

        <input
          type="text"
          value={reseauxSociaux}
          onChange={(event) =>
          {
            setReseauxSociaux(event.target.value);
          }}
          placeholder="Instagram, Snapchat, @pseudo…"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
        />
      </div>

      <div className="rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">Pays et villes de résidence</h3>
            <p className="mt-1 text-sm text-gray-400">
              Facultatif : ajoutez autant de résidences que nécessaire.
            </p>
          </div>

          <button
            type="button"
            onClick={ajouterLocalisation}
            className="shrink-0 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            + Ajouter
          </button>
        </div>

        <datalist id="pays-residence">
          {paysSuggestions.map((pays) => (
            <option key={pays} value={pays} />
          ))}
        </datalist>

        <div className="mt-4 space-y-3">
          {localisations.map((localisation, index) => (
            <div key={localisation.id ?? index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                list="pays-residence"
                value={localisation.pays}
                onChange={(event) =>
                  modifierLocalisation(index, "pays", event.target.value)
                }
                placeholder="Pays"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
              />

              <input
                type="text"
                value={localisation.ville}
                onChange={(event) =>
                  modifierLocalisation(index, "ville", event.target.value)
                }
                placeholder="Ville"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
              />

              <button
                type="button"
                onClick={() => supprimerLocalisation(index)}
                className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
          {
            setNotes(event.target.value);
          }}
          rows={4}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
        />
      </div>

      <label className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={smsConsentement}
          onChange={(event) =>
          {
            setSmsConsentement(event.target.checked);
          }}
          className="h-4 w-4"
        />

        <span className="text-sm">
          Le client accepte de recevoir des SMS
        </span>

      </label>

      {erreur && (
        <div className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
          {erreur}
        </div>
      )}

      <div className="flex gap-3">

        <button
          type="submit"
          disabled={enregistrement}
          className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {enregistrement
            ? "Enregistrement..."
            : modification
              ? "Enregistrer les modifications"
              : "Ajouter le client"}
        </button>

        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-gray-700 px-5 py-3 text-gray-300 hover:bg-gray-800"
          >
            Annuler
          </button>
        )}

      </div>

    </form>
  );
}
