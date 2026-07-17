import { useState } from 'react';
import { shareService } from '../services/shareService';

export function useVideoShare() {
  const [activeItem, setActiveItem] = useState(null); // { id, name, type: 'video' | 'folder' }
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const openShare = async (item) => {
    setActiveItem(item);
    setShareLink('');
    setCopied(false);
    setError('');
    setLoading(true);

    try {
      let result;
      if (item.type === 'folder') {
        result = await shareService.shareFolder(item.id);
      } else {
        result = await shareService.shareFile(item.id);
      }
      
      // Look for the correct URL layout
      // The backend returns a full share_link that ends with /api/share/:token.
      // We will parse out the token and build the frontend route /share/:token.
      if (result && result.share_link) {
        const parts = result.share_link.split('/');
        const token = parts[parts.length - 1];
        setShareLink(`${window.location.origin}/share/${token}`);
      } else {
        throw new Error('Link generation failed.');
      }
    } catch (e) {
      setError(e.message || 'Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const closeShare = () => {
    setActiveItem(null);
    setShareLink('');
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return {
    activeItem,
    shareLink,
    loading,
    copied,
    error,
    openShare,
    closeShare,
    copyToClipboard,
  };
}
