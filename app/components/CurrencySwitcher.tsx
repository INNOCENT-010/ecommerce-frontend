"use client";

import { useState } from "react";
import { useCurrency } from "@/app/context/CurrencyContext";

const currencies = ["USD", "EUR", "GBP", "NGN"] as const;

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-0 top-1/3 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="bg-black text-white px-4 py-2 rounded-l-lg"
      >
        {currency} ▾
      </button>

      {open && (
        <div className="bg-white border shadow-md rounded-l-lg">
          {currencies.map((cur) => (
            <button
              key={cur}
              onClick={() => {
                setCurrency(cur);
                setOpen(false);
              }}
              className={`block px-4 py-2 w-full text-left hover:bg-gray-100 ${
                cur === currency ? "font-bold" : ""
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}