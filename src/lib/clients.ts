import { supabase } from "@/lib/supabase";

export type Client =
{
  id: string;
  numero_client: number;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  date_naissance: string | null;
  sexe: string | null;
  categorie: string;
  notes: string | null;
  pseudo: string | null;
  reseaux_sociaux: string | null;
  sms_consentement: boolean;
  sms_consentement_date: string | null;
  date_suppression: string | null;
  localisations?: Localisation[];
};

export type Localisation = {
  id: string;
  client_id: string;
  pays: string;
  ville: string | null;
};

export type LocalisationInput = {
  id?: string;
  pays: string;
  ville: string;
};

/**
 * Champs modifiables depuis les formulaires client.
 * Ajouter un nouveau champ ici le rend disponible sans exposer les champs
 * techniques de la table (id, numero_client, dates de suppression, etc.).
 */
export type ClientInput = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  dateNaissance: string;
  sexe: string;
  categorie: string;
  notes: string;
  pseudo: string;
  reseauxSociaux: string;
  localisations: LocalisationInput[];
  smsConsentement: boolean;
};

export async function inscrireClient(
  donnees: ClientInput
)
{
  const { data, error } = await supabase.rpc("inscrire_client", {
    p_prenom: donnees.prenom,
    p_nom: donnees.nom,
    p_pseudo: donnees.pseudo,
    p_telephone: donnees.telephone,
    p_email: donnees.email,
    p_date_naissance: donnees.dateNaissance || null,
    p_sexe: donnees.sexe || null,
    p_reseaux_sociaux: donnees.reseauxSociaux,
    p_notes: donnees.notes,
    p_sms_consentement: donnees.smsConsentement,
    p_localisations: donnees.localisations
  });

  if (error)
  {
    console.error("Erreur inscription client :", error);
    throw new Error("Impossible d'enregistrer l'inscription.");
  }

  return data?.[0]?.numero_client as number;
}

export type Prestation = 
{
  id: string;
  client_id: string;
  date_prestation: string; 
};
//
// ============================================================
// CLIENTS
// ============================================================
//

// Récupérer tous les clients actifs
export async function rechercherClients(
  recherche: string = ""
)
{
  const texte = recherche.trim();

  let requete = supabase
    .from("clients")
    .select("*, localisations:client_localisations(*)")
    .is("date_suppression", null)
    .order("numero_client", {
      ascending: true
    });

  if (texte)
  {
    requete = requete.or(
      `nom.ilike.%${texte}%,prenom.ilike.%${texte}%,telephone.ilike.%${texte}%`
    );
  }

  const
  {
    data,
    error
  } = await requete;

  if (error)
  {
    console.error(
      "Erreur recherche clients :",
      error
    );

    throw new Error(
      "Impossible de récupérer les clients."
    );
  }

  return data ?? [];
}


// Récupérer un client
export async function recupererClient(
  id: string
)
{
  const
  {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*, localisations:client_localisations(*)")
    .eq("id", id)
    .is("date_suppression", null)
    .single();

  if (error)
  {
    console.error(
      "Erreur récupération client :",
      error
    );

    throw new Error(
      "Impossible de récupérer le client."
    );
  }

  return data;
}

function normaliserLocalisations(
  localisations: LocalisationInput[]
)
{
  return localisations
    .map((localisation) => ({
      ...localisation,
      pays: localisation.pays.trim(),
      ville: localisation.ville.trim()
    }))
    .filter((localisation) => localisation.pays);
}

async function synchroniserLocalisations(
  clientId: string,
  localisations: LocalisationInput[]
)
{
  const { data: existantes, error: erreurLecture } = await supabase
    .from("client_localisations")
    .select("*")
    .eq("client_id", clientId);

  if (erreurLecture)
  {
    throw new Error("Impossible de récupérer les localisations.");
  }

  const nouvelles = normaliserLocalisations(localisations);
  const existantesParId = new Map(
    (existantes ?? []).map((localisation) => [localisation.id, localisation])
  );
  const idsConserves = new Set(
    nouvelles.flatMap((localisation) => localisation.id ? [localisation.id] : [])
  );
  const ajouts = nouvelles.filter((localisation) => !localisation.id);

  if (ajouts.length > 0)
  {
    const { error } = await supabase
      .from("client_localisations")
      .insert(ajouts.map(({ pays, ville }) => ({
        client_id: clientId,
        pays,
        ville: ville || null
      })));

    if (error)
    {
      throw new Error("Impossible d'ajouter les localisations.");
    }
  }

  for (const localisation of nouvelles)
  {
    const existante = localisation.id
      ? existantesParId.get(localisation.id)
      : undefined;

    if (!existante ||
      (existante.pays === localisation.pays &&
        (existante.ville ?? "") === localisation.ville))
    {
      continue;
    }

    const { error } = await supabase
      .from("client_localisations")
      .update({ pays: localisation.pays, ville: localisation.ville || null })
      .eq("id", localisation.id)
      .eq("client_id", clientId);

    if (error)
    {
      throw new Error("Impossible de modifier une localisation.");
    }
  }

  const idsASupprimer = (existantes ?? [])
    .filter((localisation) => !idsConserves.has(localisation.id))
    .map((localisation) => localisation.id);

  if (idsASupprimer.length > 0)
  {
    const { error } = await supabase
      .from("client_localisations")
      .delete()
      .in("id", idsASupprimer)
      .eq("client_id", clientId);

    if (error)
    {
      throw new Error("Impossible de supprimer une localisation.");
    }
  }
}


// Ajouter un client
export async function ajouterClient(
  {
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
  }: ClientInput
)
{
  const
  {
    data: client,
    error
  } = await supabase
    .from("clients")
    .insert(
      {
        prenom,
        nom,
        telephone,
        email: email || null,
        date_naissance:
          dateNaissance || null,
        sexe: sexe || null,
        categorie,
        notes: notes || null,
        pseudo: pseudo || null,
        reseaux_sociaux: reseauxSociaux || null,
        sms_consentement:
          smsConsentement,
        sms_consentement_date:
          smsConsentement
            ? new Date().toISOString()
            : null
      }
    )
    .select("id")
    .single();

  if (error)
  {
    console.error(
      "Erreur ajout client :",
      error
    );

    throw new Error(
      "Impossible d'ajouter le client."
    );
  }

  await synchroniserLocalisations(client.id, localisations);
}


// Modifier un client
export async function modifierClient(
  id: string,
  {
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
  }: ClientInput,
  ancienConsentementSms: boolean
)
{
  const consentementModifie = smsConsentement !== ancienConsentementSms;

  const modification = {
    prenom,
    nom,
    telephone,
    email: email || null,
    date_naissance: dateNaissance || null,
    sexe: sexe || null,
    categorie,
    notes: notes || null,
    pseudo: pseudo || null,
    reseaux_sociaux: reseauxSociaux || null,
    sms_consentement: smsConsentement,
    ...(consentementModifie && {
      sms_consentement_date: smsConsentement
        ? new Date().toISOString()
        : null
    })
  };

  const
  {
    error
  } = await supabase
    .from("clients")
    .update(
      modification
    )
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur modification client :",
      error
    );

    throw new Error(
      "Impossible de modifier le client."
    );
  }

  await synchroniserLocalisations(id, localisations);
}


