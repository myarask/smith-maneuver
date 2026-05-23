import { ChangeEvent } from "react";
import { create } from "zustand";
import { FormState } from "@/global/types";
import { DEFAULTS } from "@/global/constants";

interface CalculatorStore {
  form: FormState;
  step: number;
  setField: (key: keyof FormState, value: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setStep: (updater: number | ((prev: number) => number)) => void;
}

export const useStore = create<CalculatorStore>((set) => ({
  form: DEFAULTS,
  step: 0,
  setField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),
  handleChange: (e) =>
    set((state) => ({
      form: { ...state.form, [e.target.name]: e.target.value },
    })),
  setStep: (updater) =>
    set((state) => ({
      step: typeof updater === "function" ? updater(state.step) : updater,
    })),
}));
