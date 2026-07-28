import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import SaasNotification from '../../components/SaasNotification';
import { 
  FolderKanban, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Cloud,
  Code,
  Terminal,
  Database,
  Trash2,
  AlertCircle,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  HardDrive,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [toast, setToast] = useState(null);

  // Client-side search, sorting, filtering, and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getTeams();
      if (res && res.teams) {
        setTeams(res.teams);
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError(err.message || 'Failed to load teams.');
      setToast({ message: err.message || 'Failed to load teams.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handlePurgeTeamUploads = async (teamName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to purge ALL uploads for Team "${teamName}"? This will permanently delete all files and videos for all students in this team.`)) {
      return;
    }
    try {
      const res = await adminService.deleteTeamUploads(teamName);
      setToast({ message: res.message || `Uploads for team "${teamName}" purged successfully.`, type: 'success' });
      fetchTeams();
    } catch (err) {
      setToast({ message: err.message || 'Failed to purge team uploads.', type: 'error' });
    }
  };

  const getTeamIcon = (name) => {
    const safeName = (name || '').toLowerCase();
    if (safeName.includes('cloud')) return <Cloud className="w-7 h-7 text-blue-600" />;
    if (safeName.includes('node')) return <Code className="w-7 h-7 text-emerald-600" />;
    if (safeName.includes('python')) return <Terminal className="w-7 h-7 text-amber-600" />;
    if (safeName.includes('salesforce')) return <Database className="w-7 h-7 text-purple-600" />;
    return <FolderKanban className="w-7 h-7 text-brand-olive" />;
  };

  const toggleExpandTeam = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const isTeamActive = (team) => {
    if (team.students && team.students.length > 0) {
      return team.students.some(s => s.active !== false);
    }
    return team.studentCount > 0;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white border border-brand-sand/60 rounded-3xl p-6"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white border border-rose-200 rounded-3xl space-y-3 shadow-sm select-none">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-rose-800">Teams Loading Error</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchTeams}
          className="px-4 py-2 bg-brand-olive text-white text-xs font-semibold rounded-xl hover:bg-brand-olive-dark transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const safeTeams = Array.isArray(teams) ? teams : [];

  // Filter & Sort Teams List
  const filteredTeams = safeTeams
    .filter(team => {
      const matchesSearch = (team.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const active = isTeamActive(team);
      const matchesStatus = statusFilter === 'All' || 
                            (statusFilter === 'Active' && active) || 
                            (statusFilter === 'Inactive' && !active);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'students-desc') {
        return (b.studentCount || 0) - (a.studentCount || 0);
      }
      if (sortBy === 'students-asc') {
        return (a.studentCount || 0) - (b.studentCount || 0);
      }
      if (sortBy === 'uploads-desc') {
        return (b.totalUploads || 0) - (a.totalUploads || 0);
      }
      if (sortBy === 'uploads-asc') {
        return (a.totalUploads || 0) - (b.totalUploads || 0);
      }
      if (sortBy === 'storage-desc') {
        return (b.storageUsed || 0) - (a.storageUsed || 0);
      }
      if (sortBy === 'storage-asc') {
        return (a.storageUsed || 0) - (b.storageUsed || 0);
      }
      if (sortBy === 'activity-desc') {
        const dateA = a.latestUpload ? new Date(a.latestUpload).getTime() : 0;
        const dateB = b.latestUpload ? new Date(b.latestUpload).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredTeams.length / pageSize) || 1;
  const paginatedTeams = filteredTeams.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-brand-charcoal">Monitored Teams</h2>
          <p className="text-xs text-gray-500 font-medium">Real-time database statistics and roster drilldown across student teams.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-olive/10 text-brand-olive border border-brand-olive/20">
            Total Teams: {safeTeams.length}
          </span>
        </div>
      </div>

      {/* Filter and Control Panel */}
      <div className="bg-white border border-brand-sand/70 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teams by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-brand-cream/40 border border-brand-sand/80 rounded-2xl text-xs text-brand-charcoal font-medium focus:outline-none focus:border-brand-olive transition-colors"
            />
          </div>

          {/* Sort & Filter Selectors */}
          <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
            <div className="flex-1 md:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full bg-brand-cream/40 border border-brand-sand/70 rounded-xl px-3 py-2 text-xs font-semibold text-brand-charcoal focus:outline-none focus:border-brand-olive cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Teams</option>
                <option value="Inactive">Inactive Teams</option>
              </select>
            </div>

            <div className="flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full bg-brand-cream/40 border border-brand-sand/70 rounded-xl px-3 py-2 text-xs font-semibold text-brand-charcoal focus:outline-none focus:border-brand-olive cursor-pointer"
              >
                <option value="name-asc">Team Name (A-Z)</option>
                <option value="name-desc">Team Name (Z-A)</option>
                <option value="students-desc">Students (High-Low)</option>
                <option value="students-asc">Students (Low-High)</option>
                <option value="uploads-desc">Upload Count (High-Low)</option>
                <option value="uploads-asc">Upload Count (Low-High)</option>
                <option value="storage-desc">Storage Used (High-Low)</option>
                <option value="storage-asc">Storage Used (Low-High)</option>
                <option value="activity-desc">Latest Activity (Newest First)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      {paginatedTeams.length === 0 ? (
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-16 text-center text-gray-400 font-medium space-y-2">
          <FolderKanban className="w-12 h-12 mx-auto text-brand-sage mb-2" />
          <p className="font-serif font-bold text-base text-brand-charcoal">No teams match your criteria.</p>
          <p className="text-xs text-gray-400">Try modifying your search or filter settings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedTeams.map((team) => {
            const teamId = team.id || team.name;
            const isExpanded = expandedTeamId === teamId;
            const active = isTeamActive(team);
            const totalStudents = team.studentCount || (team.students ? team.students.length : 0);
            const uploadedStudents = typeof team.studentsUploadedCount === 'number'
              ? team.studentsUploadedCount
              : (team.students || []).filter(s => (s.totalUploads || (s.uploadedFilesCount + s.uploadedVideosCount) || 0) > 0).length;
            const pendingStudents = Math.max(0, totalStudents - uploadedStudents);

            return (
              <div 
                key={teamId}
                className="bg-white border border-brand-sand/70 rounded-3xl overflow-hidden shadow-sm transition-all duration-200 hover:border-brand-sand"
              >
                {/* Team Card Header */}
                <div 
                  onClick={() => toggleExpandTeam(teamId)}
                  className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-cream/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3.5 bg-brand-cream border border-brand-sand/60 rounded-2xl shrink-0">
                      {getTeamIcon(team.name)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-xl text-brand-charcoal">{team.name} Team</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-olive/10 text-brand-olive border border-brand-olive/20">
                          {totalStudents} Students
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-2">
                        <span>Storage: <strong className="text-brand-charcoal">{formatSize(team.storageUsed)}</strong></span>
                        <span>•</span>
                        <span>Uploads: <strong className="text-brand-olive">{team.totalUploads || 0} files</strong></span>
                        <span>•</span>
                        <span>Uploaded: <strong className="text-emerald-700">{uploadedStudents}/{totalStudents} students</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                    <div className="text-right text-xs text-gray-400 font-medium hidden lg:block space-y-0.5">
                      <div className="flex items-center space-x-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-brand-olive" />
                        <span>Latest: {team.latestUpload ? formatDate(team.latestUpload) : 'No uploads yet'}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handlePurgeTeamUploads(team.name, e)}
                      className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                      title={`Purge all uploads for ${team.name} Team`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button className="p-2 rounded-xl bg-brand-cream border border-brand-sand/70 text-brand-charcoal hover:bg-brand-sand/50 transition-colors cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-brand-sand/60 bg-brand-cream/20 p-6 space-y-6">
                    {/* Team Summary KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white border border-brand-sand/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-brand-charcoal">{totalStudents}</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          <span className="text-emerald-600 font-bold">{uploadedStudents} uploaded</span> • <span className="text-amber-600 font-bold">{pendingStudents} pending</span>
                        </p>
                      </div>

                      <div className="bg-white border border-brand-sand/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Uploads</span>
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-brand-charcoal">{team.totalUploads || 0}</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          {team.uploadedFilesCount || 0} files, {team.folderCount || 0} folders, {team.uploadedVideosCount || 0} videos
                        </p>
                      </div>

                      <div className="bg-white border border-brand-sand/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Storage</span>
                          <HardDrive className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-brand-charcoal">{formatSize(team.storageUsed)}</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Total team storage consumed</p>
                      </div>

                      <div className="bg-white border border-brand-sand/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Latest Activity</span>
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <h4 className="font-serif font-bold text-xs text-brand-charcoal leading-snug">
                          {team.latestUpload ? formatDate(team.latestUpload) : 'No uploads yet'}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Most recent submission date</p>
                      </div>
                    </div>

                    {/* Student Roster Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                          Students Roster ({totalStudents})
                        </h4>
                        <span className="text-[11px] text-gray-400 font-medium">Click History to view student's files</span>
                      </div>

                      {team.students && team.students.length > 0 ? (
                        <div className="bg-white border border-brand-sand/70 rounded-2xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-brand-sand/50 bg-brand-cream/40 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  <th className="py-3 px-4">Student Name</th>
                                  <th className="py-3 px-4">Email</th>
                                  <th className="py-3 px-4 text-center">Uploads</th>
                                  <th className="py-3 px-4">Storage Used</th>
                                  <th className="py-3 px-4">Last Upload</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-sand/40 text-xs">
                                {team.students.map((student) => {
                                  const studUploads = student.totalUploads || ((student.uploadedFilesCount || 0) + (student.uploadedVideosCount || 0));
                                  const hasUploaded = studUploads > 0;
                                  return (
                                    <tr key={student.id || student.email} className="hover:bg-brand-cream/30 transition-colors">
                                      <td className="py-3.5 px-4 font-bold text-brand-charcoal">{student.studentName || student.name}</td>
                                      <td className="py-3.5 px-4 text-gray-500 font-medium">{student.email}</td>
                                      <td className="py-3.5 px-4 text-center font-bold text-brand-olive">{studUploads}</td>
                                      <td className="py-3.5 px-4 font-semibold text-gray-700">{formatSize(student.storageUsed)}</td>
                                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                                        {student.lastUpload ? formatDate(student.lastUpload) : 'Never'}
                                      </td>
                                      <td className="py-3.5 px-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                          hasUploaded 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                          {hasUploaded ? 'Active' : 'Pending'}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4 text-center">
                                        <Link
                                          to={`/admin/uploads?student=${encodeURIComponent(student.studentName || student.name)}`}
                                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-brand-cream hover:bg-brand-olive/10 border border-brand-sand/70 text-brand-olive text-[11px] font-bold transition-colors cursor-pointer"
                                          title="View Upload History"
                                        >
                                          <span>History</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No monitored students registered in this team.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredTeams.length > pageSize && (
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-4 flex items-center justify-between shadow-sm">
          <p className="text-xs text-gray-500 font-medium">
            Showing Page <span className="font-bold text-brand-charcoal">{page}</span> of{' '}
            <span className="font-bold text-brand-charcoal">{totalPages}</span> ({filteredTeams.length} total teams)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white border border-brand-sand/80 text-gray-600 hover:bg-brand-sand/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white border border-brand-sand/80 text-gray-600 hover:bg-brand-sand/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <SaasNotification toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
