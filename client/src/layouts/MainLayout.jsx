import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
