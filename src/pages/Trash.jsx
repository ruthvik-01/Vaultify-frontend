import React, { useState, useEffect, useCallback } from 'react';
import { useFiles } from '../context/FileContext';
import EmptyState from '../components/EmptyState';
import {
  Trash2,
  RefreshCcw,
  ShieldAlert,
  ArchiveRestore,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Film,
  Folder as FolderIcon,
  HardDrive,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Trash() {
  const { fetchTrashFiles, restoreFile, permanentlyDeleteFile, clearTrash, showNotification } = useFiles();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });

  // Modal confirmation state
  const [modal, setModal] = useState({ isOpen: false, type: null, item: null });

  const loadTrash = useCallback(async (targetPage = page, targetSearch = search, targetFilter = filter) => {
    setLoading(true);
    try {
      const res = await fetchTrashFiles({
        page: targetPage,
        limit: 12,
        search: targetSearch,
        filter: targetFilter
      });
      if (res) {
        setItems(res.items || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchTrashFiles, page, search, filter]);

  useEffect(() => {
    loadTrash(page, search, filter);
  }, [loadTrash, page, search, filter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleRestoreItem = async (item) => {
    await restoreFile(item.id, item.item_type);
    loadTrash(page, search, filter);
  };

  const handleConfirmAction = async () => {
    if (!modal.isOpen) return;

    if (modal.type === 'empty') {
      await clearTrash();
      setModal({ isOpen: false, type: null, item: null });
      loadTrash(1, search, filter);
    } else if (modal.type === 'permanent' && modal.item) {
      await permanentlyDeleteFile(modal.item.id, modal.item.item_type);
      setModal({ isOpen: false, type: null, item: null });
      loadTrash(page, search, filter);
    }
  };

  const handleRestoreAll = async () => {
    if (items.length === 0) return;
    for (const item of items) {
      await restoreFile(item.id, item.item_type);
    }
    showNotification('Restored items back to their active directories!', 'success');
    loadTrash(1, search, filter);
  };

  const getItemIcon = (item) => {
    if (item.item_type === 'folder') return <FolderIcon className="w-5 h-5 text-amber-500 shrink-0" />;
    if (item.category === 'Images') return <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />;
    if (item.category === 'Videos') return <Film className="w-5 h-5 text-purple-500 shrink-0" />;
    if (item.category === 'Documents') return <FileText className="w-5 h-5 text-emerald-500 shrink-0" />;
    return <HardDrive className="w-5 h-5 text-gray-500 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control Board */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-red-50 text-red-600 p-2.5 rounded-2xl border border-red-100">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Trash Bin Archive</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Soft-deleted database items remain intact until permanently purged.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {items.length > 0 && (
            <>
              <button
                onClick={handleRestoreAll}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore All Visible</span>
              </button>
              <button
                onClick={() => setModal({ isOpen: true, type: 'empty', item: null })}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start space-x-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Trash Locker Security</span>
          <span>
            Items in the Trash Bin are safely soft-deleted with metadata and S3 objects preserved. Restore brings items back immediately to their original folders.
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search deleted files by filename, folder, or owner..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1" />
            {[
              { id: 'all', label: 'All Items' },
              { id: 'Images', label: 'Images' },
              { id: 'Videos', label: 'Videos' },
              { id: 'Documents', label: 'Documents' },
              { id: 'Others', label: 'Others' },
              { id: 'today', label: 'Deleted Today' },
              { id: 'week', label: 'Deleted This Week' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Fetching deleted items from database...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Original Folder</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Deleted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {items.map((item) => (
                  <tr key={`${item.item_type}-${item.id}`} className="hover:bg-gray-50/80 transition-colors">
                    {/* Name + Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3 max-w-xs sm:max-w-sm">
                        {item.preview_url ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {item.category === 'Images' ? (
                              <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-50">
                                <Film className="w-4 h-4 text-purple-600" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-gray-100 shrink-0">
                            {getItemIcon(item)}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>

                    {/* Original Folder */}
                    <td className="py-3 px-4 text-gray-600 truncate max-w-[150px]" title={item.original_folder_name}>
                      <span className="flex items-center space-x-1.5 text-gray-700">
                        <FolderIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{item.original_folder_name}</span>
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 text-gray-500 font-mono">
                      {item.item_type === 'folder' ? '—' : formatSize(item.size)}
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4 text-gray-600">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.owner}</span>
                      </span>
                    </td>

                    {/* Deleted Date */}
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(item.deleted_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleRestoreItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                          title="Restore to original folder"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => setModal({ isOpen: true, type: 'permanent', item })}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                          title="Permanently delete from database and S3"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Showing <span className="font-semibold text-gray-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-semibold text-gray-800">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.total}</span> items
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 font-medium transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800">
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 font-medium transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <EmptyState
            title="Trash Bin is clean"
            description="No soft-deleted database items match your current filter and search settings."
            icon={ArchiveRestore}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900">
                  {modal.type === 'empty' ? 'Empty Trash Bin?' : 'Permanently Delete Item?'}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {modal.type === 'empty'
                    ? 'Are you sure you want to permanently delete all items in the Trash Bin? Database records, S3 objects, and metadata will be permanently purged and cannot be recovered.'
                    : `Are you sure you want to permanently delete "${modal.item?.name}"? The database record and S3 object will be permanently removed.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setModal({ isOpen: false, type: null, item: null })}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                {modal.type === 'empty' ? 'Yes, Empty Trash' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
