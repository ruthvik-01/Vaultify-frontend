import React from 'react';
import { X, Video, FileText, Image as ImageIcon, Eye, Download, HardDrive } from 'lucide-react';

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function VideoPlayer({ video, playbackUrl, onClose }) {
  if (!video || !playbackUrl) return null;

  const ext = (video.name || '').split('.').pop().toLowerCase();
  const isVideo = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'wmv'].includes(ext) || (video.mimeType && video.mimeType.startsWith('video/'));
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || (video.mimeType && video.mimeType.startsWith('image/'));
  const isPdf = ext === 'pdf' || (video.mimeType && video.mimeType === 'application/pdf');
  const isText = ['txt', 'log', 'json', 'js', 'html', 'css'].includes(ext) || (video.mimeType && video.mimeType.startsWith('text/'));

  const handleDownload = () => {
    window.open(playbackUrl, '_blank');
  };

  const renderPreview = () => {
    if (isVideo) {
      return (
        <video
          src={playbackUrl}
          controls
          autoPlay
          className="w-full h-full max-h-[70vh] object-contain focus:outline-none"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-full max-h-[70vh] flex items-center justify-center p-4">
          <img
            src={playbackUrl}
            alt={video.name}
            className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg border border-brand-sand/50"
          />
        </div>
      );
    }

    if (isPdf || isText) {
      return (
        <iframe
          src={playbackUrl}
          className="w-full h-[70vh] border-0 rounded-b-2xl"
          title={video.name}
        />
      );
    }

    // Fallback for doc/docx/ppt/xls etc.
    return (
      <div className="w-full min-h-[40vh] flex flex-col items-center justify-center p-8 bg-brand-cream/30 text-center">
        <div className="bg-brand-cream-dark p-6 rounded-full mb-4 shadow-inner text-brand-olive border border-brand-sand">
          <FileText className="w-14 h-14 stroke-[1.1]" />
        </div>
        <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-2">
          {video.name}
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
          This file format ({ext.toUpperCase()}) cannot be previewed directly in the web browser. Please download it to view on your device.
        </p>
        <div className="flex items-center space-x-3 text-xs bg-white border border-brand-sand rounded-xl px-4 py-2.5 shadow-sm text-gray-600 mb-6 font-medium">
          <HardDrive className="w-4 h-4 text-brand-olive" />
          <span>Size: {formatSize(video.size)}</span>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-6 py-3 bg-brand-olive hover:bg-brand-olive-dark text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-brand-olive/10"
        >
          <Download className="w-4 h-4" />
          <span>Download to View</span>
        </button>
      </div>
    );
  };

  const getHeaderIcon = () => {
    if (isVideo) return <Video className="w-5 h-5 text-brand-olive shrink-0 animate-pulse" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-brand-olive shrink-0" />;
    return <Eye className="w-5 h-5 text-brand-olive shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl border border-brand-sand/55 flex flex-col max-h-[90vh]">
        {/* Player Header */}
        <div className="px-6 py-4 border-b border-brand-sand flex items-center justify-between bg-brand-cream select-none">
          <div className="flex items-center space-x-2.5 min-w-0 text-left">
            {getHeaderIcon()}
            <h2 className="font-serif font-bold text-sm text-brand-charcoal truncate">
              {video.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-sand/60 text-gray-500 hover:text-brand-charcoal transition-colors cursor-pointer focus:outline-none"
            aria-label="Close player"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Screen/Preview Content */}
        <div className="flex-grow bg-white relative flex items-center justify-center overflow-hidden">
          {renderPreview()}
        </div>

        {/* Footer Branding */}
        <div className="px-6 py-3 bg-brand-cream border-t border-brand-sand text-[10px] text-gray-400 font-semibold tracking-wider uppercase select-none text-right">
          Vaultify Player • Secure Stream
        </div>
      </div>
    </div>
  );
}