//
// ============================================================
// CORBEILLE
// ============================================================
//

// Récupérer les clients dans la corbeille
export async function recupererCorbeille()
{
  const
  {
    data,
    error
  } = await supabase
    .from("clients")
    .select("*")
    .not("date_suppression", "is", null)
    .order("date_suppression", {
      ascending: false
    });

  if (error)
  {
    console.error(
      "Erreur récupération corbeille :",
      error
    );

    throw new Error(
      "Impossible de récupérer la corbeille."
    );
  }

  return data ?? [];
}


// Mettre un client dans la corbeille
export async function mettreClientCorbeille(
  id: string
)
{
  const
  {
    error
  } = await supabase
    .from("clients")
    .update(
      {
        date_suppression:
          new Date().toISOString()
      }
    )
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur mise en corbeille :",
      error
    );

    throw new Error(
      "Impossible de mettre le client à la corbeille."
    );
  }
}


// Restaurer un client
export async function restaurerClient(
  id: string
)
{
  const
  {
    error
  } = await supabase
    .from("clients")
    .update(
      {
        date_suppression: null
      }
    )
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur restauration client :",
      error
    );

    throw new Error(
      "Impossible de restaurer le client."
    );
  }
}


// Supprimer définitivement un client
export async function supprimerClientDefinitivement(
  id: string
)
{
  const
  {
    error
  } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur suppression définitive :",
      error
    );

    throw new Error(
      "Impossible de supprimer définitivement le client."
    );
  }
}


// Supprimer les clients présents
// dans la corbeille depuis plus de 30 jours
export async function supprimerClientsDePlusDe30Jours()
{
  const dateLimite = new Date();

  dateLimite.setDate(
    dateLimite.getDate() - 30
  );

  const
  {
    error
  } = await supabase
    .from("clients")
    .delete()
    .not("date_suppression", "is", null)
    .lt(
      "date_suppression",
      dateLimite.toISOString()
    );

  if (error)
  {
    console.error(
      "Erreur suppression anciens clients :",
      error
    );

    throw new Error(
      "Impossible de supprimer les anciens clients."
    );
  }
}


//
// ============================================================
// PRESTATIONS
// ============================================================
//

// Ajouter une prestation
export async function ajouterPrestation(
  clientId: string,
  datePrestation: string
)
{
  const
  {
    error
  } = await supabase
    .from("prestations")
    .insert(
      {
        client_id: clientId,
        date_prestation: datePrestation
      }
    );

  if (error)
  {
    console.error(
      "Erreur ajout prestation :",
      error
    );

    throw new Error(
      "Impossible d'ajouter la prestation."
    );
  }
}


// Récupérer les prestations d'un client
export async function recupererPrestations(
  clientId: string
)
{
  const
  {
    data,
    error
  } = await supabase
    .from("prestations")
    .select("*")
    .eq("client_id", clientId)
    .order("date_prestation", {
      ascending: false
    });

  if (error)
  {
    console.error(
      "Erreur récupération prestations :",
      error
    );

    throw new Error(
      "Impossible de récupérer les prestations."
    );
  }

  return data ?? [];
}


// Modifier une prestation
export async function modifierPrestation(
  id: string,
  datePrestation: string
)
{
  const
  {
    error
  } = await supabase
    .from("prestations")
    .update(
      {
        date_prestation: datePrestation
      }
    )
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur modification prestation :",
      error
    );

    throw new Error(
      "Impossible de modifier la prestation."
    );
  }
}


// Supprimer une prestation
export async function supprimerPrestation(
  id: string
)
{
  const
  {
    error
  } = await supabase
    .from("prestations")
    .delete()
    .eq("id", id);

  if (error)
  {
    console.error(
      "Erreur suppression prestation :",
      error
    );

    throw new Error(
      "Impossible de supprimer la prestation."
    );
  }
}
