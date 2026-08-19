import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BURGER_IMAGES } from '../data/products';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('home', true);
    }, 2400);

    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div
      onClick={() => navigateTo('home', true)}
      className="relative w-full min-h-screen bg-gradient-to-b from-[#FF5E6C] via-[#EF2A39] to-[#E31D2D] flex flex-col justify-between items-center cursor-pointer overflow-hidden select-none"
    >
      {/* Top spacing */}
      <div className="h-20" />

      {/* Center Wordmark Logo */}
      <div className="flex flex-col items-center justify-center my-auto z-10 px-4 text-center">
        <h1 className="text-6xl font-logo text-white italic tracking-normal drop-shadow-md">
          Foodgo
        </h1>
        <p className="text-white/80 text-xs tracking-widest uppercase font-semibold mt-3 animate-pulse">
          Tap anywhere to continue
        </p>
      </div>

      {/* Bottom Burgers Imagery */}
      <div className="relative w-full h-[280px] flex items-end justify-center pointer-events-none">
        {/* Left Burger (Cheeseburger) */}
        <div className="absolute -left-12 -bottom-6 w-[250px] z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] transform -rotate-6">
          <img
            src={BURGER_IMAGES.cheeseburger}
            alt="Cheeseburger"
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Burger (Veggie Burger) */}
        <div className="absolute right-2 -bottom-10 w-[240px] z-20 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
          <img
            src={BURGER_IMAGES.veggie}
            alt="Veggie Burger"
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
