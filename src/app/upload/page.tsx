// src/app/upload/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [latexContent, setLatexContent] = useState("");
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (uploadMethod === 'file' && !file) {
      setMessage("Please select a file");
      return;
    }

    if (uploadMethod === 'paste' && !latexContent) {
      setMessage("Please paste LaTeX content");
      return;
    }

    if (!filename) {
      setMessage("Please provide a filename");
      return;
    }

    // Ensure the filename has .tex extension
    const finalFilename = filename.endsWith('.tex') ? filename : `${filename}.tex`;

    setUploading(true);
    setMessage("");

    try {
      let response;

      if (uploadMethod === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', finalFilename);

        response = await fetch('/api/uploadLatex', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Handle pasted content
        response = await fetch('/api/uploadLatex', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: latexContent, 
            filename: finalFilename 
          }),
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Successfully uploaded: ${finalFilename}`);
        setFile(null);
        setFilename("");
        setLatexContent("");
      } else {
        setMessage(`Error: ${data.error || 'Failed to upload file'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
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
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l-4 4m4-4H4" />
            </svg>
            Upload LaTeX Resume
          </h2>
          
          <p className="text-gray-300 mb-6">
            Upload your LaTeX resume to use with SKomp<span className="text-blue-500">X</span>cel Calibrate. You can either upload a .tex file or paste your LaTeX code directly.
          </p>
          
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button 
                className={`px-4 py-2 rounded transition-all ${uploadMethod === 'file' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setUploadMethod('file')}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Upload File
                </div>
              </button>
              <button 
                className={`px-4 py-2 rounded transition-all ${uploadMethod === 'paste' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setUploadMethod('paste')}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste LaTeX
                </div>
              </button>
            </div>
            
            {uploadMethod === 'file' ? (
              <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg">
                <label className="block text-gray-300 font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Select LaTeX File:
                </label>
                <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".tex"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 mb-1">
                      {file ? file.name : 'Drag & drop your .tex file here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {!file && 'or click to select a file'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg">
                <label className="block text-gray-300 font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Paste LaTeX Content:
                </label>
                <textarea
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                  rows={15}
                  className="w-full p-4 bg-gray-800 border border-gray-700 text-gray-200 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="\documentclass{article}..."
                />
              </div>
            )}
          </div>
          
          <div className="mb-6 bg-gray-900 border border-gray-700 p-5 rounded-lg">
            <label className="block text-gray-300 font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Filename:
            </label>
            <div className="flex">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., name_resume"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-l text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="bg-gray-700 text-gray-400 px-3 py-3 rounded-r border-t border-b border-r border-gray-700 flex items-center">
                .tex
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your file will be saved with this name in the resumes directory
            </p>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-6 py-3 rounded transition-all flex items-center justify-center ${
              uploading 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-[1.02]'
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l-4 4m4-4H4" />
                </svg>
                Upload Resume
              </>
            )}
          </button>
          
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.startsWith('Error') 
                ? 'bg-red-900/30 border border-red-700 text-red-400' 
                : 'bg-green-900/30 border border-green-700 text-green-400'
            }`}>
              <div className="flex items-center">
                {message.startsWith('Error') ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {message}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume Upload Tips
          </h3>
          <ul className="space-y-2 text-gray-300 list-disc list-inside ml-2">
            <li>Make sure your .tex file compiles correctly before uploading</li>
            <li>Include all necessary LaTeX commands and macros in your file</li>
            <li>Use descriptive filenames (e.g., company_position.tex)</li>
            <li>Format experience bullet points as separate lines for best results</li>
            <li>Ensure your skills section is properly structured for optimization</li>
          </ul>
        </div>
        
      </div>
    </main>
  );
}