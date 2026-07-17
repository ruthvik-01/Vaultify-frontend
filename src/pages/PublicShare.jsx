import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '../services/shareService';
import { 
  Download, Film, Folder, AlertTriangle, Loader2, ShieldCheck, Lock, HardDrive, User, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/formatDate';

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function PublicShare() {
  const { token } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSharedItem() {
      setLoading(true);
      setError('');
      try {
        const data = await shareService.getSharedItem(token);
        setItem(data);
      } catch (err) {
        setError(err.message || 'The shared link is invalid, has expired, or has been deleted.');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadSharedItem();
    }
  }, [token]);

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/share/${token}/files/${fileId}`);
      if (!res.ok) {
        throw new Error('Failed to get download URL.');
      }
      const json = await res.json();
      const downloadUrl = json.data.download_url;
      if (downloadUrl) {
        // Trigger download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error(err);
      alert('Could not download file: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans select-none text-left">
        <div className="bg-white border border-brand-sand rounded-3xl p-12 text-center shadow-xl flex flex-col items-center justify-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-brand-olive animate-spin mb-4" />
          <h3 className="font-serif font-bold text-base text-brand-charcoal mb-1">
            Loading Shared Vault...
          </h3>
          <p className="text-[10px] text-brand-olive-dark tracking-widest uppercase font-semibold">
            Decrypting credentials
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans select-none text-left">
        <div className="bg-white border border-brand-sand rounded-3xl p-10 text-center shadow-xl flex flex-col items-center justify-center max-w-md w-full">
          <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-lg text-brand-charcoal mb-2">
            Link Unavailable
          </h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs">
            {error}
          </p>
          <a
            href="/"
            className="px-5 py-2.5 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-brand-olive/15"
          >
            Go to Vaultify Home
          </a>
        </div>
      </div>
    );
  }

  const fileName = item.file_name || item.name || 'Shared File';
  const fileSize = item.file_size || item.size || 0;
  const fileType = item.file_type || item.mimeType || '';
  const downloadUrl = item.download_url || item.downloadUrl;
  const createdAt = item.createdAt;
  const ownerName = item.ownerName || 'Owner';
  const isFolder = item.type === 'folder';

  const isVideo = fileType.startsWith('video/') || ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(fileName.split('.').pop().toLowerCase());

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 md:p-8 font-sans select-none text-left">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col"
      >
        {/* Brand Header */}
        <div className="px-6 py-4 border-b border-brand-sand bg-brand-cream-dark flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-brand-olive text-white p-2 rounded-xl">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold tracking-tight text-brand-charcoal block">Vaultify</span>
              <span className="text-[8px] text-brand-olive-dark font-sans tracking-widest uppercase font-semibold">Secure Share</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-brand-olive uppercase tracking-wider bg-white border border-brand-sand rounded-full px-2.5 py-1 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Shared file details */}
        {!isFolder ? (
          <div className="flex flex-col">
            {/* Video Preview Frame */}
            {isVideo && downloadUrl ? (
              <div className="bg-black aspect-video flex items-center justify-center relative w-full border-b border-brand-sand">
                <video
                  src={downloadUrl}
                  controls
                  preload="metadata"
                  className="w-full h-full max-h-[45vh] object-contain focus:outline-none"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="bg-brand-cream-dark aspect-video flex flex-col items-center justify-center w-full border-b border-brand-sand">
                <Film className="w-16 h-16 text-brand-sage/40 stroke-[1.2]" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">
                  No preview available for this file format
                </span>
              </div>
            )}

            {/* Info panel */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 flex-grow min-w-0">
                <div className="flex items-center space-x-2">
                  <Film className="w-5 h-5 text-brand-olive shrink-0" />
                  <h1 className="font-serif font-bold text-base md:text-lg text-brand-charcoal truncate">
                    {fileName}
                  </h1>
                </div>
                
                {/* Meta details list */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium font-sans">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{formatSize(fileSize)}</span>
                  </div>
                  {createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Uploaded: {formatDate(createdAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Owner: {ownerName}</span>
                  </div>
                </div>
              </div>

              {/* Download Action button */}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-2xl text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-brand-olive/15 text-center shrink-0"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>Download file</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Shared Folder */
          <div className="p-8 space-y-6 text-left">
            <div className="flex items-center space-x-3 pb-4 border-b border-brand-sand">
              <div className="bg-brand-sage-light/50 text-brand-olive p-3 rounded-2xl">
                <Folder className="w-8 h-8 fill-brand-sage/20" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-brand-charcoal mb-0.5">
                  {item.file_name || item.name}
                </h1>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                  Shared Folder Content
                </span>
              </div>
            </div>

            {/* List of files in the folder */}
            <div className="space-y-3">
              <h2 className="font-serif text-sm font-bold text-brand-charcoal">Files</h2>
              {item.files && item.files.length > 0 ? (
                <div className="bg-brand-cream/35 border border-brand-sand/70 rounded-2xl overflow-hidden divide-y divide-brand-sand/50">
                  {item.files.map((file) => (
                    <div 
                      key={file.id || file._id} 
                      className="p-4 flex items-center justify-between hover:bg-brand-cream/70 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="bg-white p-2.5 rounded-xl border border-brand-sand text-brand-olive shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-brand-charcoal block truncate">{file.file_name || file.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{formatSize(file.file_size || file.size)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadFile(file.id || file._id, file.file_name || file.name)}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors shadow-sm select-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-brand-cream border border-brand-sand rounded-2xl p-6 text-center text-xs text-gray-500 font-medium">
                  <span>This folder is empty.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div className="px-6 py-4 bg-brand-cream-dark border-t border-brand-sand text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center select-none">
          Powered by Vaultify Cloud Services • Secure Carrier Link
        </div>
      </motion.div>
    </div>
  );
}
