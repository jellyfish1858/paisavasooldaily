"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DbProduct } from "@/utils/supabase/types";

type CompareProduct = DbProduct | any;

export const MAX_COMPARE = 4;

type CompareContextValue = {
  selected: CompareProduct[];
  isSelected: (id: string) => boolean;
  toggle: (product: CompareProduct) => void;
  add: (product: CompareProduct) => void;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
  canCompare: boolean;
  maxSlots: number;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CompareProduct[]>([]);

  const isSelected = (id: string) => selected.some((p) => p.id === id);
  const isFull = selected.length >= MAX_COMPARE;
  const canCompare = selected.length >= 2;

  const toggle = (product: CompareProduct) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const add = (product: CompareProduct) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists || prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const remove = (id: string) =>
    setSelected((prev) => prev.filter((p) => p.id !== id));

  const clear = () => setSelected([]);

  return (
    <CompareContext.Provider
      value={{
        selected,
        isSelected,
        toggle,
        add,
        remove,
        clear,
        isFull,
        canCompare,
        maxSlots: MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}


const defaultCompareValue: CompareContextValue = {
  selected: [],
  isSelected: () => false,
  toggle: () => {},
  add: () => {},
  remove: () => {},
  clear: () => {},
  isFull: false,
  canCompare: false,
  maxSlots: MAX_COMPARE,
};

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    return defaultCompareValue;
  }
  return ctx;
}
