import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    
    const resumePath = path.join(process.cwd(), 'resumes', filename);
    
    if (!fs.existsSync(resumePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const content = fs.readFileSync(resumePath, 'utf-8');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error getting LaTeX content:', error);
    return NextResponse.json({ error: 'Failed to get LaTeX content' }, { status: 500 });
  }
}