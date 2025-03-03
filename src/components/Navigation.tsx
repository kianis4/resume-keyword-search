// src/components/Navigation.tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white font-bold text-xl">Resume Tailor</Link>
        </div>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-300 hover:text-white">
            Customize Resume
          </Link>
          <Link href="/upload" className="text-gray-300 hover:text-white">
            Upload Resume
          </Link>
          <Link href="/gallery" className="text-gray-300 hover:text-white">
            Resume Gallery
          </Link>
        </div>
      </div>
    </nav>
  );
}