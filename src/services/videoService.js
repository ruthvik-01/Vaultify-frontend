// Service for managing video files, bridging the standard backend file APIs
// with isolated, local video folder categorization.

import { api } from './api';

const FILES_FOLDER_KEY = 'vaultify_video_file_folders';

const getFileFoldersMap = () => {
  try {
    const data = localStorage.getItem(FILES_FOLDER_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveFileFoldersMap = (map) => {
  localStorage.setItem(FILES_FOLDER_KEY, JSON.stringify(map));
};

export const videoService = {
  // Get all files from backend, filter to video types, and assign their local video folder mapping
  getVideos: async () => {
    const res = await api.getFiles();
    const allFiles = res.data?.files || res.data || [];
    
    // Whitelist video formats matching requirement: mp4, mov, avi, mkv, webm, flv, wmv, m4v, mpeg, 3gp, ogv
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpeg', '3gp', 'ogv'];
    
    const rawVideos = allFiles.filter((f) => {
      const ext = (f.file_name || f.original_name || '').split('.').pop().toLowerCase();
      const mime = f.file_type || '';
      return videoExts.includes(ext) || mime.startsWith('video/');
    });

    const fileFolderMap = getFileFoldersMap();

    // Map each backend video into frontend UI structure
    return rawVideos.map((f) => {
      const name = f.file_name || f.original_name;
      const ext = name.split('.').pop().toLowerCase();
      return {
        id: f.id,
        name: name,
        category: f.category || 'Media',
        type: ext,
        size: f.file_size || 0,
        dateAdded: f.created_at,
        isStarred: f.is_favorite === true || f.is_favorite === 1,
        inTrash: f.is_deleted === true || f.is_deleted === 1,
        sharedWith: [],
        downloadCount: f.download_count || 0,
        s3_key: f.s3_key,
        mimeType: f.file_type || `video/${ext}`,
        // Local Folder Mapping
        videoFolderId: fileFolderMap[f.id] || null,
        owner: f.owner || { name: 'Me' },
        status: f.status || 'Active', // Active, Uploading, Failed
      };
    });
  },

  renameVideo: async (id, newName) => {
    await api.renameFile(id, newName);
  },

  moveVideo: async (id, targetFolderId) => {
    const map = getFileFoldersMap();
    if (targetFolderId) {
      map[id] = targetFolderId;
    } else {
      delete map[id]; // moved to root
    }
    saveFileFoldersMap(map);
    return { id, videoFolderId: targetFolderId };
  },

  deleteVideo: async (id, permanent = false) => {
    if (permanent) {
      await api.deleteFile(id);
    } else {
      // Use the soft-delete API (or let Context handle it)
      // Mapped to DELETE /files/:id on backend which does the soft-delete or delete
      await api.deleteFile(id);
    }
    
    // Clean up local folder mapping
    const map = getFileFoldersMap();
    delete map[id];
    saveFileFoldersMap(map);
  },

  downloadVideo: async (id) => {
    const res = await api.downloadFile(id);
    return res.download_url || (res.data && res.data.download_url);
  },

  getPlaybackUrl: async (id) => {
    const res = await api.getPreviewUrl(id);
    return res.download_url || (res.data && res.data.download_url);
  }
};
