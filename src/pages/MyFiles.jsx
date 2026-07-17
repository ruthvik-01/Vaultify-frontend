import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFiles, categories } from '../context/FileContext';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import EmptyState from '../components/EmptyState';
import { 
  Grid, List, ArrowUpDown, Filter, Search, FileX, Plus,
  FolderClosed, Archive, Award, FolderGit, FileText, FileQuestion
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyFiles() {
  const { files, user, searchQuery, setSearchQuery, updateProfile } = useFiles();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [viewMode, setViewMode] = useState(user.theme_color || 'grid'); // grid | list
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // all | image | pdf | document | video | other
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded | size | name
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
  const [highlightedId, setHighlightedId] = useState(null);

  // Sync viewMode preference immediately from User profile settings
  useEffect(() => {
    if (user.theme_color) {
      setViewMode(user.theme_color);
    }
  }, [user.theme_color]);

  // Active category derived from URL search param
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    // If a highlight query exists, note it and auto-clear it after 3 seconds
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleCategorySelect = (category) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    // Clear highlight on category switch
    searchParams.delete('highlight');
    setSearchParams(searchParams);
  };

  // Filter and sort files using useMemo for performance optimization
  const sortedFiles = useMemo(() => {
    // Filter active files (NOT in Trash)
    const activeFiles = files.filter(f => !f.inTrash);

    // Filter by search query
    const searchedFiles = activeFiles.filter(f => {
      if (!searchQuery) return true;
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Filter by active category
    const categorizedFiles = activeCategory === 'All' 
      ? searchedFiles 
      : searchedFiles.filter(f => f.category === activeCategory);

    // Filter by file type
    const filteredFiles = categorizedFiles.filter(f => {
      if (fileTypeFilter === 'all') return true;
      const ext = f.name.split('.').pop().toLowerCase();
      const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || (f.mimeType && f.mimeType.startsWith('image/'));
      const isPdf = ext === 'pdf' || (f.mimeType && f.mimeType === 'application/pdf');
      const isVideo = ['mp4', 'mkv', 'avi', 'mov', 'video'].includes(f.type) || (f.mimeType && f.mimeType.startsWith('video/'));
      const isDoc = ['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) || (f.mimeType && (f.mimeType.startsWith('text/') || f.mimeType.includes('document') || f.mimeType.includes('sheet')));
      
      if (fileTypeFilter === 'image') return isImg;
      if (fileTypeFilter === 'pdf') return isPdf;
      if (fileTypeFilter === 'video') return isVideo;
      if (fileTypeFilter === 'document') return isDoc;
      if (fileTypeFilter === 'other') return !isImg && !isPdf && !isVideo && !isDoc;
      return true;
    });

    // Sort files
    return [...filteredFiles].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dateAdded') {
        comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [files, searchQuery, activeCategory, fileTypeFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Calculate folder counts for summaries
  const getFolderIcon = (cat) => {
    switch (cat) {
      case 'Resumes':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'Certificates':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'Projects':
        return <FolderGit className="w-5 h-5 text-brand-olive" />;
      default:
        return <FolderClosed className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Category Navigation Tags */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            activeCategory === 'All'
              ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
              : 'bg-white border-brand-sand text-gray-500 hover:text-brand-charcoal hover:border-brand-sand'
          }`}
        >
          All Folders
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === cat
                ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                : 'bg-white border-brand-sand text-gray-500 hover:text-brand-charcoal hover:border-brand-sand'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>



      {/* Search Bar & File Type Filter Tags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-brand-sand rounded-3xl p-5 shadow-sm">
        {/* Search omnibar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files in locker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-brand-charcoal font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* File Type Filter tags */}
        <div className="flex overflow-x-auto gap-2 scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'all', name: 'All Types' },
            { id: 'image', name: 'Images' },
            { id: 'pdf', name: 'PDFs' },
            { id: 'document', name: 'Documents' },
            { id: 'video', name: 'Videos' },
            { id: 'other', name: 'Others' }
          ].map((typeOpt) => (
            <button
              key={typeOpt.id}
              onClick={() => setFileTypeFilter(typeOpt.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                fileTypeFilter === typeOpt.id
                  ? 'bg-brand-olive text-white border-brand-olive shadow-sm'
                  : 'bg-brand-cream border-brand-sand text-gray-500 hover:text-brand-charcoal'
              }`}
            >
              {typeOpt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb & Sorting options */}
      <div className="bg-white border border-brand-sand rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 text-xs text-left">
          <Filter className="w-4 h-4 text-brand-olive" />
          <span className="text-gray-500">Locker:</span>
          <span className="font-serif font-bold text-brand-charcoal text-sm">{activeCategory}</span>
          <span className="text-[10px] text-gray-400 bg-brand-cream-dark px-2 py-0.5 rounded-full font-bold font-mono">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-4">
          {/* Sorting controls */}
          <div className="flex items-center space-x-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="bg-brand-cream border border-brand-sand rounded-xl px-2.5 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
            >
              <option value="dateAdded-desc">Latest</option>
              <option value="dateAdded-asc">Oldest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">File Size (Large to Small)</option>
              <option value="size-asc">File Size (Small to Large)</option>
            </select>
          </div>

          <div className="h-6 w-px bg-brand-sand" />

          {/* List/Grid View Mode toggle */}
          <div className="flex items-center space-x-1.5 bg-brand-cream border border-brand-sand p-1 rounded-xl">
            <button
              onClick={() => {
                setViewMode('grid');
                updateProfile({ theme_color: 'grid' });
              }}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-charcoal'}`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                updateProfile({ theme_color: 'list' });
              }}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-charcoal'}`}
              title="List Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display Section */}
      <div className="space-y-4">
        {sortedFiles.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedFiles.map((file) => {
                const isHighlighted = highlightedId === file.id;
                return (
                  <div 
                    key={file.id} 
                    className={`transition-all duration-700 rounded-2xl ${
                      isHighlighted 
                        ? 'ring-2 ring-brand-olive shadow-lg ring-offset-2 scale-102 bg-brand-sage-light/10' 
                        : ''
                    }`}
                  >
                    <FileCard file={file} viewMode="grid" />
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Layout (Table view) */
            <div className="bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-sand/70 text-left">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date Added</th>
                      <th className="py-3.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand/55">
                    {sortedFiles.map((file) => (
                      <FileCard key={file.id} file={file} viewMode="list" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Empty Folder State */
          <div className="py-12">
            <EmptyState 
              title={`No files in ${activeCategory}`}
              description={`You haven't archived any items in your ${activeCategory} category locker folder yet.`}
              actionText="Upload First File"
              onActionClick={() => handleCategorySelect('All')} // or direct link
              icon={FileX}
            />
          </div>
        )}
      </div>
    </div>
  );
}
