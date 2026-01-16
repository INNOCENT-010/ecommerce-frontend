import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CurrencySwitcher from "@/app/components/CurrencySwitcher";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-pink-100 to-purple-100 py-20 md:py-32 overflow-hidden h-screen">
      
      
      <CurrencySwitcher />

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Discover Your <span className="text-pink-600">Signature Style</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Exclusive collections designed to make you feel confident, beautiful, and unstoppable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
         
          <Link
            href="/products"
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
          >
            Shop New Arrivals <ArrowRight size={20} />
          </Link>
          
      
        </div>
      </div>
    </section>
  );
}