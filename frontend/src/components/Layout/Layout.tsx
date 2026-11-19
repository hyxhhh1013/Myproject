import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Dock } from './Dock';
import { CommandPalette } from '../UI/CommandPalette';
import axios from '../../utils/axiosConfig';
import { playTactileClick } from '../../utils/soundEffects';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const visited = sessionStorage.getItem('site_visited');
    if (!visited) {
      axios.post('/api/siteConfig/view').catch(() => {});
      sessionStorage.setItem('site_visited', 'true');
    }
  }, []);

  // Global Tactile Audio Delegation — ONLY on explicit click/press (no noisy hover sounds)
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, [role="button"]');
      if (!interactive) return;
      if (interactive.getAttribute('data-sfx') === 'custom') return;
      if ((interactive as HTMLButtonElement).disabled) return;
      playTactileClick();
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0D0D0C] text-[#141413] dark:text-[#F0EFEA] transition-colors duration-300 font-sans">
      <Header />
      <main>{children}</main>
      <Footer />
      <Dock />
      <CommandPalette />
    </div>
  );
};
