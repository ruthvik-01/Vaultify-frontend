import React, { useState, useRef } from 'react';
import { UploadCloud, X, FolderUp, FileText } from 'lucide-react';

export default function VideoUploadDialog({ isOpen, onClose, onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
      onClose();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      onClose();
    }
  };

  const handleFolderChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      onClose();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const triggerFolderSelect = () => {
    folderInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg flex flex-col text-left font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-sand dark:border-white/10 flex items-center justify-between bg-brand-cream/40 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="bg-brand-sage-light/35 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-brand-olive" />
            </div>
            <h2 className="font-serif font-bold text-sm text-brand-charcoal dark:text-white">
              Upload Files
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-cream/50 dark:hover:bg-white/5 text-gray-500 hover:text-brand-charcoal dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
            aria-label="Close upload dialog"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-brand-olive bg-brand-sage-light/20 scale-[0.98] dark:bg-brand-charcoal/40'
                : 'border-brand-sand dark:border-white/10 hover:border-brand-sage/80 bg-brand-cream/20 dark:bg-brand-charcoal/30 hover:bg-brand-cream/50 dark:hover:bg-brand-charcoal/50'
            }`}
          >
            <div className="bg-brand-cream-dark dark:bg-brand-charcoal/60 p-3 rounded-full text-brand-olive mb-3">
              <UploadCloud className={`w-8 h-8 transition-transform duration-200 ${
                dragActive ? 'text-brand-olive scale-110' : 'text-brand-sage'
              }`} />
            </div>
            <p className="text-xs font-semibold text-brand-charcoal dark:text-white mb-1">
              Drag & Drop your files here
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-450 font-medium">
              or click to browse local files
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Custom file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderChange}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />

            <button
              onClick={triggerFileSelect}
              className="flex items-center justify-center space-x-2 py-3 bg-brand-cream/60 dark:bg-white/5 border border-brand-sand dark:border-white/10 hover:bg-brand-cream dark:hover:bg-white/10 rounded-xl text-xs font-semibold text-brand-charcoal dark:text-gray-300 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-olive" />
              <span>Select Files</span>
            </button>

            <button
              onClick={triggerFolderSelect}
              className="flex items-center justify-center space-x-2 py-3 bg-brand-cream/60 dark:bg-white/5 border border-brand-sand dark:border-white/10 hover:bg-brand-cream dark:hover:bg-white/10 rounded-xl text-xs font-semibold text-brand-charcoal dark:text-gray-300 cursor-pointer transition-colors"
            >
              <FolderUp className="w-4 h-4 text-brand-olive" />
              <span>Select Folder</span>
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="px-6 py-4 bg-brand-cream/40 dark:bg-white/5 border-t border-brand-sand/65 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 font-sans font-medium flex items-center justify-between">
          <span>Supported: All formats</span>
          <span>No file size limits</span>
        </div>
      </div>
    </div>
  );
}
