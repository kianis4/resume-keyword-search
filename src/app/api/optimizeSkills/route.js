// src/app/api/optimizeSkills/route.js
import { NextResponse } from 'next/server';
import openai from '../../../../lib/openaiClient';

export async function POST(request) {
  try {
    const { currentSkills, jobDescription, unmatchedKeywords } = await request.json();
    
    if (!currentSkills || !jobDescription) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const prompt = `
      You are an AI that optimizes resume skills sections based on job descriptions.
      
      Current skills in resume:
      ${JSON.stringify(currentSkills, null, 2)}
      
      Job Description:
      ${jobDescription}
      
      Unmatched Keywords from job description:
      ${unmatchedKeywords && unmatchedKeywords.length > 0 ? unmatchedKeywords.join(", ") : "None"}
      
      Please optimize the skills section by:
      1. Prioritizing skills that match the job description requirements
      2. Adding relevant skills from the unmatched keywords list (but only if they're skills the candidate likely has)
      3. Reorganizing categories if needed
      
      IMPORTANT: 
      1. Do NOT include markdown code blocks or backticks in your response - just return valid JSON.
      2. For the rawLatex field, include the FULL skills section exactly as it should appear in the LaTeX document,
         including the section header "%-----------PROGRAMMING SKILLS-----------" and all LaTeX formatting.
      
      Follow this exact format for the rawLatex output:
      %-----------PROGRAMMING SKILLS-----------
      \\section{Technical Skills}
       \\begin{itemize}[leftmargin=0.15in, label={}]
          \\small{\\item{
           \\textbf{Languages}{: JavaScript, TypeScript, etc.} \\\\
           \\textbf{Frameworks}{: Next.js, React, etc.} \\\\
           \\textbf{Developer Tools}{: Git, Docker, etc.} \\\\
           \\textbf{Cloud \\& Databases}{: AWS, etc.} \\\\
          }}
       \\end{itemize}

      Return the optimized skills section in this JSON format:
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
        "rawLatex": "The complete LaTeX code for the skills section as specified above"
      }
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    // Get raw content and log it for debugging
    let rawContent = completion.choices[0].message.content;
    console.log('Raw response from OpenAI:', rawContent.substring(0, 200) + '...');
    
    // Clean up the response by removing any code block markers
    let cleanedContent = rawContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    
    // console.log('Cleaned content:', cleanedContent.substring(0, 200) + '...');
    
    let optimizedSkills = {};
    try {
      optimizedSkills = JSON.parse(cleanedContent);
    } catch (err) {
      console.error('Failed to parse optimized skills JSON:', err);
      console.error('Content that failed to parse:', cleanedContent);
      return NextResponse.json({ error: 'Failed to parse optimized skills' }, { status: 500 });
    }
    
    return NextResponse.json({ optimizedSkills });
    
  } catch (error) {
    console.error('Error optimizing skills:', error);
    return NextResponse.json({ error: 'Failed to optimize skills' }, { status: 500 });
  }
}