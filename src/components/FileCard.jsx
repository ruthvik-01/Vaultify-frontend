import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import { 
  FileText, Award, FolderGit, FileCode, Video, File, 
  MoreVertical, Star, Share2, Trash2, ArrowUpRight, 
  Download, Eye, UserPlus, ShieldAlert, Check, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileCard({ file, viewMode = 'grid', isTrashView = false }) {
  const { toggleStar, deleteFile, restoreFile, permanentlyDeleteFile, shareFile, removeShare, downloadFile } = useFiles();
  const [showMenu, setShowMenu] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get matching icon based on file properties
  const getFileIcon = () => {
    if (file.category === 'Certificates') {
      return <Award className="w-8 h-8 text-amber-600" />;
    }
    if (file.category === 'Projects') {
      return <FolderGit className="w-8 h-8 text-brand-olive" />;
    }
    
    switch (file.type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'zip':
      case 'rar':
        return <FileCode className="w-8 h-8 text-indigo-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-500" />;
      case 'video':
      case 'mp4':
        return <Video className="w-8 h-8 text-cyan-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    shareFile(file.id, shareEmail.trim());
    setShareEmail('');
    alert(`File shared with ${shareEmail.trim()}`);
  };

  const handleDownload = () => {
    downloadFile(file.id, file.name);
    setShowMenu(false);
  };

  // Render List View Mode
  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-brand-cream-dark/40 transition-all border-b border-brand-sand/50">
        <td className="py-4 px-4 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-cream rounded-xl border border-brand-sand/30">
              {getFileIcon()}
            </div>
            <div className="max-w-xs sm:max-w-md truncate">
              <span className="text-xs font-semibold text-brand-charcoal block truncate">{file.name}</span>
              <span className="text-[10px] text-gray-400 font-sans block mt-0.5 sm:hidden">{file.category}</span>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 hidden sm:table-cell">
          <span className="bg-brand-sage-light/25 text-brand-olive font-medium px-2 py-0.5 rounded-full text-[10px]">
            {file.category}
          </span>
        </td>
        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 font-mono">
          {formatSize(file.size)}
        </td>
        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-400">
          {formatDate(file.dateAdded)}
        </td>
        <td className="py-4 px-4 whitespace-nowrap text-right text-xs">
          <div className="flex items-center justify-end space-x-2">
            {!isTrashView && (
              <button
                onClick={() => toggleStar(file.id)}
                className={`p-1.5 rounded-lg transition-all ${file.isStarred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            )}
            
            {/* Actions triggers */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-brand-sand/55 text-gray-400 hover:text-brand-charcoal rounded-lg transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Popover Action Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowSharePanel(false); }} />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-brand-sand rounded-xl shadow-lg z-50 py-1.5 text-left">
                    {isTrashView ? (
                      <>
                        <button
                          onClick={() => { restoreFile(file.id); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-brand-olive hover:bg-brand-cream"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restore File</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete forever? This action cannot be undone.')) {
                              permanentlyDeleteFile(file.id);
                            }
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Forever</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setShowPreviewPanel(true); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick Preview</span>
                        </button>
                        <button
                          onClick={() => setShowSharePanel(!showSharePanel)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share / Permissions</span>
                        </button>
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                        <div className="border-t border-brand-sand my-1" />
                        <button
                          onClick={() => { deleteFile(file.id); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Move to Trash</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  // Render Grid View Mode (Default Showcase)
  return (
    <>
      <motion.div
        layout
        className="bg-white border border-brand-sand rounded-2xl p-4 relative group hover:shadow-md transition-all flex flex-col justify-between"
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Top Header Card Info */}
        <div className="flex justify-between items-start mb-3">
          <div className="p-2.5 bg-brand-cream rounded-xl border border-brand-sand/40">
            {getFileIcon()}
          </div>
          
          <div className="flex items-center space-x-1.5">
            {!isTrashView && (
              <button
                onClick={() => toggleStar(file.id)}
                className={`p-1 rounded-md transition-all hover:bg-brand-cream ${file.isStarred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-md transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Popover Action Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowSharePanel(false); }} />
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-brand-sand rounded-xl shadow-lg z-50 py-1 text-left">
                    {isTrashView ? (
                      <>
                        <button
                          onClick={() => { restoreFile(file.id); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-brand-olive hover:bg-brand-cream"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restore File</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Permanently delete this file? This cannot be undone.')) {
                              permanentlyDeleteFile(file.id);
                            }
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Forever</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setShowPreviewPanel(true); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick Preview</span>
                        </button>
                        <button
                          onClick={() => setShowSharePanel(!showSharePanel)}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share / Link</span>
                        </button>
                        <button
                          onClick={handleDownload}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-cream"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                        <div className="border-t border-brand-sand my-1" />
                        <button
                          onClick={() => { deleteFile(file.id); setShowMenu(false); }}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Move to Trash</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* File Details */}
        <div className="mt-2">
          <span className="text-[10px] text-brand-olive bg-brand-sage-light/25 font-semibold px-2 py-0.5 rounded-full inline-block mb-1">
            {file.category}
          </span>
          <h4 className="text-xs font-bold text-brand-charcoal block line-clamp-1 group-hover:text-brand-olive transition-all" title={file.name}>
            {file.name}
          </h4>
          
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
            <span>{formatSize(file.size)}</span>
            <span>{formatDate(file.dateAdded)}</span>
          </div>
        </div>

        {/* Display shared indicator */}
        {!isTrashView && file.sharedWith && file.sharedWith.length > 0 && (
          <div className="mt-3 pt-2 border-t border-brand-sand/40 flex items-center justify-between">
            <span className="text-[9px] font-sans font-medium text-gray-500">Shared with {file.sharedWith.length} user(s)</span>
            <div className="flex -space-x-1">
              {file.sharedWith.slice(0, 3).map((email, idx) => (
                <div key={idx} className="w-4 h-4 rounded-full bg-brand-olive text-white text-[7px] font-bold flex items-center justify-center border border-white uppercase" title={email}>
                  {email.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Sharing Details Overlay Drawer */}
      <AnimatePresence>
        {showSharePanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSharePanel(false)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-md relative z-10"
            >
              <button
                onClick={() => setShowSharePanel(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-1">Share Credential</h3>
              <p className="text-xs text-gray-500 mb-4 truncate">File: {file.name}</p>

              <form onSubmit={handleShareSubmit} className="mb-4">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Invite via email address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    required
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="flex-1 px-3 py-2 border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal bg-brand-cream"
                  />
                  <button
                    type="submit"
                    className="bg-brand-olive hover:bg-brand-olive-dark text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </form>

              {/* Shared with section */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                  Who has access ({file.sharedWith.length})
                </span>
                {file.sharedWith.length > 0 ? (
                  <ul className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {file.sharedWith.map((email, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-brand-cream border border-brand-sand/60 px-3 py-2 rounded-xl text-xs">
                        <span className="text-brand-charcoal truncate pr-2" title={email}>{email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeShare(file.id, email);
                            alert(`Removed share permission for ${email}`);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-brand-cream/60 border border-brand-sand border-dashed p-4 rounded-2xl text-center text-xs text-gray-500 font-sans">
                    This file is currently private. Only you can view or download it.
                  </div>
                )}
              </div>

              {/* Public link share */}
              <div className="mt-5 pt-4 border-t border-brand-sand flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Secret Sharing URL</span>
                  <span className="text-[10px] text-gray-400">Anyone with this link can access the file</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://studentvault.co/shared-preview/${file.id}`);
                    alert('Copied secure file share link to clipboard!');
                  }}
                  className="bg-brand-cream-dark hover:bg-brand-sand text-brand-charcoal px-3 py-2 rounded-xl text-[10px] font-bold border border-brand-sand transition-all flex items-center space-x-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Copy Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Quick Preview Overlay Drawer */}
      <AnimatePresence>
        {showPreviewPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreviewPanel(false)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setShowPreviewPanel(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pb-4 border-b border-brand-sand mb-4">
                <div className="p-2.5 bg-brand-cream rounded-xl border border-brand-sand/50">
                  {getFileIcon()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal block line-clamp-1">{file.name}</h3>
                  <p className="text-xs text-gray-500 font-sans">
                    Category: <span className="font-semibold text-brand-olive">{file.category}</span> • Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Dynamic Preview Frame based on category or properties */}
              <div className="bg-brand-cream border border-brand-sand/80 rounded-2xl flex-grow overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[300px]">
                {file.category === 'Certificates' ? (
                  <div className="w-full max-w-md border border-amber-200 bg-amber-50/20 p-6 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full" />
                    <Award className="w-16 h-16 text-amber-600 mx-auto mb-3" />
                    <span className="text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-100 px-3 py-1 rounded-full">
                      Verified Scholastic Credential
                    </span>
                    <h4 className="font-serif text-xl font-semibold mt-4 text-brand-charcoal">
                      {file.name.replace(/_/g, ' ').replace('.pdf', '')}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Verified Issuer: {file.certificateIssuer || 'State Tech University'}</p>
                    
                    <div className="mt-6 pt-4 border-t border-amber-200/50 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] text-left">Credential ID</span>
                        <span className="font-mono font-bold text-brand-charcoal">{file.credentialId || 'SV-88390-CERT'}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        Status Active
                      </span>
                    </div>
                  </div>
                ) : file.category === 'Projects' ? (
                  <div className="w-full max-w-md bg-white border border-brand-sand p-6 rounded-2xl shadow-sm">
                    <FolderGit className="w-12 h-12 text-brand-olive mb-3" />
                    <h4 className="font-serif text-lg font-bold text-brand-charcoal">{file.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Contains source files, design tokens, and documentation.</p>

                    {file.projectLink && (
                      <div className="mt-4 bg-brand-cream border border-brand-sand p-3 rounded-xl flex justify-between items-center text-xs">
                        <span className="font-mono text-gray-500 truncate max-w-[200px]">{file.projectLink}</span>
                        <a
                          href={file.projectLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-brand-olive text-white px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 hover:bg-brand-olive-dark transition-all text-[10px]"
                        >
                          <span>Visit Repo</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center max-w-md">
                    <FileText className="w-16 h-16 text-brand-olive/60 mx-auto mb-3" />
                    <h4 className="font-semibold text-brand-charcoal text-sm mb-1">{file.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Safe PDF & Document Reader. StudentVault verified encryption guarantees no tracking scripts or adware are attached.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="mt-6 inline-flex bg-brand-olive hover:bg-brand-olive-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold items-center space-x-2 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF Preview</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tag showcase */}
              {file.tags && file.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {file.tags.map((tag, idx) => (
                    <span key={idx} className="bg-brand-cream-dark text-gray-600 text-[10px] px-2 py-0.5 rounded-md border border-brand-sand/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-brand-sand flex justify-between items-center text-xs">
                <span className="text-gray-400">Uploaded on {formatDate(file.dateAdded)} • {file.downloadCount || 0} downloads</span>
                <button
                  onClick={() => setShowPreviewPanel(false)}
                  className="bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
