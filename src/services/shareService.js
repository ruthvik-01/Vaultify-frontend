// Service for managing share links of videos and video folders.
// Integrates with backend share APIs for files, and uses local simulation for folders.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const shareService = {
  // Share a video file (uses the real backend /share API)
  shareFile: async (fileId) => {
    const token = localStorage.getItem('vaultify_token');
    const res = await fetch(`${API_URL}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_id: fileId, permission: 'read', expiry_hours: 24 })
    });
    if (!res.ok) {
      throw new Error('Failed to generate share link.');
    }
    const data = await res.json();
    return data.data; // { token, share_link, permission, expiry_date }
  },

  // Share a video folder (uses localStorage simulation for folder integrity)
  shareFolder: async (folderId) => {
    const token = `foldertoken_${folderId}_${Date.now()}`;
    const folders = JSON.parse(localStorage.getItem('vaultify_video_folders') || '[]');
    const folder = folders.find((f) => f.id === folderId);
    
    if (!folder) {
      throw new Error('Folder does not exist.');
    }

    const sharedFolders = JSON.parse(localStorage.getItem('vaultify_video_shared_folders') || '{}');
    sharedFolders[token] = {
      folderId,
      name: folder.name,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('vaultify_video_shared_folders', JSON.stringify(sharedFolders));
    
    return {
      token,
      share_link: `${window.location.origin}/share/${token}`
    };
  },

  // Resolve a public token to retrieve shared details (no auth required)
  getSharedItem: async (token) => {
    if (token.startsWith('foldertoken_')) {
      const sharedFolders = JSON.parse(localStorage.getItem('vaultify_video_shared_folders') || '{}');
      const info = sharedFolders[token];
      if (!info) {
        throw new Error('Shared folder not found or has expired.');
      }
      return {
        type: 'folder',
        name: info.name,
        folderId: info.folderId
      };
    } else {
      // Call public GET /share/:token endpoint
      const res = await fetch(`${API_URL}/share/${token}`);
      if (!res.ok) {
        throw new Error('Shared link is invalid or has expired.');
      }
      const json = await res.json();
      return {
        type: 'file',
        name: json.data.file_name,
        file_name: json.data.file_name,
        size: json.data.file_size,
        file_size: json.data.file_size,
        mimeType: json.data.file_type,
        file_type: json.data.file_type,
        downloadUrl: json.data.download_url,
        download_url: json.data.download_url,
        createdAt: json.data.createdAt,
        ownerName: json.data.ownerName
      };
    }
  }
};
