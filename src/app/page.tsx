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
    <main className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-96 flex-none flex flex-col justify-start border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto">
        <Form />
      </div>
      <div className="flex-1 min-w-0 h-full">
        <div className="h-full w-full">
          <Chart />
        </div>
      </div>
    </main>
  );
}
