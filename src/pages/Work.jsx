import React, { useState, useEffect, useMemo } from 'react';
import { useFiles } from '../context/FileContext';
import { 
  Briefcase, FolderOpen, Upload, Plus, HardDrive, 
  Search, Grid, List, RefreshCw, FileText, ArrowRight 
} from 'lucide-react';
import VideoGrid from '../components/video/VideoGrid';
import VideoList from '../components/video/VideoList';
import VideoToolbar from '../components/video/VideoToolbar';
import VideoPlayer from '../components/video/VideoPlayer';
import ShareVideoModal from '../components/video/ShareVideoModal';
import { videoService } from '../services/videoService';
import { useVideoShare } from '../hooks/useVideoShare';

export default function Work() {
  const { 
    files, 
    folders, 
    fetchAllFiles, 
    fetchAllFolders,
    getOrCreateWorkFolder, 
    uploadFile, 
    deleteFile, 
    renameFile, 
    createFolder,
    renameFolder,
    deleteFolder,
    showNotification 
  } = useFiles();

  const [workFolder, setWorkFolder] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals / dialogs
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);

  const {
    activeItem: shareItem,
    shareLink,
    loading: shareLoading,
    copied: shareCopied,
    error: shareError,
    openShare,
    closeShare,
    copyToClipboard,
  } = useVideoShare();

  // Initialize or fetch the Work folder
  useEffect(() => {
    let isMounted = true;
    const initWork = async () => {
      setLoading(true);
      try {
        const folder = await getOrCreateWorkFolder();
        if (isMounted && folder) {
          setWorkFolder(folder);
          setCurrentFolderId(folder.id);
        }
      } catch (err) {
        console.error('Failed to initialize Work folder:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initWork();
    return () => { isMounted = false; };
  }, []);

  const activeFolderId = currentFolderId || (workFolder ? workFolder.id : null);

  // Filter child folders inside the active folder
  const currentFolders = useMemo(() => {
    if (!activeFolderId) return [];
    return folders.filter(f => f.parentId === activeFolderId || f.parent_folder_id === activeFolderId);
  }, [folders, activeFolderId]);

  // Filter files belonging to active folder
  const currentFiles = useMemo(() => {
    if (!activeFolderId) return [];

    let filtered = files.filter(f => 
      !f.inTrash && 
      (f.folderId === activeFolderId || f.folder_id === activeFolderId || f.videoFolderId === activeFolderId || (f.isWorkSubmission && activeFolderId === workFolder?.id))
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q));
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(f => {
        if (activeFilter === 'documents') return ['pdf', 'doc', 'docx', 'txt'].includes(f.type);
        if (activeFilter === 'images') return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(f.type);
        if (activeFilter === 'videos') return f.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(f.type);
        if (activeFilter === 'archives') return ['zip', 'rar', 'tar', 'gz'].includes(f.type);
        return true;
      });
    }

    return filtered;
  }, [files, activeFolderId, workFolder, searchQuery, activeFilter]);

  // Actions
  const handleUploadSelect = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    const targetFolderId = activeFolderId;

    setIsUploading(true);
    try {
      await uploadFile({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        folderId: targetFolderId
      });
      await fetchAllFiles();
      showNotification(`"${selectedFile.name}" uploaded to Work folder`, 'success');
    } catch (err) {
      showNotification('Upload failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateSubFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !activeFolderId) return;

    try {
      await createFolder(newFolderName.trim(), activeFolderId);
      setNewFolderName('');
      setIsCreatingFolder(false);
      await fetchAllFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayFile = async (file) => {
    try {
      const isVideo = file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.type);
      if (isVideo) {
        const url = await videoService.getPlaybackUrl(file.id);
        setPlaybackUrl(url);
        setPlayingVideo(file);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/download/${file.id}?disposition=inline`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('vaultify_token')}` }
        });
        const json = await res.json();
        const url = json.download_url || json.data?.download_url;
        if (url) window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const isVideo = file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.type);
      let url;
      if (isVideo) {
        url = await videoService.downloadVideo(file.id);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/download/${file.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('vaultify_token')}` }
        });
        const json = await res.json();
        url = json.download_url || json.data?.download_url;
      }
      if (url) window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Move this item to trash?')) {
      try {
        await deleteFile(fileId);
        await fetchAllFiles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRenameFile = async (file) => {
    const newName = window.prompt('Enter new file name:', file.name);
    if (newName && newName.trim() && newName !== file.name) {
      try {
        await renameFile(file.id, newName.trim());
        await fetchAllFiles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const targetFolderId = activeFolderId;
      setIsUploading(true);
      try {
        await uploadFile({
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
          folderId: targetFolderId
        });
        await fetchAllFiles();
        showNotification(`"${selectedFile.name}" uploaded to Work folder`, 'success');
      } catch (err) {
        showNotification('Upload failed: ' + (err.message || 'Unknown error'), 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-sand border-t-brand-olive rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Opening Work Folder...</p>
      </div>
    );
  }

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`space-y-6 text-left transition-all rounded-3xl p-1 ${dragActive ? 'bg-brand-sage-light/20 ring-2 ring-brand-olive ring-dashed' : ''}`}
    >
      {/* Header Banner */}
      <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-olive text-white p-3.5 rounded-2xl shadow-md shrink-0">
            <Briefcase className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Work Folder</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-olive/10 text-brand-olive px-2.5 py-0.5 rounded-full border border-brand-olive/20">
                Admin Monitored
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Official submission folder for monitored students. Only files stored here are visible inside the Admin Portal.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center space-x-1.5 bg-brand-cream border border-brand-sand hover:bg-brand-sand/50 text-brand-charcoal px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4 text-brand-olive" />
            <span>New Subfolder</span>
          </button>

          <label className={`
            flex items-center space-x-2 bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload to Work'}</span>
            <input 
              type="file" 
              onChange={handleUploadSelect} 
              className="hidden" 
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <VideoToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRefresh={() => fetchAllFiles()}
      />

      {/* Create Subfolder Inline Modal */}
      {isCreatingFolder && (
        <form onSubmit={handleCreateSubFolder} className="bg-white border border-brand-sand rounded-2xl p-4 shadow-sm flex items-center space-x-3 max-w-md">
          <FolderOpen className="w-5 h-5 text-brand-olive shrink-0" />
          <input
            type="text"
            placeholder="Subfolder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            className="flex-1 text-xs bg-brand-cream border border-brand-sand rounded-xl px-3 py-2 text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
          />
          <button
            type="submit"
            className="bg-brand-olive text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-brand-olive-dark transition-all"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFolder(false)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Main Grid / List Display */}
      {viewMode === 'grid' ? (
        <VideoGrid
          folders={currentFolders}
          videos={currentFiles}
          onFolderEnter={(f) => setCurrentFolderId(f.id)}
          onFolderRename={(f) => {
            const name = window.prompt('Rename folder:', f.name || f.folder_name);
            if (name && name.trim()) renameFolder(f.id, name.trim());
          }}
          onFolderDelete={(f) => {
            if (window.confirm('Delete folder and contents?')) deleteFolder(f.id);
          }}
          onVideoPlay={handlePlayFile}
          onVideoRename={handleRenameFile}
          onVideoDownload={handleDownloadFile}
          onVideoShare={(f) => openShare(f)}
          onVideoDelete={(f) => handleDeleteFile(f.id)}
        />
      ) : (
        <VideoList
          folders={currentFolders}
          videos={currentFiles}
          onFolderEnter={(f) => setCurrentFolderId(f.id)}
          onFolderRename={(f) => {
            const name = window.prompt('Rename folder:', f.name || f.folder_name);
            if (name && name.trim()) renameFolder(f.id, name.trim());
          }}
          onFolderDelete={(f) => {
            if (window.confirm('Delete folder and contents?')) deleteFolder(f.id);
          }}
          onVideoPlay={handlePlayFile}
          onVideoRename={handleRenameFile}
          onVideoDownload={handleDownloadFile}
          onVideoShare={(f) => openShare(f)}
          onVideoDelete={(f) => handleDeleteFile(f.id)}
        />
      )}

      {/* Video / File Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          src={playbackUrl}
          onClose={() => {
            setPlayingVideo(null);
            setPlaybackUrl(null);
          }}
        />
      )}

      {/* Share Modal */}
      {shareItem && (
        <ShareVideoModal
          video={shareItem}
          shareLink={shareLink}
          loading={shareLoading}
          copied={shareCopied}
          error={shareError}
          onClose={closeShare}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}
