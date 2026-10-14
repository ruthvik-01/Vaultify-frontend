import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderLock } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-brand-cream">
      {/* Visual Left Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-olive-dark text-brand-cream flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle background ambient graphic elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-olive/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sage-light/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-brand-cream text-brand-olive-dark p-2 rounded-xl shadow-sm">
            <FolderLock className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">Vaultify</span>
        </div>

        {/* Content Showcase */}
        <div className="z-10 my-auto py-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="text-xs uppercase tracking-widest text-brand-sage-light font-medium bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              Cloud Storage & Sharing
            </span>
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-serif text-brand-cream font-bold mt-5 leading-tight">
              Organize your digital assets in one secure vault.
            </h1>
            <p className="mt-5 text-brand-sage-light text-base xl:text-lg leading-relaxed font-sans opacity-90 max-w-md">
              Designed for premium security. Store personal credentials, verify academic logs, catalog projects, and share files instantly under your terms.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-brand-sage z-10">
          <p>© {new Date().getFullYear()} Vaultify. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>

      {/* Auth Form Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <motion.div
          className="w-full max-w-md bg-white border border-brand-sand rounded-3xl p-8 sm:p-10 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex bg-brand-olive text-brand-cream p-3 rounded-2xl mb-3">
              <FolderLock className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-charcoal">Vaultify</h2>
            <p className="text-sm text-gray-500 mt-1">Cloud digital asset vault</p>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
