import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#fceff2] text-black mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-black mb-4">BLOOM & G</h3>
            <p className="text-gray-700 max-w-xs">
              Luxury fashion for the modern woman. Discover curated collections 
              and timeless pieces designed for every occasion.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-6 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-3">
              <li><a href="/products?category=Dresses" className="text-gray-700 hover:text-black transition-colors">Dresses</a></li>
              <li><a href="/products?category=Styles&tag=tops" className="text-gray-700 hover:text-black transition-colors">Tops</a></li>
              <li><a href="/products?category=Styles&tag=sets" className="text-gray-700 hover:text-black transition-colors">Sets</a></li>
              <li><a href="/products?category=Sale" className="text-red-600 hover:text-red-800 transition-colors font-medium">Sale</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-6 uppercase tracking-wide">Help</h4>
            <ul className="space-y-3">
              <li><a href="/contact" className="text-gray-700 hover:text-black transition-colors">Contact Us</a></li>
              <li><a href="/shipping" className="text-gray-700 hover:text-black transition-colors">Shipping</a></li>
              <li><a href="/returns" className="text-gray-700 hover:text-black transition-colors">Returns</a></li>
              <li><a href="/size-guide" className="text-gray-700 hover:text-black transition-colors">Size Guide</a></li>
            </ul>
          </div>
          
          {/* Social & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-black mb-6 uppercase tracking-wide">Stay Connected</h4>
            <div className="flex space-x-5 mb-6">
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
            
            <p className="text-gray-700 text-sm mb-4">
              Subscribe for exclusive offers and style inspiration
            </p>
            
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} BLOOM & G. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-600 hover:text-black transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="text-xs text-gray-500">We accept:</div>
            <div className="flex gap-2">
              <span className="text-sm"></span>
              <span className="text-sm">Visa</span>
              <span className="text-sm">Mastercard</span>
              <span className="text-sm">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}