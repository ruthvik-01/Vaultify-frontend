import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';
import { 
  Users, 
  FolderKanban, 
  HardDrive, 
  UploadCloud, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  FileText, 
  Play, 
  Trash2, 
  ArrowDownToLine, 
  User, 
  Building,
  Info,
  LogOut,
  ChevronRight
} from 'lucide-react';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMonitoringData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const res = await adminService.getMonitoringData();
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Error loading monitoring data:', err);
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData(true);
    }, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalSec, fetchMonitoringData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center bg-white border border-brand-sand/60 rounded-2xl p-5 shadow-sm">
          <div className="h-6 bg-brand-sand/50 rounded w-1/4"></div>
          <div className="h-10 bg-brand-sand/50 rounded w-48"></div>
        </div>
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-brand-sand/60 rounded-2xl p-5 flex flex-col justify-between">
              <div className="h-4 bg-brand-sand/50 rounded w-1/2"></div>
              <div className="h-8 bg-brand-sand/60 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {/* Split Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white border border-brand-sand/60 rounded-3xl"></div>
          <div className="h-96 bg-white border border-brand-sand/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center shadow-sm select-none">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-lg text-brand-charcoal mb-1">Failed to Load Monitoring</h3>
        <p className="text-sm text-red-700 font-medium mb-4">{error}</p>
        <button
          onClick={() => fetchMonitoringData()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-olive text-white font-semibold rounded-2xl shadow-md hover:bg-brand-olive-dark transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const safeData = data || {};
  const kpi = safeData.kpi || {};
  const teamsProgress = Array.isArray(safeData.teamsProgress) ? safeData.teamsProgress : [];
  const pendingStudents = Array.isArray(safeData.pendingStudents) ? safeData.pendingStudents : [];
  const studentPerformance = Array.isArray(safeData.studentPerformance) ? safeData.studentPerformance : [];
  const activityFeed = Array.isArray(safeData.activityFeed) ? safeData.activityFeed : [];
  const alerts = Array.isArray(safeData.alerts) ? safeData.alerts : [];
  const analytics = safeData.analytics || {};

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <Play className="w-4 h-4 text-emerald-600" />;
      case 'logout': return <LogOut className="w-4 h-4 text-rose-600" />;
      case 'upload': return <UploadCloud className="w-4 h-4 text-brand-olive" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'download': return <ArrowDownToLine className="w-4 h-4 text-indigo-600" />;
      case 'profile': return <User className="w-4 h-4 text-blue-600" />;
      case 'org': return <Building className="w-4 h-4 text-teal-600" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Configuration Header */}
      <div className="bg-white border border-brand-sand/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-brand-charcoal">Roster Activity Operations</h2>
          <p className="text-xs text-gray-400 font-medium">Real-time status updates from Monitored Students training teams</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 bg-brand-cream/50 px-3 py-1.5 rounded-xl border border-brand-sand/40">
            <input
              type="checkbox"
              id="autoRefreshCheck"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-brand-olive w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoRefreshCheck" className="text-xs font-bold text-brand-charcoal cursor-pointer select-none">
              Auto-Refresh
            </label>
            {autoRefresh && (
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(parseInt(e.target.value))}
                className="bg-white border border-brand-sand/60 rounded px-1.5 py-0.5 text-[10px] font-bold text-brand-charcoal cursor-pointer focus:outline-none"
              >
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            )}
          </div>

          <button
            onClick={() => fetchMonitoringData(true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-olive text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-olive-dark hover:shadow-brand-olive/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Uploaded Today', value: kpi.studentsUploadedToday, subtitle: 'monitored members', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { title: 'Pending Today', value: kpi.pendingStudentsToday, subtitle: 'awaiting uploads', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { title: "Today's Uploads", value: kpi.todayTotalUploads, subtitle: 'submissions today', icon: UploadCloud, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { title: 'Completed Teams', value: kpi.teamsCompletedToday, subtitle: '100% active roster', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { title: 'Uploaded Today (Size)', value: formatSize(kpi.totalStorageUploadedToday), subtitle: 'platform files/videos', icon: HardDrive, color: 'text-indigo-600', bg: 'bg-indigo-50/50' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-brand-sand/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-sand hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-serif font-bold text-2xl text-brand-charcoal leading-none tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-1.5 flex items-center space-x-1">
                  <span>{card.subtitle}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Progress Section */}
      <div className="bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif font-bold text-base text-brand-charcoal">Team Completion Rates</h3>
            <p className="text-[11px] text-gray-400 font-medium">Progress completion for members today</p>
          </div>
        </div>
        
        {teamsProgress.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-medium">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 text-brand-sage" />
            <p className="font-serif font-bold text-sm text-brand-charcoal">No monitored teams active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsProgress.map((team, idx) => (
              <div key={idx} className="bg-brand-cream/20 border border-brand-sand/55 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-brand-charcoal">{team.teamName} Team</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Monitored Student Group</p>
                  </div>
                  {team.completion === 100 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {team.pendingMembers} Pending
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 mt-auto">
                  <div className="flex justify-between text-[11px] font-bold text-brand-charcoal">
                    <span className="text-gray-500">Member Progress</span>
                    <span>{team.membersUploadedToday} / {team.totalMembers} uploaded</span>
                  </div>
                  
                  {/* Custom Progress Bar */}
                  <div className="w-full bg-brand-sand/40 h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${team.completion === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-brand-olive to-brand-olive-dark'}`}
                      style={{ width: `${team.completion}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>Today Submissions</span>
                    <span className={`text-xs ${team.completion === 100 ? 'text-emerald-600' : 'text-brand-olive'}`}>{team.completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Split Views: Pending List & Student Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Pending Students List */}
        <div className="bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Pending Students List</h3>
              <p className="text-[11px] text-gray-400 font-medium">Students who have not uploaded submissions today</p>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-sand/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-brand-cream/40">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Last Upload</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand/40 text-xs">
                  {pendingStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                        <p className="font-serif font-bold text-xs text-brand-charcoal">All students uploaded today!</p>
                      </td>
                    </tr>
                  ) : (
                    pendingStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-brand-charcoal">
                          <div>{student.name}</div>
                          <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{student.email}</div>
                        </td>
                        <td className="py-3 px-3 text-brand-olive font-bold">{student.team}</td>
                        <td className="py-3 px-3 text-gray-500 font-medium">
                          {student.lastUploadDate ? formatDate(student.lastUploadDate) : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            student.status === 'Never Uploaded' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : student.status === 'Inactive'
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Performance Tracker */}
        <div className="bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Student Performance Summary</h3>
              <p className="text-[11px] text-gray-400 font-medium">Live roster statistics and total storage usage</p>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-sand/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-brand-cream/40">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3 text-center">Today</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3">Storage</th>
                    <th className="py-2.5 px-3">Last Upload</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand/40 text-xs">
                  {studentPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        <Users className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
                        <p className="font-serif font-bold text-xs text-brand-charcoal">No students monitored.</p>
                      </td>
                    </tr>
                  ) : (
                    studentPerformance.map((student, idx) => (
                      <tr key={idx} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-brand-charcoal">
                          <div>{student.name}</div>
                          <div className="text-[10px] text-brand-olive font-semibold mt-0.5">{student.team}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-brand-charcoal">{student.todayCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-brand-charcoal">{student.totalCount}</td>
                        <td className="py-3 px-3 text-gray-600 font-semibold">{formatSize(student.storageUsed)}</td>
                        <td className="py-3 px-3 text-gray-500 font-medium">
                          {student.lastUploadDate ? formatDate(student.lastUploadDate) : 'Never'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            student.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : student.status === 'Inactive'
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Split Views: Activity Feed & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Live Activity Feed</h3>
              <p className="text-[11px] text-gray-400 font-medium">Real-time student actions, uploads, and session logs</p>
            </div>

            {activityFeed.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-medium">
                <Clock className="w-10 h-10 mx-auto mb-2 text-brand-sage" />
                <p className="font-serif font-bold text-xs text-brand-charcoal">No activities recorded today.</p>
              </div>
            ) : (
              <div className="relative border-l border-brand-sand/60 ml-3.5 pl-6 space-y-5 py-1">
                {activityFeed.map((activity, idx) => (
                  <div key={idx} className="relative flex items-start group">
                    {/* Activity Bullet Icon */}
                    <div className="absolute -left-[35px] w-5.5 h-5.5 rounded-full bg-brand-cream border border-brand-sand/80 flex items-center justify-center shadow-sm z-10">
                      {getActivityIcon(activity.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0 bg-brand-cream/15 p-3 rounded-xl border border-brand-sand/40 hover:bg-brand-cream/25 hover:border-brand-sand/60 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold text-brand-charcoal truncate">
                          {activity.description}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium shrink-0 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatDate(activity.timestamp)}</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-olive font-bold mt-1 uppercase tracking-wider flex items-center space-x-1">
                        <span>{activity.studentName}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operational Alerts & Quotas */}
        <div className="bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="font-serif font-bold text-base text-brand-charcoal">Operations Alerts</h3>
              <p className="text-[11px] text-gray-400 font-medium">Automated system warnings and student progress flags</p>
            </div>

            {alerts.length === 0 ? (
              <div className="py-16 text-center text-gray-450 font-medium">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-serif font-bold text-xs text-brand-charcoal">System operating normally. No alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border text-xs font-semibold shadow-sm ${getAlertColor(alert.type)}`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Analytics Trends */}
      <div className="bg-white border border-brand-sand/60 rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-serif font-bold text-base text-brand-charcoal">Roster Analytics Trends</h3>
          <p className="text-[11px] text-gray-400 font-medium">Submissions aggregate history metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Uploads Today', value: analytics.uploadsToday, label: 'files + videos' },
            { title: 'Uploads This Week', value: analytics.uploadsThisWeek, label: 'past 7 days activity' },
            { title: 'Uploads This Month', value: analytics.uploadsThisMonth, label: 'month-to-date total' },
            { title: 'Total Submissions', value: analytics.totalUploads, label: 'all-time active uploads' },
            { title: 'Average Upload Size', value: formatSize(analytics.averageUploadSize), label: 'aggregated size average' },
            { title: 'Storage Today', value: formatSize(analytics.storageUploadedToday), label: 'total storage pushed today' }
          ].map((item, idx) => (
            <div key={idx} className="bg-brand-cream/10 border border-brand-sand/50 rounded-2xl p-5 flex flex-col justify-between hover:bg-brand-cream/20 hover:border-brand-sand/70 transition-all">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</span>
              <div className="mt-3">
                <h4 className="font-serif font-bold text-xl text-brand-charcoal">{item.value}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
