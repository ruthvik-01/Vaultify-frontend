import React, { useState, useEffect } from 'react';
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
  const { files } = useFiles();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded | size | name
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
  const [highlightedId, setHighlightedId] = useState(null);

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

  // Filter active files (NOT in Trash)
  const activeFiles = files.filter(f => !f.inTrash);

  // Filter by active category
  const filteredFiles = activeCategory === 'All' 
    ? activeFiles 
    : activeFiles.filter(f => f.category === activeCategory);

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
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

      {/* Render directories grid only when 'All' is selected */}
      {activeCategory === 'All' && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-brand-charcoal">Carrier Directories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <FolderCard key={cat} category={cat} />
            ))}
          </div>
        </div>
      )}

      {/* Controls: List/Grid toggle, Sorting filters */}
      <div className="bg-white border border-brand-sand rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-brand-olive" />
          <span className="text-gray-500">Viewing folder:</span>
          <span className="font-serif font-bold text-brand-charcoal text-sm">{activeCategory}</span>
          <span className="text-[10px] text-gray-400 bg-brand-cream-dark px-2 py-0.5 rounded-full font-bold">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-4">
          {/* Sorting controls */}
          <div className="flex items-center space-x-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-cream border border-brand-sand rounded-xl px-2.5 py-1.5 text-xs text-brand-charcoal focus:outline-none"
            >
              <option value="dateAdded">Date Added</option>
              <option value="size">File Size</option>
              <option value="name">File Name</option>
            </select>
            
            <button
              onClick={toggleSortOrder}
              className="p-2 border border-brand-sand hover:bg-brand-cream rounded-xl text-gray-500 hover:text-brand-charcoal transition-all"
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-brand-sand" />

          {/* List/Grid View Mode toggle */}
          <div className="flex items-center space-x-1.5 bg-brand-cream border border-brand-sand p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-charcoal'}`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
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
