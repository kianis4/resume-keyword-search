// src/app/api/extractSkills/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import openai from '../../../../lib/openaiClient'; // Fixed import statement

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file specified' }, { status: 400 });
    }
    
    const filePath = path.join(process.cwd(), 'resumes', file);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const latexContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract skills section using regex first for efficiency
    const skillsSectionRegex = /%-+PROGRAMMING SKILLS-+[\s\S]*?\\end{itemize}\s*(?=\s*%---+|\s*\\end{document})/;
    const skillsMatch = latexContent.match(skillsSectionRegex);
    
    const rawLatexSkillsSection = skillsMatch ? skillsMatch[0] : '';
    
    console.log('Raw LaTeX skills section found:', rawLatexSkillsSection.substring(0, 100) + '...');
    
    const prompt = `
      Extract the skills from this LaTeX resume skills section and return it as a JSON object.
      Do NOT include markdown code blocks, backticks, or any formatting - just return a valid JSON object.
      
      The skills section is provided below:
      ${rawLatexSkillsSection}
      
      Return the data in this JSON format:
      {
        "categories": [
          {
            "name": "Languages",
            "skills": ["JavaScript", "TypeScript", "Python", ...]
          },
          {
            "name": "Frameworks",
            "skills": ["React", "Next.js", ...]
          },
          ...
        ],
        "rawLatex": "${rawLatexSkillsSection.replace(/"/g, '\\"')}"
      }
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
    });
    
    // Get raw content and log it for debugging
    let rawContent = completion.choices[0].message.content;
    console.log('Raw response from OpenAI:', rawContent.substring(0, 200) + '...');
    
    // Clean up the response by removing any code block markers
    let cleanedContent = rawContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    
    console.log('Cleaned content:', cleanedContent.substring(0, 200) + '...');
    
    let skills = {};
    try {
      skills = JSON.parse(cleanedContent);
      // Ensure rawLatex is set correctly
      skills.rawLatex = rawLatexSkillsSection;
    } catch (err) {
      console.error('Failed to parse skills JSON', err);
      console.error('Content that failed to parse:', cleanedContent);
      return NextResponse.json({ error: 'Failed to parse skills' }, { status: 500 });
    }
    
    return NextResponse.json({ skills });
    
  } catch (error) {
    console.error('Error extracting skills:', error);
    return NextResponse.json({ error: 'Failed to extract skills' }, { status: 500 });
  }
}