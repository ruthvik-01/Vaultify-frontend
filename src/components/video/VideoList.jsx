import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Video, Play, MoreVertical, Edit2, Move, Download, Share2, Trash2 
} from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Row menu component to isolate click-outside listening
function ActionsDropdown({ item, type, onPlay, onRename, onMove, onDownload, onShare, onDelete }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function clickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-lg hover:bg-brand-cream text-gray-400 hover:text-brand-charcoal transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-sand rounded-xl shadow-lg z-20 py-1.5 text-xs text-left">
          {type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onPlay(item);
              }}
              className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />
              <span>View / Play</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onRename(item);
            }}
            className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Rename</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onMove(item);
            }}
            className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
          >
            <Move className="w-3.5 h-3.5 text-gray-400" />
            <span>Move</span>
          </button>
          {type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDownload(item);
              }}
              className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Download</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onShare(item);
            }}
            className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Share</span>
          </button>
          <hr className="border-brand-sand/60 my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(item.id);
            }}
            className="w-full px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function VideoList({
  folders,
  videos,
  onFolderEnter,
  onFolderRename,
  onFolderMove,
  onFolderShare,
  onFolderDelete,
  onVideoPlay,
  onVideoRename,
  onVideoMove,
  onVideoDownload,
  onVideoShare,
  onVideoDelete,
}) {
  const hasFolders = folders.length > 0;
  const hasVideos = videos.length > 0;

  if (!hasFolders && !hasVideos) {
    return (
      <div className="bg-white border border-brand-sand rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-brand-cream-dark text-brand-olive p-4 rounded-full mb-4 shadow-inner">
          <Video className="w-10 h-10 stroke-[1.2]" />
        </div>
        <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-1">
          No items found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Get started by creating a folder or uploading your first video to this section.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-brand-cream border-b border-brand-sand text-gray-500 font-bold font-sans tracking-wide uppercase">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4">Folder</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sand/50 font-sans">
            {/* Folders */}
            {folders.map((folder) => (
              <tr 
                key={folder.id}
                onDoubleClick={() => onFolderEnter(folder.id)}
                className="hover:bg-brand-cream-dark/55 transition-colors cursor-pointer select-none group"
              >
                <td className="px-6 py-4 font-serif font-bold text-brand-charcoal flex items-center space-x-3 truncate">
                  <Folder className="w-4 h-4 text-brand-olive fill-brand-olive/10 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-400">Folder</td>
                <td className="px-6 py-4 text-gray-400">--</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(folder.created_at)}</td>
                <td className="px-6 py-4 text-gray-400">--</td>
                <td className="px-6 py-4 text-gray-500">Me</td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionsDropdown
                    item={folder}
                    type="folder"
                    onRename={onFolderRename}
                    onMove={onFolderMove}
                    onShare={onFolderShare}
                    onDelete={onFolderDelete}
                  />
                </td>
              </tr>
            ))}

            {/* Videos */}
            {videos.map((video) => {
              const videoFolder = folders.find((f) => f.id === video.videoFolderId);
              const folderName = videoFolder ? videoFolder.name : 'Root';

              return (
                <tr 
                  key={video.id}
                  onDoubleClick={() => onVideoPlay(video)}
                  className="hover:bg-brand-cream-dark/55 transition-colors cursor-pointer select-none group"
                >
                  <td className="px-6 py-4 font-serif font-bold text-brand-charcoal flex items-center space-x-3 truncate">
                    <Video className="w-4 h-4 text-brand-sage shrink-0" />
                    <span className="truncate">{video.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 uppercase">{video.type}</td>
                  <td className="px-6 py-4 text-gray-500">{formatSize(video.size)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(video.dateAdded)}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-[120px]">{folderName}</td>
                  <td className="px-6 py-4 text-gray-500">{video.owner?.name || 'Me'}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionsDropdown
                      item={video}
                      type="video"
                      onPlay={onVideoPlay}
                      onRename={onVideoRename}
                      onMove={onVideoMove}
                      onDownload={onVideoDownload}
                      onShare={onVideoShare}
                      onDelete={onVideoDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
