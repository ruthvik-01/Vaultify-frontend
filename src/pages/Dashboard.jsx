import React, { useMemo, useState } from 'react';
import { useFiles } from '../context/FileContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Upload, FileText, ArrowRight,
  Plus, Calendar, HardDrive, Share2,
  FolderOpen, MoreHorizontal, Pencil, Trash2,
  ExternalLink, Copy, Check, X, Package
} from 'lucide-react';

export default function Dashboard() {
  const { 
    files, activities, user, uploadFile, storageStats, showNotification,
    uploadGroups, renameUploadGroup, deleteUploadGroup, shareUploadGroup
  } = useFiles();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Share state
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);

  // Get active files
  const activeFiles = useMemo(() => files.filter(f => !f.inTrash), [files]);

  // Calculate stats — show upload group count instead of individual file count
  const totalUploadGroups = uploadGroups.length;
  
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalStorageUsed = formatSize(storageStats.used);
  const totalStorageLimit = formatSize(storageStats.totalCapacity);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUploadsCount = uploadGroups.filter(g => new Date(g.created_at) >= sevenDaysAgo).length;

  const timeAgo = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Rename handlers
  const startRename = (group) => {
    setRenamingId(group.id);
    setRenameValue(group.title);
    setOpenMenuId(null);
  };

  const confirmRename = async () => {
    if (!renameValue.trim()) return;
    try {
      await renameUploadGroup(renamingId, renameValue.trim());
    } catch (_) {}
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  // Delete handler
  const confirmDelete = async () => {
    try {
      await deleteUploadGroup(deletingId);
    } catch (_) {}
    setDeletingId(null);
  };

  // Share handler
  const handleShare = async (group) => {
    setOpenMenuId(null);
    try {
      const link = await shareUploadGroup(group.id);
      if (link) {
        setShareLink(link);
        navigator.clipboard.writeText(link);
        setShareCopied(true);
        setTimeout(() => {
          setShareCopied(false);
          setShareLink('');
        }, 4000);
      }
    } catch (_) {}
  };

  // Open handler — navigate to my-files
  const handleOpen = (group) => {
    setOpenMenuId(null);
    navigate('/my-files');
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome & Premium Vault Header */}
      <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal leading-tight">
          Welcome back, {user.name ? user.name.split(' ')[0] : 'User'} 👋
        </h1>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl font-sans">
          Welcome to your Vaultify digital repository. Securely archive, manage, preview, and share your personal files, credentials, and academic documents in one centralized, premium cloud-encrypted space.
        </p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Used Card */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="bg-brand-sage-light/30 p-2.5 rounded-2xl text-brand-olive">
              <HardDrive className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-brand-olive uppercase tracking-wider bg-brand-sage-light/25 px-2 py-0.5 rounded-full">
              {user.storage_plan === 'pro' ? 'Pro 1 TB' : 'Free 500 GB'}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-serif font-bold text-brand-charcoal leading-none">
              {storageStats.totalCapacity > 0 ? ((storageStats.used / storageStats.totalCapacity) * 100).toFixed(1) : '0.0'}%
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1.5">Storage Capacity</p>
            <div className="w-full bg-brand-cream-dark h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-brand-olive h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(storageStats.totalCapacity > 0 ? (storageStats.used / storageStats.totalCapacity) * 100 : 0, 100)}%` }} 
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              {totalStorageUsed} of {totalStorageLimit} used
            </p>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>Manage Storage Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Uploads Card */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="bg-brand-sage-light/30 p-2.5 rounded-2xl text-brand-olive">
              <Package className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-brand-cream-dark px-2 py-0.5 rounded-full">
              Uploads
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-serif font-bold text-brand-charcoal leading-none">
              {totalUploadGroups}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1.5">Total Upload Groups</p>
            <p className="text-[10px] text-gray-400 mt-2">
              Grouped uploads &amp; collections
            </p>
          </div>
          <button 
            onClick={() => navigate('/my-files')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>Browse All Files</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Recent Uploads Card */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="bg-brand-sage-light/30 p-2.5 rounded-2xl text-brand-olive">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-brand-cream-dark px-2 py-0.5 rounded-full">
              Weekly
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-serif font-bold text-brand-charcoal leading-none">
              {recentUploadsCount}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1.5">Recent Uploads</p>
            <p className="text-[10px] text-gray-400 mt-2">
              Archived in the past 7 days
            </p>
          </div>
          <button 
            onClick={() => navigate('/upload')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>Upload Documents</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Upload Groups Section */}
      <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-brand-charcoal">Your Uploads</h3>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center space-x-1.5 bg-brand-olive hover:bg-brand-olive-dark text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>New Upload</span>
          </button>
        </div>

        {/* Share link toast */}
        {shareLink && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700">
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold truncate flex-1">{shareLink}</span>
            <span className="text-[10px] text-emerald-500">
              {shareCopied ? 'Copied!' : ''}
            </span>
          </div>
        )}

        {/* Delete confirmation */}
        {deletingId && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs">
            <span className="text-rose-700 font-semibold">Delete this upload group and all its files?</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-rose-600 font-semibold hover:bg-rose-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {uploadGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadGroups.map((group) => (
              <div
                key={group.id}
                className="bg-brand-cream/50 border border-brand-sand/70 rounded-2xl p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group relative"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className={`p-2 rounded-xl border shrink-0 ${group.has_folders 
                      ? 'bg-amber-50 border-amber-200 text-amber-600' 
                      : 'bg-brand-sage-light/30 border-brand-sand text-brand-olive'}`
                    }>
                      {group.has_folders 
                        ? <FolderOpen className="w-4.5 h-4.5" />
                        : <FileText className="w-4.5 h-4.5" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      {renamingId === group.id ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            autoFocus
                            className="text-xs font-bold text-brand-charcoal bg-white border border-brand-olive/40 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-brand-olive"
                          />
                          <button onClick={confirmRename} className="text-emerald-500 hover:text-emerald-700 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={cancelRename} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <h4 className="text-xs font-bold text-brand-charcoal truncate">{group.title}</h4>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(group.created_at)}</p>
                    </div>
                  </div>

                  {/* Action menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === group.id ? null : group.id)}
                      className="p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openMenuId === group.id && (
                      <div className="absolute right-0 top-8 bg-white border border-brand-sand rounded-xl shadow-lg z-20 w-40 py-1 overflow-hidden">
                        <button
                          onClick={() => handleOpen(group)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:bg-brand-cream transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => startRename(group)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:bg-brand-cream transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Rename Title</span>
                        </button>
                        <button
                          onClick={() => handleShare(group)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:bg-brand-cream transition-all cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Upload</span>
                        </button>
                        <hr className="border-brand-sand/60 my-1" />
                        <button
                          onClick={() => { setDeletingId(group.id); setOpenMenuId(null); }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Upload</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center space-x-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span>{group.file_count} {group.file_count === 1 ? 'file' : 'files'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 text-gray-400" />
                    <span>{formatSize(group.total_size)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-brand-cream-dark p-4 rounded-full text-brand-olive mb-3 inline-block">
              <Upload className="w-8 h-8 stroke-[1.4]" />
            </div>
            <h4 className="font-serif text-sm font-bold text-brand-charcoal">No uploads yet</h4>
            <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
              Upload your first files to see them organized here by upload title.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 bg-brand-olive hover:bg-brand-olive-dark text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Upload Files
            </button>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-brand-charcoal">Activity Log</h3>
        
        {activities.length > 0 ? (
          <div className="relative border-l border-brand-sand pl-4 ml-2.5 space-y-5 py-2">
            {activities.slice(0, 8).map(act => (
              <div key={act.id} className="relative">
                <span className="absolute -left-[22.5px] top-1 w-3.5 h-3.5 rounded-full bg-brand-cream border border-brand-olive flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-olive" />
                </span>
                
                <div>
                  <p className="text-xs text-brand-charcoal">
                    <span className="capitalize font-semibold text-brand-olive-dark">
                      {act.action === 'clear_trash' ? 'cleared trash' : act.action}
                    </span>{' '}
                    <span className="font-semibold">{act.fileName}</span>
                  </p>
                  <span className="text-[9px] text-gray-400 font-sans block mt-1 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-300" />
                    <span>{timeAgo(act.timestamp)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 py-6">
            No activity yet. Upload a file to get started.
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
