import { useState, useEffect, useCallback } from 'react';
import { useFiles } from '../context/FileContext';
import { videoService } from '../services/videoService';
import { useVideoFolders } from '../hooks/useVideoFolders';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { useVideoShare } from '../hooks/useVideoShare';

import Breadcrumbs from '../components/video/Breadcrumbs';
import VideoToolbar from '../components/video/VideoToolbar';
import VideoGrid from '../components/video/VideoGrid';
import VideoList from '../components/video/VideoList';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoUploadDialog from '../components/video/VideoUploadDialog';
import UploadProgress from '../components/video/UploadProgress';
import ShareVideoModal from '../components/video/ShareVideoModal';
import FolderTree from '../components/video/FolderTree';

import { Film, RefreshCw } from 'lucide-react';

export default function Videos() {
  const { user } = useFiles();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(user.theme_color || 'grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs / Modals toggles
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadProgressOpen, setIsUploadProgressOpen] = useState(true);

  // Modal active items
  const [activeItem, setActiveItem] = useState(null); // video or folder object
  const [renameInput, setRenameInput] = useState('');
  const [newFolderNameInput, setNewFolderNameInput] = useState('');

  // Playing state
  const [playingVideo, setPlayingVideo] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);

  // Initialize Hooks
  const {
    folders,
    currentFolderId,
    setCurrentFolderId,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    getBreadcrumbs,
    refreshFolders,
  } = useVideoFolders();

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUploadComplete = (fileData, folderId) => {
    // Associate the uploaded file with the folderId locally
    if (folderId) {
      videoService.moveVideo(fileData.id, folderId);
    }
    fetchVideos();
  };

  const {
    queue,
    addFilesToQueue,
    cancelUpload,
    retryUpload,
  } = useVideoUpload(handleUploadComplete);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVideos();
  }, [fetchVideos]);

  // Sync user's preference
  useEffect(() => {
    if (user.theme_color) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMode(user.theme_color);
    }
  }, [user.theme_color]);

  // Item actions
  const handlePlayVideo = async (video) => {
    try {
      const url = await videoService.getPlaybackUrl(video.id);
      setPlaybackUrl(url);
      setPlayingVideo(video);
    } catch (e) {
      console.error('Failed to play video', e);
    }
  };

  const handleDownloadVideo = async (video) => {
    try {
      const url = await videoService.downloadVideo(video.id);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVideoDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this video?')) {
      try {
        await videoService.deleteVideo(id, true);
        fetchVideos();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Folder Actions
  const handleFolderDelete = async (id) => {
    if (window.confirm('Deleting this folder will delete all subfolders. Are you sure you want to proceed?')) {
      try {
        const deletedIds = await deleteFolder(id);
        
        // Clean up video folder references
        const map = JSON.parse(localStorage.getItem('vaultify_video_file_folders') || '{}');
        Object.keys(map).forEach((key) => {
          if (deletedIds.includes(map[key])) {
            delete map[key];
          }
        });
        localStorage.setItem('vaultify_video_file_folders', JSON.stringify(map));
        
        fetchVideos();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Rename modal triggers
  const triggerRename = (item) => {
    setActiveItem(item);
    setRenameInput(item.name);
    setIsRenameOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!renameInput.trim()) return;
    try {
      if (activeItem.type === 'folder') {
        await renameFolder(activeItem.id, renameInput);
      } else {
        await videoService.renameVideo(activeItem.id, renameInput);
        fetchVideos();
      }
      setIsRenameOpen(false);
      setActiveItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Move modal triggers
  const triggerMove = (item) => {
    setActiveItem(item);
    setIsMoveOpen(true);
  };

  const handleMoveConfirm = async (targetParentId) => {
    try {
      if (activeItem.type === 'folder') {
        await moveFolder(activeItem.id, targetParentId);
      } else {
        await videoService.moveVideo(activeItem.id, targetParentId);
        fetchVideos();
      }
      setIsMoveOpen(false);
      setActiveItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolderConfirm = async () => {
    if (!newFolderNameInput.trim()) return;
    try {
      await createFolder(newFolderNameInput);
      setNewFolderNameInput('');
      setIsCreateFolderOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Data Filtering
  const activeFolders = folders.filter((f) => f.parentId === currentFolderId);
  const activeVideos = videos.filter((v) => v.videoFolderId === currentFolderId && !v.inTrash);

  const filteredFolders = activeFolders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredVideos = activeVideos.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trail = getBreadcrumbs();

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-olive text-white p-3 rounded-2xl shadow-md shadow-brand-olive/10">
            <Film className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-brand-charcoal">
              Video Management
            </h1>
            <p className="text-[10px] text-brand-olive-dark font-sans tracking-widest uppercase font-semibold">
              SaaS Media Vault
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchVideos();
            refreshFolders();
          }}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand-cream hover:bg-brand-sand/50 text-brand-charcoal border border-brand-sand rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Breadcrumbs Navigation */}
      <Breadcrumbs trail={trail} onNavigate={setCurrentFolderId} />

      {/* Toolbar */}
      <VideoToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateFolder={() => setIsCreateFolderOpen(true)}
        onUploadFileClick={() => setIsUploadOpen(true)}
        onUploadFolderClick={() => setIsUploadOpen(true)}
      />

      {/* Media Content Grid/List */}
      {loading ? (
        <div className="bg-white border border-brand-sand rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px] select-none">
          <RefreshCw className="w-8 h-8 text-brand-olive animate-spin mb-4" />
          <h3 className="font-serif font-bold text-sm text-brand-charcoal">
            Syncing Vault Media...
          </h3>
        </div>
      ) : viewMode === 'grid' ? (
        <VideoGrid
          folders={filteredFolders}
          videos={filteredVideos}
          onFolderEnter={setCurrentFolderId}
          onFolderRename={triggerRename}
          onFolderMove={triggerMove}
          onFolderShare={openShare}
          onFolderDelete={handleFolderDelete}
          onVideoPlay={handlePlayVideo}
          onVideoRename={triggerRename}
          onVideoMove={triggerMove}
          onVideoDownload={handleDownloadVideo}
          onVideoShare={openShare}
          onVideoDelete={handleVideoDelete}
        />
      ) : (
        <VideoList
          folders={filteredFolders}
          videos={filteredVideos}
          onFolderEnter={setCurrentFolderId}
          onFolderRename={triggerRename}
          onFolderMove={triggerMove}
          onFolderShare={openShare}
          onFolderDelete={handleFolderDelete}
          onVideoPlay={handlePlayVideo}
          onVideoRename={triggerRename}
          onVideoMove={triggerMove}
          onVideoDownload={handleDownloadVideo}
          onVideoShare={openShare}
          onVideoDelete={handleVideoDelete}
        />
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          playbackUrl={playbackUrl}
          onClose={() => {
            setPlayingVideo(null);
            setPlaybackUrl(null);
          }}
        />
      )}

      {/* Upload Dialog */}
      <VideoUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(filesList) => {
          addFilesToQueue(filesList, currentFolderId);
          setIsUploadProgressOpen(true);
        }}
      />

      {/* Upload Queue Progress floating dock */}
      {isUploadProgressOpen && queue.length > 0 && (
        <UploadProgress
          queue={queue}
          onCancel={cancelUpload}
          onRetry={retryUpload}
          onClose={() => setIsUploadProgressOpen(false)}
        />
      )}

      {/* Share Modal */}
      <ShareVideoModal
        isOpen={!!shareItem}
        onClose={closeShare}
        item={shareItem}
        shareLink={shareLink}
        loading={shareLoading}
        copied={shareCopied}
        error={shareError}
        onCopy={copyToClipboard}
      />

      {/* Move Folder Tree Dialog */}
      <FolderTree
        isOpen={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        folders={folders}
        movingItem={activeItem}
        onMove={handleMoveConfirm}
      />

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm border border-brand-sand/55 flex flex-col text-left">
            <div className="px-6 py-4 border-b border-brand-sand bg-brand-cream font-serif font-bold text-sm text-brand-charcoal flex items-center justify-between">
              <span>Create New Folder</span>
              <button onClick={() => setIsCreateFolderOpen(false)} className="text-gray-400 hover:text-brand-charcoal cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderNameInput}
                onChange={(e) => setNewFolderNameInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-cream border border-brand-sand rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderConfirm()}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-brand-cream border-t border-brand-sand/65 flex items-center justify-end space-x-2">
              <button onClick={() => setIsCreateFolderOpen(false)} className="px-4 py-2 border border-brand-sand rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand/30 cursor-pointer">Cancel</button>
              <button onClick={handleCreateFolderConfirm} className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-xs font-semibold cursor-pointer">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm border border-brand-sand/55 flex flex-col text-left">
            <div className="px-6 py-4 border-b border-brand-sand bg-brand-cream font-serif font-bold text-sm text-brand-charcoal flex items-center justify-between">
              <span>Rename Item</span>
              <button onClick={() => setIsRenameOpen(false)} className="text-gray-400 hover:text-brand-charcoal cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-cream border border-brand-sand rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal"
                onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-brand-cream border-t border-brand-sand/65 flex items-center justify-end space-x-2">
              <button onClick={() => setIsRenameOpen(false)} className="px-4 py-2 border border-brand-sand rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand/30 cursor-pointer">Cancel</button>
              <button onClick={handleRenameConfirm} className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-xs font-semibold cursor-pointer">Rename</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
