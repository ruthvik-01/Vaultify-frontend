import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import { HardDrive, HelpCircle, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function StorageCard() {
  const { storageStats } = useFiles();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const percent = Math.min(
    ((storageStats.used / storageStats.totalCapacity) * 100),
    100
  );

  return (
    <>
      <div className="bg-white border border-brand-sand rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-brand-olive" />
            <h3 className="font-serif font-bold text-brand-charcoal text-base">Vault Space</h3>
          </div>
          <span className="text-xs font-semibold text-brand-olive bg-brand-sage-light/30 px-2 py-0.5 rounded-full">
            {percent.toFixed(1)}% Used
          </span>
        </div>

        {/* Storage Bar */}
        <div className="w-full bg-brand-cream-dark h-2 rounded-full overflow-hidden mb-4 flex">
          <div 
            style={{ width: `${percent}%` }} 
            className="bg-brand-olive h-full rounded-full transition-all duration-500 ease-out" 
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-5">
          <span>{formatSize(storageStats.used)} used</span>
          <span>{formatSize(storageStats.totalCapacity)} limit</span>
        </div>

        {/* Breakdown details */}
        <div className="space-y-3 pt-2 border-t border-brand-sand/60">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-olive" />
              <span className="text-brand-charcoal font-medium">Documents</span>
            </div>
            <span className="font-mono text-gray-500">{formatSize(storageStats.breakdown.Documents)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-sage" />
              <span className="text-brand-charcoal font-medium">Projects</span>
            </div>
            <span className="font-mono text-gray-500">{formatSize(storageStats.breakdown.Projects)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-tan" />
              <span className="text-brand-charcoal font-medium">Certificates</span>
            </div>
            <span className="font-mono text-gray-500">{formatSize(storageStats.breakdown.Certificates)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-brand-charcoal font-medium">Media Files</span>
            </div>
            <span className="font-mono text-gray-500">{formatSize(storageStats.breakdown.Media)}</span>
          </div>
        </div>

        {/* Upgrade Prompt */}
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="w-full mt-5 bg-brand-cream-dark hover:bg-brand-sand text-brand-olive-dark font-sans text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Request More Storage</span>
        </button>
      </div>

      {/* Upgrade Storage Alert Dialog */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            {/* Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-md relative z-10"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="inline-flex bg-brand-sage-light/40 text-brand-olive p-4 rounded-full mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-2">Upgrade to Pro Vault</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Need more than 10 GB of space? Expand your student locker to 100 GB, enable unlimited placement sharing, and unlock AI resume enhancements.
                </p>

                <div className="bg-brand-cream border border-brand-sand rounded-2xl p-4 mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-brand-charcoal text-sm">Pro Scholar Plan</span>
                    <span className="font-serif font-bold text-brand-olive">$2.99 / mo</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li>• 100 GB secure SSD cloud storage</li>
                    <li>• Custom public link (e.g., studentvault.co/yourname)</li>
                    <li>• Direct recruiter analytics (see who downloads your CV)</li>
                    <li>• Automatic certificate metadata verification</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 bg-brand-cream border border-brand-sand hover:bg-brand-sand/30 text-brand-charcoal font-semibold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert('Thank you! This is a demo presentation. Upgrading plans represents integration with Stripe.');
                      setShowUpgradeModal(false);
                    }}
                    className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
