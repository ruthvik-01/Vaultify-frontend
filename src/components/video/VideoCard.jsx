import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, MoreVertical, Edit2, Move, Download, Share2, Trash2, Video, Clock, HardDrive, Calendar, User, Folder 
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

export default function VideoCard({
  video,
  folders,
  onPlay,
  onRename,
  onMove,
  onDownload,
  onShare,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const videoFolder = folders.find((f) => f.id === video.videoFolderId);
  const folderName = videoFolder ? videoFolder.name : 'Root';

  return (
    <div className="bg-white border border-brand-sand/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-sage/60 transition-all duration-200 text-left relative flex flex-col h-full">
      {/* Thumbnail Placeholder */}
      <div 
        onClick={() => onPlay(video)}
        className="w-full aspect-video bg-brand-cream-dark border-b border-brand-sand/50 flex flex-col items-center justify-center relative cursor-pointer group"
      >
        <div className="absolute inset-0 bg-brand-charcoal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-white/90 text-brand-olive p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-6 h-6 fill-brand-olive" />
          </div>
        </div>
        
        {/* Decorative video screen background */}
        <Video className="w-12 h-12 text-brand-sage/40 stroke-[1.5]" />
        
        {/* Video length tag overlay */}
        <span className="absolute bottom-2.5 right-2.5 bg-brand-charcoal/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 shadow-sm">
          <Clock className="w-2.5 h-2.5" />
          <span>03:14</span>
        </span>

        {/* Video Type Badge */}
        <span className="absolute top-2.5 left-2.5 bg-brand-cream/90 border border-brand-sand/80 text-brand-olive-dark font-sans text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          {video.type || 'mp4'}
        </span>
      </div>

      {/* Info & Content details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-serif font-bold text-xs text-brand-charcoal line-clamp-1 flex-grow pr-2">
              {video.name}
            </h3>

            {/* Actions Dropdown */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg hover:bg-brand-cream text-gray-400 hover:text-brand-charcoal transition-colors cursor-pointer"
                aria-label="Video actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-sand rounded-xl shadow-lg z-20 py-1.5 text-xs text-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onPlay(video);
                    }}
                    className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />
                    <span>View / Play</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRename(video);
                    }}
                    className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onMove(video);
                    }}
                    className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5 text-gray-400" />
                    <span>Move</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDownload(video);
                    }}
                    className="w-full px-4 py-2 hover:bg-brand-cream text-gray-700 flex items-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onShare(video);
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
                      setMenuOpen(false);
                      onDelete(video.id);
                    }}
                    className="w-full px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details Metadata grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-gray-500 font-medium font-sans">
            <div className="flex items-center space-x-1 truncate">
              <HardDrive className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{formatSize(video.size)}</span>
            </div>
            <div className="flex items-center space-x-1 truncate">
              <Folder className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{folderName}</span>
            </div>
            <div className="flex items-center space-x-1 truncate">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{formatDate(video.dateAdded)}</span>
            </div>
            <div className="flex items-center space-x-1 truncate">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{video.owner?.name || 'Me'}</span>
            </div>
          </div>
        </div>

        {/* Video Uploading Status footer */}
        {video.status === 'Uploading' && (
          <div className="mt-3 pt-2.5 border-t border-brand-sand/60 flex items-center justify-between text-[9px] font-bold tracking-wider text-brand-olive uppercase animate-pulse">
            <span>Uploading...</span>
            <div className="w-1.5 h-1.5 bg-brand-olive rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
