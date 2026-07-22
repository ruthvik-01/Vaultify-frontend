import { useState, useCallback } from 'react';
import { folderService } from '../services/folderService';
import { videoUploadService } from '../services/videoUploadService';
import { api } from '../services/api';

const activeUploads = {};

const calculateSpeedAndETA = (loaded, total, startTime) => {
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  if (elapsed <= 0) return { speed: 0, eta: 0 };
  const speed = loaded / elapsed; // bytes/sec
  const remainingBytes = total - loaded;
  const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;
  return { speed, eta };
};

const uploadGeneralFile = (task, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('vaultify_token');
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    activeUploads[task.id] = { xhr, aborted: false };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    xhr.open('POST', `${API_URL}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && !activeUploads[task.id]?.aborted) {
        const progress = Math.round((event.loaded / event.total) * 100);
        const { speed, eta } = calculateSpeedAndETA(event.loaded, event.total, startTime);
        if (options.onProgress) {
          options.onProgress({ progress, speed, eta });
        }
      }
    };

    xhr.onload = () => {
      delete activeUploads[task.id];
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.data?.file || res.data || res);
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || `Upload failed with status ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      delete activeUploads[task.id];
      reject(new Error('Network error during upload'));
    };

    xhr.onabort = () => {
      delete activeUploads[task.id];
      reject(new Error('aborted'));
    };

    const formData = new FormData();
    formData.append('file', task.file);
    if (task.folderId) {
      formData.append('folder_id', task.folderId);
    }
    if (task.uploadBatchId) {
      formData.append('uploadBatchId', task.uploadBatchId);
    }
    if (task.file.webkitRelativePath) {
      formData.append('relative_path', task.file.webkitRelativePath);
    }

    xhr.send(formData);
  });
};

export function useVideoUpload(onUploadComplete) {
  const [queue, setQueue] = useState([]);

  const performUpload = useCallback(async (task) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 0 } : t))
    );

    const ext = task.file.name.split('.').pop().toLowerCase();
    const allowedVideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpeg', '3gp', 'ogv'];
    const isVideo = allowedVideoExtensions.includes(ext) || (task.file.type && task.file.type.startsWith('video/'));

    if (isVideo) {
      await videoUploadService.uploadVideo(task, {
        onProgress: ({ progress, speed, eta }) => {
          setQueue((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? { ...t, progress, speed, eta }
                : t
            )
          );
        },
        onComplete: (fileData) => {
          setQueue((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'success', progress: 100 } : t))
          );
          if (onUploadComplete && fileData) {
            onUploadComplete(fileData, task.folderId, 'video');
          }
        },
        onError: (err, isAbort) => {
          setQueue((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: isAbort ? 'cancelled' : 'failed',
                    progress: isAbort ? 0 : t.progress,
                    speed: 0,
                    eta: 0,
                    error: err.message
                  }
                : t
            )
          );
        }
      });
    } else {
      try {
        const fileData = await uploadGeneralFile(task, {
          onProgress: ({ progress, speed, eta }) => {
            setQueue((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? { ...t, progress, speed, eta }
                  : t
              )
            );
          }
        });
        setQueue((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: 'success', progress: 100 } : t))
        );
        if (onUploadComplete && fileData) {
          onUploadComplete(fileData, task.folderId, 'file');
        }
      } catch (err) {
        const isAbort = err.message === 'aborted';
        setQueue((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: isAbort ? 'cancelled' : 'failed',
                  progress: isAbort ? 0 : t.progress,
                  speed: 0,
                  eta: 0,
                  error: err.message
                }
              : t
          )
        );
      }
    }
  }, [onUploadComplete]);

  // Queue files/folders
  const addFilesToQueue = useCallback(async (filesList, currentFolderId, passedBatchId = null, uploadGroupId = null, folderContext = 'video') => {
    const tasksToAdd = [];
    const folderCache = {};
    const uploadBatchId = passedBatchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Pre-fetch folders to avoid duplicate API requests per folder part
    let initialFolders = [];
    if (folderContext === 'work') {
      try {
        const res = await api.getFolders();
        initialFolders = res.data?.folders || res.data || [];
      } catch (err) {
        console.error('Failed to pre-fetch work folders:', err);
      }
    } else {
      try {
        initialFolders = await folderService.getFolders();
      } catch (err) {
        console.error('Failed to pre-fetch video folders:', err);
      }
    }

    const resolveFolderIdForPath = async (relativePath) => {
      if (!relativePath) return currentFolderId;
      const parts = relativePath.split('/').slice(0, -1);
      if (parts.length === 0) return currentFolderId;

      let parentId = currentFolderId;
      let pathAccum = '';

      for (const part of parts) {
        pathAccum = pathAccum ? `${pathAccum}/${part}` : part;
        if (folderCache[pathAccum]) {
          parentId = folderCache[pathAccum];
        } else {
          let existing = initialFolders.find((f) => {
            const fName = f.name || f.folder_name;
            const fParent = f.parentId || f.parent_folder_id;
            return fName === part && fParent?.toString() === parentId?.toString();
          });

          if (existing) {
            parentId = existing.id || existing._id;
          } else {
            if (folderContext === 'work') {
              const res = await api.createFolder(part, parentId, uploadBatchId, uploadGroupId);
              const f = res.data?.folder || res.data;
              const newFolderObj = {
                id: f._id || f.id,
                _id: f._id || f.id,
                name: f.folder_name || f.name,
                folder_name: f.folder_name || f.name,
                parentId: f.parent_folder_id || f.parentId,
                parent_folder_id: f.parent_folder_id || f.parentId
              };
              initialFolders.push(newFolderObj);
              parentId = newFolderObj.id;
            } else {
              const created = await folderService.createFolder(part, parentId, uploadBatchId, uploadGroupId);
              const newFolderObj = {
                id: created.id,
                name: created.name,
                parentId: created.parentId
              };
              initialFolders.push(newFolderObj);
              parentId = created.id;
            }
          }
          folderCache[pathAccum] = parentId;
        }
      }
      return parentId;
    };

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const folderId = await resolveFolderIdForPath(file.webkitRelativePath);
      
      const task = {
        id: `up_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'queued',
        speed: 0,
        eta: 0,
        folderId,
        uploadBatchId,
        upload_group_id: uploadGroupId
      };

      tasksToAdd.push(task);
    }

    setQueue((prev) => [...prev, ...tasksToAdd]);

    // Start uploads sequentially
    tasksToAdd.forEach((task) => {
      performUpload(task);
    });
  }, [performUpload]);

  const cancelUpload = useCallback((taskId) => {
    videoUploadService.cancelUpload(taskId);
    if (activeUploads[taskId]) {
      try {
        activeUploads[taskId].aborted = true;
        activeUploads[taskId].xhr.abort();
      } catch (err) {}
      delete activeUploads[taskId];
    }
    setQueue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
    );
  }, []);

  const retryUpload = useCallback((taskId) => {
    setQueue((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        setTimeout(() => {
          performUpload(task);
        }, 0);
      }
      return prev;
    });
  }, [performUpload]);

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      prev.forEach((t) => {
        if (t.status === 'uploading' || t.status === 'queued') {
          videoUploadService.cancelUpload(t.id);
          if (activeUploads[t.id]) {
            try {
              activeUploads[t.id].aborted = true;
              activeUploads[t.id].xhr.abort();
            } catch (err) {}
            delete activeUploads[t.id];
          }
        }
      });
      return [];
    });
  }, []);

  return {
    queue,
    addFilesToQueue,
    cancelUpload,
    retryUpload,
    clearQueue,
  };
}
