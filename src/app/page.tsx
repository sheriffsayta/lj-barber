"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile =
{
  nom: string;
  role: "ADMIN" | "COIFFEUR";
};

export default function Home()
{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [connexion, setConnexion] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() =>
  {
    async function verifierConnexion()
    {
      const
      {
        data:
        {
          session
        }
      } = await supabase.auth.getSession();

      if (session?.user)
      {
        window.location.href = "/dashboard";
        return;
      }

      setLoading(false);
    }

    verifierConnexion();
  }, []);

  async function seConnecter(event: FormEvent<HTMLFormElement>)
  {
    event.preventDefault();

    setConnexion(true);
    setMessage("");

    const
    {
      error
    } = await supabase.auth.signInWithPassword(
      {
        email,
        password
      }
    );

    if (error)
    {
      setMessage("Email ou mot de passe incorrect.");
      setConnexion(false);
      return;
    }

    window.location.href = "/dashboard";
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
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">

      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg">

        <div className="mb-8 text-center">

          <div className="mb-3 text-4xl">
            ✂️
          </div>

          <h1 className="text-3xl font-bold">
            Salon CRM
          </h1>

          <p className="mt-2 text-gray-400">
            Espace professionnel
          </p>

        </div>

        <form
          onSubmit={seConnecter}
          className="space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2"
              placeholder="votre@email.com"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2"
              placeholder="••••••••"
            />

          </div>

          {message &&
          (
            <div className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={connexion}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            {connexion
              ? "Connexion..."
              : "Se connecter"}
          </button>

        </form>

      </div>

    </main>
  );
}
