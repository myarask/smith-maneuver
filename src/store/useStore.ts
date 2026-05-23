import { ChangeEvent } from "react";
import { create } from "zustand";
import { FormState } from "@/global/types";
import { DEFAULTS } from "@/global/constants";

interface CalculatorStore {
  form: FormState;
  step: number;
  setField: (key: keyof FormState, value: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleJump: (step: number) => void;
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
  handleNext: () => set((state) => ({ step: state.step + 1 })),
  handleBack: () => set((state) => ({ step: state.step - 1 })),
  handleJump: (step) => set({ step }),
}));
