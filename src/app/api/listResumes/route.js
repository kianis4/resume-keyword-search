// src/app/api/listResumes/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const resumesDir = path.join(process.cwd(), 'resumes');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
      return NextResponse.json({ resumes: [] });
    }
    
    // Get all files in the resumes directory
    const files = fs.readdirSync(resumesDir);
    
    // Filter for .tex files
    const texFiles = files
      .filter(file => file.endsWith('.tex'))
      .map(file => {
        const pdfFile = file.replace('.tex', '.pdf');
        const pdfExists = fs.existsSync(path.join(process.cwd(), 'pdfResumes', pdfFile));
        
        return {
          name: file,
          pdfAvailable: pdfExists
        };
      });
    
    return NextResponse.json({ resumes: texFiles });
  } catch (error) {
    console.error('Error listing resumes:', error);
    return NextResponse.json({ error: 'Failed to list resumes' }, { status: 500 });
  }
}