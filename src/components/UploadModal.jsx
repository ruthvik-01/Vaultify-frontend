import React, { useState, useRef, useCallback } from 'react';
import { useFiles } from '../context/FileContext';
import { UploadCloud, X, CheckCircle2, FileUp, FileText, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadTitleModal from './UploadTitleModal';

export default function UploadModal({ isOpen, onClose }) {
  const { uploadFile, showNotification, createUploadGroup, fetchUploadGroups, resolveFolderIdForPath, fetchAllFolders } = useFiles();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | title | uploading | success
  const [progress, setProgress] = useState(0);
  const [uploadedName, setUploadedName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadGroupTitle, setUploadGroupTitle] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip', 'txt'];
  const allowedVideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpeg', '3gp', 'ogv'];
  const allowedMimeTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png',
    'application/zip', 'application/x-zip-compressed',
    'text/plain'
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const isVideo = allowedVideoExtensions.includes(ext) || (file.type && file.type.startsWith('video/'));

    if (!isVideo && !allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
      showNotification(
        `Unsupported file type (.${ext}). Allowed: PDF, DOC/DOCX, JPEG, PNG, ZIP, and TXT.`,
        'error'
      );
      return false;
    }
    if (!isVideo && file.size > maxFileSize) {
      showNotification(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed: 10 MB.`,
        'error'
      );
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => validateFile(f));
      if (files.length > 0) {
        setSelectedFiles(files);
        setUploadState('title');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(f => validateFile(f));
      if (files.length > 0) {
        setSelectedFiles(files);
        setUploadState('title');
      }
    }
    e.target.value = '';
  };

  const handleTitleConfirm = async (title) => {
    setUploadGroupTitle(title);
    setUploadedName(title);
    setUploadState('uploading');
    setProgress(0);

    try {
      // Create the upload group
      const group = await createUploadGroup(title);
      const groupId = group?.id;

      const searchParams = new URLSearchParams(window.location.search);
      const currentFolderId = searchParams.get('folder') || null;
      const totalFiles = selectedFiles.length;
      const folderCache = {};

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const resolvedFolderId = await resolveFolderIdForPath(file.webkitRelativePath, currentFolderId, folderCache, groupId);
        
        await uploadFile({
          file: file,
          folderId: resolvedFolderId,
          upload_group_id: groupId,
        });

        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      await fetchUploadGroups();
      await fetchAllFolders();
      setProgress(100);
      setUploadState('success');
    } catch (err) {
      setUploadState('idle');
      console.error('Upload error:', err);
    }
  };

  const handleTitleCancel = () => {
    setUploadState('idle');
    setSelectedFiles([]);
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const resetModal = () => {
    setUploadState('idle');
    setProgress(0);
    setUploadedName('');
    setSelectedFiles([]);
    setUploadGroupTitle('');
    onClose();
  };

  return (
    <>
      {/* Upload Title Modal — layered on top */}
      <UploadTitleModal
        isOpen={uploadState === 'title'}
        onConfirm={handleTitleConfirm}
        onCancel={handleTitleCancel}
      />

      <AnimatePresence>
        {uploadState !== 'title' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
              className="absolute inset-0 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl w-full max-w-lg relative z-10 overflow-hidden font-sans"
            >
              {/* Top Header */}
              <div className="flex justify-between items-center pb-4 border-b border-brand-sand dark:border-white/10 mb-5">
                <div className="flex items-center space-x-2">
                  <div className="bg-brand-sage-light/35 p-2 rounded-xl">
                    <FileUp className="w-5 h-5 text-brand-olive" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal dark:text-white">Upload Document Locker</h3>
                </div>
                <button
                  onClick={resetModal}
                  className="p-1.5 text-gray-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-brand-cream/50 dark:hover:bg-white/5 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadState === 'idle' && (
                <div>
                  {/* Drag Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerInputClick}
                    className={`
                      border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-52
                      ${dragActive 
                        ? 'border-brand-olive bg-brand-sage-light/20 scale-[0.99] dark:bg-brand-charcoal/40' 
                        : 'border-brand-sand dark:border-white/10 hover:border-brand-olive dark:hover:border-brand-olive bg-brand-cream/20 dark:bg-brand-charcoal/30 hover:bg-brand-cream/50 dark:hover:bg-brand-charcoal/50'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="bg-brand-cream-dark dark:bg-brand-charcoal/60 p-3 rounded-full text-brand-olive mb-3">
                      <UploadCloud className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h4 className="text-xs font-bold text-brand-charcoal dark:text-white">Drag and drop files here, or browse</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1 max-w-[240px]">
                      Supports documents, images, videos, and zip files up to 10 MB
                    </p>
                  </div>
                </div>
              )}

              {uploadState === 'uploading' && (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-sand dark:border-white/10 border-t-brand-olive dark:border-t-brand-olive animate-spin mb-4" />
                  <h4 className="text-xs font-bold text-brand-charcoal dark:text-white truncate max-w-[320px]">
                    Uploading "{uploadedName}"
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} in this upload group
                  </p>

                  {/* Progress Slider */}
                  <div className="w-full max-w-xs bg-brand-cream-dark dark:bg-brand-charcoal/60 h-2 rounded-full overflow-hidden mt-6 mb-2">
                    <div 
                      className="bg-gradient-to-r from-brand-olive to-emerald-600 h-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold">{progress}%</span>
                </div>
              )}

              {uploadState === 'success' && (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-4 border border-emerald-100 dark:border-emerald-900/30"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h4 className="text-sm font-bold text-brand-charcoal dark:text-white">Upload Successful!</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-1.5 truncate max-w-[320px]">
                    "{uploadedName}" ({selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}) is now stored in your folder.
                  </p>

                  <div className="flex space-x-3 mt-8 w-full">
                    <button
                      onClick={() => {
                        setUploadState('idle');
                        setSelectedFiles([]);
                        setUploadGroupTitle('');
                      }}
                      className="flex-1 bg-brand-cream/60 dark:bg-white/5 border border-brand-sand dark:border-white/10 hover:bg-brand-cream dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-300 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Upload Another
                    </button>
                    <button
                      onClick={resetModal}
                      className="flex-1 bg-gradient-to-r from-brand-olive to-emerald-600 hover:brightness-105 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Go to Locker
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
