import React, { useState } from 'react';
import { useFiles } from '../context/FileContext';
import FileCard from '../components/FileCard';
import { 
  User, Mail, MapPin, 
  BookOpen, Calendar, GraduationCap, Edit3, Save, 
  Award, Sparkles, FolderClosed, ExternalLink, Star 
} from 'lucide-react';
import { motion } from 'framer-motion';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Profile() {
  const { user, files, updateProfile } = useFiles();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [linkedin, setLinkedin] = useState(user.linkedin);
  const [github, setGithub] = useState(user.github);

  const activeFiles = files.filter(f => !f.inTrash);
  const starredFiles = activeFiles.filter(f => f.isStarred);
  const certCount = activeFiles.filter(f => f.category === 'Certificates').length;
  const projectCount = activeFiles.filter(f => f.category === 'Projects').length;

  const handleSave = () => {
    updateProfile({
      name,
      bio,
      linkedin,
      github
    });
    setIsEditing(false);
    alert('Student portfolio showcase updated successfully!');
  };

  // Mock list of skills
  const [skills, setSkills] = useState([
    'React.js', 'Vite', 'Tailwind CSS', 'Framer Motion', 
    'JavaScript (ES6)', 'TypeScript', 'Node.js', 'Express',
    'SQL / MongoDB', 'AWS Cloud Practitioner', 'UI/UX Design', 
    'Responsive Web Design', 'Git & GitHub'
  ]);

  return (
    <div className="space-y-6">
      
      {/* Profile Banner & Header Info */}
      <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-sm">
        {/* Editorial organic banner background */}
        <div className="h-40 bg-brand-sage-light/45 relative flex items-end justify-end p-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-olive-dark bg-white border border-brand-sand px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-olive" />
            <span>Showcase Public: Enabled</span>
          </span>
        </div>

        {/* Profile Card details */}
        <div className="p-6 relative pt-0 flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-3 md:space-y-0 md:space-x-5 -mt-16 md:-mt-12">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover relative z-10"
            />
            <div className="text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2 py-1 border border-brand-sand rounded-lg text-lg font-bold text-brand-charcoal bg-brand-cream focus:outline-none"
                />
              ) : (
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center justify-center md:justify-start">
                  <span>{user.name}</span>
                </h2>
              )}
              <p className="text-xs text-gray-500 font-sans mt-1">
                {user.major} • {user.year}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 justify-center">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-brand-olive hover:bg-brand-olive-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Portfolio</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Biography</span>
              </button>
            )}
          </div>
        </div>

        {/* Biography */}
        <div className="px-6 pb-6 pt-2 border-t border-brand-sand/60">
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              className="w-full p-3 border border-brand-sand rounded-xl text-xs text-brand-charcoal bg-brand-cream focus:outline-none"
            />
          ) : (
            <p className="text-xs text-gray-500 leading-relaxed font-sans max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Social Badges */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-brand-sand/60 text-xs text-gray-500">
            <div className="flex items-center space-x-1.5">
              <LinkedinIcon className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="px-2 py-0.5 border border-brand-sand rounded text-xs bg-brand-cream"
                />
              ) : (
                <a href={`https://${user.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-brand-olive underline">
                  {user.linkedin}
                </a>
              )}
            </div>
            
            <div className="flex items-center space-x-1.5">
              <GithubIcon className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="px-2 py-0.5 border border-brand-sand rounded text-xs bg-brand-cream"
                />
              ) : (
                <a href={`https://${user.github}`} target="_blank" rel="noreferrer" className="hover:text-brand-olive underline">
                  {user.github}
                </a>
              )}
            </div>

            <div className="flex items-center space-x-1.5 ml-auto text-[10px] text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Campus Verified Site</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Splits: Education & Starred Showcase Locker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: School data & skills */}
        <div className="space-y-6">
          
          {/* Academic Profile */}
          <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-brand-charcoal flex items-center">
              <GraduationCap className="w-4.5 h-4.5 text-brand-olive mr-1.5" />
              <span>Scholastic Status</span>
            </h3>

            <div className="space-y-3.5 text-xs text-brand-charcoal">
              <div className="flex justify-between py-2 border-b border-brand-sand/50">
                <span className="text-gray-400">University</span>
                <span className="font-bold text-right truncate max-w-[160px]" title={user.university}>{user.university}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-sand/50">
                <span className="text-gray-400">Academic Major</span>
                <span className="font-semibold text-right truncate max-w-[160px]">{user.major}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-sand/50">
                <span className="text-gray-400">Enrollment Year</span>
                <span className="font-medium text-right">{user.year}</span>
              </div>
              
              {/* GPA Display Meter */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 mb-1">
                  <span>CGPA Rating</span>
                  <span className="font-bold text-brand-olive text-xs">{user.gpa}</span>
                </div>
                <div className="w-full bg-brand-cream-dark h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Tag Cloud */}
          <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-serif text-base font-bold text-brand-charcoal">Placement Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="bg-brand-cream border border-brand-sand/80 hover:border-brand-olive hover:text-brand-olive-dark text-[10px] font-semibold px-2.5 py-1 rounded-xl text-gray-600 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Featured credentials showcase */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center">
              <Star className="w-4.5 h-4.5 text-amber-500 fill-current mr-1.5" />
              <span>Locker Starred Showcase</span>
            </h3>
            <span className="text-[10px] text-gray-400">
              {starredFiles.length} item{starredFiles.length !== 1 ? 's' : ''} listed in public view
            </span>
          </div>

          {starredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {starredFiles.map((file) => (
                <FileCard key={file.id} file={file} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-brand-sand border-dashed rounded-3xl p-8 text-center text-xs text-gray-500">
              Star your files in the Locker view to highlight them here as verified credentials for recruiting boards.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
