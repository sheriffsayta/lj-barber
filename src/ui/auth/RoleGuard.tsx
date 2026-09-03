"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = "ADMIN" | "COIFFEUR" | "CLIENT";

export default function RoleGuard({
  roles,
  children
}: {
  roles: Role[];
  children: React.ReactNode;
})
{
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);

  useEffect(() =>
  {
    let actif = true;

    async function verifierRole()
    {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user)
      {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!data || !roles.includes(data.role as Role))
      {
        router.replace(data?.role === "CLIENT" ? "/inscription" : "/");
        return;
      }

      if (actif)
      {
        setAutorise(true);
      }
    }

    void verifierRole();

    return () =>
    {
      actif = false;
    };
  }, [roles, router]);

  if (!autorise)
  {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">
        Chargement...
      </main>
    );
  }

  return children;
}
