// src/app/gallery/page.tsx
"use client";

import { useState, useEffect } from 'react';

interface ResumeFile {
  name: string;
  pdfAvailable: boolean;
}

export default function GalleryPage() {
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [compiling, setCompiling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        setError(null);
        const response = await fetch('/api/listResumes');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.resumes)) {
          setResumes(data.resumes);
        } else {
          console.error('Invalid data format:', data);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
        setError(error instanceof Error ? error.message : 'Unknown error fetching resumes');
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, []);

  async function handleViewPdf(filename: string) {
    if (compiling) return;

    try {
      setError(null);
      setCompiling(filename);
      const response = await fetch(`/api/compilePDF?filename=${filename}`);

      if (!response.ok) {
        throw new Error(`Failed to compile PDF: ${response.status} ${response.statusText}`);
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setSelectedPdf(pdfUrl);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      setError(error instanceof Error ? error.message : 'Unknown error generating PDF');
    } finally {
      setCompiling(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900">      
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Resume Gallery</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 p-6 rounded shadow col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Resumes</h2>
            
            {loading ? (
              <p className="text-gray-600">Loading resumes...</p>
            ) : resumes.length === 0 ? (
              <p className="text-gray-600">No resumes found.</p>
            ) : (
              <ul className="space-y-2">
                {resumes.map(resume => (
                  <li key={resume.name} className="p-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{resume.name}</span>
                      <button
                        onClick={() => handleViewPdf(resume.name)}
                        disabled={compiling === resume.name}
                        className={`px-3 py-1 text-sm ${compiling === resume.name ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded`}
                      >
                        {compiling === resume.name ? 'Generating...' : 'View PDF'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="bg-gray-100 p-6 rounded shadow col-span-2 min-h-[600px]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">PDF Viewer</h2>
            
            {selectedPdf ? (
              <div className="h-[700px] border border-gray-300 rounded">
                <iframe
                  src={selectedPdf}
                  width="100%"
                  height="100%"
                  className="rounded"
                  title="Resume PDF"
                />
              </div>
            ) : (
              <div className="h-[700px] flex items-center justify-center border border-gray-300 rounded bg-gray-50">
                <p className="text-gray-500">Select a resume to view its PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}