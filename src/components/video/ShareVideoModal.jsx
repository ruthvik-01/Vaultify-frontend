import React from 'react';
import { X, Copy, Check, Share2, Loader2 } from 'lucide-react';

export default function ShareVideoModal({
  isOpen,
  onClose,
  item,
  shareLink,
  loading,
  copied,
  error,
  onCopy,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col text-left font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-sand dark:border-white/10 flex items-center justify-between bg-brand-cream/40 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="bg-brand-sage-light/35 p-2 rounded-xl">
              <Share2 className="w-5 h-5 text-brand-olive" />
            </div>
            <h2 className="font-serif font-bold text-sm text-brand-charcoal dark:text-white">
              Share {item?.type === 'folder' ? 'Folder' : 'Video'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-cream/50 dark:hover:bg-white/5 text-gray-500 hover:text-brand-charcoal dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
            aria-label="Close share modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-gray-500 dark:text-gray-355 font-medium leading-relaxed">
            <span>Anyone with this link will be able to view and download </span>
            <strong className="text-brand-charcoal dark:text-white font-semibold">"{item?.name}"</strong>.
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-gray-400 dark:text-gray-400 font-bold tracking-wider uppercase space-x-2">
              <Loader2 className="w-5 h-5 text-brand-olive animate-spin" />
              <span>Generating Secure Link...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl p-4 text-xs font-semibold">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider block">
                Public Link
              </label>
              
              <div className="flex items-center space-x-2 bg-brand-cream/65 dark:bg-brand-charcoal/65 border border-brand-sand dark:border-white/15 rounded-2xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-grow bg-transparent border-none text-xs text-brand-charcoal dark:text-white focus:outline-none select-all truncate font-medium font-sans pr-2"
                />
                
                <button
                  onClick={onCopy}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm select-none shrink-0 ${
                    copied 
                      ? 'bg-brand-olive text-white' 
                      : 'bg-white dark:bg-white/5 hover:bg-brand-cream dark:hover:bg-white/10 border border-brand-sand dark:border-white/10 text-brand-charcoal dark:text-gray-300'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-brand-olive" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-brand-cream/40 dark:bg-white/5 border-t border-brand-sand/65 dark:border-white/10 text-[10px] text-gray-400 dark:text-gray-400 font-sans font-bold uppercase tracking-wider text-right">
          Link Expiry • 24 Hours
        </div>
      </div>
    </div>
  );
}
