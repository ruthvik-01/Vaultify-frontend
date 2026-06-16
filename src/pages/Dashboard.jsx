import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { 
  Sparkles, Upload, FileText, ArrowRight, ExternalLink, 
  CheckCircle, Plus, Calendar, Compass, ShieldAlert, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Dashboard() {
  const { files, activities, user, uploadFile } = useFiles();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  // Get active files
  const activeFiles = files.filter(f => !f.inTrash);

  // Get top 4 recent files
  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 4);

  // Get project files
  const projectFiles = activeFiles.filter(f => f.category === 'Projects').slice(0, 2);

  // Get certificate files
  const certificateFiles = activeFiles.filter(f => f.category === 'Certificates');

  // Drag and drop handlers for Quick Upload widget
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      
      // Upload using default category based on extension
      let cat = 'Notes';
      if (['pdf'].includes(ext)) {
        cat = 'Resumes';
      } else if (['zip', 'rar'].includes(ext)) {
        cat = 'Projects';
      }

      uploadFile({
        file: file,
        name: file.name,
        category: cat,
        type: ext,
        size: file.size,
        tags: ['Quick Upload']
      }).then(() => {
        alert(`Successfully uploaded "${file.name}" to ${cat} category!`);
      }).catch((err) => {
        alert('Upload failed: ' + (err?.message || 'Unknown error'));
      });
    }
  };

  const timeAgo = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Profile Completion Bar */}
      <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal leading-tight">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-sans">
            Student ID: <span className="font-mono font-semibold">{user.studentId}</span> • {user.major}
          </p>
        </div>
        
        {/* Profile Completion Indicator */}
        <div className="w-full md:w-64 bg-brand-cream border border-brand-sand rounded-2xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 mb-1">
            <span>Portfolio Locker Status</span>
            <span className="text-brand-olive">85% Complete</span>
          </div>
          <div className="w-full bg-brand-cream-dark h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-olive h-full rounded-full" style={{ width: '85%' }} />
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="text-[9px] font-bold text-brand-olive mt-2 hover:underline flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Complete profile portfolio</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Grid Dashboard Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main locker sections (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Upload drop widget */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`
              border border-brand-sand rounded-3xl p-5 bg-white shadow-sm transition-all text-center flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0
              ${dragActive ? 'border-brand-olive bg-brand-sage-light/20 scale-[0.99]' : ''}
            `}
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="bg-brand-cream-dark p-3 rounded-2xl text-brand-olive">
                <Upload className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-brand-charcoal text-base">Quick Locker Drop</h3>
                <p className="text-xs text-gray-500 mt-0.5">Drag files anywhere here to instantly archive in your locker</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/upload')}
              className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Upload</span>
            </button>
          </div>

          {/* Recent Files Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">Recent Documents</h3>
              <button 
                onClick={() => navigate('/my-files')}
                className="text-xs font-bold text-brand-olive hover:underline flex items-center space-x-0.5"
              >
                <span>View All Files</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentFiles.map(file => (
                  <FileCard key={file.id} file={file} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-brand-sand p-8 rounded-3xl text-center text-xs text-gray-500">
                Locker is currently empty. Drop some files above to get started.
              </div>
            )}
          </div>

          {/* Featured Projects Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">Highlighted Source Projects</h3>
              <button 
                onClick={() => navigate('/my-files?category=Projects')}
                className="text-xs font-bold text-brand-olive hover:underline flex items-center space-x-0.5"
              >
                <span>All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectFiles.map(project => (
                <div key={project.id} className="bg-white border border-brand-sand rounded-2xl p-5 shadow-sm flex flex-col justify-between h-48 hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-brand-olive/10 text-brand-olive-dark text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Project Repository
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {(project.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-brand-charcoal line-clamp-1">{project.name}</h4>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-brand-cream border border-brand-sand text-[9px] px-1.5 py-0.5 rounded text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2.5 mt-4 pt-3 border-t border-brand-sand/65">
                    <button
                      onClick={() => alert('Viewing repository mock details.')}
                      className="flex-1 bg-brand-cream hover:bg-brand-sand/50 text-brand-charcoal font-bold py-2 rounded-xl text-[10px] border border-brand-sand transition-all flex items-center justify-center space-x-1"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Workspace</span>
                    </button>
                    {project.projectLink && (
                      <a
                        href={project.projectLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white font-bold py-2 rounded-xl text-[10px] transition-all flex items-center justify-center space-x-1"
                      >
                        <GithubIcon className="w-3 h-3" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar stats & feeds (1/3 width on desktop) */}
        <div className="space-y-6">
          
          {/* Verified Certificates Badge Slider */}
          <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-brand-charcoal flex items-center">
                <Award className="w-4 h-4 text-amber-600 mr-1.5" />
                <span>Verified Badges</span>
              </h3>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[9px] font-bold">
                {certificateFiles.length} Verified
              </span>
            </div>

            <div className="space-y-3">
              {certificateFiles.map(cert => (
                <div key={cert.id} className="border border-brand-sand rounded-2xl p-4 bg-brand-cream/40 flex items-center space-x-3.5 hover:bg-brand-cream transition-all">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-brand-charcoal truncate" title={cert.name}>
                      {cert.name.replace(/_/g, ' ').replace('.pdf', '')}
                    </h4>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{cert.certificateIssuer}</p>
                    <span className="text-[9px] font-mono text-brand-olive bg-brand-sage-light/20 px-1.5 py-0.5 rounded inline-block mt-1">
                      ID: {cert.credentialId}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/my-files?category=Certificates')}
              className="w-full text-center text-xs font-bold text-brand-olive py-1 hover:underline flex items-center justify-center space-x-1"
            >
              <span>Verify credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity Feed Widget */}
          <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-charcoal">Activity Log Timeline</h3>
            
            <div className="relative border-l border-brand-sand pl-4 ml-2.5 space-y-5 py-2">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[22.5px] top-1 w-3.5 h-3.5 rounded-full bg-brand-cream border border-brand-olive flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-olive" />
                  </span>
                  
                  <div>
                    <p className="text-xs text-brand-charcoal">
                      <span className="capitalize font-semibold text-brand-olive-dark">
                        {act.action === 'clear_trash' ? 'cleared trash' : act.action}
                      </span>{' '}
                      {act.action === 'shared' ? (
                        <>
                          <span className="font-semibold">{act.fileName}</span> with{' '}
                          <span className="font-mono text-gray-500 text-[10px]">{act.sharedWithEmail}</span>
                        </>
                      ) : (
                        <span className="font-semibold">{act.fileName}</span>
                      )}
                    </p>
                    <span className="text-[9px] text-gray-400 font-sans block mt-1 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-300" />
                      <span>{timeAgo(act.timestamp)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
