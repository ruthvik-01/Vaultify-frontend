import React, { createContext, useState, useContext, useEffect } from 'react';

const FileContext = createContext(null);

export const categories = [
  'Resumes',
  'Certificates',
  'Projects',
  'Notes',
  'Assignments',
  'Placement Documents'
];

const INITIAL_FILES = [
  {
    id: 'f1',
    name: 'Vraj_Raju_Resume_2026.pdf',
    category: 'Resumes',
    type: 'pdf',
    size: 1258291, // 1.2 MB
    dateAdded: '2026-06-01T10:00:00Z',
    isStarred: true,
    inTrash: false,
    sharedWith: ['recruiter@google.com', 'careers@university.edu'],
    downloadCount: 14,
    tags: ['CV', 'Software Engineer', 'Main']
  },
  {
    id: 'f2',
    name: 'Google_UX_Design_Specialization_Certificate.pdf',
    category: 'Certificates',
    type: 'pdf',
    size: 2936012, // 2.8 MB
    dateAdded: '2026-05-15T14:30:00Z',
    isStarred: true,
    inTrash: false,
    sharedWith: [],
    downloadCount: 2,
    certificateIssuer: 'Coursera & Google',
    credentialId: 'UX-GGL-8893F',
    tags: ['UX/UI', 'Credential']
  },
  {
    id: 'f3',
    name: 'AWS_Certified_Cloud_Practitioner.pdf',
    category: 'Certificates',
    type: 'pdf',
    size: 1887436, // 1.8 MB
    dateAdded: '2026-05-20T09:15:00Z',
    isStarred: false,
    inTrash: false,
    sharedWith: [],
    downloadCount: 1,
    certificateIssuer: 'Amazon Web Services',
    credentialId: 'AWS-CCP-99201',
    tags: ['Cloud', 'AWS']
  },
  {
    id: 'f4',
    name: 'StudentVault_React_Source_Code.zip',
    category: 'Projects',
    type: 'zip',
    size: 38797312, // 37 MB
    dateAdded: '2026-06-12T16:45:00Z',
    isStarred: true,
    inTrash: false,
    sharedWith: ['professor_oak@university.edu'],
    downloadCount: 5,
    projectLink: 'https://github.com/vrajraju/studentvault',
    tags: ['React', 'Vite', 'Portfolio']
  },
  {
    id: 'f5',
    name: 'Smart_Campus_IoT_System_Brief.pdf',
    category: 'Projects',
    type: 'pdf',
    size: 4718592, // 4.5 MB
    dateAdded: '2026-04-10T11:00:00Z',
    isStarred: false,
    inTrash: false,
    sharedWith: [],
    downloadCount: 0,
    projectLink: 'https://github.com/vrajraju/smart-campus-iot',
    tags: ['IoT', 'Arduino', 'Python']
  },
  {
    id: 'f6',
    name: 'Advanced_Machine_Learning_Lecture_Notes.pdf',
    category: 'Notes',
    type: 'pdf',
    size: 6815744, // 6.5 MB
    dateAdded: '2026-06-05T08:30:00Z',
    isStarred: false,
    inTrash: false,
    sharedWith: ['classmate1@university.edu', 'classmate2@university.edu'],
    downloadCount: 12,
    tags: ['Study', 'AI/ML', 'Semester 6']
  },
  {
    id: 'f7',
    name: 'Database_Management_Systems_Lab_3.docx',
    category: 'Assignments',
    type: 'doc',
    size: 943718, // 900 KB
    dateAdded: '2026-06-10T23:59:00Z',
    isStarred: false,
    inTrash: false,
    sharedWith: [],
    downloadCount: 0,
    tags: ['DBMS', 'SQL', 'Homework']
  },
  {
    id: 'f8',
    name: 'Google_Technical_Interview_Prep_Handbook.pdf',
    category: 'Placement Documents',
    type: 'pdf',
    size: 5452595, // 5.2 MB
    dateAdded: '2026-06-13T12:00:00Z',
    isStarred: true,
    inTrash: false,
    sharedWith: [],
    downloadCount: 22,
    tags: ['Interview Prep', 'DSA', 'Google']
  },
  {
    id: 'f9',
    name: 'Stripe_Software_Engineer_Mock_Interview.mp4',
    category: 'Placement Documents',
    type: 'video',
    size: 145829120, // 139 MB
    dateAdded: '2026-06-08T15:20:00Z',
    isStarred: false,
    inTrash: false,
    sharedWith: ['coach@placementcell.org'],
    downloadCount: 3,
    tags: ['Mock Interview', 'Stripe', 'Video']
  },
  {
    id: 'f10',
    name: 'Old_Draft_Resume_2025.pdf',
    category: 'Resumes',
    type: 'pdf',
    size: 1048576, // 1 MB
    dateAdded: '2025-10-10T12:00:00Z',
    isStarred: false,
    inTrash: true, // In Trash
    sharedWith: [],
    downloadCount: 4,
    tags: ['Outdated', 'Trash']
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 'a1',
    action: 'uploaded',
    fileName: 'Google_Technical_Interview_Prep_Handbook.pdf',
    timestamp: '2026-06-13T12:00:00Z',
    category: 'Placement Documents'
  },
  {
    id: 'a2',
    action: 'starred',
    fileName: 'StudentVault_React_Source_Code.zip',
    timestamp: '2026-06-12T16:50:00Z',
    category: 'Projects'
  },
  {
    id: 'a3',
    action: 'shared',
    fileName: 'Vraj_Raju_Resume_2026.pdf',
    sharedWithEmail: 'recruiter@google.com',
    timestamp: '2026-06-01T10:05:00Z',
    category: 'Resumes'
  },
  {
    id: 'a4',
    action: 'deleted',
    fileName: 'Old_Draft_Resume_2025.pdf',
    timestamp: '2026-05-28T09:40:00Z',
    category: 'Resumes'
  }
];

