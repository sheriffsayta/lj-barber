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
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne",
  "Andorre", "Angola", "Arabie saoudite", "Argentine", "Arménie",
  "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn",
  "Bangladesh", "Belgique", "Bénin", "Bolivie", "Bosnie-Herzégovine",
  "Brésil", "Bulgarie", "Burkina Faso", "Burundi", "Cameroun", "Canada",
  "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores",
  "Congo", "Corée du Sud", "Costa Rica", "Côte d’Ivoire", "Croatie",
  "Cuba", "Danemark", "Djibouti", "Égypte", "Émirats arabes unis",
  "Équateur", "Espagne", "Estonie", "États-Unis", "Éthiopie", "Finlande",
  "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Guinée",
  "Haïti", "Hongrie", "Inde", "Indonésie", "Irlande", "Islande", "Israël",
  "Italie", "Jamaïque", "Japon", "Jordanie", "Kenya", "Koweït", "Laos",
  "Lettonie", "Liban", "Libye", "Lituanie", "Luxembourg", "Madagascar",
  "Malaisie", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique",
  "Moldavie", "Monaco", "Monténégro", "Mozambique", "Niger", "Nigeria",
  "Norvège", "Nouvelle-Zélande", "Oman", "Pakistan", "Palestine", "Panama",
  "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal",
  "Qatar", "République démocratique du Congo", "République dominicaine",
  "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Sénégal", "Serbie",
  "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Sri Lanka",
  "Suède", "Suisse", "Syrie", "Tanzanie", "Tchad", "Thaïlande", "Togo",
  "Tunisie", "Turquie", "Ukraine", "Uruguay", "Venezuela", "Vietnam", "Yémen"
];

const countrySuggestions = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Belgium", "Benin", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
  "Burkina Faso", "Burundi", "Cameroon", "Canada", "Cape Verde", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti",
  "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guinea",
  "Haiti", "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kenya", "Kuwait", "Laos", "Latvia",
  "Lebanon", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malaysia", "Mali",
  "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Montenegro",
  "Morocco", "Mozambique", "Netherlands", "New Zealand", "Niger", "Nigeria", "Norway",
  "Oman", "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Republic of the Congo", "Romania", "Russia", "Rwanda",
  "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela",
  "Vietnam", "Yemen"
];

export type ClientFormLanguage = "fr" | "en";

type ClientFormProps =
{
  client?: Client;
  onClientAjoute?: () => void;
  onClientModifie?: () => void;
  onClientInscrit?: (numeroClient: number) => void;
  onFermer?: () => void;
  mode?: "interne" | "inscription";
  language?: ClientFormLanguage;
};

