import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import { 
  User, Bell, Palette, CreditCard, Save, ShieldCheck, 
  Sparkles, CheckCircle2, Monitor, GraduationCap 
} from 'lucide-react';

export default function Settings() {
  const { user, notifications, updateProfile, updateNotifications } = useFiles();
  const [activeSubTab, setActiveSubTab] = useState('account'); // account | notifications | preferences | plan

  // Account Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [studentId, setStudentId] = useState(user.studentId);
  const [university, setUniversity] = useState(user.university);
  
  // Notification states
  const [emailOnShare, setEmailOnShare] = useState(notifications.emailOnShare);
  const [emailOnDownload, setEmailOnDownload] = useState(notifications.emailOnDownload);
  const [placementAlerts, setPlacementAlerts] = useState(notifications.placementAlerts);
  const [weeklyReport, setWeeklyReport] = useState(notifications.weeklyReport);

  // Preference states
  const [defaultView, setDefaultView] = useState('grid');
  const [themeMode, setThemeMode] = useState('beige');

  const handleAccountSave = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      studentId,
      university
    });
    alert('Account details updated successfully!');
  };

  const handleNotificationSave = () => {
    updateNotifications({
      emailOnShare,
      emailOnDownload,
      placementAlerts,
      weeklyReport
    });
    alert('Notification settings updated!');
  };

  return (
    <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
      
      {/* Settings Navigation Column */}
      <div className="w-full md:w-64 bg-brand-cream border-r border-brand-sand/70 p-4 space-y-1 shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block px-3 mb-3">Locker Settings</span>
        
        <button
          onClick={() => setActiveSubTab('account')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'account'
              ? 'bg-brand-olive text-white'
              : 'text-gray-600 hover:bg-brand-sand/50 hover:text-brand-charcoal'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Credentials</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-brand-olive text-white'
              : 'text-gray-600 hover:bg-brand-sand/50 hover:text-brand-charcoal'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'preferences'
              ? 'bg-brand-olive text-white'
              : 'text-gray-600 hover:bg-brand-sand/50 hover:text-brand-charcoal'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Display & Styling</span>
        </button>

        <button
          onClick={() => setActiveSubTab('plan')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'plan'
              ? 'bg-brand-olive text-white'
              : 'text-gray-600 hover:bg-brand-sand/50 hover:text-brand-charcoal'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Storage Plan Quota</span>
        </button>
      </div>

      {/* Settings Action Content Body */}
      <div className="flex-1 p-6 sm:p-8">
        
        {/* Sub-tab: Account details form */}
        {activeSubTab === 'account' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">Account Credentials</h3>
              <p className="text-xs text-gray-500 mt-1">Configure your personal credentials and academic registry references.</p>
            </div>

            <form onSubmit={handleAccountSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer pt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Credentials</span>
              </button>
            </form>
          </div>
        )}

        {/* Sub-tab: Notification settings */}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">Notification Preferences</h3>
              <p className="text-xs text-gray-500 mt-1">Select what actions send mock email notifications to your inbox.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Email on Share Actions</span>
                  <span className="text-[10px] text-gray-400">Receive alert when you grant recruiters permission to check credentials.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOnShare}
                  onChange={(e) => setEmailOnShare(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-olive focus:ring-brand-olive border-brand-sand"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Email on Downloads</span>
                  <span className="text-[10px] text-gray-400">Get notified immediately when your shared resume is downloaded.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOnDownload}
                  onChange={(e) => setEmailOnDownload(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-olive focus:ring-brand-olive border-brand-sand"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Placement Office Alerts</span>
                  <span className="text-[10px] text-gray-400">Receive notifications on capstone criteria and mock interviews scheduling.</span>
                </div>
                <input
                  type="checkbox"
                  checked={placementAlerts}
                  onChange={(e) => setPlacementAlerts(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-olive focus:ring-brand-olive border-brand-sand"
                />
              </div>

              <button
                type="button"
                onClick={handleNotificationSave}
                className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer pt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Rules</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-tab: Preferences */}
        {activeSubTab === 'preferences' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">Display & Styling</h3>
              <p className="text-xs text-gray-500 mt-1">Customize your StudentVault look and feel preferences.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                  Default Locker Layout
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDefaultView('grid')}
                    className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      defaultView === 'grid'
                        ? 'border-brand-olive bg-brand-sage-light/20 text-brand-olive-dark'
                        : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                    }`}
                  >
                    Card Grid View
                  </button>
                  <button
                    onClick={() => setDefaultView('list')}
                    className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      defaultView === 'list'
                        ? 'border-brand-olive bg-brand-sage-light/20 text-brand-olive-dark'
                        : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                    }`}
                  >
                    Table List View
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                  Locker Style Palette
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setThemeMode('beige')}
                    className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      themeMode === 'beige'
                        ? 'border-brand-olive bg-brand-sage-light/20 text-brand-olive-dark'
                        : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                    }`}
                  >
                    Organic Sage & Cream
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('charcoal');
                      alert('Theme changes apply custom root classes. Slate/Dark Mode represents an expansion feature!');
                    }}
                    className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      themeMode === 'charcoal'
                        ? 'border-brand-olive bg-brand-sage-light/20 text-brand-olive-dark'
                        : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                    }`}
                  >
                    High-Contrast Slate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab: Storage pricing tier */}
        {activeSubTab === 'plan' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">Storage Plan Quota</h3>
              <p className="text-xs text-gray-500 mt-1">Review your allocation stats and upgrade details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current allocation stats */}
              <div className="border border-brand-sand rounded-2xl p-5 bg-brand-cream/40 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Current Plan</span>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl font-bold text-brand-charcoal">Free Scholar Locker</span>
                  <span className="bg-brand-sage-light/30 text-brand-olive px-2.5 py-0.5 rounded text-[10px] font-bold border border-brand-sage-light/20">
                    Active Free Tier
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Allowed Quota Limit: 10 GB SSD space</p>
                  <p>• Verification Badges: Included</p>
                  <p>• Document sharing permission control</p>
                </div>
              </div>

              {/* Upgrade option preview */}
              <div className="border border-amber-200 bg-amber-50/10 rounded-2xl p-5 relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full" />
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Pro upgrade
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-brand-charcoal">Expand to 100 GB Locker</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Enable direct download analytics and custom placement links.</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Stripe Checkout checkout.studentvault.co launched in demo mode.')}
                  className="w-full bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Request Upgrade ($2.99/mo)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
