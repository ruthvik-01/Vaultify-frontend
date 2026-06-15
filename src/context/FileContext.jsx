import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const FileContext = createContext(null);

export const categories = [
  'Resumes',
  'Certificates',
  'Projects',
  'Notes',
  'Assignments',
  'Placement Documents',
];

export const FileProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('studentvault_token');
  });
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: '',
    email: '',
    studentId: '',
    university: '',
    major: '',
    phone: '',
    bio: '',
  });

  const [notifications, setNotifications] = useState({
    emailOnShare: true,
    emailOnDownload: false,
    placementAlerts: true,
    weeklyReport: true,
  });

  const [storageStats, setStorageStats] = useState({
    totalCapacity: 10 * 1024 * 1024 * 1024, // 10 GB
    used: 0,
    breakdown: {
      Documents: 0,
      Projects: 0,
      Certificates: 0,
      Media: 0,
      Others: 0,
    },
  });

  // ─── Bootstrap on auth ───────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
      fetchAllFiles();
      fetchAllFolders();
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
      Others: 0,
    };

    files
      .filter((f) => !f.inTrash)
      .forEach((f) => {
        used += f.size || 0;
        if (f.category === 'Projects') breakdown.Projects += f.size || 0;
        else if (f.category === 'Certificates') breakdown.Certificates += f.size || 0;
        else if (
          f.type === 'video' ||
          f.type === 'png' ||
          f.type === 'jpg' ||
          f.type === 'jpeg'
        )
          breakdown.Media += f.size || 0;
        else if (
          ['Resumes', 'Notes', 'Assignments', 'Placement Documents'].includes(f.category)
        )
          breakdown.Documents += f.size || 0;
        else breakdown.Others += f.size || 0;
      });

    setStorageStats({
      totalCapacity: 10 * 1024 * 1024 * 1024,
      used,
      breakdown,
    });
  }, [files]);

  // ─── Profile ──────────────────────────────────────────────────────────────
  const fetchUserProfile = async () => {
    try {
      const res = await api.getProfile();
      // Backend now returns: { status, data: { id, name, email, studentId, ... } }
      const userData = res.data;
      if (userData) {
        setUser({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          studentId: userData.studentId || '',
          university: userData.university || '',
          major: userData.major || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          profile_image: userData.profile_image || null,
          avatar:
            userData.profile_image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'SV')}`,
        });
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
    name: file.file_name || file.original_name,
    category: file.category || 'Others',
    type: file.file_type ? file.file_type.split('/').pop() : 'unknown',
    size: file.file_size || 0,
    dateAdded: file.created_at,
    isStarred: file.is_favorite === true || file.is_favorite === 1,
    inTrash: file.is_deleted === true || file.is_deleted === 1,
    sharedWith: [],
    downloadCount: file.download_count || 0,
    tags: file.tags || [],
    s3_key: file.s3_key,
  });

  // ─── Files ────────────────────────────────────────────────────────────────
  const fetchAllFiles = async () => {
    try {
      const res = await api.getFiles();
      // Backend returns: { status, results, data: [...files] }
      if (res.data) {
        const mapped = res.data.map(mapBackendFile);
        setFiles(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err.message);
    }
  };

  const fetchTrashFiles = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/trash`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentvault_token')}`,
          },
        }
      );
      const data = await res.json();
      if (data.data) {
        const trashFiles = data.data.map((f) => ({ ...mapBackendFile(f), inTrash: true }));
        setFiles((prev) => {
          const nonTrash = prev.filter((f) => !f.inTrash);
          return [...nonTrash, ...trashFiles];
        });
      }
    } catch (err) {
      console.error('Failed to fetch trash:', err.message);
    }
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

  const uploadFile = async (fileData) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      if (fileData.category) {
        formData.append('category', fileData.category);
      }
      if (fileData.folderId) {
        formData.append('folder_id', fileData.folderId);
      }

      const res = await api.uploadFile(formData);
      if (res.data) {
        const newFile = mapBackendFile(res.data);
        setFiles((prev) => [newFile, ...prev]);
        addActivity('uploaded', newFile.name, newFile.category);
      }
    } catch (err) {
      console.error('Upload failed:', err.message);
      throw err;
    }
  };

  const deleteFile = async (id) => {
    try {
      await api.deleteFile(id);
      const file = files.find((f) => f.id === id);
      // Move to trash (soft delete)
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            addActivity('deleted', f.name, f.category);
            return { ...f, inTrash: true };
          }
          return f;
        })
      );
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  const restoreFile = async (id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${id}/restore`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentvault_token')}`,
          },
        }
      );
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            addActivity('restored', f.name, f.category);
            return { ...f, inTrash: false };
          }
          return f;
        })
      );
    } catch (err) {
      console.error('Restore failed:', err.message);
    }
  };

  const permanentlyDeleteFile = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${id}/permanent`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentvault_token')}`,
          },
        }
      );
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (file) {
        addActivity('purged', file.name, file.category);
      }
    } catch (err) {
      console.error('Permanent delete failed:', err.message);
    }
  };

  const clearTrash = async () => {
    const trashFiles = files.filter((f) => f.inTrash);
    await Promise.all(trashFiles.map((f) => permanentlyDeleteFile(f.id)));
    addActivity('cleared_trash', 'Trash Bin Emptied');
  };

  const toggleStar = async (id) => {
    try {
      const file = files.find((f) => f.id === id);
      const nextStarred = !file.isStarred;
      await api.favoriteFile(id, nextStarred);

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
      await api.renameFile(id, newName);
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
      const res = await api.downloadFile(id);
      if (res.data && res.data.url) {
        window.open(res.data.url, '_blank');
        addActivity('downloaded', name, 'System');
      }
    } catch (err) {
      console.error('Download failed:', err.message);
    }
  };

  const shareFile = async (id, permission = 'view', expiryHours = 24) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/share`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentvault_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_id: id, permission, expiry_hours: expiryHours }),
        }
      );
      const data = await res.json();
      if (data.data) {
        addActivity('shared', files.find((f) => f.id === id)?.name || 'file', 'System');
        return data.data.share_link;
      }
    } catch (err) {
      console.error('Share failed:', err.message);
    }
  };

  const removeShare = () => {};

  // ─── Folders ──────────────────────────────────────────────────────────────
  const fetchAllFolders = async () => {
    try {
      const res = await api.getFolders();
      if (res.data) {
        setFolders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err.message);
    }
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.token) {
        localStorage.setItem('studentvault_token', res.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Login failed.' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: err.message || 'Invalid credentials.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.token) {
        localStorage.setItem('studentvault_token', res.token);
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
    localStorage.removeItem('studentvault_token');
    setFiles([]);
    setFolders([]);
    setActivities([]);
    setUser({ name: '', email: '', studentId: '', university: '', major: '' });
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
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
        updateProfile,
        updateNotifications,
        isAuthenticated,
        login,
        register,
        logout,
        fetchAllFiles,
        fetchAllFolders,
        fetchTrashFiles,
        fetchUserProfile,
      }}
    >
      {children}
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
