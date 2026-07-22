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
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-brand-charcoal"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-md relative z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-sand mb-5">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-sage-light/30 p-2 rounded-xl">
                <Tag className="w-5 h-5 text-brand-olive" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">Name Your Upload</h3>
                <p className="text-[10px] text-gray-400 font-sans">Give this upload a meaningful title</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
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
                className={`w-full bg-brand-cream border rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-brand-sand focus:ring-brand-olive/30 focus:border-brand-olive'
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Quick Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_TITLES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      title === suggestion
                        ? 'bg-brand-olive text-white border-brand-olive'
                        : 'bg-brand-cream border-brand-sand text-gray-600 hover:border-brand-olive hover:text-brand-olive'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-brand-sand">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
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
