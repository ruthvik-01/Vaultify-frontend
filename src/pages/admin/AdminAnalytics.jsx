import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  UploadCloud, 
  HardDrive, 
  Users, 
  FolderKanban, 
  PieChart, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Award
} from 'lucide-react';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('day'); // 'day', 'week', 'month'

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAnalytics();
      if (res && res.success && res.analytics) {
        setData(res.analytics);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to fetch analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-brand-sand/60 rounded-2xl p-5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-brand-sand/60 rounded-3xl"></div>
          <div className="h-80 bg-white border border-brand-sand/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-3 shadow-sm select-none">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-rose-800">Failed to Load System Analytics</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-brand-olive text-white text-xs font-semibold rounded-xl hover:bg-brand-olive-dark transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const safe = data || {};
  const uploadsPerDay = Array.isArray(safe.uploadsPerDay) ? safe.uploadsPerDay : [];
  const uploadsPerWeek = Array.isArray(safe.uploadsPerWeek) ? safe.uploadsPerWeek : [];
  const uploadsPerMonth = Array.isArray(safe.uploadsPerMonth) ? safe.uploadsPerMonth : [];
  const uploadsPerTeam = Array.isArray(safe.uploadsPerTeam) ? safe.uploadsPerTeam : [];
  const storagePerTeam = Array.isArray(safe.storagePerTeam) ? safe.storagePerTeam : [];
  const topStudents = Array.isArray(safe.topStudents || safe.mostActiveStudents) ? (safe.topStudents || safe.mostActiveStudents) : [];
  const largestUploads = Array.isArray(safe.largestUploads) ? safe.largestUploads : [];
  const fileTypeDist = Array.isArray(safe.fileTypeDistribution) ? safe.fileTypeDistribution : [];
  const uploadTrend = typeof safe.uploadTrend === 'number' ? safe.uploadTrend : 0;
  const avgSize = safe.averageUploadSize || 0;

  const chartData = timeframe === 'day' ? uploadsPerDay : timeframe === 'week' ? uploadsPerWeek : uploadsPerMonth;
  const labelKey = timeframe === 'day' ? 'day' : timeframe === 'week' ? 'week' : 'month';
  const maxUploadCount = Math.max(1, ...chartData.map(item => item.uploads || 0));

  const totalTypeCount = fileTypeDist.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-brand-charcoal">System Analytics & Insight</h2>
          <p className="text-xs text-gray-500 font-medium">Live metric aggregated performance metrics across teams and students.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 bg-white border border-brand-sand rounded-xl text-xs font-semibold text-gray-700 hover:bg-brand-sand/40 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-olive" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-sand/70 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Weekly Upload Trend</p>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-2xl text-brand-charcoal">
                {uploadTrend > 0 ? `+${uploadTrend}%` : `${uploadTrend}%`}
              </h3>
              {uploadTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-sand/70 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Average Upload Size</p>
            <h3 className="font-serif font-bold text-2xl text-brand-charcoal">{formatSize(avgSize)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-sand/70 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Monitored Teams</p>
            <h3 className="font-serif font-bold text-2xl text-brand-charcoal">{uploadsPerTeam.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-sand/70 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Top Active Student</p>
            <h3 className="font-serif font-bold text-base text-brand-charcoal truncate max-w-[140px]">
              {topStudents[0]?.name || topStudents[0]?.student || 'No Activity'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Chart Section: Upload Activity Over Time */}
      <div className="bg-white border border-brand-sand/70 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-brand-charcoal">Upload Activity Timeline</h3>
            <p className="text-xs text-gray-400 font-medium">Real submission frequency trends over selected interval</p>
          </div>
          <div className="flex items-center space-x-1 bg-brand-cream/60 p-1 rounded-xl border border-brand-sand/60">
            {['day', 'week', 'month'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                  timeframe === t ? 'bg-brand-olive text-white shadow-sm' : 'text-gray-500 hover:text-brand-charcoal'
                }`}
              >
                {t === 'day' ? 'Daily (7 Days)' : t === 'week' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        {chartData.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-brand-sage" />
            <p className="font-serif font-bold text-sm text-brand-charcoal">No submission history found.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-7 gap-3 items-end h-48 px-2 border-b border-brand-sand/60 pb-3">
              {chartData.map((item, idx) => {
                const heightPercent = Math.round(((item.uploads || 0) / maxUploadCount) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-brand-olive mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.uploads}
                    </span>
                    <div 
                      className="w-full max-w-[42px] bg-gradient-to-t from-brand-olive to-brand-olive-dark rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    ></div>
                    <span className="text-[11px] font-semibold text-gray-500 mt-2 truncate w-full text-center">
                      {item[labelKey]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Split Grid: Team Breakdown & File Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads per Team */}
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Submissions per Team</h3>
          {uploadsPerTeam.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">
              <FolderKanban className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
              <p className="text-xs font-bold text-brand-charcoal">No team data registered.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadsPerTeam.map((teamItem, idx) => {
                const totalTeamUploads = uploadsPerTeam.reduce((sum, t) => sum + (t.uploads || 0), 0);
                const percent = totalTeamUploads > 0 ? Math.round(((teamItem.uploads || 0) / totalTeamUploads) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-brand-charcoal">
                      <span>{teamItem.team || 'General'}</span>
                      <span className="text-gray-500">{teamItem.uploads} uploads ({percent}%)</span>
                    </div>
                    <div className="w-full bg-brand-sand/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-olive h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* File Type Distribution */}
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-charcoal">File Type Distribution</h3>
          {fileTypeDist.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">
              <PieChart className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
              <p className="text-xs font-bold text-brand-charcoal">No file types detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fileTypeDist.map((item, idx) => {
                const percent = totalTypeCount > 0 ? Math.round(((item.count || 0) / totalTypeCount) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-brand-charcoal">
                      <span className="capitalize">{item.type}</span>
                      <span className="text-gray-500">{item.count} items ({percent}%)</span>
                    </div>
                    <div className="w-full bg-brand-sand/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Split Grid: Top Active Students & Largest Uploads */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Most Active Students Leaderboard */}
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Most Active Monitored Students</h3>
          {topStudents.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">
              <Users className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
              <p className="text-xs font-bold text-brand-charcoal">No student activity logged.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-sand/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3 text-center">Uploads</th>
                    <th className="py-2.5 px-3">Storage Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand/40 text-xs font-medium">
                  {topStudents.map((st, i) => (
                    <tr key={i} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-brand-charcoal">{st.name || st.studentName || st.student}</td>
                      <td className="py-3 px-3 text-brand-olive font-semibold">{st.team || 'General'}</td>
                      <td className="py-3 px-3 text-center font-bold text-brand-charcoal">{st.uploads || 0}</td>
                      <td className="py-3 px-3 text-gray-600">{formatSize(st.storageUsed || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Largest Uploads Table */}
        <div className="bg-white border border-brand-sand/70 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Largest System Uploads</h3>
          {largestUploads.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">
              <HardDrive className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
              <p className="text-xs font-bold text-brand-charcoal">No uploaded files recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-sand/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Uploaded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand/40 text-xs font-medium">
                  {largestUploads.map((f, i) => (
                    <tr key={i} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-brand-charcoal max-w-[160px] truncate">{f.fileName}</td>
                      <td className="py-3 px-3 text-gray-600">{f.student}</td>
                      <td className="py-3 px-3 font-semibold text-brand-charcoal">{formatSize(f.size)}</td>
                      <td className="py-3 px-3 text-gray-500">{formatDate(f.uploadDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
