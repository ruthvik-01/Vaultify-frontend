import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import { 
  Users, Link2, Eye, Download, X, Share2, Calendar, FileText, 
  Award, FolderGit, FileCode, Video, File, Globe, Lock, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';

export default function SharedFiles() {
  const { files, removeShare, getPreviewUrl } = useFiles();
  const [activeTab, setActiveTab] = useState('by-me'); // by-me | with-me

  // Preview panel states
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [textContent, setTextContent] = useState('');

  // Files shared BY the user
  const sharedByMe = files.filter(f => !f.inTrash && f.sharedWith && f.sharedWith.length > 0);

  // Files shared WITH the user (mocked data)
  const [sharedWithMe, setSharedWithMe] = useState([
    {
      id: 'sw1',
      name: 'Placement_Drive_Schedule_2026_V3.pdf',
      owner: 'careers.state@university.edu',
      ownerName: 'Placement Office State Tech',
      size: 1048576, // 1.0 MB
      dateShared: '2026-06-12T09:00:00Z',
      category: 'Placement Documents',
      type: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'sw2',
      name: 'CSE_Senior_Capstone_Project_Rubric.pdf',
      owner: 'head.cse@university.edu',
      ownerName: 'Dr. Aris Thorne',
      size: 471859, // 460 KB
      dateShared: '2026-06-08T11:30:00Z',
      category: 'Assignments',
      type: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'sw3',
      name: 'System_Design_Cheatsheet.txt',
      owner: 'senior.peer@google.com',
      ownerName: 'Rahul Mehta (Alumni)',
      size: 12400, // 12 KB
      dateShared: '2026-05-30T16:00:00Z',
      category: 'Notes',
      type: 'txt',
      mimeType: 'text/plain'
    }
  ]);

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

  const getFileIcon = (file) => {
    if (file.category === 'Certificates') return <Award className="w-8 h-8 text-amber-600" />;
    if (file.category === 'Projects') return <FolderGit className="w-8 h-8 text-brand-olive" />;
    
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

  const handleCopyLink = (fileId) => {
    navigator.clipboard.writeText(`https://studentvault.co/shared-preview/${fileId}`);
    alert('Secure share link copied to clipboard!');
  };

  const handleOpenPreview = async (file) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    setPreviewUrl(null);
    setTextContent('');
    
    try {
      let url;
      // Check if it's a mocked sharedWithMe file or real file
      if (file.id.startsWith('sw')) {
        url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/download-simulated/mock-shared?filename=${encodeURIComponent(file.name)}&disposition=inline`;
      } else {
        url = await getPreviewUrl(file.id);
      }
      
      setPreviewUrl(url);

      const ext = file.name.split('.').pop().toLowerCase();
      const isText = ['txt', 'js', 'json', 'css', 'html', 'md'].includes(ext) || (file.mimeType && file.mimeType.startsWith('text/'));
      if (isText && url) {
        const textRes = await fetch(url);
        if (textRes.ok) {
          const txt = await textRes.text();
          setTextContent(txt);
        } else {
          setTextContent(`Failed to load text content.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = (file) => {
    const downloadUrl = file.id.startsWith('sw')
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/download-simulated/mock-shared?filename=${encodeURIComponent(file.name)}&disposition=attachment`
      : null;

    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      // Direct S3 download via API
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/download/${file.id}?disposition=attachment`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Tabs */}
      <div className="flex bg-white border border-brand-sand p-1 rounded-2xl w-full max-w-md shadow-sm">
        <button
          onClick={() => setActiveTab('by-me')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'by-me'
              ? 'bg-brand-olive text-white shadow-sm'
              : 'text-gray-500 hover:text-brand-charcoal'
          }`}
        >
          Shared by Me ({sharedByMe.length})
        </button>
        <button
          onClick={() => setActiveTab('with-me')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'with-me'
              ? 'bg-brand-olive text-white shadow-sm'
              : 'text-gray-500 hover:text-brand-charcoal'
          }`}
        >
          Shared with Me ({sharedWithMe.length})
        </button>
      </div>

      {/* Grid: Shared BY me */}
      {activeTab === 'by-me' && (
        <div className="space-y-4">
          {sharedByMe.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedByMe.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-brand-cream rounded-2xl border border-brand-sand/40">
                      {getFileIcon(file)}
                    </div>
                    
                    <button
                      onClick={() => handleCopyLink(file.id)}
                      className="p-2 hover:bg-brand-cream rounded-xl border border-brand-sand/50 text-brand-charcoal transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5 text-brand-olive" />
                      <span>Copy URL</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-serif text-sm font-bold text-brand-charcoal truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
                      <span>Size: {formatSize(file.size)}</span>
                      <span>•</span>
                      <span className="text-brand-olive bg-brand-sage-light/25 px-2 py-0.5 rounded-full font-semibold">
                        {file.category}
                      </span>
                    </div>
                  </div>

                  {/* Recipients List */}
                  <div className="pt-3 border-t border-brand-sand/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Permitted Access ({file.sharedWith.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {file.sharedWith.map((email, idx) => (
                        <span key={idx} className="bg-brand-cream border border-brand-sand/60 text-[9px] font-semibold px-2 py-1 rounded-xl flex items-center space-x-1.5 text-gray-600">
                          <span className="truncate max-w-[140px]">{email}</span>
                          <button
                            onClick={() => {
                              removeShare(file.id, email);
                              alert(`Access revoked for ${email}`);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white border border-brand-sand rounded-3xl p-8 shadow-sm">
              <EmptyState 
                title="No shared links yet"
                description="When you share a file with recruiters, it will appear here so you can monitor access permission settings."
                actionText="Go to Locker Files"
                onActionClick={() => window.location.href = '/my-files'}
                icon={Share2}
              />
            </div>
          )}
        </div>
      )}

      {/* Grid: Shared WITH me */}
      {activeTab === 'with-me' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedWithMe.map((file) => (
            <motion.div
              key={file.id}
              className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-brand-cream rounded-2xl border border-brand-sand/40">
                  {getFileIcon(file)}
                </div>
                
                <span className="text-[10px] text-gray-400 font-medium flex items-center space-x-1 bg-brand-cream px-2 py-1 border border-brand-sand/40 rounded-xl">
                  <Calendar className="w-3 h-3 text-brand-olive" />
                  <span>{formatDate(file.dateShared)}</span>
                </span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-brand-charcoal truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Size: {formatSize(file.size)}</span>
                  <span className="text-brand-olive bg-brand-sage-light/25 px-2 py-0.5 rounded-full font-semibold">
                    {file.category}
                  </span>
                </div>
              </div>

              {/* Owner details */}
              <div className="pt-3 border-t border-brand-sand/50 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Shared By
                </span>
                <span className="font-bold text-xs text-brand-charcoal">{file.ownerName}</span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">{file.owner}</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => handleOpenPreview(file)}
                  className="flex-1 bg-brand-cream hover:bg-brand-sand/40 border border-brand-sand text-brand-charcoal font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dynamic Inline Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pb-4 border-b border-brand-sand mb-4">
                <div className="p-2.5 bg-brand-cream rounded-xl border border-brand-sand/50">
                  {getFileIcon(previewFile)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal block line-clamp-1">{previewFile.name}</h3>
                  <p className="text-xs text-gray-500 font-sans">
                    Category: <span className="font-semibold text-brand-olive">{previewFile.category}</span> • Size: {formatSize(previewFile.size)}
                  </p>
                </div>
              </div>

              {/* Preview frame */}
              <div className="bg-brand-cream border border-brand-sand/80 rounded-2xl flex-grow overflow-hidden flex flex-col items-center justify-center min-h-[350px] relative">
                {previewLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-olive" />
                    <span className="text-xs text-gray-500 mt-2">Retrieving vault item...</span>
                  </div>
                ) : previewUrl ? (
                  (() => {
                    const ext = previewFile.name.split('.').pop().toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || (previewFile.mimeType && previewFile.mimeType.startsWith('image/'));
                    const isPdf = ext === 'pdf' || (previewFile.mimeType && previewFile.mimeType === 'application/pdf');
                    const isText = ['txt', 'js', 'json', 'css', 'html', 'md'].includes(ext) || (previewFile.mimeType && previewFile.mimeType.startsWith('text/'));

                    if (isImage) {
                      return (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <img 
                            src={previewUrl} 
                            className="max-h-[55vh] max-w-full object-contain rounded-xl shadow border border-brand-sand/40 bg-white" 
                            alt={previewFile.name} 
                          />
                        </div>
                      );
                    } else if (isPdf) {
                      return (
                        <iframe 
                          src={previewUrl} 
                          className="w-full h-[55vh] rounded-xl border border-brand-sand/50 bg-white" 
                          title={previewFile.name} 
                        />
                      );
                    } else if (isText) {
                      return (
                        <pre className="w-full h-[55vh] p-4 bg-brand-charcoal text-emerald-400 font-mono text-[11px] rounded-xl overflow-auto whitespace-pre-wrap text-left border border-brand-charcoal">
                          {textContent}
                        </pre>
                      );
                    } else {
                      return (
                        <div className="text-center p-6">
                          <FileText className="w-16 h-16 text-brand-olive/60 mx-auto mb-3" />
                          <h4 className="font-semibold text-brand-charcoal text-sm mb-1">{previewFile.name}</h4>
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-brand-olive hover:bg-brand-olive-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download File</span>
                          </a>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="text-center p-6">
                    <span className="text-xs text-red-500 font-semibold">Failed to establish secure preview connection.</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-brand-sand flex justify-end">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal px-4 py-2 rounded-xl font-semibold transition-all text-xs"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
