import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#fceff2] text-black mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Mobile: 2x2 grid, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">BLOOM & G</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Luxury fashion for the modern woman.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="mb-6 md:mb-0">
            <h4 className="text-base md:text-lg font-semibold text-black mb-4 md:mb-6 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><a href="/products?category=Dresses" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Dresses</a></li>
              <li><a href="/products?category=Styles&tag=tops" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Tops</a></li>
              <li><a href="/products?category=Styles&tag=sets" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Sets</a></li>
              <li><a href="/products?category=Sale" className="text-red-600 hover:text-red-800 transition-colors font-medium text-sm md:text-base">Sale</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div className="mb-6 md:mb-0">
            <h4 className="text-base md:text-lg font-semibold text-black mb-4 md:mb-6 uppercase tracking-wide">Help</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><a href="/contact" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Contact Us</a></li>
              <li><a href="/shipping" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Shipping</a></li>
              <li><a href="/returns" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Returns</a></li>
              <li><a href="/size-guide" className="text-gray-700 hover:text-black transition-colors text-sm md:text-base">Size Guide</a></li>
            </ul>
          </div>
          
          {/* Social & Newsletter - Full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-base md:text-lg font-semibold text-black mb-4 md:mb-6 uppercase tracking-wide">Stay Connected</h4>
            <div className="flex space-x-4 md:space-x-5 mb-4 md:mb-6">
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} className="md:size-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} className="md:size-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} className="md:size-5" />
              </a>
            </div>
            
            <p className="text-gray-700 text-xs md:text-sm mb-3 md:mb-4">
              Subscribe for exclusive offers
            </p>
            
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs md:text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} BLOOM & G. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
              <a href="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-600 hover:text-black transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 md:mt-6">
            <div className="text-xs md:text-sm text-gray-500"></div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-gray-700"></span>
              <span className="text-xs md:text-sm text-gray-700"></span>
              <span className="text-xs md:text-sm text-gray-700"></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}