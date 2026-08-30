"use client";

import { useEffect } from "react";

export default function PWAregister()
{
  useEffect(() =>
  {
    if ("serviceWorker" in navigator)
    {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() =>
        {
          console.log(
            "Service Worker LJ BARBER enregistré."
          );
        })
        .catch((error) =>
        {
          console.error(
            "Erreur Service Worker :",
            error
          );
        });
    }
  }, []);

  return null;
}