//# src/app/api/customizeResume/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import openai from "../../../../lib/openaiClient"; // Adjust path if needed

export async function POST(request) {
  try {
    const { acceptedChanges, acceptedSkills, filename, newFileName } = await request.json();
    const resumePath = path.join(process.cwd(), "resumes", filename);
    const originalTex = fs.readFileSync(resumePath, "utf8");

    // Update the prompt to be more specific about structure
    const prompt = `
You are an AI that updates bullet points in a LaTeX resume. I will provide you with the entire resume file and 
a list of bullet point changes. Your task is to:

1. Identify the EXPERIENCE section in the resume
2. Replace each original bullet with its corresponding new bullet in the "acceptedChanges" list
3. Return ONLY the complete updated EXPERIENCE section, from the "%-----------EXPERIENCE-----------" line 
   through the SINGLE final "\\resumeSubHeadingListEnd"

IMPORTANT:
- There must be EXACTLY ONE experience section with structure:
  %-----------EXPERIENCE-----------
  \\section{Experience}
  \\resumeSubHeadingListStart
    ... job entries ...
  \\resumeSubHeadingListEnd
  %-------------------------------------------

- Remove any duplicate job entries or extra \\resumeSubHeadingListEnd tags
- End the experience section with "\\resumeSubHeadingListEnd" followed by "%-------------------------------------------"
- Do not include any content after the experience section

Current LaTeX content:
"""
${originalTex}
"""

Here are the changes (each object has "originalBullet" and "newBullet"):
${JSON.stringify(acceptedChanges, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1200,
    });

    let updatedTex = completion.choices[0]?.message?.content || "";
    updatedTex = updatedTex.replace(/```latex|```/g, "").trim();

    // Ensure we have the correct section markers
    if (!updatedTex.startsWith("%-----------EXPERIENCE-----------")) {
      updatedTex = "%-----------EXPERIENCE-----------\n" + updatedTex;
    }
    
    if (!updatedTex.endsWith("%-------------------------------------------")) {
      updatedTex += "\n%-------------------------------------------";
    }

    // Ensure there's only one resumeSubHeadingListEnd
    const parts = updatedTex.split("\\resumeSubHeadingListEnd");
    if (parts.length > 2) {
      // Keep only the first instance and its content
      updatedTex = parts[0] + "\\resumeSubHeadingListEnd\n%-------------------------------------------";
    }

    // Change the regex to capture everything between EXPERIENCE and PROJECTS sections
    const experienceSectionRegex = /%-+EXPERIENCE-+[\s\S]*?(?=%-+PROJECTS-+)/;
    let updatedResume = originalTex.replace(experienceSectionRegex, updatedTex);

    // If there are skills changes, update the skills section using regex
    if (acceptedSkills && acceptedSkills.rawLatex) {
      // Create a regex pattern to match the skills section
      const skillsSectionRegex = /%-+PROGRAMMING SKILLS-+[\s\S]*?\\end{itemize}\s*(?=\s*%---+|\s*\\end{document})/;
      
      // Replace the skills section
      updatedResume = updatedResume.replace(skillsSectionRegex, acceptedSkills.rawLatex);
    }

    // Use the provided newFileName directly
    let updatedFileName = newFileName || path.basename(resumePath, ".tex") + "_updated.tex";
    const newPath = path.join(path.dirname(resumePath), updatedFileName);
    fs.writeFileSync(newPath, updatedResume, "utf8");

    return NextResponse.json({ 
      updatedTex: updatedResume, 
      updatedFileName
    });
  } catch (error) {
    console.error("Failed to inject changes:", error);
    return NextResponse.json({ error: "Failed to inject changes." }, { status: 500 });
  }
}