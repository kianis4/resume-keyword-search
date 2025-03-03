// src/app/upload/page.tsx
"use client";

import { useState } from 'react';

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
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Upload LaTeX Resume</h1>
        
        <div className="bg-gray-100 p-6 rounded shadow">
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button 
                className={`px-4 py-2 rounded ${uploadMethod === 'file' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUploadMethod('file')}
              >
                Upload File
              </button>
              <button 
                className={`px-4 py-2 rounded ${uploadMethod === 'paste' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUploadMethod('paste')}
              >
                Paste LaTeX
              </button>
            </div>
            
            {uploadMethod === 'file' ? (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  LaTeX File:
                </label>
                <input
                  type="file"
                  accept=".tex"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900"
                />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Paste LaTeX Content:
                </label>
                <textarea
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                  rows={15}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-sm text-gray-900"
                  placeholder="\documentclass{article}..."
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Filename (.tex will be added if missing):
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., my_resume"
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 ${uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded transition-colors`}
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
          
          {message && (
            <p className={`mt-4 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}