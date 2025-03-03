// File: src/app/api/compilePDF/route.js
import { NextResponse } from 'next/server';
import { compileLatexToPdf } from '../../../../lib/latexCompiler';
import path from 'path';
import fs from 'fs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'devops_updated.tex';
    
    // Define the path to the input .tex file
    const inputPath = path.join(process.cwd(), 'resumes', filename);
    const outputPath = path.join(process.cwd(), 'pdfResumes', filename.replace('.tex', '.pdf'));
    
    console.log('inputPath:', inputPath);
    console.log('outputPath:', outputPath);

    // Check if the input file exists
    if (!fs.existsSync(inputPath)) {
      return NextResponse.json({ error: 'Input file not found' }, { status: 404 });
    }

    // Create pdfResumes directory if it doesn't exist
    const pdfResumesDir = path.join(process.cwd(), 'pdfResumes');
    if (!fs.existsSync(pdfResumesDir)) {
      fs.mkdirSync(pdfResumesDir, { recursive: true });
    }

    // Compile the LaTeX document to PDF
    await compileLatexToPdf(inputPath, outputPath);
    
    // Return the PDF file
    const pdfBuffer = fs.readFileSync(outputPath);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=${filename.replace('.tex', '.pdf')}`,
      },
    });
  } catch (error) {
    console.error('Error compiling LaTeX to PDF:', error);
    return NextResponse.json({ error: 'Error compiling LaTeX to PDF', details: error.message }, { status: 500 });
  }
}


