import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-surface transition-colors duration-300 font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};
