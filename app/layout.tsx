// app/layout.tsx 
import './globals.css';
import Header from './components/layout/header';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartonContext';
import AuthProvider from './providers/AuthProvider';
import { CurrencyProvider } from '@/app/context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MobileNavProvider } from './context/MobileNavContext';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#FAF7F5" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#FAF7F5] text-gray-900">
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <MobileNavProvider>
                <Header />
                <main className="flex-grow pb-16 md:pb-0">
                  {children}
                </main>
                <Footer />
                
              </MobileNavProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}