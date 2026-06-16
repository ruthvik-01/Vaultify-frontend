import React, { useState, useRef } from 'react';
import { useFiles, categories } from '../context/FileContext';
import { 
  UploadCloud, FileText, CheckCircle2, FileUp, Sparkles, 
  FolderDot, ArrowRight, Tag, HelpCircle, GitBranch, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadFiles() {
  const { uploadFile, files, showNotification } = useFiles();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | configuring | uploading | success
  
  // File details states
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState('');
  const [category, setCategory] = useState('Resumes');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  
  // Custom metadata based on category
  const [certificateIssuer, setCertificateIssuer] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const selectedFileRef = useRef(null);

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
      setupFileDetails(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setupFileDetails(file);
    }
  };

  // Allowed file extensions matching backend's fileValidation.js whitelist
  const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip', 'txt'];
  const allowedMimeTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png',
    'application/zip', 'application/x-zip-compressed',
    'text/plain'
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  const setupFileDetails = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    // Validate file type
    if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
      showNotification(
        `Unsupported file type (.${ext}). Allowed: PDF, DOC/DOCX, JPEG, PNG, ZIP, and TXT.`,
        'error'
      );
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      showNotification(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed: 10 MB.`,
        'error'
      );
      return;
    }

    selectedFileRef.current = file; // Store the actual File object
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(ext);
    
    // Auto category matching
    if (['zip', 'rar'].includes(ext)) {
      setCategory('Projects');
    } else if (file.name.toLowerCase().includes('resume')) {
      setCategory('Resumes');
    } else if (file.name.toLowerCase().includes('cert')) {
      setCategory('Certificates');
    }

    setTags(['Uploaded']);
    setUploadState('configuring');
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const executeUpload = async () => {
    setUploadState('uploading');
    setProgress(0);

    try {
      // Start a progress animation while the real upload happens
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Hold at 90% until real upload completes
          }
          return prev + 10;
        });
      }, 120);

      // Upload the actual file to the backend
      await uploadFile({
        file: selectedFileRef.current, // The actual File blob
        name: fileName,
        category,
        type: fileType,
        size: fileSize,
        tags,
        certificateIssuer: category === 'Certificates' ? certificateIssuer : undefined,
        credentialId: category === 'Certificates' ? credentialId : undefined,
        projectLink: category === 'Projects' ? projectLink : undefined
      });

      clearInterval(progressInterval);
      setProgress(100);
      setUploadState('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState('idle');
      setProgress(0);
      showNotification('Upload failed: ' + (error?.message || 'Unknown error'), 'error');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / (k * k)).toFixed(2) + ' MB';
  };

  const resetUploadPage = () => {
    selectedFileRef.current = null; // Clear stored file
    setFileName('');
    setFileSize(0);
    setFileType('');
    setCategory('Resumes');
    setTagInput('');
    setTags([]);
    setCertificateIssuer('');
    setCredentialId('');
    setProjectLink('');
    setProgress(0);
    setUploadState('idle');
  };

  // Recently uploaded logs from context
  const uploadLogs = files
    .filter(f => !f.inTrash)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Primary Upload Actions Panel (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        
        <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-brand-charcoal mb-4">Locker Upload Workspace</h2>

          <AnimatePresence mode="wait">
            
            {/* IDLE DROP ZONE STATE */}
            {uploadState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px]
                  ${dragActive 
                    ? 'border-brand-olive bg-brand-sage-light/20 scale-[0.99]' 
                    : 'border-brand-sand hover:border-brand-olive hover:bg-brand-cream/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="bg-brand-cream-dark p-4 rounded-full text-brand-olive mb-4">
                  <UploadCloud className="w-12 h-12 stroke-[1.4]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">Drag and drop file to upload</h3>
                <p className="text-xs text-gray-400 mt-1.5 max-w-sm">
                  Select your academic or placement assets: resumes, zip project codes, assignments, or PDF verified certificates.
                </p>
                <button
                  type="button"
                  className="mt-6 bg-brand-olive hover:bg-brand-olive-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Browse local files
                </button>
              </motion.div>
            )}

            {/* CONFIGURING METADATA DETAILS STATE */}
            {uploadState === 'configuring' && (
              <motion.div
                key="configuring"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="bg-brand-cream border border-brand-sand rounded-2xl p-4 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white p-2 rounded-lg border border-brand-sand/60">
                      <FileText className="w-5 h-5 text-brand-olive" />
                    </div>
                    <div>
                      <span className="font-bold text-brand-charcoal block truncate max-w-xs sm:max-w-md">{fileName}</span>
                      <span className="text-[10px] text-gray-500">{formatSize(fileSize)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={resetUploadPage}
                    className="text-xs text-red-500 hover:underline font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Category Target */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                      Target Folder Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-brand-cream border border-brand-sand rounded-xl px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-olive"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Tags */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                      Assigned Tags
                    </label>
                    <form onSubmit={addTag} className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Tag (e.g. CV, SQL)"
                        className="flex-1 px-3 py-2.5 border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal bg-brand-cream"
                      />
                      <button
                        type="submit"
                        className="bg-brand-cream-dark hover:bg-brand-sand border border-brand-sand text-brand-charcoal px-3 py-2.5 rounded-xl text-xs font-semibold"
                      >
                        Add
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="bg-brand-olive/15 text-brand-olive-dark text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <span>{tag}</span>
                          <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500 font-bold">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conditional Fields based on Category */}
                {category === 'Certificates' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-brand-sand/80 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5 flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Certificate Issuer / Body</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={certificateIssuer}
                        onChange={(e) => setCertificateIssuer(e.target.value)}
                        placeholder="e.g. Coursera, AWS, Udacity"
                        className="w-full px-3 py-2.5 border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal bg-brand-cream"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                        Verification Credential ID
                      </label>
                      <input
                        type="text"
                        required
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value)}
                        placeholder="e.g. AWS-CCP-1002"
                        className="w-full px-3 py-2.5 border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal bg-brand-cream"
                      />
                    </div>
                  </motion.div>
                )}

                {category === 'Projects' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-brand-sand/80 pt-4"
                  >
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5 flex items-center space-x-1">
                        <GitBranch className="w-3.5 h-3.5 text-brand-olive" />
                        <span>GitHub Repository URL</span>
                      </label>
                      <input
                        type="url"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="e.g. https://github.com/vrajraju/smart-campus"
                        className="w-full px-3 py-2.5 border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-charcoal bg-brand-cream"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Confirm upload buttons */}
                <div className="flex space-x-3 mt-6 pt-4 border-t border-brand-sand">
                  <button
                    onClick={resetUploadPage}
                    className="flex-1 bg-brand-cream border border-brand-sand hover:bg-brand-sand/40 text-brand-charcoal text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeUpload}
                    className="flex-1 bg-brand-olive hover:bg-brand-olive-dark text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Store to Locker Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* UPLOADING SIMULATION STATE */}
            {uploadState === 'uploading' && (
              <motion.div
                key="uploading"
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-brand-sand border-t-brand-olive animate-spin mb-4" />
                <h3 className="font-serif text-lg font-bold text-brand-charcoal truncate max-w-sm">
                  Transferring "{fileName}" to Secure Sandbox...
                </h3>
                
                <div className="w-full max-w-xs bg-brand-cream-dark h-2 rounded-full overflow-hidden mt-6 mb-2">
                  <div 
                    className="bg-brand-olive h-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="font-mono text-xs text-gray-500 font-semibold">{progress}% COMPLETE</span>
              </motion.div>
            )}

            {/* UPLOAD SUCCESS STATE */}
            {uploadState === 'success' && (
              <motion.div
                key="success"
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full border border-emerald-100 mb-4 inline-block">
                  <CheckCircle2 className="w-12 h-12 animate-pulse" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal">Secure Upload Completed</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm leading-normal">
                  Your asset <span className="font-semibold text-brand-charcoal">"{fileName}"</span> has been encrypted and assigned to the <span className="font-bold text-brand-olive">{category}</span> drawer.
                </p>

                <button
                  onClick={resetUploadPage}
                  className="mt-8 bg-brand-olive hover:bg-brand-olive-dark text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Upload another asset
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Upload logs/Tips Sidebar (1/3 width) */}
      <div className="space-y-6">
        
        {/* Upload tips card */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm">
          <h3 className="font-serif text-base font-bold text-brand-charcoal flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-brand-olive mr-1.5" />
            <span>Vault Upload Standards</span>
          </h3>
          <ul className="text-xs text-gray-500 space-y-2.5 leading-relaxed font-sans">
            <li>
              <strong>Verified Badges:</strong> Uploading certificates under Certificates auto-prompts verification fields to prove credibility to recruiting managers.
            </li>
            <li>
              <strong>GitHub Repositories:</strong> Link live source code repos to projects so recruiters can examine git timelines.
            </li>
            <li>
              <strong>Document Privacy:</strong> By default, all uploaded locker assets are 100% private. Use Share/Link to toggle collaborative view.
            </li>
          </ul>
        </div>

        {/* History of recent uploads on this page */}
        <div className="bg-white border border-brand-sand rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-brand-charcoal">Recent Upload History</h3>
          <div className="space-y-3">
            {uploadLogs.map(log => (
              <div key={log.id} className="flex items-center space-x-3 p-3 bg-brand-cream border border-brand-sand/60 rounded-xl">
                <div className="p-2 bg-white rounded-lg border border-brand-sand text-brand-olive shrink-0">
                  <FileUp className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-brand-charcoal block truncate">{log.name}</span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase block mt-0.5">{log.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
