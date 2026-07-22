import React, { useState, useRef, useEffect } from 'react';
import { X, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLE_TITLES = [
  'Semester 6 Notes',
  'AWS Assignment',
  'Java Project',
  'Resume Documents',
  'Cloud Internship Files',
];

export default function UploadTitleModal({ isOpen, onConfirm, onCancel }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError('');
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a title for this upload.');
      return;
    }
    if (trimmed.length > 255) {
      setError('Title cannot exceed 255 characters.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  const handleSuggestionClick = (suggestion) => {
    setTitle(suggestion);
    setError('');
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl w-full max-w-md relative z-10 overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-sand dark:border-white/10 mb-5">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-sage-light/35 p-2 rounded-xl">
                <Tag className="w-5 h-5 text-brand-olive" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal dark:text-white">Name Your Upload</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 font-sans">Give this upload a meaningful title</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 text-gray-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-brand-cream/50 dark:hover:bg-white/5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Upload Title
              </label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Semester 6 Notes"
                className={`w-full bg-brand-cream/65 dark:bg-brand-charcoal/65 border rounded-xl px-4 py-3 text-sm text-brand-charcoal dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  error
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-brand-sand dark:border-white/15 focus:ring-brand-olive focus:border-brand-olive'
                }`}
                maxLength={255}
              />
              {error && (
                <p className="text-[10px] text-red-500 mt-1.5 font-medium">{error}</p>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="mb-5">
              <div className="flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-brand-olive" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">Quick Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_TITLES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      title === suggestion
                        ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                        : 'bg-brand-cream/45 dark:bg-brand-charcoal/45 border-brand-sand dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-olive hover:text-brand-olive'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-brand-sand dark:border-white/10">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-brand-cream/60 dark:bg-white/5 border border-brand-sand dark:border-white/10 hover:bg-brand-cream dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-300 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-brand-olive to-emerald-600 hover:brightness-105 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Continue to Upload</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
