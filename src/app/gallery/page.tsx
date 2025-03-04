// src/app/gallery/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [selectedLatex, setSelectedLatex] = useState<string | null>(null);
  const [loadingLatex, setLoadingLatex] = useState<string | null>(null);

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
      setSelectedLatex(null); // Add this line to clear LaTeX when viewing PDF
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

  async function handleViewLatex(filename: string) {
    if (loadingLatex) return;

    try {
      setError(null);
      setLoadingLatex(filename);
      const response = await fetch(`/api/getLatexContent?filename=${filename}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch LaTeX: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedLatex(data.content);
      setSelectedPdf(null); // Hide PDF viewer when showing LaTeX
    } catch (error) {
      console.error('Error viewing LaTeX:', error);
      setError(error instanceof Error ? error.message : 'Unknown error fetching LaTeX');
    } finally {
      setLoadingLatex(null);
    }
  }

  async function handleDeleteResume(filename: string, event: React.MouseEvent) {
    event.stopPropagation(); // Prevent the event from bubbling up
    
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        setError(null);
        const response = await fetch(`/api/deleteResume?filename=${filename}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete resume: ${response.status} ${response.statusText}`);
        }

        // Refresh the resume list
        const updatedResumes = resumes.filter(resume => resume.name !== filename);
        setResumes(updatedResumes);
        
        // If the deleted resume was selected, clear the viewer
        if (selectedPdf && filename === compiling) {
          setSelectedPdf(null);
        }
        
        if (selectedLatex && filename === loadingLatex) {
          setSelectedLatex(null);
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
        setError(error instanceof Error ? error.message : 'Unknown error deleting resume');
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-bold text-white">
              SKomp<span className="text-blue-500">X</span>cel <span className="font-light">Calibrate</span>
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </header>
        
        <h1 className="text-3xl font-bold mb-6 text-white">Resume Gallery</h1>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Available Resumes
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">Loading resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-400">No resumes found.</p>
                <Link href="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Upload Resume
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {resumes.map(resume => (
                  <li key={resume.name} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 border-b border-gray-700 break-words">
                      <span className="text-gray-300 font-medium" title={resume.name}>
                        {resume.name}
                      </span>
                    </div>
                    
                    <div className="flex p-2 gap-1.5 justify-end bg-gray-900/70">
                      <button
                        onClick={(e) => handleDeleteResume(resume.name, e)}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center"
                        title="Delete resume"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewLatex(resume.name)}
                        disabled={loadingLatex === resume.name}
                        className={`px-2 py-1 text-xs ${
                          loadingLatex === resume.name 
                            ? 'bg-gray-600 cursor-wait' 
                            : 'bg-amber-600 hover:bg-amber-700'
                        } text-white rounded transition-colors flex items-center`}
                      >
                        {loadingLatex === resume.name ? (
                          <>
                            <svg className="animate-spin w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            LaTeX
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewPdf(resume.name)}
                        disabled={compiling === resume.name}
                        className={`px-2 py-1 text-xs ${
                          compiling === resume.name 
                            ? 'bg-gray-600 cursor-wait' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white rounded transition-colors flex items-center`}
                      >
                        {compiling === resume.name ? (
                          <>
                            <svg className="animate-spin w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Compiling
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Add Upload button */}
            <div className="mt-4">
              <Link 
                href="/upload" 
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload New Resume
              </Link>
            </div>
          </div>
          
          {/* Viewer section */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg col-span-2 min-h-[600px]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              {selectedLatex ? (
                <>
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  LaTeX Source
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF Viewer
                </>
              )}
            </h2>
            
            {selectedPdf && !selectedLatex ? (
              <div className="h-[700px] border border-gray-700 rounded bg-white p-1">
                <iframe
                  src={selectedPdf}
                  width="100%"
                  height="100%"
                  className="rounded"
                  title="Resume PDF"
                />
              </div>
            ) : selectedLatex ? (
              <div className="h-[700px] border border-gray-700 rounded bg-gray-900 overflow-auto">
                <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">
                  {selectedLatex}
                </pre>
              </div>
            ) : (
              <div className="h-[700px] flex flex-col items-center justify-center border border-gray-700 rounded bg-gray-900">
                <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 mb-3">Select a resume to view</p>
                <p className="text-gray-500 text-sm max-w-md text-center">
                  Click on the LaTeX or PDF buttons next to a resume name to preview its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}