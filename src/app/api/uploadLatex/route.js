// src/app/api/uploadLatex/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { compileLatexToPdf } from '../../../../lib/latexCompiler';

export async function POST(request) {
  try {
    let filename;
    let content;

    // Check if it's form data (file upload) or JSON (pasted content)
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file');
      filename = formData.get('filename');
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      content = Buffer.from(bytes);
    } else {
      // Handle pasted content
      const data = await request.json();
      content = data.content;
      filename = data.filename;
      
      if (!content) {
        return NextResponse.json({ error: 'No content provided' }, { status: 400 });
      }
    }

    // Ensure the filename has .tex extension
    if (!filename.endsWith('.tex')) {
      filename = `${filename}.tex`;
    }

    // Check for duplicates
    const resumesDir = path.join(process.cwd(), 'resumes');
    const baseName = path.basename(filename, '.tex');
    let finalName = filename;
    let counter = 1;

    while (fs.existsSync(path.join(resumesDir, finalName))) {
      finalName = `${baseName}-${counter}.tex`;
      counter++;
    }

    filename = finalName;
    const filePath = path.join(resumesDir, filename);

    // Write the file
    await writeFile(filePath, content);
    
    // Create pdfResumes directory if it doesn't exist
    const pdfResumesDir = path.join(process.cwd(), 'pdfResumes');
    if (!fs.existsSync(pdfResumesDir)) {
      fs.mkdirSync(pdfResumesDir, { recursive: true });
    }
    
    // Generate PDF
    try {
      const pdfPath = path.join(process.cwd(), 'pdfResumes', filename.replace('.tex', '.pdf'));
      await compileLatexToPdf(filePath, pdfPath);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // We still return success for the upload, but note the PDF generation failed
      return NextResponse.json({ 
        message: `File ${filename} uploaded successfully, but PDF generation failed: ${pdfError.message}`,
        filename: filename,
        pdfGenerated: false
      });
    }
    
    return NextResponse.json({ 
      message: `File ${filename} uploaded successfully and PDF generated`,
      filename: filename,
      pdfGenerated: true
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}