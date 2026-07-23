import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { videoService } from '../services/videoService';
import { videoUploadService } from '../services/videoUploadService';
import { useVideoUpload } from '../hooks/useVideoUpload';
import UploadProgress from '../components/video/UploadProgress';
import { Check, X, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const FileContext = createContext(null);

export const categories = [
  'Resumes',
  'Certificates',
  'Projects',
  'Notes',
  'Assignments',
  'Placement Documents',
];

const PromptDialogModal = ({ modal }) => {
  const [value, setValue] = useState(modal.defaultValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      modal.resolve(value.trim());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        modal.resolve(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      <div 
        onClick={() => modal.resolve(null)}
        className="absolute inset-0 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
      />
      <form 
        onSubmit={handleSubmit}
        style={{ animation: 'modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        className="w-full max-w-md bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative z-10 text-left font-sans"
      >
        <h3 className="font-serif text-lg font-bold text-brand-charcoal dark:text-white mb-2 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-olive shrink-0" />
          <span>{modal.title}</span>
        </h3>
        <div className="mb-6 mt-4">
          <input
            type="text"
            required
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={modal.placeholder}
            className="w-full px-3 py-2.5 border border-brand-sand dark:border-white/15 bg-brand-cream/65 dark:bg-brand-charcoal/65 rounded-xl text-xs text-brand-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive transition-all"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => modal.resolve(null)}
            className="px-4.5 py-2 border border-brand-sand dark:border-white/10 hover:bg-brand-cream/50 dark:hover:bg-white/5 text-brand-charcoal dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {modal.cancelText}
          </button>
          <button
            type="submit"
            className="px-4.5 py-2 bg-gradient-to-r from-brand-olive to-emerald-600 hover:brightness-105 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {modal.confirmText}
          </button>
        </div>
      </form>
    </div>
  );
};

export const FileProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('vaultify_token');
  });
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [promptModal, setPromptModal] = useState(null);
  const [toastProgress, setToastProgress] = useState(100);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setToastProgress(100);
  };

  useEffect(() => {
    if (toast) {
      const duration = 4000;
      const intervalTime = 40;
      const step = (intervalTime / duration) * 100;
      
      const timer = setInterval(() => {
        setToastProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setToast(null);
            return 0;
          }
          return prev - step;
        });
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [toast]);

  const showConfirm = (title, message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        resolve: (val) => {
          setConfirmModal(null);
          resolve(val);
        }
      });
    });
  };

  const showPrompt = (title, defaultValue = '', options = {}) => {
    return new Promise((resolve) => {
      setPromptModal({
        title,
        defaultValue,
        placeholder: options.placeholder || 'Type here...',
        confirmText: options.confirmText || 'Save',
        cancelText: options.cancelText || 'Cancel',
        resolve: (val) => {
          setPromptModal(null);
          resolve(val);
        }
      });
    });
  };

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [uploadGroups, setUploadGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isFetchingFiles = useRef(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    studentId: '',
    university: '',
    major: '',
    phone: '',
    bio: '',
    storage_plan: 'free',
    theme_color: 'grid',
    dark_mode: 'light',
    sidebar_color: 'expanded',
    accent_color: 'green',
    font_size: 'medium',
    created_at: '',
  });

  const applySettingsToDOM = (settings) => {
    const root = document.documentElement;
    
    // 1. Theme mode ('light', 'dark', 'system')
    let isDark = false;
    const dm = settings.dark_mode || 'light';
    if (dm === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = dm === 'dark';
    }
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Store active dark mode as boolean helper attribute for global styling reference
    root.setAttribute('data-dark-mode-active', isDark ? 'true' : 'false');
    
    // 2. Accent color (blue, purple, green, orange, red)
    root.setAttribute('data-accent-color', settings.accent_color || 'green');
    
    // 3. Sidebar mode (compact, expanded)
    root.setAttribute('data-sidebar-mode', settings.sidebar_color === 'compact' ? 'compact' : 'expanded');
    
    // 4. Display preference (grid, list) — backend may return 'sage' or other color name as legacy default
    const viewMode = ['grid', 'list'].includes(settings.theme_color) ? settings.theme_color : 'grid';
    root.setAttribute('data-display-view', viewMode);
    
    // 5. Font size (small, medium, large)
    root.setAttribute('data-font-size', settings.font_size || 'medium');
    
    localStorage.setItem('vaultify_settings', JSON.stringify({
      theme_color: viewMode,
      dark_mode: dm,
      sidebar_color: settings.sidebar_color === 'compact' ? 'compact' : 'expanded',
      accent_color: settings.accent_color || 'green',
      font_size: settings.font_size || 'medium'
    }));
  };

  useEffect(() => {
    const cached = localStorage.getItem('vaultify_settings');
    if (cached) {
      try {
        applySettingsToDOM(JSON.parse(cached));
      } catch (_) {}
    } else {
      applySettingsToDOM(user);
    }
    
    // Media query listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const current = localStorage.getItem('vaultify_settings');
      if (current) {
        try {
          const parsed = JSON.parse(current);
          if (parsed.dark_mode === 'system') {
            applySettingsToDOM(parsed);
          }
        } catch (_) {}
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const [notifications, setNotifications] = useState({
    emailOnShare: true,
    emailOnDownload: false,
    placementAlerts: true,
    weeklyReport: true,
  });

  const [storageStats, setStorageStats] = useState({
    totalCapacity: 1000 * 1024 * 1024 * 1024, // 1 TB reference capacity
    used: 0,
    breakdown: {
      Documents: 0,
      Projects: 0,
      Certificates: 0,
      Media: 0,
    },
  });

  // ─── Bootstrap on auth ───────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
      fetchAllFiles();
      fetchAllFolders();
      fetchUploadGroups();
    }
  }, [isAuthenticated]);

  // ─── Storage stats derived from files ────────────────────────────────────
  useEffect(() => {
    let used = 0;
    const breakdown = {
      Documents: 0,
      Projects: 0,
      Certificates: 0,
      Media: 0,
    };

    files
      .filter((f) => !f.inTrash)
      .forEach((f) => {
        const size = f.size || 0;
        used += size;
        
        const ext = (f.name || '').split('.').pop().toLowerCase();
        const isMedia = f.type === 'video' || 
                        ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ||
                        f.mimeType?.startsWith('video/') || 
                        f.mimeType?.startsWith('image/');

        if (f.category === 'Projects') {
          breakdown.Projects += size;
        } else if (f.category === 'Certificates') {
          breakdown.Certificates += size;
        } else if (isMedia) {
          breakdown.Media += size;
        } else {
          // Default everything else to Documents category to ensure the sum equals total used
          breakdown.Documents += size;
        }
      });

    const capacity = 1000 * 1024 * 1024 * 1024; // 1 TB reference capacity

    setStorageStats({
      totalCapacity: capacity,
      used,
      breakdown,
    });
  }, [files]);

  // ─── Profile ──────────────────────────────────────────────────────────────
  const fetchUserProfile = async () => {
    try {
      const res = await api.getProfile();
      // Backend returns: { status, data: { user: { id, name, email, ... } } }
      const userData = res.data?.user || res.data;
      if (userData) {
        const loadedUser = {
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          studentId: userData.studentId || '',
          university: userData.university || '',
          organization: userData.organization || '',
          major: userData.major || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          profile_image: userData.profile_image || null,
          storage_plan: userData.storage_plan || 'free',
          theme_color: ['grid', 'list'].includes(userData.theme_color) ? userData.theme_color : 'grid',
          dark_mode: ['light', 'dark', 'system'].includes(userData.dark_mode) ? userData.dark_mode : 'light',
          sidebar_color: userData.sidebar_color === 'compact' ? 'compact' : 'expanded',
          accent_color: userData.accent_color || 'green',
          font_size: userData.font_size || 'medium',
          avatar:
            userData.profile_image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'SV')}`,
          created_at: userData.created_at || new Date().toISOString()
        };
        setUser(loadedUser);
        applySettingsToDOM(loadedUser);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err.message);
      if (
        err.message.includes('401') ||
        err.message.includes('Unauthorized') ||
        err.message.includes('expired')
      ) {
        logout();
      }
    }
  };

  // ─── File mapping ─────────────────────────────────────────────────────────
  /**
   * Maps backend file object to frontend file shape.
   * Backend returns: { id, file_name, original_name, file_type, file_size,
   *   is_favorite, is_deleted, category, download_count, created_at }
   */
  const mapBackendFile = (file) => ({
    id: file.id,
    user_id: file.user_id,
    folderId: file.folder_id ? file.folder_id.toString() : null,
    name: file.file_name || file.original_name,
    category: file.category || 'Others',
    type: file.file_type ? file.file_type.split('/').pop() : 'unknown',
    size: file.file_size || 0,
    dateAdded: file.created_at,
    isStarred: file.is_favorite === true || file.is_favorite === 1,
    isWorkSubmission: file.is_work_submission === true,
    inTrash: file.is_deleted === true || file.is_deleted === 1,
    sharedWith: [],
    downloadCount: file.download_count || 0,
    tags: file.tags || [],
    s3_key: file.s3_key,
    mimeType: file.file_type || 'application/octet-stream'
  });

  // ─── Files ────────────────────────────────────────────────────────────────
  const fetchAllFiles = async () => {
    // Prevent duplicate concurrent fetches (fixes 429 Too Many Requests)
    if (isFetchingFiles.current) return;
    isFetchingFiles.current = true;
    try {
      const [filesRes, videosList] = await Promise.all([
        api.getFiles(),
        videoService.getVideos().catch((err) => {
          console.error('Failed to fetch videos:', err.message);
          return [];
        })
      ]);

      const filesList = filesRes.data?.files || filesRes.data;
      let allMapped = [];
      if (Array.isArray(filesList)) {
        allMapped = filesList.map(mapBackendFile);
      }

      if (Array.isArray(videosList)) {
        allMapped = [...allMapped, ...videosList];
      }

      // Load local trash from localStorage
      const localTrash = JSON.parse(localStorage.getItem('vaultify_local_trash_files') || '[]');
      const localStarred = JSON.parse(localStorage.getItem('vaultify_local_starred_ids') || '[]');

      const trashIds = localTrash.map(f => f.id);

      // Map backend files, marking them as inTrash if they are in trashIds, and set isStarred if in localStarred
      const filesWithTrashState = allMapped.map(f => {
        const inTrash = trashIds.includes(f.id);
        const isStarred = f.isStarred || localStarred.includes(f.id);
        return { ...f, inTrash, isStarred };
      });

      // Include any localTrash items that are not returned by the backend
      const missingFromBackend = localTrash.filter(f => !allMapped.some(b => b.id === f.id));

      const mergedFiles = [...filesWithTrashState, ...missingFromBackend];
      const localShares = JSON.parse(localStorage.getItem('vaultify_local_shares') || '[]');
      const sharedFileIds = localShares.map(s => s.fileId);
      let updatedShares = false;

      const filesWithShares = mergedFiles.map(f => {
        const isVideo = f.category === 'Media' || f.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(f.name.split('.').pop().toLowerCase());
        if (sharedFileIds.includes(f.id) || (isVideo && f.isShared)) {
          if (isVideo && f.isShared && !sharedFileIds.includes(f.id)) {
            const token = f.shareToken;
            const link = `${window.location.origin}/share/${token}`;
            localShares.push({
              id: f.id + '_' + Date.now(),
              fileId: f.id,
              shareRecordId: token || null,
              name: f.name,
              category: 'Media',
              type: 'video',
              mimeType: f.mimeType || 'video/mp4',
              size: f.size || 0,
              shareLink: link,
              permission: 'read',
              createdAt: f.created_at || new Date().toISOString(),
              status: 'Active'
            });
            updatedShares = true;
          }
          return { ...f, sharedWith: ['recruiter@company.com'] };
        }
        return f;
      });

      if (updatedShares) {
        localStorage.setItem('vaultify_local_shares', JSON.stringify(localShares));
      }

      setFiles(filesWithShares);
    } catch (err) {
      console.error('Failed to fetch files:', err.message);
    } finally {
      isFetchingFiles.current = false;
    }
  };

  const fetchTrashFiles = async () => {
    // Managed locally via localStorage and merged in fetchAllFiles
  };

  const addActivity = (action, fileName, category = 'System') => {
    const newActivity = {
      id: `a_${Date.now()}`,
      action,
      fileName,
      timestamp: new Date().toISOString(),
      category,
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
  };

  const uploadFile = async (fileData, onProgressCallback = null) => {
    try {
      const file = fileData.file;
      const batchId = fileData.uploadBatchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const uploadGroupId = fileData.upload_group_id || null;
      const ext = file.name.split('.').pop().toLowerCase();
      const allowedVideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpeg', '3gp', 'ogv'];
      const isVideo = allowedVideoExtensions.includes(ext) || (file.type && file.type.startsWith('video/'));

      if (isVideo) {
        const task = {
          id: `up_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'queued',
          speed: 0,
          eta: 0,
          folderId: fileData.folderId || null,
          uploadBatchId: batchId
        };

        return new Promise((resolve, reject) => {
          videoUploadService.uploadVideo(task, {
            onProgress: ({ progress, speed, eta }) => {
              if (onProgressCallback) {
                onProgressCallback({ progress, speed, eta });
              }
            },
            onComplete: (videoData) => {
              const name = videoData.filename || videoData.originalName;
              const videoExt = name.split('.').pop().toLowerCase();
              const newVideoFile = {
                id: videoData._id || videoData.id,
                name: name,
                category: 'Media',
                type: videoExt,
                size: videoData.size || 0,
                dateAdded: videoData.createdAt,
                isStarred: false,
                inTrash: videoData.status === 'Failed',
                sharedWith: [],
                downloadCount: 0,
                s3_key: videoData.s3Key,
                mimeType: videoData.mimeType || `video/${videoExt}`,
                videoFolderId: videoData.folderId || null,
                owner: videoData.owner || { name: 'Me' },
                status: videoData.status || 'Active',
              };
              setFiles((prev) => [newVideoFile, ...prev]);
              addActivity('uploaded', newVideoFile.name, 'Media');
              resolve(newVideoFile);
            },
            onError: (err) => {
              reject(err);
            }
          });
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        if (fileData.category) {
          formData.append('category', fileData.category);
        }
        if (fileData.folderId) {
          formData.append('folder_id', fileData.folderId);
        }
        formData.append('uploadBatchId', batchId);
        if (uploadGroupId) {
          formData.append('upload_group_id', uploadGroupId);
        }

        const res = await api.uploadFile(formData);
        const fileData2 = res.data?.file || res.data;
        if (fileData2) {
          const newFile = mapBackendFile(fileData2);
          setFiles((prev) => [newFile, ...prev]);
          addActivity('uploaded', newFile.name, newFile.category);
          return newFile;
        }
      }
    } catch (err) {
      console.error('Upload failed:', err.message);
      throw err;
    }
  };

  // Soft-delete: marks file as trashed in local state (file stays on server)
  const moveToTrash = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      if (!file) return;

      // Add to localTrash in localStorage
      const localTrash = JSON.parse(localStorage.getItem('vaultify_local_trash_files') || '[]');
      const updatedFile = { ...file, inTrash: true };
      if (!localTrash.some(t => t.id === id)) {
        localTrash.push(updatedFile);
        localStorage.setItem('vaultify_local_trash_files', JSON.stringify(localTrash));
      }

      // Update files state immediately
      setFiles(prev => {
        const remaining = prev.filter(f => f.id !== id);
        return [...remaining, updatedFile];
      });

      addActivity('trashed', file.name, file.category);
      showNotification(`"${file.name}" moved to trash`, 'success');
    } catch (err) {
      console.error('Delete failed:', err.message);
      showNotification('Failed to delete file', 'error');
    }
  };

  // Keep the old name as alias for backward compat (some components still call deleteFile)
  const deleteFile = moveToTrash;

  // Restore: moves file back from trash to active state
  const restoreFile = (id) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      // Remove from localTrash
      const localTrash = JSON.parse(localStorage.getItem('vaultify_local_trash_files') || '[]');
      const filteredTrash = localTrash.filter(t => t.id !== id);
      localStorage.setItem('vaultify_local_trash_files', JSON.stringify(filteredTrash));

      // Update files state
      const updatedFile = { ...file, inTrash: false };
      setFiles(prev => {
        const remaining = prev.filter(f => f.id !== id);
        return [...remaining, updatedFile];
      });

      addActivity('restored', file.name, file.category);
      showNotification(`"${file.name}" restored from trash`, 'success');
    }
  };

  // Permanent delete: actually removes file from backend (S3 + DB)
  const permanentlyDeleteFile = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      
      // Try calling backend delete API just in case it wasn't deleted during soft-delete
      try {
        const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
        if (isVideo) {
          await videoService.deleteVideo(id);
        } else {
          await api.deleteFile(id);
        }
      } catch (apiErr) {
        // Silently ignore if already deleted on server
      }

      // Remove from localTrash and localRestored in localStorage
      const localTrash = JSON.parse(localStorage.getItem('vaultify_local_trash_files') || '[]');
      const filteredTrash = localTrash.filter(t => t.id !== id);
      localStorage.setItem('vaultify_local_trash_files', JSON.stringify(filteredTrash));

      const localRestored = JSON.parse(localStorage.getItem('vaultify_local_restored_files') || '[]');
      const filteredRestored = localRestored.filter(t => t.id !== id);
      localStorage.setItem('vaultify_local_restored_files', JSON.stringify(filteredRestored));

      // Remove from files state
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (file) {
        addActivity('purged', file.name, file.category);
        showNotification(`"${file.name}" permanently deleted`, 'success');
      }
    } catch (err) {
      console.error('Permanent delete failed:', err.message);
      showNotification('Failed to permanently delete file', 'error');
    }
  };

  const clearTrash = async () => {
    const trashFiles = files.filter((f) => f.inTrash);
    if (trashFiles.length === 0) return;
    await Promise.all(trashFiles.map((f) => permanentlyDeleteFile(f.id)));
    addActivity('cleared_trash', 'Trash Bin Emptied');
    showNotification('Trash emptied successfully', 'success');
  };

  const moveFile = async (id, folderId) => {
    try {
      const res = await api.moveFile(id, folderId);
      const updatedFile = res.data?.file || res.data;
      if (updatedFile) {
        const mapped = mapBackendFile(updatedFile);
        setFiles(prev => prev.map(f => f.id === id ? mapped : f));
        showNotification('File moved successfully', 'success');
      }
    } catch (err) {
      console.error('Failed to move file:', err.message);
      showNotification('Failed to move file', 'error');
      throw err;
    }
  };

  const toggleStar = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      const nextStarred = !file.isStarred;
      const isVideo = file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase());
      
      if (!isVideo) {
        await api.favoriteFile(id, nextStarred);
      }

      // Persist star status locally in localStorage (crucial for videos and offline fallback)
      const localStarred = JSON.parse(localStorage.getItem('vaultify_local_starred_ids') || '[]');
      let updatedStarred;
      if (nextStarred) {
        updatedStarred = [...localStarred.filter(x => x !== id), id];
      } else {
        updatedStarred = localStarred.filter(x => x !== id);
      }
      localStorage.setItem('vaultify_local_starred_ids', JSON.stringify(updatedStarred));

      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            addActivity(nextStarred ? 'starred' : 'unstarred', f.name, f.category);
            return { ...f, isStarred: nextStarred };
          }
          return f;
        })
      );
    } catch (err) {
      console.error('Toggle favorite failed:', err.message);
    }
  };

  const renameFile = async (id, newName) => {
    try {
      const file = files.find((f) => f.id === id);
      const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
      
      if (isVideo) {
        await videoService.renameVideo(id, newName);
      } else {
        await api.renameFile(id, newName);
      }

      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            return { ...f, name: newName };
          }
          return f;
        })
      );
    } catch (err) {
      console.error('Rename failed:', err.message);
    }
  };

  const downloadFile = async (id, name) => {
    try {
      const file = files.find((f) => f.id === id);
      const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
      let url;
      
      if (isVideo) {
        url = await videoService.downloadVideo(id);
      } else {
        const res = await api.downloadFile(id);
        url = res.download_url || (res.data && res.data.download_url);
      }

      if (url) {
        window.open(url, '_blank');
        addActivity('downloaded', name, isVideo ? 'Media' : 'System');
      }
    } catch (err) {
      console.error('Download failed:', err.message);
    }
  };

  const getPreviewUrl = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
      
      if (isVideo) {
        return await videoService.getPlaybackUrl(id);
      } else {
        const res = await api.getPreviewUrl(id);
        return res.download_url || (res.data && res.data.download_url) || null;
      }
    } catch (err) {
      console.error('Failed to obtain preview link:', err.message);
      return null;
    }
  };

  const shareFile = async (id, permission = 'read', expiryHours = 24, folderId = null) => {
    try {
      let link;
      let shareRecordId = null;

      if (folderId) {
        // Share standard folder on backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/share`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('vaultify_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folder_id: folderId, permission, expiry_hours: expiryHours }),
          }
        );
        if (!res.ok) {
          throw new Error('Failed to generate folder share link.');
        }
        const data = await res.json();
        if (data.data) {
          link = `${window.location.origin}/share/${data.data.token}`;
          shareRecordId = data.data.id;
        }
      } else {
        const file = files.find((f) => f.id === id);
        const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
        
        if (isVideo) {
          const token = localStorage.getItem('vaultify_token');
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_URL}/videos/${id}/share`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!res.ok) {
            throw new Error('Failed to generate permanent share link.');
          }
          const data = await res.json();
          if (data && data.shareUrl) {
            const parts = data.shareUrl.split('/');
            const shareToken = parts[parts.length - 1];
            link = `${window.location.origin}/share/${shareToken}`;
            shareRecordId = shareToken;
          }
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/share`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('vaultify_token')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ file_id: id, permission, expiry_hours: expiryHours }),
            }
          );
          const data = await res.json();
          if (data.data) {
            link = data.data.share_link;
            shareRecordId = data.data.id;
          }
        }
      }

      if (link) {
        if (!folderId) {
          const file = files.find((f) => f.id === id);
          const isVideo = file && (file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase()));
          // Save share locally to vaultify_local_shares in localStorage
          const shares = JSON.parse(localStorage.getItem('vaultify_local_shares') || '[]');
          const existingIdx = shares.findIndex(s => s.fileId === id);
          const shareRecord = {
            id: id + '_' + Date.now(),
            fileId: id,
            shareRecordId: shareRecordId || null,
            name: file.name,
            category: file.category || (isVideo ? 'Media' : 'Notes'),
            type: file.type,
            mimeType: file.mimeType,
            size: file.size,
            shareLink: link,
            permission: permission,
            createdAt: new Date().toISOString(),
            status: 'Active'
          };
          if (existingIdx >= 0) {
            shares[existingIdx] = shareRecord;
          } else {
            shares.push(shareRecord);
          }
          localStorage.setItem('vaultify_local_shares', JSON.stringify(shares));

          // Update files array locally to reflect shared status
          setFiles(prev => prev.map(f => f.id === id ? { ...f, sharedWith: [...(f.sharedWith || []), 'recruiter@company.com'] } : f));
          addActivity('shared', file.name, file.category);
        } else {
          // Folder shared
          const folder = folders.find(f => f.id === folderId);
          addActivity('shared', folder ? folder.folder_name : 'Folder', 'Folder');
        }
        return link;
      }
    } catch (err) {
      console.error('Share failed:', err.message);
    }
  };

  const removeShare = async (fileId, email = '') => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      const isVideo = file.category === 'Media' || file.mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase());

      const shares = JSON.parse(localStorage.getItem('vaultify_local_shares') || '[]');
      const record = shares.find(s => s.fileId === fileId);

      if (isVideo) {
        const token = localStorage.getItem('vaultify_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_URL}/videos/${fileId}/unshare`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      } else if (record && record.shareRecordId) {
        // Call backend DELETE /api/share/:id
        const token = localStorage.getItem('vaultify_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_URL}/share/${record.shareRecordId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }

      // Remove from vaultify_local_shares
      const filtered = shares.filter(s => s.fileId !== fileId);
      localStorage.setItem('vaultify_local_shares', JSON.stringify(filtered));

      // Update files state
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, sharedWith: [] } : f));
      addActivity('unshared', file.name, file.category);
      showNotification('Sharing revoked successfully', 'success');
    } catch (err) {
      console.error('Revoke share failed:', err.message);
    }
  };

  const fetchAllFolders = async () => {
    try {
      const res = await api.getFolders();
      const foldersList = res.data?.folders || res.data;
      if (foldersList) {
        const mappedFolders = (Array.isArray(foldersList) ? foldersList : []).map(f => ({
          ...f,
          name: f.name || f.folder_name,
          parentId: f.parentId || f.parent_folder_id
        }));
        setFolders(mappedFolders);
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err.message);
    }
  };

  const getOrCreateWorkFolder = async () => {
    try {
      const res = await api.getOrCreateWorkFolder();
      await fetchAllFolders();
      const folder = res.data?.folder || res.data;
      if (folder) {
        folder.name = folder.name || folder.folder_name;
        folder.parentId = folder.parentId || folder.parent_folder_id;
      }
      return folder;
    } catch (err) {
      console.error('Failed to get or create Work folder:', err.message);
      throw err;
    }
  };

  const createFolder = async (name, parentId = null) => {
    try {
      const res = await api.createFolder(name, parentId);
      await fetchAllFolders();
      showNotification(`Folder "${name}" created successfully`, 'success');
      const folder = res.data?.folder || res.data;
      if (folder) {
        folder.name = folder.name || folder.folder_name;
        folder.parentId = folder.parentId || folder.parent_folder_id;
      }
      return folder;
    } catch (err) {
      console.error('Failed to create folder:', err.message);
      showNotification('Failed to create folder', 'error');
      throw err;
    }
  };

  const resolveFolderIdForPath = async (relativePath, rootFolderId, folderCache = {}, uploadGroupId = null) => {
    if (!relativePath) return rootFolderId;
    const parts = relativePath.split('/').slice(0, -1);
    if (parts.length === 0) return rootFolderId;

    let parentId = rootFolderId;
    let pathAccum = '';

    for (const part of parts) {
      pathAccum = pathAccum ? `${pathAccum}/${part}` : part;
      if (folderCache[pathAccum]) {
        parentId = folderCache[pathAccum];
      } else {
        // Check stale state only for folders that preexisted (not created this batch)
        let existing = folders.find(
          (f) => (f.name || f.folder_name) === part && (f.parentId || f.parent_folder_id || null) === (parentId || null)
        );

        // Also check if we created this folder in a previous upload (not current batch)
        // by looking at cache with root-relative path key including rootFolderId
        const cacheKey = `${rootFolderId}::${pathAccum}`;
        if (!existing && folderCache[cacheKey]) {
          parentId = folderCache[cacheKey];
          folderCache[pathAccum] = parentId;
          continue;
        }

        if (existing) {
          parentId = existing.id || existing._id;
        } else {
          const res = await api.createFolder(part, parentId, null, uploadGroupId);
          const f = res.data?.folder || res.data;
          const newFolderObj = {
            id: f._id || f.id,
            name: f.folder_name || f.name,
            parentId: f.parent_folder_id || f.parentId,
            folder_name: f.folder_name || f.name,
            parent_folder_id: f.parent_folder_id || f.parentId
          };
          setFolders((prev) => [...prev, newFolderObj]);
          parentId = newFolderObj.id;
        }
        folderCache[pathAccum] = parentId;
        folderCache[cacheKey] = parentId;
      }
    }
    return parentId;
  };

  const renameFolder = async (id, newName) => {
    try {
      await api.renameFolder(id, newName);
      await fetchAllFolders();
      showNotification('Folder renamed successfully', 'success');
    } catch (err) {
      console.error('Failed to rename folder:', err.message);
      showNotification('Failed to rename folder', 'error');
      throw err;
    }
  };

  const deleteFolder = async (id) => {
    try {
      await api.deleteFolder(id);
      await fetchAllFolders();
      await fetchAllFiles();
      showNotification('Folder and all its contents deleted', 'success');
    } catch (err) {
      console.error('Failed to delete folder:', err.message);
      showNotification('Failed to delete folder', 'error');
      throw err;
    }
  };

  // ─── Upload Groups ────────────────────────────────────────────────────────
  const fetchUploadGroups = async () => {
    try {
      const res = await api.getUploadGroups();
      const groups = res.data?.groups || res.data;
      if (Array.isArray(groups)) {
        setUploadGroups(groups);
      }
    } catch (err) {
      console.error('Failed to fetch upload groups:', err.message);
    }
  };

  const createUploadGroup = async (title) => {
    try {
      const res = await api.createUploadGroup(title);
      const group = res.data?.group || res.data;
      if (group) {
        setUploadGroups(prev => [group, ...prev]);
        return group;
      }
    } catch (err) {
      console.error('Failed to create upload group:', err.message);
      showNotification('Failed to create upload group', 'error');
      throw err;
    }
  };

  const renameUploadGroup = async (id, newTitle) => {
    try {
      await api.renameUploadGroup(id, newTitle);
      setUploadGroups(prev => prev.map(g => g.id === id ? { ...g, title: newTitle } : g));
      showNotification('Upload title renamed successfully', 'success');
    } catch (err) {
      console.error('Failed to rename upload group:', err.message);
      showNotification('Failed to rename upload title', 'error');
      throw err;
    }
  };

  const deleteUploadGroup = async (id) => {
    try {
      await api.deleteUploadGroup(id);
      setUploadGroups(prev => prev.filter(g => g.id !== id));
      await fetchAllFiles();
      showNotification('Upload group deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete upload group:', err.message);
      showNotification('Failed to delete upload group', 'error');
      throw err;
    }
  };

  const shareUploadGroup = async (id, permission = 'read', expiryHours = 24) => {
    try {
      const res = await api.shareUploadGroup(id, permission, expiryHours);
      const data = res.data;
      if (data && data.token) {
        const link = `${window.location.origin}/share/${data.token}`;
        showNotification('Share link generated!', 'success');
        return link;
      }
    } catch (err) {
      console.error('Failed to share upload group:', err.message);
      showNotification('Failed to share upload group', 'error');
      throw err;
    }
  };

  // ─── Global Video Upload Queue ─────────────────────────────────────────────
  const [isUploadProgressOpen, setIsUploadProgressOpen] = useState(true);

  const handleUploadComplete = async (fileData, folderId, type) => {
    const isVideo = type === 'video' || (fileData && (fileData.mimeType?.startsWith('video/') || fileData.file_type?.startsWith('video/')));
    if (folderId && isVideo) {
      try {
        await videoService.moveVideo(fileData.id || fileData._id, folderId);
      } catch (err) {
        console.warn('Failed to move video to folder on completion:', err);
      }
    }
    await fetchAllFiles();
    await fetchAllFolders();
  };

  const {
    queue: uploadQueue,
    addFilesToQueue: addFilesToUploadQueue,
    cancelUpload: cancelVideoUpload,
    retryUpload: retryVideoUpload,
  } = useVideoUpload(handleUploadComplete);

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.token) {
        localStorage.setItem('vaultify_token', res.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Login failed.' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: err.message || 'Invalid credentials.' };
    }
  };

  const googleLogin = async (firebaseIdToken) => {
    try {
      const res = await api.googleLogin(firebaseIdToken);
      if (res.token) {
        localStorage.setItem('vaultify_token', res.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Google login failed.' };
    } catch (err) {
      console.error('Google login error:', err.message);
      return { success: false, message: err.message || 'Google Login failed.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.token) {
        localStorage.setItem('vaultify_token', res.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: true };
    } catch (err) {
      console.error('Register error:', err.message);
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    setIsAuthenticated(false);
    localStorage.removeItem('vaultify_token');
    setFiles([]);
    setFolders([]);
    setActivities([]);
    setUser({ name: '', email: '', studentId: '', university: '', major: '', storage_plan: 'free', theme_color: 'grid', dark_mode: 'light', sidebar_color: 'expanded', accent_color: 'green', font_size: 'medium', created_at: '' });
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        setUser((prev) => {
          const nextUser = { 
            ...prev, 
            ...updatedUser,
            avatar: updatedUser.profile_image || prev.avatar,
            theme_color: ['grid', 'list'].includes(updatedUser.theme_color) ? updatedUser.theme_color : prev.theme_color,
            dark_mode: ['light', 'dark', 'system'].includes(updatedUser.dark_mode) ? updatedUser.dark_mode : prev.dark_mode,
            created_at: updatedUser.created_at || prev.created_at
          };
          applySettingsToDOM(nextUser);
          return nextUser;
        });
      }
    } catch (err) {
      console.error('Update profile failed:', err.message);
      throw err;
    }
  };

  const updateNotifications = (settingsData) => {
    setNotifications((prev) => ({ ...prev, ...settingsData }));
  };

  return (
    <FileContext.Provider
      value={{
        files,
        folders,
        uploadGroups,
        activities,
        user,
        notifications,
        storageStats,
        searchQuery,
        setSearchQuery,
        uploadFile,
        deleteFile,
        restoreFile,
        permanentlyDeleteFile,
        clearTrash,
        shareFile,
        removeShare,
        toggleStar,
        renameFile,
        downloadFile,
        getPreviewUrl,
        updateProfile,
        updateNotifications,
        isAuthenticated,
        login,
        googleLogin,
        register,
        logout,
         fetchAllFiles,
        fetchAllFolders,
        fetchTrashFiles,
        fetchUserProfile,
        fetchUploadGroups,
        showNotification,
        createFolder,
        getOrCreateWorkFolder,
        renameFolder,
        deleteFolder,
        createUploadGroup,
        renameUploadGroup,
        deleteUploadGroup,
        shareUploadGroup,
        uploadQueue,
        addFilesToUploadQueue,
        cancelVideoUpload,
        retryVideoUpload,
        isUploadProgressOpen,
        setIsUploadProgressOpen,
        moveFile,
        resolveFolderIdForPath,
        showConfirm,
        showPrompt,
      }}
    >
      {children}

      {/* Self-contained Premium Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(120%) translateY(0);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        @keyframes modal-scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Floating Premium Glassmorphic Toast Notification */}
      {toast && (
        <div 
          style={{ animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          className="fixed bottom-6 right-6 z-[9999] flex flex-col pointer-events-auto max-w-sm w-full bg-white/75 dark:bg-brand-charcoal/80 border border-white/40 dark:border-white/10 backdrop-blur-lg shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden font-sans"
        >
          <div className="flex p-4 items-start space-x-3.5">
            {/* Colored side indicator */}
            <div className={`w-1.5 h-10 rounded-full shrink-0 ${
              toast.type === 'error' ? 'bg-rose-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-brand-olive'
            }`} />
            
            <div className="flex-1 min-w-0 text-left">
              <span className="text-xs font-bold text-brand-charcoal dark:text-white capitalize block mb-0.5">
                {toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Warning' : 'Success'}
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-300 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
            
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-brand-charcoal dark:hover:text-white p-1 rounded-full hover:bg-brand-cream/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Progress Bar indicator */}
          <div className="w-full bg-gray-200/40 dark:bg-gray-700/30 h-1">
            <div 
              style={{ width: `${toastProgress}%` }}
              className={`h-full transition-all duration-75 ${
                toast.type === 'error' ? 'bg-rose-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-brand-olive'
              }`}
            />
          </div>
        </div>
      )}

      {/* Reusable Premium Glassmorphic Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
          <div 
            onClick={() => confirmModal.resolve(false)}
            className="absolute inset-0 bg-brand-charcoal/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
          />
          <div 
            style={{ animation: 'modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
            className="w-full max-w-md bg-white/80 dark:bg-brand-charcoal/90 border border-white/40 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative z-10 text-left font-sans"
          >
            <h3 className="font-serif text-lg font-bold text-brand-charcoal dark:text-white mb-2 flex items-center space-x-2">
              {confirmModal.type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              ) : confirmModal.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-brand-olive shrink-0" />
              )}
              <span>{confirmModal.title}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed mb-6 mt-3">
              {confirmModal.message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => confirmModal.resolve(false)}
                className="px-4.5 py-2 border border-brand-sand dark:border-white/10 hover:bg-brand-cream/50 dark:hover:bg-white/5 text-brand-charcoal dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={() => confirmModal.resolve(true)}
                className={`px-4.5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:brightness-105 ${
                  confirmModal.type === 'danger'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : confirmModal.type === 'warning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                    : 'bg-gradient-to-r from-brand-olive to-emerald-600'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Premium Glassmorphic Prompt Modal */}
      {promptModal && (
        <PromptDialogModal modal={promptModal} />
      )}

      {/* Global Upload Queue Progress Dock */}
      {uploadQueue && uploadQueue.length > 0 && isUploadProgressOpen && (
        <UploadProgress
          queue={uploadQueue}
          onCancel={cancelVideoUpload}
          onRetry={retryVideoUpload}
          onClose={() => setIsUploadProgressOpen(false)}
        />
      )}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
