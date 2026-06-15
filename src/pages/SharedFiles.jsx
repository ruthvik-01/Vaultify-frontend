import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import FileCard from '../components/FileCard';
import EmptyState from '../components/EmptyState';
import { Users, UserPlus, Link2, Eye, ShieldAlert, Share2, Clipboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SharedFiles() {
  const { files, removeShare } = useFiles();
  const [activeTab, setActiveTab] = useState('by-me'); // by-me | with-me

  // Files shared BY the student (has recruiter emails)
  const sharedByMe = files.filter(f => !f.inTrash && f.sharedWith && f.sharedWith.length > 0);

  // Mock list of files shared WITH the student
  const [sharedWithMe, setSharedWithMe] = useState([
    {
      id: 'sw1',
      name: 'Placement_Drive_Schedule_2026_V3.pdf',
      owner: 'careers.state@university.edu',
      ownerName: 'Placement Office State Tech',
      size: 1048576, // 1.0 MB
      dateShared: '2026-06-12T09:00:00Z',
      category: 'Placement Documents',
      type: 'pdf'
    },
    {
      id: 'sw2',
      name: 'CSE_Senior_Capstone_Project_Rubric.pdf',
      owner: 'head.cse@university.edu',
      ownerName: 'Dr. Aris Thorne',
      size: 471859, // 460 KB
      dateShared: '2026-06-08T11:30:00Z',
      category: 'Assignments',
      type: 'pdf'
    },
    {
      id: 'sw3',
      name: 'System_Design_Cheatsheet.zip',
      owner: 'senior.peer@google.com',
      ownerName: 'Rahul Mehta (Alumni)',
      size: 8388608, // 8.0 MB
      dateShared: '2026-05-30T16:00:00Z',
      category: 'Notes',
      type: 'zip'
    }
  ]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    return (bytes / (k * k)).toFixed(1) + ' MB';
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCopyLink = (fileId) => {
    navigator.clipboard.writeText(`https://studentvault.co/shared-preview/${fileId}`);
    alert('Secure copy successful! Shared link is copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Tabs */}
      <div className="flex bg-white border border-brand-sand p-1 rounded-2xl w-full max-w-md shadow-sm">
        <button
          onClick={() => setActiveTab('by-me')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'by-me'
              ? 'bg-brand-olive text-white shadow-sm'
              : 'text-gray-500 hover:text-brand-charcoal'
          }`}
        >
          Shared by Me ({sharedByMe.length})
        </button>
        <button
          onClick={() => setActiveTab('with-me')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'with-me'
              ? 'bg-brand-olive text-white shadow-sm'
              : 'text-gray-500 hover:text-brand-charcoal'
          }`}
        >
          Shared with Me ({sharedWithMe.length})
        </button>
      </div>

      {/* Tab: Shared BY me */}
      {activeTab === 'by-me' && (
        <div className="space-y-4">
          {sharedByMe.length > 0 ? (
            <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-sand/70 text-left">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Shared Locker File</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recipients / Permitted Emails</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Sharing Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand/55 text-xs text-brand-charcoal">
                    {sharedByMe.map((file) => (
                      <tr key={file.id} className="hover:bg-brand-cream-dark/30 transition-all">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold block">{file.name}</span>
                          <span className="text-[10px] text-gray-400">Size: {formatSize(file.size)}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {file.sharedWith.map((email, idx) => (
                              <span key={idx} className="bg-brand-cream border border-brand-sand text-[9px] font-semibold px-2 py-0.5 rounded-lg flex items-center space-x-1 text-gray-600">
                                <span className="truncate max-w-[120px]">{email}</span>
                                <button
                                  onClick={() => {
                                    removeShare(file.id, email);
                                    alert(`Removed share link for ${email}`);
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="bg-brand-sage-light/25 text-brand-olive font-medium px-2 py-0.5 rounded-full text-[10px]">
                            {file.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleCopyLink(file.id)}
                            className="bg-brand-cream-dark border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ml-auto"
                          >
                            <Link2 className="w-3 h-3 text-brand-olive" />
                            <span>Copy Link</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <EmptyState 
                title="No shared links yet"
                description="When you share a file with recruiters, it will appear here so you can monitor access permission settings."
                actionText="Go to Locker Files"
                onActionClick={() => setActiveTab('by-me')} // fallback navigation mock
                icon={Share2}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab: Shared WITH me */}
      {activeTab === 'with-me' && (
        <div className="space-y-4">
          <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-sand/70 text-left">
                <thead className="bg-brand-cream">
                  <tr>
                    <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Document Name</th>
                    <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Locker Source Owner</th>
                    <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Received Date</th>
                    <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Preview Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand/55 text-xs text-brand-charcoal">
                  {sharedWithMe.map((file) => (
                    <tr key={file.id} className="hover:bg-brand-cream-dark/30 transition-all">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold block">{file.name}</span>
                        <span className="text-[10px] text-gray-400">Size: {formatSize(file.size)}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold block text-brand-charcoal">{file.ownerName}</span>
                        <span className="text-[9px] font-mono text-gray-500 block mt-0.5">{file.owner}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-400">
                        {formatDate(file.dateShared)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => alert(`Opening secure reader preview for faculty resource: ${file.name}`)}
                          className="bg-brand-olive hover:bg-brand-olive-dark text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open File</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
