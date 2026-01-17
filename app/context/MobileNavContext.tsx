
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MobileNavContextType {
  isOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
  openNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);
  const openNav = () => setIsOpen(true);

  return (
    <MobileNavContext.Provider value={{ isOpen, toggleNav, closeNav, openNav }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (context === undefined) {
    throw new Error('useMobileNav must be used within a MobileNavProvider');
  }
  return context;
}