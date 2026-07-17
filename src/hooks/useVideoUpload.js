import { useState, useRef, useCallback } from 'react';
import { folderService } from '../services/folderService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PART_SIZE = 100 * 1024 * 1024; // 100 MB, matching backend s3Service.js PART_SIZE

export function useVideoUpload(onUploadComplete) {
  const [queue, setQueue] = useState([]);
  const activeUploads = useRef({}); // taskId -> { xhr, aborted: boolean }

  const calculateSpeedAndETA = (loaded, total, startTime) => {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    if (elapsed <= 0) return { speed: 0, eta: 0 };
    const speed = loaded / elapsed; // bytes/sec
    const remainingBytes = total - loaded;
    const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : 0; // seconds
    return { speed, eta };
  };

  const uploadPart = (url, chunk, partNumber, taskId, startTime, prevUploadedBytes, totalSize) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      activeUploads.current[taskId] = { xhr, aborted: false };

      xhr.open('PUT', url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const currentLoaded = prevUploadedBytes + event.loaded;
          const percent = Math.min(Math.round((currentLoaded / totalSize) * 100), 99);
          const { speed, eta } = calculateSpeedAndETA(currentLoaded, totalSize, startTime);

          setQueue((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { ...t, progress: percent, speed, eta }
                : t
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const etag = xhr.getResponseHeader('ETag');
          resolve({ partNumber, etag });
        } else {
          reject(new Error(`Failed to upload part ${partNumber}. Status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Network error on part ${partNumber}`));
      };

      xhr.onabort = () => {
        reject(new Error('aborted'));
      };

      xhr.send(chunk);
    });
  };

  const performUpload = useCallback(async (task) => {
    const startTime = Date.now();
    const token = localStorage.getItem('vaultify_token');
    
    setQueue((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 0 } : t))
    );

    let videoId = null;
    let uploadId = null;

    try {
      // 1. Initiate Multipart Upload
      const initRes = await fetch(`${API_URL}/videos/upload/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: task.file.name,
          mimeType: task.file.type || 'video/mp4',
          size: task.file.size,
          folderId: task.folderId
        })
      });

      if (!initRes.ok) {
        throw new Error('Failed to initiate upload.');
      }

      const initData = await initRes.json();
      videoId = initData.data.videoId;
      uploadId = initData.data.uploadId;
      const partUrls = initData.data.partUrls;

      // 2. Upload Parts sequentially
      const completedParts = [];
      let prevUploadedBytes = 0;

      for (const part of partUrls) {
        // If aborted during loop, throw
        if (activeUploads.current[task.id]?.aborted) {
          throw new Error('aborted');
        }

        const start = (part.partNumber - 1) * PART_SIZE;
        const end = Math.min(part.partNumber * PART_SIZE, task.file.size);
        const chunk = task.file.slice(start, end);

        const result = await uploadPart(
          part.url,
          chunk,
          part.partNumber,
          task.id,
          startTime,
          prevUploadedBytes,
          task.file.size
        );

        completedParts.push(result);
        prevUploadedBytes += (end - start);
      }

      // 3. Complete Multipart Upload
      const completeRes = await fetch(`${API_URL}/videos/upload/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId,
          uploadId,
          parts: completedParts
        })
      });

      if (!completeRes.ok) {
        throw new Error('Failed to complete upload.');
      }

      const completeData = await completeRes.json();
      const fileData = completeData.data?.video || completeData.data;

      setQueue((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'success', progress: 100 } : t))
      );

      delete activeUploads.current[task.id];

      if (onUploadComplete && fileData) {
        onUploadComplete(fileData, task.folderId);
      }
    } catch (err) {
      const isAbort = err.message === 'aborted';
      delete activeUploads.current[task.id];

      // If aborted/cancelled, notify backend
      if (videoId && uploadId) {
        fetch(`${API_URL}/videos/upload/abort`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ videoId, uploadId })
        }).catch(() => {});
      }

      setQueue((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: isAbort ? 'cancelled' : 'failed', progress: 0, speed: 0, eta: 0 }
            : t
        )
      );
    }
  }, [onUploadComplete]);

  // Queue files/folders
  const addFilesToQueue = useCallback(async (filesList, currentFolderId) => {
    const tasksToAdd = [];
    const folderCache = {};

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
          const localFolders = await folderService.getFolders();
          const existing = localFolders.find(
            (f) => f.name === part && f.parentId === parentId
          );

          if (existing) {
            parentId = existing.id;
          } else {
            const created = await folderService.createFolder(part, parentId);
            parentId = created.id;
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
    const active = activeUploads.current[taskId];
    if (active) {
      active.aborted = true;
      if (active.xhr) {
        active.xhr.abort();
      }
    } else {
      setQueue((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
      );
    }
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
    Object.keys(activeUploads.current).forEach((taskId) => {
      const active = activeUploads.current[taskId];
      active.aborted = true;
      if (active.xhr) {
        active.xhr.abort();
      }
    });
    activeUploads.current = {};
    setQueue([]);
  }, []);

  return {
    queue,
    addFilesToQueue,
    cancelUpload,
    retryUpload,
    clearQueue,
  };
}
