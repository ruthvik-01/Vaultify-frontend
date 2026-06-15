import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderLock, Shield, Award, FolderGit, Search, Share2, 
  ArrowRight, FileText, CheckCircle2, Star, Sparkles, HardDrive, 
  HelpCircle, Globe, ChevronRight, Zap, GraduationCap, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Brand Icon component using simple SVG
const BrandIcon = ({ className }) => (
  <div className={`bg-brand-olive text-white p-2 rounded-xl flex items-center justify-center shrink-0 ${className}`}>
    <FolderLock className="w-5 h-5" />
  </div>
);

export default function Landing() {
  
  // Custom mock brand icons
  const universities = [
    { name: 'State Tech Institute', icon: GraduationCap },
    { name: 'National Science Univ', icon: Globe },
    { name: 'City Academic College', icon: Shield },
    { name: 'Global Tech Board', icon: Zap }
  ];

  const features = [
    {
      title: 'Secure Cloud Locker',
      desc: '100% student-encrypted sandboxed storage. Your files are isolated and guarded by campus security keys.',
      icon: Shield,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Resume & CV Vault',
      desc: 'Keep multiple revisions of your CV organized. Track downloader stats to know exactly when recruiters read them.',
      icon: FileText,
      color: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    {
      title: 'Certificate Verifier',
      desc: 'Store verified badges from AWS, Google, and Coursera. Includes metadata ID lookups so recruiters prove authenticity.',
      icon: Award,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'Project Showcase',
      desc: 'Link source repositories directly to your zip codes. Display live demo urls alongside your developer timeline.',
      icon: FolderGit,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      title: 'Global Omnibar Search',
      desc: 'Find any note, resume version, or placement handbook instantly with a single keystroke shortcut (Ctrl+K).',
      icon: Search,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    {
      title: 'Secret Share Links',
      desc: 'Generate temporary share links for placement drives. Revoke email permissions instantly from your dashboard.',
      icon: Share2,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    }
  ];

  const steps = [
    { step: '01', title: 'Upload Carrier Files', desc: 'Drag-and-drop resumes, zip files, certificates, or study notes.' },
    { step: '02', title: 'Organize in Drawers', desc: 'Categorize files and tag them by course, placement drive, or skill.' },
    { step: '03', title: 'Create Verify Links', desc: 'Add credentials verification IDs and generate secure sharing links.' },
    { step: '04', title: 'Get Placed', desc: 'Share your unified student showcase with placement offices and recruiters.' }
  ];

  const benefits = [
    { title: 'Save Time', desc: 'Stop digging through emails or desktop folders during quick recruiter applications. Keep everything one click away.' },
    { title: 'Stay Organized', desc: 'Separate draft resumes, placement worksheets, verified credentials, and lecture briefs into clean, indexed vaults.' },
    { title: 'Placement Ready', desc: 'Stand out from standard applicants with a clean public student portfolio verifying your credentials.' }
  ];

  const metrics = [
    { val: '1.2M+', label: 'Files Safely Stored' },
    { val: '45k+', label: 'Projects Showcased' },
    { val: '88k+', label: 'Certificates Verified' }
  ];

  const testimonials = [
    {
      quote: "StudentVault completely transformed how I handled my senior placement. Being able to share a single link containing my certified AWS badge, resume, and React source code was a game-changer.",
      author: "Rahul Mehta",
      role: "CS Graduate, State Tech",
      dest: "Software Engineer at Google"
    },
    {
      quote: "No more messy Google Drive links with broken permissions. StudentVault lets our graduates manage credential sharing with recruiters securely and professionally.",
      author: "Dr. Clara Thorne",
      role: "Director of Placement Cells",
      dest: "National Science University"
    }
  ];

  return (
    <div className="bg-brand-cream min-h-screen relative font-sansSelection">
      
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-brand-sand/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandIcon />
            <span className="font-serif text-lg font-bold tracking-tight text-brand-charcoal">StudentVault</span>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex space-x-8 text-xs font-semibold text-gray-500">
            <a href="#features" className="hover:text-brand-olive transition-all">Features</a>
            <a href="#how-it-works" className="hover:text-brand-olive transition-all">How It Works</a>
            <a href="#benefits" className="hover:text-brand-olive transition-all">Benefits</a>
            <a href="#pricing" className="hover:text-brand-olive transition-all">Pricing</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-xs font-semibold text-gray-600 hover:text-brand-charcoal transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16 text-center space-y-8">
        <motion.div 
          className="max-w-3xl mx-auto space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] uppercase tracking-widest text-brand-olive bg-brand-sage-light/25 border border-brand-sage-light/40 px-3.5 py-1.5 rounded-full font-bold inline-block">
            Secure Cloud Vault for Academia
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-brand-charcoal leading-tight">
            Your career credentials.<br />In one secure locker.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-sans max-w-xl mx-auto">
            Designed specifically for student recruitment. Store verified resumes, capstone codes, and college certificates. Share links instantly with hiring cells.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-brand-olive hover:bg-brand-olive-dark text-white px-6 py-3 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Start Your Free Locker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto bg-white border border-brand-sand hover:bg-brand-cream text-brand-charcoal px-6 py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Explore Dashboard Demo
          </Link>
        </motion.div>

        {/* Hero Interactive Dashboard Mockup Showcase */}
        <motion.div
          className="max-w-4xl mx-auto bg-white border border-brand-sand/80 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden mt-12"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
        >
          {/* Mock Browser Header */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-sand mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <span className="text-[10px] text-gray-400 font-mono">studentvault.co/vrajraju/showcase</span>
            <div className="w-16" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Mock Sidebar Stats */}
            <div className="border border-brand-sand rounded-2xl p-4 bg-brand-cream/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-gray-400">Vault Capacity</span>
                <span className="text-[9px] text-brand-olive bg-brand-sage-light/20 px-2 py-0.5 rounded-full font-bold">Pro Scholar</span>
              </div>
              <div className="w-full bg-brand-cream-dark h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-olive h-full w-[24%]" />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                <span>2.4 GB Used</span>
                <span>10 GB Max</span>
              </div>

              {/* Stacked details */}
              <div className="space-y-2 pt-2 border-t border-brand-sand text-[10px] text-gray-600">
                <div className="flex justify-between">
                  <span>Resumes</span>
                  <span className="font-mono font-bold">1.2 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects</span>
                  <span className="font-mono font-bold">37.0 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificates</span>
                  <span className="font-mono font-bold">4.6 MB</span>
                </div>
              </div>
            </div>

            {/* Mock Files grid */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[9px] uppercase font-bold text-gray-400 block">Featured Placement Credentials</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mock Card 1 */}
                <div className="bg-white border border-brand-sand rounded-xl p-3.5 flex items-center space-x-3 relative shadow-sm">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-charcoal block truncate">Vraj_Raju_Resume_2026.pdf</span>
                    <span className="text-[9px] text-gray-400 font-sans block mt-0.5">Resumes • Verified Main</span>
                  </div>
                  <span className="absolute top-2 right-2"><Star className="w-3.5 h-3.5 text-amber-500 fill-current" /></span>
                </div>

                {/* Mock Card 2 */}
                <div className="bg-white border border-brand-sand rounded-xl p-3.5 flex items-center space-x-3 relative shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-charcoal block truncate">AWS_Cloud_Practitioner.pdf</span>
                    <span className="text-[9px] text-gray-400 font-sans block mt-0.5">Certificates • Verified Creds</span>
                  </div>
                  <span className="absolute top-2 right-2"><Star className="w-3.5 h-3.5 text-amber-500 fill-current" /></span>
                </div>

                {/* Mock Card 3 */}
                <div className="bg-white border border-brand-sand rounded-xl p-3.5 flex items-center space-x-3 relative shadow-sm">
                  <div className="p-2 bg-brand-olive/10 text-brand-olive-dark rounded-lg">
                    <FolderGit className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-charcoal block truncate">E-Commerce_App.zip</span>
                    <span className="text-[9px] text-gray-400 font-sans block mt-0.5">Projects • Github Sync</span>
                  </div>
                  <span className="absolute top-2 right-2"><Star className="w-3.5 h-3.5 text-amber-500 fill-current" /></span>
                </div>

                {/* Mock Card 4 */}
                <div className="bg-brand-cream border border-brand-sand border-dashed rounded-xl p-3.5 flex items-center justify-center space-x-2 text-[10px] text-gray-400 hover:border-brand-olive transition-all cursor-pointer">
                  <Plus className="w-4 h-4 text-brand-olive" />
                  <span className="font-bold">Add Starred Show</span>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Trusted By Section */}
      <section className="bg-white border-y border-brand-sand/75 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Trusted by placement cells, colleges, and hiring managers
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center pt-2 max-w-4xl mx-auto">
            {universities.map((uni, idx) => {
              const Icon = uni.icon;
              return (
                <div key={idx} className="flex items-center justify-center space-x-2 text-gray-400 hover:text-brand-charcoal transition-all">
                  <Icon className="w-5 h-5 text-brand-sage" />
                  <span className="font-serif text-sm font-bold truncate">{uni.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Features Bento Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            Features engineered for student recruitment.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
            Everything you need to store, organize, verify, and share your scholastic assets professionally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-56"
              >
                <div className={`p-3 rounded-xl border w-11 h-11 flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="mt-4">
                  <h4 className="font-serif text-base font-bold text-brand-charcoal">{feat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="bg-brand-cream-dark/40 border-y border-brand-sand py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
              Simple locker setups to get hired.
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">
              Set up your public scholastic profile locker in 4 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {steps.map((item, idx) => (
              <div key={idx} className="bg-white border border-brand-sand rounded-3xl p-6 relative shadow-sm">
                <span className="font-serif text-4xl font-bold text-brand-olive/20 block mb-4">{item.step}</span>
                <h4 className="font-serif text-base font-bold text-brand-charcoal">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            Locker benefits that drive results.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-sans">
            Make document sharing clean, verified, and professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {benefits.map((item, idx) => (
            <div key={idx} className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm">
              <div className="bg-brand-sage-light/20 text-brand-olive p-2.5 rounded-xl border border-brand-sage-light/30 w-10 h-10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-brand-charcoal">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Student Success Metrics */}
      <section className="bg-brand-olive-dark text-brand-cream border-y border-brand-sand py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-olive/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {metrics.map((met, idx) => (
            <div key={idx} className="space-y-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-brand-tan block">{met.val}</span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-brand-sage-light block">
                {met.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            Stories from successful scholars.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-sans">
            Hear from students who built lockers and verified placement profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
              <p className="text-xs sm:text-sm text-gray-500 italic leading-relaxed font-serif">
                "{test.quote}"
              </p>
              <div className="flex justify-between items-end mt-4 pt-3 border-t border-brand-sand/65 text-xs">
                <div>
                  <h4 className="font-bold text-brand-charcoal">{test.author}</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{test.role}</span>
                </div>
                <span className="bg-brand-sage-light/20 text-brand-olive-dark px-2.5 py-1 rounded-lg font-semibold text-[9px] uppercase border border-brand-sage-light/25">
                  {test.dest}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Call To Action Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <div className="bg-brand-olive-dark text-brand-cream border border-brand-olive/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-olive/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sage-light/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] uppercase tracking-widest text-brand-sage font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">
              Free Scholar plan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-cream leading-tight">
              Ready to secure your credentials?
            </h2>
            <p className="text-xs sm:text-sm text-brand-sage-light leading-relaxed font-sans max-w-md mx-auto">
              Create your free student locker today. Get 10 GB secure cloud space, verification badges, and custom share directories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 relative z-10 max-w-sm mx-auto">
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-brand-cream hover:bg-brand-cream-dark text-brand-olive-dark px-6 py-3 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-brand-olive" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-brand-olive hover:bg-brand-olive-light text-white px-6 py-3 rounded-xl text-xs font-semibold border border-brand-cream/15 transition-all"
            >
              Demo Preview
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="bg-white border-t border-brand-sand py-12 text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BrandIcon className="w-7 h-7" />
              <span className="font-serif text-base font-bold text-brand-charcoal">StudentVault</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-[200px]">
              The public cloud storage space designed specifically for verified student recruitment portfolios.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-brand-charcoal text-xs uppercase tracking-wider">Product Vault</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link to="/register" className="hover:text-brand-olive">Storage Lockers</Link></li>
              <li><Link to="/login" className="hover:text-brand-olive">Resume Revs</Link></li>
              <li><Link to="/my-files" className="hover:text-brand-olive">Project Sync</Link></li>
              <li><Link to="/settings" className="hover:text-brand-olive">Plan Quotas</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-brand-charcoal text-xs uppercase tracking-wider">Academic Support</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><a href="#" className="hover:text-brand-olive">Verification Guides</a></li>
              <li><a href="#" className="hover:text-brand-olive">Placement Cells API</a></li>
              <li><a href="#" className="hover:text-brand-olive">Student Directory</a></li>
              <li><a href="#" className="hover:text-brand-olive">Help Center</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-brand-charcoal text-xs uppercase tracking-wider">Locker Policies</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><a href="#" className="hover:text-brand-olive">Data Security</a></li>
              <li><a href="#" className="hover:text-brand-olive">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-olive">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-olive">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-brand-sand/60 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} StudentVault. Cloud locker verification engine.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">LinkedIn</a>
            <a href="#" className="hover:underline">GitHub</a>
            <a href="#" className="hover:underline">X.com</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
