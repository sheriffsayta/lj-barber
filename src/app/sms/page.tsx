import Sidebar from "@/ui/Sidebar";
import RoleGuard from "@/ui/auth/RoleGuard";

function SMSContent()
{
  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">

      <Sidebar />

      <section className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:ml-64 md:p-10">

        <div className="mx-auto w-full max-w-3xl">

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center sm:p-8">

            <div className="text-5xl">
              💬
            </div>

            <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
              SMS
            </h1>

            <p className="mt-3 text-gray-400">
              Fonctionnalité en attente.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Le système d&apos;envoi de SMS sera disponible prochainement.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default function SMS()
{
  return <RoleGuard roles={["ADMIN", "COIFFEUR"]}><SMSContent /></RoleGuard>;
}