export const FileProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('studentvault_auth') === 'true';
  });
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: 'Vraj Raju',
    email: 'vraj.raju@university.edu',
    studentId: 'SV-2023-88902',
    university: 'State Institute of Technology',
    major: 'Computer Science & Engineering',
    year: '3rd Year (Junior)',
    gpa: '3.92 / 4.0',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    bio: 'Aspiring Full Stack Engineer & UI Designer. Passionate about beautiful interfaces and scalable backends. Currently preparing for Summer 2027 internship placements.',
    linkedin: 'linkedin.com/in/vrajraju',
    github: 'github.com/vrajraju',
    twitter: 'twitter.com/vrajraju'
  });

  const [notifications, setNotifications] = useState({
    emailOnShare: true,
    emailOnDownload: false,
    placementAlerts: true,
    weeklyReport: true
  });

  // Calculate storage size dynamics
  const [storageStats, setStorageStats] = useState({
    totalCapacity: 10 * 1024 * 1024 * 1024, // 10 GB
    used: 0,
    breakdown: {
      Documents: 0,
      Projects: 0,
      Certificates: 0,
      Media: 0,
      Others: 0
    }
  });

  useEffect(() => {
    // Exclude trash from storage stats or include it? Let's include everything currently stored.
    let used = 0;
    const breakdown = {
      Documents: 0,
      Projects: 0,
      Certificates: 0,
      Media: 0,
      Others: 0
    };

    files.forEach(f => {
      // Don't count permanently deleted ones, but active and trash files take up storage
      used += f.size;
      if (f.category === 'Projects') {
        breakdown.Projects += f.size;
      } else if (f.category === 'Certificates') {
        breakdown.Certificates += f.size;
      } else if (f.type === 'video' || f.type === 'png' || f.type === 'jpg') {
        breakdown.Media += f.size;
      } else if (['Resumes', 'Notes', 'Assignments', 'Placement Documents'].includes(f.category)) {
        breakdown.Documents += f.size;
      } else {
        breakdown.Others += f.size;
      }
    });

    setStorageStats({
      totalCapacity: 10 * 1024 * 1024 * 1024, // 10 GB
      used,
      breakdown
    });
  }, [files]);

  // Operations
  const uploadFile = async (fileData) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('studentvault_token');

    // Build FormData with the actual file blob
    const formData = new FormData();
    if (fileData.file) {
      formData.append('file', fileData.file);
    }
    formData.append('category', fileData.category || 'Resumes');

    let serverFileId = null;

    try {
      const response = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          // NOTE: Do NOT set 'Content-Type' — the browser sets it with the correct multipart boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      serverFileId = result?.data?.file?.id;
      console.log('File uploaded to backend successfully:', result);
    } catch (error) {
      console.error('Backend upload error:', error);
      // Re-throw so the component can handle the error state
      throw error;
    }

    // Update local state for UI
    const newFile = {
      id: serverFileId || `f_${Date.now()}`,
      name: fileData.name,
      category: fileData.category || 'Resumes',
      type: fileData.type || 'pdf',
      size: fileData.size || 1500000,
      dateAdded: new Date().toISOString(),
      isStarred: false,
      inTrash: false,
      sharedWith: [],
      downloadCount: 0,
      tags: fileData.tags || [],
      certificateIssuer: fileData.certificateIssuer || undefined,
      credentialId: fileData.credentialId || undefined,
      projectLink: fileData.projectLink || undefined
    };

    setFiles(prev => [newFile, ...prev]);

    // Add activity
    const newActivity = {
      id: `a_${Date.now()}`,
      action: 'uploaded',
      fileName: newFile.name,
      timestamp: new Date().toISOString(),
      category: newFile.category
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const deleteFile = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        // Log activity
        const newActivity = {
          id: `a_${Date.now()}`,
          action: 'deleted',
          fileName: f.name,
          timestamp: new Date().toISOString(),
          category: f.category
        };
        setActivities(prevAct => [newActivity, ...prevAct]);
        return { ...f, inTrash: true };
      }
      return f;
    }));
  };

  const restoreFile = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        // Log activity
        const newActivity = {
          id: `a_${Date.now()}`,
          action: 'restored',
          fileName: f.name,
          timestamp: new Date().toISOString(),
          category: f.category
        };
        setActivities(prevAct => [newActivity, ...prevAct]);
        return { ...f, inTrash: false };
      }
      return f;
    }));
  };

  const permanentlyDeleteFile = (id) => {
    const file = files.find(f => f.id === id);
    setFiles(prev => prev.filter(f => f.id !== id));
    if (file) {
      // Log activity
      const newActivity = {
        id: `a_${Date.now()}`,
        action: 'purged',
        fileName: file.name,
        timestamp: new Date().toISOString(),
        category: file.category
      };
      setActivities(prevAct => [newActivity, ...prevAct]);
    }
  };

  const clearTrash = () => {
    const trashFiles = files.filter(f => f.inTrash);
    setFiles(prev => prev.filter(f => !f.inTrash));
    
    // Log activity
    const newActivity = {
      id: `a_${Date.now()}`,
      action: 'cleared_trash',
      fileName: 'Trash Bin Emptied',
      timestamp: new Date().toISOString(),
      category: 'System'
    };
    setActivities(prevAct => [newActivity, ...prevAct]);
  };

  const shareFile = (id, email) => {
    if (!email) return;
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const shared = f.sharedWith.includes(email) ? f.sharedWith : [...f.sharedWith, email];
        
        // Log activity
        const newActivity = {
          id: `a_${Date.now()}`,
          action: 'shared',
          fileName: f.name,
          sharedWithEmail: email,
          timestamp: new Date().toISOString(),
          category: f.category
        };
        setActivities(prevAct => [newActivity, ...prevAct]);
        
        return { ...f, sharedWith: shared };
      }
      return f;
    }));
  };

  const removeShare = (id, email) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, sharedWith: f.sharedWith.filter(e => e !== email) };
      }
      return f;
    }));
  };

  const toggleStar = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextStarred = !f.isStarred;
        // Log activity
        const newActivity = {
          id: `a_${Date.now()}`,
          action: nextStarred ? 'starred' : 'unstarred',
          fileName: f.name,
          timestamp: new Date().toISOString(),
          category: f.category
        };
        setActivities(prevAct => [newActivity, ...prevAct]);
        return { ...f, isStarred: nextStarred };
      }
      return f;
    }));
  };

  const login = (email, password) => {
    if (email === 'demo@studentvault.com' && password === 'password123') {
      setIsAuthenticated(true);
      localStorage.setItem('studentvault_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('studentvault_auth');
  };

  const updateProfile = (profileData) => {
    setUser(prev => ({ ...prev, ...profileData }));
  };

  const updateNotifications = (settingsData) => {
    setNotifications(prev => ({ ...prev, ...settingsData }));
  };

  return (
    <FileContext.Provider value={{
      files,
      activities,
      user,
      notifications,
      storageStats,
      searchQuery,
      setSearchQuery,
      uploadFile,
      deleteFile,
      restoreFile,
      permanentlyDeleteFile,
      clearTrash,
      shareFile,
      removeShare,
      toggleStar,
      updateProfile,
      updateNotifications,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
