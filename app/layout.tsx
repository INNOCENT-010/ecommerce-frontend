// app/layout.tsx 
import './globals.css';
import Header from './components/layout/header';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartonContext';
import AuthProvider from './providers/AuthProvider';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#FAF7F5] text-gray-900"> {/* Sublime cream background */}
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}