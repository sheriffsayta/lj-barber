"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [connexion, setConnexion] = useState(false);
  const [message, setMessage] = useState("");

  async function redirigerSelonRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    window.location.href = data?.role === "CLIENT"
      ? "/inscription"
      : "/dashboard";
  }

  useEffect(() => {
    async function verifierConnexion() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await redirigerSelonRole();
        return;
      }

      setLoading(false);
    }

    verifierConnexion();
  }, []);

  async function seConnecter(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setConnexion(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(
        "Email ou mot de passe incorrect."
      );

      setConnexion(false);
      return;
    }

    await redirigerSelonRole();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-8 text-white sm:px-6">

      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg sm:p-8">

        {/* LOGO / TITRE */}

        <div className="mb-8 text-center">

          <div className="mb-3 text-4xl">
            ✂️
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            LJ BARBER
          </h1>

          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            Espace professionnel
          </p>

        </div>


        {/* FORMULAIRE */}

        <form
          onSubmit={seConnecter}
          className="space-y-5"
        >

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              inputMode="email"
              className="min-h-12 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-base text-white outline-none focus:border-gray-500 focus:ring-2"
              placeholder="votre@email.com"
            />

          </div>


          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="min-h-12 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-base text-white outline-none focus:border-gray-500 focus:ring-2"
              placeholder="••••••••"
            />

          </div>


          {message && (
            <div
              role="alert"
              className="rounded-xl bg-red-950 p-3 text-sm text-red-300"
            >
              {message}
            </div>
          )}


          <button
            type="submit"
            disabled={connexion}
            className="min-h-12 w-full rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
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
