import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import FileCard from '../components/FileCard';
import EmptyState from '../components/EmptyState';
import { 
  Grid, List, Filter, Search, FileX, Plus,
  FolderClosed, Trash2, Edit2, Share2, X, FolderDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyFiles() {
  const { 
    files, folders, user, searchQuery, setSearchQuery, updateProfile,
    createFolder, renameFolder, deleteFolder, shareFile, showNotification
  } = useFiles();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [viewMode, setViewMode] = useState(user.theme_color || 'grid'); // grid | list
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // all | image | pdf | document | video | other
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded | size | name
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
  const [highlightedId, setHighlightedId] = useState(null);

  // Folder Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderToRename, setFolderToRename] = useState(null);

  // Active folder from URL params
  const currentFolderId = searchParams.get('folder') || null;

  // Sync viewMode preference immediately from User profile settings
  useEffect(() => {
    if (user.theme_color) {
      setViewMode(user.theme_color);
    }
  }, [user.theme_color]);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Navigate folder
  const handleNavigateFolder = (folderId) => {
    if (!folderId) {
      searchParams.delete('folder');
    } else {
      searchParams.set('folder', folderId);
    }
    searchParams.delete('highlight');
    setSearchParams(searchParams);
  };

  // Derive breadcrumbs trail
  const breadcrumbs = useMemo(() => {
    const trail = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        trail.unshift(folder);
        currentId = folder.parent_folder_id;
      } else {
        break;
      }
    }
    return trail;
  }, [folders, currentFolderId]);

  // Filter custom folders in current directory
  const activeFolders = useMemo(() => {
    return folders.filter(f => f.parent_folder_id === currentFolderId);
  }, [folders, currentFolderId]);

  // Filter and sort files inside current folder
  const sortedFiles = useMemo(() => {
    const activeFiles = files.filter(f => !f.inTrash);

    // Search query matches globally, or filters by directory if no query
    const dirFiltered = activeFiles.filter(f => {
      if (searchQuery) return true;
      return f.folder_id === currentFolderId;
    });

    const searchedFiles = dirFiltered.filter(f => {
      if (!searchQuery) return true;
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const typeFiltered = searchedFiles.filter(f => {
      if (fileTypeFilter === 'all') return true;
      const ext = f.name.split('.').pop().toLowerCase();
      const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || (f.mimeType && f.mimeType.startsWith('image/'));
      const isPdf = ext === 'pdf' || (f.mimeType && f.mimeType === 'application/pdf');
      const isVideo = ['mp4', 'mkv', 'avi', 'mov', 'video'].includes(f.type) || (f.mimeType && f.mimeType.startsWith('video/'));
      const isDoc = ['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) || (f.mimeType && (f.mimeType.startsWith('text/') || f.mimeType.includes('document') || f.mimeType.includes('sheet')));
      
      if (fileTypeFilter === 'image') return isImg;
      if (fileTypeFilter === 'pdf') return isPdf;
      if (fileTypeFilter === 'video') return isVideo;
      if (fileTypeFilter === 'document') return isDoc;
      if (fileTypeFilter === 'other') return !isImg && !isPdf && !isVideo && !isDoc;
      return true;
    });

    return [...typeFiltered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dateAdded') {
        comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [files, searchQuery, currentFolderId, fileTypeFilter, sortBy, sortOrder]);

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameFolderSubmit = async () => {
    if (!newFolderName.trim() || !folderToRename) return;
    try {
      await renameFolder(folderToRename.id, newFolderName.trim());
      setNewFolderName('');
      setFolderToRename(null);
      setIsRenameOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerFolderShare = async (folder) => {
    try {
      const link = await shareFile(null, 'read', 24, folder.id);
      if (link) {
        await navigator.clipboard.writeText(link);
        showNotification('Folder share link copied to clipboard!', 'success');
      } else {
        showNotification('Failed to generate folder share link', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to generate folder share link', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Folder Navigation Breadcrumbs Path */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-brand-sand rounded-3xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center space-x-1.5 text-xs text-gray-400 select-none">
          <FolderDot className="w-4 h-4 text-brand-olive" />
          <button 
            onClick={() => handleNavigateFolder(null)}
            className="hover:text-brand-charcoal hover:underline font-bold text-gray-500 cursor-pointer"
          >
            Locker Root
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <span>/</span>
              <button 
                onClick={() => handleNavigateFolder(crumb.id)}
                className={`hover:text-brand-charcoal hover:underline cursor-pointer ${
                  idx === breadcrumbs.length - 1 ? 'text-brand-charcoal font-bold' : 'text-gray-500 font-semibold'
                }`}
              >
                {crumb.folder_name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Button: Create Folder */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Search Bar & File Type Filter Tags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-brand-sand rounded-3xl p-5 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files inside locker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-brand-charcoal font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* File Type Filters */}
        <div className="flex overflow-x-auto gap-2 scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'all', name: 'All Types' },
            { id: 'image', name: 'Images' },
            { id: 'pdf', name: 'PDFs' },
            { id: 'document', name: 'Documents' },
            { id: 'video', name: 'Videos' },
            { id: 'other', name: 'Others' }
          ].map((typeOpt) => (
            <button
              key={typeOpt.id}
              onClick={() => setFileTypeFilter(typeOpt.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                fileTypeFilter === typeOpt.id
                  ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                  : 'bg-brand-cream border-brand-sand text-gray-500 hover:text-brand-charcoal'
              }`}
            >
              {typeOpt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Folders List/Grid Cards */}
      {activeFolders.length > 0 && !searchQuery && (
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-brand-charcoal">Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => handleNavigateFolder(folder.id)}
                className="bg-white border border-brand-sand hover:border-brand-olive rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-sm cursor-pointer select-none relative transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="bg-brand-sage-light/20 p-2.5 rounded-xl text-brand-olive shrink-0">
                    <FolderClosed className="w-5 h-5 fill-brand-sage/10" />
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal truncate pr-4" title={folder.folder_name}>
                    {folder.folder_name}
                  </span>
                </div>

                {/* Folder Row Actions */}
                <div className="flex items-center space-x-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => triggerFolderShare(folder)}
                    className="p-1 text-gray-400 hover:text-brand-olive hover:bg-brand-cream rounded-lg transition-colors cursor-pointer"
                    title="Share Folder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setFolderToRename(folder);
                      setNewFolderName(folder.folder_name);
                      setIsRenameOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-brand-olive hover:bg-brand-cream rounded-lg transition-colors cursor-pointer"
                    title="Rename Folder"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteFolder(folder.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb & Sorting options */}
      <div className="bg-white border border-brand-sand rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-brand-olive" />
          <span className="text-gray-500 font-medium">Locker Contents:</span>
          <span className="text-[10px] text-gray-400 bg-brand-cream-dark px-2 py-0.5 rounded-full font-bold font-mono">
            {sortedFiles.length} file{sortedFiles.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="bg-brand-cream border border-brand-sand rounded-xl px-2.5 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
            >
              <option value="dateAdded-desc">Latest</option>
              <option value="dateAdded-asc">Oldest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">File Size (Large to Small)</option>
              <option value="size-asc">File Size (Small to Large)</option>
            </select>
          </div>

          <div className="h-6 w-px bg-brand-sand" />

          {/* List/Grid View Mode toggle */}
          <div className="flex items-center space-x-1.5 bg-brand-cream border border-brand-sand p-1 rounded-xl">
            <button
              onClick={() => {
                setViewMode('grid');
                updateProfile({ theme_color: 'grid' });
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-charcoal'}`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                updateProfile({ theme_color: 'list' });
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-charcoal'}`}
              title="List Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display Section */}
      <div className="space-y-4">
        {sortedFiles.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedFiles.map((file) => {
                const isHighlighted = highlightedId === file.id;
                return (
                  <div 
                    key={file.id} 
                    className={`transition-all duration-700 rounded-2xl ${
                      isHighlighted 
                        ? 'ring-2 ring-brand-olive shadow-lg ring-offset-2 scale-102 bg-brand-sage-light/10' 
                        : ''
                    }`}
                  >
                    <FileCard file={file} viewMode="grid" />
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Layout */
            <div className="bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-sand/70 text-left">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date Added</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand/55">
                    {sortedFiles.map((file) => (
                      <FileCard key={file.id} file={file} viewMode="list" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Empty Directory State */
          <div className="py-12">
            <EmptyState 
              title="Empty Folder"
              description="No files inside this directory. Upload file or navigate back."
              actionText="Back to Root"
              onActionClick={() => handleNavigateFolder(null)}
              icon={FileX}
            />
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-brand-sand mb-4">
                <h3 className="font-serif text-sm font-bold text-brand-charcoal">Create New Folder</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal mb-5"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolderSubmit}
                  className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Folder Modal */}
      <AnimatePresence>
        {isRenameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRenameOpen(false)}
              className="absolute inset-0 bg-brand-charcoal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-sand rounded-3xl p-6 shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-brand-sand mb-4">
                <h3 className="font-serif text-sm font-bold text-brand-charcoal">Rename Folder</h3>
                <button
                  onClick={() => setIsRenameOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-brand-charcoal hover:bg-brand-cream rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal mb-5"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsRenameOpen(false)}
                  className="flex-1 bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameFolderSubmit}
                  className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  Rename Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
