// src/app/api/deleteResume/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function DELETE(request) {
  try {
    // Get filename from query params
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    
    // Define paths for both the LaTeX file and the potential PDF
    const texPath = path.join(process.cwd(), 'resumes', filename);
    const pdfPath = path.join(process.cwd(), 'pdfResumes', filename.replace('.tex', '.pdf'));
    
    // Check if the LaTeX file exists
    if (!fs.existsSync(texPath)) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Delete the LaTeX file
    fs.unlinkSync(texPath);
    
    // Delete the PDF if it exists
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    
    // Also delete any related _updated versions if they exist
    const updatedTexPath = texPath.replace('.tex', '_updated.tex');
    const updatedPdfPath = pdfPath.replace('.pdf', '_updated.pdf');
    
    if (fs.existsSync(updatedTexPath)) {
      fs.unlinkSync(updatedTexPath);
    }
    
    if (fs.existsSync(updatedPdfPath)) {
      fs.unlinkSync(updatedPdfPath);
    }
    
    return NextResponse.json({ 
      message: `Resume ${filename} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}