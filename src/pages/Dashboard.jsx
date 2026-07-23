import React, { useMemo, useState } from 'react';
import { useFiles } from '../context/FileContext';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { 
  Sparkles, Upload, FileText, ArrowRight,
  Plus, Calendar, HardDrive, Share2, Trash2,
  RefreshCcw, Download, Edit3, FolderPlus, Folder,
  LogIn, LogOut, Settings, User, Clock
} from 'lucide-react';

function formatActivityTime(timestamp) {
  if (!timestamp) return 'Just Now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Just Now';
  const now = new Date();
  const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsPast < 60) return 'Just Now';
  if (secondsPast < 3600) {
    const mins = Math.floor(secondsPast / 60);
    return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
  }
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today ${timeStr}`;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
}

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

  const getActivityMeta = (action, category) => {
    const act = (action || '').toUpperCase();
    const cat = (category || '').toUpperCase();

    if (act.includes('LOGIN') || act.includes('LOGOUT') || cat === 'LOGIN' || cat === 'AUTH') {
      const isOut = act.includes('LOGOUT');
      return { 
        text: isOut ? 'Logged Out' : 'Logged In', 
        Icon: isOut ? LogOut : LogIn, 
        color: 'text-sky-700 bg-sky-100 border-sky-300',
        badge: isOut ? 'Logout' : 'Login',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
      };
    }
    if (act.includes('UPLOAD') || cat === 'UPLOAD') {
      return { 
        text: 'Uploaded', 
        Icon: Upload, 
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
        badge: 'Upload',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (act.includes('DELETE') || act.includes('TRASH') || act.includes('PURGE') || cat === 'DELETE') {
      return { 
        text: 'Deleted', 
        Icon: Trash2, 
        color: 'text-rose-700 bg-rose-100 border-rose-300',
        badge: 'Delete',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }
    if (act.includes('RESTORE')) {
      return { 
        text: 'Restored', 
        Icon: RefreshCcw, 
        color: 'text-teal-700 bg-teal-100 border-teal-300',
        badge: 'Restore',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
      };
    }
    if (act.includes('DOWNLOAD') || cat === 'DOWNLOAD') {
      return { 
        text: 'Downloaded', 
        Icon: Download, 
        color: 'text-blue-700 bg-blue-100 border-blue-300',
        badge: 'Download',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }
    if (act.includes('SHARE') || cat === 'SHARE') {
      return { 
        text: 'Shared', 
        Icon: Share2, 
        color: 'text-purple-700 bg-purple-100 border-purple-300',
        badge: 'Share',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    }
    if (act.includes('RENAME') || cat === 'EDIT') {
      return { 
        text: 'Renamed', 
        Icon: Edit3, 
        color: 'text-amber-700 bg-amber-100 border-amber-300',
        badge: 'Edit',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    if (act.includes('CREATE') || cat === 'FOLDER') {
      return { 
        text: 'Created Folder', 
        Icon: FolderPlus, 
        color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
        badge: 'Folder',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    }
    if (act.includes('SETTING') || cat === 'SETTINGS') {
      return { 
        text: 'Updated Settings', 
        Icon: Settings, 
        color: 'text-slate-700 bg-slate-100 border-slate-300',
        badge: 'Settings',
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200'
      };
    }
    if (act.includes('PROFILE') || cat === 'PROFILE' || act.includes('ORGANIZATION')) {
      const isOrg = act.includes('ORGANIZATION');
      return { 
        text: isOrg ? 'Updated Organization' : 'Updated Profile', 
        Icon: User, 
        color: 'text-violet-700 bg-violet-100 border-violet-300',
        badge: 'Profile',
        badgeColor: 'bg-violet-50 text-violet-700 border-violet-200'
      };
    }
    if (act.includes('PREVIEW') || act.includes('VIEW') || cat === 'PREVIEW') {
      return {
        text: 'Previewed',
        Icon: Clock,
        color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
        badge: 'Preview',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    }
    if (act.includes('STORAGE') || cat === 'STORAGE') {
      return { 
        text: 'Storage Event', 
        Icon: HardDrive, 
        color: 'text-orange-700 bg-orange-100 border-orange-300',
        badge: 'Storage',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200'
      };
    }

    return { 
      text: action || 'Activity', 
      Icon: FileText, 
      color: 'text-brand-olive bg-brand-cream border-brand-sand',
      badge: category || 'General',
      badgeColor: 'bg-brand-cream text-brand-olive border-brand-sand'
    };
  };

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
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-brand-charcoal">Activity Log</h3>
          <span className="text-[10px] font-bold text-brand-olive bg-brand-sage-light/35 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Real-Time Feed
          </span>
        </div>
        
        {activities.length > 0 ? (
          <div className="relative border-l border-brand-sand/60 pl-5 ml-3 space-y-4 py-2">
            {activities.slice(0, 10).map(act => {
              const { text, Icon, color, badge, badgeColor } = getActivityMeta(act.action, act.category);
              const resourceName = act.itemName || act.resourceName || act.fileName || act.name || act.description || 'Item';
              return (
                <div key={act.id || act._id} className="relative flex items-start space-x-3 group">
                  <span className={`absolute -left-[31px] top-0.5 p-1 rounded-full border shadow-sm ${color}`}>
                    <Icon className="w-3 h-3 stroke-[2.2]" />
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold text-brand-olive-dark">{text}</span>
                      <span className="text-xs font-semibold text-brand-charcoal truncate max-w-[200px] sm:max-w-[320px]">{resourceName}</span>
                      {badge && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${badgeColor}`}>
                          {badge}
                        </span>
                      )}
                      {act.folderName && (
                        <span className="text-gray-400 font-normal text-[11px] inline-flex items-center">
                          <Folder className="w-3 h-3 inline mr-0.5 text-gray-300" />
                          {act.folderName}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 font-sans mt-0.5 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-300 inline" />
                      <span>{formatActivityTime(act.timestamp)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 py-6 font-medium">
            No recent activity logged yet.
          </div>
        )}
      </div>

    </div>
  );
}
