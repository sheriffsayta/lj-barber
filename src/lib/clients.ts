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
  sms_consentement: boolean;
  sms_consentement_date: string | null;
  date_suppression: string | null;
};

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
    .select("*")
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
    .select("*")
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


// Ajouter un client
export async function ajouterClient(
  prenom: string,
  nom: string,
  telephone: string,
  email: string,
  dateNaissance: string,
  sexe: string,
  categorie: string,
  notes: string,
  smsConsentement: boolean
)
{
  const
  {
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
        sms_consentement:
          smsConsentement,
        sms_consentement_date:
          smsConsentement
            ? new Date().toISOString()
            : null
      }
    );

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
}


// Modifier un client
export async function modifierClient(
  id: string,
  prenom: string,
  nom: string,
  telephone: string,
  email: string,
  dateNaissance: string,
  sexe: string,
  categorie: string,
  notes: string,
  smsConsentement: boolean
)
{
  const
  {
    error
  } = await supabase
    .from("clients")
    .update(
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
        sms_consentement:
          smsConsentement,
        sms_consentement_date:
          smsConsentement
            ? new Date().toISOString()
            : null
      }
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