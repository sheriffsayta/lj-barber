import Sidebar from "@/ui/Sidebar";

export default function SMS() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center px-4 py-6 sm:px-6 md:p-10">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center sm:p-8">
            <div className="text-5xl">
              💬
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              SMS
            </h1>

            <p className="mt-3 text-gray-400">
              Fonctionnalité en préparation.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Le système d'envoi de SMS sera disponible prochainement.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}