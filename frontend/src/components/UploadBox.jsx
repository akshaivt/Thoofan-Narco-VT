import React, { useRef, useState } from 'react';
import { Upload, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';

const UploadBox = ({ label, accept, multiple, files, onChange, maxFiles = 5, fileType = 'images' }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const selectedFiles = Array.from(e.target.files);
    
    // Check if adding these files exceeds the maximum allowed files
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum of ${maxFiles} ${fileType} allowed.`);
      return;
    }

    // Size limit validation: 50MB
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const invalidSize = selectedFiles.some(file => file.size > MAX_SIZE);
    if (invalidSize) {
      setError('One or more files exceed the 50MB size limit.');
      return;
    }

    // Strictly validate file extensions on the client side
    const isImage = fileType === 'images';
    const allowedExts = isImage 
      ? ['.jpg', '.jpeg', '.png', '.webp'] 
      : ['.mp4', '.mov', '.avi'];

    const invalidType = selectedFiles.some(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedExts.includes(ext);
    });

    if (invalidType) {
      setError(`Invalid file format. Allowed formats: ${allowedExts.join(', ')}`);
      return;
    }

    // Pass up to parent
    onChange([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const triggerSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label} (Max {maxFiles})
      </span>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Select Box */}
      <div 
        onClick={triggerSelect}
        className="border-2 border-dashed border-slate-350 hover:border-gov-blue hover:bg-slate-50 transition-smooth p-6 rounded-lg text-center cursor-pointer bg-slate-50/50"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Select files or Drag here
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Max size 50MB per file. Only {fileType === 'images' ? 'images' : 'videos'} allowed.
        </p>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {files.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div 
                key={index} 
                className="relative group border border-slate-200 rounded-lg overflow-hidden h-20 bg-slate-100 flex items-center justify-center"
              >
                {fileType === 'images' ? (
                  <img 
                    src={previewUrl} 
                    alt={`preview-${index}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-500 flex flex-col items-center">
                    <FileVideo className="h-6 w-6 text-gov-blue mb-1" />
                    <span className="text-[8px] max-w-16 truncate block px-1">{file.name}</span>
                  </div>
                )}
                
                {/* Overlay Delete Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white rounded-full p-1 cursor-pointer transition-smooth"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
