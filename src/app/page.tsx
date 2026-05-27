"use client";

import { useEffect } from "react";
import { setField } from "@/global/store";
import { Form } from "@/components/Form";
import { Chart } from "@/components/Chart";

export default function Home() {
  useEffect(() => {
    fetch(
      "https://www.bankofcanada.ca/valet/observations/V122667806/json?recent=1",
    )
      .then((r) => r.json())
      .then((data) => {
        const obs = data?.observations?.[0];
        const rate = parseFloat(obs?.V122667806?.v);
        if (!isNaN(rate)) {
          setField("interestRate", (rate + 1).toFixed(1));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="flex flex-col md:flex-row md:h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full md:w-96 md:flex-none flex flex-col justify-start border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-4 md:overflow-y-auto">
        <Form />
      </div>
      <div className="min-w-0 h-80 md:flex-1 md:h-full">
        <div className="h-full w-full">
          <Chart />
        </div>
      </div>
    </main>
  );
}
