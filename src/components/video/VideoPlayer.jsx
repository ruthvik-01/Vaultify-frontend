import React from 'react';
import { X, Video } from 'lucide-react';

export default function VideoPlayer({ video, playbackUrl, onClose }) {
  if (!video || !playbackUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl border border-brand-sand/55 flex flex-col max-h-[90vh]">
        {/* Player Header */}
        <div className="px-6 py-4 border-b border-brand-sand flex items-center justify-between bg-brand-cream select-none">
          <div className="flex items-center space-x-2.5 min-w-0 text-left">
            <Video className="w-5 h-5 text-brand-olive shrink-0 animate-pulse" />
            <h2 className="font-serif font-bold text-sm text-brand-charcoal truncate">
              {video.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-sand/60 text-gray-500 hover:text-brand-charcoal transition-colors cursor-pointer focus:outline-none"
            aria-label="Close video player"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* HTML5 Video Screen */}
        <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
          <video
            src={playbackUrl}
            controls
            autoPlay
            className="w-full h-full max-h-[70vh] object-contain focus:outline-none"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer Branding */}
        <div className="px-6 py-3 bg-brand-cream border-t border-brand-sand text-[10px] text-gray-400 font-semibold tracking-wider uppercase select-none text-right">
          Vaultify Player • Secure Stream
        </div>
      </div>
    </div>
  );
}
