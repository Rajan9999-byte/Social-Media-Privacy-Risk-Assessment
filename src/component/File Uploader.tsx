import { useState, useCallback } from 'react';
import { SocialProfile } from '../types/assessment';

interface FileUploaderProps {
  onProfileLoaded: (profile: SocialProfile) => void;
}

export default function FileUploader({ onProfileLoaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parseJSON = async (file: File): Promise<SocialProfile> => {
    const text = await file.text();
    const data = JSON.parse(text);
    return data as SocialProfile;
  };

  const parseCSV = async (file: File): Promise<SocialProfile> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const profile: Partial<SocialProfile> = {};
    
    if (lines.length > 1) {
      const values = lines[1].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'username':
            profile.username = value;
            break;
          case 'platform':
            profile.platform = value;
            break;
          case 'account_type':
            profile.account_type = value;
            break;
          case 'name':
            profile.name = value;
            break;
          case 'email':
            profile.email = value;
            break;
          case 'phone':
            profile.phone = value;
            break;
          case 'bio':
            profile.bio = value;
            break;
          case 'location':
            profile.location = value;
            break;
          case 'followers':
            profile.followers = parseInt(value) || 0;
            break;
          case 'following':
            profile.following = parseInt(value) || 0;
            break;
        }
      });
    }
    
    return profile as SocialProfile;
  };

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      let profile: SocialProfile;
      
      if (file.name.endsWith('.json')) {
        profile = await parseJSON(file);
      } else if (file.name.endsWith('.csv')) {
        profile = await parseCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }
      
      if (!profile.username) {
        throw new Error('Invalid profile data: username is required');
      }
      
      onProfileLoaded(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  }, [onProfileLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="text-gray-600 mb-2">
          Drag and drop your profile file here, or click to browse
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Supports JSON and CSV files
        </p>
        
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
          <span>Choose File</span>
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  );
}
