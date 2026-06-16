import React, { useState, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import { 
  User, Bell, Palette, CreditCard, Save, ShieldCheck, 
  Sparkles, CheckCircle2, Monitor, GraduationCap, Moon, Sun, Type
} from 'lucide-react';

export default function Settings() {
  const { user, notifications, updateProfile, updateNotifications } = useFiles();
  const [activeSubTab, setActiveSubTab] = useState('account'); // account | notifications | preferences | plan

  // Account Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [university, setUniversity] = useState(user.university);
  
  // Notification states
  const [emailOnShare, setEmailOnShare] = useState(notifications.emailOnShare);
  const [emailOnDownload, setEmailOnDownload] = useState(notifications.emailOnDownload);
  const [placementAlerts, setPlacementAlerts] = useState(notifications.placementAlerts);
  const [weeklyReport, setWeeklyReport] = useState(notifications.weeklyReport);

  // Preference / Styling states (initialized from active user settings)
  const [themeColor, setThemeColor] = useState(user.theme_color || 'grid');
  const [darkMode, setDarkMode] = useState(user.dark_mode !== undefined ? parseInt(user.dark_mode, 10) : 0);
  const [sidebarColor, setSidebarColor] = useState(user.sidebar_color || 'expanded');
  const [accentColor, setAccentColor] = useState(user.accent_color || 'blue');
  const [fontSize, setFontSize] = useState(user.font_size || 'medium');

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setUniversity(user.university || '');
    setThemeColor(user.theme_color || 'grid');
    setDarkMode(user.dark_mode !== undefined ? parseInt(user.dark_mode, 10) : 0);
    setSidebarColor(user.sidebar_color || 'expanded');
    setAccentColor(user.accent_color || 'blue');
    setFontSize(user.font_size || 'medium');
  }, [user]);

  const handleAccountSave = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      university
    }).then(() => {
      alert('Account credentials saved successfully!');
    }).catch(err => {
      alert('Failed to save credentials: ' + err.message);
    });
  };

  const handleNotificationSave = () => {
    updateNotifications({
      emailOnShare,
      emailOnDownload,
      placementAlerts,
      weeklyReport
    });
    alert('Notification rules updated successfully!');
  };

  const handlePreferencesSave = () => {
    updateProfile({
      theme_color: themeColor,
      dark_mode: darkMode,
      sidebar_color: sidebarColor,
      accent_color: accentColor,
      font_size: fontSize
    }).then(() => {
      alert('Custom styling preferences saved and applied successfully!');
    }).catch(err => {
      alert('Failed to save preferences: ' + err.message);
    });
  };

  const handleUpgradePlan = (planName) => {
    updateProfile({
      storage_plan: planName === 'pro' ? 'pro' : 'free'
    }).then(() => {
      alert(`Successfully configured account storage allocation plan to ${planName.toUpperCase()}!`);
    }).catch(err => {
      alert('Plan update failed: ' + err.message);
    });
  };

  return (
    <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[550px]">
      
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
              <p className="text-xs text-gray-500 mt-1">Configure your personal credentials and locker registries.</p>
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

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                  Organization / University
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
              <p className="text-xs text-gray-500 mt-1">Select what actions send email notifications to your inbox.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Email on Share Actions</span>
                  <span className="text-[10px] text-gray-400">Receive alert when you grant recipients permission to check credentials.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOnShare}
                  onChange={(e) => setEmailOnShare(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-olive focus:ring-brand-olive border-brand-sand"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Email on Downloads</span>
                  <span className="text-[10px] text-gray-400">Get notified immediately when your shared locker links are downloaded.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOnDownload}
                  onChange={(e) => setEmailOnDownload(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-olive focus:ring-brand-olive border-brand-sand"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-brand-cream rounded-xl border border-brand-sand/65">
                <div>
                  <span className="text-xs font-bold text-brand-charcoal block">Weekly Logs summary</span>
                  <span className="text-[10px] text-gray-400">Receive an activity report summarizing access frequencies.</span>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
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
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">Display & Styling</h3>
              <p className="text-xs text-gray-500 mt-1">Customize your Vaultify workspace looks, themes, and layouts.</p>
            </div>

            <div className="space-y-5">
              
              {/* Display View Preference */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Display View Layout
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    { id: 'grid', name: 'Card View' },
                    { id: 'list', name: 'List View' }
                  ].map((viewOpt) => (
                    <button
                      key={viewOpt.id}
                      type="button"
                      onClick={() => setThemeColor(viewOpt.id)}
                      className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        themeColor === viewOpt.id
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive'
                          : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                      }`}
                    >
                      {viewOpt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Options */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Theme Options
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { id: 0, name: 'Light Mode', icon: Sun, iconColor: 'text-amber-500' },
                    { id: 1, name: 'Dark Mode', icon: Moon, iconColor: 'text-indigo-400' },
                    { id: 2, name: 'System Mode', icon: Monitor, iconColor: 'text-gray-500' }
                  ].map((themeOpt) => {
                    const Icon = themeOpt.icon;
                    return (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => setDarkMode(themeOpt.id)}
                        className={`flex flex-col items-center justify-center p-3 border rounded-xl text-xs font-bold transition-all cursor-pointer space-y-1.5 ${
                          darkMode === themeOpt.id
                            ? 'border-brand-olive bg-brand-olive/10 text-brand-olive'
                            : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${themeOpt.iconColor}`} />
                        <span>{themeOpt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Customization */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Sidebar Customization
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    { id: 'compact', name: 'Compact Sidebar' },
                    { id: 'expanded', name: 'Expanded Sidebar' }
                  ].map((sidebarOpt) => (
                    <button
                      key={sidebarOpt.id}
                      type="button"
                      onClick={() => setSidebarColor(sidebarOpt.id)}
                      className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        sidebarColor === sidebarOpt.id
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive'
                          : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                      }`}
                    >
                      {sidebarOpt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
                    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
                    { id: 'green', name: 'Green', color: 'bg-green-500' },
                    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
                    { id: 'red', name: 'Red', color: 'bg-red-500' }
                  ].map((accentOpt) => (
                    <button
                      key={accentOpt.id}
                      type="button"
                      onClick={() => setAccentColor(accentOpt.id)}
                      className={`flex items-center space-x-2 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        accentColor === accentOpt.id
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive'
                          : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${accentOpt.color}`} />
                      <span>{accentOpt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {[
                    { id: 'small', name: 'Small' },
                    { id: 'medium', name: 'Medium' },
                    { id: 'large', name: 'Large' }
                  ].map((fontOpt) => (
                    <button
                      key={fontOpt.id}
                      type="button"
                      onClick={() => setFontSize(fontOpt.id)}
                      className={`p-2.5 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        fontSize === fontOpt.id
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive'
                          : 'border-brand-sand text-gray-500 hover:bg-brand-cream'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5 text-gray-400" />
                      <span>{fontOpt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePreferencesSave}
                className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer pt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>

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
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Current Allocation</span>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl font-bold text-brand-charcoal">
                    {user.storage_plan === 'pro' ? 'Pro Scholar Vault' : 'Free Scholar Vault'}
                  </span>
                  <span className="bg-brand-sage-light/35 text-brand-olive px-2.5 py-0.5 rounded text-[10px] font-bold border border-brand-sage-light/20">
                    Active Plan
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1.5">
                  <p>• Allowed Space Quota: {user.storage_plan === 'pro' ? '1 TB' : '100 GB'} SSD space</p>
                  <p>• Verification Badges: Included</p>
                  <p>• Access Control Settings: Allowed</p>
                </div>

                {user.storage_plan === 'pro' && (
                  <button
                    onClick={() => handleUpgradePlan('free')}
                    className="w-full mt-2 text-[10px] bg-brand-cream border border-brand-sand hover:bg-brand-sand text-brand-charcoal font-semibold py-1.5 rounded-lg text-center transition-all cursor-pointer"
                  >
                    Downgrade back to Free Tier (100 GB)
                  </button>
                )}
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
                  <h4 className="font-serif text-lg font-bold text-brand-charcoal">Expand to 1 TB Secure Locker</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-sans">Enable detailed download analytics and unlimited shared credential nodes.</p>
                </div>
                
                {user.storage_plan === 'pro' ? (
                  <div className="w-full text-center text-xs py-2 text-brand-olive font-semibold bg-brand-sage-light/25 border border-brand-sage-light/30 rounded-xl">
                    You are already using this plan!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgradePlan('pro')}
                    className="w-full bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Activate 1 TB Plan ($2.99/mo)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
