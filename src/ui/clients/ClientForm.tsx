"use client";

import { FormEvent, useState } from "react";
import {
  ajouterClient,
  modifierClient,
  type Client,
  type ClientInput
} from "@/lib/clients";

type ClientFormProps =
{
  client?: Client;
  onClientAjoute?: () => void;
  onClientModifie?: () => void;
  onFermer?: () => void;
};

export default function ClientForm(
  {
    client,
    onClientAjoute,
    onClientModifie,
    onFermer
  }: ClientFormProps
)
{
  const [prenom, setPrenom] = useState(
    client?.prenom ?? ""
  );

  const [nom, setNom] = useState(
    client?.nom ?? ""
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

  const [smsConsentement, setSmsConsentement] = useState(
    client?.sms_consentement ?? false
  );

  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  const modification = Boolean(client);

  const donneesClient: ClientInput = {
    prenom,
    nom,
    telephone,
    email,
    dateNaissance,
    sexe,
    categorie,
    notes,
    smsConsentement
  };

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
