// Service for managing video folders. 
// Uses localStorage for isolated persistence to avoid affecting standard file folders.

const FOLDERS_KEY = 'vaultify_video_folders';

const getFolders = () => {
  try {
    const data = localStorage.getItem(FOLDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveFolders = (folders) => {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
};

export const folderService = {
  getFolders: async () => {
    return getFolders();
  },

  createFolder: async (name, parentId = null) => {
    const folders = getFolders();
    const newFolder = {
      id: `vf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      created_at: new Date().toISOString(),
    };
    folders.push(newFolder);
    saveFolders(folders);
    return newFolder;
  },

  renameFolder: async (id, newName) => {
    const folders = getFolders();
    const updated = folders.map((f) => (f.id === id ? { ...f, name: newName } : f));
    saveFolders(updated);
    return updated.find((f) => f.id === id);
  },

  deleteFolder: async (id) => {
    let folders = getFolders();
    
    // Recursive function to get all subfolder IDs
    const getSubfolderIds = (folderId) => {
      const subs = folders.filter((f) => f.parentId === folderId);
      let ids = [folderId];
      for (const sub of subs) {
        ids = [...ids, ...getSubfolderIds(sub.id)];
      }
      return ids;
    };

    const idsToDelete = getSubfolderIds(id);
    folders = folders.filter((f) => !idsToDelete.includes(f.id));
    saveFolders(folders);
    return idsToDelete; // Return deleted IDs so components can clear item references
  },

  moveFolder: async (id, targetParentId) => {
    const folders = getFolders();
    
    // Prevent moving folder into itself or its own subfolders
    const isDescendant = (parent, child) => {
      if (!child) return false;
      if (parent === child) return true;
      const childFolder = folders.find((f) => f.id === child);
      return isDescendant(parent, childFolder?.parentId);
    };

    if (isDescendant(id, targetParentId)) {
      throw new Error('Cannot move a folder into itself or one of its subfolders.');
    }

    const updated = folders.map((f) => (f.id === id ? { ...f, parentId: targetParentId } : f));
    saveFolders(updated);
    return updated.find((f) => f.id === id);
  },
};