export default function ClientForm(
  {
    client,
    onClientAjoute,
    onClientModifie,
    onClientInscrit,
    onFermer,
    mode = "interne",
    language = "fr"
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

  const [emailConsentement, setEmailConsentement] = useState(
    client?.email_consentement ?? false
  );

  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  const modification = Boolean(client);
  const inscription = mode === "inscription";
  const anglais = inscription && language === "en";
  const textes = anglais
    ? {
        prenom: "First name",
        nom: "Last name",
        pseudo: "Nickname",
        telephone: "Phone number",
        email: "Email",
        dateNaissance: "Date of birth",
        sexe: "Gender",
        nonRenseigne: "Not specified",
        homme: "Male",
        femme: "Female",
        reseauxSociaux: "Social media",
        reseauxPlaceholder: "Instagram, Snapchat, @username…",
        residences: "Countries and cities of residence",
        residencesAide: "Optional: add as many places of residence as needed.",
        ajouter: "+ Add",
        pays: "Country",
        ville: "City",
        retirer: "Remove",
        notes: "Notes",
        consentementSms: "I agree to receive text messages",
        consentementEmail: "I agree to receive emails",
        emailRequis: " (enter an email address first)",
        erreur: "Unable to complete your registration.",
        enregistrement: "Saving…",
        soumettre: "Complete my registration",
        annuler: "Cancel"
      }
    : {
        prenom: "Prénom",
        nom: "Nom",
        pseudo: "Pseudo",
        telephone: "Téléphone",
        email: "E-mail",
        dateNaissance: "Date de naissance",
        sexe: "Sexe",
        nonRenseigne: "Non renseigné",
        homme: "Homme",
        femme: "Femme",
        reseauxSociaux: "Réseaux sociaux",
        reseauxPlaceholder: "Instagram, Snapchat, @pseudo…",
        residences: "Pays et villes de résidence",
        residencesAide: "Facultatif : ajoutez autant de résidences que nécessaire.",
        ajouter: "+ Ajouter",
        pays: "Pays",
        ville: "Ville",
        retirer: "Retirer",
        notes: "Notes",
        consentementSms: inscription
          ? "J’accepte de recevoir des SMS"
          : "Le client accepte de recevoir des SMS",
        consentementEmail: inscription
          ? "J’accepte de recevoir des e-mails"
          : "Le client accepte de recevoir des e-mails",
        emailRequis: " (renseignez d’abord une adresse e-mail)",
        erreur: "Impossible de finaliser votre inscription.",
        enregistrement: "Enregistrement…",
        soumettre: "Valider mon inscription",
        annuler: "Annuler"
      };

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
    smsConsentement,
    emailConsentement
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
          client.sms_consentement,
          client.email_consentement
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
        inscription
          ? textes.erreur
          : modification
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
            {textes.prenom}
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
            {textes.nom}
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
            {textes.pseudo}
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
            {textes.telephone}
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
            {textes.email}
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
            {
              const nouvelleAdresse = event.target.value;
              setEmail(nouvelleAdresse);

              if (!nouvelleAdresse.trim())
              {
                setEmailConsentement(false);
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {textes.dateNaissance}
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
            {textes.sexe}
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
              {textes.nonRenseigne}
            </option>

            <option value="Homme">
              {textes.homme}
            </option>

            <option value="Femme">
              {textes.femme}
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
          {textes.reseauxSociaux}
        </label>

        <input
          type="text"
          value={reseauxSociaux}
          onChange={(event) =>
          {
            setReseauxSociaux(event.target.value);
          }}
          placeholder={textes.reseauxPlaceholder}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
        />
      </div>

      <div className="rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">{textes.residences}</h3>
            <p className="mt-1 text-sm text-gray-400">
              {textes.residencesAide}
            </p>
          </div>

          <button
            type="button"
            onClick={ajouterLocalisation}
            className="shrink-0 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            {textes.ajouter}
          </button>
        </div>

        <datalist id="pays-residence">
          {(anglais ? countrySuggestions : paysSuggestions).map((pays) => (
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
                placeholder={textes.pays}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
              />

              <input
                type="text"
                value={localisation.ville}
                onChange={(event) =>
                  modifierLocalisation(index, "ville", event.target.value)
                }
                placeholder={textes.ville}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2"
              />

              <button
                type="button"
                onClick={() => supprimerLocalisation(index)}
                className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950"
              >
                {textes.retirer}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          {textes.notes}
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
          {textes.consentementSms}
        </span>

      </label>

      <label className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={emailConsentement}
          disabled={!email.trim()}
          onChange={(event) =>
          {
            setEmailConsentement(event.target.checked);
          }}
          className="h-4 w-4 disabled:opacity-50"
        />

        <span className="text-sm">
          {textes.consentementEmail}
          {!email.trim() && textes.emailRequis}
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
            ? textes.enregistrement
            : modification
              ? "Enregistrer les modifications"
              : inscription
                ? textes.soumettre
                : "Ajouter le client"}
        </button>

        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-gray-700 px-5 py-3 text-gray-300 hover:bg-gray-800"
          >
            {textes.annuler}
          </button>
        )}

      </div>

    </form>
  );
}
