import React, { useMemo, useState } from 'react';
import { useFiles } from '../context/FileContext';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { 
  Sparkles, Upload, FileText, ArrowRight,
  Plus, Calendar, HardDrive, Share2
} from 'lucide-react';

export default function Dashboard() {
  const { files, activities, user, uploadFile, storageStats, showNotification } = useFiles();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  // Get active files
  const activeFiles = useMemo(() => files.filter(f => !f.inTrash), [files]);

  // Get top 6 recent files
  const recentFiles = useMemo(() =>
    [...activeFiles]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 6),
    [activeFiles]
  );

  // Calculate stats
  const totalFiles = activeFiles.length;
  
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
  const recentUploadsCount = activeFiles.filter(f => new Date(f.dateAdded) >= sevenDaysAgo).length;

  // Drag and drop handlers for Quick Upload widget
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      
      // Upload using default category based on extension
      let cat = 'Notes';
      if (['pdf'].includes(ext)) {
        cat = 'Resumes';
      } else if (['zip', 'rar'].includes(ext)) {
        cat = 'Projects';
      }

      uploadFile({
        file: file,
        name: file.name,
        category: cat,
        type: ext,
        size: file.size,
        tags: ['Quick Upload']
      }).then(() => {
        showNotification(`Successfully uploaded "${file.name}" to ${cat} category!`, 'success');
      }).catch((err) => {
        showNotification('Upload failed: ' + (err?.message || 'Unknown error'), 'error');
      });
    }
  };

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
            onClick={() => navigate('/my-files')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>Open My Files</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Files Card */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="bg-brand-sage-light/30 p-2.5 rounded-2xl text-brand-olive">
              <FileText className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-brand-cream-dark px-2 py-0.5 rounded-full">
              Files
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-serif font-bold text-brand-charcoal leading-none">
              {totalFiles}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1.5">Total Vault Items</p>
            <p className="text-[10px] text-gray-400 mt-2">
              Academic &amp; personal documents
            </p>
          </div>
          <button 
            onClick={() => navigate('/my-files')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>View All Files →</span>
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
            onClick={() => navigate('/work')}
            className="text-[10px] font-bold text-brand-olive mt-4 hover:underline flex items-center space-x-0.5 text-left border-t border-brand-sand/50 pt-3 cursor-pointer w-full"
          >
            <span>Open Work Folder →</span>
          </button>
        </div>
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
            No recent activity.
          </div>
        )}
      </div>

    </div>
  );
}
