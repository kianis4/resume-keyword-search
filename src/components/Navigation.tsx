// src/components/Navigation.tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-white font-bold text-xl">
            SKomp<span className="text-blue-500">X</span>cel <span className="font-light">Calibrate</span>
          </Link>
        </div>
        <div className="flex space-x-6">
          <Link href="/customize" className="text-gray-300 hover:text-white transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Customize
          </Link>
          <Link href="/upload" className="text-gray-300 hover:text-white transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l-4 4m4-4H4" />
            </svg>
            Upload
          </Link>
          <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gallery
          </Link>
        </div>
      </div>
    </nav>
  );
}