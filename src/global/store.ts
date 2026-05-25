import { ChangeEvent } from "react";
import { create } from "zustand";
import { FormState } from "@/global/types";
import { DEFAULTS } from "@/global/constants";

interface CalculatorStore {
  form: FormState;
  step: number;
}

export const useStore = create<CalculatorStore>(() => ({
  form: DEFAULTS,
  step: 0,
}));

export const setField = (key: keyof FormState, value: string) =>
  useStore.setState((s) => ({ form: { ...s.form, [key]: value } }));

export const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
  useStore.setState((s) => ({
    form: { ...s.form, [e.target.name]: e.target.value },
  }));

export const handleNext = () =>
  useStore.setState((s) => ({ step: s.step + 1 }));

export const handleBack = () =>
  useStore.setState((s) => ({ step: s.step - 1 }));

export const handleJump = (step: number) =>
  useStore.setState({ step });

export const setReadvancable = (value: boolean) =>
  useStore.setState((s) => ({ form: { ...s.form, readvancable: value } }));
